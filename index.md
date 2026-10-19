---
title: Home
nav:
  order: 1
  tooltip: Home
---

{% assign home_text = site.data.i18n.home %}

<h2 id="about-us">{% include bilingual-text.html en=home_text.about_us.en zh=home_text.about_us.zh %}</h2>

<p><strong>{% include bilingual-text.html en=site.subtitle zh=site.subtitle_zh %}</strong></p>

{% include bilingual-markdown.html en=site.data.home.about_us zh=site.data.home.about_us_zh %}

{% include section.html %}

<h2 id="our-research">{% include bilingual-text.html en=home_text.our_research.en zh=home_text.our_research.zh %}</h2>

{% include bilingual-markdown.html en=site.data.home.research_preview_intro zh=site.data.home.research_preview_intro_zh %}

{% assign home_directions = site.data.research.directions | where: "show_on_home", true | sort: "order" %}
<div class="home-research-cards">
{% for direction in home_directions limit:3 %}
  {% include home-research-card.html direction=direction number=forloop.index %}
{% else %}
<p>{% include bilingual-text.html en=home_text.research_pending.en zh=home_text.research_pending.zh %}</p>
{% endfor %}
</div>
