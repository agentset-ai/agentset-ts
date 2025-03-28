import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  outExtension({ format, options }) {
    const ext = format === "esm" ? "mjs" : "js";
    const finalFormat = format === "cjs" || format === "esm" ? "" : format;

    const outputExtension = options.minify
      ? `${finalFormat}.min.${ext}`
      : `${finalFormat}.${ext}`;

    return {
      js: outputExtension.startsWith(".")
        ? outputExtension
        : `.${outputExtension}`,
    };
  },
  minify: !options.watch,
  treeshake: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: true,
}));
