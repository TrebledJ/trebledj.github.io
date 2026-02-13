---
title: "Advisory: Multiple Vulnerabilities in C++ Serialization Libraries"
excerpt: CVE-2025-, CVE-2025-, CVE-2025-, CVE-2025-, CVE-2025-
# thumbnail_src: assets/deserialization_meme_69.png
# thumbnail_banner: false
---

## Overview

Insecure deserialization of pointers under certain conditions may lead to type confusion, resulting in potential information disclosure, control flow hijacking, and arbitrary code execution.

## Affected Software

The following libraries are affected, with the assigned CVEs.

{% table %}

| CVE            | Library             | Affected Versions | Status                                                                                                                                                                                                                                                 |
| -------------- | ------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
|                | Boost Serialization | 1.89.0 and below  | No patch available. Maintainer acknowledged but postponed indefinitely citing time concerns.                                                                                                                                                           |
|                | Cereal              | 1.3.2 and below   | No patch available. Unable to reach maintainer.                                                                                                                                                                                                        |
| CVE-&#8288;2025-&#8288;60887 | Cista               | 0.15 and below    | No patch available. Maintainer cites low impact and priorities. "Reading untrusted data is not [the maintainer’s] use case", despite the library [claiming to be safe against untrusted input](https://github.com/felixguendling/cista/wiki/Security). |
|                | Bitsery             | 5.2.4 and below   | Fixed in 5.2.5.                                                                                                                                                                                                                                        |
| CVE-&#8288;2025-&#8288;60889 | HPX                 | 1.11.0 and below  | Fixed in 1.12.0.(TODO)                                                                                                                                                                                                                                 |

{% endtable %}

## Exploit Conditions

Successful exploitation depends on various factors, but the main concerns are the *types deserialized* and their *order*. Any mention of "*under certain conditions*" refers to this section on exploit conditions. Code reviewers and testers should pay attention to the following:

- For Boost Serialization, Cereal, Bitsery, and HPX, deserializations<sup>†</sup> of a type `shared_ptr<A>` followed by a type `shared_ptr<B>` are at risk. This applies to both `std::shared_ptr` and `boost::shared_ptr`.
- Additionally, for Boost Serialization, deserializations<sup>†</sup> using the XML Archive of any type `A` followed by a pointer type<sup>††</sup> `P` are at risk. Deserializations using Text/Binary Archives of a pointer type<sup>††</sup> `P` followed by a pointer type<sup>††</sup> `Q` are at risk.
- Additionally, for Bitsery, deserializations<sup>†</sup> of raw pointers (`PointerObserver`) are at risk.
- For Cista, deserializations<sup>†</sup> using offset-based types from the `cista::raw` namespace are at risk. Offset-based types are types which contain an internal offset pointer and include but are not limited to `string`, `vector`, and `ptr`.

<sup>†</sup>: Deserializations *occurring within the same archive*.  
<sup>††</sup>: Pointer types include raw pointers, `std::unique_ptr`, `std::shared_ptr`, along with their Boost variants.  

## PoC

