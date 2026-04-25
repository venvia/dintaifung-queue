import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import type { MonitorState } from "../types/index.js";

/** 預設狀態檔路徑（~/.local/share/dintaifung-queue/） */
const DATA_DIR = path.join(os.homedir(), ".local", "share", "dintaifung-queue");
const DEFAULT_STATE_FILE = path.join(DATA_DIR, "monitor-state.json");

/** 確保資料目錄存在 */
function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

/** 載入監控狀態，檔案不存在時回傳 null */
export function loadState(filePath = DEFAULT_STATE_FILE): MonitorState | null {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as MonitorState;
  } catch {
    return null;
  }
}

/** 儲存監控狀態到 JSON 檔（atomic write，防多行程競態） */
export function saveState(state: MonitorState, filePath = DEFAULT_STATE_FILE): void {
  ensureDataDir();

  const tmpFile = `${filePath}.${process.pid}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(state, null, 2), "utf-8");
  fs.renameSync(tmpFile, filePath);
}

/** 刪除狀態檔（停止監控） */
export function clearState(filePath = DEFAULT_STATE_FILE): void {
  try {
    fs.unlinkSync(filePath);
  } catch {
    /* 檔案不存在時靜默忽略 */
  }
}
