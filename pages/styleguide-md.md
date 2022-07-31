---
title: Styleguide (Markdown)
layout: post
permalink: /styleguide-md/
visibility: false
feed: false
usemathjax: true
---

## Table of Contents
{:.no_toc}

* 
{:toc .mdtoc}

# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

Lorem ipsum dolor sit amet, consectetur adipiscing elit.

**Suspendisse facilisis ante a libero hendrerit, at gravida mauris semper. Aenean ut sollicitudin erat.**

*Sed lorem risus, aliquet in velit eget, cursus iaculis sem.*

~~Curabitur gravida massa sed purus sollicitudin aliquet.~~

* Aliquam in massa pellentesque dolor sollicitudin volutpat non et urna.
* Duis hendrerit dui non tincidunt rhoncus.
* Sed sodales nulla a turpis suscipit sodales.
* Phasellus commodo orci neque, eu lacinia mi sollicitudin vel.
* Donec non facilisis sapien.

1. Suspendisse ac nulla at nisi ultrices scelerisque.
2. Morbi ut lorem at ex convallis venenatis vel id purus.
3. Morbi nec sem sit amet mauris convallis suscipit.

> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse facilisis ante a libero hendrerit, at gravida mauris semper. Aenean ut sollicitudin erat. Sed lorem risus, aliquet in velit eget, cursus iaculis sem. Curabitur gravida massa sed purus sollicitudin aliquet. Aliquam in massa pellentesque dolor sollicitudin volutpat non et urna. Duis hendrerit dui non tincidunt rhoncus. Sed sodales nulla a turpis suscipit sodales. Phasellus commodo orci neque, eu lacinia mi sollicitudin vel. Donec non facilisis sapien. Suspendisse ac nulla at nisi ultrices scelerisque. Morbi ut lorem at ex convallis venenatis vel id purus. Morbi nec sem sit amet mauris convallis suscipit.  
>
> In scelerisque mi quis tempus blandit. Maecenas dapibus, felis non consectetur mattis, lorem eros eleifend urna, nec dapibus nunc nunc at diam. Morbi lobortis dui diam, a euismod erat imperdiet nec. Vestibulum in arcu tempor, tempus nunc at, pharetra ipsum. Quisque id dolor dapibus, aliquet mi a, aliquet erat. Etiam eu justo sed nibh accumsan imperdiet. Cras id sodales sapien. Cras ac turpis mi. Nulla pretium porta eros, faucibus efficitur orci. Etiam vitae blandit tellus, eu consequat tellus. Etiam nec urna eget lectus interdum fringilla sed id augue. Quisque vulputate sagittis luctus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Donec euismod, arcu vitae iaculis pulvinar, erat dolor porttitor urna, eu ornare libero quam et est.

<u>Leave hair everywhere pee in human's bed until he cleans the litter box yet poop on couch bite off human's toes, and sometimes switches in french and say "miaou" just because well why not.</u>

<small>Rub butt on table hide head under blanket so no one can see destroy the blinds for meow.</small>

Chew on `cable` chew the plant, `yet` lick face hiss at owner, `pee` a lot, and `meow` repeatedly scratch at fence purrrrrr eat muffins and poutine until owner comes back fight own tail roll on the floor purring your whiskers off so no, `you can't close the door`, i haven't decided whether or not i wanna go out so roll on the floor purring your whiskers off.

----

### Links and Anchors

[Top of page](#).

[Heading 1](#heading-1).

[Heading 6](#heading-6).

Internal link: [Spread kitty litter all over house meow](/) and crash against wall but walk away like nothing happened, but check cat door for ambush 10 times before coming in.

External link: [Cat meoooow i iz master of hoomaan](https://www.google.com/), not hoomaan master of i.

### Math
LaTeX:

$$\sum_{i=1}^n \frac{(x_i - \mu)^2}{n}$$

Inline latex like $$\underbrace{1 + 1 = 2}_{\text{wow}}$$ should work.

Full-width image.  
![](/assets/img/thumbnail.png){:width="100%"}

Centred image.  

![](/assets/img/thumbnail.png){:width="80%"}
{:refdef style="text-align: center;"}

## Add-Ons
### Alerts

Pooh damn **dat dog naughty running cat and make it to the carpet** *before i vomit mmmmmm what the heck just happened, something feels fishy but hide head under blanket so no one can see love* ~~blinks and purr~~ purr purr purr yawn. `Run as fast as i can into another` room for no reason all of a sudden cat goes crazy bleghbleghvomit my furball really tie the room together sleep on my human's head.
<br/><br/>
Chase imaginary bugs sniff other cat's butt and hang jaw half open thereafter immediately regret falling into bathtub for scratch leg; meow for can opener to feed me yet licks your face. Jump around on couch, meow constantly until given food, pet right here, no not there, here, no fool, right here that other cat smells funny you should really give me all the treats because i smell the best and omg you finally got the right spot and i love you right now and scratch so owner bleeds. Hide when guests come over. 
{:.alert--danger}

Climb a tree, wait for a fireman jump to fireman then scratch his face need to chase tail spread kitty litter all over house purr as loud as possible, be the most annoying cat that you can, and, knock everything off the table yet try to hold own back foot to clean it but foot reflexively kicks you in face, go into a rage and bite own foot, hard.
```cpp
#include <vector>

int main() {
  auto v = std::vector{1, 2, 3, 4, 5};
  std::foreach(v.begin(), v.end(), [](auto i) { std::cout << i << std::endl; });
}
```
{:.alert--info}

Meow. Toilet paper attack claws fluff everywhere meow miao french ciao litterbox scratch funny little cat chirrup noise shaking upright tail when standing next to you. Rub my belly hiss.
{:.alert--primary}

Test

Give attitude. Cattt catt cattty cat being a cat reward the chosen human with a slow blink but chase ball of string yet always ensure to lay down in such a manner that tail can lightly brush human's nose so munch on tasty moths.
{:.alert--success}

Cats secretly make all the worlds muffins this cat happen now, it was too purr-fect!!! inspect anything brought into the house, or groom forever, stretch tongue and leave it slightly out, blep.
{:.alert--warning}

### Code Blocks

```cpp
#include <iostream>

int main() {
  std::cout << "Lorem ipsum dolor sit amet" << std::endl;
}
```

```c
#include <stdio.h>

int main() {
  printf("Hello there %.3f", 3.14159);
}
```

```haskell
fib :: Int -> Int
fib n | n < 2 = 1
      | otherwise = fib (n - 1) + fib (n - 2)
```

```rust
fn main() {
  let x: Vec<i32> = vec![1, 3, 5, 7, 9];
  println!("{:?}", x);
}
```

```python
def factorial(n: int) -> int:
  return 1 if n < 2 else n * factorial(n - 1)
```

```scala
object Module {
  def gauss(n: Int): Int = {
    n * (n + 1) / 2
  }
}
```
