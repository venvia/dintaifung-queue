/**
 * src/types/index.ts
 *
 * 匯出所有型號定義，供其他模組統一引入
 */

export * from "./queue";
export * from "./branch";
export * from "./monitor";

/** CLI 命令列選項 */
export interface CliOptions {
  /** 目標門市名稱 */
  branch?: string;
  /** 是否以 JSON 格式輸出 */
  json?: boolean;
  /** 是否顯示除錯資訊 */
  debug?: boolean;
}
