---
title: TAMUctf 2022 – Labyrinth
description: Using CFGs to solve a control-flow maze.
updated: "2022-08-07"
tags: ctf reverse writeup python programming
thumbnail: /assets/img/posts/misc/ctf/labyrinth/labyrinth-thumbnail.jpg
related_tags: ctf writeup
---

{% include "toc.md" %}

### Challenge Description
> To get the flag you'll need to get to the end of a maz- five randomly generated mazes within five minutes.
> 
> This is an automatic reversing challenge. You will be provided an ELF as a hex string. You should analyze it, construct an input to make it terminate with `exit(0)`, and then respond with your input in the same format. You will need to solve five binaries within a five minute timeout.

### Write-Up
#### Preliminary Observations and Analysis
Unlike other reverse challenges, this one requires us to connect to a server and auto-hack not one, but *five* binaries. We're provided with this template:

```py
# solver-template.py
from pwn import *

p = remote("tamuctf.com", 443, ssl=True, sni="labyrinth")
for binary in range(5):
  with open("elf", "wb") as file:
    file.write(bytes.fromhex(p.recvline().rstrip().decode()))

  # send whatever data you want
  p.sendline(b"howdy".hex())
p.interactive()
```

Modifying the template slightly, we run and download a couple binaries for analysis.

As a first step, we'll run `checksec` to see what securities are in place.

```sh
% checksec elf
[*] '/Users/<redacted>/labyrinth/elf'
    Arch:     amd64-64-little
    RELRO:    Partial RELRO
    Stack:    No canary found
    NX:       NX enabled
    PIE:      PIE enabled
```

It appears that PIE is enabled. We'll make a mental note of this, since this may mess with function addresses.

**What is PIE?** Position-independent executable is a security mechanism whereby on starting an application, the OS will offset the assembly sections (`.data`, `.text`, etc.).
{:.alert--success}

Next, we decompile our elves using ghidra and make some observations.

![Labyrinth decompiled 1.](/assets/img/posts/misc/ctf/labyrinth/labyrinth-1.jpg){:.w-100}
{:.center}

![Labyrinth decompiled 2.](/assets/img/posts/misc/ctf/labyrinth/labyrinth-2.jpg){:.w-100}
{:.center}

* Each binary contains a thousand (1000) functions (excluding `main`). The symbols are `function_0`, `function_1`, `function_2`, and so on.
* Each of these functions will:
  * Call `scanf("%u\n", ...)` (read 4 bytes into a stack variable), and
  * Branch (if, else-if, else) into two or more paths.
  * The branch conditions come in some form of arithmetic check. For example, `input == 0x1c1`, `input ^ 0xc213504e == 0x142`, `input < 0x143`, `input - 0x5173cdc3 == 0x28b`.
  * Each branch will either
    * `exit(1)`
    * or call another function from the 1000 functions.
  * The number of branches, numbers used in the conditions, and order of conditions are random.
