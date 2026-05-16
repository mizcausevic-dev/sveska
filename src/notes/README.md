# src/notes

Dexie schema (`db.ts`), prefs CRUD (`prefs.ts`), and the theme store (`themeStore.ts`).
M0 only writes to the `prefs` table; the other tables are declared so M1+ migrations
don&rsquo;t start against an empty database.
