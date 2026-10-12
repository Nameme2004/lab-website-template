# Remaining bilingual pages (stage 5C)

Use the existing EN / 中文 control. Default English and the saved preference
remain unchanged. Empty/missing/null Chinese fields fall back to English.
No automatic translations of scientific or personnel content are supplied.

## CMS editing

- **Team Page** edits the original page introduction and photo-section text as
  en/zh Markdown. Template text is retained; it is not a verified lab biography.
- **Team members** retains names, roles, images, author aliases, links and the
  English Markdown body. Optional `name_zh`, `description_zh`, `affiliation_zh`,
  `body_zh`, `research_interests` and `research_interests_zh` are rendered in
  cards or member detail pages. Role codes and creation/rename/delete settings
  are unchanged. Do not invent members or translate author aliases used by
  paper searches. Default role labels are translated as interface text.
- **Publications Page** displays the existing en/zh introduction, section labels
  and empty-highlight message. Exact highlighted IDs remain canonical.
- **Publication Sources** retains flat `description` and `description_zh`.
  These reach cards through the existing citation generator; source commentary
  changes need the normal citation update before display. Optional custom link
  `text_zh` follows the same pipeline. Do not edit generated citations, DOI,
  authors, paper title, journal or dates to translate content. Existing examples
  remain explicitly unverified as Duan Lab publications.
- **Join Us** displays all existing public en/zh fields: introduction, empty
  positions message, application instructions, AI information and confirmed
  position title/description/application instructions. Only confirmed open
  positions are announced as recruiting; unconfirmed details are withheld.
- **Contact** and Join Us share address, public-link labels and placeholder
  translations from the same contact data. Email, phone and link URLs remain
  shared. Unconfirmed information remains hidden regardless of translations.

All editable Chinese fields have a rendering path. Status-dependent fields are
only displayed in the corresponding permitted public state. Optional empty
fields may be omitted by CMS; no serializer workaround is required. Global
merge mode cannot guarantee nested/list preservation or concurrent edit safety.

## Validation and recovery

Before merge, use the test branch in Pages CMS. Save existing nonempty English
and a temporary translation; reopen and compare every original value, list
entry and field type. Pay special attention to role codes, author aliases,
highlighted IDs, confirmed/status and contact privacy. Do not publish fake
positions or contact details just to test. Use isolated in-memory fixtures for
confirmed-state template tests instead. Clear temporary translation text before
review; restore through a reviewed commit, never reset a shared branch.

Verify English/Chinese switching, refresh, disabled JavaScript, blocked storage,
Markdown/code and duplicate IDs, canonical scholarly metadata, member URLs and
paper searches. Test home and Research regressions, news search, desktop/mobile
layouts and baseurl under the PR preview. Search re-runs on language changes and
indexes both commentary languages without changing the query parameter.

The member layout supplies already-rendered English HTML via `en_html` to the
shared Markdown component; it is never markdownified twice. Translated IDs are
removed using the existing Nokogiri filter. Link targets are not rewritten, so
language-specific body anchors/widgets remain unsupported. Images and controls
are single shared elements. These changes do not sanitize arbitrary CMS HTML.
