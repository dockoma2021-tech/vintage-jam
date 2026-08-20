# Codex Handoff

## Task
Standardize category showcase imagery so every category uses one dedicated image file from `assets/images/categories`, never a collage built from product photos. Also set the user-provided image as the Knives archive category hero.

## Result
- Added `assets/js/category-heroes-v75.js` and disconnected the old v72 renderer in `index.html`.
- v75 uses one naming convention: `assets/images/categories/<category-id>-category-hero.webp`.
- The renderer no longer reads product media to construct category collages.
- All category hero images use the existing shared sizing rules from `category-uniform-v74.css`, matching the Watches 16:9 frame.
- Added a dedicated `knives-category-hero.webp` based on the user-provided image.
- Added `paintings-category-hero.webp` as a stable alias of the current Paintings artwork.
- Existing `icons-category-hero.webp` and `watches-category-hero.webp` remain the dedicated assets for those categories.
- Created dedicated placeholder files for the remaining category IDs so every category has a predictable replaceable file path.
- Added `assets/images/categories/README.md` explaining the file naming and replacement workflow.
- Knives remains informational/archive-only; this task does not add purchase functionality.

## Changed files
- `assets/js/category-heroes-v75.js` (new)
- `index.html`
- `assets/images/categories/README.md` (new)
- `assets/images/categories/category-placeholder.webp` (new path)
- `assets/images/categories/paintings-category-hero.webp` (new path)
- `assets/images/categories/knives-category-hero.webp` (new image)
- Dedicated category hero placeholder paths for `art_objects`, `daggers`, `orders_medals`, `silver`, `coins`, `books`, `porcelain`, `electronics`, `miscellaneous`
- `.codex/HANDOFF.md`

## Checks
- `node --check` passed for `category-heroes-v75.js` before upload.
- No category image path in v75 references `product.media` or product image folders.
- All category hero filenames are deterministic from the category ID.
- Existing shared 16:9 category sizing CSS remains active.
- Latest pre-existing Admin/GitHub image update was preserved by basing this change on the current `main` head.

## Problems found
- Legacy `category-heroes-v72.js` remains in the repository for history but is no longer loaded by `index.html`.
- Legacy collage CSS remains but is unused by v75 and can be removed in a later cleanup.
- Existing unrelated missing `vj-000009/11.webp`–`20.webp` references remain a separate issue.

## Decisions
- Use a filename convention instead of a JavaScript image map so future image replacement does not require code changes.
- Use dedicated neutral placeholder files for categories that do not yet have custom artwork.
- Preserve the current Paintings, Icons and Watches category art while standardizing their file locations/naming.

## Remaining work
- Visually verify production after Vercel deploy propagation.
- Replace neutral placeholder category images with custom artwork over time as desired.
- Later remove unused legacy collage renderer/CSS after production verification.

## Git
Branch: `main`
Commit SHA: see latest GitHub commit for this task
Push status: direct fast-forward update to `main`