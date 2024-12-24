---
title: 12 Days of Christmas – 2024 Cybersecurity Edition
excerpt: Insights, observations, and reflections from a penetration tester on how to better secure your ~~sh\*t~~ systems.
tags: 
  - software-engineering
  - web
  - reflection
thumbnail_src: assets/thumbnail.jpg
thumbnail_banner: true
related:
    tags: [infosec]
---

I've been pentesting various systems for a little more than a year, diving into a variety of web apps, mobile apps, IoT devices, desktop apps, and the occasional Active Directory network. Some were ancient projects wielding unmaintained code. Some were using popular modern tech stacks. Each software was unique, but a lot were plagued by common issues.

So to end this year, I thought it would be nice to reflect on the technical shenanigans I've picked up, and to share some observations with the IT industry. In this post, I’ll present 12 observations/tips to help you secure your systems, supplemented by anecdotes from breaking terrible software. We'll go from non-technical comments to more technical bugs. (But not too technical, I promise, I'll save those for other posts.)

1. [Humans (and processes) are the weakest link.](#humans-are-the-weakest-link)
2. [General Comments](#general-comments)
3. [Software Components and the Supply Chain](#software-components-and-the-supply-chain)
4. [Common Bug Classes](#common-bug-classes)

*Disclaimer: All examples included below are based on examples from real-life penetration tests, but details have been fudged to protect confidential information ~~and ensure I don’t get fired~~. No mention/screenshots of the original targets are included.*

## Humans (and processes) are the weakest link

Here's a great quote by a well-known cybersecurity professional:

> *People often represent the weakest link in the security chain and are chronically responsible for the failure of security systems.*  
>  \- Bruce Schneier

While this is a common occurrence with phishing attacks, sometimes I think this puts too much responsibility on humans. It's also crucial to develop processes to counter threats at the macro/institutional level, rather than just the micro level.

Let's start by busting a myth.

### 1. Myth: Modern tech is secure and bug-free

> Modern tech is secure and bug-free. A modern language/library/framework will handle security for us.

Wrong! Modern tech isn't immune to security issues, let alone bugs. It may *employ more secure design principles*, but that doesn't eliminate every single class of security issues.

Here are a few examples:

- I’ve witnessed Vue, React, and NextJS apps riddled with bugs, including broken logic, broken authentication, and injection vulnerabilities. (ChatGPT? Is that you?)
- HTMX, [if used improperly](https://htmx.org/essays/web-security-basics-with-htmx/), exposes an app to cross-site scripting (XSS). This issue is further compounded by forcing `unsafe-eval` in your site's [Content Security Policy](https://www.sjoerdlangkemper.nl/2024/06/26/htmx-content-security-policy/).
- Rust has its fair share of [deserialisation](https://www.cve.org/CVERecord?id=CVE-2023-50711) and [integer overflow](https://www.cvedetails.com/cve/CVE-2018-1000810/) issues.

Using modern technology is not an excuse to eliminate security programs.

But why is software still insecure even though the tech is new?

### 2. An application is as secure as its weakest link

A common saying in cybersecurity goes like this:

> *Attackers only have to be right once. Security teams need to be right all the time.*

This isn’t exactly true, depending on how you apply defences and controls; but it does highlight how a **single weak link compromises security**, bypassing the hard work applied elsewhere.

{% image "assets/vulnerable-component.jpg", "jw-60", "TODO" %}

<sup>Remember [Log4Shell](https://en.wikipedia.org/wiki/Log4Shell)? Such an exciting Christmas.</sup>{.caption}

Ultimately, this comes down to humans and processes.

1. **Humans.**
   - Many breaches start from an innocuous phishing email. A couple of clicks is all it takes to compromise a computer.
   - Insufficient training and cybersecurity awareness may lead to poor security practices, such as storing passwords in plain text or using weak passwords.
   - Driven by looming deadlines and milestones, devs may inadvertently overlook logical aspects, resulting in buggy software. Despite the advancements of modern technologies and AI, the human factor remains a fundamental component in software development.
2. **Processes.** These are your workflows, CI/CD pipelines, monthly access reviews, etc.
   - Arguably, processes are also a human problem stemming from **inadequate management and supervision**. We humans are prone to forgetfulness, particularly when guidelines are communicated verbally rather than documented in writing. This underscores the significance of establishing structured processes.
   - Absence of a **dependency management and maintenance process** allows vulnerable components to linger in your codebase like a festering wound. Unmaintained code and technical debt pile up, ever-increasing the risk of a system. Consider using an **{% abbr "SCA", "Software Component Analysis, basically a dependency analyser" %}** to automate dependency checks.
   - Absence of **DevSecOps and security in the Software Development Lifecycle (SDLC)** increase the presence of easily exploitable vulnerabilities. These bugs, often considered low-hanging fruit, are favoured by ransomware groups seeking quick exploits. By using automated tools such as **{% abbr "SASTs", "Static App Security Testing, basically a source code scanner" %}** and **{% abbr "DASTs", "Dynamic App Security Testing, basically automates simple black-box pentests" %}**, you can identify common bugs thereby enhancing your application's security posture.
   - Lack of **continuous auditing and oversight** may inadvertently lead to breaches. Don’t be surprised when your [legacy test accounts bite you in the butt](https://www.bleepingcomputer.com/news/security/microsoft-reveals-how-hackers-breached-its-exchange-online-accounts/)!

You want your application secured? Invest in your talent. Review code. Improve your processes. Stay humble.

### 3. Copy and Paste invites Disaster

{% image "assets/copy-paste-disaster.jpg", "jw-65", "“Hi Disaster, I'm Paste! How do you do? And this is my friend Copy. We're so excited to work together on this project and to create great impact in the shortest amount of time possible!”" %}

<sup>*"Hi Disaster, I'm Paste! How do you do? And this is my friend Copy. We're so excited to work with you on this project and create great impact together!"*</sup>{.caption}

One recurring joke among programmers is how “code is often copy and paste”. To no one’s surprise, this behaviour isn’t uncommon, but the consequences can be severe.

{% details "Example: CMS", "open" %}

One time I came across a custom {% abbr "CMS", "Content Management System, a platform for managing content such as blog posts, announcements, and news" %} with two roles (admin and user) and encountered the following endpoints:

1. An admin endpoint which saves a draft, but optionally allows publishing by setting `"publish": true`.
    
    ```http
    POST /api/v1/admin/post/save HTTP/1.1
    Host: redacted.com
    Authorization: Bearer <admin token>
    Content-Type: application/json
    Content-Length: XXX

    {
        "id": 5,
        "content": "The quick brown fox jumps over the lazy dog.",
        "publish": true
    }
    ```

2. A similar endpoint which only allows *normal users* to save a draft.

    ```http
    POST /api/v1/user/post/save HTTP/1.1
    Host: redacted.com
    Authorization: Bearer <user token>
    Content-Type: application/json
    Content-Length: XXX

    {
        "id": 6,
        "content": "But the dog retaliated and jumped over the brown fox!"
    }
    ```

    By design, all publishing should be done by the admin, **normal users shouldn’t have rights to publish** (hence, no `publish` parameter by default).

On a whim, I copied the `"publish": true` parameter to `/user/post/save`.

```http
POST /api/v1/user/post/save HTTP/1.1
Host: redacted.com
Authorization: Bearer <user token>
Content-Type: application/json
Content-Length: XXX

{
    "id": 6,
    "content": "But the dog retaliated and jumped over the brown fox!",
    "publish": true
}
```

Oops, disaster! The post got published! It's apparent both endpoints use the same underlying logic. The `publish` parameter should have only been implemented for admins. The implications are somewhat severe, if you have user access — say an intern, a secretary, or a test account — you could bypass the usual approval process and publish something damning like “Megacorp is Filing for Bankruptcy!”.

{% enddetails %}

This is just one illustration of the dangers of copy-and-paste. I’m sure there are graver examples out there.

## General comments

During my pentesting experience, I observed some good and poor designs which can be generalised to wider statements about community/industry mindset. Here are my observations...

### 4. Encapsulation is good for security

In software engineering, encapsulation refers to the practice of bundling data and methods within a class, allowing for better *access control over data* and preventing *unintended modifications*. In most object-oriented programming languages, you control access by declaring functions to be `public` (callable by anyone) or `private` (callable within the class).

{% details "C++ Example" %}
As a recap, here's an example of a `BankAccount` class in C++. Notice how we applied encapsulation by restricting modifications to the balance. We’re not allowed to multiply it, bitshift it, or dereference it. We can only deposit and withdraw (with certain restrictions).

```cpp
#include <iostream>
using namespace std;

class BankAccount {
private:
    int accountNumber;
    double balance;

public:
    BankAccount(int num) : accountNumber(num), balance(0) {}

    void deposit(double amount) {
        balance += amount;
        cout << "Deposit of $" << amount << " successful." << endl;
    }

    void withdraw(double amount) {
        if (amount > 1000) {
            cout << "Withdrawal limit exceeded. Maximum withdrawal amount is $1000." << endl;
        } else if (balance - amount < 0) {
            cout << "Insufficient funds. Withdrawal not allowed." << endl;
        } else {
            balance -= amount;
            cout << "Withdrawal of $" << amount << " successful." << endl;
        }
    }

    void displayAccountDetails() {
        cout << "Account Number: " << accountNumber << endl;
        cout << "Balance: $" << balance << endl;
    }
};

int main() {
    BankAccount myAccount(123456);
    myAccount.deposit(500);  // Balance: 500
    myAccount.withdraw(200); // Balance: 300
    myAccount.withdraw(800); // Error: insufficient funds.
    myAccount.displayAccountDetails();
    return 0;
}
```

If our `balance` was `public`, what stops programmers who use this class from accidentally setting the balance to a negative number?
{% enddetails %}

This enhances security by restricting direct access to sensitive information and promoting a more structured software design. By encapsulating components, you hide potentially vulnerable states and separate interactions between components.

Encapsulation is understood very well from a programming perspective, but less so from a software design perspective.

Here are some interesting examples of encapsulation I've observed.

1. In a recent pentest, we managed to find an SQL injection vulnerability to a PostgreSQL database. In MySQL and SQL Server, we can access other databases by calling `use xyz;` or `select * from xyz..table`. But — from my limited understanding — PostgreSQL **doesn’t allow access to other databases**. Theoretically, this means devs can logically segregate data while reaping security benefits. For instance, compromising a `config` database won't impact the `users` database.

    There are [workarounds](https://stackoverflow.com/questions/46324/possible-to-perform-cross-database-queries-with-postgresql) to bypass this restriction, but I think this is a good first step towards designing secure encapsulated systems, and I really hope we can see more of this across the IT (and OT[^ot]) industry.
    
    [^ot]: OT, Operational Technology, are devices which typically involve physical actuators. Some network protocols in this industry lack security and have catching up to do.
   
2. Common in regulated industries (such as finance) is the segregation of *customer identification data*, i.e. personal information such as name, ID number, phone number, home address, and email address. These may compromise a customers' privacy if leaked. Customer data should be encapsulated in a separate database with strong encryption and access control.

### 5. What a programmer finds useful, an attacker (often) will too

If you will, another story. During a penetration test, we encountered a *very old* piece of software with debug functions allowing the user to print arbitrary information (such as variables and the program stack) from the server. Understandably, tooling during Programming Antiquity wasn't great, so the developers came up with this function to aid sysadmins in reporting and troubleshooting. However, this function proved alarmingly insecure, allowing us to access and read all user passwords (including admins!) with ease. Additionally, the password for regular users was predictably simple, allowing one to swiftly escalate from zero to admin...

{% image "assets/information-disclosure-footguns.jpg", "jw-70", "Footguns come in many forms." %}

<sup>Footguns come in many forms.</sup>{.caption}

Awareness is better these days, but insecure practices are still common. Leaving behind debug mode could save a day's worth of triaging, but it could also disclose file paths and source code (very valuable for web attacks)! We see this elsewhere too. Web developers forget to remove source maps. Embedded engineers leave behind UART ports.

Any tools left behind can be used for both good and malicious purposes. After all, devs and cybersecurity specialists have overlapping toolsets, think: gdb, browser devtools, logic analysers, and [rubber duckies](https://en.wikipedia.org/wiki/Rubber_duck_debugging). But sometimes the risk of malicious use outweighs the convenience.

Here are some common conveniences which can *really* bite you in the butt:

- **Leaving an admin page or internal app open to the public internet.** This is hella convenient because then you can login from anywhere. But it's not very secure because... you can login from anywhere! Attackers can use the login page to brute-force usernames and potentially gain access.
- **[Information and version disclosures](#11-knowledge-is-power)**. These are things like error messages, swagger API pages, and version numbers. As we'll see later, this can expedite attacks.
- **Using default or weak passwords for ease of remembering.** While convenient, weak passwords are more susceptible to brute force attacks and unauthorised access.

The first step to breaking an application is to find out what it uses and what it does.
On the flip side, the first step to securing your production environment is to strip out debug functionality and enable secure configurations. And sometimes this requires sacrificing convenience for security.

### 6. Assume breach

This is one of those mindsets to promote security in the Software Development Lifecycle (SDLC). This is meant to complement, rather than replace, ideas such as "Shift Left".

In red teaming (Active Directory pentesting) scenarios, we often "assume breach", by simulating scenarios where 1) attackers have successfully broken in (via phishing, exploits, or physical connections), or 2) there is an impostor (aka malicious insider) among us! Often, we find businesses have insufficient oversight into their network.

Breaches are a stark reality in today's cybersecurity landscape. Instead of assuming that a segregated network is impenetrable, apply defence-in-depth and set appropriate security controls.

## Software components and the supply chain

The events this year (2024) highlight how third-party components and underlying infrastructure (dubbed "the supply chain") can pose heavy risks to security. Let's have a quick recap:

- [Microsoft Exchange Online breached](https://www.bleepingcomputer.com/news/security/microsoft-reveals-how-hackers-breached-its-exchange-online-accounts/) - disclosed January 2024 - impacted numerous organisations, e.g. Hewlett Packard
- The [xzutils backdoor](https://en.wikipedia.org/wiki/XZ_Utils_backdoor) - February 2024 - would have potentially affected millions of SSH installations, if not discovered in time
- [Polyfill.io Supply Chain Attack](https://blog.qualys.com/vulnerabilities-threat-research/2024/06/28/polyfill-io-supply-chain-attack) - June 2024 - domain purchase + delivery of malicious scripts via CDNs affecting 100K+ sites (potentially billions of users)
- The [CrowdStrike incident](https://en.wikipedia.org/wiki/2024_CrowdStrike-related_IT_outages) (non-malicious and unintentional) - July 2024 - impacted 8.5 million Windows computers, caused massive disruptions to airports and financial services
- [Compromised network infrastructure in the US](https://www.bleepingcomputer.com/news/security/us-says-chinese-hackers-breached-multiple-telecom-providers/) - disclosed October 2024 - confidential communications leaked, further impact to be determined?

{% image "assets/dependency.jpg", "jw-50", "What? Dependencies can be hacked? Adapted from XKCD #2347 - Dependency." %}

<sup>What? Dependencies can be hacked? Adapted from XKCD #2347 - Dependency</sup>{.caption}

Amidst this chaos, I think there's something we can pick out and learn from these incidents:

- Why do we even use a supply chain?
- Safeguard your supply chain.
- Be sceptical of your supply chain.

Let's start by justifying supply chains with a common piece of advice.

### 7. Don't roll your own auth

...unless you know what you're doing! This is old news to some. Here, auth refers authentication, such as registration, login, federated logins (e.g. OAuth, SSO), and — to some extent, access control. There are reasons *for* and *against* developing a custom auth. Let's go through them very quickly:

Reasons to roll your own auth:
- **Customization**: Off-the-shelf solutions may not always meet your needs and requirements.
- **Centralisation**: You want to take responsibility for your own security and not be reliant on third-party systems.

Reasons to ***not*** roll your own auth:
- **Security**: Developing a secure authentication system demands a high level of understanding potential security vulnerabilities.
- **Time and Resources**: Building a custom, fully-tested system can be time-consuming and resource-intensive.
- **Maintenance**: Custom solutions require maintenance in the wake of evolving security threats and business requirements.

I've seen teams happily roll their own auth just to fail miserably when we discover a ton of unexpected security issues. Sure, custom implementations may be needed; but most of the time, you should opt for a *mature, battle-tested* library. Even then you should be aware of what features those libraries offer and configure proper defaults.^[You *could* also consider using a third-party service, but this may open a whole can of worms involving privacy/compliance (muh data got sent WhErE?!?, and it's stored WhErE?!?), UX (why did I redirect?), and more.]

To give you a taste of the complexity of auth security, here are a slew of test cases we consider when dealing with auth and access control:

- Does your system rate-limit requests? Many controls can be bypassed by brute force.
  
{% image "assets/batman-rate-limiting.gif", "jw-50", "'First try!' (from *The Lego Movie*)" %}

<sup>5,427 iterations in: first try!</sup>{.caption}

- Is your input properly checked and sanitised?
- In a multistep registration process, do you check whether the previous registration steps have completed?
- Can your JWTs be tampered with? Is a strong key used?
- Are your access tokens invalidated after logout? Are your refresh tokens invalidated after a refresh?
- Do you properly hash and store your secrets?
- Are permissions properly checked?
- Is your database properly configured?

{% alert "success" %}
When you roll your own auth, you don’t just deal with “auth issues”. You need to deal with logic issues, session handling, cryptographic issues, injection issues, and other potential attacks. The inherent complexities compel many teams to *avoid* reinventing the wheel.

This doesn’t apply only to auth. In general, any complex system will have a myriad of test cases. The common saying is: if it’s mission-critical, build it yourself.^[For instance, Cloudflare builds its own infrastructure and [proxy](https://github.com/cloudflare/pingora) because it’s critical to their network.] Otherwise, is the complexity really worth it?
{% endalert %}

### 8. Patch your systems

Earlier, we mentioned that using mature, battle-tested components tends to be more secure and convenient compared to reinventing your own from scratch.

But the flipside to this is: **dependencies are also an attack surface**. This is evident from the recent supply chain attacks and incidents.

{% alert "fact" %}
Is rolling your own auth better? Is using a third-party component better? There’s no clear right or wrong answer. This will depend on your situation, your business strategy, your manpower, and ultimately the risk you’re willing to take. Either way, upholding a robust security posture is essential for the long-term success of any project.[^risk]
{% endalert %}

[Previously, we discussed processes to reduce the risk of supply chain attacks](#2-an-application-is-as-secure-as-its-weakest-link), such as dependency management and {% abbr "SCA", "Software Component Analysis" %}. Relevant to this discussion is: **Should you automatically apply patches/updates?** Here's the breakdown:

* If you don’t auto-apply updates... Your system is stable, but you risk exposing yourself to critical issues in the long term, unless you manually update. (Decent strategy for production-critical systems, such as life-support at a hospital?)
* If you auto-apply updates... You get the latest features and security fixes, but you risk ingesting a supply chain attack (like xzutils). Even so, a patch for that attack will be auto-applied. (Good strategy for high-risk items with many vulnerabilities like routers, your OS, your browser.)

For this site (static site generator with npm dependencies), I use a hybrid approach by auto-applying minor updates but manually upgrading + testing major updates.

### 9. Don't (solely) rely on WAFs

You think {% abbr "WAFs", "Web Application Firewalls" %} will protect your smelly derelict backlogged spaghetti codebase? Think again.

{% details "Example: WAF did not protect against RCE.", "open" %}
One time I was pentesting a PHP web app using an outdated web framework. I quickly discovered the framework version and proceeded to execute {% abbr "RCE", "Remote Code Execution, a high-impact vulnerability class" %} exploits available on the web. Unfortunately, the WAF blocked 
payloads based on common keywords: `system`, `phpinfo`, `fopen`. To bypass their denylist, I could try different PHP functions... but there’s a much easier trick.

Most WAFs, to enhance performance, will ignore request bodies with body lengths above a certain limit. This means we can smuggle malicious payloads in plain sight by simply adding a big fat parameter.

Before:
```http
POST /foo HTTP/1.1
Host: example.com
Content-Type: application/x-www-form-urlencoded
Content-Length: 26

function=system&arg=whoami
```

After:
```http
POST /foo HTTP/1.1
Host: example.com
Content-Type: application/x-www-form-urlencoded
Content-Length: 9000

function=system&arg=whoami&bigfatparameter=AAAAAAAA...8000+ characters...AAA
```

The result? We were able to bypass the WAF, execute commands, noodle around the filesystem, read source code, and more.
{% enddetails %}

{% alert "success" %}
Simply applying a WAF is ineffective unless other countermeasures such as regular patches, logging, and monitoring are also applied.[^risk]
{% endalert %}

[^risk]: Adjust for risk accordingly, if that’s your thing.

## Common bug classes

Apart from buggy auth and vulnerable components, there are a few other bug classes I frequently encounter in the realm of web and mobile applications:

1. Injection Bugs (SQL injection, XSS, template injection)
2. Information Disclosure (versions, file paths, error messages)
3. Logic/Design Bugs (Business Logic, Race Conditions)

### 10. String concatenation considered dangerous /s

{% image "assets/strings.jpg", "jw-60", "Strings, amirite?" %}

<sup>Strings, amirite?</sup>{.caption}

Despite its diminishing presence, **injection vulnerabilities** are still a dangerous, prevalent class of bugs. This includes vulnerabilities such as SQL injection (SQLi) and cross-site scripting (XSS). Discovery and exploitation techniques are widely documented and understood, underscoring the significant risk these vulnerabilities can have on application security.

Let's address some concerns:

1. How do injection issues arise?
    - Typically, they arise when accepting unsanitised text fields and query parameters in HTTP requests. For example:
        - search function on a website (SQLi)
        - logging of user agents and parameters (SQLi)
        - trusting (failing to sanitise) a URL parameter (XSS)
        - Web 2.0 user content submission, e.g. comments, posts ({% abbr "SSTI", "Server-Side Template Injection" %})
        - many more subtle cases!
    - Generally, using allowlists are better than denylists. Instead of preventing quotes in an address field, allow only letters, numbers, spaces, and commas.
2. Can an application still be vulnerable to SQLi attacks even if the backend does not directly return database values in the response?
    - Yes. Attackers can exfiltrate data through other means, such as...
        - error-based techniques, i.e. stringifying data in an error message (very commonly overlooked);
        - [blind techniques, i.e. checking the status code, response body, or response time](/posts/automating-boolean-sql-injection-with-python); and
        - out-of-band techniques, i.e. checking DNS/HTTP requests.
3. What are some ways to protect against injection issues? Here are some good examples I’ve observed:
    - **Input Validation**
        - Numbers should be validated. Strings should be escaped. Enums should be validated against an allowlist.
        - Don't trust user/database values. Sanitise user content to be inserted into HTML with sanitisers such as DOMPurify. This is especially crucial for CMSs and chatrooms.
    - **Parameterized Queries**
        - Use parameterized queries in database interactions to prevent SQL injection attacks. This approach separates SQL code from user input, reducing the risk of malicious code execution and data leaks.

### 11. Knowledge is power

**Information disclosure** is a severely underestimated issue with the potential to accelerate attacks.

What might a typical hacking scenario look like? With thousands of exploits and vulnerabilities out there, I have no idea where to start. So I'll start by narrowing the possibilities. What tech are you using? What libraries, frameworks, versions? If I know all this, I can narrow my search drastically.

{% image "assets/enumeration-is-awesome.jpg", "jw-85", "On ExploitDB, searching for PHP exploits yields 7000+ results, whereas a more refined search for CMSimple v5 shows only 5 exploits — much more palatable!" %}

<sup>It's a lot easier to hunt for exploits when you know the target systems.</sup>{.caption}

In one scenario, we obtained remote code execution (RCE) within an hour, simply because a version disclosure expedited our search for exploits. It probably would have taken days otherwise.

Here are some good tips to consider:

{% alert "fact" %}
1. Instead of showing version information publicly, consider hiding it behind authentication. This means
    - An attacker won't immediately have the version. They'd need valid credentials first, which can be a pain if safeguarded appropriately.
    - An *actual* admin will still be able to access that version information after login. It's just a couple extra steps.
2. Disable "debug mode" in production.
3. Response headers! Don't return:
    ```http
    HTTP/1.1 200 OK
    Server: Apache/2.4.49
    ```
    
    Rather, return:
    ```http
    HTTP/1.1 200 OK
    Server: Apache
    ```
    Or better yet, don't include the software framework at all! For instance, AWS’s load balancer will return `Server: awselb`.
{% endalert %}

### 12. Elementary, dear Watson

**Logic** is the essence of software. Unfortunately, security flaws often arise from broken logic.

- **Business Logic Bypasses**: These are bugs like: reusing a coupon, bypassing the chain of approval, bypassing a limit. Imagine how many more bugs there would be, with the "help" of AI.
- **Race Conditions**: Popularised last year by [PortSwigger's whitepaper "Smashing the state machine"](https://portswigger.net/research/smashing-the-state-machine), these are subtle bugs which exploit concurrency issues or vulnerable "substates" (i.e. a request may alter the application state multiple times). Fixes could be anything from redesigning SQL schemas to shuffling a few lines of code.

These vulnerabilities tend to bypass controls such as:
* **permissions and access control** ("only admins are allowed to do XYZ", but it turns out normal users can too!) and
* **limits** ("only three books can be checked out from the library at a given time", but this was only enforced in the client-side JS!).

Most scanners don't tend to catch these, since business logic is unique to each environment. The impacts can be benign or severe. Maybe extra upvotes aren't too harmful. But a user gaining admin access is.

If you're interested in seeing a Business Logic Bypass story, you can read the example in [Copy and Paste Invites Disaster](#3-copy-and-paste-invites-disaster).


## tl;dr and takeaways

- [Modern tech can still be insecure.](#1-myth-modern-tech-is-secure-and-bug-free) This can be attributed to [human factors and procedural gaps](#2-an-application-is-as-secure-as-its-weakest-link) and can be addressed by training and better management. Use strong and memorable passwords. Write and automate tests.
- When architecting systems, consider [encapsulating components to enhance access control](#4-encapsulation-is-good-for-security).
- [Knowledge is power; don't expose too much information.](#11-knowledge-is-power) Value your privacy. [Sometimes sacrificing convenience is essential to safeguarding your data.](#5-what-a-programmer-finds-useful-an-attacker-often-will-too)
- All software components carry inherent risks.
  - For in-house components, [understand the potential security risks and ensure thorough testing is applied](#7-dont-roll-your-own-auth).
  - For external libraries and components, [regularly monitor for updates and patch security issues](#8-patch-your-systems).
- [Assume breach](#6-assume-breach), apply defence-in-depth. [Don't rely on your "outer shield" to protect your internal environment.](#9-dont-solely-rely-on-wafs)
- Pay attention to common issues which plague applications, such as [injection](#10-string-concatenation-considered-dangerous-s), [information disclosure](#11-knowledge-is-power), and [logic bugs](#12-elementary-dear-watson).
- [Keep going and never give up.](https://www.youtube.com/watch?v=dQw4w9WgXcQ){.no-exlink}

