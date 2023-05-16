---
title: "Digital Audio Synthesis for Dummies: Part 2"
description: Generating audio signals for great good through additive synthesis and wavetable synthesis.
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
    posts: [stm32-midi-keyboard, digital-audio-synthesis-for-dummies-part-1]
    auto: false
---

This is the second post in a series of posts on Digital Audio Processing. Similar to the [previous post][prev-post], this post stems from a lil’ [MIDI keyboard](/posts/stm32-midi-keyboard) project I worked on last semester and is an attempt to share the knowledge I've gained with others. This post will dive into the wonderful world of audio synthesis and introduce two important synthesis techniques: additive synthesis and wavetable synthesis.


## Audio Synthesis 🎶

<!-- TODO: abbreviations -->

Where do audio signals come from? Our signal might be…

- recorded. Sound waves are picked up by special hardware (e.g. a microphone) and translated to a digital signal through an ADC.
- loaded from a file. There are many audio formats out there, but the most common ones are .wav and .mp3. The .wav format is the simplest: it just stores samples as-is. Other formats compress audio to achieve smaller file sizes (which in turn, means faster upload/download speeds).
- synthesised. We generate audio out of thin air (or rather, code and electronics).

I’ll mainly focus on **synthesis**. We’ll start by finding out how to generate a single tone, then learn how to generate multiple tones simultaneously.


## Buffering 📦

A naive approach to generate audio might be:

1. Process one sample
2. Feed it to the DAC/speaker

But there are several issues with this: function call overhead may impact performance, and we have little room left to do other things. For the sound to play smoothly while sampling at 44100Hz, each sample needs to be delivered within $\frac{1}{44100}$ s = $22.6$ µs.

A better approach is to use a *buffer* and work in batches. The buffer will hold onto our samples before feeding it to the speaker.

1. Process $N$ samples and store them in a buffer
2. Feed all $N$ samples to the DAC/speaker

We'll focus more on step 1 (processing) for now. We'll cover step 2 (output) in the next post.

{% alert "info" %}
Remember how we mentioned different [quantisation][prev-post-quantisation] representations in the previous post? Since we're concerned with audio processing, we'll be using floats and quantising from -1 to 1.
{% endalert %}

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

And that’s it—we’ve just whooshed pure sine tone goodness from nothing! Granted, there are some flaws with this method (it could be more efficient, and the signal clicks when repeated); but hey, it demonstrates synthesis.

{% alert "note" %}
Note on Buffers: Usually, the buffer size is medium-sized power of 2 (e.g. 512, 1024, 2048, 4096...). This enhances cache loads and processing speed (dividing by a power of 2 is super easy for processors!).[^buffers]
{% endalert %}

[^buffers]: Boy, do I have a lot to say about buffers. Why is the buffer size important? Small buffers may reduce the efficacy of batching operations (which is the primary purpose of buffers). Large buffers may block the processor too much, making it sluggish to respond to new input. Choosing an appropriate buffer size also depends on your sampling rate. With a buffer size of 1024 sampling at 44100Hz, we would need to generate our samples every $\frac{1024}{44.1\text{kHz}} \approx 23.2$ ms. On a single processor, this means we have *less than* 23.2 ms to perform other tasks (e.g. handle UI, events, etc.).


## The Fourier Theorem 📊

One fundamental theorem in signal processing is the **Fourier Theorem**, which relates to the composition of signals. It can be summarised into:

> Any *periodic* signal can be *broken down* into a *sum* of sine waves.

We can express this mathematically as
$$
f(x) = a_0\sin(f_0x + b_0) + a_1\sin(f_1x + b_1) + \cdots + a_n\sin(f_nx + b_n)
$$
where $a_i$, $f_i$, and $b_i$ are the amplitude, frequency, and phase of each constituent sine wave.

{% image "assets/img/posts/misc/dsp/fourier-analysis.jpg", "Skipper's partial to Fourier. They're the best of chums.", "w-80" %}

{% alert "fact" %}
The Fourier Theorem and Fourier Transform are ubiquitous in modern day technology. It is the basis for many audio processing techniques such as filtering, equalisation, and noise cancellation. By manipulating the individual sine waves that make up a sound, we can alter its characteristics and create new sounds. The Fourier Transform is also a key component in compression, such as the JPG image format.
{% endalert %}

What’s cool about this theorem is that we can apply it the other way: any periodic signal can be *generated* by adding sine waves. This lays the groundwork for additive synthesis and generating audio with multiple pitches (e.g. a chord).


## Additive Synthesis ➕

