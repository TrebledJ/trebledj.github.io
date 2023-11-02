---
title: HKCERT CTF 2022 – Base64 Encryption
excerpt: Frequency analysis with a touch of heuristics.
tags:
  - cryptography
  - python
thumbnail_src: ~/assets/img/posts/thumbnail/hkcert22-thumbnail.jpg
usemathjax: true
---

The challenge looks deceptively simple. Chinese has over 50,000 characters. Base64 just has 64. So it should be easy right?

Haha nope. It's not as trivial as I thought.

## Description

200 points. 3/5 ⭐️. 6/311 solves.

> People said that base64 is an encoding, not an encryption. Did they have a misconception about that?
> 
> If you believe that base64 is just an encoding, then convince me that you are able to "decode" the article (which is in English).

Regardless, the challenge author is kind enough to provide a clue in the description: the plaintext is an **article** in **English**. We’ll see how this helps us later on.

## Analysis

We’re provided with an encryption script `chall.py` (written in Python), along with the generated ciphertext `message.enc.txt`.

- The script first encodes the plaintext in English:
    
    ```python
    encoded = base64.b64encode(message).decode().rstrip('=')
    ```
    
    ...then "encrypts" it by mapping each Base64 character to another one:
    
    ```python
    encrypted = ''.join([charmap[c] for c in encoded])
    ```
    
- The script uses `random.shuffle` without seeding. This means we can’t easily reproduce the character mapping (`charmap`). We’ll need to try harder.
- Although the script reads the plaintext in binary format (`open('message.txt', 'rb')`), I’m banking on the clue that the plaintext is an English article—so hopefully there aren’t any weird characters.

So how do we go about cracking this? Brute-force will be undoubtedly inefficient as we have $64! \approx 1.27 \times 10^{89}$ mapping combinations to try. It would take *years* before we have any progress! Also we’d need to look at results to determine if the English looks right (or automate it by checking a word list)—this would take even more time! Regardless, we need to find some other way.

## Let’s Get Cracking

Here’s one idea: since the plaintext is an English article, this means that most (if not all) characters are in the printable ASCII range (32-127). This means that the most significant bit (MSB) of each byte *cannot* be 1. We can use this to create a **blacklist** of mappings. For example, originally we have 64 mappings for the letter `A`. After blacklisting, we may be left with, say, 16 mappings. This drastically reduces the search space.[^extended-ascii]

Since Base64 simply maps 8-bits to 6-bits, so 3 characters of ASCII would be translated to 4 characters of Base64.

{% image "assets/base64-is-so-cool.png", "Base64 maps three characters to four.", "w-65" %}

