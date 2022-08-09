---
title: AOC 2021 Haskell Utils
description: An introduction and walkthrough of my haskell utilities.
updated: "2022-08-09"
tags: aoc haskell programming
thumbnail: /assets/img/posts/aoc/recycle-hs-utils.jpeg
usemathjax: true
---

Haskell, despite its relatively low popularity, is quite up to speed on language features and tooling (unlike–*cough cough*–some other languages). One of these features is being able to separate and organise files into modules, encouraging clean code practices and cleaner development.

In AOC 2021, I found it useful to separate common functions into a [Utils.hs][aoc-utils] file. After all, to make our environments cleaner we should reduce, reuse, and recycle.

![](/assets/img/posts/aoc/recycle-hs-utils.jpeg){:.w-75}
{:.center}

I'll introduce some basic utilities first before moving on to advanced ones. However, I won't make too many attempts to teach the basics. For that you may refer yourself to [Learn You a Haskell][lyah] (LYAH), which provides a very nice tutorial into Haskell.

{% include toc.md %}

### List Utilities
#### `count :: (a -> Bool) -> [a] -> Int`

```haskell
count p xs = length (filter p xs)
```

Typically the situation arises when we need to count the number of elements in a list. For example, "count the number of occurrences of `3` in `[1, 2, 3, 4, 3, 3, 5]`". To do this, we'll `filter` the matching elements, then take the `length` of the filtered list to count the number of matches.

If you're new to Haskell, you're probably wondering "what the heck are the jumble of symbols on the first line?" It's the type signature! We can roughly translate it as follows:

* `count`: The `count` function...
* `::`: has the following type...
  * `(a -> Bool)`: it takes a predicate; here, a function which itself takes a generic type `a` and returns a boolean...
  * `->`: then...
    * `[a]`: it takes a list of generic objects (all the same type as the previous `a`!)...
    * `->`: then...
      * `Int`: it returns a 32-bit integer.

Well, this isn't entirely accurate due to currying, but it's a decent mental model.

In the type signature, `a` is a generic type, similar to template parameters in C++ and generics in Java/Scala although the convention in those languages is to use `T` and `A`.

```cpp
// C++
template <typename T>
int32_t count(std::function<bool(T)> p, std::list<T> const& xs) { /* ... */ }
```

```scala
// Scala
def count[A](p: A => Boolean, xs: List[A]): Int = { /* ... */ }
```

In Haskell, there is actually a more concise way to write `count`:

```haskell
count :: (a -> Bool) -> [a] -> Int
count p = length . filter p
```

`.` stands for function composition, similar to those you see in math ($f \circ g$). On the practical side, it applies the right-hand-side function first, followed by the left-hand-side function. Programs are all about combining small operations to form bigger ones, so you'll see `.` being used a lot in purely functional code.
{:.alert--info}

In the code above, you can think of `count` as taking one parameter `p :: a -> Bool` and returning a function `[a] -> Int` which is the composition of `length` and `filter p`. It may help if I refine the type signature, so that it's clear that it returns `[a] -> Int`:

```haskell
count :: (a -> Bool) -> ([a] -> Int)
```

So we can actually think of `count` as having several types:

1. it takes a `(a -> Bool)`, a `[a]`, and returns an `Int`; or
2. it takes a `(a -> Bool)` and returns an `([a] -> Int)`.

Either way the function does the same thing. Under the hood, however, the Haskell compiler thinks using the latter version. This phenomenon is known as currying and its flexibility is quite useful for creating partial functions.

#### `firstBy, lastBy :: (a -> Bool) -> [a] -> a`
```haskell
firstBy p = head . filter p
lastBy p = last . filter p
```

Both `firstBy` and `lastBy` have similar function types: they take a predicate `(a -> Bool)`, a list `[a]`, and return an element `a`. You can probably guess what these do by just looking at the names and types.

```haskell
ghci> firstBy even [1..5]
2
ghci> lastBy (< 4) [1..5]
3
```

`even` checks if a number is even. `< 4` checks if a number is less than 4. We *could* be more explicit: `lessThan4 x = x < 4`; but `< 4` is just more concise.
{:.alert--info}

These functions are useful when we've generated a list of possible solutions, but only want the first or last element which meets some criteria.

#### `fromBinary :: String -> Int`
```haskell
fromBinary = foldl (\acc d -> 2 * acc + digitToInt d) 0
```

As you could guess from the type signature, this function converts a binary string to the corresponding base-10 integer. You'll notice that we didn't give a parameter name for `String`, and that's because we curried `foldl` (which takes up to 3 parameters).

