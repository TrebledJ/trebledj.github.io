---
title: Site Updates and Migration to Cloudflare Pages
excerpt: Improvements, Optimisations, and a Better Stack with Cloudflare Hosting
tags:
  - meta
  - writeup
  - web
thumbnail_src: assets/ogle-ogle-cloudflare-pages.jpg
---

This is my second meta post on site development... and a lot has changed! In this post, I'll walk through some changes on the site, along with my assessment and decision-making process on migrating to Cloudflare.

But first things first. Meme.

{% images "h-auto" %}
{% image "assets/ogle-ogle-cloudflare-pages.jpg", "", "Cloudflare Pages looks pretty hot." %}
{% image "assets/yas-cache-policy.jpg", "", "One more item off the Lighthouse checklist!" %}
{% endimages %}


## What's new?

The [previous meta update](/posts/site-migration-to-eleventy) was dated February 4. That time, I revised the site generator, ditching the wavering framework known as Jekyll and moving to Eleventy. This enabled more rapid testing and development of new features, some of which are...

- Frontend
	- Cooler UI(?) - Continuous
	- Modern Web Elements ⚡️: Alerts, Details, Spoiler - May-September
	- Image Lightbox (you can now click on images to *expand* them) - October
	- Link Anchors 🔗 (hover the mouse to the left of headings) - October
- Content
	- [Home Page](/) (uses carousels to cycle through content) - May
	- [Privacy Policy](/privacy-policy) - September
	- Assorted Blog Posts (including a [series on digital audio synthesis](/tags/audio-synthesis-for-dummies), [CTF writeups](/tags/ctf), and [4 new compositions](/tags/composition))  - Continuous
- Optimisations
	- Lazy Loading (iframes, images, disqus) - May
	- Images (responsiveness, etc.) - May
	- JS/CSS Minification - September
	- Migrate from MathJax to KaTeX - November
	- Better Browser Caching for Assets - Now!
