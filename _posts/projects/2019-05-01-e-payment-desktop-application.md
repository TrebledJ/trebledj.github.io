---
title:  E-Payment Desktop Application and System
summary: An e-payment system which involves a cross-platform desktop application and careful planning.
tags: project qt cpp sql
keywords: e-payment, desktop application, qt, gui, sql, c++
pitch: Developed a desktop application for a new e-payment system in the school cafeteria. Collaborated with ICT staff in UI design and connecting the application with the school’s SQL Server database.
---

This project involved creating a functioning e-payment system to be integrated at our high school's cafeteria.

### Backstory

I was in my final year of high school. At the time, every single student had a student ID card. They were simple in design with the usual portrait, student name, and expiry date. A friend came to me and suggested using the student card for electronic payment (e-payment). The idea is akin to using a HK Octopus to pay for goodies instead of having to scramble for cash.

### Development

Since I was young and naive at the time (and also because I was unfamiliar with web apps and other possible solutions), I decided to create a desktop application to perform the transactions.

Initially I started developing the application using SFML, since it was the only GUI framework I knew. After struggling with making buttons work and click properly, I switched to Qt which had some added advantages:

* It is a much more mature framework, meaning there were tons of resources and form posts available.
* It has a drag-and-drop GUI editor.
* There are UI classes for widgets (e.g. pushbuttons, checkboxes, listviews), so I didn't have to reinvent the wheel.

<!-- TODO -->
