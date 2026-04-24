# Development Guide

## Prerequisites

- Node.js >= 18
- pnpm
- Chromium (Playwright)

## Setup

```bash
pnpm install
npx playwright install chromium
pnpm build
pnpm test
```

## Project Structure

```
src/
├── index.ts              # CLI entry (Commander.js)
├── types/                # Type definitions
│   ├── queue.ts
│   ├── branch.ts
│   ├── monitor.ts
│   └── index.ts
├── core/                 # Business logic
│   ├── api.ts            # HTTPS API client
│   ├── browser.ts        # Playwright browser management
│   ├── constants.ts      # URLs, polling tiers, thresholds
│   ├── matcher.ts        # Branch name fuzzy matching
│   └── parser.ts         # DOM & API response parsers
├── commands/             # CLI commands
│   ├── query.ts
│   ├── list.ts
│   └── monitor.ts
└── utils/                # Helpers
    ├── cli.ts
    └── state.ts
```

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm build` | Compile TypeScript |
| `pnpm start` | Run CLI via tsx (no build needed) |
| `pnpm test` | Run unit tests |
| `pnpm test:watch` | Vitest watch mode |
| `pnpm test:integration` | Integration tests (INTEGRATION=1) |
| `pnpm typecheck` | Type checking |

## Running the CLI

```bash
pnpm start query "新生店"
pnpm start list
pnpm start monitor init --branch "板橋店" --number 1380 --category "1~2人"
```

## Versioning with Changesets

```bash
pnpm changeset
pnpm version
pnpm release
```

## Git Commit Convention

[Conventional Commits](https://www.conventionalcommits.org/)

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `ci`, `perf`, `revert`
