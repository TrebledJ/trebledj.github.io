---
title: "Digital Audio Synthesis for Dummies: Part 1"
description: An introductory discourse on audio processing. What makes audio tick?
updated: '2023-03-09'
tags:
 - tutorial
 - dsp
thumbnail: /img/posts/misc/dsp/sine-oscilloscope.jpg
usemathjax: true
related:
    posts: [stm32-midi-keyboard, digital-audio-synthesis-for-dummies-part-2]
    auto: false
---

A while back I worked on a lil’ [MIDI keyboard](/posts/stm32-midi-keyboard) project and learnt a lot regarding digital audio signal processing. This post is the first in a series of posts related to that project and aims to provide a springboard for those who wish to get their feet wet with audio processing.

## Dealing with Data 📈

![Get ready for some Data!](/img/posts/misc/dsp/data.jpg){.w-75}
{.center}

When processing data of any form, we are concerned with the data’s quality. Higher quality data may lead to a more thorough analysis and better user experience, but also demand higher memory and computing requirements.

With audio, we are concerned with two dimensions of quality: sampling (time) and quantisation (bit depth).

### Sampling

**Sampling** refers to how much we “chop” a signal. 

![Want some free samples?](/img/posts/misc/dsp/sampling.png){.w-90}
{.center}

<sup>Green line: original, continuous signal. Black dots: sampled, discrete signal.</sup>
{.center}

Digital audio signals are represented discretely by storing samples at regular intervals instead of having a single continuous line.

The **sample rate** refers to how fast we chop, how fast we sample our audio. Choosing an appropriate sample rate for your application is an important consideration. Audio is usually sampled at 44.1kHz or 48kHz. But why are these rates so common? To answer this, we first need to learn about the…

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

The Nyquist Theorem explains why we usually sample above 40kHz, but why 44.1kHz specifically? Well, there are historical reasons (pioneering decisions) and mathematical reasons (factoring and downsampling[^factoring]). Also, being lenient with our sampling frequency gives filters more flexibility.[^why-44100]
{.alert--info}

