# %%

from matplotlib.patches import *
import matplotlib.ticker as mticker
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
import numpy as np


# %%

end = 1.5
sr = 50
t = np.linspace(0, end, 1000)
t2 = np.linspace(0, end, sr)
x = lambda t: (np.sin(2 * np.pi * 4 * t) + np.sin(2 * np.pi * 5 * t))/2

plt.figure(figsize=(8, 3))
plt.plot(t, x(t), 'b-')

marks, stems, base = plt.stem(t2, x(t2), linefmt='r--', markerfmt='ro', basefmt='k-')
# plt.setp(marks, 'markersize', 3)
plt.setp(stems, 'linewidth', 1)
plt.setp(stems, 'alpha', 0.4)
plt.setp(base, 'linewidth', 1)
plt.setp(base, 'alpha', 0.2)
plt.yticks([-1, -0.5, 0, 0.5, 1])
plt.xticks([])
plt.xlim(0, end)

plt.tight_layout()
plt.savefig('output/sampling.jpg')


# %%

# %%
