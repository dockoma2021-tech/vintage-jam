# Codex Handoff

## Task
Make the category showcase visuals consistent in size, using the Watches category presentation as the reference size for Paintings and all other visible categories.

## Result
- Added a dedicated override stylesheet `assets/css/category-uniform-v74.css`.
- Connected it after the existing category hero stylesheet in `index.html` so it wins over older category-specific sizing rules.
- All category showcase cards now use the same visual frame dimensions as Watches on desktop.
- Category hero images use the same 16:9 frame, width, cover behavior, border radius and shadow as Watches on desktop.
- Collage-based categories now use the same 16:9 outer frame dimensions.
- On mobile (<=700px), all categories use the same full-width 16:9 presentation as Watches, with square edge-to-edge images and no shadow.
- Existing category images and product data were not changed.

## Changed files
- `assets/css/category-uniform-v74.css` (new)
- `index.html`
- `.codex/HANDOFF.md`

## Checks
- The new stylesheet loads after `category-heroes-v72.css`, so the uniform rules override the older Paintings/Icons/Watches-specific geometry.
- Desktop reference width remains `min(96vw, 1120px)` with 16:9 aspect ratio.
- Mobile reference matches the existing Watches layout: full width, 16:9, no radius/shadow.
- No JavaScript, catalog data, product prices, contacts, Admin 3.3 data or Vercel configuration were modified.

## Problems found
- Existing legacy category-specific sizing remains in `category-heroes-v72.css`, but is intentionally overridden by the new v74 stylesheet. It can be consolidated later.
- Existing unrelated missing image references for `vj-000009/11.webp`–`20.webp` remain a separate pre-existing issue.

## Decisions
- Use a small, isolated stylesheet instead of rewriting the large legacy hero CSS during this visual adjustment.
- Normalize size only; preserve each category's existing background, image content and copy.

## Remaining work
- Visually verify the production Vercel deployment after cache/deploy propagation.
- Later consolidate legacy sizing rules into one stylesheet if desired.

## Git
Branch: `main`
Commit SHA: latest site change `c2c6f3948021d74d80585b5e3f4f272768867431`
Push status: direct GitHub updates to `main` completed
