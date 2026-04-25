#!/usr/bin/env node
import { spawn } from "child_process";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcIndex = resolve(__dirname, "..", "src", "index.ts");

const child = spawn("node", ["--import", "tsx", srcIndex, ...process.argv.slice(2)], {
  stdio: "inherit",
});

child.on("close", (code) => process.exit(code || 0));
