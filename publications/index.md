---
title: Publications
nav:
  order: 4
  tooltip: Published works
---

# {% include icon.html icon="fa-solid fa-book-open" %}Publications

{% assign publications = site.data.publications %}
{{ publications.intro.en | default: "Publication information is pending verification. Template references are not confirmed lab publications." | markdownify }}

{% include section.html %}

## {{ publications.highlighted_heading.en | default: "Highlighted" | xml_escape }}

{% assign empty_highlights = "" | split: "," %}
{% assign highlighted_ids = publications.highlighted_ids | default: empty_highlights | uniq %}
{% assign citations = site.data.citations | default: empty_highlights %}
{% assign visible_highlights = 0 %}
{% for highlighted_id in highlighted_ids %}
  {% assign highlighted_id = highlighted_id | strip %}
  {% if highlighted_id != "" %}
    {% assign highlighted = citations | where: "id", highlighted_id | first %}
    {% if highlighted %}
      {% include citation.html lookup_id=highlighted_id style="rich" %}
      {% assign visible_highlights = visible_highlights | plus: 1 %}
    {% endif %}
  {% endif %}
{% endfor %}
{% if visible_highlights == 0 %}
  {{ publications.empty_highlights.en | default: "No highlighted references are available." | markdownify }}
{% endif %}

{% include section.html %}

## {{ publications.all_heading.en | default: "All" | xml_escape }}

{% include search-box.html %}

{% include search-info.html %}

{% include list.html data="citations" component="citation" style="rich" %}
