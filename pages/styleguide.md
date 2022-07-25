---
title: Styleguide
layout: page
permalink: /styleguide/
visibility: false
---


### Styleguide

<hr />

 <img src="/assets/img/styleguide.png" class="img-fluid">

<p> Lets try the different text styles  <b> Bold </b> , <strong> Strong </strong>, <em> Emphasis </em>, <i> Italic </i> </p>


<p> Now, lets try different heading styles : </p>

<h1> Hello in h1 ! </h1>
<h2> Hello in h2 ! </h2>
<h3> Hello in h3 ! </h3>
<h4> Hello in h4 ! </h4>
<h5> Hello in h5 ! </h5>
<h6> Hello in h6 ! </h6>

<hr />
<p> Unordered List </p>

<ul>
<li> List Item 1 </li>
<li> List Item 2 </li>
<li> List Item 3 </li>
<li> List Item 4 </li>
<li> List Item 5 </li>
</ul>

<p> Ordered List </p>
<ol>
<li> List Item 1 </li>
<li> List Item 2 </li>
<li> List Item 3 </li>
<li> List Item 4 </li>
<li> List Item 5 </li>
</ol>

<blockquote>
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse facilisis ante a libero hendrerit, at gravida mauris semper. Aenean ut sollicitudin erat. Sed lorem risus, aliquet in velit eget, cursus iaculis sem. Curabitur gravida massa sed purus sollicitudin aliquet. Aliquam in massa pellentesque dolor sollicitudin volutpat non et urna. Duis hendrerit dui non tincidunt rhoncus. Sed sodales nulla a turpis suscipit sodales. Phasellus commodo orci neque, eu lacinia mi sollicitudin vel. Donec non facilisis sapien. Suspendisse ac nulla at nisi ultrices scelerisque. Morbi ut lorem at ex convallis venenatis vel id purus. Morbi nec sem sit amet mauris convallis suscipit.</p>

<p>In scelerisque mi quis tempus blandit. Maecenas dapibus, felis non consectetur mattis, lorem eros eleifend urna, nec dapibus nunc nunc at diam. Morbi lobortis dui diam, a euismod erat imperdiet nec. Vestibulum in arcu tempor, tempus nunc at, pharetra ipsum. Quisque id dolor dapibus, aliquet mi a, aliquet erat. Etiam eu justo sed nibh accumsan imperdiet. Cras id sodales sapien. Cras ac turpis mi. Nulla pretium porta eros, faucibus efficitur orci. Etiam vitae blandit tellus, eu consequat tellus. Etiam nec urna eget lectus interdum fringilla sed id augue. Quisque vulputate sagittis luctus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Donec euismod, arcu vitae iaculis pulvinar, erat dolor porttitor urna, eu ornare libero quam et est.</p>
</blockquote>

<p>You can use the mark tag to <mark>highlight</mark> text. </p>

<p><del> This line of text is meant to be deleted text </del> </p>

<p><u>This line of text will render as underlined</u></p>
<p><small>This line of text is meant to be treated as fine print.</small></p>
<p><strong>This line rendered as bold text.</strong></p>
<p><em>This line rendered as italicized text.</em></p>
<p><abbr title="attribute">attr</abbr></p>
<p><abbr title="HyperText Markup Language" class="initialism">HTML</abbr></p>

<hr />
<div class="responsive-table">
<table>
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">Heading</th>
          <th scope="col">Heading</th>
          <th scope="col">Heading</th>
          <th scope="col">Heading</th>
          <th scope="col">Heading</th>
          <th scope="col">Heading</th>
          <th scope="col">Heading</th>
          <th scope="col">Heading</th>
          <th scope="col">Heading</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">1</th>
          <td>Cell</td>
          <td>Cell</td>
          <td>Cell</td>
          <td>Cell</td>
          <td>Cell</td>
          <td>Cell</td>
          <td>Cell</td>
          <td>Cell</td>
          <td>Cell</td>
        </tr>
        <tr>
          <th scope="row">2</th>
          <td>Cell</td>
          <td>Cell</td>
          <td>Cell</td>
          <td>Cell</td>
          <td>Cell</td>
          <td>Cell</td>
          <td>Cell</td>
          <td>Cell</td>
          <td>Cell</td>
        </tr>
        <tr>
          <th scope="row">3</th>
          <td>Cell</td>
          <td>Cell</td>
          <td>Cell</td>
          <td>Cell</td>
          <td>Cell</td>
          <td>Cell</td>
          <td>Cell</td>
          <td>Cell</td>
          <td>Cell</td>
        </tr>
      </tbody>
    </table>
    </div>

<hr />

<h3 id="soundcloud-embed">SoundCloud Embed</h3>

<!-- <iframe width="100%" height="166" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/29738591&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false"></iframe> -->

<iframe width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1199278825&color=%233e45c5&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"></iframe>

<hr />

<h3 id="syntax-highlighting">Syntax Highlighting</h3>

<figure class="highlight"><pre><code class="language-js" data-lang="js"><span class="s1">'use strict'</span><span class="p">;</span>
<span class="kd">var</span> <span class="nx">markdown</span> <span class="o">=</span> <span class="nx">require</span><span class="p">(</span><span class="s1">'markdown'</span><span class="p">).</span><span class="nx">markdown</span><span class="p">;</span>
<span class="kd">function</span> <span class="nx">Editor</span><span class="p">(</span><span class="nx">input</span><span class="p">,</span> <span class="nx">preview</span><span class="p">)</span> <span class="p">{</span>
  <span class="k">this</span><span class="p">.</span><span class="nx">update</span> <span class="o">=</span> <span class="kd">function</span><span class="p">()</span> <span class="p">{</span>
    <span class="nx">preview</span><span class="p">.</span><span class="nx">innerHTML</span> <span class="o">=</span> <span class="nx">markdown</span><span class="p">.</span><span class="nx">toHTML</span><span class="p">(</span><span class="nx">input</span><span class="p">.</span><span class="nx">value</span><span class="p">);</span>
  <span class="p">};</span>
  <span class="nx">input</span><span class="p">.</span><span class="nx">editor</span> <span class="o">=</span> <span class="k">this</span><span class="p">;</span>
  <span class="k">this</span><span class="p">.</span><span class="nx">update</span><span class="p">();</span>
<span class="p">}</span></code></pre></figure>

<p>You can add inline code just like this, E.g. <code class="highlighter-rouge">.code { color: #fff; }</code></p>

<figure class="highlight"><pre><code class="language-css" data-lang="css"><span class="nt">pre</span> <span class="p">{</span>
  <span class="nl">background-color</span><span class="p">:</span> <span class="m">#f4f4f4</span><span class="p">;</span>
  <span class="nl">max-width</span><span class="p">:</span> <span class="m">100%</span><span class="p">;</span>
  <span class="nl">overflow</span><span class="p">:</span> <span class="nb">auto</span><span class="p">;</span>
<span class="p">}</span></code></pre></figure>

<hr />

<h3 id="github-gist-embed">GitHub gist Embed</h3>

<script src="https://gist.github.com/ahmadajmi/dbb4f713317721668bcbc39420562afc.js"></script>

<hr />

<h3 id="input-style">Input Style</h3>

<p><input type="text" placeholder="I'm an input field!" /></p>

<hr />


