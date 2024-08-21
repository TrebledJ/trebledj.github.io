---
title: Practical Linux Tricks for the Aspiring Hacker
excerpt: A curated list of fanciful Linux tricks I use to bolster my command-line prowess and activate Sage Mode.
tags:
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
```sh
^c # Duh. https://xkcd.com/416/
^d # Exit / EOF.

^r # Reverse search: for those long commands stashed in history.
```

**Ternary Expression**
```sh
[ 1 -eq 1 ] && echo 'true' || echo 'false'
# true
```

**Clear screen**. Useful for graphical hiccups.
```sh
reset
```

**Run shell script without `chmod +x`.**
```sh
. ~/.zshrc  # Dot command.
source ~/.zshrc
```

**Tree view of files.**
```sh
tree
```

### Strings

**Double-Quotes vs. Single-Quotes**
- Double-quotes allow variable expansion and command substitution.
- Single-quotes don't. **Prefer single-quotes for simple strings.**

```sh
echo "$((1+1))" "$SHELL"
# 2 /bin/zsh

echo '$((1+1))' '$SHELL'
# $((1+1)) $SHELL
```

**Multi-Line / Escape**  
Prefix the string with `$`.
```sh
echo $'...'
```

#### Escape Single-Quotes

{% alert "success" %}
**Example**

Multi-Line Strings.
```sh
echo $'1\n2\n3'
# 1
# 2
# 3
```

Find words containing `'t` in comma-separated line.
```sh
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
```sh
mkdir /var/tmp/lol
# Permission denied.
sudo !!
# Yay!
```

Found an interesting directory, but forgot to *cd*.
```sh
ls long/path
cd !$
# → cd long/path
```

Rename file in folder from file.txt to booyah.md.
```sh
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

```sh
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
```sh
awk '$0=$3' # Cut third field.
awk '{print $3}' # Print third field. (Pretty much same as the command above.)

# Use ',' as field delimiter, e.g. for CSVs.
awk -F, '{print $3}'
# or use the script variable `FS` (Field Separator).
awk -v FS=, '{print $3}
```

#### awk - Filtering
```sh
awk '$1 == 1' # Filter lines with first field = 1.
awk '$0 ~ /^foo/' # Filter lines with regex.
```

#### awk - Math
```sh
awk '{$1 += 5}1' # Add 5 to the first arg, then print the line.

seq 1 3 | awk '{$1 += 5}1'
# 6
# 7
# 8
```

#### awk - Scripting
```sh
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
```sh
# case-insensitive
-i
# regex
-E
# non-match (inVert)
-v
```

### xargs

xargs is a versatile command-line utility that allows efficient execution of commands from, making it a powerful tool for automation and batch processing.

Interesting options:
```sh
-P <n> # max procs
-n <n> # num args
-I {}  # pattern to insert into command
```

{% alert "success" %}
**Examples**

Combine multiple lines into 1 line.
```sh
echo $'1\n2\n3' | xargs 
# Output: 1 2 3 (no newline)
```

Multi-Processing: Execute `./do-something-to-file.sh <file>` on multiple files, with at most 4 processes.
```sh
cat files.txt | xargs -P 4 -n1 ./do-something-to-file.sh
```

Multi-Processing: Port Scan with Ports 1-1000 Through `proxychains`.
```sh
seq 1 1000 | xargs -P 50 -I{} proxychains4 -q nmap -p {} -sT -Pn --open -n -T4 --oN nmap.txt --append-output 192.168.101.10
```
{% endalert %}


### Other Utilities

```sh
basename ~/.bashrc # .bashrc     # Filename, without path.
dirname ~/.bashrc  # /home/bob/  # Path to file.
```

#### Directory Stack
```sh
pushd # Push current directory, for easier returning.
popd  # Return to directory on top of stack.
```

{% alert "success" %}
**`pushd`/`popd` Example**
```sh
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

#### less - Nice Options
```sh
less file.txt

# Renders ANSI colors.
less -R file.txt

# Pager search becomes case insensitive.
less -I file.txt

# Line numbers.
less -N file.txt
```

#### less - Navigation
```sh
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
```sh
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

```sh
# Continuous feed (e.g. for streams of data)
F
```

#### less - Working with Multiple Files
`less` also works with multiple files passed in the command line, e.g. `less *.txt`.
```sh
# Next file.
:n
# Previous file.
:p
```

More commands in `man less`.


## Processes
### fg/bg - "I'll be back."

Shells allow you to move processes between the foreground (which accepts interactive input) and background (to run things which don't require input).

```sh
^z # Push process to background (and pause it).
bg # Start background process.
fg # Bring most recent background process into foreground.
fg 2 # Bring job 2 into foreground.
jobs # View background jobs.

