
with open('_site/css/main.css') as f:
    css = f.read()


import re

ms = re.findall(r'(?<=\.)([a-zA-Z-_][a-zA-Z0-9_-]+)(?![^\{]*\})', css)

from collections import *

Entry = namedtuple('Entry', ['short', 'count'])
shorts = {}
used = set()

def mangle(n):
    toks = re.split(r'[-_]+', n)
    short = ''.join(t[0] for t in toks)
    counter = 0
    out = short
    while out in used:
        counter += 1
        out = short + str(counter)
    return out

for cls in ms:
    if cls in shorts:
        shorts[cls] = shorts[cls]._replace(count=shorts[cls].count + 1)
    else:
        mangled = mangle(cls)
        used.add(mangled)
        shorts[cls] = Entry(short=mangled, count=1)
    
bytes_original = 0
bytes_mangled = 0

for s in shorts:
    bytes_original += len(s) * shorts[s].count
    bytes_mangled += len(shorts[s].short) * shorts[s].count

print('original:', bytes_original)
print('mangled:', bytes_mangled)
print('potential save:', bytes_original - bytes_mangled)
