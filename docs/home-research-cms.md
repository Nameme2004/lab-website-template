# Home and Research CMS guide

## Editing

Select the intended branch at app.pagescms.org before editing. Home — About Us edits the homepage introduction and research section introduction; Markdown is supported. Brand, subtitle and site metadata remain in `_config.yaml` and are not exposed here.

Research — directions and homepage previews edits `_data/research.yaml`. Add an item to Research directions, fill its title and full Markdown introduction, optionally select an authorized image, and set a numeric order. Smaller numbers appear first. Use distinct values (10, 20, 30) so items can be inserted later; equal numbers follow their stored list order. Research displays all items. Turn Show on homepage on to include the item in the homepage candidates; only the first three by order appear. A blank homepage summary uses the full introduction. Both pages read the same record; no duplicate direction data is maintained.

Leave Confirmed off for proposed or placeholder themes. Only the lab lead should mark a direction confirmed after checking it is accurate. All three initial themes are unconfirmed content placeholders, not claims about established research or achievements.

Empty images render text only. Uploaded image references use `/images/uploads/...`; the existing feature component adds baseurl with `relative_url`. Existing repository image paths can remain unchanged. Body image insertion is disabled to avoid Markdown root-relative URL problems. Do not upload sensitive, unpublished, or unauthorized material.

## Save integrity and manual round-trip test

CMS global merge mode is retained, but arrays may be replaced as a whole on save. It is not a guarantee against missing entries or concurrent edits. One editor should update a list at a time; reopen before starting, avoid simultaneous stale tabs, and compare the entire GitHub diff before approving changes.

After separate authorization to publish the configuration to a test branch:

1. Record the baseline data and entry count. Open both editors, confirm every field and all three initial direction items load. Data files initially use JSON syntax, which is valid YAML; CMS may rewrite formatting on save. Compare parsed values rather than formatting.
2. On an isolated test branch, change an existing placeholder's summary, order and homepage switch, and save. Verify all other entries, full descriptions, image values, booleans, numeric types, and any unmanaged fields survive. Repeat a second save and reload the editor.
3. Test adding a clearly marked temporary placeholder only on the test branch; ensure all earlier items survive. Test four homepage-enabled items, empty lists, Markdown paragraphs and empty images without inventing research facts.
4. When a Jekyll environment is available, run `bundle exec jekyll build --baseurl /lab-website-template`. Check both pages, first-three filtering/order, unconfirmed labels, no empty image tags, and unchanged news/navigation. Test an authorized image only after permission, including PR preview subpaths.
5. Recover mistakes by restoring the affected data file from a known good Git version on a review branch, or re-entering the missing values using the editor. Do not force-reset shared branches. Deleting a direction list item is not prevented by file-level delete protection; recovery depends on Git history.
6. Restore test data to its baseline before production review. Search all references before deleting any temporary uploaded image. Do not merge test entries into main.

## Known limits

No login, authorization or review policy is configured by these files. Repository access and main protection remain separate. News and Team CMS schemas, member data, publication generation, navigation and workflows are unchanged. Backend save behavior, unknown-field preservation within list items, exact equal-order tie behavior and image handling must be checked in the deployed CMS/Jekyll versions. Numeric order and booleans must remain correctly typed.

Official schema references: https://pagescms.org/docs/configuration/content/list/ and https://pagescms.org/docs/configuration/fields/object/
# Home bilingual editing (5B-2A)

The Home editor keeps the existing English `about_us` and
`research_preview_intro` fields. Optional Chinese fields are `about_us_zh` and
`research_preview_intro_zh`; both start empty. Leave Chinese blank to display
the original English in both languages. Do not translate proposed research
themes into confirmed claims. Research direction cards remain English in this
stage; their fields, order, images and confirmation status are unchanged.

Home titles, buttons and empty-state labels are translated in `_data/i18n.yaml`.
The subtitle still comes from the original site configuration. News titles and
content are not translated by this change.

