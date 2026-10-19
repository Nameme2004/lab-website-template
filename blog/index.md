---
title: News
hero: true
nav:
  order: 6
  tooltip: Lab news and updates
---

<h1 id="news">{% include bilingual-text.html en="News" zh="实验室动态" %}</h1>

{% include section.html %}

{% assign public_posts = site.posts | where_exp: "post", "post.published != false" %}
{% if public_posts.size > 0 %}
  {% include search-box.html %}
  {% include search-info.html %}
  {% include list.html data="posts" component="post-excerpt" filter="published != false" %}
{% else %}
  {% include bilingual-markdown.html en="Lab news will be published here after review." zh="实验室动态经审核后将在此发布。" %}
{% endif %}
