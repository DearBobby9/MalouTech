import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const base = process.env.GITHUB_PAGES === "true" ? "/MalouTech/" : "/";
const htmlInput = {
  main: fileURLToPath(new URL("./index.html", import.meta.url)),
  papers: fileURLToPath(new URL("./papers.html", import.meta.url)),
};

export default defineConfig({
  base,
  plugins: [react()],
  build: {
    rollupOptions: {
      input: htmlInput,
    },
  },
});