`bilingual-markdown.html` accepts `en` and `zh` Markdown. It renders each value
once and uses the existing language script and hidden-content CSS. Missing,
null or whitespace-only Chinese produces a single English block with
`lang="en"`. With a translation, two blocks are pre-rendered; only one is
visible. The English block retains original IDs; the `remove_html_ids` filter
parses only the translated HTML as a Nokogiri fragment and removes element ID
attributes to avoid duplicate anchors. Plain `id=note` text and code are not
matched or removed. The filter preserves other attributes and link targets and
adds no html/head/body wrapper. Nokogiri is already locked through the existing
dependencies; no new gem is added. Fragments without IDs are returned unchanged.
When IDs exist, normal HTML serialization may normalize quoting or entities;
malformed raw HTML may be repaired by the parser. This is not sanitization.
Chinese body-specific
anchors and raw HTML with ID-dependent widgets are not supported. Keep page
anchors such as `#about-us` for shared navigation. Markdown source line breaks
follow Jekyll's existing Markdown rules; they do not automatically become
explicit line breaks. Do not nest this component inside another markdownify.

Use ordinary Markdown paragraphs, emphasis and lists. Avoid raw interactive
HTML, custom IDs, scripts and image uploads inside these fields. Markdown is
not an HTML sanitizer. Existing editor media insertion stays disabled; root
relative links in Markdown are not automatically prefixed with the Pages
project baseurl. Reuse verified project-aware URLs when adding links.

Before merge, build the PR preview and inspect default English, Chinese UI,
blank/null/whitespace fallbacks, real Chinese Markdown, refresh, disabled JS,
duplicate IDs, mobile layout and both news/research previews. In Pages CMS,
save each Home field on the test branch, then compare both English values,
Chinese values and all unrelated fields. Restore temporary test translations
before final review. Do not edit Research or News content for this test.

## ID-filter verification in the existing Bundler environment

Run `bundle exec ruby -r ./_plugins/regex.rb -e 'puts Nokogiri::VERSION'` to
confirm dependency loading. The following Ruby assertions exercise the actual
filter (run with `bundle exec ruby`); they do not replace the Jekyll build:

```ruby
require_relative '_plugins/regex'
filter = Object.new.extend(Jekyll::RegexFilters)
input = <<~HTML
  <h2 id="shared" class="heading" lang="zh-CN" aria-label="标题">标题</h2>
  <p>Example id=note <strong>格式</strong> <code> id=note</code></p>
  <pre><code>id=note\n&lt;div id="example"&gt;</code></pre>
  <ul><li><a id="link" href="#shared" title="id=note">链接</a></li></ul>
HTML
before = Nokogiri::HTML.fragment(input)
output = filter.remove_html_ids(input)
after = Nokogiri::HTML.fragment(output)
raise 'IDs remain' unless after.css('[id]').empty?
raise 'Text changed' unless before.text == after.text
raise 'Code changed' unless before.css('code').map(&:text) == after.css('code').map(&:text)
raise 'Structure changed' unless before.css('*').map(&:name) == after.css('*').map(&:name)
before.css('*').zip(after.css('*')).each do |original, cleaned|
  expected = original.attribute_nodes.reject { |a| a.name == 'id' }.map { |a| [a.name, a.value] }.to_h
  actual = cleaned.attribute_nodes.map { |a| [a.name, a.value] }.to_h
  raise 'Other attributes changed' unless expected == actual
end
raise 'Document wrapper added' unless after.css('html, head, body').empty?
no_ids = '<p><code> id=note</code></p>'
raise 'ID-free HTML changed' unless filter.remove_html_ids(no_ids) == no_ids
puts 'ID-filter assertions passed'
```

Then build with `bundle exec jekyll build --baseurl /lab-website-template`.
In an isolated fixture, test English and Chinese Markdown with the same heading,
paragraphs, emphasis, lists and links; assert no duplicate DOM IDs and unchanged
English anchors. Test missing/null/blank/whitespace Chinese separately: each
must produce one visible English block. Confirm hidden translations remain
hidden, and remove all fixture content before review. Do not use published
research data as test fixtures.
