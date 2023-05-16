# %%
from matplotlib.patches import *
import matplotlib.ticker as mticker
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
import numpy as np

# %%
f = 4
t = np.linspace(0, 1, 1000)
x = np.sin(2 * np.pi * f * t)


def quantise(nbit):
    assert nbit >= 1, "bad bad"
    scale = (2 ** nbit - 1) / 2
    return np.round((np.sin(2 * np.pi * f * t) + 1) * scale) / scale - 1


# %%
bits = [1, 2, 3, 8]

# plt.figure(figsize=(6, 6))
for i, b in enumerate(bits):
    plt.subplot(len(bits), 1, i+1)
    plt.plot(t, x, "b-", label="original")
    plt.plot(t, quantise(b), "r.", label="quantised", markersize=3)
    plt.title(f"{b}-bit Quantisation")
    plt.xticks([])
    plt.yticks([])

plt.suptitle("Quantisation w.r.t. Quality")
plt.tight_layout()
plt.savefig("output/quantisation-quality.jpg")
plt.show()


# %%

for i, b in enumerate(bits):
    ax = plt.subplot(len(bits), 1, i+1)
    for j in range(4):
        r = Rectangle(
            (j * b, 0), b, 2, edgecolor="black", facecolor="none", linewidth=1
        )
        ax.add_patch(r)
    plt.xlim(0, 32)
    plt.title(f"{b}-bit Quantisation")
    plt.xticks(range(0, 32 + 1, 8))
    plt.yticks([])

plt.suptitle("Quantisation w.r.t. Storage")
plt.tight_layout()
plt.savefig("output/quantisation-storage.jpg")
plt.show()


# %%
