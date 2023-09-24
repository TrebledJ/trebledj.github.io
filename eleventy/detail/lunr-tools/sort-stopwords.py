with open('../stopwords.txt') as f:
    xs = f.readlines()

print(len(xs))
comments = filter(lambda l: l.startswith('#'), xs)
rest = filter(lambda l: not l.startswith('#') and l.strip(), xs)

with open('../stopwords.txt', 'w') as f:
    f.write(''.join([*comments, *sorted(set(rest))]))