# Wavetable Synthesis Demo
# by @TrebledJ

from matplotlib.patches import ConnectionPatch
import matplotlib.ticker as mticker
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
import numpy as np


# Wavetable Parameters
table_size = 32     # Size of the wavetable (lookup table).

# Generation Parameters
freq = 8            # Frequency of the sine wave to generate (in Hz).
sample_rate = 100   # Sampling rate of the generated signal.
nsamples = 25       # Number of samples to generate.

# Animation Parameters
# Save the animation (True) or play the animation using Matplotlib's rendering (False).
save_animation = True

# Number of milliseconds between frames.
interval = 500


def generate_samples(wavetable, freq, sample_rate, *, once=False, nsamples=20):
    """
    Generate samples from a wavetable.

    Note that `sample_rate` should be at least `2 * freq`, and the 

    ### Parameters
    1. wavetable : np.array[float]
            - The wavetable containing all the pregenerated samples.
    2. freq : float
            - The frequency of the waveform to generate.
    3. sample_rate : float
            - The sampling rate of the waveform to generate.
    4. once : bool
            - True to make at most one pass through the wavetable.
            - False to run for `nsamples` times.
    5. nsamples : int
            - Number of samples to generate.
    
    ### Returns
     - A generator yielding (phases, samples), i.e. (x, y) values along the wavetable.
    """
    phases = []  # Stores phases (x).
    samples = []  # Stores samples (y).

    # The phase is a float with two components: the integer part and the decimal part.
    # The integer part indicates the sample along the wavetable which we are at, modulus
    # the wavetable's length. The decimal part indicates the fraction between the left and
    # right samples.
    phase = 0
    for _ in range(nsamples):
        if once and phase > table_size:
            break

        idx = int(phase)   # Integer part.
        frac = phase - idx # Decimal part.

        samp0 = wavetable[idx]
        samp1 = wavetable[(idx + 1) % table_size]
        samp = samp0 + (samp1 - samp0) * frac  # Interpolate!

        phases.append(phase)
        samples.append(samp)

        yield phases, samples

        phase += table_size * freq / sample_rate
        phase %= table_size

    # Pause animation.
    for _ in range(5):
        yield None


t = np.linspace(0, 1, table_size + 1)
wavetable = np.sin(2 * np.pi * t)


fig, ax = plt.subplots(2, 1)

ax[0].plot(t * table_size, wavetable, 'bo-')
ax[0].set_title("Wavetable (Lookup Table)")
ax[0].axis('off')

ax[1].set_title('Samples')
ax[1].set_xlim(-0.5, nsamples + 0.5)
ax[1].set_ylim(-1.1, 1.1)
ax[1].xaxis.set_major_locator(mticker.MultipleLocator(5))


# We'll store drawn points and connections (to be removed on subsequent iterations).
points = []
connections = []


def update(frame):
    """
    Update the animation frame with the next sample.
    """
    if frame is None:
        # Finished!
        try:
            points[-1].remove()
            connections[-1].remove()
        except:
            pass

        # Freeze!
        ani.pause()
        return fig,

    ph, samples = frame

    wt_x = ph[-1] % table_size
    wt_y = samples[-1]
    p = ax[0].plot([wt_x], [wt_y], 'ro', ms=4)
    ax[1].plot(np.arange(len(samples)), samples, 'ro')

    # Magic line between axs.
    con = ConnectionPatch(xyA=(wt_x, wt_y), xyB=(len(samples) - 1, samples[-1]), coordsA=ax[0].transData, coordsB=ax[1].transData,
                          color="red")
    fig.add_artist(con)

    try:
        points[-1].remove()
        connections[-1].remove()
    except:
        pass

    points.append(p[0])
    connections.append(con)

    return fig,


gen = generate_samples(wavetable, freq, sample_rate, nsamples=nsamples)
ani = FuncAnimation(fig, update, gen, interval=interval)

if save_animation:
    ani.save('output/wavetable-synthesis.mp4', fps=1000 // interval)
else:
    plt.show()