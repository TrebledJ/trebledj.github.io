---
---

var tracks = [
  {% assign iter = 0 %}
  {% for post in collections.posts %}
    {% if post.tags contains 'composition' %}
      {% if iter > 0 %},{% endif %}
      {% assign iter = iter | plus: 1 %}
      {
        "track_id": {{post.track_id}},
        "tags": ["{{post.tags | join: '", "'}}"],
        "date": "{{post.date | date}}",
        "description": "{{post.content | strip_html | truncatewords: 20}}",
        "url": "{{post.url}}"
      }
    {% endif %}
  {% endfor %}
];
