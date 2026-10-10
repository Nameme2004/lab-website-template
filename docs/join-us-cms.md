# Join Us and Contact CMS guide

Select the intended branch before editing at app.pagescms.org. Join Us — public recruitment controls the public page text and position list. Contact — shared public details supplies both Join Us and `/contact/`. No application form, resume upload, personal-data collection or AI assessment is implemented.

## Editing and publication states

New text uses English and Chinese objects. Only English is rendered now; maintain Chinese for later use without adding language-switching code. Markdown is supported for introductions and instructions; titles, addresses and link labels use plain text. Inline Markdown image upload is disabled; internal links in editable Markdown must be checked for the project baseurl.

Initial positions are empty and all existing recruitment wording remains explicitly unconfirmed. Add only authorized real opportunities. Supply a unique stable ASCII ID such as an internally approved position code, title, description and public application instructions. IDs are not URLs and do not introduce detail pages. Use distinct numeric order values such as 10, 20, 30; smaller numbers appear first. The CMS schema cannot be assumed to enforce uniqueness across entries, so review IDs before publishing.

Status and confirmed are independent. Only `confirmed: true` AND `status: open` displays an open-position announcement. Confirmed closed entries display Closed without application buttons/deadlines. Everything else renders a clear placeholder and hides unconfirmed entry details. Changing status to closed closes a public announcement; changing confirmed to false hides its details. A date is optional and never invented. Deadlines do not automatically close positions: the lead must update status. Public free-text instructions also require human review; flags cannot fact-check prose.

Do not copy template contacts into verified fields. Leave contact confirmed off until every populated email, phone, address and link is verified and authorized for public release. While off, no field values or links are rendered, only the placeholder. Once on, blank fields are skipped and a wholly empty record has a safe fallback. Supported link URLs are https/http or a single-slash internal path; internal structured buttons use relative_url. `/contact/` remains available. Address values are plain text.

The fixed AI Coming Soon notice states that the system is unavailable, decisions are made by people, and assessments would not promise admission or automatically reject applicants. It remains outside editable prose so it cannot accidentally be removed through CMS editing.

## Testing, recovery and cleanup

After separate authorization to publish this configuration on an isolated test branch, load both CMS entries, save existing text, reopen and compare parsed values. Check all en/zh objects, optional dates, numeric order, booleans and unrelated list items. Add only a clearly labeled non-production placeholder in that branch, not a fabricated real opportunity. Test open/unconfirmed, open/confirmed with approved content, closed, unknown/placeholder, empty list and empty contact cases. Never mark fake contact details confirmed on a public preview.

Global merge mode is retained but list saves can replace the whole array; simultaneous editors or stale tabs may lose entries. Edit one at a time and inspect the entire GitHub diff, including nested unknown fields. File create/rename/delete are disabled in CMS, but removing a list item is possible and GitHub write access is not restricted by UI flags.

When Ruby/Bundler is available, build with `bundle exec jekyll build --baseurl /lab-website-template`. Check both page paths, Markdown, hidden unconfirmed details, links, navigation, and no personal-data inputs. PR previews may run only after separate authorization; compare latest run SHA. No deployment or permission setup is performed by these files.

Recover from mistakes by restoring affected data from a known good Git commit on a review branch; do not force-reset shared branches. Restore all temporary content before production review; search references before deleting any temporary upload. No test images are required for this phase. Branch protection, GitHub App editor authorization and human PR approval are separate administrative tasks.
