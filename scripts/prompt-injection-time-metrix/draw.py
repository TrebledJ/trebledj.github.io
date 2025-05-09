# Plot of Response Time vs. Input Size to be Reflected
# 
# LLM is wrapped by a custom API, and tested in a black box fashion.
# The LLM would be prompted to extract and respond with a field from the input 1-for-1.
# 
# by @TrebledJ

import matplotlib.pyplot as plt
import numpy as np
import csv

def median(nums: list):
    s = sorted(nums)
    if len(s) % 2 == 0:
        return (s[len(s) // 2 - 1] + s[len(s) // 2]) / 2
    else:
        return s[len(s) // 2]

def plot(x, y, title, xlabel, ylabel, filename):
    coef = np.polyfit(x, y, 1)
    poly1d_fn = np.poly1d(coef)  # poly1d_fn is now a function which takes in x and returns an estimate for y
    x2 = [-100, 0, *x] # Extrapolate so that line crosses 0.

    m, b = coef
    print(f'Best Fit {m=}, {b=}')

    _, ax = plt.subplots()

    plt.plot(x, y, 'bo')
    plt.plot(x2, poly1d_fn(x2), '--k')
    plt.xlabel(xlabel)
    plt.ylabel(ylabel)
    plt.title(title)

    textstr = '\n'.join([
        f'm = {float(f"{m:.3g}"):g} ms/word',
        f'b = {float(f"{b:.3g}"):g} ms',
    ])
    props = dict(boxstyle='round', facecolor='wheat', alpha=0.5)

    plt.text(0.05, 0.95, textstr, transform=ax.transAxes, fontsize=10,
            verticalalignment='top', bbox=props)

    plt.savefig(filename)
    plt.show()

if __name__ == '__main__':
    with open('timebased.csv') as f:
        data = [*csv.DictReader(f)]

    x = [int(row['\ufeffwords']) for row in data]
    # ymean = [float(row['Average wo Outliers']) for row in data]
    ymedian = [median([float(row[str(i+1)]) for i in range(10)]) for row in data]
    print(ymedian)

    plot(x, ymedian,
        title='LLM Black Box Analysis of\nHTTP Response Time vs. Number of Words in Response',
        xlabel='Number of Words to be Reflected in LLM Response',
        ylabel='Median HTTP Response Time (ms)',
        filename='llm.jpg')