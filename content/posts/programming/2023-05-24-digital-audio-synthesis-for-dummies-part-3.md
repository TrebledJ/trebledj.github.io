---
title: "Digital Audio Synthesis for Dummies: Part 3"
description: Efficiently streaming audio to speakers on embedded systems (with examples in STM32).
tags:
 - tutorial
 - dsp
 - embedded
 - c
 - cpp
 - music
thumbnail: assets/img/posts/misc/dsp/synthwave-a-major-space-3.jpg
include_thumbnail: true
usemathjax: true
related:
    posts: [r/digital-audio-synthesis-for-dummies-part-.*/r, stm32-midi-keyboard]
    auto: false
---

> *Slap a timer, DMA, and DAC together, and BAM—non-blocking audio output!*  
> — TrebledJ, 2022

Ah… embedded systems—the intersection of robust hardware and versatile software.

This is the third (and culminating) post in a series on digital audio synthesis. In the [first post](/posts/digital-audio-synthesis-for-dummies-part-1), we introduced basic concepts in audio processing. In the [second post](/posts/digital-audio-synthesis-for-dummies-part-2), we dived into audio synthesis and generation.

Now suppose we want to play a continuous, uninterrupted stream of audio. We'd need to keep sending audio samples every few microseconds. Buffering alone isn’t good enough.

In this post, we’ll discover how to effectively implement an audio synthesiser on an embedded device by marrying hardware (timers, DACs, DMA) and software (double buffering).[^subtopics] To understand these concepts even better, we’ll look at examples on an STM32.[^stm] These examples are inspired from a [MIDI keyboard project](/posts/stm32-midi-keyboard) I previously worked on.

[^subtopics]: Each of these components (especially hardware) deserve their own post to be properly introduced; but for the sake of keeping this post short, I’ll only introduce them briefly and link to other resources for further perusal.

[^stm]: There are several popular microcontroller brands each with their pros and cons. STM is one such brand. It’s a bit overkill for demonstrating audio synthesis, but I chose it here because of my familiarity, and to demonstrate my STM32 MIDI Keyboard project. Rest assured the concepts are transferable, though hardware implementations may differ between brands.


## Timers ⏳

It turns out kitchens and embedded systems aren’t that different after all! Both perform input and output, and both have timers! Who knew? Tick-Tock Croc, perhaps.[^ticktock]

[^ticktock]: The only culinary experience Tick-Tock’s familiar with is hunting Captain Hook. As for embedded systems, I’m sure he has experience demolishing them out of pure enjoyment.

{% image "assets/img/posts/misc/dsp/tick-tock.jpg", "Tick tock likey embedded timers?", "post1" %}


### Tick Tock

Timers in embedded systems are similar to those in the kitchen: they count down for a period of time and signal an event when finished. They’re *really* flexible (especially on boards like STM).

So how do they work? When do they fire?

There are various ways to configure a timer, too many to cover in this post. But we’re interested in making a timer fire repeatedly at regular intervals. We can set the speed of the timer based on the MCU clock.[^clock]

[^clock]: The MCU clock is like the backbone of a controller. It controls the processing speed and pretty much everything!—timers, ADC, DAC, communication protocols, and whatnot.

{% alert "fact" %}

In case you were wondering how timers derive their frequency from the clock…

The following diagram illustrates how the clock signal is divided. There are two divisors: the prescaler and auto-reload. We'll study them more closely in the upcoming examples.

{% image "assets/img/posts/misc/dsp/timing-diagram.jpg", "Timing diagram of timer signal derived from a clock signal.", "post1" %}

<sup>Example of a clock signal divided by a prescaler of 2, then an auto-reload of 6. On every overflow (arrow shooting up), the timer starts a new period and triggers an interrupt. This interrupt will be used later to trigger a DAC/DMA send. (Adapted from uPesy.[^upesy])</sup>
{.caption}

