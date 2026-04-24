---
name: dintaifung-queue-skill
description: 鼎泰豐叫號查詢技能 - 自動抓取門市叫號號碼與等候時間
version: 1.0.0
author: Roy Chuang
license: MIT
---

# 鼎泰豐叫號查詢技能 v1.0

自動化抓取鼎泰豐各門市叫號號碼與現場等候時間的 OpenClaw 技能。

## 安裝

```bash
pnpm install
npx playwright install chromium
```

## 快速開始

```bash
# 查詢叫號
pnpm start query "新生店"
pnpm start query "信義店" --json

# 列出所有門市
pnpm start list

# 叫號監控
pnpm start monitor init --branch "板橋店" --number 1380 --category "1~2人"
pnpm start monitor check
pnpm start monitor status
pnpm start monitor stop
```

## 技術架構

| 技術 | 版本 | 用途 |
|------|------|------|
| TypeScript | 5.7 | 嚴格類型系統 |
| Playwright | ^1.40 | 瀏覽器自動化 |
| Commander.js | ^12 | CLI 框架 |
| Vitest | ^2 | 單元測試 |
| pnpm | ^10 | 套件管理器 |
