---
title: Markdown to Prism
excerpt: blah blah
tags:
  - web
  - performance
  - meta
  - notes
  - writeup
  - project
# thumbnail_src: assets/optimising-web-icons-thumbnail.png
draft: true
---

With over 7 million weekly downloads on NPM, PrismJS is one of the most widely used code highlighting packages in JavaScript, lauded for its unparalleled extensibility through languages and plugins.

But one recurring issue plagues developers: most plugins require a DOM! This isn't an issue for client-processed code blocks. But on the server? Oh boy.

In this post, I’ll demonstrate two simple changes to easily (but crudely) coerce these plugins into compatibility with NodeJS and `markdown-it`. Some code examples will be in 11ty — the SSG for this site — but the principles apply to most JS-based SSG/SSR.

## History

A bit of history. Why is this an issue again?

You see, JavaScript is a complex ecosystem. Originally, it would only run in browsers, until [NodeJS](https://www.netguru.com/glossary/node-js) came along in 2009 and allowed developers to run it locally on their system. This meant we can have servers running JS, scripts written in JS, and [desktop applications](https://www.electronjs.org/) written in JS.

PrismJS, first [published in 2012](https://lea.verou.me/blog/2012/07/introducing-prism-an-awesome-new-syntax-highlighter/), was originally designed for browsers. It was only later that devs decided pre-rendered code blocks can be a *good* thing, for multiple reasons:

* Reduced network bandwidth. Prism.js scripts no longer need to be transferred.
* Reduced processing by the client (browser). Parsing and DOM manipulation was all performed prior.^[Another way to look at it: Instead of parsing/executing JS hundreds/thousands of times, we do it just once. I suppose that’s a positive environmental impact?]

So in theory, performance is improved. The only thing left to do is paint the code, which is left to CSS and the browser.

Most PrismJS plugins, however, rely on the DOM (TODO: abbr) to manipulate HTML.

## Ben

```shell {.command-line data-prompt="$" data-output=2-100}
node eleventy/benchmarks/codeblocks
Running: JSDOM
[auto] Target 199 runs (~604ms/run) in 120s.
 --- [JSDOM] ---
 - 199 runs
 - mean: µ=582.964ms / σ=70.796ms
 - minmax: 491.888ms / 1007.477ms

Running: domino
[auto] Target 454 runs (~264ms/run) in 120s.
 --- [domino] ---
 - 454 runs
 - mean: µ=265.399ms / σ=42.418ms
 - minmax: 226.817ms / 476.795ms

Running: LinkeDOM
[auto] Target 444 runs (~270ms/run) in 120s.
 --- [LinkeDOM] ---
 - 444 runs
 - mean: µ=279.861ms / σ=69.691ms
 - minmax: 214.418ms / 666.151ms
```