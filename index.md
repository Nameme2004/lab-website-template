---
title: Home
nav:
  order: 1
  tooltip: Home
---

# {{ site.title }}

**{{ site.subtitle }}**

{{ site.description }}

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
  %}
{% else %}
No news yet. Check back soon for updates!
{% endfor %}

{% include button.html link="/blog/" text="View All News →" style="bare" %}

{% include section.html %}

## Our Research

These preliminary themes organize the website's content. They are proposed topics, not formally confirmed research directions of the lab or its principal investigator.

{% capture cancer %}
### [Cancer Organoids]({{ "/research/" | relative_url }})

A proposed theme exploring organoid-based approaches to cancer disease modeling.
{% endcapture %}

{% capture infection %}
### [Infection Models]({{ "/research/" | relative_url }})

A proposed theme exploring organoid-based models of infection and host responses.
{% endcapture %}

{% capture discovery %}
### [Organoid-Based Drug Discovery]({{ "/research/" | relative_url }})

A proposed theme exploring organoid-based approaches to therapeutic discovery.
{% endcapture %}

{% include cols.html col1=cancer col2=infection col3=discovery %}

{% include section.html %}

{% include button.html link="/publications/" text="Explore publications" style="bare" %}

{% include button.html link="/team/" text="Meet our team" style="bare" %}

{% include button.html link="/join-us/" text="Join Us" style="bare" %}
