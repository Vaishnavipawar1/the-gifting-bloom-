import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  plugins: [
    nitro({
      serverDir: "./server",
      defaultPreset: command === "serve" ? "node-server" : "cloudflare-module",
    }),
    react(),
    tailwindcss(),
  ],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  environments: { client: { build: { rollupOptions: { input: "./src/entry-client.tsx" } } } },
}));
