# Sveska — path to ROI ≥ $15K MRR

CLAUDE.md §6 / T6.4 AC: "path to ROI ≥ $15K/mo documented."

## The math

Pro tier: **$10/mo** (covers AI usage at cost + sync infra + small margin).

| Subscribers | MRR         | ARR          |
| ----------- | ----------- | ------------ |
| 100         | $1,000      | $12,000      |
| 500         | $5,000      | $60,000      |
| 1,000       | $10,000     | $120,000     |
| **1,500**   | **$15,000** | **$180,000** |
| 3,000       | $30,000     | $360,000     |

Target: **1,500 paying Pro subscribers = $15,000 MRR.**

## Funnel assumptions (conservative)

Industry-standard PWA / dev-tools funnel ratios:

| Stage                        | Rate  | Implies                              |
| ---------------------------- | ----- | ------------------------------------ |
| Visitor → Email subscriber   | 2.5 % | 60,000 visitors → 1,500 emails       |
| Email subscriber → Free user | 40 %  | 1,500 emails → 600 active free users |
| Free user → Pro trial        | 15 %  | 600 free → 90 trial                  |
| Trial → Paid (3-month conv.) | 30 %  | 90 trial → 27 paid                   |

**Cohort math at steady state**: to net 1,500 paying subs, the funnel
needs to deliver ~55 paid per month against churn (assume 5% monthly).
That requires ~180 trials/mo → ~1,200 free users/mo → ~3,000 emails/mo
→ ~120,000 visitors/mo.

## Acquisition channels (ranked by leverage)

1. **Organic SEO** — the /glossary engine, /blog content surface, and
   per-export footer (with utm_source=html-export) are designed for
   this. Every exported HTML note is an inbound link. Cost: zero, just
   keep shipping posts + glossary entries.
2. **Hacker News / Lobsters / r/selfhosted** — local-first + zero-key
   AI proxy + open-source canvas == strong narrative for the niche.
   Cost: zero, requires one strong launch post per major milestone.
3. **Indie writers + journalists** — Sveska is the writing-ritual app.
   Reach out to writers in the ProductivityGuild / DigitalGardens
   communities; offer them Pro free in exchange for one honest review.
   Cost: ~$0 (free tier covers it) + ~20h outreach.
4. **Sponsorship of niche newsletters** — Hillel Wayne, Julia Evans,
   the Pragmatic Engineer dev-tools issue. Cost: $500-2000 per drop,
   conversion typically 0.5-2%. Use after the funnel is instrumented
   and ROI per dollar is measurable.

## Cost floor

- Netlify hosting: $0 free → $19/mo Pro → $99/mo Business at scale.
  Build minutes will be the binding cost long before bandwidth.
- Anthropic API: pass-through to user (Pro covers usage). Token bucket
  in the edge function (M4.T4.1) caps per-IP burn.
- Sync infra (post-M6): single $5/mo VPS with object storage covers
  the first 1,000 users; bump to $25/mo + S3 at 10k users.
- Domain: $12/yr (sveska.studio at Hostinger).
- Total cost floor at 1,500 subs: **~$120/mo** = $14,880/mo gross
  margin = 99.2% margin.

## Risks

- **ESP vendor pick** (T6.4 leaves this open) — Mailchimp / Brevo /
  ConvertKit all priced reasonably; the lead-event seam in
  `src/platform/leadgen.ts` is swap-ready.
- **Payment infra** — Stripe Checkout in test mode, swap to live when
  Pro tier opens. Not built yet (post-M6).
- **Churn underestimate** — 5%/mo is optimistic for a writing tool.
  Compensate by overshooting the trial pipeline 2x at launch.

## What's wired today (M6 close)

- ✅ /pricing page with three tiers (Free, Pro waitlist, Team contact)
- ✅ Email capture forms on /blog + /blog/:slug + Pro waitlist card
- ✅ Lead-event seam writing to Dexie's `prefs.leadEvents` row
- ✅ /funnel dashboard reading those events + projecting toward $15K
- ✅ HTML-export footer carries utm_source=html-export back-links
- ☐ ESP vendor + Stripe (post-M6)
- ☐ Real sync (post-M6 — gated on E2E encryption)
