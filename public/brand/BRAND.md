# Sveska — Brand Kit

> **Sveska** /ˈsvɛska/ — _Bosnian: notebook, exercise book._ A studio-grade local-first notepad.
> Domain: **sveska.studio** · Concept: **Inked Paper / Sarajevo Night** — tradition (paper, ink, the folded page) meets innovation (the caret, the canvas). Dark-mode first.

---

## 1. Logo

| Asset | File | Use |
|---|---|---|
| Primary mark (app icon) | `sveska-mark.svg` | App tile, favicon, PWA, social avatar |
| Maskable mark | `sveska-mark-maskable.svg` | Android adaptive / maskable PWA icon |
| Lockup — dark bg | `sveska-logo-dark.svg` | Headers, footers, dark site |
| Lockup — light bg | `sveska-logo-light.svg` | Docs, invoices, light surfaces |

**Clear space:** keep ≥ 50% of the mark's height clear on all sides.
**Min size:** mark 16px; lockup 120px wide.
**Don't:** recolor the mark, add shadows/bevels, stretch, rotate, put the dark lockup on a busy/light background, or re-typeset the wordmark in another font (it is outlined — Bricolage Grotesque 700).

## 2. Color tokens

| Token | Hex | Role |
|---|---|---|
| `--ink-900` | `#0C0C0E` | App canvas / primary dark bg |
| `--ink-800` | `#161619` | Surface / panels |
| `--ink-700` | `#222228` | Raised / borders |
| `--paper` | `#F4EFE6` | Body text on dark · bg in light mode |
| `--paper-dim` | `#B8B2A6` | Secondary text |
| `--amber-500` | `#F2B544` | **Primary** — actions, brand, focus |
| `--amber-600` | `#EDA92E` | Primary hover |
| `--amber-700` | `#C9871F` | Fold / pressed / light-mode accent |
| `--signal-400` | `#4FD6C4` | AI / live / active state (cool counterpoint) |
| `--danger` | `#E5604D` | Destructive (clear, delete) |
| `--ok` | `#6FCF7F` | Saved / success |

Light mode = invert surfaces (`--paper` bg, `--ink-900` text); amber stays, AI uses `--amber-700` shift for contrast. Respect `prefers-color-scheme`, persist override.

## 3. Typography

| Tier | Font | Notes |
|---|---|---|
| Display / brand | **Bricolage Grotesque** 700 | Headings, marketing. Characterful, not generic |
| UI / body | **Satoshi** (500/700) | App chrome, menus, settings |
| Editor / mono | **JetBrains Mono** or **iA Writer Quattro** | Note text default, code, `.studio` mark |
| Reading (serif opt.) | **Newsreader** | Optional in-app reading font preset |
| Accessibility | **Atkinson Hyperlegible / OpenDyslexic** | Required font-family preset |

Type scale (rem): 0.75 · 0.875 · 1 · 1.25 · 1.5 · 2 · 3. Editor default 1.0625rem / line-height 1.7.

## 4. Voice

Concise, dry, competent. Stoic with a punchline. Never chirpy onboarding-bot. Microcopy example — empty state: _"Prazna sveska. Najbolji početak."_ ("Empty notebook. The best beginning.")

## 5. File inventory

```
brand/
  sveska-mark.svg            sveska-mark-maskable.svg
  sveska-logo-dark.svg       sveska-logo-light.svg
  favicon.svg
  BRAND.md   manifest.json   tokens.css
  icons/  (48–512 png, maskable, apple-touch, favicon-16/32, logo png)
```
