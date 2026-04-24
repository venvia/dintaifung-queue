import type { PollTier } from "../types/monitor.js";

/**
 * 鼎泰豐叫號頁面目標 URL
 *
 * 導向官方排隊查詢頁面，`type=3` 表示 Web 端叫號服務。
 */
export const TARGET_URL = "https://www.dintaifung.tw/Queue/?type=3";

/**
 * 叫號 API 伺服器主機位址
 *
 * 鼎泰豐內部叫號 API 的 IP 位址。
 */
export const API_HOST = "60.251.113.234";

/**
 * 叫號 API 端點路徑
 *
 * 搭配 API_HOST 組合成完整的 API 請求 URL。
 */
export const API_PATH = "/Queue/Home/WebApiTest";

/**
 * 模擬 Chrome 瀏覽器的 User-Agent
 *
 * 用於 API 請求標頭，避免被伺服器以 bot 擋下。
 */
export const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

/**
 * 輪詢間隔分級設定
 *
 * 根據「使用者號碼」與「當前叫號」之間的差距，動態調整查詢頻率：
 * - 差距 ≤ 5  → 每 1 分鐘查詢（最緊急）
 * - 差距 ≤ 10 → 每 2 分鐘查詢
 * - 差距 ≤ 20 → 每 3 分鐘查詢
 * - 其餘      → 每 5 分鐘查詢（最悠閒）
 */
export const POLL_TIERS: PollTier[] = [
  { maxGap: 5, intervalMs: 60_000, label: "每 1 分鐘" },
  { maxGap: 10, intervalMs: 120_000, label: "每 2 分鐘" },
  { maxGap: 20, intervalMs: 180_000, label: "每 3 分鐘" },
  { maxGap: Infinity, intervalMs: 300_000, label: "每 5 分鐘" },
];

/**
 * 通知門檻數值（由大到小排列）
 *
 * 當使用者號碼與當前叫號的差距達到這些數值時，會觸發對應層級的通知。
 * 例如差距降到 10 時發送 warning，降到 0 時表示已輪到並發送 arrived。
 */
export const NOTIFY_THRESHOLDS = [20, 10, 5, 3, 1, 0] as const;
