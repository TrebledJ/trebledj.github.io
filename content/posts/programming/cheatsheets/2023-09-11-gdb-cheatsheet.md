---
title: GDB/GEF Cheatsheet
excerpt: Quick command reference on one of the most powerful tools for dynamic analysis.
tags:
  - cheatsheet
  - infosec
  - ctf
  - pwn
  - reverse
  - learning
  - notes
thumbnail_src: assets/gef.png
related:
    tags: [cheatsheet]
---

This is a curated collection of GDB/GEF commands which I find incredibly useful for dynamic analysis and reverse engineering. These are mainly personal notes and may be incomplete, but suggestions are welcome! If there's a useful GDB/GEF command you use that's not on this list, do [leave a comment](#comments) or [let me know](/#contact) so that I can add it. :)

## The Basics

### Hjaelp!

```sh {data-lang-off}
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
```sh {data-lang-off}
file <filename>
```

**Running**
```sh {data-lang-off}
start    # Starts program and breaks at beginning.
run      # Runs program normally.
continue # Continue program where you left off.
kill     # Kill process.
quit     # Leave GDB.
```

**Shell Commands**
```sh {data-lang-off}
shell <cmd>
shell echo Hi
!<cmd>
```

### Interrupting

We want to inspect a program in the guts. But how do we stop it where we want?

- `^C` during program execution. (Also throws a {% abbr "`SIGINT`", "SIGnal INTerrupt." %}.)
- Use `start` instead of `run`. Breaks after starting the program.
- Use [breakpoints](#breakpoints) (break on address).
- Use [watchpoints](#watchpoints) (break on data).

### Step Debugging

Once we've stopped, what do we do? How do we navigate instructions and functions effectively?

Step debugging is one of the core features of GDB, and an invaluable tool for all programmers. Modern IDEs have step debugging functionality built-in to operate seamlessly with code. But in GDB, you can operate it with the familiar touch of your keyboard!

```sh {data-lang-off}
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
```sh {data-lang-off}
disas <address/function>
disas <start addr>,<end addr>
disas <start addr>,+<offset>

disas main
```

Enable Intel-flavoured ASM syntax.
```sh {data-lang-off}
set disassembly-flavor intel
```

View data as instructions.
```sh {data-lang-off}
x/[n]i <addr>
x/20i 0x5555555dddd0
```

## Registers

### View Registers

Show individual registers.
```sh {data-lang-off}
print [expression]

print $rax
p $rax

# Expressions are evaluated.
p $rbx+$rcx*4
```

Show all registers.
```sh {data-lang-off}
info registers
info r
registers # (GEF)
reg       # (GEF)
```

### Modify Registers
```sh {data-lang-off}
set $eax = 0xdeadbeef
```

### Watch Registers
See [Watchpoints](#watchpoints).

## Memory

Memory is a core component of binaries. Many hidden secrets lurk inside the shadows of memory.

### View Memory

```sh {data-lang-off}
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

```sh {data-lang-off}
set {c-type}<address> = <value>

# For self-compiled sources.
set var i = 10
set {int}0x83040 = 4
```

You can also modify memory at a pointer location by casting to an appropriate type and dereferencing.

```sh {data-lang-off}
## C++
set *{uint32_t*}0x7fffffffd000 = 0xdeadbeef
## Rust
set *(0x7fffffffd000 as *const u32) = 0xdeadbeef
```

### Search Memory

```sh {data-lang-off}
find <start>, <end>, <data...>
find <start>, +<length>, <data...>

# Find string (including null byte).
find 0x7fffffffd000, 0x7ffffffff000, "Hello world!"

# Find string (excluding null byte).
find 0x7fffffffd000, 0x7ffffffff000, 'H','e','l','l','o'
```

More options.

```sh {data-lang-off}
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

```sh {data-lang-off}
info proc mappings
vmmap # (GEF)
```

## Stack

### View Stack
```sh {data-lang-off}
# View 100 words (hex) at $rsp.
x/100wx $rsp
```

See also: [View Memory](#view-memory).

**Stack Frame**
```sh {data-lang-off}
info frame
```

**Stack Trace**  
Show a trace of previous stack frames.
```sh {data-lang-off}
backtrace
bt
```

## Heap

GEF only.

```sh {data-lang-off}
heap

# View all chunks.
heap chunks

# View specific chunks.
heap chunk <addr>

# View state of bins (freed chunks).
heap bins
```

## Breakpoints

Breaks when address reaches an instruction.

```sh {data-lang-off}
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

Further Reading:
- [SO: GDB – Break if variable equal value](https://stackoverflow.com/q/14390256/10239789)

### Breakpoint Control

Sometimes we only want to enable or disable certain breakpoints. These commands come handy then. They also apply to watchpoints.

**Get Breakpoint Info**

```sh {data-lang-off}
info breakpoints
info b
```

**Control Breakpoints**

```sh {data-lang-off}
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

```sh {data-lang-off}
continue <ignore-count>

# Skip 32 breaks.
continue 32
```

**Hit Breakpoint Once**

```sh {data-lang-off}
# Enable the breakpoint once.
# The breakpoint will be disabled after first hit.
enable once <breakpoint-id>
```

### Watchpoints

Breaks when data changes. More specifically, whenever the *value of an expression* changes, a break occurs.

This includes:
- when an address is **written** to. (`watch`, `awatch`)
- when an address is **read** from. (`rwatch`, `awatch`)
- when an expression evaluates to a given value. (`watch`)

```sh {data-lang-off}
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
```sh {data-lang-off}
# Displays table of watchpoints.
info watchpoint
info wat
```

If hardware watchpoints are supported, then you can also use read watchpoints and access watchpoints.

```sh {data-lang-off}
# Check if hardware watchpoints are supported.
show can-use-hw-watchpoints
```

```sh {data-lang-off}
# Read watchpoints: break on read.
rwatch *0x7fffffffd000

# Access watchpoints: break on read or write.
awatch *0x7fffffffd000
```

Further Reading:

- [GDB: Setting Watchpoints](https://sourceware.org/gdb/current/onlinedocs/gdb.html/Set-Watchpoints.html)


### GDB Script

GDB commands can be placed in files and run in the following ways:

- `~/.gdbinit` and `./.gdbinit` are executed automatically on GDB startup.

- On the command line, with `-x`/`--command`:
  ```sh
  gdb --batch --command=test.gdb --args ./test.exe 5
  ```

- Using the `source` command in GDB:
  ```sh {data-language=GDB}
  source myscript.gdb
  ```

Further Reading:
- [GDB Reference - Command Files](https://sourceware.org/gdb/current/onlinedocs/gdb.html/Command-Files.html)
- [GDB Scripting Commands and Examples](https://cgi.cse.unsw.edu.au/~learn/debugging/modules/gdb_init_file/)
- [SO: What are the best ways to automate a GDB debugging session?](https://stackoverflow.com/q/10748501/10239789)


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

### `pwnlib.gdb.attach`

This allows you to programmatically interact with the binary with an initial GDB script or send I/O with Python. This uses the Python `pwn` module — a versatile exploit development package — which you can install with `pip install pwntools`.

```python
from pwn import *

bash = process('bash')

# Attach the debugger and run GDB commands.
gdb.attach(bash, '''
set follow-fork-mode child
break execve
continue
''')

# Interact with the process.
bash.sendline(b"echo Hello World")
```

Further Reading:

- [SO: `gdb.attach` Example](https://stackoverflow.com/a/62014210/10239789)
- [`gdb.attach` Documentation](https://docs.pwntools.com/en/stable/gdb.html#pwnlib.gdb.attach)

To unlock the full potential of the GDB API, check out:

- [pwntools - Working with GDB](https://docs.pwntools.com/en/stable/gdb.html)


### Input Non-Printable Characters

Sometimes you may want to manually fuzz or construct complex attack payloads. There are multiple ways to do so.

{% alert "danger" %}
I don't recommend using Python 3 to generate strings on-the-fly, as its string/byte-string mechanics are unintuitive. Prefer `perl` or `echo` instead.

For example: `python -c 'print("\xc0")'` prints `\xc3\x80` (À) instead of `\xc0`. Why? Because the Python string `"\xc0"` is interpreted as U+00C0, which is `\xc3\x80` in UTF-8. In other words, characters are interpreted as Unicode codepoints instead of bytes.

```py
assert '\xc0'.encode() == b'\xc3\x80'
```

Printing bytes in Python is [difficult to do concisely](https://stackoverflow.com/q/908331/10239789).
{% endalert %}

**Directly from GDB: With `run`**
```sh {data-lang-off}
# Runs with 'AAAA\x01\x02\x01\x02' as stdin.
r <<<$(perl -e 'print "A"x4 . "\x01\x02"x2;')
```

This uses a Bash [here-string](https://www.gnu.org/savannah-checkouts/gnu/bash/manual/bash.html#Here-Strings) to feed goodies into input. Not supported on all machines.

<!--
**Directly from GDB: Continue**
```sh {data-lang-off}
# (Untested)
c -A < <(perl -e 'print "\x00\x40\x3d\x38"')
```
-->

**Directly from GDB: With Temporary File**

Slightly more convoluted than the previous method, but is more portable.
```sh {data-lang-off}
# Prints 'AAAA\x01\x02\x01\x02' to a temporary file.
shell perl -e 'print "A"x4 . "\x01\x02"x2;' >/tmp/input

# Run the program, use the file as stdin.
r </tmp/input
```

**Reset GDB Arguments**

```sh {data-lang-off}
set args
```

This empties `args`. You can also use this command to set arbitrary arguments. The full command is:

```sh {data-lang-off}
set args [arguments...]
```

**With [`pwnlib.gdb.attach`](#pwnlib-gdb-attach)**

```python
bash.sendline(b"echo '\x01\x02\x03\x04'")
```


### Enable ASLR

{% abbr "ASLR", "Address space layout randomisation" %} is a common mechanism to randomise stack, heap, and library offsets.

ASLR is disabled by default in GDB. To re-enable:

```sh {data-lang-off}
set disable-randomization off
```

Useful for pwn challenges.

### PIE Breakpoints

GEF only.

{% abbr "PIE", "Position-independent executable" %} are binaries where segments (.data, .text) are loaded at random offsets. In GDB, it seems to always be set to offset 0x555…554000.

Not all binaries have PIE enabled. Use `checksec` to verify.

Use the `pie` commands (`help pie`). Pie breakpoints are separate from regular breakpoints.

```sh {data-lang-off}
pie b <addr>    # PIE breakpoint at offset <addr> in code.
pie run         # Run with pie breakpoints enabled.
```

### GEF Context

GEF only.

Summary of registers, stack, trace, code, all in one contained view.

```sh {data-lang-off}
context
ctx
```

Sometimes you want to step-debug without GEF's massive spew of text covering the screen.

**Disable Context**
```sh {data-lang-off}
gef config context.enable 0
```

**Enable Context**
```sh {data-lang-off}
gef config context.enable 1
```