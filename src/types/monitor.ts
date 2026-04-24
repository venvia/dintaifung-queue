/**
 * 叫號監控的輪詢間隔層級
 */
export interface PollTier {
  /** 最大差距（組數），當差距 ≤ maxGap 時使用此層級 */
  maxGap: number;
  /** 輪詢間隔（毫秒） */
  intervalMs: number;
  /** 層級標籤（用於顯示，如 "每 1 分鐘"） */
  label: string;
}

/** 通知等級型別 */
export type NotificationLevel = "arrived" | "urgent" | "warning" | "info" | "update";

/** 推播通知酬載 */
export interface NotificationPayload {
  /** 通知等級 */
  level: NotificationLevel;
  /** 通知 emoji */
  emoji: string;
  /** 通知訊息 */
  message: string;
  /** 是否應該停止監控 */
  shouldStop: boolean;
}

/** 叫號監控的持久化狀態 */
export interface MonitorState {
  /** 門市名稱 */
  branch: string;
  /** 使用者的號碼 */
  userNumber: number;
  /** 桌型分類（如 "1~2人"） */
  category: string;
  /** 監控開始時間（Unix timestamp） */
  startedAt: number;
  /** 上次查詢時間（Unix timestamp） */
  lastQueryAt: number;
  /** 上次的差距組數 */
  lastGap: number | null;
  /** 上次查詢到的叫號號碼 */
  lastCurrentNumber: number | null;
  /** 累計查詢次數 */
  queryCount: number;
  /** 已通知過的門檻數值 */
  notifiedThresholds: number[];
  /** 是否已完成（到號或手動停止） */
  done: boolean;
}
