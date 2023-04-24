---
title: "The Mathematics of Types"
description: "*Any fool can write code that a computer can understand. Good programmers write code that humans can understand.* – Martin Fowler"
tags:
 - mathematics
 - haskell
thumbnail: /img/posts/misc/abstract.jpg
# include_thumbnail: true
usemathjax: true
related:
    auto: true
---

Algebraic data types (ADTs) encompass a wide range of types commonly used in our day-to-day tasks. Over the past years, they’ve grown in popularity with the rise of modern languages such as Rust and Scala. They allow us to effectively model data, write readable code, and catch bugs at compile time. But rarely do we consider the aesthetics behind such constructs.

This post is for the curious programmer. Today, we’ll be looking at the mathematics behind ADTs. In doing so, we also gain an appreciation for their utility and aesthetics. I’ll be mainly using Haskell code blocks in this post, because types are very straightforward to express in this language. If you’re unfamiliar with Haskell, fear not!—the concepts addressed below are transferable to most programming languages.

## Motivation for ADTs

We are interested in combining types, but that alone isn’t saying much. We want to combine types:

- **meaningfully**, i.e. communicate ideas through those types, and
- **concisely**, i.e. such types shouldn’t contain redundant information.

The first point lies with the notion of expressibility and the art of programming. Code is, after all, a medium between programmers. The second point is even more important, as removing redundancy implies removing duplicate and invalid states, leading to better maintainability and fewer bugs.

ADTs offers us two ways to combine types: **product types** and **sum types**.

## Product Types

If you’ve used structs, tuples, or record types, then you already have a sense of what product types are. Generally speaking, product types combine types with all *coexisting together*.

Here are some product types in Haskell:

```haskell
-- Haskell Tuple
-- -------------
-- Haskell separates types from data.
tuple1 :: (Bool, Bool) -- Type
tuple1 = (True, False) -- Data

-- Here's another tuple:
tuple2 :: (Int, String)
tuple2 = (42, "Hello world!")

-- We can have a product type of product types.
tuple3 :: ((Int, Double), (Bool, Char))
tuple3 = ((1, 3.14), (True, 'a'))

-- Although semantically, it's the same as...
tuple4 :: (Int, Double, Bool, Char)
tuple4 = (1, 3.14, True, 'a')

-- Haskell Data Constructor
-- ------------------------
-- We define a new type: RectangleType.
-- We also define Rect to be a data constructor.
-- The data constructor takes 4 integer arguments.
data RectangleType = Rect Int Int Int Int

-- We can create a RectangleType by passing concrete 
-- values to the Rect data constructor.
rect :: RectangleType
rect = Rect 0 0 10 5

-- Haskell Record
-- --------------
-- Let's define a record!
-- With Haskell record syntax, we can give names to fields.
-- Here, `Person` is both the type and data constructor.
data Person = Person { name :: String, age :: Int }

-- Let's construct a Person type! A person has a name AND an age.
record :: Person
record = Person { name="Peter Parker", age=16 }
```

In the final example above, we wrote a product type representing a `Person`. All people have `name` and `age` properties, so it makes sense to combine them in coexistence.

### Sum Types

Sum types are another way to combine types. In contrast to product types, sum types combine types in an *exclusive* fashion: *only one type can exist at any given moment*.

![Sum types stand out from the historic dominance of product types.](/img/posts/programming/sheesh-sum-types.jpg){.w-80}
{.center}


Sum types in their *simplest* form are just enums.[^but-enum-values-arent-types] In C/C++, we might define them like so:

```cpp
enum Bool {
	False,
	True,
};
```

In Haskell, a `Bool` can be defined like so:

```haskell
data Bool = False | True
```

Notice the vertical bar `|`. This means a value with type `Bool` can either be `False` or `True`. It can’t be both at the same time.

