---
title: "Part 1: Digital Audio Processing for Dummies"
description: An introductory discourse on processing and generating audio. What makes audio tick?
updated: '2023-03-09'
tags:
 - tutorial
 - dsp
 - c
 - cpp
 - music
thumbnail: /img/posts/misc/dsp/sine-oscilloscope.jpg
usemathjax: true
related:
    # disable: true
---

A while back I worked on a lil’ [MIDI keyboard](/posts/stm32-midi-keyboard) project and learnt a lot regarding digital audio signal processing. This post is the first in a series of posts related to that project and aims to provide a springboard for those who wish to get their feet wet with audio processing.

## Dealing with Data 📈

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

Here, we’re mostly concerned with data storage (whether in files or in RAM). If we store our samples using 1 bit, then each sample has two possible loudness values (0 or 1). But 1 bit is no good, as this means our dynamic range is limited to silence (0) or an ear-breaking loudness (1). If we use 2 bits, we get twice as many volume settings (00, 01, 10, and 11). Now we have a couple intermediate options and don’t have to break our ears! The more bits each sample has, the greater the dynamic resolution.

When it comes to storing samples in files, most applications use 16-bit integers, which allow for a sufficient resolution (-32,768 to +32,767) at two bytes per sample. 32-bit floats are another common representation, bringing substantially greater detail at the expense of twice the space. For a comparison of magnitudes, 32-bit floats range from about -10<sup>38</sup> to +10<sup>38</sup> whereas 32-bit integers range from about -10<sup>9</sup> to +10<sup>9</sup>. Sadly, the increased range of floats comes with a downside—reduced precision—floats are only precise up to 7 decimal points[^floats].

