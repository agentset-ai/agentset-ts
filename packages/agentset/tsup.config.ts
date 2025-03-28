import { defineConfig } from "tsup";

export default defineConfig(() => ({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  outExtension({ format }) {
    const ext = format === "esm" ? "mjs" : "js";
    const finalFormat = format === "cjs" || format === "esm" ? "" : format;

    const outputExtension = `${finalFormat}.${ext}`;

    return {
      js: outputExtension.startsWith(".")
        ? outputExtension
        : `.${outputExtension}`,
    };
  },
  treeshake: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: true,
}));
