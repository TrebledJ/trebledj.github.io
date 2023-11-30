---
title: Site Migration to Eleventy
excerpt: JavaScript go brrrrrrrrr.
updated: '2023-03-09'
tags:
  - writeup
  - programming
  - web
  - js
thumbnail_src: assets/ogle-ogle-eleventy.jpg
---

This post contains a brief explanation of this site’s migration and improvement over the last week.

Jekyll and Eleventy (aka 11ty) are static site generators (SSGs)—programs that take us from templated code + blog posts written in Markdown to full-fledged static websites. 11ty is one of the newer, growing SSGs out there. Of course, we can't have a migration post without the appropriate meme, so let's start with that:

{% image "assets/ogle-ogle-eleventy.jpg", "w-45", "Weow eleventy looks pretty!" %}

## Rambling About Eleventy

### The Good

Some key things I really like about 11ty so far... (keep in mind I’m coming from Jekyll)...

- Loads of plugins
    - The JavaScript (JS) and npm ecosystem is pretty diverse. I’m guessing it’s because most plugins were built for Next.js (another popular, mature SSG) and were modular enough to work with 11ty. For context, Jekyll is a Ruby library, and its plugins are lacking (in number and maintenance).
    - Some plugins don’t work straight out of the box. They may need some careful tuning… or there may be an 11ty plugin alternative. 11ty plugins are more geared towards 11ty compared to regular plugins.
- Flexibility
    - Very easy and flexible to manage [data](https://www.11ty.dev/docs/data-cascade/), including front matter data and site metadata.
    - Pagination is built into front matter and works like a charm.
    - You can add your own Liquid/Nunjucks filters from JS. This way logic is expressed more clearly and concisely. I rewrote my code for finding related posts this way. Some things are better left to JS.
    - You can use a web framework such as React or Vue if you want. But it’s not needed. “*Frameworks come and go*”, as they say.
- [Nunjucks](https://mozilla.github.io/nunjucks/) > Liquid
    - Ah yesss, ternary expressions! Inline math! Comments look nicer as well.
    - Thought that was all? Get **MINDBLOWN** by *importable* macros and template inheritance.
    - Liquid and Nunjucks are templating languages, promoting code and layout reuse. They can also be used to generate post lists, feeds, and data files. With Jekyll, you're stuck with Liquid; but with 11ty, you're free to choose from a variety. Usually people recommend Nunjucks—with good reason too!
    - Although Nunjucks builds [twice as slow compared to Liquid](https://docs.google.com/spreadsheets/d/1-H3wmT7q7m7G7d5M_dCLxQOiAAX3TP0byQdf0pP1fAQ/edit#gid=604275556), this is a fine trade-off considering the sweeter programming experience.
- [Build speed](https://www.zachleat.com/web/build-benchmark/)
    - It’s pretty fast. Comparable to Hugo (which is the fastest SSG out there).
    - Great if you have a thousand posts, though I probably won’t write beyond a couple hundred in my entire lifetime.
    - With Jekyll, the site took 10-30s to build. 11ty? 2-8s. Maybe I should refactor some JS to make it go even faster.
- Active community support (via Discord).
    - To be fair, I never asked for support in the Jekyll forums since the questions I had were already answered.
    - But the people that addressed my 11ty questions were pretty nice.

### The Meh

Not everything is rainbows and sunshine. Time to be salty now. Some things I feel iffy about...

- 404 doesn’t work in localhost. It forces(?) me to use a Content Security Policy, which makes the site more secure in hindsight, but it’s annoying to deal with. One reason I decided to remove Google Analytics[^a] was to escape from such trouble. Although... I _was_ using the beta version... so there were bound to be bugs...
- Still haven’t figured out how to minify CSS and JS. The architecting involved seems a bit weird… I may check it out again some time.
    {% alert "success" %}
        **Update!**

        After digging through [GitHub issues](https://github.com/11ty/eleventy/issues/344), I finally got JS minifying to work using [Passthrough Copy](https://www.11ty.dev/docs/copy/) and an underlying [`transform` option](https://github.com/timkendrick/recursive-copy#usage).
    {% endalert %}
- Less mature. Granted, new technology is always less mature. 11ty has fewer examples compared to Jekyll, but [the][starter-1] [ones][starter-2] that are available are pretty good.

[starter-1]: https://github.com/11ty/eleventy-base-blog
[starter-2]: https://github.com/google/eleventy-high-performance-blog

## Other Site Improvements

Also, while we’re on the meta topic of this site. You may notice some improvements, such as…

- Better UI components on these posts. The sidebars were made using `position: sticky;` in CSS, along with other magic. Social links are also reorganised and collapse nicely under a button for smol screens.
- The site should feel more minimalist, as I’ve ditched a bunch of cards and borders.
- Figured out how to add a Discord link. :D
- Revised the [Home Page](/). There’s more stuff there now. Go check it out!

There are still a few pages and components I want to migrate and add, but I shall leave those for another time.

[^a]: Yes, I was using analytics. But sssshhh…