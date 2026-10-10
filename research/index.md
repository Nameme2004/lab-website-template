---
title: Research
nav:
  order: 2
  tooltip: Research directions and projects
---

# {% include icon.html icon="fa-solid fa-microscope" %}Research

{{ site.data.research.intro | markdownify }}

{% include section.html %}

{% assign directions = site.data.research.directions | sort: "order" %}
{% for direction in directions %}
  {% include research-direction.html direction=direction %}
{% else %}
<p>Research information will be added once confirmed.</p>
{% endfor %}

{% include section.html %}

## Explore More

{% include button.html link="/projects/" text="Browse our projects" style="bare" %}

{% include button.html link="/publications/" text="See our publications" style="bare" %}
