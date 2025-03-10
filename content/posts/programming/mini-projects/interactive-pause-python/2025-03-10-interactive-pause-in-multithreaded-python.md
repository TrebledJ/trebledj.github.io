---
title: Delay and Interactive Pause in Multi-Threaded Python
excerpt: It's like musical chairs for threads (except no one gets left behind)!
tags:
  - python
  - tutorial
  - infosec
  - pentesting
thumbnail_src: assets/thumbnail.jpg
thumbnail_banner: true
keywords: [threading, Event, threading.Event, signal, asyncio, multiprocessing, multithreading, concurrent.futures, ThreadPoolExecutor, ProcessPoolExecutor, pause, pausing, sleep, delay]
---

Scanning the internet is not trivial, but Python excels at such network I/O tasks thanks to its simplicity and its vast ecosystem of libraries. Still, when dealing with the internet, it’s not uncommon to encounter rate-limited endpoints and strongly firewalled sites. For penetration testing and red-teaming, opsec is also an important consideration. This means features such as delay and interactive pause are crucial — I'd even say desirable — to ensuring success and low false positives.

- **Delay** (or throttling) allows us to rate-limit requests fired below the 1-thread threshold.
- **Interactive Pause** allows the user to adapt to changing circumstances. These include situations such as sudden network congestion leading to increased response time, {% abbr "WAFs", "Web Application Firewalls" %} kicking in due to excessive requests, local network failures, and sudden drops in bandwidth.^[ [feroxbuster](https://github.com/epi052/feroxbuster), a popular pentesting tool, has interactive pause for runtime addition of filters and pruning of exploration paths. Quite useful for reducing false positives and saving time!]

In this post, I’ll be sharing how delay and interactive pause can be added to multithreaded Python scripts to enhance flexibility without compromising functionality.

Our objective is to pause the script when the user hits Ctrl+C, enter an interactive menu, then resume when “c” or “continue” is entered. We'll accomplish this with Python's pre-packaged `threading.Event` and `signal` libraries. (No additional dependencies!)

{% image "assets/interactive-pause-plan.png", "jw-80 alpha-imgv", "Diagram of UI flow when pausing and resuming." %}

<sup>Note: the first ***"Running"*** box extends slightly to the right, because threads may still be working even after Ctrl+C is hit. For instance, waiting for a response from an HTTP server.</sup>
{.caption}

## A Tale of Two Scripts

To best demonstrate the addition of our desired features, I'll be presenting two scripts, a "before" and "after". I'll then highlight and explain the changes.

1. The "before" is a very basic multithreading script. No delay and pause.
2. The "after" is a robust working example of multithreading with delay and pause.

I’ll be demonstrating with Python threads via `concurrent.futures.ThreadPoolExecutor`. Python offers two other concurrency primitives: processes (`multiprocessing` / `ProcessPoolExecutor`) and green threads (`asyncio`). We won't discuss those today, but the gist is similar!

### Basic Script

{% video "assets/demo1.mp4", "jw-80" %}

<sup>A simple script. The user has barely any control over the execution flow aside from parameters. Sufficient for straightforward scripts though.</sup>
{.caption}

```python {data-label=mt_basic.py}
import concurrent.futures
from time import sleep


def thread_do_stuff():
    sleep(3)

def thread_function(i):
    print(f"[thread] task started {i}")
    thread_do_stuff() # Simulate an IO task, e.g. requests.get().

def main():
    # Start an executor with 2 threads and 10 tasks.
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
        not_done = []
        for i in range(10):
            f = executor.submit(thread_function, i)
            not_done.append(f)
        
        while True:
            # Process results while waiting.
            done, not_done = concurrent.futures.wait(not_done, timeout=0.1)
            for future in done:
                # Handle thread result.
                try:
                    future.result()
                except Exception as e:
                    print(e)
                
            if len(not_done) == 0:
                print('[main] Finished all tasks!')
                return

if __name__ == '__main__':
    main()
```

### Fancy Script

{% video "assets/demo2.mp4", "jw-80" %}

<sup>Similar to the previous script, but includes a small delay between tasks and two interactive pauses. The first pause occurs while the worker threads are *running `event.wait()`*, instantly responding with "Interrupt detected". The second pause occurs while they are *working* (which we assume is some blocking operation, like `requests.get()`), and the interrupt won't be detected until the next task.</sup>
{.caption}

```python { data-label=mt_with_delay_and_pause.py  data-diff }
import concurrent.futures
# +++++
import signal
from threading import Event
# +++++
from time import sleep

# +++++
# Create global events which will be used across main and worker threads.
pause_evt = Event()
resume_evt = Event()
quit_evt = Event()
# quit_evt can be a global bool variable too, since single write, multiple read
# is thread-safe.

# Handle incoming Ctrl+C with `signal`.
def handle_int_signal(signo, _frame):
    resume_evt.clear()
    pause_evt.set()

# Save the original signal so that we can restore it later.
py_int_signal = signal.getsignal(signal.SIGINT)
signal.signal(signal.SIGINT, handle_int_signal)

def enable_py_signal():
    signal.signal(signal.SIGINT, py_int_signal)

def enable_custom_signal():
    signal.signal(signal.SIGINT, handle_int_signal)

# Create a custom "sleep" function which uses events under the hood.
def thread_delay(sec):
    if pause_evt.wait(sec):
        print('[thread] Interrupt detected, waiting for resume.')
        resume_evt.wait() # Block until resume is triggered.
        if quit_evt.is_set(): # Indicate quit preference with a flag.
            print('[thread] Resumed, but still interrupted. Exiting thread.')
            raise RuntimeError('interrupt')
        else:
            print('[thread] Resuming...')
# +++++

def thread_do_stuff():
    sleep(3)

def thread_function(i):
    # +++++
    print(f"[thread] task waiting {i}")
    thread_delay(1) # Delay between tasks using threading.Event.
    # +++++
    print(f"[thread] task started {i}")
    thread_do_stuff() # Simulate an IO task, e.g. requests.get().

# +++++
# A simple interactive menu to display during the paused state!
# Return True -> continue program. Return False -> quit.
def main_pause_menu():
    while 1:
        try:
            x = input('Do you want to continue? [y/n] ').lower()
        except (KeyboardInterrupt, EOFError) as e:
            # Treat Ctrl+C and Ctrl+D as "no".
            print(f'Got {e.__class__.__name__}. Quitting...')
            return False
        
        if x == 'y':
            return True
        elif x == 'n':
            return False
# +++++

def main():
    # Start an executor with 2 threads and 8 tasks.
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
        not_done = []
        for i in range(8):
            f = executor.submit(thread_function, i)
            not_done.append(f)
        
        while True:
            # +++++
            enable_custom_signal()
            while not pause_evt.is_set():
                # Process results while waiting. The processing shouldn't take
                # too long in order for the pause menu to show responsively
                # after Ctrl+C is hit.
                # +++++
                done, not_done = concurrent.futures.wait(not_done, timeout=0.1)
                for future in done:
                    # Handle thread result.
                    try:
                        future.result()
                    except Exception as e:
                        print(e)
                    
                if len(not_done) == 0:
                    print('[main] Finished all tasks!')
                    return

            # +++++
            print('[main] Triggered interrupt.')
            enable_py_signal()
            
            # Handle pause menu/input.
            cont = main_pause_menu()
                
            if cont:
                # Continue jobs.
                quit_evt.clear()
            else:
                # Cancel pending jobs.
                print('[main] Shutting down...')
                executor.shutdown(wait=False, cancel_futures=True)
                quit_evt.set()
                print('[main] Finished shutdown.')
            
            pause_evt.clear()
            resume_evt.set() # Signal remaining threads to resume (and possibly quit).
            if not cont:
                break
            # +++++

if __name__ == '__main__':
    main()
```


## The Magic

So what voodoo did we add into the second script? It all comes down to `threading.Event`, signals, and some extra flair.

### threading.Event

`Event` is a Python class from the `threading` library. As the [Python documentation](https://docs.python.org/3/library/threading.html#event-objects) puts it:

> This is one of the simplest mechanisms for communication between threads: **one thread signals** an event and **other threads wait** for it. An event object manages an internal flag that can be set to true with the [`set()`](https://docs.python.org/3/library/threading.html#threading.Event.set) method and reset to false with the [`clear()`](https://docs.python.org/3/library/threading.html#threading.Event.clear) method. The [`wait()`](https://docs.python.org/3/library/threading.html#threading.Event.wait) method blocks until the flag is true.

This is what we call a **binary semaphore**. It’s binary because it represents two states (set or not set). It’s a semaphore because it’s a thread-safe signalling mechanism. (In the past, semaphores were visual cues used to communicate over a distance.)

To demonstrate why they're so useful consider the following toy functions:

```python
import time, threading

def foo():
    time.sleep(5)
    print('done: foo')

event = threading.Event()
def bar():
    event.wait(5)
    print('done: bar')
```

What's the difference?

| `time.sleep()`         | `event.wait()`  |
| ---------------------- | --------------- |
| Blocks for a duration. | Blocks for a duration, but returns instantly when signalled with `event.set()`. If no parameter is passed, waits indefinitely. |

For simple delays, `time.sleep` is good enough. But when responsiveness and multithreaded synchronisation are needed, `Event` becomes much more appealing. If we add some code to the second example, it's clear that `event.wait` is a superior sleep-like function, simply because we can control ***when*** that `sleep` finishes, across multiple threads.^[Of course, it's possible to do the same with `time.sleep` by breaking the sleep into smaller pieces and looping. In fact, Python 2's implementation of `event.wait()` was exactly like that — a while loop calling `time.sleep` with tiny intervals. This turned out to be inefficient (by acquiring the GIL repeatedly) and caused a few bugs. In Python 3, `event.wait()` is properly implemented in C with interrupts! Check out this [SO answer](https://stackoverflow.com/a/29082411) for more gory details.]

```python
threading.Thread(target=foo).start()
threading.Thread(target=bar).start()
time.sleep(1) # do something...
event.set()   # 'done: bar' printed instantly after
```

---

Back to our "after" script. You'll notice we used not one, not two, but *three* events. In the thread, we introduce a new kind of sleep function: `thread_delay`.

```python
pause_evt = Event()
resume_evt = Event()
quit_evt = Event()

# -- snip -- 

def thread_delay(sec):
    if pause_evt.wait(sec):
        print('[thread] Interrupt detected, waiting for resume.')
        resume_evt.wait()
        if quit_evt.is_set():
            print('[thread] Resumed, but still interrupted. Exiting thread.')
            raise RuntimeError('interrupt')
        else:
            print('[thread] Resuming...')
            pass
```

- `pause_evt` - This is the event responsible for sleeping. If `pause_evt` is set when `pause_evt.wait(sec)` is running, it will return `True` and enter the "paused state". Otherwise, `.wait(sec)` eventually times out and returns `False`.
- `resume_evt` - Since we want our threads to stop running completely during interactive pause, we need to block and wait for another signal. Thus, a second event. Notice `resume_evt.wait()` doesn't take a parameter, so it waits indefinitely.
- `quit_evt` - This is an additional feature I added to allow gracefully exiting the thread. The "protocol" I came up with is:
    - If `resume_evt` is set and `quit_evt` is set → quit the program by throwing an error to exit the thread.
    - If `resume_evt` is set and `quit_evt` is cleared → continue running.
    - This doesn't need to be an event. It could just as well be a variable, since single writes and multiple reads are thread-safe.

Let's now take a look at the modified code in `main()`.

```python
while True:
    # ...
    while not pause_evt.is_set():
        ... # handle results...
        
    # -- snip --
    
    # Handle pause menu/input.
    cont = main_pause_menu()
        
    if cont: # Continue
        quit_evt.clear()
    else: # Quit
        print('[main] Shutting down...')
        executor.shutdown(wait=False, cancel_futures=True)
        quit_evt.set()
        print('[main] Finished shutdown.')
    
    pause_evt.clear()
    resume_evt.set() # Signal remaining threads to resume (and possibly quit).
    if not cont:
        break
```

The logic here is somewhat simple:

- If `pause_evt` *is not* set, handle finished results.
- If `pause_evt` *is* set, enter the pause menu.
- *User inputs whether to continue or quit.*
- The rest of the code fulfils the "protocol" outlined earlier.
    - To continue: clear `quit_evt`.
    - To quit: set `quit_evt`. (Plus cancel pending jobs.)
    - Then set `resume_evt` to signal worker threads to venture forth!

### Handling Ctrl+C with signal

By default, when Python receives Ctrl+C, a callback runs which raises `KeyboardInterrupt`. In major operating systems, Ctrl+C sends a SIGINT (i.e. signal interrupt) to programs.

To customise Ctrl+C behaviour, we can set a callback with `signal.signal`. In our case, our customisation will pause threads by calling `pause_evt.set()`. We'll save the original signal so that we can restore normal Ctrl+C behaviour when threads are paused or finished.

```python
# Set custom handler...
def handle_int_signal(signo, _frame):
    resume_evt.clear()
    pause_evt.set()

py_int_signal = signal.getsignal(signal.SIGINT)
signal.signal(signal.SIGINT, handle_int_signal)

def enable_py_signal():
    signal.signal(signal.SIGINT, py_int_signal)

def enable_custom_signal():
    signal.signal(signal.SIGINT, handle_int_signal)
```

In `main()`, we wrap our result-handling code with `enable_custom_signal()` and `enable_py_signal()`:

```python
# When running threads...
while True:
    enable_custom_signal()
    # -- snip -- Wait for Ctrl+C signal to pause threads...
    enable_py_signal()
    # -- snip -- Show pause menu + handle events...
```

Truth be told, I couldn't figure out how to get arbitrary keystrokes in an `event.wait`-esque manner (i.e. with a timeout). The easiest solution was to just use Ctrl+C. A bit limited, but I'm happy with it.

### Write a Pause Menu

If you learned programming before generative AI replaced tutorials, diligence, and self-worth, chances are your first program was a simple interactive I/O. Read input; spit it back out. Our simple menu will go back to those nostalgic first days of programming.

```python
# A simple interactive menu to display during the paused state!
# Return True -> continue program. Return False -> quit.
def main_pause_menu():
    print('Elsa?')
    while 1:
        try:
            x = input('Do you want to build a snowman? [y/n] ').lower()
        except (KeyboardInterrupt, EOFError) as e:
            # Treat Ctrl+C and Ctrl+D as "no".
            print(f'Got {e.__class__.__name__}. You don\'t have to be thaat rude. :(')
            return False
        
        if x == 'y':
            return True
        elif x == 'n':
            print('Okay, byeeeee.')
            return False
```

## Conclusion

To show ~~off~~ this potential in an interactive tool, here's a short clip where I integrated the techniques here into my [nifty little SQL injection automation](https://github.com/TrebledJ/bsqli.py) (for ethical hacking purposes).

{% video "assets/demo3.mp4", "jw-100" %}

<sup>On the left panel, we seamlessly execute various commands, pausing twice with Ctrl+C, with the option of configuring the delay, timeout, and log level. An updated version allows toggling the proxy!</sup>
{.caption}

This post demonstrated how to add interactive pausing to your multithreaded Python script with zero additional dependencies. Despite the simplicity, there are a few other things to explore that we haven't discussed:

- **Pausing with processes or asyncio.** Each of these has their own Event objects. Processes have [`multiprocessing.Event`](https://docs.python.org/3/library/multiprocessing.html#multiprocessing.Event). asyncio has [asyncio.Event](https://docs.python.org/3/library/asyncio-sync.html#event). These are also worth exploring.
- **Trigger pause with an arbitrary key.** Instead of relying on Ctrl+C and SIGINT, is it possible to listen for arbitrary keys and pause with them? This seems difficult to implement without additional dependencies and may require native API wrangling (see the `keyboard` package).
    - It is possible to capture input on a separate thread with `getch` implementations ([see here](https://stackoverflow.com/q/510357/10239789)). This blocks while waiting for input. However, issues arise when considering other UX aspects.
    - What if the user presses Ctrl+C? SIGINT (and signals, in general) are [always executed in the main thread](https://docs.python.org/3/library/signal.html).
    - What if the processing finishes without the user entering input? The thread receiving input would need to be killed.
- **Off-by-One Delay.** Currently, our execution is **delay** → **work** → **delay** → **work**, but the first delay isn't actually needed. This should be fairly trivial to fix, but I decided to leave it out from the example to avoid overcomplication. Exercise for the reader and all that.

<a id="logical-end-of-article"></a>

### tl;dr

- Use `threading.Event` to synchronise events (e.g. pause) and sleep.
    - Use three events: one to signal pause, one to signal resume, and one to indicate resume or quit.
    - Write a `delay()` function which calls `pause_event.wait(SLEEP_SEC)`.
- Use `signal.signal` to customise Ctrl+C (which triggers SIGINT). The handler should call `pause_event.set()`.
- Adjust the environment before and after the pause menu, such as temporarily restoring Python's SIGINT handler.

### References

- [SO: Python time.sleep() vs event.wait()](https://stackoverflow.com/a/29082411) (goes into low level implementation deets)
- [Python 3 Docs: threading.Event](https://docs.python.org/3/library/threading.html#event-objects)  (very simple and clear docs)
- [Python 3 Docs: signal](https://docs.python.org/3/library/signal.html)
- [Python 3 Docs: concurrent.futures](https://docs.python.org/3/library/concurrent.futures.html)


## Appendix

### Appendix A: Bonus - rich.progress

If you're using `rich.progress` to liven up your UI, you may find the live progress bar conflicts with our custom pause menu. To disable the live progress, you can manually adjust the class members before entering the pause menu in `main()`:

```python { data-diff }
# +++++
# Disable live progress.
# prog is an instance of rich.progress.Progress.
prog.update(prog.task_ids[0], visible=False, refresh=True)
prog.disable = True
prog.live.auto_refresh = False
is_interactive = prog.live.console.is_interactive
prog.live.console.is_interactive = False
# +++++

cont = main_pause_menu()
# -- snip --
resume_evt.set()

# +++++
# Re-enable live progress...
prog.live.console.is_interactive = is_interactive
prog.live.auto_refresh = True
prog.disable = False
prog.update(prog.task_ids[0], visible=True, refresh=True)
# +++++

if cont:
    break
```

This is very hacky, because the properties aren't documented and could potentially change, but it works pretty well.

### Appendix B: Handling Future Results

AFAIK, there are three main ways of handling future results from `concurrent.futures`. Keep in mind some approaches may be better for your script.

1. `concurrent.futures.wait`. Polls and partitions an iterable of futures into `done` and `not_done` sets. Does not block main thread when `timeout` is specified. Result handling runs in main thread.
   
   For the "other stuff" to run responsively, the `timeout` parameter in `concurrent.futures.wait()` should be relatively small, and the result handling shouldn't take too long.
    ```python
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
        not_done = []
        for i in range(10):
            f = executor.submit(thread_function, i)
            not_done.append(f)
        
        while True:
            # Process results while waiting.
            done, not_done = concurrent.futures.wait(not_done, timeout=0.5)
            for future in done:
                # Handle thread result.
                try:
                    future.result()
                except Exception as e:
                    print(e)
                
            if len(not_done) == 0:
                print('[main] Finished all tasks!')
                return
            
            # Do other stuff...
    ```
2. `concurrent.futures.as_completed`. This returns an iterable of completed futures. Blocks main thread. Result handling runs in main thread.
   
   This is **not** a reliable way to integrate with the flow demonstrated in this post.
    ```python
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
        futures = []
        for i in range(8):
            f = executor.submit(thread_function, i)
            futures.append(f)
        
        for f in concurrent.futures.as_completed(futures):
            try:
                f.result()
            except Exception as e:
                print(e)

            # Do other stuff? Not necessarily consistent or responsive though.
    ```
3. `future.add_done_callback()`. This fires a callback upon completion of each future. Does not block main thread. Result handling may not run in main thread.

    Probably the "cleanest" way to integrate with the flow demonstrated in this post, unless you handle `future.result()` in a non-thread-safe manner, in which case... beware race conditions.
    ```python
    def callback(f):
        try:
            print(f.result())
        except Exception as e:
            print(e)
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
        futures = []
        for i in range(8):
            f = executor.submit(thread_function, i)
            f.add_done_callback(callback)
            futures.append(f)
        
        # Results get handled in the background!
        # Do other stuff...
    ```


