import fs from "node:fs";
import path from "node:path";
import type { MonitorState } from "../types";

/** 預設狀態檔路徑（專案根目錄） */
const DEFAULT_STATE_FILE = path.resolve(__dirname, "..", "..", ".monitor-state.json");

/** 載入監控狀態，檔案不存在時回傳 null */
export function loadState(filePath = DEFAULT_STATE_FILE): MonitorState | null {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as MonitorState;
  } catch {
    return null;
  }
}

/** 儲存監控狀態到 JSON 檔 */
export function saveState(state: MonitorState, filePath = DEFAULT_STATE_FILE): void {
  fs.writeFileSync(filePath, JSON.stringify(state, null, 2), "utf-8");
}

/** 刪除狀態檔（停止監控） */
export function clearState(filePath = DEFAULT_STATE_FILE): void {
  try {
    fs.unlinkSync(filePath);
  } catch {
    /* 檔案不存在時靜默忽略 */
  }
}
