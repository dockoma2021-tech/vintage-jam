# Codex Handoff

## Task
Restore the Knives / Ножі category as a visible informational/archive section without purchase functionality, working directly in GitHub because Codex usage is unavailable.

## Result
- Knives is no longer treated as a restricted/hidden category in the main router.
- Daggers remains restricted and hidden.
- Knives category buttons and showcase cards remain visible and route normally to `?view=catalog&category=knives`.
- Knives catalog cards are explicitly marked as informational/archive and their price text is replaced with an archive-only label.
- The Knives hero copy is changed to an archive/reference description and states that sale through the site is not offered.
- Product detail pages for Knives load an informational guard: price is replaced by an archive-only notice; contact buttons, contact sheet, contact methods and shipping block are hidden.
- No product data, product prices, contacts, Admin 3.3 data or Vercel configuration were changed.

## Changed files
- `assets/js/navigation-router-v60.js`
- `assets/js/informational-product-v73.js` (new)
- `item.html`
- `.codex/HANDOFF.md`

## Checks
- Changes are isolated to routing/display behavior and the new informational product guard.
- Knives routing is allowed; Daggers routing remains blocked.
- Existing category title fallback remains, while category UI continues to receive `data-category-id` from the router.
- Informational labels are localized for UA/EN.
- The product guard only activates when the current published product has `category === "knives"`.
- Existing known validator issue for `vj-000009/11.webp`–`20.webp` is pre-existing and unrelated to this task.

## Problems found
- Codex still has stale local unstaged changes from the earlier attempt. Before using that local clone again, it should be reconciled with the new `origin/main` rather than force-pushed.
- `vj-000009` still references missing images 11–20; this remains a separate catalog-data issue.

## Decisions
- Keep Knives visible only as an informational/archive category.
- Remove purchase-oriented presentation for Knives while preserving browsing, images, descriptions and share functionality.
- Keep Daggers restricted.
- Make one atomic Git commit based on the latest `main` so concurrent Admin 3.3 changes are preserved.

## Remaining work
- Verify the Vercel production deployment after the commit is live.
- Separately repair the stale `vj-000009/11.webp`–`20.webp` references.
- Reconcile the old Codex local working tree before resuming Codex work.

## Git
Branch: `main`
Commit SHA: see the GitHub commit created for this task
Push status: direct fast-forward update to `main`
