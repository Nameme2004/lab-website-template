# Publications CMS

## Data flow and editing rules

Publication Sources edits the existing top-level array in `_data/sources.yaml`. It is manual input, not a generated bibliography. Use canonical IDs such as `doi:10.xxxx/...`, including the prefix. Do not invent or add references without lab-lead confirmation. Current references and ORCID are template examples and do not establish Duan Lab authorship or achievements. Their data is retained unchanged by this implementation.

The existing generator reads ORCID and other configured sources, then manual sources, merges equal IDs and fetches bibliographic metadata with Manubot. Source fields override generated metadata. `_data/citations.yaml` is generated and MUST NOT be edited through CMS. Invalid IDs or external API failures may fail citation updates and consequently block website builds. Existing Actions and `_cite` are unchanged.

Prefer editing description, description_zh, image, tags and related links. Original title, authors, publisher, date and paper URL overrides are optional; leave them absent unless a verified correction is required. Blank overrides can replace fetched values, so inspect the saved YAML and remove unwanted overrides rather than treating empty strings as automatic metadata. Keep authors as a list, tags as a list, buttons as a list of objects, and dates as valid publication dates. Do not alter IDs casually; ORCID imports can reintroduce an item after deleting a manual row. The remove boolean excludes a matching ID in the existing generator; use it only after review. Duplicate source IDs should be avoided, and collisions with automatically fetched IDs must be intentional.

English commentary remains the existing flat description string; description_zh is optional and passes through citation generation without requiring generator changes. Current templates show English only. Original paper titles, DOI/ID, authors, date, journal and link are canonical shared metadata and should not be duplicated for each language.

## Page text and highlights

Publications Page edits `_data/publications.yaml`. Introduction, section labels and empty-state message use en/zh objects; only English renders now. No language switch is introduced. Heading labels should be plain text, even though the editor permits Markdown; introductions/messages support Markdown. Copy the exact stable citation ID into Highlighted IDs. Order follows the list; duplicates are removed, whitespace is trimmed and IDs absent from generated citations are skipped. Empty/null/missing highlight lists have a safe fallback. The legacy title-based lookup remains supported for other callers; this page uses the new exact lookup_id path only.

The existing All list, search box, citation cards and DOI links remain. Member detail paper-search links now target `/publications/` with relative_url. Uploaded images reuse existing media and citation relative_url handling. Existing external image URLs must survive CMS save; test this before replacement. Body media insertion is disabled to avoid incorrect root-relative Markdown URLs.

## Important empty-list limitation

Pages CMS may omit blank fields or serialize empty lists as null. The page guards highlighted lists, but the unchanged citation generator requires sources files to contain a list of objects. Do not clear the entire sources array or save it as null/missing. If emptying sources is actually required, ensure literal `[]` in the file through reviewed Git editing; otherwise stop and request a separate generator compatibility fix. We do not change workflows or hide this limitation in the template. Global merge mode does not guarantee preservation within rewritten arrays or nested objects.

## Test and recovery

After separate authorization to publish a test branch, open both editors and compare the baseline parsed data. Confirm all existing source rows, external images, tags, buttons and unmanaged fields load; save a reviewed existing commentary change twice, then compare every row and field. Test a description_zh value only on the isolated test branch without fabricating claims. Do not create fake DOI entries, authors or test images. Verify optional metadata is not injected as empty overrides. Test empty/null/missing highlighted_ids, duplicate/unknown IDs and exact ID matching; inspect generated outputs without editing them.

When dependencies are available, run the existing citation update and Jekyll build with `--baseurl /lab-website-template` on a safe test checkout. Network calls are required for live citation generation. Inspect highlighted cards, All search, member paper queries and image paths. PR workflows may auto-commit citations and deploy previews; execute only after authorization, and confirm the latest SHA. Branch protection and citation automation compatibility remain administrative concerns.

Before review, restore temporary commentary/Chinese test text and order changes to baseline. Remove temporary artifacts only after checking references. Recover erroneous source changes from a known good Git revision through a review branch, not force-resetting shared branches. No tests or other changes should be merged as lab content.
