---
layout: post
title:  "Adding Multiple Tags in Posts"
summary: "Learn how to add tags in posts"
author: xplor4r
date: '2021-02-28 1:35:23 +0530'
tag: ['jekyll','guides', 'sample_category']
tags: jekyll
thumbnail: /assets/img/posts/code.jpg
keywords: devlopr jekyll, how to use devlopr, devlopr, how to use devlopr-jekyll, devlopr-jekyll tutorial,best jekyll themes, multi tags and tags
usemathjax: false
permalink: /posts/adding-tags-tags-in-posts/
---

## Adding Multiple Tags in Posts

To add tags in blog posts all you have to do is add a **tag** key with tag values in frontmatter of the post :

```yml
---
tag: ['jekyll', 'guides', 'sample_category']
---
```

Then to render this tag using link and pages. All we need to do is,

1. Create a new file with [your_category_name].md inside tags folder.

2. Copy tags/sample_category.md file and replace the content in [your_category_name].md in that. (Please don't copy the code below its just sample, since it renders the jekyll syntax dynamically)

```jsx
---
layout: page
title: Guides
permalink: /posts/tags/your_category_name/
---

<h5> Posts by Tag : {{ page.title }} </h5>

<div class="card">
{% for post in site.tags.your_category_name %}
 <li class="tag-posts"><span>{{ post.date | date_to_string }}</span> &nbsp; <a href="{{ post.url }}">{{ post.title }}</a></li>
{% endfor %}
</div>
```

Using the tag, all the posts associated with the tag will be listed on
`http://localhost:4000/posts/tags/your_category_name`