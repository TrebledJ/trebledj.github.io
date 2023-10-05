---
title: GDB/GEF Cheatsheet
description: Quick command reference for binary enthusiasts.
tags:
 - ctf
 - pwn
 - reverse
 - learning
thumbnail_src: assets/gef.png
related:
    tags: [ctf]
---

(No, the subtitle is not a comment on gender.)

This is a curated collection of GDB/GEF commands which I find incredibly useful for dynamic analysis and reverse engineering. These are mainly personal notes and may be incomplete, but suggestions are welcome! If there's a useful GDB/GEF command you use that's not on this list, do [leave a comment](#comments) or [let me know](/#contact) so that I can add it. :)

## The Basics

### Hjaelp!

```sh
# Describes how to use a command.
help
help [command]
help info
help breakpoint
```

### Execution

**Run Program with Loaded File**
```sh
gdb <filename>
```

**Load Files**
```sh
file <filename>
```

**Running**
```sh
start    # Starts program and breaks at beginning.
run      # Runs program normally.
continue # Continue program where you left off.
kill     # Kill process.
quit     # Leave GDB.
```

**Shell**
```sh
shell <cmd>
shell echo Hi
```

### Interrupting

We want to inspect a program in the guts. But how do we stop it where we want?

- `^C` during program execution. (Also throws a {% abbr "`SIGINT`", "SIGnal INTerrupt." %}.)
- Use `start` instead of `run`. {% abbr "Breaks", "Pauses the program" %} after starting the program.
- Use [breakpoints](#breakpoints) (break on address).
- Use [watchpoints](#watchpoints) (break on data).

### Step Debugging

Once we've stopped, what do we do? How do we navigate instructions and functions effectively?

Step debugging is one of the core features of GDB, and an invaluable tool for all programmers. Modern IDEs have step debugging functionality built-in to operate seamlessly with code.

```sh
# Step Debugging
## Step (into).
step
s
## Step over.
next
n
## Step (into) one instruction exactly.
stepi
si
## Step over one instruction.
nexti
ni
## Step out. Execute until (selected) stack frame returns (past end of function).
finish
fin
```

### Disassembly

Useful for verifying addresses and assembly, even if you use a decompiler.

View instructions at a function or address.
```sh
disas <address/function>
disas <start addr>,<end addr>
disas <start addr>,+<offset>

disas main
```

Enable Intel-flavoured ASM syntax.
```sh
set disassembly-flavor intel
```

View data as instructions.
```sh
x/[n]i <addr>
x/20i 0x5555555dddd0
```

## Registers

### View Registers

Show individual registers.
```sh
print [expression]

print $rax
p $rax

# Expressions are evaluated.
p $rbx+$rcx*4
```

Show all registers.
```sh
info registers
info r
registers # (GEF)
reg       # (GEF)
```

### Modify Registers
```sh
set $eax = 0xdeadbeef
```

### Watch Registers
See [Watchpoints](#watchpoints).

## Memory

Memory is a core component of binaries. Many hidden secrets lurk inside the shadows of memory.

### View Memory

```sh
x/[n][sz][fmt] <addr>

# n: Number of data to print.
# sz: b(byte), h(halfword), w(word), g(giant, 8 bytes)
# fmt: Format to print data.
# - o(octal), x(hex), d(decimal), u(unsigned decimal),
# - z(hex, zero padded on the left)
# - t(binary), f(float), c(char), s(string)
# - a(address), i(instruction),

# 20 words.
x/20wx 0x7fffffffd000

# 20 bytes.
x/20bx 0x7fffffffd000

# View as string.
x/s 0x7fffffffd000
```

### Modify Memory

```sh
set {c-type}<address> = <value>

# For self-compiled sources.
set var i = 10
set {int}0x83040 = 4

# With cast + dereference.
## C++
set *{uint32_t*}0x7fffffffd000 = 0xdeadbeef
## Rust
set *(0x7fffffffd000 as *const u32) = 0xdeadbeef
```

### Search Memory

```sh
find <start>, <end>, <data...>
find <start>, +<length>, <data...>

# Find string (including null byte).
find 0x7fffffffd000, 0x7ffffffff000, "Hello world!"

# Find string (excluding null byte).
find 0x7fffffffd000, 0x7ffffffff000, 'H','e','l','l','o'
```

More options.

```sh
find [/sn] ...
# s: b(byte), h(halfword), w(word), g(giant, 8 bytes)
# n: max number of finds
```

Combine with [Memory Mapping](#view-memory-segments) to determine available regions.

### Watch Memory

See [Watchpoints](#watchpoints).

### View Memory Segments

Useful to determine which areas are readable/writeable/executable.

Requires program to be running beforehand.

```sh
info proc mappings
vmmap # (GEF)
```

## Stack

### View Stack
```sh
# View 100 words (hex) at $rsp.
x/100wx $rsp
```

See also: [View Memory](#view-memory).

**Stack Frame**
```sh
info frame
```

**Stack Trace**  
Show a trace of previous stack frames.
```sh
backtrace
bt
```

## Heap

GEF only.

```sh
heap

# View all chunks.
heap chunks

# View specific chunks.
heap chunk <addr>

# View state of bins (freed chunks).
heap bins
```

## Breakpoints

{% abbr "Breaks", "Pauses the program" %} when address reaches an instruction.

```sh
break *<address>
break <line-number | label> # For self-compiled programs.
break <stuff...> if <expression>

# Address.
break *0x401234
b *0x401234

# Offset from function.
break *main+200

# Line number and expression.
break main.c:6 if i == 5
```

Further reading:
- [SO: GDB – Break if variable equal value](https://stackoverflow.com/q/14390256/10239789)

### Breakpoint Control

Sometimes we only want to enable or disable certain breakpoints. These commands come handy then. They also apply to watchpoints.

**Get Breakpoint Info**

```sh
info breakpoints
info b
```

**Control Breakpoints**

```sh
# Enable/disable all breakpoints.
enable
disable

# Enable/disable specific breakpoints.
enable <breakpoint-id>
disable <breakpoint-id>

# Remove breakpoints.
delete <breakpoint-id>
```

**Skip `n` Breakpoints**

```sh
continue <ignore-count>

# Skip 32 breaks.
continue 32
```

**Hit Breakpoint Once**

```sh
# Enable the breakpoint once.
# The breakpoint will be disabled after first hit.
enable once <breakpoint-id>
```

### Watchpoints

{% abbr "Breaks", "Pauses the program" %} when data changes. More specifically, whenever the *value of an expression* changes, a break occurs.

This includes:
 - when an address is **written** to. (`watch`, `awatch`)
 - when an address is **read** from. (`rwatch`, `awatch`)
 - when an expression evaluates to a given value. (`watch`)

```sh
watch <expression>

# Break on write.
watch *0x7fffffffd000

# Break on condition.
## Register
watch $rax == 0xdeadbeef
## Memory
### C/C++
watch *{uint32_t*}0x7fffffffd000 == 0xdeadbeef
### Rust
watch *(0x7fffffffd000 as *const u32) == 0xdeadbeef
```

Watchpoints can be enabled/disabled/deleted like breakpoints, but you can also list them separately.
```sh
# Displays table of watchpoints.
info watchpoint
info wat
```

If hardware watchpoints are supported, then you can also use [read watchpoints](#read-watchpoints) and [access watchpoints](#access-watchpoints).

```sh
# Check if hardware watchpoints are supported.
show can-use-hw-watchpoints
```

```sh
# Read watchpoints: break on read.
rwatch *0x7fffffffd000

# Access watchpoints: break on read or write.
awatch *0x7fffffffd000
```

Further Reading:

- [GDB: Setting Watchpoints](https://sourceware.org/gdb/onlinedocs/gdb/Set-Watchpoints.html)

## Miscellaneous

### Install GEF

```sh
# via the install script
## using curl
bash -c "$(curl -fsSL https://gef.blah.cat/sh)"

## using wget
bash -c "$(wget https://gef.blah.cat/sh -O -)"

# or manually
wget -O ~/.gdbinit-gef.py -q https://gef.blah.cat/py
echo source ~/.gdbinit-gef.py >> ~/.gdbinit

# or alternatively from inside gdb directly
gdb -q
(gdb) pi import urllib.request as u, tempfile as t; g=t.NamedTemporaryFile(suffix='-gef.py'); open(g.name, 'wb+').write(u.urlopen('https://tinyurl.com/gef-main').read()); gdb.execute('source %s' % g.name)
```

Further Reading:
- [GitHub: GEF](https://github.com/hugsy/gef)

### Input Non-Printable Characters

**Directly from GDB: With `run`**
```sh
# Runs with 'AAAA\x01\x02\x01\x02' as stdin.
r <<<$(perl -e 'print "A"x4 . "\x01\x02"x2;')
```

This uses a Bash [here-string](https://www.gnu.org/savannah-checkouts/gnu/bash/manual/bash.html#Here-Strings) to feed goodies into input.

<!--
**Directly from GDB: Continue**
```sh
# (Untested)
c -A < <(perl -e 'print "\x00\x40\x3d\x38"')
```
-->

**Directly from GDB: With Temporary File**

Slightly more convoluted than the previous method, but is more portable.
```sh
# Prints 'AAAA\x01\x02\x01\x02' to a temporary file.
shell perl -e 'print "A"x4 . "\x01\x02"x2;' >/tmp/input

# Run the program, use the file as stdin.
r </tmp/input
```

**Reset GDB Arguments**

```sh
set args
```

This empties `args`. You can also use this command to set arbitrary arguments. The full command is:

```sh
set args [arguments...]
```

{% alert "danger" %}
I don't recommend using Python 3 to generate strings on-the-fly, as its string/byte-string mechanics are unintuitive. Prefer `perl` or `echo` instead.

For example: `python -c 'print("\xc0")'` prints `\xc3\x80` (À) instead of `\xc0`. Why? Because the Python string `"\xc0"` is interpreted as U+00C0, which is `\xc3\x80` in UTF-8.

```py
assert '\xc0'.encode() == b'\xc3\x80'
```

Printing bytes in Python is [difficult to do concisely](https://stackoverflow.com/q/908331/10239789).
{% endalert %}

**Using `pwnlib.gdb.attach`**

```python
from pwn import *

bash = process('bash')

# Attach the debugger
gdb.attach(bash, '''
set follow-fork-mode child
break execve
continue
''')

# Interact with the process
bash.sendline(b"echo '\x01\x02\x03\x04'")
```

Further Reading:

 - [SO: `gdb.attach` Example](https://stackoverflow.com/a/62014210/10239789)
 - [`gdb.attach` Documentation](https://docs.pwntools.com/en/stable/gdb.html#pwnlib.gdb.attach)

### Enable ASLR

{% abbr "ASLR", "Address space layout randomisation" %} is a common mechanism to randomise stack, heap, and library offsets.

ASLR is disabled by default in GDB. To re-enable:

```sh
set disable-randomization off
```

Useful for pwn challenges.

### PIE Breakpoints

GEF only.

{% abbr "PIE", "Position-independent executable" %} are binaries where segments (.data, .text) are loaded at random offsets. In GDB, it seems to always be set to offset 0x555…554000.

Not all binaries have PIE enabled. Use `checksec` to verify.

Use the `pie` commands (`help pie`). Pie breakpoints are separate from regular breakpoints.

```sh
pie b <addr>    # PIE breakpoint at offset <addr> in code.
pie run         # Run with pie breakpoints enabled.
```

### GEF Context

GEF only.

Summary of registers, stack, trace, code, all in one contained view.

```sh
context
ctx
```

Sometimes you want to step-debug without GEF's massive spew of text covering the screen.

**Disable Context**
```sh
gef config context.enable 0
```

**Enable Context**
```sh
gef config context.enable 1
```