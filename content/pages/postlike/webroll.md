---
title: Webroll
---

Curated list of awesome blog posts, papers, and resources by others. This page is inspired by the concept of a blogroll which is not uncommon across the indieweb. I decided to give it a little twist, sharing specific articles I found interesting, rather than focusing on the blog themselves. That may change in the futurel there's lots of cool indie blogs out there. Sorted by most recent reads at the top, ignoring sections. I'll try to better organise all this later.

- [Competence as Tragedy](https://crowprose.com/blog/competence-as-tragedy/) by crowprose {% tag "misc" %}, thoughtpiece
- [How AI Impacts Skill Formation](https://arxiv.org/abs/2601.20245) by Judy Hanwen Shen and Alex Tamkin {% tag "learning" %} {% tag "ai" %}, whitepaper, also provides some insights on how to best use AI
- [The First Few Milliseconds of an HTTPS Connection](https://www.moserware.com/2009/06/first-few-milliseconds-of-https.html) by Moserware {% tag "web" %} {% tag "networking" %} {% tag "dev" %}
- [Reverse Engineering TicketMaster's Rotating Barcodes (SafeTix)](https://conduition.io/coding/ticketmaster/) by conduition {% tag "writeup" %} {% tag "hacking" %} {% tag "reverse" %}
- [boehs.org/llms.txt](https://boehs.org/llms.txt) {% tag "misc" %} {% tag "amusing" %}, counter-instructions for LLMs, based on the llms.txt standard
- [Attacking and securing cloud identities in managed Kubernetes part 1: Amazon EKS](https://securitylabs.datadoghq.com/articles/amazon-eks-attacking-securing-cloud-identities/) by datadog securitylabs {% tag "hacking" %} {% tag "cloud" %} {% tag "writeup" %}, comprehensive reference for escalation scenarios in AWS EKS
- [Pwning Millions of Smart Weighing Machines with API and Hardware Hacking](https://spaceraccoon.dev/pwning-millions-smart-weighing-machines-api-hardware-hacking/) by spaceraccoon {% tag "hacking" %} {% tag "writeup" %} {% tag "networking" %}, web and Bluetooth hardware hacking; the dude has a lot of cool writeups in general
- [Belgium is unsafe for CVD](https://floort.net/posts/belgium-unsafe-for-cvd/) by Floor Terra {% tag "infosec" %} {% tag "cvd" %} {% tag "misc" %} {% tag "amusing" %}, some insights and nuances in CVD (Coordinated Vulnerability Disclosure)
- [CVE / NVD doesn’t work for open source and supply chain security](https://crashoverride.com/blog/cve-nvd-doesnt-work-for-open-source-and-supply-chain-security) by Mark Curphey {% tag "infosec" %} {% tag "misc" %} {% tag "cvd" %}, highlights multiple issues with CVE/NVD in the open source ecosystem
- [Multiple Critical Vulnerabilities in Strapi Versions <=4.7.1](https://www.ghostccamm.com/blog/multi_strapi_vulns/) by ghostcamm {% tag "web" %} {% tag "hacking" %} {% tag "writeup" %}
- [A virtual DOM in 200 lines of JavaScript](https://lazamar.github.io/virtual-dom/) by Marcelo Lazaroni {% tag "dev" %} {% tag "web" %}
- [How, and why, a journalist tricked news outlets into thinking chocolate makes you thin](https://www.washingtonpost.com/news/morning-mix/wp/2015/05/28/how-and-why-a-journalist-tricked-news-outlets-into-thinking-chocolate-makes-you-thin/) (paywalled) by The Washington Post {% tag "misc" %}, news article on a sting operation exposing bad journalism; IMO the science communication and infosecurity industry faces similar issues (sometimes)
- [Exploring Mimikatz - Part 1 - WDigest](https://blog.xpnsec.com/exploring-mimikatz-part-1/) by xpn {% tag "hacking" %} {% tag "windows" %} {% tag "writeup" %}, in-depth dig into one of mimikatz's many modules
- [Windows Internals Resources](https://empyreal96.github.io/nt-info-depot/) {% tag "windows" %} {% tag "learning" %}, collection of useful resources on the guts of Windows
- [How I hacked medium : The Rise Of Race Conditions](https://medium.com/@super_burgundy_weasel_439/how-i-hacked-medium-and-they-didnt-pay-me-f6c89cca3af7) by YouGotItComing {% tag "hacking" %} {% tag "cvd" %} {% tag "web" %} {% tag "writeup" %}, interesting intro to race conditions and some bug bounty drama
- [On Hacking](https://stallman.org/articles/on-hacking.html) by Richard Stallman {% tag "hacking" %} {% tag "misc" %}, history and origins of the term "hacking"
- [Orange Cyberdefense AD Attack Path Mindmaps](https://orange-cyberdefense.github.io/ocd-mindmaps/) {% tag "hacking" %} {% tag "windows" %} {% tag "ad" %} {% tag "learning" %}
- [hack back](https://gist.github.com/jaredsburrows/9e121d2e5f1147ab12a696cf548b90b0) {% tag "hacking" %} {% tag "misc" %} {% tag "writeup" %}, comprehensive, didactic writeup of a vigilante operation
- [Evolution of Trust](https://ncase.me/trust/) by Nicky Case {% tag "learning" %} {% tag "misc" %}, interactive game on prisoner's dilemma, community, and trust

---
{# ### Dev/Infosec Drama #}

Fun drama worth sharing. I share these not to ridicule, but because there's always something to learn from these interactions. And some of these are here simply coz they're amusing.

- [AI Agent writes ad hominem blog post after having PR rejected](https://github.com/matplotlib/matplotlib/pull/31132) - GitHub Issue, an interesting interaction and situation
- [.NET CVE-2025-55315](https://github.com/dotnet/aspnetcore/issues/64033) - GitHub Issue, drama around a 9.9-score request smuggling CVE
- [notepad++ CVE-2025-56383](https://github.com/zer0t0/CVE-2025-56383-Proof-of-Concept/issues/1) - GitHub Issue, drama around risk and local vectors of a Notepad++ "CVE"
- [Dev rejects CVE severity, makes his GitHub repo read-only](https://www.bleepingcomputer.com/news/security/dev-rejects-cve-severity-makes-his-github-repo-read-only/) - BleepingComputer
- [I am new to GitHub and I have lots to say](https://www.reddit.com/r/github/comments/1at9br4/i_am_new_to_github_and_i_have_lots_to_say/) - reddit
- [dnsmasq v VulDB](https://seclists.org/oss-sec/2025/q4/114) - seclists, dnsmasq risk and CVD drama
- [Death by a thousand slops](https://daniel.haxx.se/blog/2025/07/14/death-by-a-thousand-slops/) by Daniel Stenberg, AI slop vuln reports on the curl project
- [How one programmer broke the internet by deleting a tiny piece of code](https://qz.com/646467/how-one-programmer-broke-the-internet-by-deleting-a-tiny-piece-of-code) - quartz, leftpad npm supply chain drama

{# ### Quotes

> A user interface is like a joke. If you have to explain it, it’s not that good.  
> \- Martin LeBlanc

[Source](https://x.com/martinleblanc/status/466638260195041280?lang=en) #}

{% inlinecss %}
.jtag {
    pointer-events: none;
}
{% endinlinecss %}