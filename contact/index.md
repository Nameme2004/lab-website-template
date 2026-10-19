---
title: Contact
hero: true
---

<h1 id="contact">{% include icon.html icon="fa-regular fa-envelope" %}{% include bilingual-text.html en=site.data.i18n.contact.title.en zh=site.data.i18n.contact.title.zh %}</h1>

{% include section.html %}

{% include contact-details.html %}

{% capture join_button %}{% include bilingual-text.html en=site.data.i18n.contact.join_button.en zh=site.data.i18n.contact.join_button.zh %}{% endcapture %}
{% include button.html link="/join-us/" text=join_button style="bare" %}
