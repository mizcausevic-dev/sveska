# Sveska — Chrome side panel extension

A local-only browser side-panel version of Sveska. Two tabs:

- **Tasks** — checklist notes (stored as markdown `- [ ]` lines)
- **Notebook** — free-text notes

**Status: Phase 1 — fully local, no sync.** Notes live in `chrome.storage.local`,
scoped to this extension. There is no sync between this extension and the
[Sveska PWA](https://sveska.studio) or across your devices. Cross-device sync
is a separate roadmap item and requires end-to-end encryption per the parent
repo's `CLAUDE.md` §5.5.

## Load unpacked (developer)

```sh
pnpm install
pnpm build          # produces dist/
```

Then in Chrome:

1. Visit `chrome://extensions/`
2. Enable **Developer mode** (top-right)
3. Click **Load unpacked** and select `extension/dist/`
4. Click the Sveska toolbar icon — the side panel opens

## Permissions (minimal, by design)

Only two, listed in `manifest.json`:

- `sidePanel` — render the side panel UI
- `storage` — persist notes via `chrome.storage.local`

No `host_permissions`. No tab / activeTab / webNavigation / cookies /
identity. No content scripts. No injected DOM on any page you visit.
Small permission footprints are the honest MV3 trust signal — please
don't add anything "just in case."

## Data boundary

The extension's data lives ONLY in `chrome.storage.local`, keyed under
the `sveska:v1:` prefix (see `src/storage/notesStorage.ts`). It does not
read the PWA's IndexedDB, it does not write to any network endpoint, and
there is no telemetry.

## Type + ID parity with the PWA

The `Note` type in `src/types/note.ts` is duplicated verbatim from
`src/notes/db.ts` in the PWA. The ID generator in `src/lib/id.ts` wraps
`crypto.randomUUID()`, which is exactly what the PWA uses
(`src/notes/noteRepo.ts:12`). Duplication was chosen over a shared
package because a shared data layer becomes mandatory once sync ships
anyway — don't pay the refactor cost twice. **If you change the Note
shape or ID scheme in the PWA, change it here too**, or a future sync
layer will need a translation shim.

## Themes

The side panel reads `../public/brand/tokens.css` at build time (via
CSS `@import`), so themes and density presets stay in sync with the PWA.
Currently exposed in the panel header is a binary light/dark toggle;
the wider named-theme picker (charcoal / midnight / sepia) lives in the
PWA's `PrefsModal` per the Phase 2 wiring plan.

## Tests

```sh
pnpm test
```

Covered:

- `chrome.storage.local` round-trip (create / update / soft-delete /
  active-tab / active-note-id / theme)
- Checklist toggle survives save + reload
- ID generator is `crypto.randomUUID` (regression guard vs the PWA)
- Tab switch preserves state; last-active tab persists across reopen
- Empty-state renders in both tabs
- Task check/uncheck persists across panel reopen
- Notebook type-and-close-panel round-trips text back on reopen

The `chrome.*` namespace is shimmed in `tests/setup.ts`.

## Build gate: no `eval` in `dist/`

`pnpm build` runs `scripts/check-no-eval.mjs` as its last step. It walks
`dist/` and fails with a non-zero exit if any bundled JS contains
`eval(` or `new Function(` — MV3's default CSP forbids both. The
recon-stage source-level check on `node_modules` already passed; this
gate defends against a bundler transform sneaking eval in during build.

## Publishing to the Chrome Web Store

Not automated in this repo. Publishing requires a developer account,
privacy disclosure, and a store listing — all outside the scope of the
Phase 1 build. To distribute, package `dist/` and follow the standard
Web Store submission flow.
