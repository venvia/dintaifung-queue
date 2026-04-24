import { chromium, type Frame, type Page } from "playwright";
import { TARGET_URL, USER_AGENT } from "./constants";
import type { BranchMapping, QueueNumbers } from "../types";

/** 啟動 Chromium、執行 callback 後自動關閉瀏覽器 */
export async function withBrowser<T>(callback: (page: Page) => Promise<T>): Promise<T> {
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    const context = await browser.newContext({ userAgent: USER_AGENT });
    const page = await context.newPage();
    return await callback(page);
  } finally {
    await browser.close();
  }
}

/** 在頁面中找出包含門市 <select> 的 frame */
export async function resolveQueueFrame(page: Page, debug = false): Promise<Frame> {
  await page.goto(TARGET_URL, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(3000);

  const frames = page.frames();
  if (debug) console.log(`DEBUG frames=${frames.length}`);

  for (const frame of frames) {
    try {
      await frame.waitForSelector("select", { timeout: 2000 });
      return frame;
    } catch {
      /* 繼續找下一個 */
    }
  }

  throw new Error("找不到包含門市選單的 frame");
}

/** 從頁面的 <select> 取出所有門市名稱→storeId 對照表 */
export function extractBranchMapping(frame: Frame): Promise<BranchMapping> {
  return frame.evaluate(() => {
    const select = document.querySelector<HTMLSelectElement>("select");
    if (!select) return {} as Record<string, string>;

    const result: Record<string, string> = {};
    for (const option of Array.from(select.options)) {
      const text = option.textContent?.trim() ?? "";
      const value = option.value.trim();
      if (text && value) result[text] = value;
    }
    return result;
  });
}

/** 切換門市並解析叫號資料 */
export async function extractQueueData(
  frame: Frame,
  branchName: string,
  page: Page,
): Promise<{ waitTime: string; numbers: QueueNumbers }> {
  // 找出目標門市的 index
  const branchValue = await frame.evaluate(
    (target): { value: string; index: number } | null => {
      const select = document.querySelector<HTMLSelectElement>("select");
      if (!select) return null;
      for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].text.includes(target)) {
          return { value: select.options[i].value, index: i };
        }
      }
      return null;
    },
    branchName,
  );

  if (!branchValue) throw new Error(`找不到門市：${branchName}`);

  await frame.selectOption("select", { index: branchValue.index });
  await frame.evaluate(() => {
    document
      .querySelector<HTMLSelectElement>("select")
      ?.dispatchEvent(new Event("change", { bubbles: true }));
  });

  // 等待頁面 AJAX 更新
  await page.waitForTimeout(4000);

  // 序列化 DOM 資料回傳
  const rawData = await frame.evaluate(
    (): { waitTime: string; groups: { text: string }[]; takeoutText: string } => {
      const waitTimeEl = document.getElementById("waitTime");
      const waitTime = waitTimeEl?.innerText.trim() ?? "";

      const groups: { text: string }[] = [];
      const dingBlock = document.getElementById("dingBlock");
      if (dingBlock) {
        dingBlock.querySelectorAll<HTMLElement>(".col-3").forEach((g) => {
          groups.push({ text: g.innerText.trim() });
        });
      }

      let takeoutText = "";
      const takeoutBlock = document.getElementById("takeoutQueue");
      if (takeoutBlock) {
        const spans = takeoutBlock.querySelectorAll<HTMLSpanElement>("span");
        if (spans.length > 0) takeoutText = spans[0].innerText.trim();
      }

      return { waitTime, groups, takeoutText };
    },
  );

  const { parseQueueNumbersFromGroups, parseTakeoutNumber } = await import("./parser");
  const numbers = parseQueueNumbersFromGroups(rawData.groups);
  const takeout = parseTakeoutNumber(rawData.takeoutText);
  if (takeout) numbers["外帶"] = takeout;

  return { waitTime: rawData.waitTime || "未知", numbers };
}
