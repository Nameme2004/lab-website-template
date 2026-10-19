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
