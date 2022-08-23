---
title: HKUST Robotics Team
description: Experiences and reflections journeying with the HKUST Robotics Team.
updated: "2022-08-03"
tags: robotics experience embedded python c cpp hkust
thumbnail: /assets/img/posts/robotics/wallpaper-2.png
pitch: Joined the HKUST Robotics Team.
published: false
related_tags: hkust robotics
---

### Joining the Team
My first encounter with the Robotics team was in a recruitment email at the beginning of September 2019, inviting undergraduates to partake in an exploration workshop. The workshop was free! And I was a bubbly, excited Year 1 student. So of course I signed up.

The exploration workshop was quite fun. We were provided a chassis with motors a bit like the one in the picture below. Our task was to use the robot to guide (dribble?) a ping-pong ball along a path within a fixed time (IIRC it was 60 seconds?).

![](/assets/img/posts/robocon-2020/chassis-example.jpeg){:.w-75}
{:.center}

Software-wise we used Arduino to program the controller. I've never touched Arduino before, but the people behind it did a good job of abstracting a lot of low-level functionality. It was fun programming the robot to receive commands (e.g. turn left, turn right) and controlling the motors to respond. The programming wasn't too complicated. Something simple like this would've worked:

* If the left button is pressed, add X to the left wheel.
* If the right button is pressed, add X to the right wheel.
* Set the motor speed for left/right wheels.

This means that if both buttons were pressed, then the robot would move forward. Of course there were other buttons on the controller, meaning we could implement reverse driving or more sophisticated commands if we chose to.

It was also sort of nice meeting new faces. I was paired with a nice international fellow, which was great since my Cantonese was a bit rusty. He was a bit unfamiliar with C/C++, but he was helpful nonetheless.

To be quite honest, I had no expectations joining the workshop. But overall it seemed well planned, and I had some fun in the process. The seniors were quite nice, walking around and offering help. In fact, I didn't realise the workshop was actually part of the robotics team's recruitment process until after. I simply thought: "How nice! A bunch of students were going out of their way to give a workshop."

Near the end of the workshop, we went through a little interview (which I wasn't aware of until then), where they asked about our interests: mechanical engineering, electrical engineering, or software engineering (although usually, they just say mech/hardware/software for short).

This choice usually decides your pathway in the team, at least for the first year. For the sake of your sanity, you are only recommended to focus on one path. Later on however, nothing stops you from learning the other fields. It isn't uncommon for hardware trainees to learn software skills and vice versa. But you'll have to manage your time properly.

I went with software. This is a personal choice, since I had experience with C++ and wanted to hone my programming skills. I had no experience with mech/hardware things besides playing with Lego, and my circuit/electronics physics is a bit rusty.

### Training
![](/assets/img/memes/training.jpeg){:.w-75}
{:.center}

Shortly after the workshop, we were invited to attend training sessions. These are tutorial sessions held by Robotics Team seniors.

These were split into two parts:

* Basic Training: C Basics, GPIO, Buttons, PWM, Servos
* Advanced Training: Image Processing, Magnetic Sensors

<!-- Simplify to a couple paragraphs of more personal stuff? -->

Each training lasts 3 hours and are usually held during the evenings, after most courses are finished for the day.

In my first class, the room was packed with trainees. In the trainings after, there was more room; not because the classroom was bigger, but because some trainees stopped attending. In a way, I could understand why. Even for someone who has never touched embedded systems before, the learning curve was quite steep. We were taught very low-level details about GPIO and PWM. Now if someone had never touched programming *at all*, week 1 would perhaps be a challenge.

To help solidify the theory, we would be asked to complete a set of classwork and homework. These helped us apply the theory to some degree, but the workload was still rather high. Once we complete solving a task, we would demo our solution to a senior, and they would mark it down on a spreadsheet of their own.

I should mention a bit about the social aspect as well. 

<!-- TODO -->

### The Internal Competition (Robot Design Contest)

#### Choice of Subteam
At some point, trainees begin asking themselves questions such as:

* "Will I stay in the team?"
* "Which subteam should I join?"

Now I'll try to avoid any subjectivity, so I won't provide any hard recommendations. The situation and landscape may change several years from now. Ultimately, you should decide for yourself if you want to join and which subteam to join.

What to choose depends on what you're looking for. At the time of writing, the following subteams are available (in no particular order):

* **NXP Smart Car**. More focus on image processing and cameras. Generally lighter workload.
* **MATE ROV**. Underwater robotics. Complete a set of underwater tasks within a time limit.
* **ABU Robocon**. Land-based robotics. Compete against other teams in 2v2 matches (2 robots per team). Score points within the fastest time.
* **Humanoid**. Control a human-shaped robot using fine-tuned servos and other things.
* **AUV**. (Still undergoing testing?)

Both ROV and Robocon generally have larger workloads, but also have a more all-rounded team experience.

----

Eventually I went with Robocon.

<!-- TODO -->


### Joining Robocon
#### Covid-19
#### Returning from a Personal Lockdown
#### Connecting

### Levelling Up
#### Reversing Roles - Workshop and Training
#### Organising an Internal Competition Despite Full-Online Mode
#### Guiding a Team
<!-- Summarise Robocon 2021. -->

### 
<!-- Administrative, Social Gatherings -->

