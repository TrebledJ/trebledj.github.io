---
title: How to Use PrismJS Plugins with NodeJS and MarkdownIt
excerpt: Dead simple hacks to render fancy Prism plugins in Node. Tell stories with code more effectively!
tags:
  - web
  - js
  - tutorial
  - meta
thumbnail_src: assets/thumbnail.png
draft: true
---

With over 7 million weekly downloads on NPM, PrismJS is one of the most widely used code highlighting packages in JavaScript, lauded for its unparalleled extensibility through plugins. But one recurring issue plagues developers: most plugins require a {% abbr "DOM", "document object model, responsible for managing the UI you see in your wonderful browser" %}! Fancy plugins such as `command-line`, `line-numbers`, and the toolbar-suite require the DOM to manipulate HTML. This isn't normally possible in runtime environments such as Node, which aren't designed to render UIs, hence, no DOM.

In this post, I’ll demonstrate a few simple changes to easily coerce these plugins into compatibility with NodeJS and MarkdownIt, a popular markdown renderer.^[One workaround is to use regex to modify HTML — but let’s face it, I sleep more soundly knowing the current implementation is mature and battle-tested. By introducing a DOM API to Node, you're placing trust in a library to be spec-compliant. By handwriting regex, you're placing trust in your code to work. Which would you rather have?] I'll assume you have some sort of server-side rendering (SSR) or static-site generation (SSG) with the flexibility to import Node modules.

## Why enhance codeblocks?

Simple codeblocks suffice for most writers who need supporting text with pretty colours.

But to tell a good story, the characters, plot, and location need to be clear to the audience. Similarly, some (not all) blog posts and tutorials benefit from enhancements such as command-line demarcations, line numbers, labels, and inline markup.

There are many cases where such codeblocks are warranted:

- Interaction: input and output should be contrasted, think: shell or Jupyter notebook (command-line)
- A post compares or demonstrates a technique in multiple languages (show-language)
- Code is executed in multiple, distinct environments (command-line, label)
- A post refers to a code snippet within a large file (line-numbers)
- A post refers to multiple files (label)

{% details "Example: " %}
Here are some notes (TODO)

1. *Enumerate kerberoastable users.*
```sh {.command-line data-prompt="kali@kali $"}
sudo impacket-GetUserSPNs -dc-ip 192.168.50.70 corp.com/pete
```

```powershell {.command-line data-prompt="PS C:\Users\Joe>"}
Get-NetUser | Where-Object {$_.servicePrincipalName} | select-object name, samaccountname, serviceprincipalname
```

2. *Obtain TGS tickets from the service account to crack, either internally or externally.*

```sh {.command-line data-prompt="kali@kali $"}
sudo impacket-GetUserSPNs -request -dc-ip 192.168.50.70 corp.com/pete -output-file kerberoast.hash
```

```powershell {.command-line data-prompt="PS C:\Users\Joe>"}
.\Rubeus.exe kerberoast /outfile:kerb.hash
```

3. Crack the hash
	```
	sudo hashcat -m 13100 hashes.kerberoast /usr/share/wordlists/rockyou.txt -r /usr/share/hashcat/rules/best64.rule --force
	```

{% enddetails %}

Another problem I notice on many documentation pages is the use of `$`, denoting the start of a new command on a shell. These are commonly seen in installation scripts or guides. Here's an example installing a Makefile-based project:

```sh
$ tar -xvzf who_doesnt_like_to_copy_lines_one_by_one.tar.gz
$ cd who_doesnt_like_to_copy_lines_one_by_one
$ ./configure
$ make -j4
$ make install
```

Atrocious! You can't copy multiple lines without the nasty $ getting in the way! What terrible UX.^[To be fair, there's an argument to be made for "not running these commands all at once". Failure isn't handled. But this largely exists in relatively low-level build commands for C/C++, which is reknown for the many toolchains (i.e. potential build errors).]

With that small rant out of the way, let's begin!

## Step 1: Expose a DOM API

To make Node seem like a browser, we want to introduce `document` and `window` globals. These are the two keys variables used by Prism to manipulate HTML. `window` isn't really called; it's mostly for UI behaviour. `document`, however, is used rather heavily.

{% alert "danger" %}
This could have adverse effects on libraries which use unified code for both browser and runtime environments. Introducing `document` and `window` *might* have unintended spillover effects... so beware. In most cases though, this shouldn't break anything.
{% endalert %}

