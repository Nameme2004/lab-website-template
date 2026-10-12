---
title: Research
nav:
  order: 2
  tooltip: Research directions and projects
---

{% assign research_text = site.data.i18n.research %}
<h1 id="research">{% include icon.html icon="fa-solid fa-microscope" %}{% include bilingual-text.html en=research_text.title.en zh=research_text.title.zh %}</h1>

{% include bilingual-markdown.html en=site.data.research.intro zh=site.data.research.intro_zh %}

{% include section.html %}

{% assign empty_directions = "" | split: "," %}
{% assign directions = site.data.research.directions | default: empty_directions | sort: "order" %}
{% for direction in directions %}
  {% include research-direction.html direction=direction %}
{% else %}
<p>{% include bilingual-text.html en=research_text.pending.en zh=research_text.pending.zh %}</p>
{% endfor %}

{% include section.html %}

<h2 id="explore-more">{% include bilingual-text.html en=research_text.explore_more.en zh=research_text.explore_more.zh %}</h2>

{% capture projects_text %}{% include bilingual-text.html en=research_text.browse_projects.en zh=research_text.browse_projects.zh %}{% endcapture %}
{% include button.html link="/projects/" text=projects_text style="bare" %}

{% capture publications_text %}{% include bilingual-text.html en=research_text.see_publications.en zh=research_text.see_publications.zh %}{% endcapture %}
{% include button.html link="/publications/" text=publications_text style="bare" %}
