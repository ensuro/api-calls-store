import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "api-calls-store": path.resolve(__dirname, "../src/package-index.js"),
      "api-calls-store/src": path.resolve(__dirname, "../src"),
      react: path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
      "react/jsx-runtime": path.resolve(__dirname, "node_modules/react/jsx-runtime"),
    },
    dedupe: ["react", "react-dom"],
  },
  server: {
    fs: { allow: [path.resolve(__dirname, "..")] },
  },
});
