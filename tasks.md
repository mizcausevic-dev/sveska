<!-- tasks.md — durable TODO. UPDATE on every commit. -->
<!-- This file replaces in-session TodoWrite for cross-session continuity. -->

# Tasks · Sveska

> **At session start, read this file first.** It holds the active ticket and the next 3–5 sequential ones. Older / completed work is summarized for context but should not be re-litigated.

## In progress

_None._ Migration + post-M7 platform work are settled. Next moves are deferred items in "Next up".

## Next up

- ✅ **Bundle headroom** — added `manualChunks` rule that forces `markdown-it`, `dompurify`, and their transitive helpers (`entities`, `mdurl`, `linkify-it`, `uc.micro`, `punycode.js`) into a dedicated `markdown-async-*.js` chunk. Initial JS gzip: 179.78 → 179.12 KB (gzip savings smaller than the ~56 KB the ticket guessed because markdown-it's entity tables compress extraordinarily well — but raw initial bytes dropped 521 → 392 KB, real parse-time/TTI win). New ~129 KB raw async chunk created. All 281 tests green, lint clean.
- [ ] **Rich editor polish (post-increment-2)** — match the slash autocomplete tooltip styling to the textarea's slash popover; consider a custom find/replace bar to match the textarea UX (currently CM's native search panel); port paper textures to CM; retire the textarea path entirely if no one uses the classic toggle.
- [ ] Post-M7 — Lighthouse PWA report on prod, Pro-tier sync design (E2E-encrypted per §5.5), analytics vendor pick (parking lot row 4)

## Recently done (this branch only)

