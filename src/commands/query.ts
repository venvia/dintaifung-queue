import { withBrowser, resolveQueueFrame, extractQueueData } from "../core/browser";
import { queryApi } from "../core/api";
import { normalizeApiResponse } from "../core/parser";
import { findStoreId, normalizeBranchLabel } from "../core/matcher";
import { log, printResult, exitWithError } from "../utils/cli";
import type { QueueResult } from "../types";

/** 用 Playwright 直接解析 DOM 取得叫號結果 */
async function queryViaPlaywright(branchName: string, debug: boolean): Promise<QueueResult> {
  return withBrowser(async (page) => {
    const frame = await resolveQueueFrame(page, debug);
    const { waitTime, numbers } = await extractQueueData(frame, branchName, page);
    return {
      branch: branchName,
      timestamp: new Date().toISOString(),
      waitTime,
      numbers,
      source: "playwright",
    };
  });
}

/** 執行 query 指令：先用 API，失敗時 fallback 到 Playwright */
export async function runQuery(
  branch: string,
  options: { json: boolean; debug: boolean },
): Promise<void> {
  const { json, debug } = options;

  try {
    log("🚀 啟動鼎泰豐叫號 Hybrid 查詢...", json);

    // Step 1：取得門市對照表
    const mapping = await withBrowser(async (page) => {
      const frame = await resolveQueueFrame(page, debug);
      return (await import("../core/browser")).extractBranchMapping(frame);
    });

    const branches = Object.keys(mapping);
    const resolved = findStoreId(mapping, branch);

    if (!resolved) {
      const available = branches.map(normalizeBranchLabel).join("、");
      throw new Error(`找不到門市：${branch}。可用門市：${available}`);
    }

    const { storeId, matchedLabel } = resolved;
    log(`📍 目標門市：${branch}`, json);
    if (matchedLabel !== branch) log(`🔁 匹配門市：${matchedLabel}`, json);
    log(`🔍 對應 storeId：${storeId}`, json);

    // Step 2：嘗試 API
    try {
      const payload = await queryApi(storeId);
      if (debug) log(`DEBUG api payload=${JSON.stringify(payload)}`, json);
      const result = normalizeApiResponse(payload, branch);
      printResult(result, json);
    } catch (apiError) {
      const msg = apiError instanceof Error ? apiError.message : String(apiError);
      log(`⚠️ API 查詢失敗，改用 Playwright fallback：${msg}`, json);
      const result = await queryViaPlaywright(branch, debug);
      printResult(result, json);
    }
  } catch (error) {
    exitWithError(error, json);
  }
}
