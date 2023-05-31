# %%

from matplotlib.patches import *
import matplotlib.ticker as mticker
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
import numpy as np


# %%

end = 1 # End time.
fs = [4, 5] # Frequencies
srs = [50, 30, 10] # Sample rates to plot.

t = lambda sr: np.linspace(0, end, sr+1)
x = lambda t: sum(np.sin(2 * np.pi * f * t) for f in fs)/len(fs)

plt.figure(figsize=(8, 4))


for i, sr in enumerate(srs):
    plt.subplot(len(srs), 1, i+1)
    plt.plot(t(1000), x(t(1000)), 'b-', label='original')

    marks, stems, base = plt.stem(t(sr), x(t(sr)), linefmt='r--', markerfmt='ro', basefmt='k-', label='samples')
    # plt.setp(marks, 'markersize', 3)
    plt.setp(stems, 'linewidth', 1)
    plt.setp(stems, 'alpha', 0.4)
    plt.setp(base, 'linewidth', 1)
    plt.setp(base, 'alpha', 0.2)
    plt.yticks([-1, -0.5, 0, 0.5, 1])
    plt.xticks([])
    plt.xlim(0, end)
    plt.title(f'Sampling at {sr} Hz')


plt.legend()
plt.tight_layout()
plt.savefig('output/sampling.jpg')


# %%

# %%
