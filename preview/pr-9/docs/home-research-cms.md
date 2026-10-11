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
