---
title: Join Us
nav:
  order: 5
  tooltip: Opportunities and how to join
---

<h1 id="join-us">{% include icon.html icon="fa-solid fa-user-plus" %}{% include bilingual-text.html en=site.data.i18n.navigation["Join Us"].en zh=site.data.i18n.navigation["Join Us"].zh %}</h1>
{% assign join_text = site.data.i18n.join_us %}

{% assign join_us = site.data.join_us %}
{% assign field_en = join_us.intro.en | default: "Recruitment information is pending confirmation." %}
{% include bilingual-markdown.html en=field_en zh=join_us.intro.zh %}

{% include section.html %}

<h2 id="open-positions">{% include bilingual-text.html en=join_text.positions.en zh=join_text.positions.zh %}</h2>

{% assign empty_positions = "" | split: "," %}
{% assign positions = join_us.positions | default: empty_positions | sort: "order" %}
{% for position in positions %}
  {% if position.confirmed == true and position.status == "open" %}
    <h3>{% assign title_en = position.title.en | default: "Position information pending" %}{% include bilingual-text.html en=title_en zh=position.title.zh %}</h3>
    <p><strong>{% include bilingual-text.html en=join_text.open.en zh=join_text.open.zh %}</strong></p>
    {% assign field_en = position.description.en | default: "Further details will be added here." %}
{% include bilingual-markdown.html en=field_en zh=position.description.zh %}
    {% assign field_en = position.application_instructions.en | default: "Application instructions will be added once confirmed." %}
{% include bilingual-markdown.html en=field_en zh=position.application_instructions.zh %}
    {% if position.deadline and position.deadline != "" %}
      <p>{% include bilingual-text.html en=join_text.deadline.en zh=join_text.deadline.zh %} {{ position.deadline | date: "%B %d, %Y" }}</p>
    {% endif %}
  {% elsif position.confirmed == true and position.status == "closed" %}
    <h3>{% assign title_en = position.title.en | default: "Position" %}{% include bilingual-text.html en=title_en zh=position.title.zh %}</h3>
    <p><strong>{% include bilingual-text.html en=join_text.closed.en zh=join_text.closed.zh %}</strong></p>
    {% include bilingual-markdown.html en=position.description.en zh=position.description.zh %}
  {% else %}
    <p><strong>{% include bilingual-text.html en=join_text.unconfirmed.en zh=join_text.unconfirmed.zh %}</strong></p>
  {% endif %}
{% else %}
  {% assign field_en = join_us.positions_placeholder.en | default: "No confirmed open positions are announced at present." %}
{% include bilingual-markdown.html en=field_en zh=join_us.positions_placeholder.zh %}
{% endfor %}

{% include section.html %}

<h2 id="how-to-apply">{% include bilingual-text.html en=join_text.apply.en zh=join_text.apply.zh %}</h2>

{% assign field_en = join_us.application_instructions.en | default: "Application instructions and required materials are pending confirmation." %}
{% include bilingual-markdown.html en=field_en zh=join_us.application_instructions.zh %}

{% include section.html %}

<h2 id="ai-application-self-assessment--coming-soon">{% include bilingual-text.html en=join_text.ai_title.en zh=join_text.ai_title.zh %}</h2>

{% assign field_en = join_us.ai_coming_soon.en | default: "Information about possible future features will be added here." %}
{% include bilingual-markdown.html en=field_en zh=join_us.ai_coming_soon.zh %}

<p>{% include bilingual-text.html en=join_text.ai_notice.en zh=join_text.ai_notice.zh %}</p>

<p>{% include bilingual-text.html en=join_text.privacy.en zh=join_text.privacy.zh %}</p>

{% include section.html %}

<h2 id="contact">{% include bilingual-text.html en=join_text.contact.en zh=join_text.contact.zh %}</h2>

{% include contact-details.html %}

{% capture contact_button %}{% include bilingual-text.html en=join_text.contact_button.en zh=join_text.contact_button.zh %}{% endcapture %}
{% include button.html link="/contact/" text=contact_button style="bare" %}
