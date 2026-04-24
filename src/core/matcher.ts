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
 * 比對策略由嚴到寬，依序嘗試：
 * 1. **精確比對** — 使用者輸入的字串直接作為 key 存在
 * 2. **標準化比對** — 將 mapping 中所有 value 標準化後與輸入比對
 * 3. **模糊比對** — 標準化後，檢查 value 是否「包含」輸入字串
 *
 * @param mapping - 門市對照表（key 為內部 ID，value 為門市名稱）
 * @param targetBranch - 使用者輸入的門市關鍵字
 * @returns 比對成功回傳 {@link ResolvedStore}，失敗回傳 `null`
 */
export function findStoreId(
	mapping: BranchMapping,
	targetBranch: string,
): ResolvedStore | null {
	const trimmed = targetBranch.trim();

	// --- 第一階段：精確比對 ---
	for (const [storeId, label] of Object.entries(mapping)) {
		if (label === trimmed) {
			return { storeId, matchedLabel: label };
		}
	}

	// --- 第二階段：標準化後精確比對 ---
	for (const [storeId, label] of Object.entries(mapping)) {
		if (normalizeBranchLabel(label) === trimmed) {
			return { storeId, matchedLabel: label };
		}
	}

	// --- 第三階段：模糊比對（包含） ---
	for (const [storeId, label] of Object.entries(mapping)) {
		if (normalizeBranchLabel(label).includes(trimmed)) {
			return { storeId, matchedLabel: label };
		}
	}

	return null;
}