Examples are presented in the [companion writeup](/posts/insecure-deserialization-and-confusion-attacks-in-cpp/) and shared on [GitHub](https://github.com/TrebledJ/vulnerability-research). {# TODO: deeper link #}

For a demonstration of a full exploit chain from address leak to RCE, check out the [breakfast CTF](/posts/arbitrary-code-execution-for-breakfast/) challenge.

## Impact

{% alert "warning" %}
**Read First: A Note on Severity/Scoring**

Please understand that while the severity may appear to be critical, CVSS (CVSS-B, the base score, to be precise) is limited because it doesn't take into account threat and environmental factors, and is scored on a worst-case basis. Not to mention, the exploitability of these particular vulnerabilities depend on the classes used in conjunction with the libraries. Just because the library is used doesn't necessarily mean you are affected. I recommend understanding the exploit conditions before making a judgement.

You may also consider [re-scoring](https://www.first.org/cvss/calculator/4-0) the vulnerabilities using CVSS-BTE (CVSS base score plus Threat/Environmental considerations) or using your best judgement to manage risk. For instance, perhaps you are using one of these libraries for (de)serializing state to a file but not over the network; in that case, your Modified Attack Vector (MAV) would be Local. Or it may be the case that you are only serializing but not deserializing data, in which case there is no risk.
{% endalert %}

The table below shows the *potential* impact a library faces.

{% table %}

| Library             | CVSS&nbsp;v4           | Information Disclosure (Address Leak) | Information Disclosure (Memory Read) | Arbitrary Code Execution|
|---------------------|------------------------|---------------------------------------|--------------------------------------|-------------------------|
| Boost Serialization | [9.3/10][sc1] Critical | √                                     | √                                    | √                       |
| Cereal              | [9.3/10][sc1] Critical | √                                     | √                                    | √                       |
| Bitsery             | [9.3/10][sc1] Critical | √                                     | √                                    | √                       |
| HPX                 | [9.3/10][sc1] Critical | √                                     | √                                    | √                       |
| Cista               | [6.9/10][sc2] Medium   | √                                     |                                      |                         |

{% endtable %}

[sc1]: https://www.first.org/cvss/calculator/4-0#CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N
[sc2]: https://www.first.org/cvss/calculator/4-0#CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N

√ = Potential Impact

- **Information Disclosure (Address Leak)**: Under certain conditions, it is possible to disclose memory addresses which may be used by malicious actors to bypass protections such as ASLR and PIE. If the library is part of the kernel, it may lead to a KASLR bypass. Minor loss of confidentiality.
- **Information Disclosure (Memory Read)**: Under certain conditions, it is possible to read arbitrary memory. Huge loss of confidentiality, under the majority of contexts.
- **Arbitrary Code Execution**: Under certain conditions, it is possible to execute arbitrary code. On a macro scale, this may lead to {% abbr "LPE", "Local Privilege Escalation" %} or {% abbr "RCE", "Remote Code Execution" %} depending on the nature of the downstream application. For instance, if the archive is passed and deserialized via {% abbr "IPC", "Inter-Process Communication" %} or a file, the system is potentially vulnerable to {% abbr "LPE", "Local Privilege Escalation" %}. If the archive is deserialized over the network such as {% abbr "RPC", "Remote Procedure Call" %} or an HTTP API, the system is potentially vulnerable to {% abbr "RCE", "Remote Code Execution" %}. Huge loss of confidentiality, availability, and integrity.

## Mitigations and Workarounds

TODO

- Some libraries currently have no fix available despite (attempts at) communication with authors.
- **Workaround**: Use alternative, non-referential data types which have simpler deserialization routines. This may impact performance due to extra conversions. For instance, instead of serialising a `vector<A*>`, use a flat `vector<A>` of unique objects and a `vector<size_t>` containing indexes to the first vector.
- **Detective Controls**: Monitor untrusted channels. If the serialization payload comes from a file, this may mean logging and auditing file writes for potential unauthorized uploads or unexpected path traversal attacks. If the payload comes from a network, this may mean whitelisting/auditing connection sources and strengthening authentication (e.g. IP whitelisting).
- Library-specific advice:
    - For Boost Serialization, avoid deserializing multiple pointers within the same archive.
    - For Cista, consider using types from the `cista::offset` namespace instead of `cista::raw`.

{# - If your library remains unpatched (see [Affected Software](#affected-software)), consider submitting your own patch or expressing your concern on the project’s GitHub Issues. #}
{# - For library maintainers, consider reading [Root Cause Analysis](#root-cause-analysis) for thoughts on understanding and patching the general type confusion vulnerability. #}

{# ### Credits #}

{# Kudos to [Mindaugus](https://github.com/fraillt), author of [Bitsery](https://github.com/fraillt/bitsery) for the solid coordination and patching of the issue.  #}

## Timeline

{% table %}

| Library             | Discovered | Reported to Vendor | Reply from MITRE | Advisory   |
| ------------------- | ---------- | ------------------ | ---------------- | ---------- |
| Boost Serialization | 2025.08.02 | 2025.08.08         |                  | 2025.12.xx |
| Cereal              | 2025.08.06 | 2025.08.08         |                  | 2025.12.xx |
| Cista               | 2025.08.26 | 2025.08.27         | 2025.10.17       | 2025.12.xx |
| Bitsery             | 2025.08.30 | 2025.08.30         |                  | 2025.12.xx |
| HPX                 | 2025.09.03 | 2025.09.03         | 2025.10.17       | 2025.12.xx |

{% endtable %}

