/**
 * src/core/parser.ts
 *
 * DOM 與 API 回應解析器
 *
 * 負責將各種來源的叫號資料（Playwright 抓取的 DOM 文字、
 * 官方 API JSON 回應）統一轉換為標準化的 QueueResult 格式。
 */

import type { QueueResult, QueueNumbers } from "../types/index.js";

/**
 * 叫號群組文字區塊
 *
 * 從 DOM 上抓到的單一 `<div>` 或 `<span>` 區塊所攜帶的文字。
 * 一個群組通常對應一個餐點類別（例如「小籠包」）下的多個號碼。
 */
export interface QueueGroupText {
  /** 該群組內的原始文字（可能含換行、空格分隔的號碼） */
  text: string;
}

/**
 * 人數標籤陣列，對應 API 欄位編號 1 ~ 4
 */
const PERSON_LABELS = ["1~2人", "3~4人", "5~6人", "7人以上"] as const;

/**
 * 從 DOM col-3 群組文字中解析叫號號碼
 *
 * 每個 QueueGroupText 的 text 欄位通常為「號碼\n人數描述」格式，
 * 或以空格分隔（「號碼 人數描述」）。
 *
 * - 空字串、僅空白、`"-"` 的項目會被跳過
 *
 * @param groups 從 DOM 提取的叫號群組文字陣列
 * @returns 人數標籤 → 叫號號碼 的對應表
 */
export function parseQueueNumbersFromGroups(groups: QueueGroupText[]): QueueNumbers {
  const result: QueueNumbers = {};

  for (const group of groups) {
    const text = group.text.trim();
    const newlineParts = text.split('\n');

    if (newlineParts.length >= 2) {
      const number = newlineParts[0].trim();
      const label = newlineParts[1].trim();
      if (number && number !== '-') {
        result[label] = number;
      }
      continue;
    }

    // Fallback: 空格分隔
    const spaceParts = text.split(' ');
    if (spaceParts.length >= 2) {
      const number = spaceParts[0].trim();
      const label = spaceParts.slice(1).join(' ').trim();
      if (number && number !== '-') {
        result[label] = number;
      }
    }
  }

  return result;
}

/**
 * 解析外帶號碼
 *
 * 從 DOM 上提取的外帶號碼文字，若為空白或 `"-"` 則視為「無資料」。
 *
 * @param text 原始外帶號碼文字
 * @returns 有效號碼字串，或 null
 */
export function parseTakeoutNumber(text: string): string | null {
  const trimmed = text.trim();
  if (trimmed === "" || trimmed === "-") {
    return null;
  }
  return trimmed;
}

/**
 * 將 API 回應物件統一映射為 QueueResult
 *
 * 支援多種欄位命名風格：
 * - 叫號號碼：`dingNumber1` ~ `dingNumber4`（官方 API）或 `num_1` ~ `num_4`（備用）
 * - 等候時間：`waitTime` 或 `wait_time`
 * - 外帶號碼：`takeoutNumber` 或 `togo_numbers`
 *
 * 號碼會映射至人數標籤：`"1~2人"`、`"3~4人"`、`"5~6人"`、`"7人以上"`
 *
 * @param payload 原始 API 回應物件
 * @param branchName 門市名稱，用於構建 branch 欄位
 * @returns 標準化的 QueueResult
 */
export function normalizeApiResponse(payload: unknown, branchName: string): QueueResult {
  // 若 payload 是陣列，取第一個元素
  const data = Array.isArray(payload)
    ? payload[0]
    : typeof payload === "object" && payload !== null
      ? (payload as Record<string, unknown>)
      : null;

  if (!data || typeof data !== "object") {
    return {
      branch: branchName,
      timestamp: new Date().toISOString(),
      waitTime: "未知",
      numbers: {},
      source: "api",
    };
  }

  // 叫號號碼：支援 dingNumber1~4 與 num_1~4 兩種命名風格
  const numbers: QueueNumbers = {};

  for (let i = 0; i < PERSON_LABELS.length; i++) {
    const keyCamel = `dingNumber${i + 1}`;
    const keySnake = `num_${i + 1}`;
    const rawValue = data[keyCamel] ?? data[keySnake];

    if (rawValue !== undefined && rawValue !== null && rawValue !== "-") {
      const strValue = String(rawValue).trim();
      if (strValue !== "" && strValue !== "-") {
        numbers[PERSON_LABELS[i]] = strValue;
      }
    }
  }

  // 等候時間：支援 waitTime 與 wait_time
  const rawWaitTime = data["waitTime"] ?? data["wait_time"];
  const waitTime: string =
    rawWaitTime !== undefined && rawWaitTime !== null && rawWaitTime !== "-"
      ? String(rawWaitTime).trim() || "未知"
      : "未知";

  // 外帶號碼：支援 takeoutNumber 與 togo_numbers
  const rawTakeout = data["takeoutNumber"] ?? data["togo_numbers"];
  if (rawTakeout !== undefined && rawTakeout !== null && rawTakeout !== "-") {
    const takeoutStr = String(rawTakeout).trim();
    if (takeoutStr && takeoutStr !== "-") {
      numbers["外帶"] = takeoutStr;
    }
  }

  return {
    branch: branchName,
    timestamp: new Date().toISOString(),
    waitTime,
    numbers,
    source: "api",
  };
}
