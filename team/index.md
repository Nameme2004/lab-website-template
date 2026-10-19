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

{% include list.html data="members" component="portrait" filter="role == 'principal-investigator' and published != false" %}
{% include list.html data="members" component="portrait" filter="role != 'principal-investigator' and published != false" %}

{% include section.html background="images/background.jpg" dark=true %}

{% include bilingual-markdown.html en=site.data.team.gallery_intro.en zh=site.data.team.gallery_intro.zh %}

