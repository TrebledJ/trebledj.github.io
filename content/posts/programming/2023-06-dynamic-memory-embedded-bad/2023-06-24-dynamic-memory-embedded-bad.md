---
title: "Why Dynamic Memory Allocation Bad (for Embedded)"
description: "If you need flexibility and can afford it, use dynamic memory. If you can’t afford it, use static."
tags:
 - embedded
 - c
 - cpp
 - software-engineering
thumbnail: assets/dynamic-memory-1.jpg
# include_thumbnail: true
usemathjax: true
related:
    auto: true
---

{% image "assets/dynamic-memory-1.jpg", "'Memory management is not my concern.' - Clueless Embedded Engineers.", "post1 w-80" %}

<sup>Getting better hardware is not always the solution. Sometimes; but not always.</sup>
{.caption}


I keep explaining why dynamically allocating on embedded systems is a disagreeable idea, so thought I’d throw it on a post. This is a confusing topic for many junior developers who were taught to use `new` and `delete` in early C++ courses. And the backlash is always—why? In desktop/web application programming, dynamic allocation is everywhere.^[Even if you don’t use it directly, it’s still there. Most garbage-collected languages (think Java, JS, Python) will allocate primitives on the stack, and all other objects on the heap.] Not so in embedded.

{% image "assets/dynamic-memory-2.jpg", "Ooooh, dynamic memory—fancy!", "post1 w-80" %}

It's not just allocation which is an issue. Virtual classes, exceptions, runtime type information (RTTI)—these are all no-nos for some embedded companies. They're all avoided for the same reasons: performance degradation and code bloat. In essence, not enough time and not enough space. With dynamic memory, there's another reason.

### So why is dynamic memory bad?

Because of **Memory Fragmentation**. This occurs when we keep allocating and deallocating memory in various sizes. This may lead to wasted memory, leading to slower allocations (due to the need to reallocate and compact memory) or our worst nightmare: an out-of-memory exception. 🤯

{% image "assets/memory-fragmentation.jpg", "Memory is fragmented, like buildings with alleys in between, where rats and other vermin fester.", "post1" %}

<sup>Memory becomes fragmented after multiple allocs and deallocs, leading to wasted memory space. ([source](https://er.yuvayana.org/memory-fragmentation-in-operating-system/))</sup>
{.caption}

Since embedded systems tend to require sustained uptime (think 1 year), constantly using dynamic memory may lead to highly fragmented memory.

This is a serious issue. Persistence, backup, and resets should be considered when developing embedded applications, but buggy resets—say, due to {% abbr "OOM", "out-of-memory" %} crashes—should be avoided.

### What alternatives are there?

In C, dynamic memory is largely optional.

In C++, it's more of a hassle. Dynamic memory allocation is core to many standard library containers: strings, vectors, maps. The Arduino `String` also uses dynamic memory. No doubt, these libraries are immensely useful for organising and manipulating data.

The alternative is to use **static allocation**, by providing a maximum bound to our array sizes. This is what ETL containers achieve, as opposed to STL containers.

{% alert "success" %}
The [ETL](https://github.com/ETLCPP/etl) (Embedded Template Library) is an alternative to the C++ standard library, and contains many standard features plus libraries useful for embedded systems programming (e.g. circular buffers).

```cpp
// STL
// Allocate a dynamic vector (on the heap). Capacity grows on-demand.
std::vector<int> vec1 = {1,2,3};

// ETL
// Allocate a static vector (on the stack) with fixed capacity.
etl::vector<int, 10> vec2 = {1,2,3};
```
{% endalert %}

One benefit of static allocation is speed. With *dynamic*, allocators need to figure out size constraints and reallocate. If the allocator is good, it may save time by reusing a previously freed bin; but this still consumes time. With *static*, memory is either pre-allocated (in the case of global variables) or allocated with a single instruction (subtracting the stack pointer).^[And if your function uses multiple statically-allocated variables, the allocation will be combined in one *giant* stack subtraction. You can thank your compiler for this static bonus.] Hence, more performance at the expense of flexibility.

Dynamic allocation isn't bad in all cases, if used properly. Some exceptions are:

- You only allocate during init. For example, we want to allocate memory based on a setting from a config file, and that setting barely changes throughout runtime.
- It's difficult to decide on a maximum bound. To quote a [Reddit comment](https://www.reddit.com/r/embedded/comments/8rc2vz/comment/e0qmr9s):
    
    > Since networking like what [ESP32] IDF is used in is so extremely variable in data sizes, it's impossible to predict memory usage up front. Furthermore, networking is extremely not hard real time compatible, especially wireless. All these combined relax the constraints and allow the usage of malloc.


{% alert "fact" %}
What about polymorphism? With dynamic polymorphism, the alternative is—guess what—static polymorphism! This can be achieved via [CRTP](https://en.wikipedia.org/wiki/Curiously_recurring_template_pattern#Static_polymorphism); but keep in mind this loses the ability to have a generic container (e.g. `vector<Animal*>`, `vector<Shape*>`). Sometimes virtual classes are a necessary ~~evil~~ abstraction.
{% endalert %}

Thus, it’s crucial to consider the design requirements of the software being developed. How long do the strings need to be? Can they be limited to maximum length? How many items will our vector hold at most? Is it more maintainable to use virtual classes here?

### Summary

In a recent discussion between Uncle Bob and Casey Muratori on clean code and performance, Bob summaries:

> Switch statements have their place. Dynamic polymorphism has its place. **Dynamic things are more flexible than static things, so when you want that flexibility, and you can afford it, go dynamic. If you can't afford it, stay static.**

<sup>([source](https://github.com/unclebob/cmuratori-discussion/blob/main/programmer-cycles-vs-machine-cycles.md); emphasis mine)</sup>

This applies to embedded system memory as well. It’s difficult to afford dynamic things with few resources. With more powerful MCUs, it’s easier to justify dynamic things—heap, polymorphism. In the end, we should consider the available resources, design requirements, and use cases, and decide accordingly. Let me resummarise. *If you **need** flexibility and can afford it, use dynamic memory. If you can’t afford it, use static.*^[The distinction between *want* and *need* is small, but IMO important when programming for embedded systems. Sometimes, we may *want* to use the heap, but it's not needed. Other times, we may *need* the flexibility of the heap since the benefits outweigh the costs.]
