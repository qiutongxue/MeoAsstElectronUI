import { builtinModules } from "module";
import { defineConfig } from "vite";
import pkg from "../../package.json";
import path from "path";

export default defineConfig({
  root: __dirname,
  base: "./",
  resolve: {
    alias: {
      "@main": __dirname,
      "@common": path.join(__dirname, "../common"),
    },
  },
  build: {
    outDir: "../../dist/main",
    lib: {
      entry: "index.ts",
      formats: ["cjs"],
      fileName: () => "[name].cjs",
    },
    minify: process.env./* from mode option */ NODE_ENV === "production",
    sourcemap: true,
    emptyOutDir: true,
    rollupOptions: {
      external: [
        "electron",
        ...builtinModules,
        ...Object.keys(pkg.dependencies || {}),
      ],
    },
  },
});
