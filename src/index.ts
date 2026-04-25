import { Command } from "commander";
import { runQuery } from "./commands/query.js";
import { runList } from "./commands/list.js";
import { runMonitorInit, runMonitorCheck, runMonitorStatus, runMonitorStop } from "./commands/monitor.js";

const program = new Command();

program
  .name("dintaifung-queue")
  .description("鼎泰豐叫號查詢工具")
  .version("1.0.0");

program
  .command("query <branch>")
  .description("查詢指定門市的叫號狀態")
  .option("--json", "以 JSON 格式輸出", false)
  .option("--debug", "顯示除錯資訊", false)
  .action(async (branch: string, options: { json: boolean; debug: boolean }) => {
    await runQuery(branch, options);
  });

program
  .command("list")
  .description("列出所有可用門市")
  .option("--json", "以 JSON 格式輸出", false)
  .action(async (options: { json: boolean }) => {
    await runList(options);
  });

const monitor = program.command("monitor").description("管理叫號監控");

monitor
  .command("init")
  .description("初始化並啟動監控")
  .requiredOption("--branch <name>", "門市名稱")
  .requiredOption("--number <num>", "你的號碼", (v) => parseInt(v, 10))
  .requiredOption("--category <cat>", "桌型分類（如 1~2人）")
  .action(async (options: { branch: string; number: number; category: string }) => {
    await runMonitorInit(options);
  });

monitor
  .command("check")
  .description("檢查叫號進度（由 cron 每分鐘呼叫）")
  .action(async () => {
    await runMonitorCheck();
  });

monitor
  .command("status")
  .description("查看目前監控狀態")
  .action(() => {
    runMonitorStatus();
  });

monitor
  .command("stop")
  .description("停止監控")
  .action(() => {
    runMonitorStop();
  });

program.parse(process.argv);