[^upesy]: [How do microcontroller timers work?](https://www.upesy.com/blogs/tutorials/how-works-timers-in-micro-controllers) – A decent article on timers. Diagrams are in French though.

{% endalert %}


Some additional properties of embedded timers make them suitable for our application:

- continuity. They can be set to repeat (indefinitely!).
- connectivity. Timers can trigger other events such as interrupts (special functions to be executed), ADC conversions, and DMA transfers.[^timer-events] Heck, they can even be used to trigger other timers!
    - Triggering ADC conversions is useful to regularly sample analogue signals.
    - Triggering DMA transfers is useful for feeding samples to the DAC at the right moment. (More on this later!)

[^timer-events]: The extent of timer events depends on hardware support. Timers can do a lot on ST boards. For other brands, you may need to check the datasheet or reference manual.

Further Reading:

- [Getting Started with STM32: Timers and Timer Interrupts](https://www.digikey.com/en/maker/projects/getting-started-with-stm32-timers-and-timer-interrupts/d08e6493cefa486fb1e79c43c0b08cc6)

### Example: Initialising the Timer

Suppose we want to send a stream of audio output, we can use a timer which triggers at a certain frequency.

On our STM32F405, the configured (and max) clock cycle is 168MHz. If we’re aiming for an output sample rate of 42,000Hz, we’d need to divide our clock signal by 4,000, so that we correctly get $\frac{168,000,000}{4,000} = 42,\!000$. This division can be achieved by setting a timer’s PSC (prescaler) and ARR (auto-reload) registers.

We can use STM32 CubeMX, a GUI for configuring hardware options, to initialise our timer parameters.[^cubeide] CubeMX allows us to generate code from these options, handling the conundrum of modifying the appropriate registers.

[^cubeide]: STM32 CubeIDE also has CubeMX features built-in, along with jank Eclipse IDE support. Useful if you’re switching back and forth a lot between code and hardware.

{% image "assets/img/posts/misc/dsp/stm32-cubemx-timer-1.jpg", "Timer settings from CubeMX.", "post1" %}

<sup>In CubeMX, we first select a timer on the left. We then enable a channel (here Channel 4) to generate PWM.[^chtim] We also set the prescaler and auto-reload so that our timer frequency is 42,000Hz.</sup>
{.caption}

[^chtim]: We chose Timer 8 with Channel 4 because its pins were available, and other timers had occupied pins. The timer and channel you use depends on your STM board and model. If you’re following along this post, make sure to choose a timer which has DMA generation. When in doubt, refer to the reference manual.[^rm0090]


{% alert "fact" %}

Note that since the PSC (prescaler) and ARR (auto-reload) variables are 16-bit *registers*, they range from 0 to 65,535. So a PSC of 0 means a prescaler divisor of 1. Thus, by setting `PSC = 0` and `ARR = 3999`, we obtain a divisor of $(0 + 1) \times (3999 + 1) = 4000$.

In the diagram of the previous section, if we want a prescaler divisor of 2 and auto-reload divisor of 6, we would set `PSC = 1` and `ARR = 5`.

{% endalert %}

{% image "assets/img/posts/misc/dsp/stm32-cubemx-timer-2.jpg", "More timer settings from CubeMX.", "post1" %}

<sup>Some other settings in CubeMX to check. The pulse (aka Compare Value) affects the duty cycle of the [PWM](https://docs.arduino.cc/learn/microcontrollers/analog-output) signal. Higher pulse, higher duty cycle.</sup>
{.caption}

Remember to generate code once done.[^codegen] CubeMX should generate the following code in `main.c`:

[^codegen]: In CubeMX, you can generate code by clicking the *Project* > *Generate Code* menu option. Keep in mind that only code between `USER CODE BEGIN` and `USER CODE END` comments will be preserved by ST's code generator.

```cpp
static void MX_TIM8_Init(void)
{
    // --snip-- Initialise structs. --snip--

    htim8.Instance               = TIM8;
    htim8.Init.Prescaler         = 0;
    htim8.Init.CounterMode       = TIM_COUNTERMODE_UP;
    htim8.Init.Period            = 4000 - 1;
    htim8.Init.ClockDivision     = TIM_CLOCKDIVISION_DIV1;
    htim8.Init.RepetitionCounter = 0;
    htim8.Init.AutoReloadPreload = TIM_AUTORELOAD_PRELOAD_DISABLE;
    if (HAL_TIM_Base_Init(&htim8) != HAL_OK) {
        Error_Handler();
    }
    
    // --snip-- Initialise the clock source. --snip--
    
    if (HAL_TIM_PWM_Init(&htim8) != HAL_OK) {
        Error_Handler();
    }
    
    // --snip-- Initialise other things. --snip--
    
    HAL_TIM_MspPostInit(&htim8);
}
```

Later on, we can change the timer frequency at runtime by setting the prescaler and auto-reload registers.

```cpp
TIM8->PSC = 0;    // Prescaler: 1
TIM8->ARR = 3999; // Auto-Reload: 4000
```

### Example: Playing with Timers

STM’s HAL library provides ready-made functions to interface with hardware. 

```cpp
HAL_TIM_Base_Start(&htim8); // Start the timer.
HAL_TIM_Base_Stop(&htim8);  // Stop the timer.

HAL_TIM_PWM_Start(&htim8);  // Start the timer (as PWM).
HAL_TIM_PWM_Stop(&htim8);   // Start the timer (as PWM).
```

`HAL_TIM_Base_Start` is used to start a timer in base mode for basic timing and event counting applications, while `HAL_TIM_PWM_Start` is used to start a timer in PWM mode for generating periodic PWM signals. The choice of function depends on the specific application and the functionality required. For us, base mode is good enough.

`Base` and `PWM` are two modes available with this timer. Functions for other modes are available in `stm32f4xx_hal_tim.h`.

## Digital-to-Analogue Converters (DACs) 🌉

There are three representations of audio: sound waves (physical), electrical voltages (analogue), and binary data (digital).

- Our audio hardware—localised on the sides of our head—are designed to perceive *sound waves*.
- Audio equipment, such as microphones and speakers, are designed to interface between sound waves and *analogue* signals.
- Computer chips and processors work primarily with *digital* signals.

{% image "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/CPT-Sound-ADC-DAC.svg/1200px-CPT-Sound-ADC-DAC.svg.png", "Tolkien's world looks nothing like the three realms here.", "post1" %}

Since signal representations vastly differ, we need interfaces to translate, to bridge the worlds. Between the analogue and digital realms, we have DACs (Digital-to-Analogue Converters) and ADCs (Analogue-to-Digital Converters) as mediators. Generally, DACs are used for output while ADCs are for input.

Since our topic today is synthesis, we’ll focus on DACs—going from binary data to sound waves.

### A Closer Look at DACs 

Remember [sampling](/posts/digital-audio-synthesis-for-dummies-part-1#sampling)? We took a continuous analogue signal and selected discrete points at regular intervals. An ADC is like a glorified sampler.

{% image "assets/img/posts/misc/dsp/sampling.jpg", "Free samples have returned!", "post1" %}

While an ADC takes us from continuous to discrete, a DAC takes us from discrete to continuous. (Well, it tries to anyway.[^lossy]) The shape of the resulting analogue waveform depends on the DAC implementation. Simple DACs will stagger the output at discrete levels. More complex DACs may interpolate between two discrete samples to “guess” the intermediate values. Some of these guesses will be off, but at least the signal is smoother.

[^lossy]: Keep in mind that sampling a continuous signal is a lossy conversion. Information is bound to be loss. A DAC can only replicate the original signal so much.

### Example: Initialising the DAC

Let’s return to CubeMX to set up our DAC.

{% image "assets/img/posts/misc/dsp/stm32-cubemx-dac-1.jpg", "DAC settings from CubeMX.", "post1" %}

<sup>Enable DAC, and connect it to Timer 8 using the trigger setting. Our STM32F405 board supports two DAC output channels. This is useful if we want stereo audio output.</sup>
{.caption}

{% image "assets/img/posts/misc/dsp/stm32-cubemx-dac-2.jpg", "DAC DMA settings from CubeMX.", "post1" %}

<sup>Configure DMA settings for the DAC. We’ll cover DMA later.</sup>
{.caption}

{% image "assets/img/posts/misc/dsp/stm32-cubemx-dac-3.jpg", "Enable DAC DMA interrupts.", "post1" %}

<sup>Enable interrupts for the DMA. These are needed to trigger DAC sends.</sup>
{.caption}

Again, remember to generate code when finished.[^codegen] The `MX_DAC_Init()` function should contain the generated DAC setup code and should already be called in `main()`.

### Example: Using DAC

On our STM32, DAC accepts samples [quantised](/posts/digital-audio-synthesis-for-dummies-part-1#quantisation) to 8 bits or 12 bits.[^dacalignment] We’ll go with superior resolution: 12 bits!

{% image "assets/img/posts/misc/dsp/stm32-dac-alignment.jpg", "Three options for DAC alignment are offered.", "post1" %}

<sup>STM32 offers three different options to quantise and align DAC samples. We’ll only focus on the last option: 12-bit right aligned samples. (Source: RM0090 Reference Manual.[^rm0090])</sup>
{.caption}

[^dacalignment]: There are pros to using 8-bit or 12-bit DAC. 8-bit conversion is faster, whereas 12-bit offers higher resolution. To slightly complicate things, the 12-bit DAC option on our STM32 can be aligned either left or right. That is, we can choose whether our data takes up the first 12 bits or last 12 bits on a 16-bit (2-byte) space. Alignment exists to [save you a shift operation](https://electronics.stackexchange.com/a/565451), which depends on your application.

[^rm0090]: [STM's Official Reference Manual for F405/F415, F407/F417, F427/F437, F429/F439 boards](https://www.st.com/resource/en/reference_manual/rm0090-stm32f405415-stm32f407417-stm32f427437-and-stm32f429439-advanced-armbased-32bit-mcus-stmicroelectronics.pdf). Definitely something to refer to if you’re working on one of those boards.

For simplicity, let’s start with sending 1 DAC sample. This can be done like so:

```cpp
HAL_DAC_Start(&hdac, DAC_CHANNEL_1);
HAL_DAC_SetValue(&hdac, DAC_CHANNEL_1, DAC_ALIGN_12B_R, 1024);
```

This should output a voltage level of $\frac{1024}{4096} = 25\%$ of the reference voltage $V_{\text{REF}}$.

Once started, the DAC will continue outputting at that voltage until we change the DAC value or call `HAL_DAC_Stop()`. We use `DAC_CHANNEL_1` to select the first channel, and use `DAC_ALIGN_12B_R` to accept 12-bit samples aligned right.

To fire an entire buffer of samples, we could use a loop and call `HAL_DAC_SetValue` repeatedly. Let’s try generating a simple square wave.

```cpp
HAL_DAC_Start(&hdac, DAC_CHANNEL_1);

// Alternate between high (4095) and low (0).
uint8_t high  = 1;
while (1) {
    uint16_t sample = (high ? 4095 : 0); // max = 4095 = 2^12 - 1.
    high = !high;
    HAL_DAC_SetValue(&hdac, DAC_CHANNEL_1, DAC_ALIGN_12B_R, sample);

    // Delay for 5ms.
    HAL_Delay(5);
}
```

This generates a square wave with a period of 10ms, for a frequency of 100Hz.

{% image "assets/img/posts/misc/dsp/osc-square-wave.jpg", "A square wave at 100Hz.", "post1" %}

<sup>Oscilloscope view of the signal. This is very useful for debugging signals, especially periodic ones.</sup>
{.caption}

{% alert "warning" %}

An aside. The default `HAL_Delay()` provided by STM will add 1ms to the delay time—well, at least in my version. I overrode it using a separate definition so that it sleeps the given number of ms.

```cpp
void HAL_Delay(uint32_t ms)
{
    uint32_t start = HAL_GetTick();
    while ((HAL_GetTick() - start) < ms);
}
```

{% endalert %}

But there are two issues with this method:

1. Using a while loop blocks the thread, meaning we block the processor from doing other things while outputting the sine wave.
2. Since `HAL_Delay()` delays in milliseconds, it becomes impossible to generate complex waveforms at high frequencies, since that requires us to send samples at **microsecond** intervals.

{% image "assets/img/posts/misc/dsp/y-u-no-faster.jpg", "HAL Delay, y u no faster?", "post1 w-80" %}

In the next section, we’ll address these issues by combining DAC with timers and DMA.

Further Reading:

- [Deep Blue Embedded: STM32 DAC Tutorial](https://deepbluembedded.com/stm32-dac-tutorial-example-hal-code-analog-signal-genreation)

## Direct Memory Access (DMA) 💉🧠

Direct Memory Access (DMA) appears to be three random words smushed together, but it’s a powerful tool in the embedded programmer’s arsenal. How?

{% alert "success" %}

**DMA enables data transfer without consuming processor resources.** (Well, it consumes minimal resources, but only for setup.) This frees up the processor to do other things while DMA takes care of moving data. We could use this saved time to prepare the next set of buffers, render the GUI, etc.

{% endalert %}

DMA can be used to transfer data from memory-to-peripheral (e.g. DAC, UART TX, SPI TX), from peripheral-to-memory (e.g. ADC, UART RX), across peripherals, or across memory. In this post, we're concerned with memory-to-peripheral transfer: DAC.

Further Reading:

- [Baeldung: How Do DMA Controllers Work?](https://www.baeldung.com/cs/dma-controllers)

### Example: DMA

If you’ve read this far, I presume you’ve followed the [previous section](#example-initialising-the-dac) by initialising DMA and generating code with CubeMX.

{% alert "note" %}

Be aware that DMA introduces synchronisation issues. After preparing a second round of buffers, how do we know if the first round has already finished?

As with all process which depend on a separate event, there are two approaches: polling and interrupts. We could block and wait until the first round is finished, then send… or we could trigger an interrupt when it finishes, then start the next round inside the interrupt handler. The approach depends on your application.

In our examples, we’ll poll to check if DMA is finished:

```cpp
while (HAL_DAC_GetState(&hdac) != HAL_DAC_STATE_READY)
    ;
```

{% endalert %}

With DMA, we’ll need to first [buffer](/posts/digital-audio-synthesis-for-dummies-part-2/#buffering) an array of samples. Our loop will run like this:

1. Buffer samples.
2. Wait for DMA to be ready.
3. Start the DMA.

Do you notice a flaw in this approach? Since we’re using a *single* buffer, we risk overwriting the buffer while it’s being sent. Hence, some wonky effects might infect our signal!

Let’s try to implement it anyway and play a simple 440Hz sine wave.

```cpp
#include <math.h>  // M_PI, sin

#define SAMPLE_RATE 42000
#define BUFFER_SIZE 1024
#define FREQUENCY   440

uint16_t buffer[BUFFER_SIZE];
uint32_t t = 0; // Time (in samples).

// Start the timer.
HAL_TIM_Base_Start(&htim8);

while (1) {
    // Prep the buffer.
    for (int i = 0; i < BUFFER_SIZE; i++, t++) {
        float val = sin(2 * M_PI * FREQUENCY * t / SAMPLE_RATE);
        buffer[i] = 2047 * val + 2047; // Scale the value from [-1, 1] to [0, 2^12-1).
    }

    // Wait for DAC to be ready, so that the buffer can be modified on the next iteration.
    while (HAL_DAC_GetState(&hdac) != HAL_DAC_STATE_READY)
        ;

    // Start the DMA.
    HAL_DAC_Start_DMA(&hdac, DAC_CHANNEL_1, (uint32_t*)buffer, BUFFER_SIZE, DAC_ALIGN_12B_R);
}
```

The results? As expected, artefacts (nefarious little glitches) invade our signal due to our buffer being overwritten during DMA transfer. This may also result in [clipping](/posts/digital-audio-synthesis-for-dummies-part-1#clipping).

{% image "assets/img/posts/misc/dsp/osc-sine-440-glitch.jpg", "Artefacts distort the signal, resulting in occasionally clips and sound defects.", "post1" %}

<sup>Artefacts distort the signal from time to time.</sup>
{.caption}

But what if we prep, then start, then wait? This way, the buffer will be secure; but this causes the signal to stall while prepping.

<a id="stall-img"></a>
{% image "assets/img/posts/misc/dsp/osc-sine-440-stall.jpg", "Oscilloscope of sine wave with stalls (horizontal breaks with no change).", "post1" %}

<sup>The signal stalls (shown by horizontal lines) because the DAC isn’t updated while buffering.</sup>
{.caption}

To resolve these issues, we need to unleash the final weapon in our arsenal.


### Example: DMA with Double Buffering

While the timer and DMA are happily shooting out a bufferful of audio, we can focus on preparing the next round to be sent.

With double buffering, we introduce an additional buffer. While one buffer is being displayed/streamed, the other buffer is updated. This ensures our audio can be delivered in one continuous stream.

In code, we’ll add another buffer by declaring `uint16_t[2][BUFFER_SIZE]` instead of an `uint16_t[BUFFER_SIZE]`. We’ll also declare a variable `curr` (0 or 1) to index which buffer is currently available.

```cpp
#include <math.h>

#define SAMPLE_RATE 42000
#define BUFFER_SIZE 1024
#define FREQUENCY   440

uint16_t buffers[2][BUFFER_SIZE]; // New: add a second buffer.
uint8_t curr = 0;                 // Index of current buffer.
uint32_t t   = 0;

// Start the timer.
HAL_TIM_Base_Start(&htim8);

while (1) {
    // Prep the buffer.
    uint16_t* buffer = buffers[curr]; // Get the buffer being written.
    for (int i = 0; i < BUFFER_SIZE; i++, t++) {
        float val = sin(2 * M_PI * FREQUENCY * t / SAMPLE_RATE);
        buffer[i] = 2047 * val + 2047;
    }

    // Wait for DAC to be ready.
    while (HAL_DAC_GetState(&hdac) != HAL_DAC_STATE_READY)
        ;

    // Start the DMA.
    HAL_DAC_Start_DMA(&hdac, DAC_CHANNEL_1, (uint32_t*)buffer, BUFFER_SIZE, DAC_ALIGN_12B_R);

    // Swap the buffer so that we prepare the next buffer,
    // while this one is being sent.
    curr = !curr;
}
```

Now our 440Hz sine wave is unblemished.

{% image "assets/img/posts/misc/dsp/osc-sine-440-2.jpg", "Pure sine goodness. A proper 440Hz sine displaying properly.", "post1" %}

<sup>Waveform of a pure 440Hz sine tone.</sup>
{.caption}

### Example: Playing Multiple Notes with DMA and Double Buffering 🎶

With some minor changes, we can make our device generate audio for multiple notes. Let’s go ahead and play an A major chord![^amajor]

[^amajor]: I like minor chords as well, but it's not appropriate to play A minor.

```cpp
// Prep the buffer.
uint16_t* buffer = buffers[curr];
for (int i = 0; i < BUFFER_SIZE; i++, t++) {
    // Compute value for each note.
    float a = sin(2 * M_PI * 440 * t / SAMPLE_RATE);
    float cs = sin(2 * M_PI * 554.37 * t / SAMPLE_RATE);
    float e = sin(2 * M_PI * 659.25 * t / SAMPLE_RATE);

    float val = (a + cs + e) / 3;  // Sum and normalise to [-1, 1].
    buffer[i] = 2047 * val + 2047; // Map [-1, 1] to [0, 2^12-1).
}
```

If you flash the above code and feed output to an oscilloscope, you may find it doesn’t really work. Our signal [stalls](#stall-img), for similar reasons as before.

{% alert "warning" %}

Even with DMA, stalls may occur. This is usually a sign that DMA finished long before buffering has. The takeaway is that buffering (and other processes) consumes too much time. The onus is on you, the software engineer, to speed things up.

{% endalert %}

### Optimisations 🏎

So our code is slow. How do we speed it up? We really want to play an A major chord!

There are a few common tricks to speed up buffering:

- Precompute constants. Instead of computing `2 * M_PI * FREQUENCY / SAMPLE_RATE` on every iteration, we can precompute it before the loop, saving many multiplication instructions.
    
    ```cpp
    // Precompute a factor of the 440Hz signal.

    float two_pi_f_over_sr = 2 * M_PI * FREQUENCY / SAMPLE_RATE;
    
    while (1) {
        // Prep the buffer.
        uint16_t* buffer = buffers[curr];
        for (int i = 0; i < BUFFER_SIZE; i++, t++) {
            buffer[i] = 2047 * sin(two_pi_f_over_sr * t) + 2047;
        }
    
        // ...
    }
    ```
    
- [Wavetable synthesis](/posts/digital-audio-synthesis-for-dummies-part-2/#wavetable-synthesis). Math functions such as `sin` can be computationally expensive, especially when used a lot. By caching the waveform in a lookup table, we can simply speed up and interpolate
- Increase the buffer size. By increasing the buffer size, we spend less overhead switching between tasks.
    
    But on a single-threaded program, we need to be aware of time constraints in other tasks. For instance, if we have a GUI and need it to render smoothly (<50 ms between paints), we’ll need to somehow manage our processing resources.
    
- Decrease the sample rate. If all else fails, we can decrease the load by lowering the sample rate, say from 42000Hz to 21000Hz. With a buffer size of 1024, that means we’ve gone from a constraint of 1024/42000 = 24.4ms to 1024/21000 = 48.8ms per buffer.

To avoid complicating things, I lowered the sample rate to 21000Hz. This means changing the auto-reload register to 7999, so that our timer frequency is $\frac{168,000,000}{7,999 + 1} = 21,\\!000$ Hz.

```cpp
TIM8->ARR = 7999;
```

After all this hassle, we get a beautiful chord.

{% image "assets/img/posts/misc/dsp/osc-a-major.jpg", "The curves are mesmerising.", "post1" %}

<sup>A nifty waveform of an A major chord (440Hz + 554.37Hz + 659.25Hz).</sup>
{.caption}

## Recap 🔁

By utilising both hardware and software, we reap the benefits of parallel processing while implementing an efficient, robust audio application. On the hardware side, we explored:

- [Timers](#timers), which are useful for automatically triggering actions at regular intervals.
- [DACs](#digital-to-analogue-converters-dacs), which enable us to communicate with the speaker by translating our digital samples to an analogue signal.
- [DMA](#direct-memory-access-dma), which enable data transfer with minimal processor resources, so that we could process other things while sending out audio.

In software, we explored:

- [Double buffering](#example-dma-with-double-buffering), a software technique for buffering data to achieve continuous or faster output.
- [Various optimisations](#optimisations), which enable us to squeeze more audio processing into our tiny board.

When combined, we save processing time and power, which can then be used on additional features.

Other things to explore are:

- Generating stereo audio. We’ve generated audio for Channel 1. What about stereo audio for Channel 2? We could reuse the same buffer for channel 2. But if you’re using reverb or echo effects and wish for a fuller stereo sound, you’ll need an extra pair of buffers (and more processing!).
- Streaming via UART. It's possible to use DMA with other forms of output.
- SIMD instructions to buffer two (or possibly more) samples at the same time.
- RTOS for multitasking.
- Other boards or hardware with specialised audio features.

## Full Code

The complete code for DMA with double buffering has been uploaded as a [GitHub Gist](https://gist.github.com/TrebledJ/5c45ba3366918352a3d56625a636bafa).