- Under the Hood
	- Link Checking (with [Lychee](https://github.com/lycheeverse/lychee); so that you won't encounter broken links 😉) - June
	- Linting (with [eslint](https://github.com/eslint/eslint)) - October
	- Change in Domain Name - Now!

## Migrating Hosting to Cloudflare Pages

While the previous migration dealt with site generation, today's migration is twofold:
1. Migrating the hosting service from GitHub Pages to Cloudflare Pages
2. Migrating the domain name from `trebledj.github.io` to `trebledj.me`

To the point: why the switch? Plenty of users are content with GitHub Pages. Why am I not? Although perfectly suited for simple static sites, GitHub Pages lacks server-side flexibility and customisations.

### Analysis

To be fair, I've debated long and hard between GitHub Pages, Cloudflare Pages, and Netlify. These seem to be the most popular, most mature static site solutions.^[Vercel's also in the back of mind, but after running into login issues, I've decided that Netlify covers most of their features anyway.]

Anyhow, time for a quick comparison:

|                                         | GitHub Pages                                                        | Cloudflare Pages                 | Netlify                 |
| --------------------------------------- | ------------------------------------------------------------------- | -------------------------------- | ----------------------- |
| Deploy from GitHub Repo                 | Yes                                                                 | Yes                              | Yes                     |
| Domain Registration[^reg]               | No                                                                  | Yes                              | Yes                     |
| Custom Domain                           | Yes                                                                 | Yes                              | Yes                     |
| Custom Headers                          | No                                                                  | Yes                              | Yes                     |
| CI/CD                                   | Free (public repos); 2000 action minutes/month ([private][1] repos) | 500 builds/month                 | 300 build minutes/month |
| Server-side Analytics                   | No                                                                  | Yes (detailed analytics: \$\$\$) | Yes (\$\$\$)            |
| Server-side Redirects[^notadealbreaker] | No                                                                  | Yes                              | Yes                     |
| Serverless                              | No                                                                  | Yes                              | Yes                     |
| Plugins                                 | No                                                                  | No                               | Yes                        |

See a more thorough comparison on [Bejamas](https://bejamas.io/compare/github-pages-vs-cloudflare-pages-vs-netlify/).

[1]: https://docs.github.com/en/billing/managing-billing-for-github-actions/about-billing-for-github-actions

[^reg]: Note: Domain registration is done through a *DNS registrar* and usually requires money (~10USD/year). (You might be able to get cheap deals on NameCheap, sans security features.) Cloudflare and Netlify are DNS registrars. GitHub isn't. This isn't really a big deal. But it's more seamless to deploy your site and set a custom domain on the same service where you register your domain.
[^notadealbreaker]: This isn't really a deal breaker, but included for posterity.

Although Netlify and Cloudflare Pages are both strong contenders, I eventually chose Cloudflare Pages for its decent domain name price, analytics, its security-centric view, and a whole swath of other features.

For dynamic sites, Netlify wins hands down. Their plugin ecosystem is quite the gamechanger. But this also comes with the limitation that plugins may also be pricey (e.g. most database plugins come from third-party vendors, which *do* provide free tiers, albeit limited).

For static sites, Cloudflare Pages is optimal.

## Custom Headers: Caching

Custom headers can be used for different things. But one thing that stands out is browser-side caching.

{% alert "info" %}
When a browser loads content, it generally caches assets (images, JS, CSS) so that when the user *visits another page in your domain*, those assets are loaded directly from memory. As a result, network load is reduced and the page loads faster.

The server which delivers the files can tell your browser *how long the files should be cached*, using the `cache-control` header.
{% endalert %}

GitHub Pages tells our browser to only cache for 600 seconds (10 minutes). This applies to *all* files (both HTML documents and assets). On the other hand, Cloudflare Pages has longer defaults and offers more flexibility, especially for assets.

We can use `curl` to fetch headers and compare results. At the time of writing:

```sh
# GitHub Pages
curl -I https://trebledj.github.io/css/main.css | grep cache-control
cache-control: max-age=600

# Cloudflare Pages
curl -I https://trebledj.me/css/main.css | grep cache-control
cache-control: public, max-age=14400, must-revalidate
```

With Cloudflare Pages, our cache duration is longer (4 hours by default). Thanks to their flexibility, we can customise this further by...
- Changing the max-age through Cloudflare's Browser {% abbr "TTL", "time-to-live" %} setting.
- Enabling caching for other files (e.g. JSON search data).
- And more~

{% alert "warning" %}
**High Cache Duration**

Having a high cache duration may sound good, but there's one problem. Newer pages/content may not update immediately. The browser will need to wait for the cache to expire before fetching the content.

One way around this is to use **cache busting**. The idea is to use a different asset file name every time the contents are modified. This way, we can ensure a high cache duration (for assets) with zero "cache lag".
{% endalert %}

By caching static assets for a longer duration, we speed up subsequent page loads. And as a result, our Lighthouse Performance metric improves! (ceteris paribus)

## Sweet Server-Side Spectacles

As you may notice, GitHub Pages sorely lacks server-side customisations, focusing solely on the front-end experience. Let's talk about analytics.

### Analytics

{% alert "warning" %}
Although Cloudflare Pages provides integrated server-side analytics, they are underwhelmingly rudimentary. Detailed analytics (e.g. who visit what page when) are [stashed behind a paywall](https://developers.cloudflare.com/analytics/faq/web-analytics/#can-i-see-server-side-analytics-by-url). So in theory, server-side analytics are great! In practice? 🤑🤑🤑.
{% endalert %}

**Server-side analytics** differ from client-side analytics, where the former relies on initial HTTP(S) requests to the server, and the latter relies on a JS beacon script. The two approaches differ drastically when we consider the performance impact. With server-side, the server does a (tiny) bit of additional processing. Usually, the IP address (`Host`), browser type (`User-Agent`), and referrer (`Referrer`) are already provided by the browser.^[Of course, this HTTP headers may be modified, e.g. by using a VPN.]

However, with client-side, the browser needs to load a separate script, adding to the network bandwidth. Some scripts are lightweight and simple. Some scripts may load a bunch of other scripts which hinder performance, whilst causing a privacy/compliance nightmare (looking at you Google Analytics).

GitHub Pages currently doesn't plan to support server-side analytics ([discussion](https://github.com/orgs/community/discussions/31474)). Cloudflare Pages does, but 💩🤑. It has a privacy-focused client-side solution though.

### Serverless

Serverless is—lightly put—the hip and modern version of backends.^[Yes, "serverless" is a misnomer; ultimately, there are servers in the background. But the idea is that servers are abstracted away from the programmer.] Instead of having to deal with servers, load balancing, etc., we can focus on the functionality. Serverless lends itself well to the [JAMstack](https://jamstack.org/what-is-jamstack/) (JavaScript + APIs + Markup) approach to writing web apps.

Use cases include: dynamic websites, backend APIs, web apps, scheduled tasks, business logic, and [more](https://www.redhat.com/en/topics/cloud-native-apps/what-is-serverless#what-are-some-use-cases).

One reason for moving off GitHub Pages is to prepare for backend needs. I don't have an immediate use for serverless features yet; but if I do write web apps in the future, I wouldn't mind having a platform at the ready.

## Domain Stuff

Several reasons why I switched from `trebledj.github.io` to `trebledj.me`:

- **Decoupling**. I'd rather maintain my own {% abbr "apex domain", "domain name without any subdomains, generally the last two terms of the domain (e.g. github.io, microsoft.com, trebledj.me)" %} rather than rely on `github.io`.
- **Learning**. In the process, I get to touch DNS/networking settings, which are important from a developer and security perspective.
- **Personal Reasons**. Hosting this website on a custom domain name has been a mini-dream. Migrating to Cloudflare definitely eased the integration process between domain name and site.

### Considerations When Choosing a Domain Name

A few tips here.

1. **Choose a top-level domain (TLD) which represents your (personal) brand.** A TLD is the last part of your domain name. For example, in `trebledj.xyz`, the TLD is `.xyz`. Generally:
	- `.com` for commercial use.
	- `.org` for organisations.
	- `.dev`, `.codes` for programmers/software-likes.
	- There are thousands of TLDs to choose from, but I decided to choose `.me` because I'm not a corporate entity.
2. **Check [domain name history](https://www.nameboy.com/how-to-check-domain-history/) for bad/good reputation.** It's possible the domain you're after was once a phishing site, but taken down. In any case, it's a good idea to check if the site garnered bad rep in the past.
3. **Avoid less reputable domains and [TLDs associated with cybercrime](https://circleid.com/posts/20230117-the-highest-threat-tlds-part-2).**
	- .date, .quest, .bid are among TLDs with the highest rate of malicious activity.
	- Even TLDs like .xyz—although used by companies like Alphabet Inc. (abc.xyz)—has garnered enough bad reputation.
	
	{% details "xyz: an unwise choice" %}
	Originally, I wanted to use `trebledj.xyz`. I liked .xyz because it represents who I am—I like to do different things.

	Turns out many firewalls block .xyz, rendering the site inaccessible to many. Not only that, but [emails or links may be silently dropped](https://www.spotvirtual.com/blog/the-perils-of-an-xyz-domain). The .xyz domain is just too far gone... firewalls and the general public have lost faith in .xyz. And for this reason, I switched out of .xyz.

	{% images %}
	{% image "https://spot.ghost.io/content/images/2021/09/voice-xyz-issue.png", "", "Two messages are sent over SMS: one with a .xyz link and the other with .com. Only the message with .com was received." %}
	{% image "~/assets/img/memes/immeasurable-disappointment.jpg", "", "My disappointment is immeasurable and my day is ruined." %}
	{% endimages %}

	Sadly, I wasted 3 bubble teas worth of domain name to learn this valuable lesson. It's a shame that .xyz turned out this way. All those cool xyz websites and domain names out there... blocked by firewalls.

	So I've opted for `trebledj.me`. I would've gone for .io, but it's thrice the price. At least the folks at domain.me seem [committed to security and combatting evil domains](https://domain.me/security/). Kudos to them.
	{% enddetails %}

4. **Choose a domain name provider/registrar.** GoDaddy, Domain.com, Namecheap are some well-known ones. They offer discounts, but security features may come with a premium. Cloudflare has security batteries included, but don't come with first-year discounts.

Further Reading:
- [Palo Alto: TLD Cybercrime](https://unit42.paloaltonetworks.com/top-level-domains-cybercrime/) - Comprehensive analysis of malicious sites, if you're into security and statistics.

## Closing Thoughts

Overall, I decided to migrate to Cloudflare Pages to improve the site's performance and to future-proof it, by having greater control over the backend.

Some more work still needs to be done, though.

- Setting up 301 redirects from the old site, for convenient redirect and migration of site traffic. ([guide](https://finisky.github.io/en/migrate-github-pages-by-301-redirects/); done!)
- Implement longer browser cache TTL + cache busting.

But other than that I'm quite happy with Cloudflare's ease-of-use, despite its day-long downtime (which coincidentally occurred when I was setting up Cloudflare Pages). Setting up the hook to GitHub repos and deploy pipelines were pretty straightforward.