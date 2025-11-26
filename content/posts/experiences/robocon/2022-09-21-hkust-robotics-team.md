---
title: The HKUST Robotics Team
excerpt: Experiences and reflections journeying with the HKUST Robotics Team.
tags:
  - robotics
  - software-engineering
  - hkust
  - reflection
  - experience
thumbnail_src: ~/assets/img/posts/thumbnail/robotics-team-wallpaper-2.jpg
pitch: Senior software engineer in the HKUST Robotics Team. Trained and mentored junior team members. Transformed and modularised project architecture and pipeline with Git submodules. Orchestrated software R&D projects.
related:
    tags: [hkust, robotics]
---

{% image "assets/off-ramp-robotics.jpg", "jw-55", "Bye bye CGA.", "Off-ramp meme. Did I study subjects belonging to major? Nah." %}

Ah Fall... the time of year when undergrads decide what activities, societies, and extra-curriculars to join.

The purpose of this post is to reflect on and share about this experience. The first several sections provide background on my journey in the team. The final section is more reflective. Hopefully the reader finds something meaningful in this jumble of words.

Please understand that the team has a culture of keeping things secret. 🤫 So I won’t delve precisely into what I worked on. Also understand that each person experiences things differently, so don’t take my writing below as representative of the entire team and experience. Things may change in the next few years, or may have already changed.

## Joining the Team 🚪

I joined the HKUST Robotics Team in my first year of university. In the Fall semester, the team would have a semester-long recruitment process, designed to filter candidates. Recruitment was separated into multiple stages:

1. Workshop + Interview
2. Mech/Hardware/Software Tutorials
3. Robot Design Contest (Internal Competition)

### The Workshop 🔨

I found out about the team from an email about a free robotics exploration workshop. (Keyword is *free*.) So of course I signed up. It was a fun little experience to kickstart my university life, even though I lacked robotics experience. I thought it would be a good opportunity to explore different things while in uni.

{% image "assets/chassis-example.jpg", "jw-35", "Example of the chassis used." %}

In the workshop, we were given a chassis (like the one shown above) and were asked to build and program a bot to dribble a ping-pong ball across a maze. The workshop closed with a casual interview asking about our interests.

We were asked to pick a division (or department, as some call it): mechanical, hardware (electrical), or software engineering. Having had prior programming experience and wanting to boost my skills I decided to go with the software division.

### The Training ✏️

{% image "assets/training.jpg", "jw-55", "Training is tuff!" %}

Next up were the tutorials. The first software tutorial was on basic programming using the C language. My prior experience with C++ helped a lot here.

The next few tutorials? Not as easy. 😕 Quite challenging, in fact. We learned about GPIO and PWM, two different ways to communicate data. We also played with sensors and servos, and touched on image processing.

There was classwork and homework assigned for each tutorial. They were quite challenging, ~~and I didn’t manage to complete everything~~, but overall, the exercises were fun and good for practice.

### The Internal ⚙️

Lastly, to top off the recruitment process, trainees would form groups to compete in an internal contest. The contest tries to combine elements from the different robotics subdivisions: Robocon (2v2 robots), ROV (underwater robotics[^rov]), and Smart Car (racing). Rules are rigorous, and robots need to be carefully designed to meet the criteria and complete tasks to gain the most points.

[^rov]: It's hard to incorporate underwater robotics into an internal game, so they usually settle on combining the business aspects, i.e. presentations.

The primary objective of the internal contest is to observe how well candidates work with others and at the same time, how well we apply the technical skills gained in the tutorial. (You may also find yourself self-learning to solve problems better.) Whether you win 1st place or not—that is secondary. Winning doesn’t guarantee you a spot in the team. Similarly, losing doesn’t guarantee you get kicked out immediately. Let this be a life lesson. :P

Unfortunately, due to the protests and temporary closure of the university, the contest was cancelled T_T and we jumped straight to peer evaluation followed by the next phase: entering subteams.

## Team Freshman 🍎

Each year, the HKUST Robotics Team participates in several competitions, with a dedicated subteam for each. At the time of joining, I had to choose between the ABU Robocon, MATE ROV, and NXP Smart Car subteams. I was persuaded to join Robocon, and well—here I am now. 😐

You would’ve thought that, after the internal contest and trainee selection, the hardest part of training would be over and we could relax after. Haha, nope! We had to prepare for the upcoming [Robocon 2020](/posts/robocon-2020) competition!

During the winter break, we trainees went through more rigorous training. We were introduced to the team’s development environment, libraries, and tooling.

And guess what happened during the Spring semester? Classes shifted online! There was a period when not much work was done due to reduced manpower (e.g. international members being out of HK).

I became more involved in the summer. It was during this time that I got to know the other team members much better. I also had tons of fun playing with the LCD (display screen), messing with the buzzer, fixing bugs in the libraries, and getting more practice playing with motors and sensors.

This year’s experience was, by far, a lot different from the previous years’. For one, the regional Robocon competition was postponed thrice. Also, the global competition (originally in Fiji) was moved online, so we lost the opportunity to visit the small island. :(

More reflections can be found in my [Robocon 2020 post](/posts/robocon-2020).

## From Small Fry to Big Fish 🐠

In my second year of university, I had the opportunity to take on more roles in the team, from helping in the workshop to planning the internal to teaching and mentoring.

One of my major contributions during the recruitment phase was the [RDC Simulator](/posts/robot-design-contest-simulator), a desktop app for juniors to program a robot on a 2D field during the internal competition.

Unlike before, this year’s recruitment (2020 Fall) was completely online. This meant we had to find online alternatives for our tutorials, exercises, and internal competition. Of all three divisions, the software division suffered the least (no surprise). The mechanical division, on the other hand, had a hard time training and assessing trainees.

Once recruitment was over, it was time to prepare for the [Robocon 2021](/posts/robocon-2021) competition. Fortunately, the lab was open even though courses were still online.

Mentoring is tough, but rewarding. There is the urge to stay ahead of the juniors, being able to answer their questions and deciding whether the ideas/solutions they come up are feasible and effective.

More reflections can be found in my [Robocon 2021 post](/posts/robocon-2021).

Nowadays, my role is more passive—I monitor the team, provide training, and offer guidance.

## Personal Improvement/Development 🚀

In robotics and control theory, PID is one of the core elements contributing to stable motors, mechanisms, and machinery. How does a heater know when to start/stop heating? PID. How does a drone know how fast to spin its motors to hover midair? PID.

PID stands for proportional, integral, and derivative—rather mathy terms, and quite so, because that’s how PID controls are computed.

But this post is supposed to be a reflection, so why am I blabbering about PID? It’s because there is another PID I’d like to draw attention to (and to the computer geeks, no, I don’t mean Process ID :P). I’m referring to personal improvement/development, ~~which is something I sort of made up, so don’t be surprised if searching “PID personal development” doesn’t yield any results~~.

Through the robotics team experience, one of my biggest areas of growth is in soft skills, in particular communication and mentoring. Communicating in a group project for a course almost always seems superficial and is usually short-term.

{% alert "info" %}
You would be forgiven to think, oh what makes it different from other team activities or group projects. In Robocon, it’s different. We’re stuck with our teammates for half a year—maybe more. There's lots of room for bondage and growth. It takes skill to decide when and how to reprimand someone, and patience to mentor.

Communication between divisions is also important. The best way to kill a team is to minimise communication. Of course, communication needs to be effective and should be followed up with action. In the end, it’s about becoming better humans in society.
{% endalert %}

I’ve mentioned this in some other posts, but I am quite terrible when it comes to dealing with people. I’ve learned a great deal over the past couple years, and I’m still learning—it’s a process.
