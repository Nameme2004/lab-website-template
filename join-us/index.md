---
title: Join Us
nav:
  order: 5
  tooltip: Opportunities and how to join
---

# {% include icon.html icon="fa-solid fa-user-plus" %}Join Us

{% assign join_us = site.data.join_us %}
{{ join_us.intro.en | default: "Recruitment information is pending confirmation." | markdownify }}

{% include section.html %}

## Open Positions

{% assign empty_positions = "" | split: "," %}
{% assign positions = join_us.positions | default: empty_positions | sort: "order" %}
{% for position in positions %}
  {% if position.confirmed == true and position.status == "open" %}
    <h3>{{ position.title.en | default: "Position information pending" | xml_escape }}</h3>
    <p><strong>Open position — confirmed by the lab lead.</strong></p>
    {{ position.description.en | default: "Further details will be added here." | markdownify }}
    {{ position.application_instructions.en | default: "Application instructions will be added once confirmed." | markdownify }}
    {% if position.deadline and position.deadline != "" %}
      <p>Application deadline: {{ position.deadline | date: "%B %d, %Y" }}</p>
    {% endif %}
  {% elsif position.confirmed == true and position.status == "closed" %}
    <h3>{{ position.title.en | default: "Position" | xml_escape }}</h3>
    <p><strong>Closed — applications are not currently open.</strong></p>
    {{ position.description.en | markdownify }}
  {% else %}
    <p><strong>Unconfirmed placeholder — this entry does not announce an open position.</strong></p>
  {% endif %}
{% else %}
  {{ join_us.positions_placeholder.en | default: "No confirmed open positions are announced at present." | markdownify }}
{% endfor %}

{% include section.html %}

## How to Apply

{{ join_us.application_instructions.en | default: "Application instructions and required materials are pending confirmation." | markdownify }}

{% include section.html %}

## AI Application Self-Assessment — Coming Soon

{{ join_us.ai_coming_soon.en | default: "Information about possible future features will be added here." | markdownify }}

This system is not yet available. AI assessments will not constitute an admission promise or an automatic rejection. Final decisions will be made by people.

There is currently no application form or resume upload facility on this page, and no personal information is collected here.

{% include section.html %}

## Contact

{% include contact-details.html %}

{% include button.html link="/contact/" text="Contact information" style="bare" %}