The principle of **additive synthesis** is pretty straightforward: signals can be combined by adding samples along time.

{% image "assets/img/posts/misc/dsp/additive-synthesis.jpg", "Example of additive synthesis, localised on this very webpage." %}

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

Again, the code above populates the buffer with 1024 samples of audio. But this time, we introduced a second frequency `freq2` and added a second sample to the buffer. We also made sure to scale the resulting sample back down to the $[-1, 1]$ range by multiplying each sample by 0.5.

We can see additive synthesis in action with some help from [Audacity](https://www.audacityteam.org/).

- Let’s start off with one tone.
    - Generate a 440Hz tone (Generate > Tone… > Sine).
    - Play it. You’ll hear a pure tone.
- Now let’s add another tone.
    - Make a new track (Tracks > Add New > Mono Track).
    - Generate an 880Hz tone in the new track. Same method as above.
    - Play it to hear a beautiful sounding octave.

{% image "assets/img/posts/misc/dsp/audacity.jpg", "The audacity of it all!" %}

During playback, Audacity will combine the samples from both tracks by summing them and play the summed signal.

You can try layering other frequencies (554Hz, 659Hz) to play a nifty A Major chord.

<!-- ### Fundamental Frequency -->
<!-- TODO: fundamentals? -->


## Wavetable Synthesis 🌊

In previous code blocks, we computed samples using `sin()`. But what if we wanted to compute something more complex? Do we really just reverse the Fourier theorem and apply additive synthesis on a bunch of sine signals? It turns out there's a better way.

A more efficient approach is to interpolate over *pre-generated values*, sacrificing a bit of memory for faster runtime performance. This is known as **wavetable synthesis** or **table-lookup synthesis**. The idea is to pre-generate one cycle of the wave (e.g. a sine) and store it in a lookup table. Then when generating samples for our audio, we would look up the pre-generated samples and derive intermediate values if necessary (via interpolation).

This is akin to preparing a cheat sheet for an exam, but you're only allowed to bring one sheet of paper—space is precious. You decide to only include the most crucial equations, key points, and references. Then when taking the exam you refer to the cheat sheet for ideas, connect the dots, and combine them with your thoughts to form an answer.

{% image "assets/img/posts/misc/dsp/wavetable-synthesis.gif", "Wavetable synthesis, localised in a nifty lil' giffy." %}

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

[^leaf]: Guess what? There are more ways to optimise wavetable synthesis—so it'll rock even more! See the open source [LEAF](https://github.com/spiricom/LEAF/blob/a0b0b7915cce3792ea00f06d0a6861be1a73d609/leaf/Src/leaf-oscillators.c#L67) library for an example of heavily optimised wavetable synthesis.

{% alert "fact" %}
Wavetable synthesis is commonly used by MIDI to generate sounds. Each instrument has its own *soundfont*, which is a collection of wavetables of different pitches. This unifies the synthesis approach for all instruments, as some may be simple to generate (e.g. clarinet) while others are more complex.
{% endalert %}

{% alert "success" %}
Additive synthesis and wavetable synthesis serve two very different purposes!

* Additive synthesis aims to *combine multiple waveforms*, of *any* shape and size (e.g. playing chords, or combining guitar and voice tracks).
* Wavetable synthesis aims to generate a *specific* waveform (in a fast manner).
{% endalert %}

Besides this software approach, we can also leverage hardware to speed up processing. But this is a matter for the next post.


## Recap 🔁

Audio generation is pretty fun once we dive deep, as are its applications: toys, electronic instruments, virtual instruments, digital synths, speakers, hearing aids, and whatnot.  As before, I hope we communicated on the same wavelength and the information on this post did not experience aliasing. 😏

In the next post, we'll dive even deeper into audio synthesis (particularly in embedded systems) and engineer a simple tone generator.

To recap…

- Audio samples may come from several sources. It may be recorded, loaded from a file, or [synthesised](#audio-synthesis).
- We can synthesise musical pitches by [buffering](#buffering) samples and feeding them to hardware.
- According to the [Fourier Theorem](#the-fourier-theorem), all signals can be broken into a summation of sine waves.
- To combine audio signals, we can apply [additive synthesis](#additive-synthesis).
  - This also allows us to play multiple pitches simultaneously (chords).
- We can generate complex waveforms by using [wavetable synthesis](#wavetable-synthesis), which trades memory for speed by sampling pre-generated signals.


[prev-post]: /posts/digital-audio-synthesis-for-dummies-part-1
[prev-post-quantisation]: /posts/digital-audio-synthesis-for-dummies-part-1#quantisation