[^but-enum-values-arent-types]: We talked about combining *types*. Enums, on the other hand, combine *values*… We explore this in a section near the end: [enums as sum types](#enums-as-sum-types).

Sum types also allow us to represent more complex data structures. Suppose we want to model students and teachers in a school. The traditional object-oriented method would be to declare a base `Member` class, then derive `Student` and `Teacher` classes.

```cpp
// C++ Object-Oriented Approach
using Course = std::string; // Type alias.

class Member {};

class Student : public Member {
public:
    // A student...
    int year;                    // ...belongs to a year.
    std::vector<Course> courses; // ...takes some courses.
};

class Teacher : public Member {
public:
	std::vector<Course> teaches; // A teacher teaches some courses.
};
```

In functional programming, we could express a `Member` as a sum type of `Student` or `Teacher`.

```haskell
type Course = String -- Type alias.

data Member = Student { year :: Int, courses :: [Course] }
						| Teacher { teaches :: [Course] }
```

Here, `Student` and `Teacher` are two branches of the `Member` type, and a `Member` can only be either a `Student` or a `Teacher`. We can also add more branches to the sum type, such as `Administrator`, `Visitor`, and so on.[^c-sum-types]

[^c-sum-types]: We could do the same in C++ by using [Boost variant](https://theboostcpplibraries.com/boost.variant), using [C++17’s `std::variant`](https://en.cppreference.com/w/cpp/utility/variant), or using a tagged union (which is just a `union` with a `uint8_t`/`int` tag). 

There are pros and cons for choosing between the object-oriented approach and functional approach, but that’s a topic for another day.

Sum types also enable us to express errors in a type-safe way. We can create a `Maybe` type that can be either `Nothing` or `Just` with the former indicating no result, and the latter indicating some result. (More on this later!)

```haskell
data Maybe a = Nothing | Just a
```

This type allows us to handle errors in a more structured way and avoid a lot of `if-else` statements.[^howithelp]

[^howithelp]: Through the help of monads!

To sum up, sum types enable us to express complex data structures, while avoiding redundancy and making our code more maintainable and type-safe.

By the way, we would call `Just` a *data constructor*. This means we can construct concrete data by applying values to `Just`. For example, `Just 1`, `Just "in"`, and `Just (Just 42)` are all data. The same applies to `False`, `True`, and `Nothing`, but those don’t take arguments. More on this later…

{.alert-info}

## Types in the Wild

Let’s familiarise ourselves with ADTs and look at a few use cases.

![std::any — I choose you!](/img/posts/programming/wild-types.jpg){.w-90}
{.center}

### Product Types in the Wild

In most languages, product types are useful when passing/returning data containing multiple values. For instance, we can define a `divMod` function which returns the quotient and the remainder of two numbers.

```haskell
ghci> divMod x y = (x `div` y, x `mod` y)
ghci> divMod 5 2
(2,1)
ghci> divMod 42 2
(21,0)
```

In the Haskell REPL, lines starting with `ghci>` indicate code entered by the programmer. Other lines contain REPL output.
Also, some notes Haskell notation: parameters in Haskell are delimited by *spaces* rather than *commas*, a bit like shell scripting.

{.alert-success}

### Sum Types in the Wild

There are two common sum types in the wild: `Maybe` (introduced previously) and `Either`. These are typically used to express errors: either an error occurred or a valid result is returned. `Maybe` and `Either` have other names as well. In Rust, they’re called [`Option`](https://doc.rust-lang.org/std/option/enum.Option.html) and [`Result`](https://doc.rust-lang.org/std/result/enum.Result.html). In Scala, it’s [`Option`](https://www.scala-lang.org/api/2.13.3/scala/Option.html) (not the same one as Rust!) and [`Either`](https://www.scala-lang.org/api/2.13.6/scala/util/Either.html). In C++, it’s [`optional`](https://en.cppreference.com/w/cpp/utility/optional) and [`expected`](https://github.com/TartanLlama/expected)[^expected].

[^expected]: `std::expected` is expected (haha) to arrive in the C++23 standard.

Again, `Maybe` is defined as a sum type like so:

```haskell
data Maybe a = Nothing | Just a
```

Here, `a` is a type parameter, much like the type parameters in C++ templates and other generic programming languages. We can substitute types to get a **concrete type**. For example, we can have a `Maybe Int`, `Maybe Bool`, `Maybe String`, or even a `Maybe (Maybe (Maybe Int))`!

We can write a safe integer divide function by returning `Nothing` when the divisor is `0` (indicating an error) and returning the wrapped quotient otherwise.

```haskell
ghci> safeDiv x y = if x == 0 then Nothing else Just (x `div` y)
ghci> safeDiv 4 2
Just 2
ghci> safeDiv 7 2
Just 3
ghci> safeDiv 7 0
Nothing
```

`Maybe` is commonly used in places where the error is obvious, such as in map lookup (where `Nothing` implies non-existence).

`Either` is similar, but is defined over two type parameters.

```haskell
data Either a b = Left a | Right b
```

The type parameters `a` and `b` can be anything; but commonly, `a` is an error (such as a `String`) while `b` is some useful data.

In the wild, `Either` is used in Haskell parsing libraries to return parse results. Sometimes, the parse is successful and returns the generated tree or data (`Right`). Other times, the parse fails and the library returns information of where it failed (`Left`). For example, maybe it failed to parse an unexpected `:` at line 5, column 42 of something.json.

## The Algebra of Types

The astute may notice that product types combine types in an “***and***” fashion, whereas sum types do so in an “***or***” fashion. One of the alluring aspects of types is that we can construct an algebra over them. This also highlights the characteristics of product types and sum types more clearly.

### Types as Sets

Let’s start by treating types as *sets of values*.[^notset] A `Bool` can be thought of as a set of two values: $\{\texttt{True}, \texttt{False}\}$, so $|\texttt{Bool}| = 2$.[^cardinals]

[^notset]: I should mention—there are significant differences between types and sets. But please bear with me, for the sake of this post. ._.

[^cardinals]: We use $|A|$ to denote the size of set `A`.

What about a $(\texttt{Bool}, \texttt{Bool})$?  Each `Bool` can be either True or False; thus their combination yields $|(\texttt{Bool}, \texttt{Bool})| = 2 \times 2 = 4$ values. Generalising this,

$$
|(a, b)| = a \times b
$$

See how it got the name “product type“?

What about sum types? How many values can `Maybe Bool` take? In the `Nothing` branch, we have one value: `Nothing`. In the `Just` branch, we have two: `Just True` and `Just False`. Altogether, $|\texttt{Maybe Bool}| = 3$. In general,

$$
\begin{align*}
|\texttt{Maybe }a| &= |a| + 1 \\
|\texttt{Either }a\ \ b| &= |a| + |b|
\end{align*}
$$

Indeed, product types resemble multiplication over spaces whereas sum types suggest addition over spaces.

### Isomorphism of Types

The above-mentioned mathematical representation may come in handy when refactoring/optimising code.

Suppose we want a type with two “bins”: bin A and bin B. Items can belong to either bin, but not both… How can we represent this as a type?

One way is to use `Either a a`. We let `Left x` denote items in bin A, and `Right x` denote those in bin B.

Is there another way to represent the problem? Yes: `(Bool, a)`. We can use the `Bool` to flag whether the corresponding item is in bin A. Thus, `(True, x)` and `(False, x)` are used to denote items in bin A and B respectively.

In fact, we’ve just constructed an **isomorphism** between types!

The beauty is in the algebra. The equivalence above can be succinctly (and abstractly!) written as $\texttt{Either a a} \equiv \texttt{(Bool, a)}$—or more algebraically, $a + a = 2a$.[^notation]

[^notation]: For notation’s sake, I’ll use $\equiv$ to denote an isomorphism between types (e.g. $\texttt{Int} \equiv \texttt{Int}$).

More formally, an isomorphism exists between types `a` and `b` if we can *convert between the two types without loss of information*. The most straightforward approach is to define two functions: `toRHS :: a -> b` and `toLHS :: b -> a`. Alternatively with the algebra presented above, we can easily prove isomorphisms by checking the algebraic equivalence of two types!

{.alert-success}

With the toy example presented above, our converters would be

```haskell
toRHS :: Either a a -> (Bool, a)
toRHS (Left x) = (True, x)
toRHS (Right x) = (False, x)

toLHS :: (Bool, a) -> Either a a
toLHS (True, x) = Left x
toLHS (False, x) = Right x
```

Notice how information is preserved: $\texttt{toLHS }(\texttt{toRHS } x) = x,\ \forall x \in \texttt{Either a a}$ and $\texttt{toRHS } (\texttt{toLHS }y) = y, \ \forall y \in \texttt{(Bool, a)}$.

In the same vein, the following types are also equivalent:

- $\texttt{Maybe (Maybe a)} \equiv \texttt{Either Bool a}$
- $\texttt{Maybe (Either (a, a) (Bool, a))} \equiv \texttt{(Maybe a, Maybe a)}$

### Unit Values in the Algebra of Types

But wait, there’s more! There are also *null* and *unit* types which behave just like 0 and 1 in the integers, with the usual axioms.

Meet `Void` and `()`, two very special types. `Void` resembles the null set: it has *no concrete values*. So how is this type used? Well, without any concrete values, its primary utility is in the type level. For example, with the [Megaparsec](https://hackage.haskell.org/package/megaparsec) parsing library, we could use `Parsec Void u a` to use the default error component.

`()` is the 0-tuple, the singleton set containing `()` itself. (To clarify, “`()`” is both a type and a value, depending on the context.)

Note: C’s `void` should **not** be confused with Haskell’s `Void`. The former is more like `()`, containing only one possible result.

{.alert-warning}

With these funky creatures, we can write isomorphisms such as:

- $\texttt{Either Void a} \equiv \texttt{a}$
    - Corresponds to $0 + a = a$.
    - Bijection:
    
    ```haskell
    toRHS :: Either Void a -> a
    toRHS (Right x) = x
    -- toRHS (Left x) = undefined -- Implicit.
    
    toLHS :: a -> Either Void a
    toLHS x = Right x
    ```
    
- $\texttt{((), a)} \equiv \texttt{a}$
    - Corresponds to $1 \times a = a$.
    - Bijection:
    
    ```haskell
    toRHS :: ((), a) -> a
    toRHS ((), x) = x
    
    toLHS :: a -> ((), a)
    toLHS x = ((), x)
    ```
    

You may verify that the bijections[^bijection] hold, i.e. show that $\texttt{toLHS }(\texttt{toRHS } x) = x$ and $\texttt{toRHS }(\texttt{toLHS } y) = y$ for any $x$ and $y$.

[^bijection]: A bijection is also known as a **one-to-one mapping**. Each input must map to one and only one output.

I’ll leave other algebraic constructions as an exercise for the reader. 🙃 Try coming up with examples of types and bijections for the following.

- Associativity: $(a + b) + c = a + (b + c)$, $(ab)c = a(bc)$
- Commutativity: $a + b = b + a$, $ab = ba$
- Distribution: $a(b + c) = ab + ac$
- Null: $0a = 0$

### Enums as Sum Types

An aside regarding sum types and enums.

Early on I mentioned sum types as [a way to combine *types*](#motivation-for-adts). Then I suggested [*enums* as an example of sum types](#sum-types)… But we usually think of enums as combining *values*, not *types*. What’s going on here?

Well, one way to view enums is to treat each value as if they take a unit type `()` parameter. That is,

```haskell
data Bool = False () | True ()
```

(N.B. $\texttt{Bool} \equiv \texttt{Either () ()}$.)

Here, `False` is a *data constructor* while `()` is a *type*. In this version of `Bool`, we’re basically combining a bunch of unit types `()` using different tags.

In this regard, enums can be thought of as sugar-coated sum types; and conversely, sum types can be thought of as glorified enums. We’ve seen how enums and sum types can be defined similarly in Haskell. The same goes for Rust and Scala 3, where we would use the `enum` keyword for both enums and sum types.

## Conclusion and Recap

Is that all?

Au contraire.

Algebraic data types may be sufficient for most use cases, but we’ve only scratched the surface. There are more quirky animals out there! Generalised ADTs. Union/disjunctive types. Conjunctive/intersection types. Pi types.

But to recap:

- **Algebraic data types (ADTs)** consist of *product types* and *sum types*. These are used to model real world data.
- By leveraging ADTs, we can write code that is meaningful and concise.
- There are two main forms of ADTs. Both enable us to combine smaller types into larger types.
    - **Product types** can be thought of as a *multiplication on types*.
    - Similarly, **sum types** are like a *summation on types*.
- ADTs follow mathematical laws similar to other structures (e.g. the integers), but without the inverse property. These mathematical laws allow us to rigorously reason with types.
    - We can express ADTs through a mathematical algebra such as $|\texttt{(a, b)}| = a \times b$ and $|\texttt{Either a b}| = a + b$.
    - Types with an equivalent algebraic representation are **isomorphic**. This may prove useful in refactoring and optimising.
    - The algebra of types follows **algebraic laws** similar to the laws for integers and other algebras. There are laws on identity (e.g. $0 + a = a$), associativity, distribution, etc.
- Thus, in addition to their utilitarian use, types also exhibit an aesthetic beauty.

### References/Further Reading

- [The Algebra of Algebraic Data Types](https://gist.github.com/gregberns/5e9da0c95a9a8d2b6338afe69310b945) by Chris Taylor
- [Type Isomorphism](https://kseo.github.io/posts/2016-12-25-type-isomorphism.html) by Kwang Yul Seo