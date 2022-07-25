---
layout: page
title: Robotics
permalink: /posts/tags/robotics/
---

<h5> Posts by Tag: {{ page.title }} </h5>

<div class="card">
{% for post in site.tags.robotics %}
 <li class="tag-posts"><span>{{ post.date | date_to_string }}</span> &nbsp; <a href="{{ post.url }}">{{ post.title }}</a></li>
{% endfor %}
</div>