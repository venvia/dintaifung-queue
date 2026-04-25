import type { QueueResult } from "../types/index.js";

/** 僅在非 JSON 模式下輸出訊息 */
export function log(message = "", isJson = false): void {
  if (!isJson) console.log(message);
}

/** 格式化輸出叫號結果 */
export function printResult(result: QueueResult, isJson: boolean): void {
  if (isJson) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log("\n✅ 抓取完成！");
  console.log(`   來源：${result.source === "api" ? "API" : "Playwright fallback"}`);
  console.log("\n📊 叫號狀態：");
  console.log(`  門市：${result.branch}`);
  console.log(`  時間：${new Date(result.timestamp).toLocaleString("zh-TW")}`);
  console.log(`  預計等候：${result.waitTime}`);

  if (Object.keys(result.numbers).length > 0) {
    console.log("\n  號碼：");
    for (const [type, number] of Object.entries(result.numbers)) {
      console.log(`    ${type}: ${number}`);
    }
  } else {
    console.log("\n  ⚠️ 未能抓取到號碼");
  }
}

/** 輸出錯誤並以非零碼退出 */
export function exitWithError(error: unknown, isJson: boolean): never {
  const message = error instanceof Error ? error.message : String(error);
  if (isJson) {
    console.error(JSON.stringify({ error: message }));
  } else {
    console.error(`❌ 發生錯誤：${message}`);
  }
  process.exit(1);
}
