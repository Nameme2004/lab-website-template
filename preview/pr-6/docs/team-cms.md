# Team CMS rollout

The Team collection edits existing `_members/*.md` and uses their real keys: name, role, image, description, affiliation, group, aliases, links, and Markdown body. No member files are migrated or modified. New entries use a stable ASCII filename; inspect the generated filename before saving. Changing a person's display name must not rename their file. Rename/delete are disabled in the CMS UI, not enforced against GitHub write access.

Team PI grouping now uses `principal-investigator`, matching existing member data and `_data/types.yaml`. Other configured positions match the existing type keys. Existing list components and ordering within each group remain in use. The PI is now placed in the first group; this corrects the former `pi` mismatch. New roles need coordinated type/configuration review.

Global `settings.content.merge: true` remains enabled to preserve unmanaged front matter. Test a save round trip to confirm both top-level fields and unmanaged nested `links` keys survive in the deployed CMS version; if nested keys are dropped, stop editing affected entries and expand the schema or fix preservation first. Do not assume the schema alone proves runtime behavior.

Existing `images/photo.jpg` paths remain intact. New authorized portraits use the existing media directory `images/uploads/` and output `/images/uploads/...`. Portrait components apply `relative_url`, including `/lab-website-template/` and PR preview subpaths. Do not upload sensitive or unauthorized photos. Markdown biography media insertion is disabled to avoid root-relative body-image problems.

## Manual verification after authorized configuration publishing

1. Install/authorize the Pages CMS GitHub App for this repository only; confirm each editor's access and select a test branch explicitly. No login implementation or tokens are added here.
2. Load the Team editor and inspect existing members without creating fictitious people. Confirm current role, group, aliases, profile links and biography load correctly, including portraits outside the upload folder.
3. On an isolated test branch, save a reviewed change to an existing member. Compare the GitHub diff: file path and all unmanaged fields must remain stable; verify nested links preservation. Confirm rename/delete are unavailable.
4. Build/preview with baseurl `/lab-website-template/`; check Team grouping, each member detail URL, portraits, profile links and biography. No new ordering rule is introduced.
5. Review content through a GitHub PR. Main protection and human review must be configured separately; CMS UI operation controls are not authorization or approval policies. Validate permissions and any automation compatibility before publishing. Do not bypass review protections.

## News follow-up (unchanged this stage)

- News remains `_posts` with `{year}-{month}-{day}-{fields.title}.md`, manual filename entry on create, and disabled rename/delete. Verify title-to-slug generation in the actual hosted version; manually supply `YYYY-MM-DD-slug.md` if it stays empty.
- Filename date tokens use the current date, not the publication date. Old posts must retain their original effective dates when edited. Avoid changing public URLs.
- GitHub App/member authorization and branch selection need human verification. Pages CMS is not assumed to create review PRs automatically.
- Existing main push and PR preview workflows remain unchanged. Publication requires a clean reviewed PR; verify the latest preview and deployment commits. Main branch protection may conflict with automatic citation commits and requires separate review.

Known existing issue, outside this stage: member detail paper-search links still target Research although papers are now in Publications. No member layout changes are made here.

Official field reference: https://pagescms.org/docs/configuration/fields/object/ ; media: https://pagescms.org/docs/configuration/fields/image/
