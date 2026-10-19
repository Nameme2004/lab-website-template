# Pages CMS news pilot

This configuration provides repository editing only. GitHub App authorization, review rules and deployment permissions have not been configured or verified.

## Manual setup

1. After reviewing and publishing this configuration to a test branch, sign in at https://app.pagescms.org with GitHub.
2. Install/authorize the Pages CMS GitHub App for this repository only. Select the test branch explicitly before saving content or uploading media.
3. Configure main branch protection and reviewer access in GitHub. CMS operation flags are UI controls, not a replacement for repository permissions. Do not grant the App a review bypass.

## Editing rules

- New files must be `YYYY-MM-DD-slug.md`, with a nonempty, simple ASCII slug. The template date tokens use the current date, not the publication date field. Check and correct the creation filename so its date prefix matches the date field before saving. Automatic matching is not guaranteed.
- Existing posts have dates in their filenames but often no front matter date. When first editing an old post, enter its original filename date; do not use today. Required dates start blank deliberately.
- Do not change an already published date casually: Jekyll date-based URLs can change even when filenames remain stable. Renaming and deleting news are disabled in the CMS configuration.
- Merge mode preserves unmanaged front matter such as tags, layout, permalink and member. Verify preservation in a save round trip before using the pilot for existing content.
- Title/date are required. Category, summary, author, image, image_caption and doi are optional metadata. Body is Markdown below the front matter. Summary overrides the card excerpt; missing summaries retain legacy excerpt behavior. Category/doi are stored for future use and are not new display features.
- Upload only authorized, compressed display images to `images/uploads/`. Cover fields save `/images/uploads/...`, and Jekyll components add baseurl using `relative_url`. Legacy `images/...` covers remain supported.
- Body media insertion is disabled: raw Markdown `/images/...` URLs do not automatically receive baseurl. Do not manually insert unsupported root-relative images. Media library uploads remain available for future display use; this pilot does not create a gallery.
- The news delete setting does not protect media deletion. Avoid deleting/renaming referenced images; review media changes in PRs. Never upload raw, sensitive or unpublished research data.

## Test without publishing to main

1. On a test branch, create a clearly labeled test post with authorized test imagery; check filename, date format, metadata and Markdown on GitHub.
2. Edit a copy of an old post; confirm its date, tags, image reference and body remain correct. Confirm delete and rename operations are unavailable. Check empty-cover behavior and summary fallback.
3. Open a PR in the GitHub browser UI for review. Pages CMS is not assumed to create PRs or enforce approval automatically. Existing PR workflows may deploy a preview; only run this after separate authorization for preview deployment. Do not merge test content into main.
4. When a Jekyll environment is available, run `bundle exec jekyll build --baseurl /lab-website-template` and inspect the homepage, blog, details, three-item date sorting, summaries, captions and image URLs. Also test no-news behavior in an isolated checkout.
5. For an authorized production change, review and merge a clean content PR; the existing main workflow updates citations then builds/deploys. Verify App-triggered workflow execution and branch protection compatibility first. Citation failures can block publication; no workflow changes are made by this pilot.

Official references: https://pagescms.org/docs/configuration/ , https://pagescms.org/docs/configuration/content/filename/ , https://pagescms.org/docs/configuration/content/operations/ , https://pagescms.org/docs/configuration/media/
