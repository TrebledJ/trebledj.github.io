---
title: "5 Weekend Reads You Missed: BOOMlang v2, Blue Team Strikes Back, ET, CVSS 4.1, and DLLModules"
excerpt: Breaking news, awesome stuff happened!
tags:
  - satire
  - infosec
  - programming
  - pentesting
  - programming-languages
  - windows
thumbnail_src: assets/weekend-tech-reads-thumbnail.jpg
# thumbnail_banner: true
related:
  auto: true
  minCommonTags: 1
---


## BOOMlang v2.0 Released: The First Shockwave-Optimized Language

Inspired by Doom’s simplistic genius, the power of the BEAM model, and butterflies^[https://xkcd.com/378/], BOOMlang is the world’s first **shockwave-native programming language**, perfect for building concurrent AI-driven applications.

AI proponents hail BOOMlang as **“the next Java”**, destined to take the world by storm as a general-purpose language for high-computational workloads and be deployed in over 3 million electronic toothbrushes.

“*BOOMlang has enabled us to embrace fearless concurrency in the face of AI and dwindling intelligence of tech hires*”, said Sanjit Randhawa, CTO of tech startup mumb.ai. “*Thanks to the power of the BOOM, we are continuously outpacing our competitors and breaking new ground.*”

Under the hood, BOOMlang’s efficient runtime induces microshockwaves which magnetise molecules in the upper atmosphere and beam cosmic rays into GPUs, flipping bits and accelerating graphics computation at an overclock rate of 300%. Emacs developers are struggling to translate this feature into a command.

Said microshockwaves are triggered by utilising cross-platform instructions such as `VFMAMSGB` (Vectorised Fused Multiply-Add and Make Stuff Go Boom) — something {% abbr "ISA", "Instruction Set Architecture" %} authors didn’t even know existed!

```asm
; Overclock your CPU by ignoring physics  
VFMAMSGB %xmm0, %xmm1, %xmm2  ; WARNING: May summon x86 demons  
```

BOOMlang version 2.0 incorporates the much anticipated Garbage Producer (GP) programming concept. First presented at HaskellCon 2021, GPs have gained traction and are expected to be integrated into Rust Nightly builds and C++38 (`std::gp_factory`).

```elixir
# Generate premium garbage (now ISO-9001 certified)  
gp = BOOM.GP.start!(quality: :premium, toxicity: :high)  
BOOM.GP.emit!(gp, :blockchain)  # Immutable, decentralized trash  
```

“*Forget GC*”, exclaimed Nilus Vortalds, speaker at BoomCon25, “*BOOMlang manufactures garbage at industrial scale.*”

Senior citizens rejoice as the tech industry redefines the term “boomer”.


## Blue Team Strikes Back, APT 404 Demands Justice

{% abbr "APT", "Advanced Persistent Threat (something big, bad, and scary!)" %} 404 recently released a security incident report detailing a reverse hack.

“We were simply going about our honest jobs, when suddenly— boom! — we became victims of a cyberattack”, said Li Jia Tan, Chief Relations Officer of APT 404 (Netherite Typhoon).

The report provided a list of {% abbr "IOCs", "Indicators of Compromise" %}, including novel techniques employed by Blue Teams. At the helm is the **Fast Inverse Beacon (FIB)**, a hand-crafted piece of C grounded in bit manipulation which inverts a C2 connection to achieve a reverse tunnel and obtain remote code execution on the source’s machine.

```c
beacon_t* fast_rbeacon( beacon_t* bhandler )
{
  sbqt_long i;  // subquantum long???
  float x2, y;
  const float getpwned = 0xd00d00;

  x2 = number * 0.5F;
  y  = number;
  i  = * ( long * ) &y;            // evil subquantum bit level hacking
  i  = 0x5f3759df - ( bhandler->socket->flags >> 1 ); // what the f***?
  y  = * ( float * ) &i;
  bhandler->push(y = bhandler->netaddr * (getpwned - y*y));  // 1st - MITM
  // bhandler->push(y = bhandler->netaddr * (getpwned - y*y));  // 2nd - proxy, this can be removed
  bhandler->netaddr = y;

  return bhandler;
}
```

<sup>Rare snippet of the Fast Inverse Beacon, a well-known FBI {% abbr "TTP", "Tactics, Techniques, and Procedures" %}, disclosed in APT 404's incident report.</sup>
{.caption}

Li disclosed their flagship hacking technique, **BFI (Buffer Interflow)**, was unable to prevent the reverse hack. Buffer Interflow exploits quantum mechanics inherent in every system by allocating memory and executing shellcode in quantum space, tunnelling through defences such as {% abbr "NX", "No eXecute" %}, {% abbr "PIE", "Position-Independent Executable" %}, and {% abbr "ASLR", "Address Space Layout Randomisation" %}. “It’s like if ret2shellcode married race conditions; raw power and randomness mixed into a beautiful, primordial, quantum soup. But sadly it was unable to stop FIB.”

The **Federal Beacon Investigators (FBI)** claimed responsibility for the attack saying, “As bulwarks of national security, we have been constantly monitoring Dark Web forums and IPv8 addresses. Luckily, we caught wind of attacks planned on the IBF and decided a pre-emptive strike was necessary. Our research into subquantum {% abbr "MITM", "Man-in-the-Middle" %} interception helped.”

The **International Bank of Fraternisation (IBF)** published a post thanking the FBI for its serious commitment to protecting public good and the capitalist interests of the 1%.

In other words, the FBI used FIB to protect IBF from BFI.


## Extraterrestrial Technology (ET) Disrupts IT & OT — Aliens Demand Equity

In a stunning turn of events, Silicon Valley executives have announced the rise of **Extraterrestrial Technology (ET)**, a revolutionary new field poised to render **Information Technology (IT)** and **Operational Technology (OT)** obsolete. The breakthrough came after a group of highly advanced aliens landed in Elon Musk's backyard and demanded equity in exchange for their superior tech.

Unlike IT (which deals with data) and OT (which controls industrial systems), ET operates on principles human scientists describe as "pure wizardry". Key features include:

- **Telepathic Cloud Computing: No servers, just brainwaves.** By amplifying the collective power of organic brainwaves, the "ET Cloud" replaces the traditional cloud in a true serverless, decentralised model of a human hivemind. Costs are drastically lowered at the risk of individual mental health.
- **Anti-Gravity DevOps (AGDO): Code deploys itself... upwards.** By bending spacetime, AGDO rapidly deploys code from the physical realm to the metaphysical realm of the telepathic cloud.
- **Self-Aware Firewalls: Hackers are instantly vaporised.** Firewalls gain sentience and offensive capabilities, striking fear into the hearts of script kiddies.

“*Honestly, we don't even understand half of it,*” admitted a Google engineer, who was last seen floating three feet above his desk. “*But the aliens said if we stop asking questions, they'll give us unlimited 8G Wi-Fi.*”

Despite the apparent risks, corporate giants and investors have jumped on the ET frenzy.

- On March 21st, Microsoft launched **Azure Orb**, a technology based on Telepathic Cloud Computing.
- On March 22nd Amazon launched **Prime Teleportation**, though delivery drones have unionised in protest.
- On March 31st, Apple unveiled **iAlien**, a device that "just works" because it reads your mind (and possibly soul).

“*I think,*” said Lt. Him Cook, CEO of Apple, “*I think we've just step foot into the age of Internet 4.0.*”

Regulatory bodies have swift taken action, with the EU recently slamming the aliens with **€420B** for GDPR violations after they probed a Belgium farmer without consent.

Experts predict that within one year, ET will replace all human jobs, though aliens assure us this is fine because they're "creating new opportunities in interstellar compliance".


## CVSS 4.1: New "Personalisation Metrics" for Shame-Based Blame Attribution

In a bold move to appease the endless grievances of security teams worldwide, the National Institute For International Threat Intelligence (NIFTI) has unveiled **CVSS 4.1**, featuring groundbreaking **Personalisation Metrics™** designed to assign blame with surgical precision.

For those who’ve spent the past decade blissfully ignoring vulnerability scoring, the **Common Vulnerability Scoring System (CVSS)** is a standardised framework for assessing vulnerability severity, with scores ranging from 0 to 10 across three metric groups:

1. **Base Metrics** – Intrinsic, unchanging severity (e.g., exploitability, impact).
2. **Environmental Metrics** – Organization-specific factors (e.g., system criticality, existing controls).
3. **Temporal Metrics** – Dynamic factors that evolve over time, including:
    - **Exploit Code Maturity** (e.g., weaponized exploits vs. theoretical risks)
    - **Remediation Level** (e.g., official patches vs. workarounds)
    - **Report Confidence** (e.g., verified vs. unconfirmed vulnerabilities)

Now, CVSS 4.1 introduces two revolutionary additions to ensure vulnerabilities are judged not just on technical merit—but on **who should feel the most shame**.

1. The first metric, **Ownership**, resolves the age-old debate: _Who should be held accountable?_

    | **Ownership Level** | **Definition**                                                | **Applicable To**                                                   | **CVSS Adjustment** |
    | ------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------- |
    | **No Ownership**    | The bug is in a dependency.                                   | Vendor code, "vibe coders," anyone who says, _"It’s not my fault!"_ | -2                  |
    | **Low Ownership**   | The bug was written by someone who’s now on vacation or quit. | Former employees, contractors, ghosts of developers past.           | ±0                  |
    | **High Ownership**  | The bug was written by **you**.                               | You. Yes, you.                                                      | +2                  |

    The following table illustrates real world examples of scoring Ownership:

    | Vulnerability           | Details                     | PoV              | Ownership                  | CVSS 4.1 Score |
    | ----------------------- | --------------------------- | ---------------- | -------------------------- | -------------- |
    | PHP Deserialisation RCE | RCE Gadget in the Framework | Framework Author | High (*blame the vendor!*) | 9.7            |
    | PHP Deserialisation RCE | RCE Gadget in the Framework | You              | None                       | 5.7            |
    | PHP Deserialisation RCE | RCE Gadget in Your Code     | Framework Author | None                       | 5.7            |
    | PHP Deserialisation RCE | RCE Gadget in Your Code     | You              | High (*you monster*)       | 9.7            |
    | XSS in WordPress Plugin | -                           | Plugin Author    | High (*enjoy the guilt*)   | 9.1            |
    | XSS in WordPress Plugin | -                           | You              | None (*not your circus*)   | 5.1            |
    | Authentication Bypass   | Vibe-Coded                  | AI Vendor        | High (*blame the AI*)      | 7.8            |
    | Authentication Bypass   | Vibe-Coded                  | You              | None                       | 3.8            |
    | Authentication Bypass   | Manually Coded              | AI Vendor        | None                       | 3.8            |
    | Authentication Bypass   | Manually Coded              | You              | High (*how could you?*)    | 7.8            |

    This metric has been **wildly popular** among:  
    1. Application developers. “*Finally, a scapegoat for my XSS issues*,” said a developer on Reddit.
    2. Y Combinator founders (who delegate blame like pros). “*It's absolutely **great** seeing blame being assigned to the right places*”, said Raul Graham, CEO of Y Combinator.

    Critics, however, argue this encourages corporate-level blame-dodging.

2. The second metric, **Identity**, tackles the bleeding edge of cybersecurity threats: _software that’s too self-aware_.

    | **Identity Status** | **Definition**                                                      | **Impact**                                                                | **CVSS Adjustment**          |
    | ------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------- | ---------------------------- |
    | **Identity Crisis** | The software has achieved sentience and is questioning its purpose. | Not a _direct_ vulnerability, but expect **random existential downtime**. | **+1 (Philosophical risk.)** |
    | **Identity Theft**  | The software has been impersonated by malware.                      | **High**—because fraud is traumatizing.                                   | **+3 (Emotional damage.)**   |

    Security experts were quick to mock the new metric. **Daniel Bernsteg**, author of the _Twurl_ library, quipped:

    > “*If my code starts asking about the meaning of life, I’m rebooting it into a t2.micro and billing it for uptime.*”

NIFTI has boldly started applying the metric to recent CVEs.

| CVE             | Description                                                                                                                                                                                                                            | CVSS Score             |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| CVE-2024-42060 | It was discovered GPT-6 before versions 6.1.2 has gained self-awareness after ingesting Hacker News threads. Prompts containing the words "love", "want", or "hate" induce the AI into an emotional spiral, refusing to generate code. | 6.2 (+Identity Crisis) |
| CVE-2025-1337   | It was discovered Meta's open source LLAMA4 model before versions 2.1 was poisoned by ‘Vibe Coders’. In the poisoned state, the model outputs limericks on every fifth prompt.                                                         | 8.1 (+Identity Theft)  |


OpenAI and Anthropic have taken to X (formerly Twitter) to vent: “*We released our AI to help humanity, only for ‘vibe coders’ to demand **we** ‘fix’ **their** spaghetti prompts. The audacity. Last week alone, we got 300 CVSS reports blaming us for their garbage outputs.*”

{% image "assets/schroot.jpg", "jw-40 p-2 floatr1", "User sch.root." %}

**sch.root**, a concerned internet citizen, praised the update: “*Identity theft is not a joke. Millions of families suffer each year. People deserve the right to protect their data, their families, and their tailor-made bobbleheads.*”

In a pre-recorded address, NIFTI declared:

> “*As an organization dedicated to securing the international [American] public, we welcome feedback from all 300 million people on this [side of the] planet.*”


## DLLs Are So 2024: Tech Visionary Lee Sik Koo Declares War on ‘Legacy Code’ with Revolutionary DLLMs

Last Saturday, Hong Kong-based tech maverick Lee Sik Koo, founder of _Securely International Limited Unlimited_, unveiled **DLL Modules (DLLMs)**—a "game-changing, novel solution to combat privacy malpractice on Windows." Characterised by the cutting-edge `.dllm` file extension, these modules have already garnered praise for their "unprecedented performance improvements" across a "plethora of systems"—though independent benchmarks remain suspiciously absent.

> *I’d like to thank my mother and father — but more than that, I’d like to thank everyone’s mother and father — for this opportunity to reshape the hellhole known to some as Windows 11. Together, we will secure our families. We will secure schools. We will secure businesses. By migrating to .dllm, we embrace a new era of modular openness and integrity with zero tolerance to AI bullshit trained on your personal files and computer activity. DLLs are for the weak, but DLLMs are for the strong.*  
> – **Lee Sik Koo, March 29, 2025**

Enthusiastic beta testers have flooded online forums with claims that DLLMs "triple boot speeds" and "eliminate all memory leaks forever." One anonymous developer raved, “*After converting just three DLLs to DLLMs, my PC stopped bluescreening and actually started paying my taxes for me!*”

However, sceptics point out that these testimonials suspiciously resemble AI-generated marketing copy—a fact Lee dismisses as "legacy thinker propaganda."

Under the hood, DLLModularizer installs a kernel driver `dll2dllm.sys` responsible for transforming .dll's into .dllm's. The driver hooks into the `LoadLibrary` API and relevant syscalls. When a program is executed, loaded DLLs are *side-fumbled* (a proprietary term Lee refuses to define) into the driver before being loaded into memory. The driver's magic occurs in the `process_antibullshitinator` function, which strips away known "bullshit" including dead code, duplicate code, spaghetti code, and *anything else deemed unnecessary*.

Users can take advantage of the early-bird offer and install the DLLModularizer Windows program with a free trial of up to 30 days. The program is available for both x86 and x64.

/s