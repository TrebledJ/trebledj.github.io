---
title: Site Migration to Eleventy
description: The devil's in the details.
tags:
 - meta
 - js
thumbnail: /img/posts/misc/ogle-ogle-eleventy.jpg
related:
    disable: true
---

This post contains a brief explanation of this site’s migration and improvement over the last week.

Jekyll and Eleventy (aka 11ty) are static site generators (SSGs)—programs that take us from templated code + blog posts written in Markdown to full-fledged static websites. 11ty is one of the newer, growing SSGs out there. Of course, we can't have a migration post without the appropriate meme. So let's start with that:

![Weow eleventy looks pretty!](/img/posts/misc/ogle-ogle-eleventy.jpg){.w-80}
{.center}

## Rambling About Eleventy

### The Good

Some key things I really like about 11ty so far... (keep in mind I’m coming from Jekyll)...

- Loads of plugins
    - The JS and npm ecosystem is pretty diverse. For context, Jekyll is a ruby library, and its plugins are lacking (in number and maintenance). I’m guessing it’s because most plugins were built for Next.js (another popular, mature SSG) and were modular enough to work with 11ty.
    - Some plugins don’t work straight out of the box. They may need some careful tuning… or there may be an eleventy plugin alternative.
- Flexibility
    - Very easy and flexible to manage [data](https://www.11ty.dev/docs/data-cascade/), including front matter data and site metadata.
    - Pagination is built into front matter and works like a charm.
    - You can add your own Liquid/Nunjuck filters from JS. This way logic is expressed more clearly and concisely. I rewrote my code for finding related posts this way. Some things are better left to JS.
    - You can use a web framework such as React or Vue if you want. But it’s not needed. “*Frameworks come and go*”, as they say.
- [Nunjucks](https://mozilla.github.io/nunjucks/) > Liquid
    - Ah yesss, ternary expressions! Inline math! Comments look nicer as well.
    - Thought that was all? Get **MINDBLOWN** by *importable* macros and template inheritance.
- [Build speed](https://www.zachleat.com/web/build-benchmark/)
    - It’s pretty fast. Comparable to Hugo.
    - Great if you have a thousand posts, though I probably won’t write beyond a couple hundred in my lifetime.
    - In Jekyll, the site took 10-30s to build. 11ty? 2-8s. Maybe I should refactor some JS to make it go even faster.
- Decent templates, active community support (via Discord),

### The Meh

Not everything is rainbows and sunshine. Time to be salty now. Some things I feel iffy with...

- 404 doesn’t work in localhost. It forces(?) me to use a Content Security Policy, which makes the site more secure in hindsight, but it’s annoying to deal with. One reason I decided to remove Google Analytics[^a] was to escape from such trouble.
- Still haven’t figured out how to minify CSS and JS. The architecturing involved seems a bit weird… I may check it out again some time.

## Other Site Improvements

Also, while we’re on the meta topic of this site. You may notice some improvements, such as…

- Better UI components on these posts. The sidebars were made using `position: sticky;` in CSS, along with other magic. Social links are also reorganised and collapse nicely under a button for smol screens.
- The site should feel more minimalist, as I’ve ditched a bunch of cards and borders.
- Figured out how to add a Discord link. :D
- Revised the Home Page. There’s more stuff there now. Go check it out!

There are still a few pages and components I want to migrate and add, but I shall leave those for another time.

[^a]: Yes, I was using analytics. But sssshhh…