^c # Good ol' ctrl-c stops the process in fg.
kill <pid> # Kill process with given process ID.

# Start a command in the background.
<cmd> &
```

{% alert "success" %}
**Example**

Start an HTTP server on port 8080.
```sh
python -m http.server 8080 &
# [1] 17999
```
The process is started in the background with job number 1, PID 17999.

To kill the process:
```sh
fg
^c
# or
kill 17999
```
{% endalert %}

{% alert "warning" %}
Process ID (PID) and Job Number are two different things.

- PIDs apply to *all* users in the *entire system*, and are assigned by the kernel.
- Job Numbers apply to the *current* shell, and are numbered linearly from 1 onwards.
{% endalert %}


### View Running Procs

```sh
ps aux
```

Combine with `grep`/`less` for filtered results.

## Networking

**Information**
```sh
# IP
ifconfig
ifconfig tun0

# Open Ports/Sockets
netstat -anp
# -a: all sockets
# -n: numeric addresses
# -p: associated processes
```

**Listen/Connect**
```sh
# Initiate a connection.
nc 192.168.1.1 8080

# Listen for a connection.
nc -nlvp 4444

# Listen persistently (keep listening after disconnect).
nc -nklvp 4444
```

### Download Files

**wget**
```sh
# Quick download.
wget <url>

# Save to specific location.
wget <url> -O filename.txt

# Download silently (no progress), and display in less.
wget <url> -s | less
```

**curl**
```sh
curl <url> -s | less

# Use jq to format JSON.
curl some.api.site/api/v1/users/ -s | jq | less
```

### Upload Files

**Server**
```sh
python -m uploadserver
```
- By default, `uploadserver` starts a server at port 8000.
- Get our IP from `ifconfig`.

**Client**
```sh
curl -F files=@file1.txt -F files=@file2.txt 192.168.45.179:8000/upload
```

## git gud

Git commands for completeness.

```sh
# Make new branch.
git checkout -b <name>

# Checkout commits in tree before HEAD.
git checkout HEAD~1  # 1 commit before.
git checkout HEAD~10 # 10 commits before.

# Checkout commit from parent.
git checkout HEAD^  # 1 commit before (from parent 1, base).
git checkout HEAD^2 # 1 commit before (from parent 2, target).

# Store changes locally.
git stash
git stash pop

# Clean edited files.
git reset [--hard]
# --hard removes unstaged files.

# View changes.
git diff | less
git diff <file> # See change in specific file.

# Jump through commits (to find, say, the cause of a bug).
git bisect [start|reset|good|bad|skip]
```

**git tree**
```sh
# Command-line git tree from git log.
git log --graph --abbrev-commit --decorate --format=format:'%C(bold blue)%h%C(reset) - %C(bold green)(%ar)%C(reset) %C(white)%s%C(reset) %C(dim white)- %an%C(reset)%C(bold yellow)%d%C(reset)' --all

# More detailed git-tree 
git log --graph --abbrev-commit --decorate --format=format:'%C(bold blue)%h%C(reset) - %C(bold cyan)%aD%C(reset) %C(bold green)(%ar)%C(reset)%C(bold yellow)%d%C(reset)%n''          %C(white)%s%C(reset) %C(dim white)- %an%C(reset)' --all

# Add them as git aliases in ~/.gitconfig or script aliases in ~/.bashrc.
# See https://stackoverflow.com/a/9074343/10239789.
```

Fun watch: [So You Think You Know Git?](https://www.youtube.com/watch?v=aolI_Rz0ZqY)

## vim

Haha. Nope.

Not covering that here.

## Hacky Hack Hack

### Generate Bytes

Buffer overflow for fun and profit.

**echo**
```sh
echo -n '\x01\x02'

echo -n '\x41' | xxd
00000000: 41                     A
```

**perl** (good for repetitive sequences)
```sh
perl -e 'print "\x41"x4 . "\x42\x43"' | xxd
00000000: 4141 4141 4243         AAAABC
```

{% alert "danger" %}
I've mentioned this elsewhere, but I'll repeat it here: I don't recommend using Python 3 to generate strings on-the-fly, as its string/byte-string mechanics are unintuitive. Prefer `perl` or `echo` instead.

For example: `python -c 'print("\xc0")'` prints `\xc3\x80` (À) instead of `\xc0`. Why? Because the Python string `"\xc0"` is interpreted as U+00C0, which is `\xc3\x80` in UTF-8.

```python
assert '\xc0'.encode() == b'\xc3\x80'
```

Printing bytes in Python is [difficult to do concisely](https://stackoverflow.com/q/908331/10239789).
{% endalert %}
