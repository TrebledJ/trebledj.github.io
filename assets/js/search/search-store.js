---
---

var store = [
  {% for post in collections.posts %}
      {
          "type": "post",
          "title": {{post.title | jsonify}},
          "tags": {{post.tags | jsonify}},
          "description": {{post.description | jsonify}},
          "content": {{post.content 
                          | newline_to_br
                          | replace: "<h1>", " "
                          | replace: "<h2>", " "
                          | replace: "<h3>", " "
                          | replace: "<h4>", " "
                          | replace: "<h5>", " "
                          | replace: "<h6>", " "
                          | replace: "<p>", " "
                          | replace: "</h1>", " "
                          | replace: "</h2>", " "
                          | replace: "</h3>", " "
                          | replace: "</h4>", " "
                          | replace: "</h5>", " "
                          | replace: "</h6>", " "
                          | replace: "</p>", " "
                          | replace: "<br>", " "
                          | replace: "<br/>", " "
                          | strip_html 
                          | strip_newlines
                          | normalize_whitespace
                          | jsonify}},
          "url": "{{post.url}}"
      },
  {% endfor %}
  {% assign first = true %}
  {% for page in site.pages %}
      {% assign xs = page.permalink | split: '/' %}
      {% assign xs_size = xs | size %}
      {% if xs[1] == 'tags' and page.feed != false %}
          {% unless first %},{% endunless %}
          {
              "type": "tag",
              "title": {{xs[2] | jsonify}},
              "content": {{page.content | markdownify | strip_html | strip_newlines | jsonify}},
              "url": {{page.url | jsonify}}
          }
          {% assign first = false %}
      {% endif %}
  {% endfor %}
];