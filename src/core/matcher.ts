import type { BranchMapping, ResolvedStore } from "../types";

/**
 * 標準化門市標籤
 *
 * 將可能包含英文副標籤的門市名稱（以斜線分隔）
 * 取斜線前的第一段並去除首尾空白，以利後續比對。
 *
 * @example
 * normalizeBranchLabel("信義店/Xinyi Branch") // "信義店"
 * normalizeBranchLabel("  南港店  ")          // "南港店"
 *
 * @param label - 原始門市標籤字串
 * @returns 標準化後的門市名稱
 */
export function normalizeBranchLabel(label: string): string {
	return label.split("/")[0].trim();
}

/**
 * 在門市對照表中查找目標門市
 *
 * mapping 的 key 為門市名稱（可能含斜線分隔的英文名稱），
 * value 為 storeId。
 *
 * 比對策略由嚴到寬：
 * 1. 精確比對 key
 * 2. 標準化 key 後比對
 * 3. 標準化 key 後的包含比對（模糊）
 *
 * @param mapping - 門市對照表（key 為門市名稱，value 為 storeId）
 * @param targetBranch - 使用者輸入的門市關鍵字
 * @returns 比對成功回傳 ResolvedStore，失敗回傳 null
 */
export function findStoreId(
  mapping: BranchMapping,
  targetBranch: string,
): ResolvedStore | null {
  // 第一階段：精確比對
  if (mapping[targetBranch]) {
    return { storeId: mapping[targetBranch], matchedLabel: targetBranch };
  }

  // 第二階段：標準化後比對
  for (const [label, storeId] of Object.entries(mapping)) {
    const normalized = normalizeBranchLabel(label);
    if (normalized === targetBranch || normalized.includes(targetBranch) || targetBranch.includes(normalized)) {
      return { storeId, matchedLabel: normalized };
    }
  }

  return null;
}
