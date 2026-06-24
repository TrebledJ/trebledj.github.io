import{$ as e,B as t,C as n,D as r,S as i,b as a,bt as o,v as s,vt as c,y as l}from"./modules/shiki-CrcqEQc-.js";import{it as u,rt as d}from"./index-u4i---mI.js";import{t as f}from"./slidev/VClick-BY5o2tvT.js";import{t as p}from"./slidev/image-right-BblnhGF8.js";var m={__name:`slides.md__slidev_12`,setup(m){let{$slidev:h,$nav:g,$clicksContext:_,$clicks:v,$page:y,$renderContext:b,$frontmatter:x}=u();return _.setup(),(u,m)=>{let h=f;return t(),l(p,o(r(c(d)(c(x),11))),{default:e(()=>[m[2]||=s(`h1`,null,`What is Type Confusion?`,-1),m[3]||=s(`ul`,null,[s(`li`,null,`High Level: Code interprets data as a type not intended`),s(`li`,null,`Low Level: Pointers mixing with data.`)],-1),n(h,null,{default:e(()=>[...m[0]||=[s(`ul`,null,[s(`li`,null,`Predominantly seen in browser exploits`),s(`li`,null,[i(`Primitives: `),s(`ol`,null,[s(`li`,null,`Address Leak`),s(`li`,null,`Memory Read`),s(`li`,null,`Memory Write`),s(`li`,null,`fakevtable`)])])],-1)]]),_:1}),n(h,null,{default:e(()=>[...m[1]||=[s(`ul`,null,[s(`li`,null,[i(`Addr Leak `),s(`span`,{class:`katex`},[s(`span`,{class:`katex-mathml`},[s(`math`,{xmlns:`http://www.w3.org/1998/Math/MathML`},[s(`semantics`,null,[s(`mrow`,null,[s(`mo`,null,`→`)]),s(`annotation`,{encoding:`application/x-tex`},`\\rightarrow`)])])]),s(`span`,{class:`katex-html`,"aria-hidden":`true`},[s(`span`,{class:`base`},[s(`span`,{class:`strut`,style:{height:`0.3669em`}}),s(`span`,{class:`mrel`},`→`)])])]),i(` Mem Read `),s(`span`,{class:`katex`},[s(`span`,{class:`katex-mathml`},[s(`math`,{xmlns:`http://www.w3.org/1998/Math/MathML`},[s(`semantics`,null,[s(`mrow`,null,[s(`mo`,null,`→`)]),s(`annotation`,{encoding:`application/x-tex`},`\\rightarrow`)])])]),s(`span`,{class:`katex-html`,"aria-hidden":`true`},[s(`span`,{class:`base`},[s(`span`,{class:`strut`,style:{height:`0.3669em`}}),s(`span`,{class:`mrel`},`→`)])])]),i(` stronger primitive`)])],-1)]]),_:1}),a(` 
---
layout: default
part: Type Confusion
---

# Note on Nomenclature

<RibbonBanner text="Side Quest" color="yellow" />

| Primitive  | What it does                                                               | To achieve                       |
|------------|----------------------------------------------------------------------------|--------------------------------|
| addorf     | Get the *address of* a JS object                                           | Address Leak (ASLR Bypass)     |
| fakeobj    | Create a fake JS object pointing to attacker-controlled memory                  | Memory R/W                     |
| fakevtable | Create a fake object with an attacker-controlled <br> v-pointer to a fake Virtual Table (VTable)| Arbitrary Code Execution (ACE) |

You will see "addrof" and "fakeobj" used more in browser exploitation literature.

Also:
- ACE = Arbitrary Code Execution
- R/W = Read/Write `)]),_:1},16)}}};export{m as default};