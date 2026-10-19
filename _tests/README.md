# Focused homepage/member regression checks

The test-only workflow does not deploy anything or alter CMS content.

```sh
bundle exec jekyll build --baseurl /lab-website-template --destination /tmp/duan-production
bundle exec jekyll build --baseurl /lab-website-template/preview/pr-check --destination /tmp/duan-preview
bundle exec ruby _tests/build_home_fixtures.rb /tmp/duan-fixtures
node _tests/home_interactions.cjs /tmp/duan-fixtures /tmp/duan-production /tmp/duan-preview
```

The Node command needs Playwright 1.62.1 with Chromium; install it outside the
repository and provide `NODE_PATH`, as the workflow does. There is no new runtime
dependency for the website. `_tests` is excluded by Jekyll's underscore-folder
convention; fictional fixture members/news exist only in a temporary source.

Coverage: 0/1/2/5 published items, exclusions and date order, missing images,
automatic/manual navigation, pause/resume and timer reset, reduced motion,
keyboard and actual Chromium touch input, real clipboard content plus denied
and unavailable clipboard cases, bilingual controls, no-JavaScript fallback,
desktop/mobile dimensions, and production/preview base URLs. Document visibility
is simulated in the browser to check the event-driven pause/resume logic.

Hero checks also assert that news occurs once inside the homepage header, that
About Us is the first main section, and that zero news leaves no empty box or
controls. All four counts are checked at 1440/375px in both languages. Long
translated titles, full-Hero image dimensions, news/image HTTP responses under both
base URLs, and unified title/intro headers on six other pages are covered.
The first Hero image is loaded eagerly; later slides remain lazy. Screenshot
artifacts contain both real-site views and clearly named isolated fixture views.

Brand layout checks also cover one H1 per page, news-detail Hero titles,
navigation/control hit targets above the stretched background link, no crystal
header background, and white/blue-gray/white Join sections. Real Home, Research
and Join desktop/mobile screenshots are generated in both languages. No fixtures
are added to the repository news collection or deployed.

Follow-up coverage: Hero/About left-edge alignment, a single visible news CTA,
the existing News navigation at 1440/768/375px, Team gallery text without the old
crystal section, bounded article images with their original aspect ratio, and
both stable research-detail URLs. Details are compared with the shared research
data in both languages, and return links/current navigation are checked.
CMS YAML and coverage of nonempty research fields are checked before building;
research IDs must be unique. Real Team, both research details and news-detail
desktop/mobile screenshots are included with the existing Home screenshots.

Member/search checks add all role groups and unknown-role fallback in isolated
fixtures, empty groups, unpublished member URLs, special-character author query
encoding, optional histories, the PI's four official periods, unchanged student
content, and actual-profile-to-publications links. Search cases cover published
author aliases (including Chinese), authors beyond the visible truncation,
phrases, Chinese descriptions, publication years, journals, DOI, clear/no results,
and 1440/768/375px layouts. CMS member YAML is parsed and round-tripped without
losing values, and every history key must be represented in the CMS schema.
This is not an actual Pages CMS Save test. No fictional publications are added.
