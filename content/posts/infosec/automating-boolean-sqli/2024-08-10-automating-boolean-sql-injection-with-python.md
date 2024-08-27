---
title: Automating Boolean-Based SQL Injection with Python
excerpt: How to be efficiently lazy at finding hidden gems in predictable places – Database Edition
tags:
  - sql
  - python
  - web
  - programming
  - project
  - writeup
  - tutorial
thumbnail_src: assets/automating-boolean-sqli-thumbnail.png
thumbnail_banner: true
preamble: |
  *This is meant as an introductory post on Boolean-Based SQLi and automation with Python; with ideas, tricks, and tips gleaned from developing [a custom SQLi script](https://github.com/TrebledJ/bsqli.py). More experienced scripters or pentesters may find the middle sections more informative.*
---

When performing a penetration test, we occasionally come across SQL injection (SQLi) vulnerabilities. One particular class of SQLi is particularly tedious to exploit — Boolean-Based SQLi.

Tedious, heavily-repetitive tasks often present themselves as nice opportunities for automation. In this post, we’ll review Boolean-Based SQL Injection, and explore how to automate it with Python by starting with a basic script, optimising, applying multithreading, and more.

## What is Boolean-Based Blind SQL Injection?

What a long name.

Let’s break it down from right to left:

- **SQL Injection**: an SQL query is combined with a user payload which makes the resulting query behave differently, potentially resulting in sensitive information disclosure or remote code execution.
- **Blind**: SQL output is not returned directly in the response, but indirectly by some other indicator, such as a boolean response or time.
    - Sometimes, this term is dropped when discussing Boolean-Based SQLi, because Boolean-Based *implies* Blind.
- **Boolean-Based**: the attacker crafts SQL queries that return a *TRUE* or *FALSE* response based on the injected conditions. This could appear as:
    - different status codes (e.g. 302 redirect on success, 401 on fail),
    - different response body (e.g. error messages, full search results), or
    - (rarely) different headers (e.g. Set-Cookie).

By carefully analysing the application's response to these manipulated queries, we can extract data bit by bit, deduce the structure of the database, and potentially leak sensitive data.

Each {% abbr "DBMS", "Database Management System (e.g. MySQL, Microsoft SQL Server, SQLite, PostgreSQL)" %} has unique functions and grammar, so the SQLi syntax may be different. In MySQL, we can extract individual characters using the `SUBSTRING()` function and convert them to numbers with `ASCII()`.^[Unicode characters are trickier to deal with. One possible way is to cast the number on the RHS with `CHAR`. (This is the method SQLmap uses.) Another possible way in MySQL is to use [`ord`](https://dev.mysql.com/doc/refman/8.4/en/string-functions.html#function_ord), which maps multibyte characters to base-256. Character encoding is hard. :(]

By comparing the values with **ASCII numbers**, we can determine the character stored.

{% image "https://www.asciitable.com/asciifull.gif", "w-80", "ASCII table." %}

{% details "Simple SQLi Example" %}

So what does this look like practically?

Here we have a simple Flask server with an in-memory SQLite database containing a `login` endpoint. We'll only focus on the `login()` function. (Full code is [uploaded on GitHub](https://github.com/TrebledJ/bsqli.py/blob/89e06c708d8a3be4afca6efcddff69097934d0df/demo/server.py) for reference.)


```python
@app.route('/login', methods=['POST'])
def login():
    username = request.form['username']
    password = request.form['password']

    # Check if username/password exists.
    query = "SELECT * FROM users WHERE username='{}' AND password='{}'".format(username, password)
    c = conn.cursor()
    c.execute(query)
    user = c.fetchone()

    if user:
        return 'Login successful!'
    else:
        return 'Login failed.'
```

This is vulnerable to SQL injection, since the `username` and `password` parameters are formatted into the query without any sanitisation and without using prepared statements. But this is *blind* SQLi, because the results are not returned, only "Login successful" or "Login failed".

To exploit this, we start by crafting a proof-of-concept. We'll pass `' OR 1=1-- ` to the `username` parameter, transforming the query into:
```sql
SELECT * FROM users WHERE username='' OR 1=1-- ' AND password='...'
```
where everything after `--` is treated as a comment.

Since `1=1` is always true, all users will be selected, and the page returns: "Login successful".

{% image "assets/login-success.png", "", "Basic Proof-of-Concept showing a *TRUE*/*FALSE* response from our demo server." %}

Using this, we can detect *TRUE* responses by checking if the body contains "success".

{% image "https://imageio.forbes.com/specials-images/imageserve/5f9875237283b142dc3c7f2d/Sacha-Baron-Cohen-in-Amazon-s--Borat-Subsequent-Moviefilm-/960x0.png?format=png&width=960", "w-60", "Great success!" %}

Moreover, we can leak further information by changing `1=1` to other guessy queries. For instance, we can use this bad boy — `UNICODE(SUBSTRING(sqlite_version(), 1, 1))=51` — to test if the first character of `sqlite_version()` is `3`. This is where the tedious part comes in: we need to scan two directions: the index and the ASCII character. Scripting helps eliminate the manual labour (and make it fun in the process).

{% enddetails %}


## Optimisations with Binary Search

One quick and simple optimisation whenever we’re searching an ordered sequence is to apply binary search. This drastically reduces the max number of requests for each character from 96 to 7.^[This should make sense in bit terms. We only need 7 queries to figure out the 7 bits of an ASCII character. (The first bit is assumed to be 0.) Most Boolean-Based SQLi throwaway scripts don't do binary search because the algorithm is tricky to get right. But it's useful to know, and can be applied to time-based SQLi (another type of blind SQLi) as well for massive time discounts.]

This is a good thing for real life engagements: fewer iterations → less traffic → more sneaky → better opsec.

Normally, binary search relies on three outputs for a test: equals, less-than, and greater-than. But it is possible to make do with just two outputs: less-than, and greater-than-or-equals. If it’s less, we eliminate the upper half; otherwise, we eliminate the lower half.

```python
def binary_search(val: int, low: int, high: int) -> int:
    """Binary search for value between low (inclusive) and high (exclusive),
    assuming the guessed value is within range."""
    while low < high:
        mid = (low + high) // 2
        if low == mid:
            return mid # Found val.
        
        print(f'{low:3} - {high:3}\tGuess: {mid:4}')
        if val < mid:
            high = mid  # Eliminate upper half.
        else:
            low = mid   # Eliminate lower half.
```

Here’s a quick example, where we progress towards 125 in 7 steps (which will translate to 7 HTTP requests later on).

```python
>>> print('result:', binary_search(125, 0, 128))
  0 - 128       Guess:   64
 64 - 128       Guess:   96
 96 - 128       Guess:  112
112 - 128       Guess:  120
120 - 128       Guess:  124
124 - 128       Guess:  126
124 - 126       Guess:  125
result: 125
```

In the code snippets above, `val` is known for demo purposes. But in reality, `val` is unknown; it’s the data we’re trying to exfiltrate. To be more realistic, let's replace the `val` comparisons with a function `check_sql_value()` which sends network requests.

```python
def binary_search(sql_query: str, low: int, high: int) -> int:
    """Find the value of sql_query using binary search, between
    low (inclusive) and high (exclusive). Assuming the guessed value
    is within range."""
    while low < high:
        mid = (low + high) // 2
        if low == mid:
            return mid # Found val.
        
        if check_sql_value(sql_query, mid):
            high = mid
        else:
            low = mid

def check_sql_value(sql_query: str, n: int) -> bool:
    # Make web request to check sql_query < n.
    # And then check if the response is a TRUE or FALSE response.
    ...
```

The idea here is we can pass an SQL query, such as `ASCII(SUBSTRING(@@version, 1, 1))`, followed by the expected ranged.

```python
binary_search("ASCII(SUBSTRING(@@version, 1, 1))", low, high)
```

We can make the code more generic or flexible, but the underlying idea is there.

## More SQL Tricks

Not all types of data are easy to exfiltrate. Here are some tricks I've picked up (some of which could be scripted):

- Use subqueries to select data from arbitrary tables.
    - e.g. `ASCII(SUBSTRING( (SELECT password FROM users LIMIT 1 OFFSET 5), 1, 1 ))`
- Use `GROUP_CONCAT` to combine multiple rows into one row. This function is available in MySQL and SQLite.
    - Subqueries only work when 1 row and 1 column is selected.
    - Occasionally, there is a *lot* of data across multiple rows.
        - We can use `LIMIT` (or `TOP` for SQL Server) to restrict the data to one row.
        - Or we could `GROUP_CONCAT` to capture more data in a single subquery. Then there would be one less number to change.
- Cast SQL output to `char`/`varchar` to capture numbers, dates, and other types.
    - e.g. `CAST(id AS VARCHAR(32))` in MySQL
    - Cast with `NULL`, may not work. Additional `NULL`-checks may be needed.

I later realised — some of these are also used by SQLmap, a popular automatic SQL enumeration/exploitation script.

## Adding Multithreading

Now that we've optimised the reading of a single character, can we also speed up the reading of an entire string?

Parallelism to the rescue! For this, we'll reach for Python's built-in `concurrent.futures` library, which provides several high-level threading tools. The choice boils down to using threads (via `ThreadPoolExecutor`) or processes (`ProcessPoolExecutor`), and considering how data/processing is distributed.

### Threads vs. Processes

Time for a quick comparison.

Threads:
- lightweight and quick to create
- shares memory with main process
- one {% abbr "GIL", "Global Interpreter Lock, a feature of the Python interpreter which only allows one thread to run at a given time" %} to rule them all
- recommended for IO-bound tasks (network, requests)

Processes:
- slower to create
- doesn't share memory
- each process has their own GIL
- recommended for CPU-bound tasks (intense computations, calculations)

Note: The GIL is being actively developed and may change in Python 3.13+, so expect some updates in the (concurrent.) future.

Reference: [StackOverflow – Multiprocessing vs. Threading in Python](https://stackoverflow.com/questions/3044580/multiprocessing-vs-threading-python)

### Using ThreadPoolExecutor

In the end, I used `ThreadPoolExecutor`, since our code was constrained by network requests. The shared memory also means we don't need to worry about parameters and duplication as much. Even though the GIL prevents us from (strictly) executing in parallel, we do observe some speedup.

In the code snippet below, we create a task for each character of the string. (Assume the length of the string is known.) When a thread finishes searching for a character, the thread is recycled and picks up the next task, then the next, and so on until all tasks are done.

We can process finished tasks as they roll in using `concurrent.futures.as_completed`.

```python
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
    future_map = {}

    # Create a task for each character.
    for idx in range(length):
        future = executor.submit(get_by_bsearch, f"ASCII(SUBSTRING(({sql}),{idx+1},1))", 0, 128)
        future_map[future] = idx

    # Handle finished tasks concurrently.
    for future in concurrent.futures.as_completed(future_map):
        idx = future_map[future]
        ch = future.result()
        # We found the character at a particular index!
        # Store it somewhere...
        somewhere[idx] = ch
```

The length of the string can be determined beforehand with another binary search. Assuming the max length is 2048...

```python
length = get_by_bsearch(f"LENGTH(({sql}))", 0, 2048)
```

## Adding Comfort Features

Aside from a tool’s utility, we should also consider *user experience*. We want to design the tool to be convenient for ourselves, and potentially other users. For instance, we shouldn’t have to modify code to change general settings (e.g. the target URL). And it'd be nice to have visual feedback; waiting can be boring.

Here are some things we'll add to our automation:

- Command Line Arguments
- Progress Bar
- Interactive Interface

At this point, it’s mostly about choosing mature libraries, looking at documentation, and playing around with code. I’ll list some libraries I found useful/interesting.

### Command Line Arguments

- [`argparse`](https://docs.python.org/3/library/argparse.html), built-in, robust, used almost everywhere
- [`python-fire`](https://github.com/google/python-fire), convenient wrapper which generates command-line arguments from function annotations. (Looks interesting but I haven’t used.)

### Progress Bar

Common options are:

- [`rich`](https://github.com/Textualize/rich), colourful, great look-and-feel
- [`tqdm`](https://github.com/tqdm/tqdm), traditional rectangular progress bar

{% image "assets/progress-bar.png", "", "Example of a `rich` progress bar in action." %}

Some challenges arise when mixing progress bars with multithreading. In general...

- Dropping to a lower-level API helps alleviate issues. For example, `rich` allows you to control how tasks are added, updated, and removed.
- `KeyboardInterrupt` and Exceptions should be carefully handled. You *do* want `^C` to work right?
  - "Boss, we accidentally swamped the hospital's database with our script. Their server was weak."
  - "Stop it! Millions of lives are at stake!"
  - "We can't... Control-C doesn't work!"
  - "You leave me no choice." *(pours water over computer)*

### Interactive Interface

Instead of modifying the shell command on each SQL change, it would be nice to have an interactive, shell-like program for running SQL statements. Throwing `input()` in a while-loop could work, but doesn't have the usual shortcuts (e.g. up for previous command^[Although in Windows, this appears to be built-in?! At least Windows or Python on Windows does one thing well. 🤷‍♂️]). To have a nicer, cross-platform terminal interface, we can use:

- [`prompt_toolkit`](https://github.com/prompt-toolkit/python-prompt-toolkit)
    - Has the usual terminal shortcuts: up, down, reverse search `^r`.
    - Command history can be stored in a file so that it persists across runs.


## Conclusion

In this post, we introduced Boolean-Based Blind SQL injection, how it can be used to enumerate a database, and some optimisations and workarounds for exfiltrating data more reliably. We also explored some useful Python libraries to glue onto your project.

Automation and scripting can be a powerful time saver when the need exists. We identified a tedious task — brute forcing characters for possibly long strings — and followed up with incremental changes. Hopefully the reader has picked up a few tips on automation.


