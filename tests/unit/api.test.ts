import { describe, it, expect } from "vitest";
import { buildMultipartBody } from "../../src/core/api";

describe("buildMultipartBody", () => {
  it("contains the correct storeId field", () => {
    const { body } = buildMultipartBody("0015");
    expect(body).toContain('name="storeId"');
    expect(body).toContain("0015");
  });

  it("boundary format starts with ----", () => {
    const { boundary } = buildMultipartBody("0001");
    expect(boundary).toMatch(/^----WebKitFormBoundary/);
  });

  it("body starts and ends with boundary", () => {
    const { boundary, body } = buildMultipartBody("0009");
    expect(body.startsWith(`--${boundary}`)).toBe(true);
    expect(body).toContain(`--${boundary}--`);
  });

  it("each call produces a different boundary", () => {
    const { boundary: b1 } = buildMultipartBody("0015");
    const { boundary: b2 } = buildMultipartBody("0015");
    expect(b1).not.toBe(b2);
  });

  it("special character storeId does not break format", () => {
    const { body } = buildMultipartBody("store_01");
    expect(body).toContain("store_01");
  });
});
