# Dintaifung Queue Skill

Automated queue number and waiting time scraper for [Dintaifung (鼎泰豐)](https://www.dintaifung.tw/).

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/Tested_with-Vitest-green.svg)](https://vitest.dev/)

[繁體中文](README.zh-TW.md)

## Features

- **Real-time queue lookup** — Scrapes dine-in and takeout numbers for each branch
- **Hybrid query** — API-first with automatic Playwright DOM fallback
- **Queue monitoring** — Smart polling that adjusts frequency based on proximity
- **JSON output** — Machine-readable for automation pipelines
- **Full TypeScript** — Strict mode, complete type safety

## Installation

```bash
pnpm install
npx playwright install chromium
```

## Quick Start

### Query a Branch

```bash
pnpm start query "新生店"
pnpm start query "信義店" --json
pnpm start query "復興店" --debug
```

### List All Branches

```bash
pnpm start list
pnpm start list --json
```

### Queue Monitoring

```bash
pnpm start monitor init --branch "板橋店" --number 1380 --category "1~2人"
pnpm start monitor check
pnpm start monitor status
pnpm start monitor stop
```

## Supported Branches

| ID | Branch |
|----|--------|
| 0001 | Xinyi |
| 0003 | Fuxing |
| 0005 | Tienmu |
| 0006 | Hsinchu |
| 0007 | Taipei 101 |
| 0008 | Taichung |
| 0009 | Banqiao |
| 0010 | Kaohsiung |
| 0011 | Nanxi |
| 0012 | A4 |
| 0013 | A13 |
| 0015 | Xinsheng |

## Output Format

```json
{
  "branch": "信義店",
  "timestamp": "2026-04-24T11:00:00+08:00",
  "waitTime": "40 分鐘",
  "numbers": {
    "1~2人": "1000",
    "3~4人": "3000",
    "5~6人": "5000",
    "7人以上": "6000",
    "外帶": "0442"
  },
  "source": "api"
}
```

## Documentation

- [Development Guide](docs/DEVELOPMENT.md)
- [Design Decisions](docs/DESIGN.md)
- [Changelog](docs/CHANGELOG.md)
- [Dev Log](docs/DEV-LOG.md)

## License

MIT © [Venvia](https://github.com/venvia)
