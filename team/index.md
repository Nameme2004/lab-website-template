---
title: Team
hero: true
nav:
  order: 3
  tooltip: About our team
---

<h1 id="team">{% include icon.html icon="fa-solid fa-users" %}{% include bilingual-text.html en=site.data.i18n.navigation.Team.en zh=site.data.i18n.navigation.Team.zh %}</h1>

{% include bilingual-markdown.html en=site.data.team.intro.en zh=site.data.team.intro.zh %}

{% include section.html %}

{% assign published_members = site.members | where_exp: 'member', 'member.published != false' %}
{% assign role_order = 'principal-investigator,postdoc,phd,masters,undergrad,programmer' | split: ',' %}
{% for role in role_order %}
  {% assign role_members = published_members | where: 'role', role %}
  {% include team-group.html role=role members=role_members %}
{% endfor %}
{% assign other_members = '' | split: ',' %}
{% for member in published_members %}
  {% unless role_order contains member.role %}{% assign other_members = other_members | push: member %}{% endunless %}
{% endfor %}
{% include team-group.html role='other' members=other_members %}

{% include bilingual-markdown.html en=site.data.team.gallery_intro.en zh=site.data.team.gallery_intro.zh %}

