---
---

There are different ways to look at types in programming languages.

1. They're descriptive. Types are used to annotate the properties of a variable and are meant as an indicator for other programmers. This is most common in dynamically-typed languages such as Python.
2. They're prescriptive. Types are strictly enforced and checked. They are meant to assert statements at compile-time which would otherwise lead to runtime errors. These are meant more for the compiler, rather than other programmers.

Among prescriptive languages, some type systems are more expressive such as {% tag "C++", "cpp" %}, {% tag "Rust" %}, {% tag "Scala" %} and {% tag "Haskell" %}.

In some languages, you can write {% tag "meta-programs", "metaprogramming" %} with types. This means you can write logic and programs all expressed through types and their components. Essentially, this means the compiler becomes an interpreter operating on types — which I think is pretty neat!
