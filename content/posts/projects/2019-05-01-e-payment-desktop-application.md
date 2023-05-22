---
title:  E-Payment Desktop Application and System
description: "A reflection of my first large-scale project: an e-payment system plus cross-platform desktop application made using Qt."
updated: "2022-08-01"
tags: 
 - software-engineering
 - qt
 - cpp
 - sql
 - apps
thumbnail: /img/posts/projects/cashier.jpg
keywords: [e-payment, desktop application, gui, c++]
pitch: Developed a Qt/C++ desktop application for a new e-payment system in the school cafeteria. Collaborated with ICT staff in UI design and connecting the application with the school’s SQL Server database.
---

This project involved creating a functioning e-payment system to be integrated at our high school's cafeteria.

### Context

I was in my penultimate year of high school and summer was approaching. At the time, every single student had a student ID card. They were simple in design with the usual portrait, student name, and expiry date. A friend came to me and suggested "evolving" the student card to be able to use it for electronic transactions (e-payment). The idea is akin to using an [MTR Octopus][octopus] to pay for goodies instead of having to scramble for cash and perform the entire process of calculating plus giving change.

To give a bit more background, our school cafeteria has five to six different local vendors. The school would rent a stall out to tenants who would sell snacks and lunch during the appropriate hours. At the time, the only transaction method is cash.

Also, some background about the card: it's a [radio frequency ID (RFID)][rfid] card. I won't go into the technical details of it, but basically you scan the card on a dedicated reader, and it can read a unique ID.

{% image "assets/img/posts/projects/studentcard/rfid.jpg", "Exhibit A: an RFID", "post1 w-60" %}

### Development
#### A Painful Start
Now if you're an experienced software engineer, please bear with me as I take a walk down memory lane (or feel free to skip ahead).

Since I was young and naive at the time (and also because I was unfamiliar with web apps and other possible solutions), I decided to create a desktop application to perform the transactions.

Initially I started developing the application using SFML, since it was the only GUI framework I knew. After struggling with making buttons work and click properly, I switched to Qt which had some added advantages:

* It is a much more mature framework, meaning there were tons of resources and form posts available.
* It has a drag-and-drop GUI editor.
* There are UI classes for widgets (e.g. pushbuttons, checkboxes, listviews), so I didn't have to reinvent the wheel.
* It was cross-platform, which was convenient in case the school's computer operating system is different.

{% image "assets/img/posts/memes/sfml-is-not-cute.jpg", "SFML is not cute.", "post1 w-60" %}

{% alert "success" %}
If there was one thing I learned, it was to understand the problem first, research the appropriate tools, and *then* start developing the solution. I wasted maybe two to four weeks coding a good GUI with SFML and scratching my head.
{% endalert %}

#### Designing a Robust Solution
Regardless, all the benefits brought by Qt allowed me to focus more on solving business logic issues. The logic issue? Well... there are several questions we should answer.

1. Who needs to use the application?
2. How do I store user data across applications?
    * This could be vendor data (e.g. food names, food prices) or student data (e.g. name, balance).

To answer (1), we identify three groups of people: vendors, students, and admins. Admins are the school staff who will be responsible for updating a student's balance; similar to an MTR staff sitting in the customer service booth.

All three groups should have different access rights. For example, vendors and students shouldn't be able to add to their balance, only admins can do that. 

Moreover, since their roles are different, the interfaces they see should also be different. A vendor shouldn't need to see an admin-level page, since it's unrelated to their function.

To solve (2), we *could* simply use a text file. Load data on startup, save data every time something changes. But this only works for a single user on a single device. Well... that's what I actually did at the beginning, except I used a SQLite database (which is basically a glorified text file made convenient for SQL).

Now the problem with SQLite is that it's serverless. In plain English, it can't cope with multiple users well.

A better alternative was to use MySQL or Microsoft SQL Server, which is designed to handle multiple users (clients, to be precise). Eventually I went with SQL Server, since that was what our school was using.

How does MySQL and SQL Server connect with multiple clients across the network? This is something you'll have to ask the experts. :D

{% image "assets/img/posts/memes/netwhat.jpg", "Net-what?", "post1 w-60" %}

#### Sidenote on Version Control
When undertaking *any* project, it is crucial to have flexibility. A version control system offers this.

What is a version control system?

