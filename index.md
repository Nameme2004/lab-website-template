---
---

# Nameme2004's Website

An engaging 1-3 sentence description of your lab.

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

## Highlights

{% capture text %}

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

{%
  include button.html
  link="research"
  text="See our publications"
  icon="fa-solid fa-arrow-right"
  flip=true
  style="bare"
%}

{% endcapture %}

{%
  include feature.html
  image="images/photo.jpg"
  link="research"
  title="Our Research"
  text=text
%}

{% capture text %}

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

{%
  include button.html
  link="projects"
  text="Browse our projects"
  icon="fa-solid fa-arrow-right"
  flip=true
  style="bare"
%}

{% endcapture %}

{%
  include feature.html
  image="images/photo.jpg"
  link="projects"
  title="Our Projects"
  flip=true
  style="bare"
  text=text
%}

{% capture text %}

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

{%
  include button.html
  link="team"
  text="Meet our team"
  icon="fa-solid fa-arrow-right"
  flip=true
  style="bare"
%}

{% endcapture %}

{%
  include feature.html
  image="images/photo.jpg"
  link="team"
  title="Our Team"
  text=text
%}
