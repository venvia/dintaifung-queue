# Design Decisions

## Hybrid Query with Fallback

```
Start → Playwright: scrape branch list → Build name→storeId mapping
  → Try API query (multipart/form-data)
    → Success: parse API response → return
    → Fail: Playwright DOM parsing → return
```

| Factor | API | Playwright DOM |
|--------|-----|----------------|
| Speed | ~500ms | ~8-10s |
| Cost | Low | High (launch Chromium) |
| Anti-bot | N/A | Bypasses Cloudflare |

## TypeScript Strict Mode

- `strict: true`, `lib: ["ES2022", "DOM"]`
- DOM types needed for `frame.evaluate()` callbacks

## CLI via Commander.js

Lightweight, subcommand support, TypeScript friendly.

## State Persistence

Monitor state stored in `.monitor-state.json`:
- Simple: no database needed
- Portable: works anywhere

## No dist in Git

- `dist/` in `.gitignore`
- `package.json` `files` includes `dist/` for npm publish
- Developers use `pnpm start` (tsx) or `pnpm build`
