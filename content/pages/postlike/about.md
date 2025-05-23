---
title: About
---

{% from "post/preview.html" import render_post_preview with context %}

## About This Website

This website breathed its first breath in summer of 2022. I had a bit of free time and wanted a place to share thoughts, music, etc. I also wanted it to be customisable; most {% abbr "mainstream CMSs", "content management systems (e.g. Weebly, Wix, Medium)" %} are limited and force my hands to be tied.

You may see some posts "published" prior to 2022. Those are usually older projects or experiences which I've included for posterity. The dates there typically indicate the date the experience ended.

### Optimised for Reading Experience

I strongly believe in a good, accessible reading experience. This means building content-first user experiences, optimising performance, applying responsive design, and following accessibility standards. This is why I love and incorporate elements such as Table of Contents and alerts/callouts.

Readers shouldn't have to be ticked by text flowing off the screen, and they shouldn't be bombarded by ads on a sticky banner. Information deserves to be presented in a digestible format. Important points deserve to be highlighted.

A number of websites these days prioritise cash flow through paywalls, subscriptions, and invasive ads, ruining user experience in the process. Sure, we have different objectives. Businesses often employ blog posts for marketing, SEO, and revenue-generating purposes. But I'm not a business, and I believe user experience comes first.

{# Personally, I'm not against ads as long as they're non-invasive, don't ruin the reading experience, and respect privacy. I may or may not introduce ads in the future; but if I do, you can rest assured I'll carefully select an appropriate ad provider and place ads without compromising user experience. #}

### Recent Site News

{% set siteNews = collections.meta | head(3) | reverse %}
<div class="post-preview-list mt-2">{% for post in siteNews %}{{ render_post_preview(post) | nl2br | brSafe | safe }}{% endfor %}</div>

## About Me

{{site.author.bio}}

In case pronouns matter to you, I identify as ~~an attack helicopter~~ he/him.

### Hobbies and Interests

#### Programming and Software Development

{% tag "programming" %}

{% details "It was a wild (but fun) journey. I started programming in Grade 9 (~中三) with Khan Academy's Intro to JS modules..." %}
Then I got stuck with prototypes.  
Moved to [C++](/tags/cpp/).  
Got stuck with pointers.  
Cried internally for a week.  
Got stuck with linked lists.  
Played with Lua using my calculator's scripting engine.  
Learnt recursion by reverse engineering a Minesweeper implementation in Lua.  
Played Minesweeper and 2048 on my calc when bored in class.  
Made a [{% abbr "POS", "point-of-sale" %} desktop application with Qt](/posts/e-payment-desktop-application).  
Learnt template metaprogramming.  
Procrastinated a lot by playing Codingame.  
Answered a bunch of StackOverflow questions.[^stack-overflow]  
Learnt [Python](/tags/python/).  
Learnt LaTeX.  
Wrote a 4000-word mathematics essay on a programming challenge.  
Played [Advent of Code](/tags/aoc/).  
Learnt [Haskell](/tags/haskell/).  
Got stuck with monads.  
Got stuck with Cabal (no, not Cobol).  
Got stuck with Haskell Stack (Haskell's build management system).  
Got stuck figuring out mutable arrays.  
Got stuck with higher-rank type polymorphism.  
Learnt [Rust](/tags/rust/).  
Got stuck with the borrow checker.  
Got stuck with linked lists (again).  
Cried.  
Picked up JS again.  
Built this website. Tada?
{% enddetails %}

[^stack-overflow]: Being on StackOverflow also helped me learn by 1) digging deeper into languages in the process of answering, and 2) learning from better answers, what techniques are better/worse. Also, contrary to popular belief, most communities don't seem that toxic? I'm guessing just the mainstream ones (JS).

