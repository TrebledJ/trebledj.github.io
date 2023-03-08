---
title: "Part 2: Digital Audio Synthesis for Dummies"
description: A yabbering on generating audio for great good.
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
    posts: [stm32-midi-keyboard, the-basics-of-digital-audio-processing-for-dummies]
    auto: false
---

This is the second post in a series of posts on Digital Audio Processing. Similar to the [previous post](/posts/the-basics-of-digital-audio-processing-for-dummies), this post stems from a lil’ [MIDI keyboard](/posts/stm32-midi-keyboard) project I worked on last semester and is an attempt to share the knowledge I've gained with others. This post will dive into wonderful world of audio generation and introduce some basic concepts.


## Audio Synthesis 🎶

Now that we’ve covered the basics regarding data representation, we’re ready to get our hands dirty with audio generation. But where does our audio signal come from? Our signal might be…

- recorded. Sound waves are picked up by special hardware (e.g. a microphone) and translated to a digital signal through an ADC.
- loaded from a file. These are many audio formats out there, but the most common ones are .wav and .mp3. The .wav format is the simplest: it just stores samples as-is. Other formats compress audio to achieve smaller file sizes (which in turn, means faster upload/download speeds).
- synthesised. We generate audio out of thin air (or rather, code and electronics).

I’ll mainly focus on **synthesis**. We’ll start by finding out how to generate a single tone, then learn how to generate multiple tones simultaneously.

## Buffering 📦

A naive approach to generate audio might be:

1. Process one sample
2. Feed it to the DAC/speaker

But there are several issues with this: function call overhead may impact performance and we have little room left to do other things. For the sound to play smoothly while sampling at 44100Hz, each sample needs to be delivered within $\frac{1}{44100}$ s = $22.6$ µs.

A better approach is to use a *buffer* and work in batches. The buffer will hold onto our samples before feeding it to the speaker.

1. Process $N$ samples and store them in a buffer
2. Feed all $N$ samples to the DAC/speaker

We'll focus more on step 1 (processing) for now. We'll cover step 2 (output) in the next post.

