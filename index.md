---
title: Home
nav:
  order: 1
  tooltip: Home
---

# About Us

**{{ site.subtitle }}**

{{ site.data.home.about_us | markdownify }}

{% include section.html %}

## Latest News

{% assign latest_news = site.posts | sort: "date" | reverse %}
{% for post in latest_news limit:3 %}
  {%
    include post-excerpt.html
    title=post.title
    url=post.url
    image=post.image
    author=post.author
    date=post.date
    last_modified_at=post.last_modified_at
    tags=post.tags
    content=post.content
    excerpt=post.excerpt
    summary=post.summary
    image_caption=post.image_caption
  %}
{% else %}
No news yet. Check back soon for updates!
{% endfor %}

{% include button.html link="/blog/" text="View All News →" style="bare" %}

{% include section.html %}

## Our Research

{{ site.data.home.research_preview_intro | markdownify }}

{% assign home_directions = site.data.research.directions | where: "show_on_home", true | sort: "order" %}
{% capture research_preview %}
{% for direction in home_directions limit:3 %}
  {% include research-direction.html direction=direction preview=true %}
{% else %}
<p>Research information will be added once confirmed.</p>
{% endfor %}
{% endcapture %}
{% include grid.html content=research_preview %}

{% include section.html %}

{% include button.html link="/publications/" text="Explore publications" style="bare" %}

{% include button.html link="/team/" text="Meet our team" style="bare" %}

{% include button.html link="/join-us/" text="Join Us" style="bare" %}
