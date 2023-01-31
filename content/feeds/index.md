---
title: Feeds
layout: layouts/page-simple
logo: rss
---

Hangry for updates? Check out these feeds:

{% for tag in feedtags %}
{% if tag == 'posts' %}
* [All Posts]({{site.baseurl}}/feeds/{{tag}}.xml)
{% else %}
* [Feed: {{tag}}]({{site.baseurl}}/feeds/{{tag}}.xml)
{% endif %}
{% endfor %}
