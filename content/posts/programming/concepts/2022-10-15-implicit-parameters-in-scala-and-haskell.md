---
title: Implicit Parameters in Scala and Haskell
excerpt: ...and also C++ (kinda).
tags:
  - tutorial
  - programming-languages
  - scala
  - haskell
  - cpp
thumbnail_src: assets/implicits-thumbnail.jpg
related:
  tags: [programming]
---

> *Do not say a little in many words, but a great deal in a few.*  
>  – Pythagoras

## What the heck are implicit parameters?

In software engineering, the [Don’t Repeat Yourself](https://en.m.wikipedia.org/wiki/Don't_repeat_yourself) principle is one of the foundations of writing modular programs. **Implicit parameters** (implicits, for short) are one of those language features which hide repetitive code so that developers can focus on the more important aspects of logic. Not all programming languages have implicit parameters; but those that do provide an extra mechanism to deal with repetitive code.

Both Scala and Haskell have the notion of implicit parameters. In Scala, it’s a built-in feature; whereas in Haskell, it’s a language extension. An even more important distinction is that in Scala, implicit variables bind by *type*, whereas in Haskell, they bind by *name*. We'll take a look at these in more detail.

### ...in Scala
Let's take a look at what implicit parameters look like in Scala.

```scala
// Example of using implicit.
def func(x: Int)(implicit s: String) =
  println(s"string: $s;  int: $x")

// Helper function to run a bunch of SQL statements and return the dataframe results.
def runBatch(sqls: Seq[String])(implicit spark: SparkSession): Dataframe =
  sqls map spark.sql

def main = {
  implicit val str: String = "abc" // Mark variable with the implicit keyword.
  // implicit val str2: String = "def" // Conflict! Two possible implicits of the same type. Error will occur.

  // Notice str is passed implicitly!
  func(1)  // string: abc;  int: 1
  func(42) // string: abc;  int: 42
  func(1)(str) // Same as above.
  func(42)(str)

  // Create a SparkSession object and mark it as implicit.
  implicit val spark: SparkSession = SparkSession.builder.master("local").getOrCreate
  val dfs = runBatch(Seq(
    "SELECT 1",
    "SELECT 2",
  )) // `spark` passed implicitly.
}
```

<sup>([Demo](https://scastie.scala-lang.org/59m4Fd8LRFmDHNQmfRt3XQ))</sup>

As shown above, implicit params are coded by introducing a new set of parameters (in fact, this is how currying is achieved in Scala). In Scala, implicit variables require the `implicit` keyword. This serves as a flag to the compiler saying “this variable can be passed to functions with implicit parameters”. (Well, not exactly, but you get the idea.)

This is pretty useful for variables that have a single instance in any context and act like a global variable. In the Spark framework, a `SparkSession` is used to configure spark options, memory usage, and more. After configuration, we still want to hold onto the returned object in order to call functions such as `spark.sql`. Typically, we would only have one `SparkSession` in an application, so it makes sense to pass it to helper functions implicitly.

{% alert "warning" %}
One gotcha is that Scala searches the calling context for implicit parameters of a *matching type*. The variable name does not matter. Scala implicits are actually [a tad more complicated][scala-implicits-where] (and much more powerful as a result), so my example here doesn’t do it justice.
{% endalert %}

### ...in Haskell
Haskell’s implicit parameters are different. Here’s an example:

```haskell
{-# LANGUAGE ImplicitParams #-} -- Enable the implicit parameters language extension.

import Data.Function (on)

-- Declare a generic sort function which takes a comparator.
sortBy :: (a -> a -> Ordering) -> [a] -> [a]
sortBy _ [] = []
sortBy cmp (p:xs) = -- Quickly hacked quick sort.
    sortBy cmp (filter ((== GT) . cmp p) xs) 
    ++ [p] 
    ++ sortBy cmp (filter ((/= GT) . cmp p) xs) 

-- Declare a sort function to sort a list.
sort :: (?cmp :: a -> a -> Ordering) => [a] -> [a]
sort = sortBy ?cmp

main :: IO ()
main = do
    let xs = [(1, 42), (5, 8), (10, 4), (3, 14), (15, 92)]
    let ?cmp = compare `on` fst -- Haskell idiom for constructing comparators.
    
    -- All equivalent: [(1,42),(3,14),(5,8),(10,4),(15,92)]
    print $ sortBy (compare `on` fst) xs    -- Explicit.
    print $ sortBy ?cmp xs                  -- Explicit.
    print $ sort xs                         -- Implicit.
    
    -- Change comparator. [(15,92),(1,42),(3,14),(5,8),(10,4)]
    let ?cmp = compare `on` (negate . snd)
    print $ sortBy ?cmp xs                  -- Explicit.
    print $ sort xs                         -- Implicit.
    
    let ?cmp2 = compare `on` snd
    print $ sortBy ?cmp2 xs
    print $ sort xs -- Which one is implicitly passed? `cmp` or `cmp2`? :)
    
    return ()
```

<sup>([Demo](https://onlinegdb.com/S4N7sxFFz))</sup>

Note that implicit variables in Haskell need to be indicated with a question mark, similar to the `implicit` keyword in Scala. `?cmp` is an implicit variable, but `cmp` isn’t. However, unlike Scala, the implicit parameters here are specified in the function’s type signature. And not just that, it’s written in the function’s type constraints.

In Haskell, functions type signatures are placed on a separate line. For example, `sortBy` has the signature `(a -> a -> Ordering) -> [a] -> [a]`, meaning it takes a function (in this case, a comparator) which itself takes two generic `a`'s, a list of `a`'s, and returns a list of `a`'s. (This is not what actually happens under the hood, but it’s good enough for now.) On the other hand, `sort`'s type signature looks a little different:

```haskell
sort :: (?cmp :: a -> a -> Ordering) => [a] -> [a]
```

{% alert "fact" %}
In a Haskell type signature, stuff on the left of `=>` are type constraints; here we have `?cmp :: a -> a -> Ordering`. Although somewhat unintuitive, this leverages Haskell’s existing type system so that implicit parameters are automatically propagated. So if another function calls `sort` without a `?cmp`, then that function will also have `?cmp :: a -> a -> Ordering` in its type constraint!
{% endalert %}

On a different note, an important distinction is that instead of searching for variables with a matching type (as in Scala), Haskell searches for variables with the ***same name***. In a way, this behaves like C/C++ macros, but with type safety. Compare the Haskell example to this C++ example:

```cpp
#include <algorithm>
#include <iostream>
#include <vector>

using namespace std; // Bad practice, but just to keep things readable.

// Generic sort with comparator.
template <typename F, typename T>
T sortBy(F cmp, T xs) {
    sort(xs.begin(), xs.end(), cmp);
    return xs;
};

// Sort with implicit comparator. We name it with an underscore to avoid confusion with std::sort.
// Note how `xs` is substituted with the parameter, but `cmp` is "implicitly" used.
#define sort_(xs) sortBy(cmp, xs)

// Helper function.
void print(const vector<pair<int, int>>& xs) {
    for (const auto& [a, b] : xs)
        cout << " (" << a << ", " << b << ")";
    cout << "\n";
};

int main() {
    auto xs = vector<pair<int, int>>{ {1, 42}, {5, 8}, {10, 4}, {3, 14}, {15, 92} };
    
    { //  (1, 42) (3, 14) (5, 8) (10, 4) (15, 92)
        auto cmp = [](auto pa, auto pb) { return pa.first < pb.first; };
        print(sortBy(cmp, xs));
        print(sort_(xs)); // Expanded to `print(sortBy(cmp, xs));`.
    }
     
    { //  (15, 92) (1, 42) (3, 14) (5, 8) (10, 4)
        auto cmp = [](auto pa, auto pb) { return pa.second > pb.second; };
        print(sort_(xs)); // Same expansion happens here.
    }
}
```

<sup>([Demo](https://onlinegdb.com/qII0Pq54O))</sup>

This example irks me since it uses macros, so it's a bit hacky... too hacky for my tastes.

## Abuse of Implicits

Although implicit params remove the need to explicitly state params, there is also the danger of hiding too much. This may lead to code being harder to trace and debug, and hence may cause confusion among team members.

{% image "assets/implicits.jpg", "w-45", "Elmo abusing implicits. Don't be Elmo!" %}

The similarity with natural languages is striking. Sometimes ambiguity may arise when people conversing don’t have sufficient context. Or misunderstanding may arise when people come from different cultures.

{% alert "warning" %}
Coming back to software engineering, implicits are best reserved for extremely common variables and unique types. Think twice before slapping `implicit` or a question mark in your code. You’ll thank yourself later.
{% endalert %}

Further Reading:

- [Tour of Book: Implicit Parameters](https://docs.scala-lang.org/tour/implicit-parameters.html)
- [Where does Scala look for implicits?][scala-implicits-where]
- [GHC Language Extensions: Implicit Parameters](https://ghc.gitlab.haskell.org/ghc/doc/users_guide/exts/implicit_parameters.html)
- [Implicit Parameters: Dynamic Scoping with Static Types](https://galois.com/wp-content/uploads/2014/08/pub_JL_ImplicitParameters.pdf): Basis for implicit params in Haskell. Good academic foundation and examples.

[scala-implicits-where]: https://stackoverflow.com/questions/5598085/where-does-scala-look-for-implicits/5598107#5598107