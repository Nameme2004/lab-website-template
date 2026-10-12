---
title: Publications
nav:
  order: 4
  tooltip: Published works
---

<h1 id="publications">{% include icon.html icon="fa-solid fa-book-open" %}{% include bilingual-text.html en=site.data.i18n.navigation.Publications.en zh=site.data.i18n.navigation.Publications.zh %}</h1>

{% assign publications = site.data.publications %}
{% assign intro_en = publications.intro.en | default: "Publication information is pending verification. Template references are not confirmed lab publications." %}
{% include bilingual-markdown.html en=intro_en zh=publications.intro.zh %}

{% include section.html %}

{% assign highlighted_en = publications.highlighted_heading.en | default: "Selected Publications" %}
<h2 id="highlighted">{% include bilingual-text.html en=highlighted_en zh=publications.highlighted_heading.zh %}</h2>

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
  {% assign empty_en = publications.empty_highlights.en | default: "No highlighted references are available." %}
  {% include bilingual-markdown.html en=empty_en zh=publications.empty_highlights.zh %}
{% endif %}
