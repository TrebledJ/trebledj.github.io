---
layout: page
permalink: /posts/tags/
---


<h3>  {{ page.title }} </h3>

<div id="tags">
{% for tag in site.tags %}
  <div class="tag-box" >
    {% capture category_name %}{{ tag | first }}{% endcapture %}
    <div id="#{{ category_name | slugize }}"></div>
    <h4 class="tag-head"><a href="{{ site.baseurl }}/posts/tags/{{ category_name }}">{{ category_name }}</a></h4>
    <a name="{{ category_name | slugize }}"></a>
     {% for post in site.tags[category_name] %}
    <article class="center">
      <h6 ><a href="{{ site.baseurl }}{{ post.url }}">{{post.title}}</a></h6>
    </article>


    {% endfor %}

  </div>
{% endfor %}
</div>


