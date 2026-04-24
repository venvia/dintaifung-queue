import { describe, it, expect } from "vitest";

/**
 * Integration test: requires real network connection and Playwright browser.
 * Skipped by default (CI has no browser). Run with: INTEGRATION=1 pnpm test:integration
 */
const runIntegration = process.env.INTEGRATION === "1";

describe.skipIf(!runIntegration)("query integration", () => {
  it("queries 新生店 and returns valid QueueResult", async () => {
    const { runQuery } = await import("../../src/commands/query");
    const logs: string[] = [];
    const origLog = console.log;
    console.log = (msg: string) => logs.push(msg);

    try {
      await runQuery("新生店", { json: true, debug: false });
    } finally {
      console.log = origLog;
    }

    const output = JSON.parse(logs[0] ?? "{}");
    expect(output.branch).toBe("新生店");
    expect(output.timestamp).toBeTruthy();
    expect(typeof output.waitTime).toBe("string");
    expect(output.source).toMatch(/^(api|playwright)$/);
  }, 60_000);
});