Remember how we mentioned different [quantisation](/posts/the-basics-of-digital-audio-processing-for-dummies#quantisation) representations in the previous post? Since we're concerned with audio processing, we'll be using floats and quantising from -1 to 1.
{.alert--info}

In C/C++, we can generate a sine tone like so:

```cpp
#define SAMPLE_RATE 44100  // Number of samples per second.
#define BUFFER_SIZE 1024   // Length of the buffer.

// Define an array for storing samples.
float buffer[BUFFER_SIZE]; // Buffer of samples to populate, each ranging from -1 to 1.

/**
 * Generate samples of a sine wave and store them in a buffer.
 * @param freq  Frequency of the sine wave, in Hz.
 */
void generate_samples(float freq) {
    // Populate the buffer with a sine tone with frequency `freq`.
    for (int i = 0; i < BUFFER_SIZE; i++) {
        buffer[i] = sin(2 * PI * freq * i / SAMPLE_RATE);
    }
}
```

And that’s it—we’ve just whooshed pure sine tone goodness from nothing! Granted, there are some flaws with this method (it’s inefficient, and the signal clicks when repeated); but hey, it demonstrates synthesis.


**Note** on Buffers: It's common to use a buffer size which is medium-sized power of 2 (e.g. 512, 1024, 2048, 4096...) as this enhances cache loads and processing speed (dividing by a power of 2 is super easy for processors!).[^buffers]
{.alert--info}

[^buffers]: Boy, do I have a lot to say about buffers. Why is the buffer size important? Small buffers may reduce the efficacy of batching operations (which is the primary purpose of buffers). Large buffers may block the processor too much, making it sluggish to respond to new input. Choosing an appropriate buffer size also depends on your sampling rate. With a buffer size of 1024 sampling at 44100Hz, we would need generate our samples every $\frac{1024}{44.1\text{kHz}} \approx 23.2$ ms. On a single processor, this means we have *less than* 23.2 ms to perform other tasks (e.g. handle UI, events, etc.).


## Wavetable Synthesis 🌊
A more efficient approach to synthesis is to interpolate over pre-generated values, sacrificing a bit of memory for faster runtime performance. This is known as **wavetable synthesis** or **table-lookup synthesis**. The idea is to pre-generate one cycle of the wave (e.g. a sine) and store it in a lookup table. Then when generating samples for our audio, we would lookup the pre-generated samples and derive intermediate values if necessary (via interpolation).

This is akin to preparing a cheat sheet for an exam, but you're only allowed to bring one sheet of paper—space is precious. You decide to only include the most crucial equations, key points, and references. Then when taking the exam you refer to the cheat sheet for ideas and combine them with your thoughts, ultimately forming your answer.

![Wavetable synthesis, localised in a nifty lil giffy.](/img/posts/misc/dsp/wavetable-synthesis.gif){.w-100}
{.center}

<sup>Example of wavetable synthesis. The blue dots (above) indicate a pre-generated wavetable of length 32. The red dots (below) are samples of a 8Hz sine wave sampled at 100Hz, generated by interpolating on the wavetable. ([Source Code][wavesynthgist])</sup>
{.center}

[wavesynthgist]: https://gist.github.com/TrebledJ/f42f9030d1bee0ece8af7fc0db5d0151

Wavetable synthesis can be implemented in C++ like so:

```cpp
#define SINE_WAVETABLE_SIZE 256
#define SAMPLE_RATE 44100       // Number of samples per second (of the target waveform).
#define BUFFER_SIZE 1024

// The pre-generated wavetable. It should capture one cycle of the desired waveform (in this case, a sine).
float sine_wavetable[SINE_WAVETABLE_SIZE] = { /* pre-generated values ... */ };

// The phase indicates how far along the wavetable we are.
// We're concerned with two components: the integer and decimal.
// The integer part indicates the index of left sample along the wavetable, modulus the size.
// The decimal part indicates the fraction between the left and right samples.
float phase = 0;

float buffer[BUFFER_SIZE];

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
    for (int i = 0; i < BUFFER_SIZE; i++) {
        buffer[i] = get_next_sample(freq); // We've offloaded the calculations to `get_next_sample`.
    }
}
```
For a sine wave, we don't gain much in terms of performance. But when it comes to generating complex waveforms, wavetable synthesis rocks![^leaf]

[^leaf]: Guess what? We can optimise wavetable synthesis even more—so it'll rock even more! See the open source [LEAF](https://github.com/spiricom/LEAF/blob/a0b0b7915cce3792ea00f06d0a6861be1a73d609/leaf/Src/leaf-oscillators.c#L67) library for an example of heavily optimised wavetable synthesis.

Besides this software approach, we can also leverage hardware to speed up processing. But this is a matter for the next post.

## The Fourier Theorem 📊

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


## Additive Synthesis ➕

The principle of **additive synthesis** is pretty straightforward: signals can be combined by adding samples along time.

![Example of additive synthesis, localised on this very webpage.](/img/posts/misc/dsp/additive-synthesis.jpg){.w-100}
{.center}

<sup>Example of additive synthesis. The first and second signal show pure sine tones at 440Hz ($s1$) and 660Hz ($s2$). The third signal adds the two signals ($s1 + s2$). The fourth signal scales the third signal down to fit within $[-1, 1]$ ($(s1 + s2) / 2$). ([Source Code][addsynthgist])</sup>
{.center}

[addsynthgist]: https://gist.github.com/TrebledJ/14b8842ef3696b09e299c34ba0da9e6c

To sound another pitch, we simply add a second sine wave to the buffer.

```cpp
#define SAMPLE_RATE 44100
#define BUFFER_SIZE 1024

float buffer[BUFFER_SIZE];

/**
 * Generate samples of two sine waves played together and store them in a buffer.
 * @param freq  Frequency of the first sine wave, in Hz.
 * @param freq2 Frequency of the second sine wave, in Hz.
 */
void generate_samples2(float freq, float freq2) {
    for (int i = 0; i < BUFFER_SIZE; i++) {
        buffer[i] = 0.5f * sin(2 * PI * freq * i / SAMPLE_RATE);
        buffer[i] += 0.5f * sin(2 * PI * freq2 * i / SAMPLE_RATE);
    }
}
```

How easy was that? Again, the code above populates the buffer 1024 samples of audio. But this time, we added a second sample. We also made sure to scale the sample back down to the $[-1, 1]$ range by multiplying each sample by 0.5.

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

<!-- ### Fundamental Frequency -->
<!-- TODO: fundamentals? -->

## Recap 🔁

Audio generation can be pretty fun once we dive deep. As before, I hope we communicated on the same wavelength and no aliasing occured on your end. 😏

In the next post, we'll dive deeper into audio synthesis in embedded systems and engineer a simple tone generator.

To recap…

- Audio samples may come from several sources. It may be recorded, loaded from a file, or [synthesised](#audio-synthesis).
- We can synthesise musical pitches by [buffering](#buffering) samples and feeding them to hardware.
- We can optimise waveform generation by using [wavetable synthesis](#wavetable-synthesis), which trades memory for speed.
- According to the [Fourier Theorem](#the-fourier-theorem), all signals can be broken into a summation of sine waves.
- To play multiple pitches simultaneously (chords), we can apply [additive synthesis](#additive-synthesis) to combine signals together.
