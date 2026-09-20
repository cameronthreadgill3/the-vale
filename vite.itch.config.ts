import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/** Static HTML5 pack for itch.io — does not touch the live preview server. */
export default defineConfig({
  base: "./",
  publicDir: "public",
  plugins: [tailwindcss(), viteReact()],
  resolve: { tsconfigPaths: true },
  build: {
    outDir: "dist-itch",
    emptyOutDir: true,
    assetsDir: "assets",
    rollupOptions: {
      input: "itch.html",
    },
  },
});
