import type { BranchMapping, ResolvedStore } from "../types/index.js";

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
 * 根據匹配方式給出分數
 *
 * - 完全等於 = 10 分
 * - 標準化後包含目標（目標字長 >= 2）= 7 分
 * - 目標包含標準化後（標準化字長 >= 2）= 4 分
 * - 其他包含 = 1 分
 * - 不匹配 = 0 分
 */
function matchScore(normalized: string, targetBranch: string): number {
  if (normalized === targetBranch) return 10;
  if (normalized.includes(targetBranch) && targetBranch.length >= 2) return 7;
  if (targetBranch.includes(normalized) && normalized.length >= 2) return 4;
  if (normalized.includes(targetBranch) || targetBranch.includes(normalized)) return 1;
  return 0;
}

/**
 * 在門市對照表中查找目標門市
 *
 * mapping 的 key 為門市名稱（可能含斜線分隔的英文名稱），
 * value 為 storeId。
 *
 * 比對策略（有分數）：
 * 1. 精確比對 key（最高優先）
 * 2. 標準化 key 後按分數比對，分數越高越優先
 * 3. 分數 <= 1 視為匹配度太低，回傳 null
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

  // 第二階段：標準化後按分數比對
  let bestScore = 0;
  let bestMatch: ResolvedStore | null = null;

  for (const [label, storeId] of Object.entries(mapping)) {
    const normalized = normalizeBranchLabel(label);
    const score = matchScore(normalized, targetBranch);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = { storeId, matchedLabel: normalized };
    }
  }

  // 分數 <= 1 表示匹配度太低，不建議採用
  if (bestScore <= 1) return null;
  return bestMatch;
}
