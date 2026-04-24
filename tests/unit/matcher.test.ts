import { describe, it, expect } from "vitest";
import { normalizeBranchLabel, findStoreId } from "../../src/core/matcher";

describe("normalizeBranchLabel", () => {
  it("single name returns as-is", () => {
    expect(normalizeBranchLabel("新生店")).toBe("新生店");
  });

  it("slash-separated takes first segment", () => {
    expect(normalizeBranchLabel("信義店/Xinyi Branch")).toBe("信義店");
  });

  it("trims whitespace", () => {
    expect(normalizeBranchLabel("  板橋店  ")).toBe("板橋店");
  });

  it("multiple slashes take first segment only", () => {
    expect(normalizeBranchLabel("101店/101 Branch/A11")).toBe("101店");
  });

  it("empty string returns empty string", () => {
    expect(normalizeBranchLabel("")).toBe("");
  });
});

describe("findStoreId", () => {
  const mapping = {
    "新生店": "0015",
    "信義店/Xinyi Branch": "0001",
    "板橋店": "0009",
    "天母店": "0005",
  };

  it("exact match", () => {
    const result = findStoreId(mapping, "新生店");
    expect(result).toEqual({ storeId: "0015", matchedLabel: "新生店" });
  });

  it("normalized match for slash-separated label", () => {
    const result = findStoreId(mapping, "信義店");
    expect(result).not.toBeNull();
    expect(result?.storeId).toBe("0001");
    expect(result?.matchedLabel).toBe("信義店");
  });

  it("substring match (target contains label)", () => {
    const result = findStoreId(mapping, "板橋");
    expect(result).not.toBeNull();
    expect(result?.storeId).toBe("0009");
  });

  it("reverse substring match (label contains target)", () => {
    const result = findStoreId(mapping, "天母店旗艦版");
    expect(result).not.toBeNull();
    expect(result?.storeId).toBe("0005");
  });

  it("returns null for unknown branch", () => {
    expect(findStoreId(mapping, "不存在的店")).toBeNull();
  });

  it("returns null for empty mapping", () => {
    expect(findStoreId({}, "新生店")).toBeNull();
  });
});
