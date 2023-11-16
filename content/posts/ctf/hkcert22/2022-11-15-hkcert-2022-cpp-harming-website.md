---
title: HKCERT CTF 2022 – C++harming Website
excerpt: A harming website? Hope it doesn't harm my sleep!
tags:
  - reverse
  - cpp
thumbnail_src: assets/hkcert22-thumbnail.jpg
---

## Description

350 points. 4/5 ⭐️. 4/311 solves.

> Seems someone encrypt their flag with some weird online website. And seems the website is written in C++...
> 
> Does anyone even use C++ to write their web server? I guess C++ is still charm but it must be easy to reverse.... right?

## Analysis

We’re provided with the server binary written in C++. No source code. 😟 We’re also provided with a link to a website (presumably hosted by the server).

Hmm, I wonder what the website has in store for us. Let’s check it out!

{% image "assets/website-seems-to-work.jpg", "w-65", "Website seems to work!", "Output of a GET request to the server. It doesn't seem to handle GET requests." %}

How disappointing. Oh well, perhaps the binary is more helpful. Maybe we can find out how to work the website. Might be important. Might not be important. Who knows?[^might-be-important]

Firing up Ghidra and loading the binary, we start by going to `main` (okay so far!). `main` doesn't seem to do much, besides calling `init`, `run`, and `std::cout`. Things get a lot more interesting when we look at `run`:

{% image "assets/decompile-run.jpg", "w-85", "You can run, but you can't hide!" %}

It’s easy to be intimidated by such a large application. And it’s in C++, so there’s a ton of garbage (`std`, templates, constructors, destructors, etc.).[^cpp]

After a bit of digging, we uncover quite a bit of info:

