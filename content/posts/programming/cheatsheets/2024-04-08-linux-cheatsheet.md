---
title: Practical Linux Tricks for the Aspiring Hacker
excerpt: A curated list of fanciful Linux tricks I use to bolster my command-line prowess and activate Sage Mode.
tags:
  - programming
  - cheatsheet
  - linux
  - infosec
  - learning
  - notes
thumbnail_src: assets/penguin.jpg
related:
    tags: [cheatsheet, linux]
---

This is a collection of commands I've picked up over the last few years, which I've found immensely useful. My favourite ones are probably:

- `less`: search/filter on a file or long text
- `^r`: reverse search
- `!$`: last argument of previous command

By "favourite", I mean I've used these commands a *lot*, and they've drastically increased my productivity.

## Cool Stuff

**Control (`^`) Commands**
```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
^c # Duh. https://xkcd.com/416/
^d # Exit / EOF.
```

**Reverse/Forward Search**: for those long commands stashed in history. Works in PowerShell and REPLs too!
```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
^r
^s
```

<sup>Note: to make `^s` work in bash/zsh, you may need to run `stty -ixon`, which [disables software control flow](https://superuser.com/questions/472846/how-to-reverse-i-search-back-and-forth).</sup>{.caption}

**Ternary Expression**
```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
[ 1 -eq 1 ] && echo 'true' || echo 'false'
# true
```

**Clear screen**. Useful for graphical hiccups.
```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
reset
```

**Run shell script without `chmod +x`.**
```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
. ~/.zshrc
source ~/.zshrc
```

**Tree view of files.**
```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
tree
```

### Strings

**Double-Quotes vs. Single-Quotes**
- Double-quotes allow variable expansion and command substitution.
- Single-quotes don't. **Prefer single-quotes for simple strings.**

```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
echo "$((1+1))" "$SHELL"
# 2 /bin/zsh
echo '$((1+1))' '$SHELL'
# $((1+1)) $SHELL
```

**Multi-Line / Escape**  
Prefix the string with `$`.
```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
echo $'...'
```

#### Escape Single-Quotes

{% alert "success" %}
**Example**

Multi-Line Strings.
```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
echo $'1\n2\n3'
# 1
# 2
# 3
```

Find words containing `'t` in comma-separated line.
```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
echo -n $'can\'t,don\'t,I\'ll,I\'m,won\'t' | awk -vRS=, $'$0 ~ /\'t/'
# can't
# don't
# won't
```
{% endalert %}


### Previous-Command Tricks

- `$?`: exit code of previous command
  - By convention, 0 means no error. Non-0 implies an error occurred.
- `!!`: previous command
- `!$` or `$_`: last argument of previous command

{% alert "success" %}
**Examples**

Retry with sudo.
```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
mkdir /var/tmp/lol
# Permission denied.
sudo !!
# → sudo mkdir /var/tmp/lol
# Success!
```

Found an interesting directory, but forgot to *cd*.
```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
ls long/path
cd !$
# → cd long/path
```

Rename file in folder from file.txt to booyah.md.
```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
cat long/path/file.txt
mv "!$" "$(dirname !$)/booyah.md"
# → mv long/path/file.txt long/path/booyah.md
```
{% endalert %}


**Other Useful Commands**
(stolen from [here](https://stackoverflow.com/a/36654936/10239789))

- `!!:n` - nth argument from previous command
- `!^` - first argument (after the program/built-in/script) from previous command
- `!*` - all arguments from previous command
- `!n` - command number `n` from `history`
- `!pattern` - most recent command matching `pattern`
- `!!:s/find/replace` - last command, substitute `find` with `replace`


### Redirection

```sh {data-lang-off}
< out.txt # Read from file (to stdin).
> out.txt # Write to file (from stdout).
>> out.txt # Append to file (from stdout).
2> out.txt # Write to file (from stderr).
&> out.txt # Redirect all output.
&> /dev/null # Redirect everything into the void.
2>&1 # Redirect stderr to stdout.

>& # Same as `&>`.
```

## Powerful Utilities

- `awk`: filter lines, filter columns, math, scripting, etc.
- `sed`: filter/replace text
- `grep`: filter lines
- `cut`: filter columns
- `tr`: replace/remove characters
- `wc`: count characters/bytes/words
- `find`: find files in folder, execute command for each file with `-exec`
- `xargs`: feed arguments into commands, simple cmdline multi-processing

I won't cover too much of these commands here, as tons of articles already cover them. And you can browse examples online or in their `man` pages.

### awkward things

#### awk - Cut
```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
# Cut third field.
awk '$0=$3'
# 
# Print third field. (Pretty much same as the command above.)
awk '{print $3}'
# 
# Use ',' as field delimiter, e.g. for CSVs.
awk -F, '{print $3}'
# 
# Or use the script variable `FS` (Field Separator).
awk -v FS=, '{print $3}
```

#### awk - Filtering

Without entering the scripting environment `{...}`, `awk` will run filters against each line.

```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
seq 1 4 | awk '$1 % 2 == 1'
# 1
# 3
echo $'foo1\nbar1\nfoo2' | awk '$0 ~ /^foo/'
# foo1
# foo2
```

#### awk - Math
```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
# Add 5 to the first arg, then print the line.
awk '{$1 += 5}1'
# 
seq 1 3 | awk '{$1 += 5}1'
# 6
# 7
# 8
```

#### awk - Scripting
```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
awk '{print "booyah",$1,"yahoo"}'
# awk also has variables, if, for, while, arrays, etc.
```

Script variables. (Useful for configuring row/column delimiters.)

- RS: Record Separator (rows)
- FS: Field Separator (columns)
- ORS: Output Row Separator
- OFS: Output Field Separator
- NR: Record Number (current row, 1-indexed) [read-only]
- NF: Number of Fields [read-only]

### grep

**Useful Flags**
```sh {data-lang-off}
-i # case-insensitive
-E # regex
-v # non-match (inVert)
```

### grep – Find String in Files

```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
grep -rnw /path/to/somewhere/ -e 'pattern'
```

* `-r` or `-R` is recursive,
* `-n` is line number, and
* `-w` stands for match the whole word.
* `-l` can be added to just give the file name of matching files.
* `-e` is the pattern used during the search

Ref: https://stackoverflow.com/a/16957078/10239789

Other useful flags:
* `-A N`/`-B N`/`-C N`: context; prints `N` lines of context after/before/around the matched line

### xargs

xargs is a versatile command-line utility that allows efficient execution of commands, making it a powerful tool for automation and batch processing.

Interesting options:
```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
-P <n> # max procs
-n <n> # num args
-I {}  # pattern to insert into command
```

{% alert "success" %}
**Examples**

Combine multiple lines into 1 line.
```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
echo $'1\n2\n3'
# 1
# 2
# 3
echo $'1\n2\n3' | xargs 
# 1 2 3
```

Multi-Processing: Execute `./do-something-to-file.sh <file>` on multiple files, with at most 4 processes.
```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
cat files.txt | xargs -P 4 -n1 ./do-something-to-file.sh
```

Multi-Processing: Port Scan with Ports 1-1000 through `proxychains`.
```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
seq 1 1000 | xargs -P 50 -I{} proxychains4 -q nmap -p {} -sT -Pn --open -n -T4 --oN nmap.txt --append-output 192.168.101.10
```
{% endalert %}


### Other Utilities

```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
basename ~/.bashrc
# .bashrc
dirname ~/.bashrc
# /home/trebledj
```

#### Directory Stack
```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
pushd # Push current directory, for easier returning.
popd  # Return to directory on top of stack.
dirs  # List history of dirs.
```

{% alert "success" %}
**`pushd`/`popd` Example**
```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
cd ~/a/b/c
pushd deep/nested/directory
# Jump to `deep/nested/directory`, push `~/a/b/c` into the stack.
cd ../../jump/around/some/more
cd ../../and/a/little/more
popd  # Return to `~/a/b/c`.
```
{% endalert %}

## less

`less` is a powerful text viewer (read-only), with capabilities to navigate, search, and filter lines in a file or long text.

Get some help. See all commands:

```sh {data-lang-off}
h
```

#### less - Nice Options
```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
less file.txt
# 
# Renders ANSI colors.
less -R file.txt
# 
# Pager search becomes case insensitive.
less -I file.txt
# 
# Line numbers.
less -N file.txt
```

You can turn on/off these options *inside `less`* by typing `-I<Enter>`, `-R<Enter>`, or `-N<Enter>`. This is useful if you forget to turn them on beforehand (e.g. after curling a web request).

#### less - Navigation
```sh {data-lang-off}
j # Line down.
k # Line up.
f # Page down.
b # Page up.
d # Half-page down.
u # Half-page up.

g # Go to start of file.
G # Go to end of file.

<n> g # Go to nth line.

# Go to the n% line of the file.
<n> p
20p 40p 50p 80p

# What's the current line?
^g
```

#### less - Search / Filtering
```sh {data-lang-off}
# Search (regex enabled).
/ <pattern>
# For case-insensitive search, use `less -I`.

# Navigate search results: next/prev result.
nN

# Filter lines by search.
& <pattern>
# Filter NON-MATCHING lines
& ! <pattern>
# Clear filter.
& <enter>
```

#### less - Scrolling
Personally, I prefer `less+F` over `tail -f`.  
Use `^c` to exit the feed.

```sh {data-lang-off}
# Continuous feed (e.g. for streams of data)
F
```

#### less - Working with Multiple Files
`less` also works with multiple files passed in the command line, e.g. `less *.txt`.
```sh {data-lang-off}
# Next file.
:n
# Previous file.
:p
```

More commands in `man less`.


## Processes
### fg/bg - "I'll be back."

Shells allow you to move processes between the foreground (which accepts interactive input) and background (to run things which don't require input).

```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
^z # Push process to background (and pause it).
bg # Start background process.
fg # Bring most recent background process into foreground.
fg 2 # Bring job 2 into foreground.
jobs # View background jobs.
# 
^c # Good ol' ctrl-c stops the process in fg.
kill <pid> # Kill process with given process ID.
# 
# Start a command in the background.
<cmd> &
```

{% alert "success" %}
**Example**

Start an HTTP server on port 8080.
```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
python -m http.server 8080 &
# [1] 17999
```
The process is started in the background with job number 1, PID 17999.

To kill the process:
```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
fg
^c
```

or...
```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
kill 17999
```

{% endalert %}

{% alert "warning" %}
Process ID (PID) and Job Number are two different things.

- PIDs apply to *all* users in the *entire system*, and are assigned by the kernel.
- Job Numbers apply to the *current* shell, and are numbered linearly from 1 onwards.
{% endalert %}


### View Running Procs

```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
ps aux
```

Combine with `grep`/`less` for filtered results.

## Networking

### IP and Ports

**IP Addresses and Networks**
```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
ifconfig
ifconfig tun0
```

**Get Our Public IP**
```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
curl ifconfig.me
# X.X.X.X
```

**Open Ports/Sockets**
```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
netstat -anp
```
- `-a`: all sockets
- `-n`: numeric addresses
- `-p`: associated processes

**Listen/Connect**
```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
# Initiate a connection.
nc 192.168.1.1 8080
# 
# Listen for a connection.
nc -nlvp 4444
```

### Download Files

```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
# Download and save to a local file.
curl <url> -O
wget <url>
# 
# Download with a custom filename.
curl <url> -o filename.txt
wget <url> -O filename.txt
# 
# Download silently and display in `less`.
curl <url> -s | less
wget <url> -s | less
curl some.api.site/api/v1/users/ -s | jq | less
```


### Upload Files

```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# " data-label=Server}
python -m uploadserver
```
- By default, `uploadserver` starts a server at port 8000.
- Get our IP from `ifconfig`.

```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# " data-label=Client}
curl -F files=@file1.txt -F files=@file2.txt 192.168.45.179:8000/upload
```

## Files

### Check File Sizes

```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
# Get available disk space.
df -h
# Get file size of current directory, in human readable format.
du -sh .
# Get file size of txt files, in human readable format.
du -sh *.txt
```

### Find/Operate on Files

```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
# Find files in operating system, and ignore errors.
find / -name '*needle*' 2>/dev/null
# 
# Find [f]iles or [d]irectories.
find . -type f -name '*needle*'
find . -type d -name '*needle*'
# 
# Find and run command on files. \; is needed for `find` to know where to terminate.
find . -type f -name '*complex*' -exec echo {} \;
find . -type f \( -name '*complex*' -or -name 'query' \) -exec du -h {} \;
```

Other useful flags:
* `-mindepth N`/`-maxdepth N`: minimum/maximum recursion depth, e.g. `-maxdepth 1` would only operate on files *directly* within the current folder

## git gud

Git commands for completeness.

```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
# Make new branch.
git checkout -b <name>
# 
# Checkout commits in tree before HEAD.
git checkout HEAD~1  # 1 commit before.
git checkout HEAD~10 # 10 commits before.
# 
# Checkout commit from parent.
git checkout HEAD^  # 1 commit before (from parent 1, base).
git checkout HEAD^2 # 1 commit before (from parent 2, target).
# 
# Store changes locally.
git stash
git stash pop
# 
# Clean edited files.
git reset [--hard]
# --hard removes unstaged files.
# 
# View changes.
git diff | less
git diff <file> # See change in specific file.
# 
# Jump through commits (to find, say, the cause of a bug).
git bisect [start|reset|good|bad|skip]
```

**git tree**
```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
# Command-line git tree from git log.
git log --graph --abbrev-commit --decorate --format=format:'%C(bold blue)%h%C(reset) - %C(bold green)(%ar)%C(reset) %C(white)%s%C(reset) %C(dim white)- %an%C(reset)%C(bold yellow)%d%C(reset)' --all
# 
# More detailed git-tree 
git log --graph --abbrev-commit --decorate --format=format:'%C(bold blue)%h%C(reset) - %C(bold cyan)%aD%C(reset) %C(bold green)(%ar)%C(reset)%C(bold yellow)%d%C(reset)%n''          %C(white)%s%C(reset) %C(dim white)- %an%C(reset)' --all
# 
# Add them as git aliases in ~/.gitconfig or script aliases in ~/.bashrc.
# See https://stackoverflow.com/a/9074343/10239789.
```

Fun watch: [So You Think You Know Git?](https://www.youtube.com/watch?v=aolI_Rz0ZqY)

## vim

Haha. Nope.

Not covering that here.

### How to Exit Vim

Obligatory.
```sh {data-lang-off}
:wq  # Write to file + exit.
:q!  # Force exit.
```

Okay, that's enough vim.

### Useful Things

Set line numbers.
```sh {data-lang-off}
:set number
```

## tmux

Actually decently useful? This is not a substitute for a tmux tutorial/introduction, the main goal is to be a simple cheatsheet. Go learn it in 5 minutes.

```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
# Start a new tmux session.
tmux
# Reuse a previous tmux session.
tmux attach -t 0
tmux attach -t custom-name
```

Must-know commands. (Note: `C-b` is `Ctrl+b`. `C-b d` means hit `Ctrl+b`, then press `d`.)

```sh {data-language=tmux .command-line data-prompt="" data-filter-output="# "}
C-b d       # Detach session (reconnect with tmux attach -t 0)
# 
# Navigate panes
C-b (up/down/left/right)
# 
C-b c       # New window
C-b n       # Next window
C-b p       # Previous window
C-b %       # Split pane (left/right)
C-b "       # Split pane (up/down)"
C-b x       # Close pane
C-b &       # Close window
C-b ?       # Help (common commands)
```

Useful commands.

```sh {data-language=tmux .command-line data-prompt="" data-filter-output="# "}
C-b (0-9)   # Jump to window #0-9
C-b z       # Zoom/Unzoom pane (useful when needing to copy something with multiple lines)
C-b ,       # Rename window
# 
# Toggle preset pane layout
C-b alt-(1-5)
C-b space   # Cycle through preset layouts
# 
# Copy mode
C-b [
C-b page-up # For scrolling
C-c         # Exit copy mode (Ctrl+c)
# 
# Search output history (make sure you're in copy mode)
/
# 
# Rename session (then use when tmux attach -t custom-name)
C-b :rename-session custom-name
```

## Hacky Hack Hack

### Generate Bytes

Buffer overflow for fun and profit.

**echo**
```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
echo -n '\x01\x02'
# 
echo -n '\x41' | xxd
# 00000000: 41                     A
```

**perl** (good for repetitive sequences)
```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
perl -e 'print "\x41"x4 . "\x42\x43"' | xxd
# 00000000: 4141 4141 4243         AAAABC
```

{% alert "danger" %}
I've mentioned this elsewhere, but I'll repeat it here: I don't recommend using Python 3 to generate strings on-the-fly, as its string/byte-string mechanics are unintuitive. Prefer `perl` or `echo` instead.

For example: `python -c 'print("\xc0")'` prints `\xc3\x80` (À) instead of `\xc0`. Why? Because the Python string `"\xc0"` is interpreted as U+00C0, which is `\xc3\x80` in UTF-8.

```python
assert '\xc0'.encode() == b'\xc3\x80'
```

Printing bytes in Python is [difficult to do concisely](https://stackoverflow.com/q/908331/10239789).
{% endalert %}

### Simple Binary Analysis

**Look for strings.**
```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
strings file
strings -n <numchars> file
```

**Look for strings and print addresses (in hex)!**
```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
od -A x -S 4 file
```

**Tracing**
- `strace` - trace system calls (open, read, write, etc.)
- `ltrace` - trace library (glibc) calls
