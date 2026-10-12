---
title: Home
nav:
  order: 1
  tooltip: Home
---

{% assign home_text = site.data.i18n.home %}

<h1 id="about-us">{% include bilingual-text.html en=home_text.about_us.en zh=home_text.about_us.zh %}</h1>

**{{ site.subtitle }}**

{% include bilingual-markdown.html en=site.data.home.about_us zh=site.data.home.about_us_zh %}

{% include section.html %}

<h2 id="latest-news">{% include bilingual-text.html en=home_text.latest_news.en zh=home_text.latest_news.zh %}</h2>

{% assign latest_news = site.posts | where_exp: "post", "post.slug != 'example-post-1' and post.slug != 'example-post-2' and post.slug != 'example-post-3'" | sort: "date" | reverse %}
{% for post in latest_news limit:3 %}
  {%
    include post-excerpt.html
    title=post.title
    url=post.url
    image=post.image
    author=post.author
    date=post.date
    last_modified_at=post.last_modified_at
    tags=post.tags
    content=post.content
    excerpt=post.excerpt
    summary=post.summary
    image_caption=post.image_caption
  %}
{% else %}
<p>{% include bilingual-text.html en=home_text.no_news.en zh=home_text.no_news.zh %}</p>
{% endfor %}

{% capture news_button_text %}{% include bilingual-text.html en=home_text.view_all_news.en zh=home_text.view_all_news.zh %}{% endcapture %}
{% include button.html link="/blog/" text=news_button_text style="bare" %}

{% include section.html %}

<h2 id="our-research">{% include bilingual-text.html en=home_text.our_research.en zh=home_text.our_research.zh %}</h2>

{% include bilingual-markdown.html en=site.data.home.research_preview_intro zh=site.data.home.research_preview_intro_zh %}

{% assign home_directions = site.data.research.directions | where: "show_on_home", true | sort: "order" %}
{% capture research_preview %}
{% for direction in home_directions limit:3 %}
  {% include research-direction.html direction=direction preview=true %}
{% else %}
<p>{% include bilingual-text.html en=home_text.research_pending.en zh=home_text.research_pending.zh %}</p>
{% endfor %}
{% endcapture %}
{% include grid.html content=research_preview %}

{% include section.html %}

{% capture publications_button_text %}{% include bilingual-text.html en=home_text.explore_publications.en zh=home_text.explore_publications.zh %}{% endcapture %}
{% include button.html link="/publications/" text=publications_button_text style="bare" %}

{% capture team_button_text %}{% include bilingual-text.html en=home_text.meet_team.en zh=home_text.meet_team.zh %}{% endcapture %}
{% include button.html link="/team/" text=team_button_text style="bare" %}

{% capture join_button_text %}{% include bilingual-text.html en=home_text.join_us.en zh=home_text.join_us.zh %}{% endcapture %}
{% include button.html link="/join-us/" text=join_button_text style="bare" %}
