/**
 * 叫號資料來源型別
 *
 * - "api"：從官方 API 端點直接取得叫號資料
 * - "playwright"：透過 Playwright 模擬瀏覽器抓取網頁上的叫號資訊
 */
export type QueueSource = "api" | "playwright";

/**
 * 叫號號碼紀錄型別
 *
 * 以「類別標籤」為鍵（例如 `"dumpling"`、`"noodle"`），
 * 對應當前叫到的號碼字串。
 */
export type QueueNumbers = Record<string, string>;

/**
 * 單一門市叫號查詢結果
 */
export interface QueueResult {
  /** 門市辨識碼（內部 id） */
  branch: string;
  /** 資料擷取時間（ISO 8601 字串） */
  timestamp: string;
  /** 預估等候時間（例如 `"~30 分鐘"` 或 `"未知"`） */
  waitTime: string;
  /** 各餐點類別當前叫號號碼 */
  numbers: QueueNumbers;
  /** 資料取得來源 */
  source: QueueSource;
}
