import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { loadState, saveState, clearState } from "../../src/utils/state";
import type { MonitorState } from "../../src/types";

function tempPath(): string {
  return path.join(
    os.tmpdir(),
    `monitor-state-test-${Date.now()}-${Math.random().toString(36).slice(2)}.json`,
  );
}

const mockState: MonitorState = {
  branch: "新生店",
  userNumber: 1380,
  category: "1~2人",
  startedAt: 1700000000000,
  lastQueryAt: 1700000060000,
  lastGap: 10,
  lastCurrentNumber: 1370,
  queryCount: 3,
  notifiedThresholds: [20],
  done: false,
};

describe("state.ts", () => {
  let filePath: string;

  beforeEach(() => {
    filePath = tempPath();
  });

  afterEach(() => {
    try {
      fs.unlinkSync(filePath);
    } catch {
      /* ignore */
    }
  });

  describe("saveState / loadState", () => {
    it("saves and loads correctly", () => {
      saveState(mockState, filePath);
      const loaded = loadState(filePath);
      expect(loaded).toEqual(mockState);
    });

    it("overwrites previous state on second save", () => {
      saveState(mockState, filePath);
      const updated = { ...mockState, queryCount: 5, lastGap: 5 };
      saveState(updated, filePath);
      const loaded = loadState(filePath);
      expect(loaded?.queryCount).toBe(5);
      expect(loaded?.lastGap).toBe(5);
    });
  });

  describe("loadState", () => {
    it("returns null when file does not exist", () => {
      expect(loadState(filePath)).toBeNull();
    });

    it("returns null when file content is invalid JSON", () => {
      fs.writeFileSync(filePath, "invalid json content");
      expect(loadState(filePath)).toBeNull();
    });
  });

  describe("clearState", () => {
    it("deletes the state file", () => {
      saveState(mockState, filePath);
      expect(fs.existsSync(filePath)).toBe(true);
      clearState(filePath);
      expect(fs.existsSync(filePath)).toBe(false);
    });

    it("does not throw when file does not exist", () => {
      expect(() => clearState(filePath)).not.toThrow();
    });
  });
});