- The server uses a library called **[oatpp](https://oatpp.io/)**.
    - It’s useful to look at some oatpp examples, as this gives us a general idea of the application flow and structure.
    - For example, an endpoint could be defined by using `oatpp::web::server::HttpRouter::route` ([example](https://oatpp.io/docs/start/step-by-step/#add-request-handler)) or with the `ENDPOINT` macro ([example](https://oatpp.io/docs/start/step-by-step/#use-api-controller)). It appears our charming website was using the latter.
    - Now that we know what library is used, can we find out what the endpoint is?
    - Yes. In the examples, we see that the endpoints are hardcoded. Chances are, the endpoints in the charming website are also hardcoded, and thus stored in static memory.
- Let’s look at some strings!
    - Ghidra has a “Defined Strings” tool for browsing strings...
    - But I ended up using the `strings` command along with `grep`:
        
        ```bash
        strings cryptor-exe | grep -Ev '^_Z.*' # Filter out most C++ symbols. (Manually leaf through the rest.)
        strings cryptor-exe | grep '/'         # Search for endpoint or MIME type.
        ```
        
    - With this, we find out that the endpoint is **`/encrypt`**, and the MIME type is **`application/json`**. No other MIME type appears, so it's probably using JSON for both request and response.
      - We can guess which JSON keys are parsed by looking at other strings. It appears the only key used is `message`.
      - We can try to use Postman or whatever to test the endpoint. Let's have a spin:

        {% image "assets/postman-pat-postman-pat-postman-pat-and-his-black-and-white-cat.jpg", "w-95", "Postman Pat", "Postman output of a POST request to the server." %}

    - There’s also some interesting strings such as “*charm.c*”. But I thought this was a C++ application? Perhaps a third-party library? Maybe we can use this later on.
- The gold can be found in **`MyController::Encrypt::encrypt`**. This is where all the juicy stuff takes place. You can arrive here through a number of ways (e.g. following XREFs of `uc_encrypt`).
    - The function begins by generating a random Initialisation Vector (IV).
    - It then initialises some state using `uc_state_init` with a key.
        
        {% image "assets/decompile-encrypt-1.jpg", "w-70", "Juicy init.", "Decompilation of the encrypt function. The code initialises random bytes and inits the state of the encryptor." %}

        Fortunately, the key is stored in static memory. In plain sight. This is very blursed: blessed, because (from a CTF POV) we don't need much work; and cursed, because (from a dev vs. exploiter POV) we don't need much work.

        {% image "assets/encryption-rev-chal-with-hardcoded-key.jpg", "w-50", "YAS!", "Third world success meme!" %}

    - The message is then encrypted using `uc_encrypt`.

        {% image "assets/decompile-encrypt-2.jpg", "w-70", "Juicy encrypt.", "Decompilation of the encryption function being called." %}

        I have no idea what `puVar[-0x227] = X` does, and apparently it's not important.

    - Finally, `encrypt` encodes the message, tag, and IV in Base64; then sends out a JSON response.

- Now how do we go about reversing this encryption?
  - It's probably not trivial—most encryptions aren't.
  - What cryptographic algorithms use a tag and IV? Google suggested AES-GCM.
  - Oh, but wait—there’s a `uc_decrypt` function...

## Pikachu used charm! It’s not very effective.

To make our life easier (and also because of curiosity), let’s see if the encryption library is open-source. OSINT time! Googling “*charm.c uc_encrypt site:github.com*” leads us to [dsvpn](https://github.com/jedisct1/dsvpn), which links us to [charm](https://github.com/jedisct1/charm). Both are GitHub repositories using the same charm.c as the challenge.

The source gives us obvious clues we might’ve missed in our initial analysis. For example, the key should be 32 bytes long. This was quite helpful, as Ghidra for some reason grouped the 32nd byte apart from the first 31 bytes (took me a while to figure out what went wrong).

Now that we have the source, we can use it directly for our solve script!

```c
int main() {
    uint32_t st[12] = {};

    // Obtained from binary (static_key symbol).
    unsigned char key[] = "\xf2\x9c\x0b\xf1\xc5\x1a\x7e\x65\x75\x80\x23\x6e\x8b\x74\x38\xbf\x59\x39\x8a\x1a\x05\xc6\x43\xfa\x1d\x57\x82\x0a\xb9\xc6\xdc\x50";
    
    // Obtained by decoding Base64.
    unsigned char iv[] = "\xe2\x4f\x76\x18\xd8\xa3\xa\xaf\xa8\xbf\xee\xe6\x5c\xe9\x4\x1e";
    unsigned char tag[] = "\xd0\x5b\x4c\x60\x6d\x88\x3f\x18\xff\xa8\x58\x43\xfc\xd2\xc6\xac";
    unsigned char c[] = "\xe4\xa\xf2\xb3\x96\x3c\x7a\x9a\x86\xe1\xa4\x9e\x45\xc5\xef\x7f\xe4\x8a\x96\x13\x4a\x95\x8\xc8\xdb\x6c\x7c\xa2\x34\x6f\xf4\x37\xae\xd0\x46\x1\xb2\xd0\xc\x32\xbb\x3e\xb6\xf9\xe6\x51\x5e\x6e\x14\xb\x97\x5b\x99\xd\xda\x3a\xf3\xe0\xd2\x66\xed\xe8\x7a\xbc\x6e\xc\xab\xec";
    
    uc_state_init(st, key, iv);
    
    size_t len = strlen((char*)c);
    int res = uc_decrypt(st, c, len, tag, 16);
    printf("result: %d\n", res);
    printf("%s\n", c);
}
```

Since the state is initialised inside the endpoint, it is refreshed for each encryption. As long as we have the key and IV, we can recover the state. Finally, we decrypt the message and get the flag. That's all there is to it!

## Final Remarks

This was a rather nice, relaxing C++ challenge. And yes, C++ is still charm.

{% alert "success" %}
With C++ reverse challenges (and looking at large applications in general), it’s difficult to know what’s important because there are so many things to look at. But! It’s really helpful to know what’s *not* important, because then you can filter those out and pay attention to things that matter.
{% endalert %}

For example, if you see templates (the ever so familiar, pointy friends of ours), you can usually ignore everything in between. Normally they're the default anyway.

Also, if there’s something to learn from this challenge, it’s that application developers should secure their secrets (e.g. with environment variables or config loaders). 😛

## Solve Scripts

<script src="https://gist.github.com/TrebledJ/ba53a8c720de910e0bdc55892171f76e.js?file=convert.py"></script>
<script src="https://gist.github.com/TrebledJ/ba53a8c720de910e0bdc55892171f76e.js?file=main.c"></script>

## Flag

```text
hkcert22{n3v3r_s4w_4n_c++_ap1_s3Rv3R?m3_n31th3r_bb4t_17_d0e5_eX15ts}
```

[^might-be-important]: It wasn’t.

[^cpp]: To be fair, one of the reasons C++ is powerful is because it’s both *performant* and *expressive*. And it’s expressive, because there can be a lot of hidden control flow. You can write one line of code which could be syntax sugar for twenty lines of code, and even more assembly. With C, it’s more straightforward (and simple).