[^factoring]: 44100 can be factored into $44100 = 2^2 \times 3^2 \times 5^2 \times 7^2$, which is useful for downsampling to various applications.
[^why-44100]: See also: [Why do we choose 44.1 kHz as recording sampling rate?](https://dsp.stackexchange.com/q/17685/65058)

### Quantisation

While sampling deals with resolution in time, **quantisation** deals with resolution in *dynamics* (or *loudness)*.

Here, we’re mostly concerned with data storage (both files and RAM). If we store our samples using 1 bit, then each sample has only two possible loudness values (0 or 1). But this means our dynamic range is limited to silence (0) or an ear-shattering loudness (1)... so 1 bit is no good. If we use 2 bits, we get twice as many volume settings (00, 01, 10, and 11). Now we have a couple intermediate options and don’t have to break our ears! The more bits each sample has, the greater the dynamic resolution.

When it comes to storing samples in files, most applications use 16-bit integers, which allow for a decent resolution (-32,768 to +32,767) at two bytes per sample. 32-bit floats are another common representation, bringing substantially greater detail at the expense of twice the space. How much more detail are we talking about? 32-bit floats range from about -10<sup>38</sup> to +10<sup>38</sup> whereas 32-bit integers range from about -10<sup>9</sup> to +10<sup>9</sup>. Sadly, the increased range of floats comes with a downside: reduced precision. Floats are only precise up to 7 significant figures[^floats].

[^floats]: For more info on floating points, see [Single-precision floating-point format](https://en.wikipedia.org/wiki/Single-precision_floating-point_format).

Now when it comes to audio *processing*, it's easier to work with floats in the range of -1.0 to 1.0. Why the smaller range? Well, if we work directly with the maximum bounds, we may easily encounter errors.
With integers, we would experience [integer overflow](https://en.wikipedia.org/wiki/Integer_overflow), which would wrap positive values to negative values.
With floats, we would venture into the territory of infinity, which may disrupt subsequent computations.

Thus, we use a smaller range to allow room for processing.


## Audio Mishaps and Bugs 🐞

> *If you know the enemy and know yourself, you need not fear the result of a hundred battles.* – Sun Tzu, The Art of War

Sometimes when experimenting with audio, something goes amiss. The most common issues are aliasing, clipping, and clicks. These pesky lil' issues may crop up when processing audio... all the more important to understand how to mitigate them.

💡 **Pro Tip**: Oscilloscopes are your friend! If you encounter weird sounds, you can feed your processed signal into an oscilloscope (analogue or digital) to check for issues.
{.alert--success}


### Aliasing

We mentioned aliasing [earlier](#nyquist-shannon-sampling-theorem). Aliasing occurs when a signal is sampled insufficiently, causing it to appear at a lower frequency.

Generally, increasing the sample rate helps (or lowering your expectations for the maximum frequency). In any case, it's wise to be vigilant with your sample rate and frequency range.


### Clipping ✂️

Clipping occurs when our samples go out-of-bounds, past the maximum/minimum quantisation value. Clipping may cause our signal to wraparound or flatten at the peaks and troughs.

![Wraparound clippy.](/img/posts/misc/dsp/clipping-2.jpg){.w-100}
{.center}

<sup>Example of wraparound clipping, typically due to integer overflow/underflow.</sup>
{.center}

![Clamped clippy.](/img/posts/misc/dsp/clipping-1.jpg){.w-75}
{.center}

<sup>Example of a signal flattened at the peaks and troughs due to clamping.</sup>
{.center}

Clipping usually happens due to neglecting the dynamic range. It can be addressed by scaling down the signal (achieved by multiplying samples by a factor < 1) or by using [dynamic range compression](https://en.wikipedia.org/wiki/Dynamic_range_compression) (loud noises are dampened, soft noises are left unchanged).


### Clicks

Clicks (aka pops) occur when a signal behaves discontinuously with large differences between samples. This difference forces the speaker hardware to vibrate quickly… too quickly.

![Jumpy jumpy signal is bad bad.](/img/posts/misc/dsp/click.jpg){.w-90}
{.center}

<sup>Signal jumps from -1.0 to 1.0, causing my speaker to pop and my ear drums to bleed from utter despair.</sup>
{.center}

Clicks may arise from trimming or combining audio recordings without applying fades. In audio synthesis, they may also arise out of mishandling buffers and samples.[^clicks]

[^clicks]: Fox, Arthur. [*What Causes Speakers To Pop And Crackle, And How To Fix It*](https://mynewmicrophone.com/what-causes-speakers-to-pop-and-crackle-and-how-to-fix-it/)


## Recap 🔁

Audio processing is ubiquitous in daily life. In this post, we explored how digital audio works under the hood. Hopefully we communicated on the same wavelength and no aliasing occurred on your end. 😏

In the [next post](/posts/digital-audio-synthesis-for-dummies), we'll look at audio synthesis: the making of audio from nothing.

To recap…

- Fundamental to audio processing is the *quality* of audio data. This comes in two forms: sampling and quantisation.
    - [Sampling](#sampling) refers to the discretisation and resolution of a signal in *time*. Larger sample rate = more information per second = higher quality.
    - [Quantisation](#quantisation) refers to the bit depth, the resolution in loudness. Higher bit depth = more degrees of loudness = higher quality.
    - To accurately reconstruct a signal, the **Nyquist Theorem** states the sample rate should be at least *twice the maximum frequency of the signal*.
- Some common issues to audio processing are aliasing, clipping, and clicks.
    - [Aliasing](#aliasing) occurs when a signal is misinterpreted to be of lower frequency.
    - [Clipping](#clipping) occurs when samples don’t fit into the given dynamic range and are cut.
    - [Clicks](#clicks) occur when a large difference occurs in samples, causing the speaker to act wonky.
