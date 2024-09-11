# trebledj.me
 
[![Build](https://github.com/TrebledJ/trebledj.github.io/actions/workflows/src.build.yml/badge.svg)](https://github.com/TrebledJ/trebledj.github.io/actions/workflows/src.build.yml)
[![Check Links](https://github.com/TrebledJ/trebledj.github.io/actions/workflows/site.links.yml/badge.svg)](https://github.com/TrebledJ/trebledj.github.io/actions/workflows/site.links.yml)
[![Lint](https://github.com/TrebledJ/trebledj.github.io/actions/workflows/src.lint.yml/badge.svg)](https://github.com/TrebledJ/trebledj.github.io/actions/workflows/src.lint.yml)

My personal website. Visit it here: [trebledj.me](https://trebledj.me).


## Copyright, Plagiarism, and Other Legal Palaver

All textual content and opinions expressed are my own, unless otherwise cited. Images come from a variety of sources; some are self-made, some (especially memes) are copied or generated using a pre-existing template.

Code is sewn together from various sources. Feel free to refer to the logic, templating, and design for your inspiration.

Aside from that, please don't plagiarise any of my blog content. If you do reference the content, please link to the relevant post.

This is not a legal notice; just a call to be human.


## Setup

To build:

```sh
# Quick-n'-dirty site generation with live server. Mainly for previewing markdown content.
# Target reload time < 10s.
npm run fast

# Fuller-featured site generation which includes more features than `fast`, but less than `prod`.
# Target reload time < 30s.
npm run dev

# For deployment. No live server.
npm run prod
```

## Credits / Appreciation

This site was inspired and built from many libraries. Mentioning all of them would be a nigh impossible task, as even listing node modules is a nightmare. Regardless, here are some key projects that played a significant role in this site.

* [11ty](https://www.11ty.dev) – Fast and modular SSG. Also: helpful community.
  * [Image Plugin](https://www.11ty.dev/docs/plugins/image/)
  * [Git Commit Date Plugin](https://github.com/saneef/eleventy-plugin-git-commit-date)
  * And many more unmentioned plugins...
* [Lychee](https://github.com/lycheeverse/lychee) – Fast link checker.
* MDN – Excellent documentation and guides as always.
  * [Responsive Images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)
* [Devlopr – Jekyll](https://github.com/sujaykundu777/devlopr-jekyll)
  * Base project that got me started. Even though I've moved on from Jekyll and a lot of the original code, it was still a rewarding (but annoying) experience fixing all the small persistent issues and bugs. What doesn't kill makes me stronger.
  * I still like some things from the original project:
    * Bootstrap/jQuery: Good for starters and prototyping. Although Bootstrap is a bit bloated.
    * SCSS: Enables rapid CSS development. Less headaches.
    * Scroll progress.
    * Navbar.
* Cloudflare Pages – Hosting.
* imgflip – Quintessential Meme Generator.
* Cloudflare Analytics.
* [Yusuke Nakaya's Beautiful Shooting Star CSS Animation](https://codepen.io/YusukeNakaya/pen/XyOaBj).

### 3rd Party Libs
* jQuery.
* Bootstrap.
  * Examples, documentation, guides.
  * Core functionality, without which the site would be much weaker and take a *lot longer* to develop.
  * Alerts. Tooltips. Dropdowns. Modals. Buttons. Carousels.
* [PrismJS](https://github.com/PrismJS/prism) - awesome code highlighting and code block mods.
* [markdown-it](https://github.com/markdown-it/markdown-it) - extensible Markdown parser.
* [KaTeX](https://github.com/KaTeX/KaTeX) – for performant math.
* [sharer.js](https://github.com/ellisonleao/sharer.js) – Abstracts away social links. I just need to worry about the icons and UI.
* [lunr.js](https://github.com/olivernn/lunr.js) – Site-wide Search Engine.
* [Infinite Jekyll](https://github.com/tobiasahlin/infinite-jekyll) – Fit infinite lists on a page.
  * I attempted a [generalisation for SSGs: Infinite Loader](https://github.com/TrebledJ/infinite-loader).
* [CSP Hashes](https://github.com/localnerve/csp-hashes) – Extract CSP hashes from HTML. Reduces attack vector, because we would need to use `unsafe-inline` otherwise...

### Inspirations
Indirect credits that deserve mentioning.

* [Minimal Mistakes](https://mmistakes.github.io/minimal-mistakes/)
  * Things I like
    * Minimalistic design
    * Clean, organised codebase (easy to hack)
    * Alerts (coloured boxes), but I eventually changed to Bootstrap alerts.
    * Sticky profile sidebar on left
* [Chirpy](https://jamstackthemes.dev/demo/theme/eleventy-chirpy-blog-template/)
  * Things I like
    * Sticky TOC sidebar on right
    * Share buttons
