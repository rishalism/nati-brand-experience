import { defineConfig } from "tsup";

// Dual output: ESM (`.js`) for the Vite frontend, CJS (`.cjs`) for the NestJS
// backend. Types emitted once. Keeps a single source of truth consumable by
// both runtimes without either having to change its module system.
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  outExtension({ format }) {
    return { js: format === "cjs" ? ".cjs" : ".js" };
  },
});
