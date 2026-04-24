import { withBrowser, resolveQueueFrame, extractQueueData } from "../core/browser";
import { loadState, saveState, clearState } from "../utils/state";
import { POLL_TIERS, NOTIFY_THRESHOLDS } from "../core/constants";
import type { MonitorState, PollTier, NotificationPayload } from "../types";

/** 根據差距組數決定輪詢間隔 */
export function getInterval(gap: number): PollTier {
  for (const tier of POLL_TIERS) {
    if (gap <= tier.maxGap) return tier;
  }
  return POLL_TIERS[POLL_TIERS.length - 1];
}

/** 找出第一個尚未通知過的門檻 */
export function crossedThreshold(gap: number, notified: number[]): number | null {
  for (const th of NOTIFY_THRESHOLDS) {
    if (gap <= th && !notified.includes(th)) return th;
  }
  return null;
}

/** 用 Playwright 查詢指定門市的叫號資料 */
async function queryBranch(
  branch: string,
): Promise<{ waitTime: string; numbers: Record<string, string> }> {
  return withBrowser(async (page) => {
    const frame = await resolveQueueFrame(page);
    return extractQueueData(frame, branch, page);
  });
}

/** 建立通知酬載 */
function buildNotification(
  gap: number,
  cur: number,
  state: MonitorState,
  tier: PollTier,
): NotificationPayload {
  if (gap <= 0) {
    return {
      level: "arrived",
      emoji: "🎉",
      message: `🎉 到號了！${state.branch} ${state.category} 目前叫號 ${cur}，你的號碼 ${state.userNumber}，快回去！`,
      shouldStop: true,
    };
  }
  if (gap <= 3) {
    return { level: "urgent", emoji: "🔴", message: `🔴 剩 ${gap} 組！${state.branch} ${state.category} 叫到 ${cur}，你是 ${state.userNumber}，請立即回去！`, shouldStop: false };
  }
  if (gap <= 5) {
    return { level: "warning", emoji: "🟡", message: `🟡 快到了！差 ${gap} 組。${state.branch} ${state.category} 叫到 ${cur}，你是 ${state.userNumber}`, shouldStop: false };
  }
  if (gap <= 10) {
    return { level: "info", emoji: "🟢", message: `🟢 還有 ${gap} 組。${state.branch} ${state.category} 叫到 ${cur}（${tier.label}查詢中）`, shouldStop: false };
  }
  return { level: "update", emoji: "📋", message: `📋 還有 ${gap} 組。${state.branch} ${state.category} 叫到 ${cur}（${tier.label}查詢中）`, shouldStop: false };
}

/** 初始化監控並立即執行首次查詢 */
export async function runMonitorInit(options: { branch: string; number: number; category: string }): Promise<void> {
  const state: MonitorState = {
    branch: options.branch,
    userNumber: options.number,
    category: options.category,
    startedAt: Date.now(),
    lastQueryAt: 0,
    lastGap: null,
    lastCurrentNumber: null,
    queryCount: 0,
    notifiedThresholds: [],
    done: false,
  };
  saveState(state);

  try {
    const result = await queryBranch(state.branch);
    state.queryCount++;
    state.lastQueryAt = Date.now();

    const cur = parseInt(result.numbers[state.category] ?? "", 10);
    if (isNaN(cur)) {
      saveState(state);
      console.log(JSON.stringify({ action: "init_error", message: `⚠️ 無法取得 ${state.category} 的叫號`, numbers: result.numbers }));
      return;
    }

    const gap = state.userNumber - cur;
    state.lastCurrentNumber = cur;
    state.lastGap = gap;
    const tier = getInterval(gap);

    if (gap <= 0) {
      state.done = true;
      saveState(state);
      console.log(JSON.stringify({ action: "init_arrived", message: `🎉 你的號碼已到！目前叫號 ${cur}，你是 ${state.userNumber}`, branch: state.branch, category: state.category, currentNumber: cur, userNumber: state.userNumber, gap }));
      return;
    }

    saveState(state);
    console.log(JSON.stringify({ action: "init_ok", branch: state.branch, category: state.category, userNumber: state.userNumber, currentNumber: cur, gap, waitTime: result.waitTime, nextInterval: tier.label, message: `📋 開始監控 ${state.branch} ${state.category}\n你的號碼：${state.userNumber}\n目前叫到：${cur}（差 ${gap} 組）\n預計等候：${result.waitTime} 分鐘\n查詢頻率：${tier.label}` }));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(JSON.stringify({ action: "init_error", message: `❌ ${msg}` }));
  }
}