{# See [*Collaborating*](#collaborating) for various topics to collaborate on. Most have a software component. #}

#### Music Composition

{% tag "composition" %}

My composing journey began in Grade 10 (～中四) when my music teacher assigned composition homework. Not only that—he introduced us to interesting composition techniques and took us on a (theoretical) tour analysing Joe Hisashi's Studio Ghibli music. Since then, I've been writing down ideas and organising them into coherent pieces.

In uni, I picked up electronic music composition (mixing/production) during a course taught by Prof. Timothy Page.

I like listening to music without words (this rules out pretty much all songs), as words tend to constrain interpretation and imagination. Speeches can't function without words; it'd be ambiguous otherwise.

Some of my favourite composers:
- JS Bach
- Shostakovich
- John Adams
- Steve Reich
- Hans Zimmer
- Joe Hisaishi

Things I'm interested in exploring:
- Modes, {% tag "Modal", "modal" %} Harmony
- Microtones, {% tag "Microtonal", "microtonal" %} Harmony
- {% tag "Minimalism", "minimalism" %}

Huh, that's a lot of M's.

If you ask me, these are some of my favourite self-compositions:

{% set favMusicPosts = collections.postsr | getPostsBySlug(['relay', 'remorse', 'the-breath-of-life']) %}
<div class="post-preview-list mt-1">{% for post in favMusicPosts %}{{ render_post_preview(post) | nl2br | brSafe | safe }}{% endfor %}</div>

#### Recreational Mathematics/Programming

I enjoy the occasional mathematical/coding challenge. My ears perk up at the mention of:
- Khan Academy (immensely helpful for exploring high school maths),
- Project Euler (math + coding),
- Codingame (super fun interactive element to coding), and
- Advent of Code {% tag "aoc" %} (who doesn't want to save Santa and see dumbo octopi?).

There was a time when I procrastinated schoolwork by visiting these sites. Sadly, those days are long gone, and I lack the time to continue tinkering on these platforms.

#### Embedded Systems

{% tag "embedded" %}

A fun pastime that began in uni. There's a whole world of practical considerations and opportunity in these little devices that connect the physical world with the realm of software!

#### Capture-the-Flags (CTFs)

{% tag "ctf" %}

A fun competitive pastime I picked up in my last few years of uni. You get to learn cybersecurity—in the form of binary/web exploitation, reverse engineering, cryptography, and other knick-knacks—all while having fun earning points (and taking away an occasional prize).

Things I'm interested in exploring:
- {% tag "Reverse", "reverse" %} Engineering
- Hack the Box (online CTFs + community)


### Education

I graduated from the [Hong Kong University of Science and Technology](https://hkust.edu.hk/) in May 2023, where I studied a combination of mathematics, computer science, and music. Fun times.


{# ### Collaborating

I have several project ideas, the scope of which is beyond my capacity given my full-time work. I’ve kept the description generic for certain reasons.

- Novel Music Instrument on an Embedded Device
	- Looking to work with... embedded/mechatronic engineers who are also music enthusiasts.
- Music-Based, Cross-Platform 2D/2.5D Game with Dynamic and Adaptive Music
	- (No, I’m not thinking of rhythm games, but I’m open to other ideas.)
	- Looking to work with... game designers/programmers who are also music enthusiasts.

If you’re interested in collaborating, hit me up. #}


## FAQ

### Personal

#### Why did you choose to study mathematics in uni?

I didn't know what I wanted to do career-wise. So I looked for a subject I liked which also provided broad career options. With mathematics, one can go into actuary, statistics, finance, physics, machine learning, data science, software engineering, research, teaching, and more.

#### Why is your LinkedIn so... professionally unprofessional?

You mean you don't have a sense of humour?

#### Why do you believe in all this Jesus stuff?

Because I see value in it.

{% details "Is there a God out there?", "open" %}
I believe we were created with a purpose, for a purpose. It doesn't really make sense to me that we just poof'ed into existence from nothing. The [mathematician John Lennox argues](https://youtu.be/VrIvwPConv0?si=jxHqqO2IVNwmA8X2&t=124) like so:

> But people are now desperate to show the universe created itself from nothing, which seems to me to be an immediate oxymoron. If I say "*x* created *y*", I'm assuming the existence of *x*, I have to explain the existence of *y*. If I say "*x* created *x*", I'm assuming the existence of *x*, I have to explain the existence of *x*.

So yes, I believe there is a God out there.
{% enddetails %}

{% details "On Christianity", "open" %}
It's worth mentioning that Christianity is a nuanced faith. Although we worship the same God (at least in name) as the God in the Catholic, Islamic, and Judaic faith, our principles and values are fundamentally different.

But it gets murkier. Christianity itself has many branches and sub-branches (aka denominations and sub-denominations). Between branches, we disagree when it comes to emphasis on certain spiritual gifts, debatable metaphysical concepts, and other things.

So just be aware that "Christianity" is an umbrella term for many similar beliefs, like Elgar's Enigma Variations.
{% enddetails %}

{% details "So why Christianity?", "open" %}
My belief comes down to two factors: personal and factual.

The personal stuff is rather cheesy and not really suited to a public webpage. So Imma skip it.

If we look at the hard evidence, it becomes clear the Bible isn't merely a story book. It's the amalgamation of multiple authors preserved over thousands of years. Evidence? There's [plenty](https://www.gotquestions.org/Bible-reliable.html). Cross-references? [Tons](https://www.chrisharrison.net/index.php/visualizations/BibleViz#:~:text=63%2C779%20cross%20references). ~~Hotel? Trivago.~~
{% enddetails %}

Ultimately, my faith is both personal and communal. It forms a part of my identity, whilst being shared with others. And this communal, spiritual component bridges people together, even if we're from completely different backgrounds or hate each other's guts.

This isn't much of an apologia, and perhaps I've left you with more questions than answers. But hopefully this rationale is sufficient for now. I'm open to (reasonable) questions.

### This Website

#### Why doesn't your website support Internet Explorer and Opera Mini?

The technologies used to build this blog only support modern browsers. And I've decided not to be bogged down by maintaining backwards-compatibility. This site *should* work for 95-97% of users globally.[^2] The remaining 2-5% either use IE/Opera Mini or use an outdated version of Chrome/Firefox/Edge/etc.

[^2]: Checked with [caniuse.com](https://caniuse.com/).

I am sorry if this inconveniences you. I also feel sorry for you, if you're forced to live with those browsers.

#### Why did you build your site with Vanilla JS and not React/Angular/Vue/\{\{insert cool technology\}\}?

Unfamiliar technologies. Also, there's not much user interaction anyway? The UI seems simple? I don't really see the need for them.

Moreover, I want the site to be hackable (in the open-source sense) and approachable by newbs.

#### Why did you choose Eleventy as your site generator?

- Framework-independent.
- Nunjucks is a more powerful templating language compared to Liquid, so I get to iterate more quickly. Pains here are Nunjuck macros don't work with async (contributing to longer build times), and error message interop with Eleventy is hard to decipher.
- Loads of decent Eleventy plugins by decent folks.
- JS and Node are mature ecosystems, so some libraries just work™. The only major pains are import styles (ESM vs. CommonJS) and bloat (libraries/tooling).
- Active community/development.

See also: [Site Migration to Eleventy](/posts/site-migration-to-eleventy/).