[^floats]: For more info on floating points, see [Single-precision floating-point format](https://en.wikipedia.org/wiki/Single-precision_floating-point_format).

Now when it comes to audio *processing*, it's easier to work with floats in the range of -1 to 1. Why the smaller range? Well, if we work directly with the maximum bounds, we may easily (and accidentally) overflow.

For example, suppose I'm using 16-bit integers when processing and I have a bunch of samples at +32,767. Now let's say I want to add another signal on top. The result will be greater than +32,767. And due to the nature of integers in computers, the result will *wraparound* to a negative value. To give a concrete example: $32,767 + 1 = -32,768$ (for *16-bit integers*!).

## Audio Mishaps and Bugs 🐞

> *If you know the enemy and know yourself, you need not fear the result of a hundred battles.* – Sun Tzu, The Art of War

Sometimes when experimenting with audio, something goes amiss. Among the most common issues are clipping and clicks. You'll thank yourself later when debugging these pesky lil' issues.

💡 **Pro Tip**: Oscilloscopes are your friend! If you encounter weird sounds, you can feed your processed signal into an oscilloscope (analog or digital) to check for clipping or clicks.
{.alert--success}

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

Clipping usually happens out of negligence for the dynamic range. It can be addressed by scaling down the signal (achieved by multiplying samples by a factor < 1) or by using [dynamic range compression](https://en.wikipedia.org/wiki/Dynamic_range_compression) (loud noises are dampened, soft noises are left unchanged).

### Clicks

Clicks (aka pops) occur when a signal behaves discontinuously with large differences between samples. This difference forces the hardware speaker to vibrate quickly… too quickly.

![Jumpy jumpy signal is bad bad.](/img/posts/misc/dsp/click.jpg){.w-90}
{.center}

<sup>Signal jumps from -1.0 to 1.0, causing my speaker to pop and my ear drums to bleed from utter despair.</sup>
{.center}

Clicks may arise from trimming or combining an audio recordings without applying fades. In audio synthesis, they may also arise out of mishandling buffers and samples. ([Read more about clicks](https://mynewmicrophone.com/what-causes-speakers-to-pop-and-crackle-and-how-to-fix-it/).)

## Audio Synthesis 🎶

Now that we’ve covered the basics regarding data representation, we’re ready to get our hands dirty with audio generation. But where does our audio signal come from? Our signal might be…

- recorded. Sound waves are picked up by special hardware (e.g. a microphone) and translated to a digital signal through an ADC.
- loaded from a file. These are many audio formats out there, but the most common ones are .wav and .mp3. The .wav format is the simplest: it just stores samples as-is. Other formats compress audio to achieve smaller file sizes (which in turn, means faster upload/download speeds).
- synthesised. We generate audio out of thin air (or rather, code and electronics).

I’ll mainly focus on **synthesis**. We’ll start by finding out how to generate a single tone, then learn how to generate multiple tones simultaneously.

### Buffering 📦

A naive approach to generate audio might be:

1. Process one sample
2. Feed it to the DAC/speaker

But there are several issues with this: function call overhead may impact performance and we have little room left to do other things. For the sound to play smoothly while sampling at 44100Hz, each sample needs to be delivered within $\frac{1}{44100}$ s = $22.6$ µs.

A better approach is to use a *buffer* and work in batches. The buffer will hold onto our samples before feeding it to the speaker.

1. Process $N$ samples
2. Feed all $N$ samples to the DAC/speaker

We'll focus more on step 1 (processing) for now. We'll cover step 2 in the next post.

In C/C++, we can generate a 440Hz sine tone lasting 1 second like so:

```cpp
#define SAMPLE_RATE 44100  // Number of samples per second.

float buffer[SAMPLE_RATE]; // Buffer of samples to populate, each ranging from -1 to 1.

/**
 * Generate samples of a sine wave and store them in a buffer.
 * @param freq  Frequency of the sine wave, in Hz.
 */
void generate_samples(float freq) {
    // Populate the buffer with 1 second of 440Hz sine.
    for (int i = 0; i < SAMPLE_RATE; i++) {
        buffer[i] = sin(2 * PI * freq * i / SAMPLE_RATE);
    }
}
```

Remember how we mentioned different types and representations in the [Quantisation](#quantisation) section? Since we're concerned with audio processing, we'll be using floats and quantising from -1 to 1.
{.alert--info}

And that’s it—we’ve just whooshed 1 full second of pure sine tone goodness from nothing! Granted, there are some flaws with this method (it’s inefficient, and the signal clicks when repeated); but hey, it demonstrates synthesis.

### Wavetable Synthesis 🌊
A more efficient approach is to interpolate over pre-generated values (known as **wavetable synthesis** or **table-lookup synthesis**), sacrificing a bit of memory for faster runtime performance. The idea is to pre-generate one cycle of the wave (e.g. a sine) and store it in a lookup table. Then when generating samples for our audio, we would lookup the pre-generated samples and use intermediate values if necessary (via interpolation).

This is akin to preparing a cheat sheet for the exam. Then when taking the exam, you refer to the cheat sheet for equations, key points, and references; and finally connect them with the rest of your ideas.

I bet all this text is boring you, so here are some helpful visuals to ease the mood:

![Wavetable synthesis, localised in a nifty lil giffy.](/img/posts/misc/dsp/wavetable-synthesis.gif){.w-100}
{.center}

<sup>Example of wavetable synthesis. The blue dots above represent the pre-generated wavetable of length 32. The red dots are samples of a 8Hz sine wave sampled at 100Hz, generated by interpolating between values in the wavetable. The red connections indicate the source of the sample. Source code can be found on [GitHub][wavesynthgist].</sup>
{.center}

[wavesynthgist]: https://gist.github.com/TrebledJ/f42f9030d1bee0ece8af7fc0db5d0151

Wavetable synthesis can be implemented like so in C++:

```cpp
#define SINE_WAVETABLE_SIZE 256
#define SAMPLE_RATE 44100   // Number of samples per second (of the target waveform).

// The pre-generated wavetable. It should capture one cycle of the desired waveform (in this case, a sine).
float sine_wavetable[SINE_WAVETABLE_SIZE] = { /* pre-generated values ... */ };

// The phase indicates how far along the wavetable we are.
// We're concerned with two components: the integer and decimal.
// The integer part indicates the index of left sample along the wavetable, modulus the size.
// The decimal part indicates the fraction between the left and right samples.
float phase = 0;

/**
 * Generate samples of a sine wave by interpolating a wavetable.
 * @param freq  Frequency of the sine wave, in Hz.
 */
float get_next_sample(float freq) {
    size_t idx = size_t(phase); // Integer part.
    float frac = phase - idx;   // Decimal part.

    // Get the pre-generated sample to the LEFT of the current sample.
    float samp0 = sine_wavetable[idx];

    // Get the pre-generated sample to the RIGHT of the current sample.
    idx = (idx + 1) % SINE_WAVETABLE_SIZE;
    float samp1 = sine_wavetable[idx];

    // Interpolate between the left and right samples to get the current sample.
    float inter = (samp0 + (samp1 - samp0) * frac);

    // Advance the phase to prepare for the next sample.
    phase += SINE_WAVETABLE_SIZE * freq / SAMPLE_RATE;

    return inter;
}

void generate_samples_w(float freq) {
    for (int i = 0; i < SAMPLE_RATE; i++) {
        buffer[i] = get_next_sample(freq); // We've offloaded the calculations to `get_next_sample`.
    }
}
```
For a sine wave, we don't gain much in terms of performance. But when it comes to generating complex waveforms, wavetable synthesis rocks![^leaf]

[^leaf]: Guess what? We can optimise wavetable synthesis even more—so it'll rock even more! See the open source [LEAF](https://github.com/spiricom/LEAF/blob/a0b0b7915cce3792ea00f06d0a6861be1a73d609/leaf/Src/leaf-oscillators.c#L67) library for an example of heavily optimised wavetable synthesis.

Besides this software approach, we can also leverage hardware to speed up processing. But this is a matter for the next post.

### The Fourier Theorem 📊

One fundamental theorem in signal processing relates to the composition of signals. The **Fourier Theorem** can be summarised into:

> Any *periodic* signal can be broken down into a sum of sine waves.

We can express this mathematically as

$$
f(x) = a_0\sin(f_0x + b_0) + a_1\sin(f_1x + b_1) + \cdots + a_n\sin(f_nx + b_n)
$$

where $a_i$, $f_i$, and $b_i$ are the amplitude, frequency, and phase of each constituent sine wave.

![Skipper's partial to Fourier. They're the best of chums.](/img/posts/misc/dsp/fourier-analysis.jpg){.w-80}
{.center}

**Did you know?** The Fourier Theorem and Fourier Transform are ubiquitious in modern day technology. It is the basis for many audio processing techniques such as filtering, equalisation, and noise cancellation. By manipulating the individual sine waves that make up a sound, we can alter its characteristics and create new sounds. The Fourier Transform is also a key component in compressing JPG images.
{.alert--info}

What’s cool about this theorem is that we can apply it the other way: any periodic signal can be *generated* by adding sine waves. This lays the groundwork for additive synthesis and generating audio with multiple pitches (e.g. a chord).


### Additive Synthesis ➕

The principle of **additive synthesis** is pretty straightforward: signals can be combined by adding samples along time.

![Example of additive synthesis, localised on this very webpage.](/img/posts/misc/dsp/additive-synthesis.jpg){.w-100}
{.center}

<sup>Example of additive synthesis. The first and second signal show pure sine tones at 440Hz ($s1$) and 660Hz ($s2$). The third signal adds the two signals ($s1 + s2$). The fourth signal scales the summed signal down to fit within $[-1, 1]$ ($(s1 + s2) / 2$). Source code can be found on [GitHub][addsynthgist].</sup>
{.center}

[addsynthgist]: https://gist.github.com/TrebledJ/14b8842ef3696b09e299c34ba0da9e6c

To sound another pitch, we simply add a second sine wave to the buffer.

```cpp
#define SAMPLE_RATE 44100

float buffer[SAMPLE_RATE];

/**
 * Generate samples of two sine waves played together and store them in a buffer.
 * @param freq  Frequency of the first sine wave, in Hz.
 * @param freq2 Frequency of the second sine wave, in Hz.
 */
void generate_samples2(float freq, float freq2) {
    for (int i = 0; i < SAMPLE_RATE; i++) {
        buffer[i] = 0.5f * sin(2 * PI * freq * i / SAMPLE_RATE);
        buffer[i] += 0.5f * sin(2 * PI * freq2 * i / SAMPLE_RATE);
    }
}
```

How easy was that? Again, the code above populates the buffer with 1 second of audio. But this time, we add a second sample.
We also make sure to scale the sample back down to the $[-1, 1]$ range by multiplying each sample by 0.5.

Let’s try it out! Don’t worry if you lack the luxury of an embedded system with DACs and speakers. Additive synthesis can be demonstrated with tools localised on your computer. We can do it with some help from [Audacity](https://www.audacityteam.org/):

- Let’s start off with one tone.
    - Generate a 440Hz tone (Generate > Tone… > Sine).
    - Play it. You’ll hear a pure tone.
- Now let’s add another tone.
    - Make a new track (Tracks > Add New > Mono Track).
    - Generate an 880Hz tone in the new track. Same method as above.
    - Play it to hear a beautiful sounding octave.

![The audacity of it all!](/img/posts/misc/dsp/audacity.jpg){.w-100}
{.center}

You can try layering other frequencies (554Hz, 659Hz) to play a nifty A Major chord.

💡 **Note**: Wavetable synthesis and additive synthesis serve two very different purposes!
Wavetable synthesis aims to *optimise* generation of a *specific* waveform.
Additive synthesis aims to *combine multiple waveforms*, of *any* shape and size (think chords).
{.alert--success}

## Recap 🔁

Audio processing and sounds are ubiquitous in daily life. In this post, we explored how digital audio works under the hood. Hopefully we communicated on the same wavelength and no aliasing occured on your end. 😏

In the next post, we'll dive deeper into audio synthesis in embedded systems and engineer a simple tone generator.

To recap…

- A fundamental aspect to audio processing is understanding the *quality* of data. This comes in two forms: sampling and quantisation.
    - [Sampling](#sampling) refers to the discretisation and resolution of a signal in *time*. Larger sample rate = more information per second = higher quality.
    - [Quantisation](#quantisation) refers to the bitdepth, the resolution in loudness. Higher bitdepth = more degrees of loudness = higher quality.
    - To accurately reconstruct a signal, the **Nyquist Theorem** states the sample rate should be at least *twice the maximum frequency of the signal*.
- Some common issues to audio processing are clipping and clicks. They usually indicate
    - [Clipping](#clipping) occurs when samples don’t fit into the given dynamic range and are cut.
    - [Clicks](#clicks) occur when a large difference occurs in samples, causing the speaker to act wonkily.
- Audio samples may come from several sources. It may be recorded, loaded from a file, or [synthesised](#audio-synthesis).
    - We can synthesise musical pitches by [buffering](#buffering) samples and feeding them to hardware.
    - We can optimise waveform generation by using [wavetable synthesis](#wavetable-synthesis), which trades memory for speed.
    - According to the [Fourier Theorem](#the-fourier-theorem), all signals can be broken into a summation of sine waves.
    - To play multiple pitches simultaneously (chords), we can apply [additive synthesis](#additive-synthesis) to combine signals together.
