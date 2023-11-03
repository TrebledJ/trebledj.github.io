---
title: "Styleguide – Math"
excerpt: "Minimal style tests for math."
tags:
  - mathematics
usemathjax: true
related:
    disable: false
    tags: [mathematics]
    auto: true
    excludeOthers: true
noindex: true
---

Inline math is useful: $A + B + \underbrace{C + D}_{\small\text{Floppy disk!}}$.

Monospaced math: $\texttt{char} \subset \texttt{int} \subset \texttt{long}$.

Centred equations are also fun!

$$
e^{i\pi} + 1 = 0
\qquad
1^{2^{3^{4^5}}}
$$
<!-- 
$$
e^{i\pi} + 1 = 0
\qquad
\begin{align}
x + y + z &= 1 \\
2x - y + 3z &= 2 \\
4x - 5y + 10z &= 3 \\
\end{align}
$$ -->

$$
\begin{align*}
x + y + z &= 1 \\
2x - y + 3z &= 2 \\
4x - 5y + 10z &= 3
\end{align*}
$$

$$
\begin{bmatrix}
1 & 0 & 0 \\
0 & 1 & 0 \\
0 & 0 & 1
\end{bmatrix}
$$

Check line breaks here:

- `\text` + `\allowbreak` and friends: $\texttt{The quick brown } \allowbreak \text{fox jumps } \allowbreak \textsf{over the lazy dog}\dots\ \allowbreak \texttt{And } \allowbreak \texttt{over } \allowbreak \texttt{the } \allowbreak \texttt{rainbow } \allowbreak \texttt{dost } \allowbreak \texttt{thy } \allowbreak \texttt{chicken } \allowbreak \texttt{poop } \allowbreak \texttt{fly}\dots$

<!-- $$
\texttt{The quick brown } \text{fox jumps } \textsf{over the lazy dog}.\ \+ \text{Cat ipsum dolor sit amet, always hungry.}\ \text{Poop on grasses i show my fluffy belly but it's a trap! if you pet it i will tear up your hand and sniff sniff sniff sniff but step on your keyboard while you're gaming and then turn in a circle but human is washing you why halp oh the horror flee scratch hiss bite hell is other people.}
$$ -->

$$
\texttt{Maybe } \allowbreak \texttt{(Either (a, a)} \allowbreak \texttt{ (Bool, a))} \equiv \allowbreak \texttt{(Maybe a, Maybe a)}
$$

$$
1 + 2 + 3 + 4 + 5 + \cdots + 15 + 20 + 25 + \cdots + 100 + 200 + 300 + \cdots + 500 + 100 + 1500 + \cdots + \cdots + \cdots + 0 = -1
$$

## Without `\break`

```latex
\texttt{make this line longerrrrrrrrrrrrrrrrrrrr} {} \equiv \texttt{Maybe (Either (a, a) (Bool, a))} {} \equiv \texttt{(Maybe a, Maybe a)}
\texttt{make this line longerrrrrrrrrrrrrrrrrrrr} {} \goodbreak \equiv \texttt{Maybe (Either (a, a) (Bool, a))} {} \goodbreak \equiv \texttt{(Maybe a, Maybe a)}
```

**inline (with `$`):**

- `\text` + `\equiv`: $\texttt{make this line longerrrrrrrrrrrrrrrrrrrr} {} \equiv \texttt{Maybe (Either (a, a) (Bool, a))} {} \equiv \texttt{(Maybe a, Maybe a)}$
- `\text` + `\equiv` + `\goodbreak`: $\texttt{make this line longerrrrrrrrrrrrrrrrrrrr} {} \goodbreak \equiv \texttt{Maybe (Either (a, a) (Bool, a))} {} \goodbreak \equiv \texttt{(Maybe a, Maybe a)}$


**block (with `$$`):**

```latex
\texttt{make this line longerrrrrrrrrrrrrrrrrrrr} {} \equiv \texttt{Maybe (Either (a, a) (Bool, a))} {} \equiv \texttt{(Maybe a, Maybe a)}
\texttt{make this line longerrrrrrrrrrrrrrrrrrrr} {} \goodbreak \equiv \texttt{Maybe (Either (a, a) (Bool, a))} {} \goodbreak \equiv \texttt{(Maybe a, Maybe a)}
```

- `\text` + `\equiv`
    $$
    \texttt{make this line longerrrrrrrrrrrrrrrrrrrr} {} \equiv \texttt{Maybe (Either (a, a) (Bool, a))} {} \equiv \texttt{(Maybe a, Maybe a)}
    $$

- `\text` + `\equiv` + `\goodbreak`
    $$
    \texttt{make this line longerrrrrrrrrrrrrrrrrrrr} {} \goodbreak \equiv \texttt{Maybe (Either (a, a) (Bool, a))} {} \goodbreak \equiv \texttt{(Maybe a, Maybe a)}
    $$
