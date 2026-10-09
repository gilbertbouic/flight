import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/** Static site for GitHub Pages. Relative URLs so it works at /flight/ and at the custom domain. */
export default defineConfig({
  base: "./",
  publicDir: "public",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    outDir: "docs",
    emptyOutDir: true,
    rollupOptions: {
      input: fileURLToPath(new URL("./browser.html", import.meta.url)),
    },
  },
});
