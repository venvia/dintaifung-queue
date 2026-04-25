import { describe, it, expect } from "vitest";
import {
  parseQueueNumbersFromGroups,
  parseTakeoutNumber,
  normalizeApiResponse,
} from "../../src/core/parser.js";

describe("parseQueueNumbersFromGroups", () => {
  it("parses newline-separated groups", () => {
    const groups = [{ text: "1380\n1~2人" }, { text: "2500\n3~4人" }];
    expect(parseQueueNumbersFromGroups(groups)).toEqual({
      "1~2人": "1380",
      "3~4人": "2500",
    });
  });

  it("skips groups with number as -", () => {
    const groups = [{ text: "-\n1~2人" }, { text: "2500\n3~4人" }];
    expect(parseQueueNumbersFromGroups(groups)).toEqual({ "3~4人": "2500" });
  });

  it("parses space-separated groups (fallback)", () => {
    const groups = [{ text: "1380 1~2人" }];
    expect(parseQueueNumbersFromGroups(groups)).toEqual({ "1~2人": "1380" });
  });

  it("returns empty object for empty array", () => {
    expect(parseQueueNumbersFromGroups([])).toEqual({});
  });

  it("ignores empty text groups", () => {
    const groups = [{ text: "" }, { text: "1380\n1~2人" }];
    expect(parseQueueNumbersFromGroups(groups)).toEqual({ "1~2人": "1380" });
  });
});

describe("parseTakeoutNumber", () => {
  it("returns valid number as-is", () => {
    expect(parseTakeoutNumber("0442")).toBe("0442");
  });

  it("returns null for -", () => {
    expect(parseTakeoutNumber("-")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(parseTakeoutNumber("")).toBeNull();
  });

  it("trims whitespace before checking", () => {
    expect(parseTakeoutNumber("  0500  ")).toBe("0500");
    expect(parseTakeoutNumber("   ")).toBeNull();
  });
});

describe("normalizeApiResponse", () => {
  it("parses num_1~4 + togo_numbers fields", () => {
    const payload = [
      {
        wait_time: "30",
        num_1: "1200",
        num_2: "2300",
        num_3: "3400",
        num_4: "4500",
        togo_numbers: "0500",
      },
    ];
    const result = normalizeApiResponse(payload, "新生店");
    expect(result.branch).toBe("新生店");
    expect(result.waitTime).toBe("30");
    expect(result.numbers["1~2人"]).toBe("1200");
    expect(result.numbers["3~4人"]).toBe("2300");
    expect(result.numbers["5~6人"]).toBe("3400");
    expect(result.numbers["7人以上"]).toBe("4500");
    expect(result.numbers["外帶"]).toBe("0500");
    expect(result.source).toBe("api");
  });

  it("parses dingNumber1~4 fields (legacy API)", () => {
    const payload = [{ waitTime: "20", dingNumber1: "1111", dingNumber2: "2222" }];
    const result = normalizeApiResponse(payload, "信義店");
    expect(result.numbers["1~2人"]).toBe("1111");
    expect(result.numbers["3~4人"]).toBe("2222");
    expect(result.waitTime).toBe("20");
  });

  it("excludes - values from numbers", () => {
    const payload = [{ wait_time: "10", num_1: "-", num_2: "2000" }];
    const result = normalizeApiResponse(payload, "板橋店");
    expect(result.numbers["1~2人"]).toBeUndefined();
    expect(result.numbers["3~4人"]).toBe("2000");
  });

  it("returns default for null payload", () => {
    const result = normalizeApiResponse(null, "新生店");
    expect(result.branch).toBe("新生店");
    expect(result.waitTime).toBe("未知");
    expect(result.source).toBe("api");
  });

  it("waitTime defaults to 未知 when missing", () => {
    const payload = [{ num_1: "1000" }];
    const result = normalizeApiResponse(payload, "天母店");
    expect(result.waitTime).toBe("未知");
  });
});
