---
title: MapleCTF 2023 – Mostly Harmless
description: Inheritance go brrrrrrrr...
tags:
 - reverse
 - python
 - types
 - mathematics
 - programming
usemathjax: true
thumbnail_src: 
---

This is a writeup on a Python reverse CTF challenge. Unlike conventional challenges, this makes use of Python’s underused type system.


## Description

> Some people consider type annotations to be useless. I consider everything _but_ type annotations redundant.

Author: [apropos](https://apropos.codes/)  
17/291 solves.

## Solve
What? A section titled "solve"? Already? What about the usual analysis and observations?

Usually I begin my writeups with an extensive analysis and observations section. But *Mostly Harmless* is one of those blursed challenges where those with strong guess-fu can solve it; but the challenge is so intellectually challenging and ***deep***, that to properly reverse (let alone understand) it would take ~~a PhD,~~ ~~years,~~ extra study post-CTF.

Still, let's explain some key insights:

<!-- - `output.py` contains a bunch of `class` declarations: these indicate subtype relationships. -->
- The final line of `output.py` is built by stacking input in a recursive fashion: `L_<INPUT[i]>[N[ L_<INPUT[i-1]>[N[ ... ]] ]]`.
- Thus, **characters are encoded by the `L_*` classes**.
- There are a bunch of `Q*_s*` classes, with indices from 1 to 71. (Probably symbols of the flag.)
- Any clue to the relationship between these symbols? Yes! We see interesting stuff from lines 320 to 459.
    ```python
    class QL_s29(Generic[T], L_n["N[QLW_s31[L_x[N[MR[N[T]]]]]]"]): ...
    #          │               │          │
    #          │               │          └── Next index
    #          │               └── Current letter
    #          └── Current index
    ```

And guess what? That's all we need! Just follow the indices like the white rabbit from Wonderland!

{% image "./assets/shocker.jpg", "post1 w-60" %}

### Script

The actual solve is rather simple and fits within 25 lines (including comments!).

```python
import re

# Extract the lines containing pointers(?)/relationships between letters.
with open('output.py') as f:
    lines = f.readlines()[319:458:2] # Skip every 2 lines, bc redundant info.

lookup = {}

# Parse and store the relationships in a lookup map.
for line in lines:
    m, c, n = re.findall(r'Q._s(\d+)[^ ]+, L_(\w).*.W_s(\d+)', line)[0]
    lookup[int(m)] = (int(n), c)

# Follow the pointers until we hit 71.
idx = 29
flag = ''
while idx != 71:
    idx, c = lookup[idx]
    flag += c

# Profit!
print(f'maple{{{flag}}}')
```

### Flag

{% details "Lé Flaggo" %}
```txt
maple{no_type_system_is_safe_from_pl_grads_with_too_much_time_on_their_hands}
```

C++ template metaprogramming reverse when?
{% enddetails %}

We're done. We got the flag. But my curious side wants to dig deeper.

So let's go deeper! The rest of this post attempts to dissect the type theory behind the challenge, starting from basic principles.

## Back to the Basics

### Classes

Classes are a fundamental concept in object-oriented programming that allow you to define objects with their own attributes (variables) and behaviours (methods/functions). They serve as blueprints or templates for creating instances of objects. With classes, we can create custom types.

{% alert "info" %}
From here on, *class* and *type* are interchangeable.
{% endalert %}

Here's an example:
```python
# Declare a new class called Challenge.
class Challenge:
    # Magic method called automatically when an instance is created.
    def __init__(self, title, description):
        print(f"Creating challenge {title}...")
        self.title = title
        self.description = description

# Create instance of our class.
chal = Challenge("Mostly Harmless", "A totally harmless reverse challenge abusing Python types.")
```

But for this post, we'll keep things simple and declare classes similar to how it's done in `output.py`. Let's not worry about `__init__` and `self` here.

```python
class Challenge: ...
```

Effectively, this line creates a new type that functionally does nothing. The `...` (ellipsis) usually denotes an empty implementation.

Classes can do a lot more, but for now this explanation suffices.

### Inheritance

Inheritance is a mechanism in {% abbr "OOP", "Object-Oriented Programming" %} that allows a class to inherit attributes and behaviour from another class. The new class is called a **subclass** or **derived class**, and the class being inherited from is called the **superclass** or **base class**.

```python
class Reverse(Challenge): ...
```

* Semantically, we create a subclass called `Reverse`. A `Reverse` is also a `Challenge`, but not inverse does not apply.
    ```python
    assert isinstance(Reverse(), Reverse) == True    # A Reverse is a Reverse. (Duh.)
    assert isinstance(Reverse(), Challenge) == True  # A Reverse is also a Challenge.
    assert isinstance(Challenge(), Reverse) == False # Not all Challenges are Reverse.
    ```
* Type-wise, it creates a relationship: `Reverse` is a **subtype** of `Challenge`. More on this later.

We can inherit multiple classes too:

```python
# Create a class for Python Reverse challenges.
class PythonReverse(Python, Reverse): ...
```

Mathematically, we denote inheritance with $A : B$.

### Typing

Python is a dynamically-typed language and does not offer type-checking out-of-the-box. This challenge uses the third-party tool `mypy` to type-check `output.py` (get it with `pip install mypy`).

```python
class Challenge: ...
class Reverse(Challenge): ...
class Web(Challenge): ...

x: Challenge = Challenge()
y: Challenge = Reverse()
z: Challenge = Web()
```

* We declare three classes: `Challenge`, `Reverse`, `Web`. The latter two are subtypes of `Challenge`.
* We then...
  * declare three variables `x`, `y`, `z`,
  * annotate them with `Challenge`, and
  * initiate them to instances of the classes we created.
  
The **type annotation** is a constraint we place on the variable.

When we run `mypy` on this file, the type-checker will:

* process the class declarations,
* register the subtyping relationships ($\texttt{Reverse} <: \texttt{Challenge}$, $\texttt{Web} <: \texttt{Challenge}$), and
* type-check the annotations and values.

{% alert "success" %}
$U <: T$ denotes "$U$ is a subtype of $T$". Likewise, $U :> T$ denotes "$U$ is a super type of $T$".

TODO Python Examples
{% endalert %}

The type-check passes if the values are subtypes of the annotations. This subtype property is great for [polymorphism](https://www.programiz.com/python-programming/polymorphism), and allows us to construct containers (lists, arrays, maps) in a concise and type-safe manner. Here's a simple example:

```python
from typing import *

class Challenge: ...
class Reverse(Challenge): ...
class Web(Challenge): ...

# Create a list of different challenges.
chals: List[Challenge] = [Reverse(), Reverse(), Web()]
```

### Invariance, Covariance, and Contravariance

Wow, big mathy terms.

We've seen how we can create subtypes and use polymorphism to handle containers of subtypes.

Now suppose, we want to display our list of challenges. We'll create a function `display()` which takes a list of challenges. But what if we specifically pass in a list of `Reverse` challenges?

```python

# Create a generic list type using an invariant type variable T.
T = TypeVar('T')
class MyList(Generic[T]): ...

def display(chals: MyList[Challenge]): ...

display(MyList[Reverse]())
# ERROR! Argument 1 to "display" has incompatible type "MyList[Reverse]"; expected "MyList[Challenge]"
```

(Note: for the sake of this section, I've used a custom `MyList` type instead of `typing.List`.)

Why did this error? Although `mypy` deduced that $\texttt{Reverse} <: \texttt{Challenge}$, it couldn't deduce that $\texttt{MyList[Reverse]} <: \texttt{MyList[Challenge]}$.

This is where covariance and contravariance come into play. With these two bad bois, we can derive further relationships on generic types. The two are similar, with a minor difference.

{% alert "note" %}
* Let $F[T]$ be a generic container with type parameter $T$.
* If $T$ is **covariant**, then $A <: B \iff F[A] <: F[B]$ for any type $A$, $B$.
* If $T$ is **contravariant**, then $A <: B \iff F[B] <: F[A]$ for any type $A$, $B$.^[You may be wondering how the heck is contravariance useful. Well, it's immensely useful for functions and [printers](https://docs.scala-lang.org/tour/variances.html#contravariance).] (Flips!)
* If $T$ is **invariant**, then $A = B \iff F[A] = F[B]$. No other subtyping relationships are derived. (This is the default!)
{% endalert %}

Hence, in the previous code example, we can fix the code by changing:

```python
T = TypeVar('T', covariant=True)
```

Now $\texttt{MyList[Reverse]} <: \texttt{MyList[Challenge]}$ and the program compiles.

## Python Type Hints are Turing Complete

We haven't even started digging through `output.py`! Thankfully, the challenge author linked a [paper][roth2022] for our perusal. I'll be following a much nicer [journal][roth2023] version though. It turns out that Python type hints are Turing Complete thanks to two characteristics: *contravariance* and *expansive-recursive inheritance*.

### Be a Subtype Checker

Back to the challenge. The program leverages the `mypy` type-checker (specifically, the subtyping system) to perform flag-checking. The last line of `output.py` asks an important question: **is `QRW_s29[L___TAPE_END__[N[...` a subtype of `E[E[Z]]`**???

{% alert "note" %}
* Such questions are also called ***subtype queries***.
* We use TODO squiggly to indicate steps in subtype resolution.
{% endalert %}

To answer this question, we need to understand two **subtyping rules** used by the type-checker:

1. **Rule 1: Super**. Substitute a type with its supertype.
    $$
    (C : D) \land (C[A] <: E[B]) \rightsquigarrow D[A] <: E[B]
    $$
    In English, if $C$ has a supertype $D$, we can "go up a level" to *search* for a match.
2. **Rule 2: Cancel**. Remove the outermost type from both sides of the query. (And flip, since all type parameters are assumed to be contravariant!)
    $$
    E[A] <: E[B] \rightsquigarrow B <: A
    $$
    This just comes from our definition of contravariance.

Let’s walk through an example.

TODO example

{% details "Expansive-Recursive Inheritance" %}
We mentioned earlier how Expansive-Recursive Inheritance is a pre-requisite to Turing-complete subtyping machinery. This isn’t directly relevant to the challenge, but I won’t leave you PL aficionados in the dark here. :)

The fun part is that we can write subtyping programs which recurse infinitely, and these programs are *undecidable*, i.e. the type-checker can't verify $A$ is a subtype of some $B$. Here's an example included in §2 of the [journal paper][roth2023]:

```python
from typing import TypeVar , Generic , Any
z = TypeVar("z", contravariant = True )
class N(Generic[z]): ...
x = TypeVar("x")
class C(Generic[x], N[N["C[C[x]]"]]): ...
class T: ...
class U: ...
_: N[C[U]] = C[T]() # CT <: NCU ✗ infinite subtyping
```

We then follow a chain of subtyping derivations:

TODO: derive/copy
{% enddetails %}

[roth2022]: https://arxiv.org/pdf/2208.14755.pdf
[roth2023]: https://drops.dagstuhl.de/opus/volltexte/2023/18237/pdf/LIPIcs-ECOOP-2023-44.pdf


### Subtype Machines




