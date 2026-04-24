/**
 * 門市名稱 → 內部 storeId 對照表型別
 *
 * 允許使用者以門市名稱（如「信義店」）輸入，
 * 內部會轉換為 API 所需的 storeId。
 */
export type BranchMapping = Record<string, string>;

/**
 * 門市名稱比對結果
 *
 * 當使用者輸入的門市關鍵字成功比對到資料庫中的門市時產出。
 */
export interface ResolvedStore {
  /** 該門市的內部辨識 id */
  storeId: string;
  /** 實際比對到的門市標籤名稱 */
  matchedLabel: string;
}

/**
 * 單一門市的完整資訊
 */
export interface BranchInfo {
  /** 內部辨識 id（通常與 API storeId 一致） */
  id: string;
  /** 門市中文名稱 */
  name: string;
  /** 門市英文名稱 */
  nameEn: string;
}
