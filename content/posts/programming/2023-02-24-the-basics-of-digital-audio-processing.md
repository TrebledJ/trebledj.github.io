---
title: "Part 1: The Basics of Digital Audio Processing"
description: An introductory discourse on processing audio. What makes audio tick?
# updated: '2023-02-22'
tags:
 - tutorial
 - dsp
 - music
thumbnail: /img/posts/misc/dsp/sine-oscilloscope.jpg
usemathjax: true
related:
    # disable: true
---

A while back I worked on a lil’ [MIDI keyboard](/posts/stm32-midi-keyboard) project and learnt a lot regarding digital audio signal processing. This post is the first in a series of posts related to that project and aims to provide a springboard for those who wish to get their feet wet with audio processing.

## Dealing with Data

![Get ready for some Data!](/img/posts/misc/dsp/data.jpg){.w-75}
{.center}

When processing data of any form, we are concerned with the data’s quality. Higher quality data corresponds to a better user experience but also higher memory and computing requirements.

With audio, we are concerned with two dimensions of quality: sampling (time) and quantisation (bitdepth).

### Sampling

**Sampling** refers to how much we “chop” a signal. 

![Want some free samples?](/img/posts/misc/dsp/sampling.png){.w-90}
{.center}

<sup>Green line: continuous, original signal. Black dots: discrete, sampled signal.</sup>
{.center}

Digital audio signals are represented discretely by storing samples at regular intervals instead of having a single continuous line.

The **sample rate** refers to how fast we chop, how fast we sample our audio. Choosing an appropriate sample rate for your application is pretty crucial. Audio is usually sampled at 44.1kHz or 48kHz. But why are these rates so common? To answer this, we first need to learn about the…

### Nyquist-Shannon Sampling Theorem

The **Nyquist-Shannon Sampling Theorem** (aka the Nyquist Theorem) is an important consideration when choosing a sample rate for your application. According to this theorem, in order to accurately reconstruct a continuous signal such as audio, it must be sampled at a rate that is *at least **twice** the highest frequency component of the signal*.

For example, if we want to store a 1kHz audio signal, we would need to sample at 2kHz or more. Humans can hear frequencies in the range 20Hz – 20kHz, so if we want to capture all audible sounds, our sample rate needs to be at least 40kHz.

This is important to avoid **aliasing**, which occurs when high frequency components of a signal are mistakenly interpreted as lower frequency components. Aliasing results in distortion and can lead to inaccurate representation of the original signal.

The diagram below demonstrates aliasing, which happens when our sample rate is too low.

![Aliasing example.](/img/posts/misc/dsp/aliasing.jpg){.w-100}
{.center}

<sup>(a) Sampling a 20kHz signal at 40kHz captures the original signal correctly. (b) Sampling the same 20kHz signal at 30kHz captures an aliased (low frequency ghost) signal. (Source: Embedded Media Processing.[^emp])</sup>
{.center}

[^emp]: Katz, D; Gentile, R. 2005. *Embedded Media Processing*. They’ve provided [Chapter 5: Embedded Audio Processing](https://www.analog.com/media/en/dsp-documentation/embedded-media-processing/embedded-media-processing-chapter5.pdf) as a preview.

The Nyquist Theorem explains why we usually sample above 40kHz, but why those rates specifically? Well, there are historical reasons (pioneering decisions), but the two numbers also contain many factors (e.g. $44100 = 2^2 \times 3^2 \times 5^2 \times 7^2$) which may be convenient for downsampling and other endeavours. Moreover, since anti-aliasing and low-pass filters may disrupt samples, being lenient with our sampling frequency becomes a boon. ([See more](https://dsp.stackexchange.com/q/17685/65058).)
{.alert--info}

### Quantisation

While sampling deals with resolution in time, **quantisation** deals with resolution in *dynamics* (or *loudness)*.

Here, we’re mostly concerned with data storage. If we store our samples using 1 bit, then each sample has two possible loudness values (0 or 1). But 1 bit is no good, since we’ll be listening to silence or *breaking* our ears otherwise. If we use 2 bits, we get twice as many volume settings (00, 01, 10, and 11). Now we have a couple intermediate options and don’t have to break our ears! The more bits each sample has, the greater the dynamic resolution.

Most applications use 16-bit integers, which allow for a sufficient resolution (-32,768 to +32,767) and take up a fair amount of space (two bytes). 32-bit floats are another common representation, with more detail at the expense of space.

## Audio Mishaps and Bugs 🐞

Sometimes when experimenting with audio, something goes amiss. Among the most common issues are clipping and clicks. It’s handy to know these issues to speed up debugging.

💡 **Pro Tip**: Oscilloscopes are your friend! If you encounter weird sounds, you can feed your processed signal into an oscilloscope (analog or digital) to check for clipping or clicks.
{.alert--success}

### Clipping

Clipping occurs when our samples go out-of-bounds, past the maximum/minimum quantisation value. Clipping may cause our signal to wraparound or flatten at the peaks and troughs.

![Wraparound clippy.](/img/posts/misc/dsp/clipping-2.jpg){.w-100}
{.center}

<sup>Example of wraparound clipping, typically due to integer overflow/underflow.</sup>
{.center}

![Clamped clippy.](/img/posts/misc/dsp/clipping-1.jpg){.w-75}
{.center}

<sup>Example of a signal flattened at the peaks and troughs due to clamping.</sup>
{.center}

Clipping usually happens out of negligence for the dynamic range. It can be addressed by scaling down the signal (achieved by multiplying samples by a factor < 1) or by using [dynamic range compression](https://en.wikipedia.org/wiki/Dynamic_range_compression) (loud noises are dampened, soft noises are left unchanged).

### Clicks

Clicks (aka pops) occur when a signal behaves discontinuously with large differences between samples. This difference forces the hardware speaker to vibrate quickly… too quickly.

![Jumpy jumpy signal is bad bad.](/img/posts/misc/dsp/click.jpg){.w-90}
{.center}

<sup>Signal jumps from -1.0 to 1.0, causing my speaker to pop and my ear drums to bleed from utter despair.</sup>
{.center}

Clicks may arise from trimming or combining an audio recordings without applying fades. In audio synthesis, they may also arise out of mishandling buffers and samples.

## Recap

So to conclude…

- A fundamental aspect to audio processing is understanding the *quality* of data. This comes in two forms: sampling and quantisation.
    - [Sampling](#sampling) refers to the discretisation and resolution of a signal in *time*. Larger sample rate = more information per second = higher quality.
    - [Quantisation](#quantisation) refers to the bitdepth, the resolution in loudness. Higher bitdepth = more degrees of loudness = higher quality.
    - To accurately reconstruct a signal, the **Nyquist Theorem** states the sample rate should be at least *twice the maximum frequency of the signal*.
- Some common issues to audio processing are clipping and clicks. They usually indicate
    - [Clipping](#clipping) occurs when samples don’t fit into the given dynamic range and are cut.
    - [Clicks](#clicks) occur when a large difference occurs in samples, causing the speaker to act wonkily.

Further reading:

- [Embedded Audio Processing](https://www.analog.com/media/en/dsp-documentation/embedded-media-processing/embedded-media-processing-chapter5.pdf)
- [What Causes Speakers To Pop And Crackle, And How To Fix It](https://mynewmicrophone.com/what-causes-speakers-to-pop-and-crackle-and-how-to-fix-it/)