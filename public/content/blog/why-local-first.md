A friend once asked me to recover their three years of notes from a SaaS product that had just shut down. The export button still worked, technically — but it gave them a 4 MB JSON file with no obvious structure, no inline images, and a schema only the original company understood.

Three years of thinking, locked behind a vendor that no longer existed.

That's the case for **local-first** software. The data lives on your device. The app keeps working when the network goes down. There is no "service" to subscribe to — the binary running in your browser IS the product.

Sveska adopts this stance literally. Notes are rows in IndexedDB, written by the same code that reads them, in a format you can `console.log` and understand in five seconds. No account. No telemetry until you actively opt in. No "cloud sync" silently shipping your prose to a competitor's training set.

## The seven principles

Ink & Switch sketched seven principles in 2019:

1. **No spinners** — fast access to data
2. **Multi-device** — work flows between your phone and your laptop
3. **Network-optional** — works offline, syncs when reconnected
4. **Longevity** — the work outlives the company that built the tool
5. **Privacy & security** — your data isn't a product
6. **User control** — collaboration on YOUR terms
7. **"The long now"** — software that ages with grace

Sveska hits all seven except multi-device — which arrives at M6+ if (and only if) we can ship end-to-end-encrypted sync. Cleartext-cloud sync is off the table; vendor lock-in is a regression.

## Why a notepad?

Because writing is the most personal thing most people do at a keyboard. Notes are how plans become real. They should not require permission, internet, or a subscription.

If your tool can't survive its company, your tool is renting you your own work.

Sveska is the small protest against that.

— Miz, 2026-05-17

[Read the changelog](/changelog) · [Glossary](/glossary)
