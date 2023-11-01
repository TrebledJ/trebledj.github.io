---
title: Feeds
layout: layouts/page-default
logo: rss
---

## <i class="fa fa-square-rss me-1"></i> Feeds

Hangry for updates? Check out these feeds:

{% for tag in feedtags %}
{% if tag == 'posts' %}
* [All Posts]({{site.baseurl}}/feeds/{{tag}}.xml)
{% else %}
* [Feed: {{tag}}]({{site.baseurl}}/feeds/{{tag}}.xml)
{% endif %}
{% endfor %}
