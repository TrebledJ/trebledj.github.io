---
title: STM32 MIDI Keyboard
description: Boing boing plunk plunk.
updated: "2022-12-25"
tags: project cpp embedded programming music hkust
thumbnail: /assets/img/posts/projects/midi-keyboard.jpg
include_thumbnail: true
pitch: Developed a MIDI keyboard using an STM32F4 microcontroller.
related_auto: true
---

This project was made for a course on embedded systems and is published [online](https://github.com/TrebledJ/stm32-midi-keyboard).


{% include toc.md %}

<!-- ## Posts in This Project -->


## Synopsis
The STM32 MIDI Keyboard was a project aimed to practice [embedded systems](/tags/embedded) design while also have fun developing a tactile music application. Here are some features found on the keyboard:

* 2+ octaves (29) piano keys to flexibly play various melodies
* Supports multi-press, so that we aren't stuck with boring one-note tunes and can play chords
* Volume control, so that we don’t disturb our neighbours
* Metronome, in case the user can’t keep track of tempo
* TFT display and menu selection
* Record and playback music (supports multiple channels!)
* Load/store MIDI in flash memory, in case power runs out
* Send MIDI signals through Serial USB (UART)
  * Receiving is handled by a script (receive.py)
* Extra fanciful features:
  * Transpose: shift pitches up/down on the diatonic scale
  * Auto-Chord: quality-of-life function to play octaves, triads, and open triads by just pressing the root key
  * Instruments: supports playback of sine, triangle, square, and sawtooth signals

## Development

I was lucky to work with another member of the [Robotics Team](/tags/robotics) at HKUST ([GitHub](https://github.com/TangYanYee)). She did the electrical work of designing and soldering the PCB. Both of us weren't familiar with mechanical design, so we ended up sticking things onto wood and connecting things with screws. But hey, at least it's a minimum viable product.

Although the course provided us with a multi-functional board (STM32F103VET6), we ended up using with a different board (STM32F405). The F4 series comes with more processing power, flash memory, and RAM. These are important considerations when it comes to a real-time music system. Audio buffering needs to be fast and steady, and sufficient memory is required for storage and buffering.

We used C++20 for the project. Although most classes were singletons (or treated as such), classes (and templates!) proved useful, especially for containers (such as a [fixed-size vector][fsvector]). This also allowed us to have static reflection for enum types, thanks to [magic_enum][menum]. The alternative would've been X-macros or hard-coding, both less maintainable options. 

Most MIDI keyboards out there don't produce sound by themselves, and I sometimes I'd rather just noodle around without having to set up any computer software. So one of our goals was to have the keyboard produce sound. This was pretty straightforward. Slap a timer, DMA, and DAC together, and BAM—non-blocking audio output!

We had more trouble with the speakers. They truly annoyed the heck out of us. Earlier on, we used a pair of small woofers. These were connected to an amplifier (because the voltage delivered by the board's DAC was not enough). The audio output generated when playing one tone  (e.g. 440Hz sine) was fine. However for some unknown reason, playing *multiple* tones (e.g. 440Hz sine + 660Hz sine) was catastrophic. I asked a question on [dsp.se][dsp-se-question], where some users suggested it being a psychoacoustic issue. Thankfully, that was not the case. Eventually we solved the issue by changing to different speakers, the kind used by end-users.

## Concluding Remarks

It was quite relaxing and nice to have a (semi-?)personal project developing and designing an embedded application from head to tail. The instructors for the course were really helpful as well.

If you're interested in trying something similar, here are some things we planned but didn't incorporate into our project:

* On/off switch
* Rechargable battery
* MIDI-USB output + Real-time MIDI input into software
* LED backlight under the keyboard?
* Stereo audio (L/R)
* Reverb/Chorus settings
* Note velocity! (Our buttons weren't responsive enough—even though we used the Yamaha ones.)
* Better storage (currently we only load/store MIDI for one piece)
* Explore and use [FluidSynth](https://github.com/FluidSynth/fluidsynth)
* More instrument options


[fsvector]: https://github.com/TrebledJ/stm32-midi-keyboard/blob/main/Core/Inc/utils/tinyvector.hpp
[menum]: https://github.com/Neargye/magic_enum
[dsp-se-question]: https://dsp.stackexchange.com/questions/85140/adding-two-sine-waves-results-in-a-low-buzz
