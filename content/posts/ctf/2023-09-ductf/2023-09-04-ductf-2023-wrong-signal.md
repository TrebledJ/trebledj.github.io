---
title: DUCTF 2023 – Wrong Signal
description: You straight to `oops()`. Right away.
tags:
 - reverse
thumbnail: /assets/img/posts/thumbnail/hkcert22-thumbnail.jpg
usemathjax: true
---

## Description

Medium. 27/1424 solves.

> *I am getting all the wrong signals from this binary.*
> 
> *Author: hashkitten*


## Writeup

### Analysis

On decompilation, it seems like an innocent binary which adds and subtracts numbers. The actual program is relatively small and simple.

```c
// Set the SIGSEGV handler.
memset(&sigsegv_sigaction,0,0x98);
sigsegv_sigaction.__sigaction_handler.sa_handler = oops;
sigsegv_sigaction.sa_flags = 4;
sigaction(11,&sigsegv_sigaction,NULL);

// Read input.
puts("Enter the password:");
read(0,buffer,0x10);

// Check input for correctness.
local_c0 = &DAT_13386000;
for (i = 0; i < 0x40; i += 1) {
	j = i;
	if (i < 0) {
		j = i + 3;
	}
	switch((int)(char)(buffer[j >> 2] ^ mangle_buf[j >> 2]) >>
		   (((char)i - ((byte)j & 0xfc)) * 2 & 0x1f) & 3) {
	case 0:
		local_c0 = local_c0 + -0x15000;
		break;
	case 1:
		local_c0 = local_c0 + -0x1000;
		break;
	case 2:
		local_c0 = local_c0 + 0x1000;
		break;
	case 3:
		local_c0 = local_c0 + 0x15000;
	}
}

if (local_c0 == &DAT_13398000) {
	puts("Well done! Wrap that in DUCTF{}.");
}
else {
	oops(0);
}
```

Observations:
- A [`sigaction`](https://man7.org/linux/man-pages/man2/sigaction.2.html) handler takes care of any SIGSEGV faults, outputs `Wrong!` and exits. SIGSEGVs occur when there are invalid memory accesses (e.g. reads, writes).
- The for-loop iterates through *crumbs* (2-bit groups), xors it with static data (`mangle_buf`, and modifies `local_c0` depending on the value of each crumb. Yeah, that eyesore in the switch condition computes the current crumb. Ay c-rumba.
- Since 16-bytes are read, this means there are 64 crumbs, therefore 64 *operations*.
- Our goal is to modify `local_c0` so that it goes from `0x13386000` to `0x13398000`—a difference of `0x12000`.

The last point is interesting, since there's no way we can get a unique solution, right? There are multiple ways to reach an offset of `0x12000`.

For example, if our crumbs are 3, 1, 1, 1, then we've already arrived at our target address, right? Then we can just fill the rest with 2s and 1s to do nothing to `local_c0`, right? Right? 

wRoNg!

{% image "assets/wrong.png", "Very WrOnG!", "post1 w-50" %}

Using a Z3 script spun by reversing the program, we can output some test payloads. Using `I` as the first letter, we can trigger case 3 (`+0x15000`) as our first operation.^[Verifiable through GDB, with `b *main+245` and `p $rax`.] Turns out we can't do that as our first move, because it catapults us into `oops()`. ☹️

{% image "assets/straight-to-oops.jpg", "You straight to oops. Right away.", "post1" %}

<sup>We have the best flag. Because of `oops()`.</sup>
{.caption}

There must be something more.

### Where are the segfaults coming from?

While all these observations are fine and dandy, the decompilation misses something crucial. Isn't it weird how `local_c0` seems to be working with addresses and jumping around without actually doing *anything*? Turns out, there's a sneaky little dereference at `0x401305`.
```armasm
; 0x4012fe. Load `local_c0` from stack to RAX.
MOV        RAX,qword ptr [RBP + local_c0]

; 0x401305. Dereference `RAX` to `AL`.
MOV        AL,byte ptr [RAX]=>DAT_13386000
```

Don't underestimate these few lines. Even though the dereferenced value is unused, a read is performed nonetheless!

So why are some reads causing segfaults? To answer this, we can use the `vmmap` command that comes with GDB [GEF](https://github.com/hugsy/gef). This shows various segments of a binary, their address ranges, and whether they're readable/writable.^[There are other similar tools, but I'm accustomed to GEF's vmmap.]

{% image "assets/vmmap.png", "vmmap shows us a comprehensive list of regions in the ELF.", "post1" %}

Yikes! That's a lot of segments. Notice how some of them disallow all permissions? Our pointer was trying to read those regions. All that's left is to filter out the regions in our code.

## Concluding Remarks

Peeking at the [official solve script](https://github.com/DownUnderCTF/Challenges_2023_Public/blob/main/rev/wrong-signal/solve/solver.py)... it turns out the challenge was a... *maze*?!? Wut? Didn't expect that. But overall it was a fun little challenge, and a good reminder to not overlook (or completely ignore) the small details such as that hidden byte read.

## Solve Script

I didn't do a step-by-step walkthrough of my solve script this time, but I've littered it with comments, so hopefully it's understandable—even for those new to the Z3 library.

<script src="https://gist.github.com/TrebledJ/eff46dfd7f0cd5cc9ee4b2c2c3b174f6.js"></script>

## Flag

```
DUCTF{hElCYi8OxUF7PAA5}
```