* All 1000 functions are laid next to each other in memory.
* `main` is always at `0x101155` and starts by calling one of the 1000 functions. The function call is not fixed (i.e. we can't be certain about the address).
* Only one function calls `exit(0)` and this function is always at address `0x1011c4`.

To "solve" an elf, we need to give an appropriate input at each step of the function such that the correct branch and path are taken. In other words, we need to trace the right path out of the maze. We need to solve 5 elves to get the flag. We only have five minutes for five elves. Solving this without any automation seems next to impossible. Thankfully, we have angr.

**What is angr?**  
angr is a python library which simulates machine code while keeping track of program state. It's exploration features are useful to find the input corresponding to a given output.
{:.alert--success}

#### Coding
As a preliminary step, we'll import angr, load the project, and set some constants.
```py
from angr import *
from pwn import *

def solve(file='elf'):
    p = Project(file)
    elf = ELF(file)

    # Find target address.
    start_addr = 0x4011b3
    tar_addr = 0x4011c8
```

Note: ghidra will load PIE assembly at offset `0x100000`, but angr loads it at `0x400000` by default. So all addresses in the previous section were offset by an additional `0x300000` to account for this difference. There's a way to make angr load at a custom offset, but I forgot what the option was called. (But the option exists!)
{:.alert--warning}

Now we'll try some good ol' angr `explore()` and see what turns up.

```py
    state = p.factory.entry_state(addr=start_addr) # Construct the state when we "start" the executable at `start_addr`.
    simgr = p.factory.simgr(state) # Get a simulation manager. This will... manage our simulations.
    simgr.explore(find=tar_addr)  # GOGOGO!!!
```

`explore()` is the most straightforward command in angr. With the `find=tar_addr` parameter, we tell `explore()` to *simulate* and *look for* states which will execute the instruction at `tar_addr`.

#### Path Explosion
Unfortunately, this takes forever to run due to *path explosion*. Notice how the control flow makes the paths diverge in one of the binaries:

![Paths go boom.](/assets/img/posts/misc/ctf/labyrinth/labyrinth-path-explosion-graph.jpg){:.w-75}
{:.center}

Now angr is pretty smart, but not too smart. Angr will simulate all paths and if it encounters a branch, it will simulate both branches together. However, it will treat the `function_133` branches as separate states...

To get a more concrete view of paths exploding, Gru tried calling `simgr.run(n=50)`—which simulates 50 steps...

![Good going, Gru!](/assets/img/posts/misc/ctf/labyrinth/labyrinth-path-explosion-gru.jpg){:.w-75}
{:.center}

90 active states is quite a lot! Usually we'd want to limit ourselves to around 10 active states to ensure good simulation speed.

With 50 steps and already 90 active states, the situation is pretty dismal. We'll need to find a better way of getting to the target address.

#### CFGs to the Rescue
Control flow graphs (CFGs) are directed graphs where nodes are blocks of code and edges indicate the direction the code can take. By translating the program into a graph, we can utilise the many graph algorithms at our disposal. In particular, we're interested in the shortest path between a start node and target node.

![Path explosion 1.](/assets/img/posts/misc/ctf/labyrinth/labyrinth-path-explosion-1.jpg){:.w-30}
![Path explosion 2.](/assets/img/posts/misc/ctf/labyrinth/labyrinth-path-explosion-2.jpg){:.w-30}
![Path explosion 3.](/assets/img/posts/misc/ctf/labyrinth/labyrinth-path-explosion-3.jpg){:.w-30}
{:.center}

Angr comes with a bundle of analysis modules; these include two CFG analysis strategies: `CFGFast` and `CFGEmulated`. The former analyses the program statically (without actually simulating the code!), whereas the latter analyses the program dynamically (i.e. by simulating the code).

Since the labyrinth elf only contains simple if-statements and function calls, and no obfuscation or complicated redirection whatsoever, we can construct a CFG statically!

Working with graphs and nodes in angr is fairly straightforward. Angr CFGs are just instances of **networkx** graphs (a python graph library), so we'll need to import it to use its handy `shortest_path` function.

```py
    # Construct a CFG from the 1000 functions. 
    # Restrict analysis to the relevant region to save time.
    region = [(0x401155, 0x400000 + elf.sym['__libc_csu_init'])]
    cfg = p.analyses.CFGFast(regions=region)

    # Get networkx nodes for start and target addresses in CFG.
    src_node = cfg.model.get_any_node(start_addr, anyaddr=True)
    tar_node = cfg.model.get_any_node(tar_addr, anyaddr=True)

    # Ensure nodes exist. shortest_path works differently if a node is None.
    assert src_node is not None and tar_node is not None

    # Construct the shortest path from src to tar. This will be a list of CFGNodes.
    from networkx import shortest_path
    path = shortest_path(cfg.graph, src_node, tar_node)
```

Now that we have a direct sequence of nodes from `main` to our `exit(0)` function, we just need to guide angr's simulation manager along the path, function-by-function.

<!-- But there's one more thing we should take care of. Our path is currently a path of blocks, not functions. To make the exploration consistent of stepping through functions, we'll group the  -->

```py
    # Walk through the rest of the path.
    state = p.factory.blank_state(addr=start_addr)
    for node in path:
        # Let the simulator engine works its magic.
        simgr = p.factory.simgr(state)
        simgr.explore(find=node.addr)
        assert len(simgr.found) > 0
        
        # Keep the found state for next iteration.
        state = simgr.found[0]
```

Our last step is to get the input used. Angr's constraint solver should have it figured out.

```py
    # Get input which will get us from main to exit(0).
    chain = state.posix.dumps(0)
    return chain
```

On my computer, this solve process takes roughly 30-40 seconds... which is good enough, since it falls within the allotted time of one minute per solve. Putting it together with the solver template and running it, the server kindly hands us the flag!

### Solve Script
```py
from angr import *
from networkx import shortest_path
from pwn import *


def solve(file='elf'):
    p = Project(file)
    elf = ELF(file)

    # Find target address.
    start_addr = 0x4011b3
    tar_addr = 0x4011c8

    # Construct a CFG from the 1000 functions.
    # Restrict analysis to the relevant region to reduce time.
    region = [(0x401155, 0x400000 + elf.sym['__libc_csu_init'])]
    cfg = p.analyses.CFGFast(regions=region)

    # Get networkx nodes for start and target addresses in CFG.
    src_node = cfg.model.get_any_node(start_addr, anyaddr=True)
    tar_node = cfg.model.get_any_node(tar_addr, anyaddr=True)

    # Ensure nodes exist. shortest_path works differently if a node is None.
    assert src_node is not None and tar_node is not None

    # Construct the shortest path from src to tar. This will be a list of CFGNodes.
    path = shortest_path(cfg.graph, src_node, tar_node)

    # Walk through the rest of the path.
    state = p.factory.blank_state(addr=start_addr)
    for node in path:
        # Let the simulator engine works its magic.
        simgr = p.factory.simgr(state)
        simgr.explore(find=node.addr)
        assert len(simgr.found) > 0
        
        # Keep the found state for next iteration.
        state = simgr.found[0]

    # Get input which will get us from main to exit(0).
    chain = state.posix.dumps(0)
    print(chain)

    return chain


p = remote("tamuctf.com", 443, ssl=True, sni="labyrinth")

for binary in range(5):
    # Read input and save as binary.
    with open("elf", "wb") as file:
        file.write(bytes.fromhex(p.recvline().rstrip().decode()))
    
    # Solve and print.
    out = solve()
    p.sendline(out.hex().encode())

p.interactive()
```

### Flag
```
gigem{w0w_y0ur3_r34lly_600d_w17h_m4z35}
```