<sup>Base64 maps three characters to four. ([Source](https://www.tenminutetutor.com/img/data-formats/binary-encoding/base64.png))</sup>
{.caption}


```python
charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

def get_chars_with_mask(m):
    """Get Base64 chars which are masked with m."""
    return {c for i, c in enumerate(charset) if (i & m) == m}

msbs = [0b100000, 0b001000, 0b000010, 0b000000]
subchars = [get_chars_with_mask(m) for m in msbs]

blacklist = {c: set() for c in charset}

for i, c in enumerate(txt):
    # Ignore char mappings which have 1 in corresponding msb.
    # These can't map to a printable ASCII char.
    blacklist[c] |= subchars[i % 4]

whitelist = {k: set(charset) - v for k, v in blacklist.items()}
```

We can check the mappings we’ve eliminated:

```python
print(''.join(sorted(blacklist['J']))
# '+/0123456789CDGHKLOPSTWXabefghijklmnopqrstuvwxyz'
```

And that means the letter `J` can only map to:

```python
print(''.join(sorted(whitelist['J']))
# 'ABEFIJMNQRUVYZcd'
```

Neat! This will help us later on (when we resort to ~~blatant~~ educated guessing).

We can do a similar thing on the low end. Again, since the smallest printable ASCII character is 32, this means either the second or third MSBs would be set.[^newline]

```python
def get_inverted_chars_with_mask(m):
    return {c for i, c in enumerate(charset) if ((2**6 - 1 - i) & m) == m}

subchars_not_in_ascii = [get_inverted_chars_with_mask(m) for m in in_ascii] # chars that don't have bits set in ascii.
```

Another idea comes to mind. Remember the plaintext is in English? Well, with English text, some letters appear more frequently than others. The same applies to words and sequences. 

{% image "assets/base64-letter-frequencies.jpg", "Frequency of English letters. But we need to be careful with letter cases.", "w-65" %}

<sup>Frequency of the English alphabet. (Source: Wikipedia.)</sup>
{.caption}

In the same vein, some letters and sequences in the *Base64 encoding* will also appear more frequently than others.

With this in mind, we can compare the ciphertext to the Base64 encoding of some random article (also in English, of course). For this, I copied some articles from [CNN Lite](https://lite.cnn.com/en) (text-only, so it's easier to copy), encoded it, then analysed letter frequencies using [dcode.fr](https://www.dcode.fr/frequency-analysis). You could use this excellent article as well:

```text
V2UncmUgbm8gc3RyYW5nZXJzIHRvIGxvdmUKWW91IGtub3cgdGhlIHJ1bGVzIGFuZCBzbyBkbyBJIChkbyBJKQpBIGZ1bGwgY29tbWl0bWVudCdzIHdoYXQgSSdtIHRoaW5raW5nIG9mCllvdSB3b3VsZG4ndCBnZXQgdGhpcyBmcm9tIGFueSBvdGhlciBndXkKSSBqdXN0IHdhbm5hIHRlbGwgeW91IGhvdyBJJ20gZmVlbGluZwpHb3R0YSBtYWtlIHlvdSB1bmRlcnN0YW5kCk5ldmVyIGdvbm5hIGdpdmUgeW91IHVwCk5ldmVyIGdvbm5hIGxldCB5b3UgZG93bgpOZXZlciBnb25uYSBydW4gYXJvdW5kIGFuZCBkZXNlcnQgeW91Ck5ldmVyIGdvbm5hIG1ha2UgeW91IGNyeQpOZXZlciBnb25uYSBzYXkgZ29vZGJ5ZQpOZXZlciBnb25uYSB0ZWxsIGEgbGllIGFuZCBodXJ0IHlvdQo=
```

{% images "w-90" %}
{% image "assets/b64-plain-1gram.jpg", "dcode.fr frequency analysis for normal Base64." %}
{% image "assets/b64-crypt-1gram.jpg", "dcode.fr frequency analysis for encrypted Base64." %}
{% endimages %}

<sup>Frequency analysis of plain vs. encrypted Base64.</sup>
{.caption}

From this, we can deduce that 'w' was mapped from 'G' in the original encoding (due to the gap in frequency).

One useful option is the **bigrams/n-grams** option. We can tell dcode to analyse frequencies of *groups of characters* with a sliding window. This is useful to identify words and sequences.

{% images "w-90" %}
{% image "assets/b64-plain-4gram.jpg", "dcode.fr 4-gram for normal Base64." %}
{% image "assets/b64-crypt-4gram.jpg", "dcode.fr 4-gram for encrypted Base64." %}
{% endimages %}

<sup>Frequency analysis of 4-grams in plain vs. encrypted Base64.</sup>
{.caption}

Observe how "YoJP0H" occurs (relatively) frequently. This corresponds to "IHRoZS", which happens to be the Base64 encoding for " the".

Frequency analysis is useful to group letters into buckets. But using frequency analysis alone is painful. Some guesswork is needed. Here's the complete process I went through:

- Frequency Analysis: use dcode.fr to associate frequent characters.
    - We can make use of our earlier constraints to eliminate wrong guesses.[^byebye-constraints]
        
        ```python
        guesses = { # Dictionary of guessed mappings.
            'w': 'G',       'Y': 'I',
            'o': 'H',       'c': 'B',

            # " the "
            'J': 'R',       'P': 'o',
            '0': 'Z',       'H': 'S',

            # More snipped out.
            ...
        }
        for c, g in guesses.items():
            # Our guess should be whitelisted!
            assert set(g).issubset(whitelist[c]) for gc in g), f'mismatch for {c} -> {g}, whitelist: {whitelist[c]}'
            whitelist[c] = g # Throw away all other values.
        ```

        {% image "assets/base64-progress-1.jpg", "Results!" %}

        <sup>Random decoding after frequency analysis.</sup>
        {.caption}

        {.no-center}

- Guesswork: guess English from the ~~nonsense~~ existing characters.
    - e.g. "Eog:ish" → "English", "qepqesents" → "represents", "pqese&ved" → "preserved"
    - Once we patched a word, other words became easier to patch.

        {% image "assets/base64-progress-2.jpg", "Moar results!!!" %}

        <sup>Random decoding after guessing.</sup>
        {.caption}

        {.no-center}

    - At this point, we can continue patching "ciphertext", "letters", "potential", etc. Or we could just use...
  
- Google: after decoding a sizeable portion, let's pray and hope the plaintext is open-source. Then use the plaintext to derive the rest of the mapping.
    - It turns out the plaintext is—quite aptly—the [Wikipedia summary of frequency analysis](https://en.wikipedia.org/wiki/Frequency_analysis).
    
        {% image "assets/base64-wikipedia-frequency-analysis.jpg", "Rrrreeeeeeeeeeeee.", "w-85" %}
    
Finding the rest of the mappings was quite easy. After a bit more tuning, we get the flag.

## Final Remarks

Usually I play reverse and don’t touch cryptography, but all I can say is: this was basically playing an English reverse challenge under the hood. Forget C, C++, Java, .Net, and Rust. Reversing English is the best. 😛

There are probably better ways to automatically perform frequency analysis and search for mappings. I went for a hybrid method of Python scripting + manually checking two dcode tabs. Perhaps a second monitor would’ve helped, but I have nowhere to place it. 😐

## Flag

```text
hkcert22{b4s3_s1x7y_f0ur_1s_4n_3nc0d1n9_n07_4n_encryp710n}
```

[^extended-ascii]: What about é and à, as in déjà vu? Well, although those *are* technically in the extended ASCII character set, they should be rare enough. (Also I think Python encodes them differently from regular ASCII.)

[^newline]: But what about newline (`\n`, ASCII 10) and carriage return (`\r`, ASCII 13)? These are also possible to have in plaintext messages. We shouldn’t entirely discount these, but as they’re relatively rare, we won’t consider them for now.

[^byebye-constraints]: Later on, we removed the second/third-MSB constraint since it got in the way of decoding `\n`.