The easiest solution is to glue a DOM manipulation library such as JSDOM or domino, and create global `window`/`document` variables. I’ve chosen to use [domino](https://www.npmjs.com/package/domino) since it renders codeblocks much faster than JSDOM, with zero additional dependencies.

```sh
npm install domino
```

```js
const domino = require('domino');
global.window = domino.createWindow('');
global.document = global.window.document;
```

NodeJS's `global` object enables us to add global variables. Now Prism can access our `window` and `document` globals.

For convenience later, we’ll also create a function which converts HTML strings to DOM objects. In domino, one method is to use the [`template`](https://github.com/fgnass/domino/issues/73) element.

```js
function textToDOM(text) {
  const templ = document.createElement('template');
  templ.innerHTML = text;
  return templ.content;
}
```

## Step 2: Override MarkdownIt Fence Rendering

While markdown-it works great out-of-the-box, the rendering rules for code blocks are inherently incompatible with most Prism plugins. MarkdownIt provides options to highlight text, but Prism’s full-fledged highlighting aims to introduce UI elements by modifying the HTML. They don't speak the same language!

Prism has two primary highlight functions: `Prism.highlight` and `Prism.highlightElement`. Most server-side libraries are happy to use the former. But to unlock Prism’s full potential, we need to render fences differently by using `Prism.highlightElement`.

1. Remove the default text-based highlighting `options.highlight`. We still escape the HTML since we'll substitute it in a HTML string.
2. Handle `diff-*` languages by loading the right language.
3. Wrap the escaped code in `<div><pre><code>` with the right attributes, convert it to a DOM element, highlight it to `Prism.highlightElement`, then return the rendered HTML.
4. We also moved the attributes to `<pre>` instead of `<code>`.

I referenced [MarkdownIt's default fence rule](https://github.com/markdown-it/markdown-it/blob/0fe7ccb4b7f30236fb05f623be6924961d296d3d/lib/renderer.mjs#L29) and customised it as follows. The full implementation can be found on my repository (TODO: insert link).

```diff-js
    
-  let highlighted
-  if (options.highlight) {
-    highlighted = options.highlight(token.content, langName, langAttrs) || escapeHtml(token.content)
-  } else {
-    highlighted = escapeHtml(token.content)
-  }
+  const escaped = escapeHtml(token.content)

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

+    // Make sure language is loaded.
+    if (langName.startsWith('diff-')) {
+      const diffRemovedRawName = langName.substring('diff-'.length)
+      if (!Prism.languages[diffRemovedRawName])
+        PrismLoad([diffRemovedRawName])
+    } else {
+      if (Prism.languages[langName] === undefined)
+        PrismLoad([langName])
+    }
    
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

+  return `<pre${slf.renderAttrs(token)}><code>${escaped}</code></pre>\n`
-  return `<pre><code${slf.renderAttrs(token)}>${highlighted}</code></pre>\n`
```


## Change 3: Small Bug Fixes and Customisations

With the brunt of the work done, we turn our attention to some small persistent grievances in the Prism plugins. Some plugins such as `command-line` work out of the box; but others require coddling.

To customise Prism plugins, we can simply copy their JS into a project folder and edit it directly. We could then manually load it with:

```js
require('./path/to/custom/plugin/line-numbers');
```

### Line Numbers Oddities

For some reason, `line-numbers` doesn't exactly work out of the box. Instead of adding the `div` to the `<code>` element, we'll add it to its parent: the `<pre>`.

{# TODO: include line number... also do we need to change the CSS for this? #}
```diff-js {data-label=prism-line-numbers.js#L240}
-env.element.appendChild(lineNumbersWrapper);
+env.element.parentElement.appendChild(lineNumbersWrapper);
```

### Show Language Includes "diff-" in Name

`show-language` is a really nice toolbar plugin in case we're dealing with multiple languages in a single post. However, the default language list doesn't map `diff-*` languages. Thus, `diff-js` would appear as `diff-js` instead of the mapping for `js`, which is `JavaScript`.

```diff-js
-var language = pre.getAttribute('data-language') || Languages[env.language] || guessTitle(env.language);
+var language = pre.getAttribute('data-language');
+if (!language) {
+  if (env.language.match(/^diff-/)) {
+	  const baseLang = env.language.substring('diff-'.length);
+	  language = Languages[baseLang] || guessTitle(baseLang);
+  } else {
+	  language = Languages[env.language] || guessTitle(env.language);
+  }
+}
```


## Change 3 (for 11ty): Swap Out eleventy-syntax-highlight

Although eleventy-syntax-highlight provides convenient syntax highlight out of the box for starter projects, it has some limitations. For one, it doesn’t support the building blocks of Prism interoperability: custom HTML classes and attributes.

Eleventy-syntax-highlight uses a mini-language for parsing codeblocks. This makes it convenient to write, but extending it becomes a hassle. You need to extend the parser. And for completeness, you may also need to extend the test cases.

With markdown-it-attr, customisations (via HTML class attributes) can be added to the markdown-it model at the expense of a few extra keystrokes.

Here’s an example:

TODO: codeblock 

TODO: unify spelling of markdown-it

## Benchmarking DOM Libraries

Understandably, one major bottleneck in our strategy is DOM manipulation. A suitable library needs to parse HTML fragments, manipulate DOM elements, and create new ones.

Although I originally selected JSDOM in my quick-n-dirty hack for its popularity, I later switched to domino for significant (2x!) speedup. I made this decision based on a simple benchmark, which compares the three most popular(?) NodeJS DOM-manipulation libraries: [JSDOM](https://www.npmjs.com/package/jsdom), [domino](https://www.npmjs.com/package/domino), and [LinkeDOM](https://www.npmjs.com/package/linkedom).

{% image "assets/dom-benchmark.png", "jw-80", "Benchmark of time to render the ~400 codeblocks on this site with JSDOM, domino, and LinkeDOM." %}

<sup>Benchmark of time to render the ~400 codeblocks on this site with JSDOM, domino, and LinkeDOM.</sup>
{.caption}

| Library  | Mean (ms) | Min. (ms) | Max. (ms) |
| -------- | --------- | --------- | --------- |
| JSDOM    | 583       | 492       | 1007      |
| domino   | 265       | 227       | 477       |
| LinkeDOM | 280       | 214       | 666       |


{% details "Benchmark Details and CLI Output" %}

The benchmark was run on a MacBook Air with a 1.6 GHz Intel Core i5 processor and 8 GB 2133 MHz LPDDR3 RAM.

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


## Final Remarks

I'll be the first to admit — this is a rather crude hack with some loose ends. It would be better to pass codeblock attributes directly to Prism without the extra stringification and parsing.^[Guess I'll leave this as an exercise for the front-end engineers.] But it works! Not to mention, it looks nice with enough CSS! And to some that's all that matters.