Folds in functional programming are powerful and useful because they are generalised/abstract constructs. And like all generalised/abstract constructs, folds take a bit of time to understand. If you know how `reduce` works, `foldl` is similar. You can learn more about folds in [LYAH's chapter on folds][lyah-folds].

To illustrate `fromBinary` in action:

```haskell
fromBinary "10" 
    = 2 * (2 * 0 + digitToInt '1') + digitToInt '0'
    = 2 * (1) + digitToInt '0'
    = 2

fromBinary "1011" 
    = 2 * (2 * (2 * (2 * 0 + digitToInt '1') + digitToInt '0') + digitToInt '1') + digitToInt '1'
    = 2 * (2 * (2 * (1) + digitToInt '0') + digitToInt '1') + digitToInt '1'
    = 2 * (2 * (2) + digitToInt '1') + digitToInt '1'
    = 2 * (5) + digitToInt '1'
    = 11
```

`digitToInt` is a function defined in `Data.Char` which converts a char digit (`'0'..'9'`) to the corresponding integer `0..9`.
{:.alert--info}

### Debug Utilities
Debugging in the functional world is slightly more nuanced than debugging in the imperative world. Haskell's `Debug.Trace` library—with its signature function `trace`—allows us to print messages to standard output, bypassing the restrictions of pure functions. Some examples of `trace` in action:

```haskell
hello :: String -> String
hello x = trace "trace says 'hello'" x

foo :: Int -> String -> Int
foo n s | trace ("int: " ++ show n ++ ";  string: " ++ s) False = undefined
foo n s = n + length s

--

ghci> hello "world"
trace says 'hello'
world

ghci> foo 1 "abc"
int: 1;  string: abc
4
```

The first parameter of `trace` is the string to output. The second parameter will be returned as is, without modifications.

In `foo`, we define the tracing on a separate line so that it's easy to comment out. The first match uses *guards* (see [LYAH][lyah-guards]).

Here are some convenience utilities that may spare a few keystrokes:

#### `(++$) :: (Show a) => String -> a -> String`
```haskell
(++$) s x = s ++ " " ++ show x
```

So that we don't have to write `show` for every non-string item we want to print. We can use this in `foo`'s trace message to replace `++ show n` with `++$ n`.

```haskell
foo :: Int -> String -> Int
foo n s | trace ("int:" ++$ n ++ ";  string: " ++ s) False = undefined
foo n s = n + length s
```

It's a bit superfluous, but I think writing `show` all the time bloats the debug message.

#### `trace' :: (Show a) => a -> a`
```haskell
trace' x = trace (show x) x
```

A helper to print and return its argument, to avoid repetition.

### Advanced Utilities
In the following sections, I'll talk about fundamentals less so that I can focus more on the higher-level things. I'll presume the reader has a solid grasp of fundamentals.

#### `counter :: (Hashable a, Eq a) => [a] -> M.HashMap a Int`
```haskell
counter = foldr (\x -> M.insertWith (+) x 1) M.empty
```

This helper function takes a list and counts the number of occurrences, packing it into a hashmap for efficient lookup.

![](/assets/img/posts/aoc/hashmapuh.png){:.w-75}
{:.center}

After all, if Python has such a convenience (`collections.Counter`), why shouldn't Haskell have something similar?

```haskell
counter [1, 2, 3, 1, 5, 3, 4, 1]
    = M.fromList [(1,3), (2,1), (3,2), (4,1), (5,1)]
```

In fact, we can generalise this to not only work with lists as input, but for any `Foldable` type. This is what we would get if we let the Haskell's type inference work its magic:

```haskell
ghci> counter = foldr (\x -> M.insertWith (+) x 1) M.empty
ghci> :t counter
counter
  :: (Foldable t, Eq k,
      hashable-1.3.1.0:Data.Hashable.Class.Hashable k, Num v) =>
     t k -> M.HashMap k v
```

That is:

```haskell
counter :: (Foldable t, Eq k, Hashable k, Num v) => 
            t k -> M.HashMap k v
```

I used the [strict hashmap][data-hashmap-strict] provided in the `unordered-collections` package, but it should work with lazy hashmaps as well.

If you want to use the `Hashable` typeclass in code, you'll need to ["expose" the hidden `hashable` package and import `Data.Hashable`](https://stackoverflow.com/a/68761231/10239789).
{:.alert--warning}

### Parser Utilities
I used MegaParsec this year, but the idea of the following utilities can also be applied for other parser combinator libraries.

#### `digits :: (Num i, Read i) => Parser i`
```haskell
digits = read <$> some digitChar
```

Convenience function for parsing a number (string of digits).

#### `integer :: (Num i, Read i, Show i) => Parser i`
```haskell
integer = (negate <$> try (char '-' *> digits)) <|> digits
```

Convenience function for parsing a (possibly negative) integer.

### AOC-specific Utilities
Some more utilties which I wrote solely for AOC.

#### `defaultMain`
```haskell
defaultMain
  :: (ParseLike p, Print b, Print c)
  => String   -- Default input file, if no -f option was provided from args.
  -> p a      -- Any instance of ParseLike, e.g. a function (String -> a) or a parser combinator (Parser a).
  -> (a -> b) -- Function to solve part 1. Takes in input and returns something printable.
  -> (a -> c) -- Function to solve part 2.  -- Ditto. --
  -> IO ()
defaultMain defaultFile parse part1 part2 = do
  (opts, _)  <- parseArgs (nullOpts { file = defaultFile }) <$> getArgs
  input <- doParse parse (file opts) <$> readFile (file opts)
  when (runPart1 opts) $ do
    putStr "part1: "
    print' $ part1 input
  when (runPart2 opts) $ do
    putStr "part2: "
    print' $ part2 input
```

This utility may seem scary since there it's packed with other user-defined utilities. But to summarise, this function helps standardise the AOC part 1/part 2 structure while also providing the option to specify input files from the command line. This is useful as Haskell Stack is a bit fussy and long-winded when it comes to compilation.

One thing I found useful was having flexible parse methods. Sometimes I want to parse using a `String -> a` function because it was enough to simply do `map read . lines`. Other times I want to parse using a `Parser a` combinator due to more complicated syntax in the input. Thanks to ad-hoc polymorphism, we can achieve this using typeclasses; and so the `ParseLike` typeclass was born:

```haskell
class ParseLike p where
  -- Parser object, filename, contents -> result.
  doParse :: p a -> String -> String -> a

instance ParseLike ((->) String) where
  doParse f _ = f  -- Apply a parse function `f` on `contents`.

instance ParseLike Parser where
  doParse p file txt = case runParser p file txt of
    Right res -> res
    Left  err -> T.trace (errorBundlePretty err) undefined
```

![](/assets/img/posts/aoc/parselike.jpeg){:.w-50}
{:.center}

Here's an example usage from [Day 1](https://github.com/TrebledJ/aoc/blob/master/2021/haskell/app/D01.hs):

```haskell
main :: IO ()
main = defaultMain defaultFile parse part1 part2

defaultFile :: String
defaultFile = "../input/d01.txt"

parse :: String -> [Int]
parse = map read . lines

part1 :: [Int] -> Int
part1 xs = length $ filter (uncurry (<)) $ zip xs (tail xs)

part2 :: [Int] -> Int
part2 xs =
  part1 $ map (\(a, b, c) -> a + b + c) $ zip3 xs (tail xs) (tail $ tail xs)
```

Other usage examples can be found in [my Haskell AOC solutions][aoc-haskell].

#### `criterionMain`
```haskell
criterionMain
  :: (ParseLike p)
  => String   -- Default input file, if no -f option was provided from args.
  -> p a      -- Any instance of ParseLike, e.g. a function (String -> a) or a parser combinator (Parser a).
  -> (a -> [C.Benchmark]) -- Criterion IO () benchmarking function.
  -> IO ()
criterionMain defaultFile parse getBench = do
  (opts, rest)  <- parseArgs (nullOpts { file = defaultFile }) <$> getArgs
  input <- doParse parse (file opts) <$> readFile (file opts)
  withArgs rest $ C.defaultMain $ getBench input
```

Criterion is an excellent benchmarking library with various config options and output formats. To integrate Criterion with my pre-existing options, I hand-spun another default-main for benchmarking. So instead of passing my parsed input to part 1/2 functions, I pass it to benchmarks.

Example usage from [Day 22](https://github.com/TrebledJ/aoc/blob/master/2021/haskell/app/D22.hs):

```haskell
main :: IO ()
main = criterionMain defaultFile parser $ \input ->
  [ C.bgroup "part1" [C.bench "part1" $ C.whnf part1 input]
  , C.bgroup
    "part2"
    [ C.bench "sum of unions" $ C.whnf part2 input
    , C.bench "sum of unions (optimised)" $ C.whnf part2_optimised input
    , C.bench "sum of intersections" $ C.whnf part2_intersect input
    ]
  ]

parser :: Parser [Command]
parser = ...

part1 :: [Command] -> Int
part1 cmds = ...

part2 :: [Command] -> Int
part2 cmds = ...

part2_optimised :: [Command] -> Int
part2_optimised cmds = ...

part2_intersect :: [Command] -> Int
part2_intersect cmds = ...
```

[aoc-utils]: https://github.com/TrebledJ/aoc/blob/master/2021/haskell/src/Utils.hs
[aoc-haskell]: https://github.com/TrebledJ/aoc/tree/master/2021/haskell/app
[lyah]: http://learnyouahaskell.com/chapters
[lyah-folds]: http://learnyouahaskell.com/higher-order-functions#folds
[lyah-guards]: http://learnyouahaskell.com/syntax-in-functions#guards-guards
[data-hashmap-strict]: https://hackage.haskell.org/package/unordered-containers-0.2.19.1/docs/Data-HashMap-Strict.html