A version control system (VCS) is a software tool which in a sense, takes snapshots (commits) of files and keeps track of them. Traditionally, to keep separate versions of a file, you might copy-paste a folder, name it "myfolder-v2", and so on. There are several reasons why you might want to do this, one example is that you want to keep a bunch of text from the old version and have it on hand if necessary.

VCSs take this idea of versioning and put it on steroids. While developing, you can do a bunch of things. You can jump back to an earlier snapshot (checkout). You could work on a new feature or bugfix (branch) concurrently. Flexibility.

Typically, VCSs are used by teams to effectively manage their code between team members. But they're also effective if you're coding alone! The (outdated) screenshots of the GUI in this post are here thanks to version control holding onto them. (I uploaded them but deleted them in one of my commits.)

{% alert "success" %}
If you're planning on doing a project (whether small, medium, or big) or even just cataloguing your learning process, consider using a VCS.
{% endalert %}

#### Designing the GUI
As mentioned before, there are three groups of users: vendors, students, and admins.

(The below screenshots are from a long-ago development version, for illustration purposes only.)

This is what the design for the vendor interface looks like:

{% image "assets/img/posts/projects/studentcard/vendor-order.jpg", "Vendor ordering UI.", "post1" %}

Giant buttons on the left to select their customers' orders. A list of selected items on the right. And some buttons down below.

The [user flow][user-flow] for a transaction is:

0. Cashiers log in.
1. Student orders food.
2. Cashier taps/clicks food items.
3. Program calculates subtotals and total cost.
4. Student scans their student ID.
5. Program verifies if student has enough balance and transacts.
6. Program records the transaction, updates the student's balance, and prints a receipt.

Most of these steps weren't automated in the beginning. But to reduce the chance of making mistakes (which humans are really good at!), it's best to automate as much as possible.

There are a couple other things vendors can do with the app:

* Add menu items
* View/print transaction summaries

But these are not very interesting.

Admins, of course, have a more powerful role. These peeps can view *and* **update** student's balances (but the actual flows are pretty boring TBH). (Unfortunately I did not save any screenshots of the GUI, and I'm not bothered to redownload Qt just to build the app once. >.>)

{% image "assets/img/posts/memes/unlimited-power.jpg", "Unnnnnlliiiimmiiitted pooower!.", "post1 w-80" %}

Students have the most ***exciting*** user flow of all.

<p class="center">
{% image "assets/img/posts/projects/studentcard/standby.jpg", "Standby UI, before scanning.", "w-45 multi" %}
{% image "assets/img/posts/projects/studentcard/standby-scanned.jpg", "Standby UI, after scanning.", "w-45 multi" %}
</p>

And since they have an exciting flow, I'll describe it for fun:

1. Walk up to the school's library computer.
2. Shake the mouse to wake up the monitor.
3. Take out their student card from their wallets or pockets.
4. If they lost their card, contact ICT support. They may need to pay for a replacement and the previous balance would be lost. :(
5. Otherwise, they haven't lost it. So they place the card on top of the RFID reader.
6. Wait one second for the reader to scan the card.
7. Watch their card ID appear on the screen.
8. Absorb the details shown on a second page (card number, student ID, balance, whether the card is active).
9. Leave the site.

Exciting, right?

### Current Status
It's been several years since the e-payment system was launched in the summer of 2019, and I hope it has proven useful during the Covid-19 pandemic as students and teachers can avoid spreading germs through cash transactions (coins and cash can be quite dirty!).

When I asked a student about it this year (2022), they said that the entire system was *still* up and running (a good sign!). Moreover, the school's ICT team has expanded it as a locking mechanism for student lockers. Hopefully it will become a reliable piece of technology and make the school environment safe, clean, and fast.

### Takeaways

* Spend some time researching the problem you're trying to solve and the possible solutions. You'll accrue less [technical debt][techdebt] and thank yourself in the future.
* Use a version control system for flexibility and to keep track of history.
* Don't be afraid to try something new. The journey might just be worth it.


[octopus]: https://en.wikipedia.org/wiki/Octopus_card
[rfid]: https://en.wikipedia.org/wiki/Radio-frequency_identification
[user-flow]: https://www.optimizely.com/optimization-glossary/user-flow
[techdebt]: https://en.wikipedia.org/wiki/Technical_debt