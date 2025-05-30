import { defineConfig } from "tsup";

export default defineConfig(() => ({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  external: ["ai", "zod", "agentset"],
  sourcemap: true,
  clean: true,
  dts: true,
}));