- ✅ **M0 ship** — 5 commits, tagged `v0.0.1-m0`, deployed to `sveska.studio`
- ✅ T1.1 — Editor + Dexie autosave (debounced 400ms + blur/visibility flush + refresh-safe)
- ✅ T1.2 — Snapshots save/restore/clear + pending dot indicator
- ✅ T1.3 — Export `.txt` / `.md` / `.html` from shared AST + ExportMenu
- ✅ T1.4 — Statistics modal (pure `computeStats` + live UI + `Ctrl+Shift+I`)
- ✅ T1.5 — Focus mode (`Alt+F`, persists in Dexie, exit chip in corner)
- ✅ T1.6 — Editor prefs (size / line height / family / spellcheck / tab size / reset; round-trip persisted)
- ✅ T1.7 — Shortcuts (`Ctrl+S`/`Alt+C`/`Ctrl+Del` w/ confirm/`Ctrl+?` cheatsheet) + editorCommands registry
- ✅ **M1 close** — tagged [v0.1.0-m1](https://github.com/mizcausevic-dev/sveska/releases/tag/v0.1.0-m1)
- ✅ Polish (4b3b84f) — missing T1.3–T1.7 CSS rules · SW update banner · loosened alias redirects
- ✅ T2.1 — Multi-note tabs + session restore + "open previous session" pref + inline rename + dirty dot
- ✅ T2.2 — Version history modal · pure LCS line diff · side-by-side panes · restore writes back to active note · empty-state · 16 unit tests
- ✅ T2.3 — Crash-safe draft shadow per note (`prefs.draft.<noteId>`) · written on every keystroke · cleared on debounced save · recovery banner with Keep / Discard on stale shadow · 10 unit tests
- ✅ T2.4 — Per-note tag chips · pin toggle · NotesRail sidebar with Pinned/Recent sections · saved-filter dropdown (All/Pinned/Untagged/#tag) · collapsible rail · 12 unit tests + browser preview verified
- ✅ T2.5 — Hand-rolled fuzzy scorer (1k notes <50ms) · Ctrl+P SearchModal (title+body fuzzy, ↑↓ Enter) · Inbox repo + Ctrl+Shift+K InboxModal (capture, promote-to-note, mark processed) · rail badge for unprocessed count · 19 unit tests + browser preview verified
- ✅ **M2 ship** — tagged [v0.2.0-m2](https://github.com/mizcausevic-dev/sveska/releases/tag/v0.2.0-m2), GitHub release with per-ticket bullets
- ✅ Layout fix — `.editor` switched from grid to flex (TagsBar broke the 4-track grid; textarea now always `flex: 1`)
- ✅ T3.1 — Command catalog (12 entries across editor/view/navigate/note/app groups) · Ctrl+K CommandPalette modal (fuzzy filter, ↑↓ Enter) · inline slash-command popover in the editor (cursor on `/`-line triggers, Enter runs + strips `/query`) · 12 unit tests + browser preview verified
- ✅ T3.2 — `markdown-it` + DOMPurify renderer · `setNoteMode()` · TagsBar TXT/MD toggle · split editor + PreviewPane when MD + preview-toggle · HTML export uses `.prose` div for md notes · XSS gates (no `<script>`, no `javascript:` hrefs) · 12 unit tests + browser preview verified
- ✅ T3.3 — Pure parser for `- [ ]`/`- [x]` lines + passthrough preservation · ChecklistPane split-view with click-to-toggle, indent levels, drag-reorder, filter unchecked, summary · TagsBar mode cycle TXT → MD → CHK → TXT · 11 unit tests + browser preview verified
- ✅ T3.4 — `templates` + `snippets` Dexie repos with 5 built-in templates (meeting / daily / retro / standup / brief) + 3 built-in snippets · TemplatesModal (Ctrl+T) with Templates / Snippets tabs · "New note from template" creates + opens · in-editor snippet typeahead (`findTriggerAt` matches longest trigger to caret) · palette commands wired · 8 unit tests + browser preview verified
- ✅ T3.5 — Typewriter scroll hook (active line centered ~40% from top) + typing sounds hook (WebAudio synth click, 25ms throttle, pitch per key: 520Hz Enter / 360Hz Space / 440Hz default) · Prefs rows with conditional volume slider · 3 new persisted editor prefs (typewriter / sounds / soundVolume, both toggles default OFF) · 6 unit tests + browser preview verified
- ✅ T3.6 — Paper textures (dotted/graph/linen/grain, CSS-only, no assets) + Pomodoro-style writing timer (auto-pauses on 60s idle) + word-count goal progress bar in SaveIndicator + Ctrl+F find/replace bar with match counter and case-sensitive toggle · 2 new persisted editor prefs (paper / wordGoal) · 12 unit tests + browser preview verified
- ✅ T3.7 — Import .txt/.md (file picker + drag-drop on rail) · Web Share target → inbox · share-via-URL `#note=<base64url>` (pack + parse + auto-open on load + "Copy share link" palette command) · lazy `.pdf` export (jsPDF dynamic import; 223 KB into separate chunks, not initial bundle) · check-bundle.mjs updated to only count initial-load chunks · 8 unit tests + browser preview verified
- ✅ **M3 ship** — tagged [v0.3.0-m3](https://github.com/mizcausevic-dev/sveska/releases/tag/v0.3.0-m3), GitHub release with per-ticket bullets
- ✅ M4 edge-host decision — Netlify Edge Functions (M0–M6); migrated to **Cloudflare Pages Functions** at M7+ (Netlify credit cap forced the move; same architecture, free-tier headroom).
- ✅ T4.1 — Anthropic `/v1/messages` streaming proxy at `/api/ai`. Initially `netlify/edge-functions/ai.ts` (Deno, `Deno.env`, `context.ip`); rewritten 2026-05-17 as `functions/api/ai.ts` (Workers runtime, `env.ANTHROPIC_API_KEY`, `cf-connecting-ip`). Per-IP token bucket, same-origin guard, schema gate. `src/ai/aiClient.ts` unchanged (SSE consumer). 6 unit tests.
- ✅ T4.2 — `src/ai/prompts.ts` 5-command catalog (improve / summarize / continue / rewrite / linkedin) · `aiRunStore` single-concurrent-run with abort + toast on error · `AIResultPane` split-view stream with Apply / Copy / Discard · `AIToast` 4s auto-dismiss · `ai`-group entries in command palette + slash popover · `copyOnComplete` writes the result to clipboard (used by LinkedIn) · 503 degrades to "AI offline — see README" toast (never leaks env-var name to the SPA, key-leak gate still passes) · 8 unit tests
- ✅ T4.3 — `imageSpec.ts` AI-returns-JSON spec for Concise (title/subtitle/3 bullets/accent) and Detailed (title/subtitle/4 sections/accent), with clamping + code-fence stripping + best-effort fallback when proxy is offline · `renderImage.ts` paints the spec on a 1200×630 canvas (OG-card friendly), exports a PNG Blob, triggers a download via ephemeral anchor · 2 palette commands ("AI · Render as image (concise/detailed)") · unconfigured proxy gracefully renders a basic card from the note itself · 8 unit tests
- ✅ **M4 ship** — tagged [v0.4.0-m4](https://github.com/mizcausevic-dev/sveska/releases/tag/v0.4.0-m4), GitHub release with per-ticket bullets; AI key now set via CF Pages env (was `netlify env:set` until the M7+ migration)
- ✅ T5.1 — `@excalidraw/excalidraw` installed + lazy-loaded via `import()` (chunk 2.6 MB but kept out of initial bundle); `CanvasProvider` seam already existed at `src/canvas/CanvasProvider.ts`; `canvasRepo` writes per-note doc Blobs to Dexie's existing `canvas` table; `ExcalidrawCanvas` adapter mounts vendor with hydrated initialData + debounced 400ms autosave; `useCanvasView` Zustand store tracks open/close per session; canvas-toggle button (✎) in TagsBar; pane replaces textarea when open; closes on note switch; 2 palette commands (open canvas + export canvas as PNG via vendor `exportToBlob`); vitest aliases vendor to `src/__mocks__/excalidraw.ts` (roughjs Node-ESM resolution failure); 7 unit tests
- ✅ T5.2 — **DROPPED** (parking lot decision, kept in CLAUDE.md §6 for historical clarity)
- ✅ **M5 ship** — tagged [v0.5.0-m5](https://github.com/mizcausevic-dev/sveska/releases/tag/v0.5.0-m5)
- ✅ T6.1 — Glossary engine: 20 terms across concept/tech/brand, DOMParser autolinker (skips code/anchors), grouped `/glossary` route, deep-anchored entries, in-page search, 13 unit tests
- ✅ T6.2 — Content surface: `public/content/changelog.md` + 2 seeded blog posts + JSON index · `/changelog` + `/blog` + `/blog/:slug` routes via the same DOMPurify pipeline · note → MDX export (YAML frontmatter + slugified body)
- ✅ T6.3 — Lead-gen seam: typed `LeadEvent` written to Dexie `prefs.leadEvents` (vendor-swappable) · reusable `EmailCapture` form · dismissable `CTASlot` with per-id persistence · utm-tagged subscribe link in HTML export footer
- ✅ T6.4 — Pricing page (Free / Pro $10/mo waitlist / Team) · `/funnel` internal MRR dashboard reading lead events · `docs/roi.md` path-to-$15K math · **all platform routes lazy-loaded** to keep initial bundle under 180 KB
- ✅ **M6 ship** — tagged [v0.6.0-m6](https://github.com/mizcausevic-dev/sveska/releases/tag/v0.6.0-m6), repo metadata refreshed
- ✅ T7.1a — Top-level `ErrorBoundary` class wraps `<App />` in `main.tsx` · Reload / Copy-details / Open-editor recovery affordances · structured crash report to clipboard · 3 unit tests
- ✅ T7.1b — `scripts/e2e.mjs` on-demand Playwright smoke suite (`pnpm test:e2e`): editor mounts · /glossary entries · /pricing tiers · manifest.json parses · offline reload still renders editor (SW cache)
- ✅ T7.1c — `vitest-axe` accessibility sweep over App shell + /glossary + /pricing · uncovered + fixed: `tab` role nested an interactive close button (refactored to `role="toolbar"` + sibling buttons) and file input lacked a label · vitest-axe types augmented locally for vitest@2
- ✅ T7.1d — `docs/security-review.md` walks every CLAUDE.md §5 clause with status + evidence · accepted-risks table · review cadence
- ✅ T7.1e — bundle + key gates already chained into `pnpm build` (verified in `.github/workflows/deploy.yml`); Playwright stays on-demand to keep CI slim
- ✅ Design package absorbed — Claude Code Design files in `docs/design-mocks/` + `docs/landing/`
- ✅ Repo screenshots — `scripts/capture-mocks.mjs` (Playwright + static server + Babel-JSX wait) · 6 PNG screenshots in README table grid
- ✅ **M7 ship** — tagged [v0.7.0-m7](https://github.com/mizcausevic-dev/sveska/releases/tag/v0.7.0-m7), Netlify deploy hit credit cap (`JSONHTTPError: Forbidden`)
- ✅ **Netlify → Cloudflare Pages migration** (2026-05-17) — ported `netlify/edge-functions/ai.ts` → `functions/api/ai.ts` (Deno → Workers runtime; `Deno.env` → `env.X` param; `context.ip` → `cf-connecting-ip` header), `netlify.toml` headers/redirects → `public/_headers` + `public/_redirects`. CI pivoted to CF Pages git integration (no `wrangler-action`, no CF API token in GH secrets — CF reads git pushes directly); `deploy.yml` renamed to CI and runs only typecheck/lint/test/build gates. `tsconfig.functions.json` added for `@cloudflare/workers-types`. Netlify configs deleted. Live at `sveska.pages.dev`.
- ✅ **Post-migration polish** (2026-05-17) — canonical URL flipped to `sveska.pages.dev` across README/index.html/sitemap/robots/GH repo homepage. Hostinger 301 redirect set up `sveska.studio → sveska.pages.dev` (works on both IPv4 + IPv6 after deleting the leftover AAAA record via Kodee). Stale `sveska.kineticgain.com` + `notepad.kineticgain.com` aliases deleted. Mobile responsive sweep across 2 commits: snap-btn nowrap + header flex-wrap + MD-preview stacking + nav-secondary hidden on small viewports + tighter rail max-height. Pixel 6 pre-editor chrome reduced from 82% → 70% of viewport.
- ✅ **Screenshot/image paste** (2026-05-18) — paste or drag-drop an image into the editor → stored as a Blob in a new Dexie `attachments` table (v2), inserted as `![screenshot](sveska-img:<id>)`, auto-flips text→md so it renders inline. Preview resolves refs to `data:` URIs (not blob: — DOMPurify strips blob:), cached by id. HTML export inlines images as data URIs for self-contained files; .md/.txt keep the raw ref for round-trip. Canvas (Excalidraw) already handled paste natively — added a discoverability hint. 14 new tests (274 total). Verified end-to-end in browser preview (paste → ref → md flip → `<img data:>`). Follow-up polish: action-bar uniform-height pills + full-width; shortened attachment ids to 12 hex chars for tidy refs.
- ✅ **Rich editor — increment 1** (2026-05-18, "the big lift") — CodeMirror 6 editor behind the `richEditor` pref (default OFF, lazy-loaded). Headline: pasted images render INLINE in the editing surface (live-preview widget) instead of raw `![](sveska-img:…)` text — collapses when cursor is off the ref line, editable when on it. Also markdown syntax highlighting + undo. `src/editor/RichEditor.tsx` + `richImageWidget.ts`. PreviewPane lazy-loaded to hold the bundle. 7 new tests (281 total). Browser-verified: paste → inline `<img data:>` in CM.
- ✅ **Rich editor — increment 2 + DEFAULT FLIP** (2026-05-18) — ported all M3 power features onto CM in `src/editor/cmExtensions.ts`: slash commands (@codemirror/autocomplete reusing the catalog + fuzzy), snippet expansion (findTriggerAt), find/replace (@codemirror/search, Ctrl+F), typewriter scroll + typing sounds (read prefs live). Flipped `richEditor` default → ON; CM stays a ~190 KB dynamic-import chunk so initial JS holds at 179.78/180 KB. `test-setup` forces the classic textarea for App-integration tests. Browser-verified: snippet `;todo`→`- [ ] `, slash `/imp`→autocomplete tooltip. Classic textarea is the opt-out toggle.
- ✅ **CF nameserver migration — sveska.studio attached as real custom domain** (2026-05-18) — Done end-to-end via API in one go: added zone (`POST /zones`), flipped Hostinger registrar NS (`PUT /portfolio/.../nameservers`), polled CF until zone went `active` (3 min), attached `sveska.studio` + `www.sveska.studio` to Pages project (`POST /pages/projects/sveska/domains`), created the two required CNAMEs in the new CF zone (CF Pages attach doesn't auto-create them), Google CA SSL provisioned in <60s, created Page Rule for www→apex 301 redirect, deleted orphaned Hostinger forwarder + DNS record. Flipped canonical back to `sveska.studio` in index.html/sitemap/robots/README/GH repo homepage. Only user-side step was generating + saving the CF API token to `~/.cf_token`. CF zone id: `de6f658b84872c8c07e2f62264120f73`. NS: `brenda.ns.cloudflare.com` + `ken.ns.cloudflare.com`.

## After M1

- [ ] **M2** — Multi-note tabs · version history diff · unsaved-draft recovery · tags/pins · fuzzy search + inbox
- [ ] **M3** — Command palette · Markdown mode · checklists · templates · typewriter/sounds · paper textures · find&replace · import · share-target · PDF
- [ ] **M4** — Edge function `/api/ai` · slash AI · Notes → image
- [ ] **M5** — Canvas (Excalidraw vendored)
- [ ] **M6** — Glossary engine · content surface · lead-gen · pricing
- [ ] **M7** — Hardening (Playwright offline · perf budget CI · a11y audit · security review)

## Cross-cutting (any milestone)

- [ ] Bind Hostinger DNS token from `~/ftpkred.txt` to a GH Secret + CI step so DNS changes can be PR'd
- [ ] Add `npm test` + `pnpm lint` to PR-required checks once main is branch-protected
- [ ] Lighthouse PWA report on `sveska.studio` — verify ≥90 in PWA category
- [ ] Wire `landing.html` → real `/marketing` (or apex when M6 lands)
