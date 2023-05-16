# Additive Synthesis Demo
# by @TrebledJ

import matplotlib.pyplot as plt
import numpy as np


t = np.linspace(0, 1, 44100)
t = t[:800]

freq = lambda f: np.sin(2 * np.pi * f * t)

f1, f2 = 440, 660
s1, s2 = freq(f1), freq(f2)

data = [
    (f'{f1}Hz', s1),
    (f'{f2}Hz', s2),
    (f'Combined', s1 + s2),
    (f'Halved', (s1 + s2) / 2),
]

fig, axs = plt.subplots(len(data), 1)
for i, (label, y) in enumerate(data):
    axs[i].plot(t, y)
    axs[i].set_ylabel(label)

fig.tight_layout()
fig.show()