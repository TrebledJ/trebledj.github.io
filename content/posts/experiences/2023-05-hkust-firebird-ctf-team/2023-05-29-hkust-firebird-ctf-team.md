---
title: The HKUST Firebird CTF Team
description: Experiences and reflections journeying with the HKUST Firebird CTF Team.
tags:
 - ctf
 - hkust
 - reflection
thumbnail_src: ~/assets/img/posts/thumbnail/firebird.png
pitch: Senior member of the HKUST Firebird CTF Team. Trained and mentoring new team members, remodularise project structure, and managing R&D projects.
related:
    tags: [experiences, hkust]
---

{% image "assets/ctf-dunning-kruger-2.jpg", "CTFs explained through the Dunning-Kruger effect. I'm sure there are a lot more trenches.", "post1 w-60" %}


As an avid programmer with a passion for technology and programming, I was always intrigued by the world of cybersecurity. In my last two years of university, I was thrilled to explore this field further by joining the HKUST Firebird CTF Team. As someone with a programming background but no cybersecurity knowledge (besides rudimentary SQL injection), I was excited to develop my skills in this field.

Note that my experiences don’t speak for everyone and may not reflect the current situation of the team. With that said, let me introduce the process a bit more. The training is structured as three stages/courses, each taking place over a semester.

{% image "assets/firebird-stages.jpg", "Evolution stages of a firebird trainee.", "post1 w-60" %}

## Torchic, the Hatchling

The first stage (COMP2633) takes place during the Fall term. The Firebird team would host a [beginner-friendly CTF platform](https://intro.firebird.sh/) for us to explore the basics. This platform is open to any UST student, even students not registered in COMP2633.

Each week, senior Firebird members mentor us on various categories of CTF, including binary pwn, reverse engineering, web attacks, cryptography, and forensics. In the first couple weeks, Python and Linux basics are taught, so the training assumes no prior knowledge of cybersecurity/scripting. Regardless, I found my C++, Python, and computer organisation experience helpful to better absorb concepts.

Two topics are presented each week, and include in-class exercises and homework to reinforce concepts learned. These challenges are similar to CTF challenges, which require us to find a flag. For example, we may need to use a software to reverse-engineer a binary or exploit a web vulnerability. The homework is usually more challenging than the exercises and require more time and effort.

Some challenges are easier to solve. But don't be fooled! There's more where they came from!

{% image "assets/hacker.jpg", "You know, I'm something of an idiot myself.", "post1 w-50" %}

We participated in two (plus one extra) CTF competitions this term. In November, we participated in the [HKCERT CTF competition](https://www.hkcert.org/event/capture-the-flag-challenge-2021), a regional event where secondary and tertiary schools from all over HK (and invited teams outside) compete to hunt for flags.

In December, some of us were selected to participate in the PwC Hackaday CTF. The format for this CTF was different, where points can be spent to buy hints. Aside from the format, the vibe was much more exhilarating too, as we get to compete in person. (The other events were held online, so they were relatively lacklustre.)

Finally, in January, we participated in an internal Firebird CTF held to assess our capabilities and select candidates to proceed to the next stage of training. These challenges were designed by Firebird seniors.

These competitions allowed us to apply our newfound skills in a competitive setting, learn from mistakes, and exchange ideas afterwards through a tradition of [write-ups](/tags/writeup).

## Combusken, the Fledgling

The second stage (COMP3633) takes place during the Spring term. Again, training is structured as a course, with weekly sessions and grading. There are two notable activities in this stage: 1) presentations on a CTF topic of our choice, 2) more CTFs!

The presentations allowed us specialise in a topic and learn from each other. Topics we covered range from advanced pwn techniques (e.g. heap-based attacks) to advanced cryptographic techniques (e.g. lattice-based attacks). This was a great opportunity to practice delivering a presentation, as it prepared us for the next stage (where we would be involved in ***a lot*** of presentations).

Since I was interested in reverse engineering, I presented on [advanced angr features and tricks](https://github.com/TrebledJ/advanced-angr). Angr is a popular Python symbolic execution library, which is useful for reverse engineering, especially in CTF challenges.

Another key activity is the participation in more CTFs. We participated in four CTFs hosted worldwide, such as AngstromCTF, zer0ptsCTF, and TAMUCTF. In most of these CTFs, we would participate in one big team (14-16 of us together). In one CTF, we achieved 4th place—perhaps due to our superior manpower—but it was a nice feeling nonetheless. Through these competitions, we gained exposure to a wider range of challenges and take away valuable learnings for future training.

## Blaziken, the Firebird

In the third and final stage of Firebird's CTF training, we evolve into senior students, teaching new joiners and designing challenges for exercises, homework, and the internal CTF.

In this part of training, we learn through teaching and mentoring. Teaching not only provides us an opportunity to share our knowledge and experience, but also the opportunity to give back to the community, to reinforce our understanding of the material, and to develop soft skills.

I focused on teaching reverse engineering topics, which largely consists of disassembly, decompilation, and symbolic execution—three 2-hour presentations in total.[^meassembly] I had loads of fun designing [challenges](https://github.com/TrebledJ/USTSim) (especially for the internal CTF), helping out on Discord, and rick-rolling oblivious trainees.

[^meassembly]: Why do I like reverse engineering? Analysing assembly can be pretty fun, and it’s also crucial when analysing performance of software systems. This is especially important in low-level environments such as embedded devices, or in general for benchmarking. Finding out how things work under the hood is one way to learn.

## Conclusion

Overall, the HKUST Firebird CTF team is a great opportunity for students to gain hands-on experience in cybersecurity and to develop their skills and knowledge in the field. The program is structured in a way that provides a strong foundation for beginners and allows for the growth and development of more advanced students.

Through this experience, I gained practical skills and knowledge in cybersecurity. The challenges encountered and time spent designing/executing attacks strongly shaped my understanding and interest for cybersecurity. Aside from technical skills, the latter stages were also great opportunities to improve my presentation and organisation skills. All in all, this extracurricular raised my awareness on the importance of security and of having a moral/ethical mindset, and bolstered my ability to speak.

If you're interested in cybersecurity and looking for a way to gain hands-on experience, the HKUST Firebird CTF team is definitely worth considering.

I encourage those interested in cybersecurity to challenge themselves by trying out online CTFs[^ctf] and, if you’re a UST student, take the opportunity to train with Firebird.

[^ctf]: There are various platforms available online (for free!). Some are HackTheBox, TryHackMe, and VulnHub.