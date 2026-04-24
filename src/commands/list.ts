import { withBrowser, resolveQueueFrame } from "../core/browser";
import { normalizeBranchLabel } from "../core/matcher";
import { exitWithError } from "../utils/cli";

/** 執行 list 指令：列出所有可用門市 */
export async function runList(options: { json: boolean }): Promise<void> {
  const { json } = options;

  try {
    const mapping = await withBrowser(async (page) => {
      const frame = await resolveQueueFrame(page);
      return (await import("../core/browser")).extractBranchMapping(frame);
    });

    const branches = Object.keys(mapping).map((label) => ({
      label,
      name: normalizeBranchLabel(label),
      storeId: mapping[label],
    }));

    if (json) {
      console.log(JSON.stringify(branches, null, 2));
    } else {
      console.log("\n📍 鼎泰豐可用門市：\n");
      for (const { name, storeId } of branches) {
        console.log(`  ${name.padEnd(10)} (storeId: ${storeId})`);
      }
    }
  } catch (error) {
    exitWithError(error, json);
  }
}
