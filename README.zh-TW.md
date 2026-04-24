# 鼎泰豐叫號查詢技能

自動化抓取[鼎泰豐](https://www.dintaifung.tw/)各門市叫號號碼與現場等候時間。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)

[English](README.md)

## 功能特色

- **即時叫號查詢** — 自動抓取各門市的內用與外帶號碼
- **Hybrid 查詢** — 優先走 API，失敗時自動 fallback 到 Playwright DOM 解析
- **叫號監控** — 智能輪詢，自動調整查詢頻率
- **JSON 輸出** — 方便後續自動化處理
- **完整 TypeScript** — strict mode，完整類型安全

## 安裝

```bash
pnpm install
npx playwright install chromium
```

## 快速開始

### 查詢叫號

```bash
pnpm start query "新生店"
pnpm start query "信義店" --json
pnpm start query "復興店" --debug
```

### 列出所有門市

```bash
pnpm start list
pnpm start list --json
```

### 叫號監控（排隊提醒）

```bash
pnpm start monitor init --branch "板橋店" --number 1380 --category "1~2人"
pnpm start monitor check
pnpm start monitor status
pnpm start monitor stop
```

## 支援門市

| 門市編號 | 門市名稱 |
|----------|----------|
| 0001 | 信義店 |
| 0003 | 復興店 |
| 0005 | 天母店 |
| 0006 | 新竹店 |
| 0007 | 101 店 |
| 0008 | 台中店 |
| 0009 | 板橋店 |
| 0010 | 高雄店 |
| 0011 | 南西店 |
| 0012 | A4 店 |
| 0013 | A13 店 |
| 0015 | 新生店 |

## 技術架構

| 技術 | 版本 | 用途 |
|------|------|------|
| TypeScript | 5.7 | 嚴格類型系統 |
| Playwright | ^1.40 | 瀏覽器自動化 |
| Commander.js | ^12 | CLI 框架 |
| Vitest | ^2 | 單元測試 |
| Changesets | ^2 | 版本管理 |
| pnpm | ^10 | 套件管理器 |

## 文件

- [開發指南](docs/DEVELOPMENT.md)
- [設計決策](docs/DESIGN.md)
- [更新紀錄](docs/CHANGELOG.md)

## 授權

MIT © [Venvia](https://github.com/venvia)
