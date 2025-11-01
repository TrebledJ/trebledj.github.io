---
# layout to use from _layout folder
layout: post-default 
title:  "title of post"           # Allowed tags: sup, sub.
excerpt: "short summary of post"  # Allowed tags: inline markdown, sup, sub. Quotes.
author: trebledj
date: '2021-02-28 1:35:23 +0530' # not really needed
tags:
  - list
  - of
  - tags
thumbnail_src: ~/assets/img/to/thumbnail.jpg  # Start with ./... for images relative to your directory.
thumbnail_banner: true # or false depending if you want the thumbnail to show on the post's page.
keywords: key words  # Not really important.
comments: true      # Enable comments.
sharable: false     # Enable share buttons.
use_math: false
pitch: A description displayed in the profile.
track_id: 00000011 # soundcloud track id
score_id: 00000012 # musescore track id
# related: false
related:
  disable: true # Whether to disable related posts section.
  posts: [/posts/post1, /posts/post2] # Related will only contain these posts. "none" to hide related section.
  tags: [tag1, tag2, tag3]  # Any post containing all these tags is marked as related.
  auto: true # Use an auto algorithm to determine whether a post is related.
  # See more params in related.js.
draft: true  # Set true to not publish.
archived: true  # Set true to archive. Link still exists, but won't be shown in any collection.
feed: false  # Don't show in feed.
noindex: true # Set true to add a noindex metadata, to indicate SE robots to not index this page.
permalink: /posts/permalink/to/post/
redirect_from: [/link-to-post, /link-to-other-post] # Endpoints to redirect from.
sitemap:
  ignore: true # don't put in sitemap
  # more options: https://www.npmjs.com/package/@quasibit/eleventy-plugin-sitemap
showToc: true # Set false to hide toc
tocOptions: '{"tags":["h2","h3","h4"]}' # https://github.com/jdsteinbach/eleventy-plugin-toc?tab=readme-ov-file#options
preamble: Short text which isn't included in the body proper and won't be included in embeds.
eleventyExcludeFromCollections: true
canonicalUrl: https://example.com
---

markdown/html/liquid content here