/** 由 cron 每分鐘呼叫，內部判斷是否達到查詢時間點 */
export async function runMonitorCheck(): Promise<void> {
  const state = loadState();
  if (!state || state.done) {
    console.log(JSON.stringify({ action: "skip", reason: state ? "done" : "no_monitor" }));
    return;
  }

  const now = Date.now();
  const tier = state.lastGap !== null ? getInterval(state.lastGap) : { intervalMs: 0, label: "", maxGap: 0 };
  const elapsed = now - state.lastQueryAt;

  if (elapsed < tier.intervalMs) {
    const remain = Math.round((tier.intervalMs - elapsed) / 1000);
    console.log(JSON.stringify({ action: "skip", reason: "wait", nextQuerySec: remain, gap: state.lastGap }));
    return;
  }

  try {
    const result = await queryBranch(state.branch);
    state.queryCount++;
    state.lastQueryAt = now;

    const cur = parseInt(result.numbers[state.category] ?? "", 10);
    if (isNaN(cur)) {
      saveState(state);
      console.log(JSON.stringify({ action: "error", message: `⚠️ 無法取得 ${state.category} 叫號`, numbers: result.numbers }));
      return;
    }

    const gap = state.userNumber - cur;
    state.lastCurrentNumber = cur;
    state.lastGap = gap;
    const newTier = getInterval(gap);

    let notification: NotificationPayload | null = null;
    const th = crossedThreshold(gap, state.notifiedThresholds);
    if (th !== null) {
      state.notifiedThresholds.push(th);
      notification = buildNotification(gap, cur, state, newTier);
      if (notification.shouldStop) state.done = true;
    }

    saveState(state);
    console.log(JSON.stringify({ action: notification ? "notify" : "checked", branch: state.branch, category: state.category, userNumber: state.userNumber, currentNumber: cur, gap, waitTime: result.waitTime, nextInterval: newTier.label, notification, queryCount: state.queryCount }));
  } catch (err) {
    saveState(state);
    const msg = err instanceof Error ? err.message : String(err);
    console.log(JSON.stringify({ action: "error", message: `❌ ${msg}`, queryCount: state.queryCount }));
  }
}

/** 顯示目前監控狀態 */
export function runMonitorStatus(): void {
  const state = loadState();
  if (!state) {
    console.log(JSON.stringify({ action: "status", active: false, message: "目前沒有監控中" }));
    return;
  }

  const mins = Math.round((Date.now() - state.startedAt) / 60_000);
  console.log(JSON.stringify({ action: "status", active: true, branch: state.branch, userNumber: state.userNumber, category: state.category, currentNumber: state.lastCurrentNumber, gap: state.lastGap, queryCount: state.queryCount, elapsedMinutes: mins, message: `監控中：${state.branch} ${state.category} #${state.userNumber}，目前叫到 ${state.lastCurrentNumber ?? "?"}（差 ${state.lastGap ?? "?"} 組），已查 ${state.queryCount} 次，${mins} 分鐘` }));
}

/** 停止監控並刪除狀態檔 */
export function runMonitorStop(): void {
  clearState();
  console.log(JSON.stringify({ action: "stopped", message: "✅ 已停止鼎泰豐叫號監控" }));
}
