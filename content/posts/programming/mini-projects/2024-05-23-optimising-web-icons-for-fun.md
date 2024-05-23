---
title: Optimising Web Icons for Fun
excerpt: Ejecting unused cargo has never been so exhilarating.
tags:
  - web
  - performance
  - meta
  - notes
thumbnail_src: assets/webicons/icons-thumbnail.png
---

I decided to spend this Labour Day doing a bit of frontend performance engineering and learn Typescript along the way. I've been eyeing my Font Awesome (FA) assets for a while, and lately they've been a curious itch.

Here’s the dealio: icon webfonts are known to bundle *all* icons. This includes icons we don't use. For Font Awesome, this means 19kB CSS + 287kB WOFF2 gzipped. But my site just uses 40 out of 2000… so why am I downloading 90% dead data?^[287kB gzipped comes from fa-brands, plus fa-regular, plus fa-solid. Fortunately, these variants are only downloaded if used. 2000 icons just counts solid, regular, and brands. Imagine the number of icons if premium FA was used!]

{% image "assets/webicons/fonts-are-pretty-heavy.jpg", "w-50", "I present you the heaviest objects in the universe: Font Files." %}

The modern web standard is to use inline SVGs (Scalable Vector Graphics) instead of webfonts. As its name suggests, SVGs scale nicely to any screen size and remove the need for font files. For the curious, Font Awesome wrote a solid comparison between webfonts and SVGs [*here*](https://blog.fontawesome.com/webfont-vs-svg/).

Unfortunately, replacing webfonts with SVGs is not a simple *find-and-replace*. If it were, I would've included it in this analysis. After a painful struggle migrating a few icons, I decided to drop the ordeal and come back later. Didn't really feel like tuning CSS.

So I turned my attention to slimming down webfonts like Garfield doing cardio. But before I explain the process, let's understand how icon webfonts work.

## Icon Webfonts Under the Hood <i class="fa-brands fa-redhat"></i>

### Fonts and Unicode <i class="fa-regular fa-face-smile"></i>

There are various font formats: WOFF, TrueType, OpenType. These are essentially different ways to compress and store fonts. WOFF2, for instance, is a modern compression format optimised for the web.^[[Google Font Glossary: Web Font](https://fonts.google.com/knowledge/glossary/web_font)]

Ultimately, fonts are mappings from integer codepoints to glyphs. These codepoints are standardised by the [Unicode Standard](https://www.unicode.org/standard/standard.html) and are expressed in the format `U+[0-9A-F]{4,6}`, i.e. “U+” followed by 4-6 hexadecimal digits. For example, the number U+0030 maps to "0", and U+0041 maps to "A", U+2206 maps to "∆" (delta), and U+6C34 maps to "水".

{% alert "warning" %}
Codepoints are *not* to be confused with UTF-8, UTF-16, and UTF-32, which are different ways to efficiently store Unicode characters in byte format.
{% endalert %}

You may be wondering: so what codepoints map to icons? This is up to icon packs to define. Since most icons are custom by nature, they're usually placed in custom regions known as Private Use Areas, reserved by the Unicode Standard. One such region is U+E000 – U+F8FF.

### Fonts and CSS <i class="fa-brands fa-css3-alt"></i>

For webfonts to work, codepoints need to exist in the HTML text. But that's terribly inconvenient — writing magic numbers makes for hard-to-maintain code.

This is where CSS comes in. Specialised CSS rules connect the HTML code to the exact font glyph via a two-step process: 1) identifying the font file and 2) identifying the codepoint. Once the browser has these two pieces of information, it can render the glyph.

Suppose we write the following HTML code:

```html
<i class="fas fa-rocket"></i>
```

1. The font file is determined by matching the assigned font with the custom font face. The `fas` class is key here.
   
    ```css
    .fas {
      font-family: "Font Awesome 6 Free"
      font-style: normal;
      font-weight: 900;
    }

    @font-face {
        font-family: "Font Awesome 6 Free";
        font-style: normal;
        font-weight: 900;
        font-display: block;
        src: url(../webfonts/fa-solid-900.woff2) format("woff2"), url(../webfonts/fa-solid-900.ttf) format("truetype")
    }
    ```

2. The codepoint is inserted with a `:before` pseudo-element. For `fa-rocket`, this is U+F135.
  
    ```css
    .fa-rocket:before {
      content: "\f135"
    }
    ```

It's a lot of indirection, and this is one reason why SVGs are preferred; but hey, this was the gold standard a decade ago.

### Multiple Variants <i class="fas fa-circle"></i> <i class="far fa-circle"></i>

To complicate matters, FA fonts have different **variants**, and they modularise this by using the same codepoint, but separate font files. Not all fonts do this though. Devicon packs all their styles into a single font file. Here are some examples of FA styles.

<style>
  .icon-table {
    td {
      text-align: center;
      vertical-align: middle;
    }
  }
</style>

{% table "icon-table" %}

|                         | Solid                            | Regular                          | Brands                        |
|-------------------------|----------------------------------|----------------------------------|-------------------------------|
| `fa-star` (U+F005)      | <i class="fs-4 fas fa-star"></i>      | <i class="fs-4 far fa-star"></i>      |                               |
| `fa-user` (U+F007)      | <i class="fs-4 fas fa-user"></i>      | <i class="fs-4 far fa-user"></i>      |                               |
| `fa-thumbs-up` (U+F164) | <i class="fs-4 fas fa-thumbs-up"></i> | <i class="fs-4 far fa-thumbs-up"></i> |                               |
| `fa-github` (U+F09B)    |                                  |                                  | <i class="fs-4 fab fa-github"></i> |

{% endtable %}

## An Icon Dieting Plan <i class="fa-solid fa-dumbbell"></i>

With the backstory out of the way, let's discuss the high-level algorithm.

In my mind, all we have to do is post-process the generated static files like so:

- Crawl the HTML files for a Font Awesome CSS. Parse the CSS and associated WOFF2 font files.
- Crawl the HTML files (and perhaps other files) for used icons.
- Construct a font file containing the minimum icons. We may also need to remap codepoints to resolve clashes.
- Construct a CSS file containing the new mappings from icon class (e.g. `.fa-star`) to codepoint.
- Write the CSS and font files.
- Replace the original CSS links with the new CSS file.
- Celebrate!

To no one's surprise, this shaved off more than 97% bytes. A success! Or is it?

## Where speed? <i class="fa-solid fa-poo"></i>

As with many things in engineering, one metric rarely provides good coverage.

After integrating the minification into my build process, I excitedly waited for the site to build. I opened Chrome dev tools, loaded my site, and... what?! It was slower? Okay, maybe it was the first load, and the page wasn't cached on the edge.

But even after refreshing multiple times, the **Time to First Byte (TTFB)** was roughly the same compared to loading the original files.

{% image "assets/webicons/y-server-no-fast.jpg", "w-60", "Server - why u no fast?" %}

The answer? CDN.

{% alert "success" %}
What is a CDN? CDNs (Content Delivery Networks) are servers deployed all over the globe, optimised to deliver assets such as JS, CSS, images, and fonts.

Moreover, if the file is guaranteed to *not* change (e.g. a versioned library asset), then the server can return a high browser cache duration, typically 1 year. Subsequent requests can just reuse the downloaded file.
{% endalert %}

The [original](https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css) [files](https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/webfonts/fa-solid-900.woff2) are delivered over a CDN. On the other hand, the minified files are served from Cloudflare Pages. Further, CF Pages may perform modify the URL/request/response via Page Rules or Cache Rules, and this built-in server-side processing takes a toll on the response speed.

I benchmarked the response speed of delivery by CDN versus the site directory. The methodology is simple: collect download times from multiple points around the world, repeat this a couple times, and find the median. And we perform this for 6 different asset files.

Turns out, cdnjs.cloudflare.com delivers almost 50% faster.

| Asset                   | Total Time (in ms)[^note:time] | Total Time x3 (in ms)[^note:time3] |
| ----------------------- | ------------------------------ | ---------------------------------- |
| CSS (cdn; unminified)   | 17                             | -                                  |
| CSS (site; unminified)  | 29                             | -                                  |
| CSS (site; minified)    | 29                             | -                                  |
| Font (cdn; unminified)  | 21                             | 63                                 |
| Font (site; unminified) | 38                             | 114                                |
| Font (site; minified)   | 47[^note:latency]              | -                                  |

<sup>Font Awesome Free 6 benchmark for downloading assets from a CDN vs Cloudflare site. Here, unminified/minified refers to whether files contain excess icons; it does not refer to excess whitespace. The expectation is that minified assets are faster. ([Data](https://docs.google.com/spreadsheets/d/1UBUJGIhmdYql2lPz5tYWn6A97iVz1V40YIC2d6iz_vo/view))</sup>{.caption}

[^note:time]: Total Time includes DNS resolve time + connection time + download time. Times are sourced from [uptrends.com](https://www.uptrends.com/tools/cdn-performance-check). (Not sponsored. It just seems to have the largest coverage.)
[^note:time3]: Total Time x3 applies when multiple font files are downloaded. This is used to provide a more accurate representation of resources used.
[^note:latency]: The deviation between "Font (site; *unminified*)" and "Font (site; *minified*)" is most likely due to network latency and jitter.

I did leave out one detail though. The minified font is packaged in *one* file. The original FA fonts are delivered in *three, separate* files (Solid, Regular, Brands). If we account for this by multiplying unminified font results by a factor of 3, I think it's fair to say we have ourselves a win.

{% alert "info" %}
Another thing to consider: CDN assets may also be used by other sites, meaning the assets may already be cached. 10 sites using the same CDN font asset is better than 10 sites using minified font assets. If we browse these 10 sites, the former gives 1 set of downloads + 9 cache hits, while the latter has 10 sets of downloads + *0* cache hits.

Aside from the glaring potential for a delightful, thought-provoking discussion on collectivism and individualism, this begs the question: *is it really worth it?*
{% endalert %}

## Cache Busting with Cloudflare Cache Rules <i class="fa-solid fa-gavel"></i>

Similar to a CDN, we would like to take advantage of browser cache by providing a high cache time. This way, if the user visits the site across the week, they wouldn't need to re-download the measly 8kB of gzipped assets. This is ideal for sites that update sporadically.

You're probably thinking — come on, it's just 8kB, are you masochistic? And my response would be: it's a potential saving of 100ms for return visitors, and yes.

By default, Cloudflare Pages has a browser cache time of 4 hours. We can change this duration by modifying the `Cache-Control` header.

{% image "assets/webicons/cloudflare-create-cache-busting-rule.png", "", "Creating a cache busting rule in Cloudflare. Cloudflare allows us to configure based on URI patterns." %}

<sup>Create a cache-busting rule for URI paths starting with `/cb/`.</sup>{.caption}

{% image "assets/webicons/cloudflare-set-browser-ttl.png", "", "Configure the browser cache duration to 1 year." %}

<sup>Set the cache time to 1 ~~century~~ year.</sup>{.caption}

{% image "assets/webicons/cache-busting-works-in-browser.png", "", "We got the expected Cache Control header." %}

<sup>It works!</sup>{.caption}

We've applied cache-busting to the `/cb/` path. All that's left is to make sure our new assets are written to `_site/cb/`; but more importantly, that **the file name changes between different versions**. This is super important.

If we updated our CSS/font file, we need to tell the browser: "Hey! Download and cache the new version online. Don't use the old cached file!" Changing the file name is the best way to force a cache-miss. Nothing complex. We can just append the file hash to each file.

I used the first 8 bytes of MD5, but any common hash will do. Now our files resemble `/cb/webfonts/icons-10736075e7883838.woff2`.

We just need to propagate this to our CSS, then HTML files, and we're done!

## Closing Remarks <i class="fa-solid fa-glass-water"></i>

The code is a bit of a handful, but I've uploaded it on GitHub: [TrebledJ/icon-minifier](https://github.com/TrebledJ/icon-minifier). Taking inspiration from other projects, I designed it to work as a CLI tool, but you can also import the API. Currently, it only handles Font Awesome fonts. I may add other webfonts later, and maybe have an SVG integration. Pull requests are welcome.

I should also point out that icon minification isn't a new problem. In fact, there are [some](https://github.com/aui/font-spider) [general](https://github.com/eHanlin/font-generator) [solutions](https://github.com/ecomfe/fontmin) designed to minify fonts. These are designed to compress fonts with many characters such as Chinese, Korean, and Japanese; though some work with icons too. Of the three, [Font Spider](https://github.com/aui/font-spider) has the most comprehensive features.^[It even has a punny Chinese name! 字蛛!]

Given the mediocre results, I'll continue keeping an eye on CDN performance and perhaps move on to better alternatives. Next step: mentally prepare myself to wrangle some CSS, and migrate to SVGs.
