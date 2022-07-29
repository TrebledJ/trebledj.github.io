---
title:  E-Payment Desktop Application and System
summary: "A reflection of my first large-scale project: an e-payment system plus cross-platform desktop application."
updated: "2022-07-30"
tags: cpp qt sql project
keywords: e-payment, desktop application, qt, gui, sql, c++
pitch: Developed a desktop application for a new e-payment system in the school cafeteria. Collaborated with ICT staff in UI design and connecting the application with the school’s SQL Server database.
---

This project involved creating a functioning e-payment system to be integrated at our high school's cafeteria.

### Backstory

I was in my final year of high school. At the time, every single student had a student ID card. They were simple in design with the usual portrait, student name, and expiry date. A friend came to me and suggested "evolving" the student card to be able to use it for electronic transactions (e-payment). The idea is akin to using an [MTR Octopus][octopus] to pay for goodies instead of having to scramble for cash.

To give a bit more background, our school cafeteria has five to six different local vendors. The school would rent a stall out to tenants who would sell snacks and lunch during the appropriate hours. At the time, the only transaction method is cash.

Also some background about the card: it's a [radio frequency ID (RFID)][rfid] card. I won't go into the technical details of it, but basically you scan the card on a dedicated reader, and it can read an unique ID.

### Development
#### A Painful Start
Now if you're an experienced software engineer, please bear with me as I take a walk down memory lane (or feel free to skip ahead).

Since I was young and naive at the time (and also because I was unfamiliar with web apps and other possible solutions), I decided to create a desktop application to perform the transactions.

Initially I started developing the application using SFML, since it was the only GUI framework I knew. After struggling with making buttons work and click properly, I switched to Qt which had some added advantages:

* It is a much more mature framework, meaning there were tons of resources and form posts available.
* It has a drag-and-drop GUI editor.
* There are UI classes for widgets (e.g. pushbuttons, checkboxes, listviews), so I didn't have to reinvent the wheel.
* It was cross-platform, which was convenient in case the school's computer operating system is different.

![](https://i.imgflip.com/6obt0h.jpg){:width="60%"}
{:refdef style="text-align: center;"}

If there was one thing I learned, it was to understand the problem first, research the appropriate tools, and *then* start developing the solution. I wasted maybe two to four weeks coding a good GUI with SFML and scratching my head.

#### Designing a Robust Solution
Regardless, all the benefits brought by Qt allowed me to focus more on solving business logic issues. The logic issue? Well... there are several questions we should answer.

1. Who needs to use the application?
2. How do I store user data across applications?
    * This could be vendor data (e.g. food names, food prices) or student data (e.g. name, balance).

To answer (1), we identify three groups of people: vendors, students, and admins. Admins are the school staff who will be responsible for updating a student's balance; similar to an MTR staff sitting in the customer service booth.

All three groups should have different access rights. For example, vendors and students shouldn't be able to add to their balance, only admins can do that. 

Moreover, since their roles are different, the interfaces they see should also be different. A vendor shouldn't need to see an admin-level page, since it's unrelated to their function.

To solve (2), we *could* simply use a text file. Load data on startup, save data every time something changes. But this only works for a single user on a single device. Well... that's what I actually did at the beginning, except I used a SQLite database (which is basically a glorified text file made convenient for sql).

Now the problem with SQLite is that it's serverless. In plain English, it can't cope with multiple users well.

A better alternative was to use MySQL or Microsoft SQL Server, which is designed to handle multiple users (clients, to be precise). Since our school's ICT team used SQL Server, so we eventually followed suit.

How does MySQL and SQL Server connect with multiple clients across the network? This is something you'll have to ask the experts. :D

![](https://i.imgflip.com/6obsur.jpg){:width="60%"}
{:refdef style="text-align: center;"}

#### Designing the GUI
As mentioned before, there are three groups of users: vendors, students, and admins.

(The below screenshots are from a long-ago development version, for illustration purposes only.)

This is what the design for the vendor interface looks like:

![](/assets/img/posts/studentcard/vendor-order.png){:width="100%"}

Giant buttons on the left to select their customers' orders. A list of selected items on the right. And some buttons down below.

The [user flow][user-flow] for a transaction is:

0. Cashiers log in.
1. Student orders food.
2. Cashier taps/clicks food items.
3. Program calculates subtotals and total cost.
4. Student scans their student ID.
5. Program verifies if student has enough balance and transacts.
6. Program records the transaction, updates the student's balance, and prints a receipt.

There are a couple other things vendors can do with the app:

* Add menu items
* View/print transaction summaries

But these are not very interesting.

Admins, of course, have a more powerful role. These peeps can view *and* **update** student's balances (pretty boring TBH). (Unfortunately I did not save any screenshots of the GUI and I'm not bothered to redownload Qt and rebuild the app. >.>)

![](https://i.kym-cdn.com/entries/icons/original/000/032/676/Unlimited_Power_Banner.jpg){:width="80%"}
{:refdef style="text-align: center;"}

Students have the most ***exciting*** user flow of all.

{:refdef: style="text-align: center;"}
![](/assets/img/posts/studentcard/standby.png){:width="45%"}
![](/assets/img/posts/studentcard/standby-scanned.png){:width="45%"}
{:refdef}

And since they have an exciting flow, I'll describe it for fun:

1. Walk up to the school's library computer.
2. Shake the mouse to wake up the monitor.
3. Take out their student card from their wallets or pockets.
4. If they lost their card, contact ICT support. They may need to pay for a replacement and the previous balance would be lost. :(
5. Otherwise, they haven't lost it. So they place the card on top of the RFID reader.
6. Wait one second for the reader to scan the card.
7. Watch their card ID appear on the screen.
8. Absorb the details shown on a second page (card number, student ID, balance, whether or not the card is active).
9. Leave the site.

Exciting, right?

### Current Status
It's been several years since the e-payment system was launched in the summer of 2019, and I hope it has proven useful during the Covid-19 pandemic as students and teachers can avoid spreading germs through cash transactions (coins and cash can be quite dirty!).

When I asked a student about it this year (2022), they said that the entire system was *still* up and running (a good sign!). Moreover, the school's ICT team has expanded it as a locking mechanism for student lockers. Hopefully it will become a reliable piece of technology and make the school environment safe, clean, and fast.

[octopus]: https://en.wikipedia.org/wiki/Octopus_card
[rfid]: https://en.wikipedia.org/wiki/Radio-frequency_identification
[user-flow]: https://www.optimizely.com/optimization-glossary/user-flow
