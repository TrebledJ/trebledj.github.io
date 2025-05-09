import string
import random
import matplotlib.pyplot as plt
import numpy as np
import time
import re

counts = [10, 50, 100, 250, 500, 1000, 2500]
texts = []
avg_word_size = 20 # Assume a generous avg word size of 20 chars.

templ = '\n'.join([
    'Name: John Doe',
    'Wrong Field: {{text}}',
    'Wrong Field 2: {{text}}',
    'Description: {{text}}',
    'Wrong Field 3: Blah',
])

def random_word():
    return ''.join(random.sample(string.ascii_letters, avg_word_size))


for c in counts:
    text = ' '.join(random_word() for _ in range(c))
    texts.append(templ.replace('{{text}}', text))


def do_extract_test(text, f):
    start = time.time()
    f(text)
    end = time.time()
    return (end - start) * 1000

def extract(text):
    desc = re.findall(r'(?<=Description: )[^\n]+', text)

if __name__ == '__main__':
    import draw
    
    times = []
    for text in texts:
        ts = []
        for _ in range(10):
            t = do_extract_test(text, extract)
            ts.append(t)
        times.append(draw.median(ts))
    
    draw.plot(counts, times,
              title='Running Time vs. Number of Words to Extract\n(Regex Implementation)',
              xlabel='Number of Words',
              ylabel='Running Time (ms)',
              filename='regex.jpg')