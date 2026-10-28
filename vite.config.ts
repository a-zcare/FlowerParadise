import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/FlowerParadise/",
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes("/node_modules/react") ||
            id.includes("/node_modules/scheduler")
          )
            return "react-vendor";
          if (
            id.includes("/node_modules/motion") ||
            id.includes("/node_modules/framer-motion")
          )
            return "motion-vendor";
        },
      },
    },
  },
  server: { allowedHosts: ["terminal.local"] },
});
