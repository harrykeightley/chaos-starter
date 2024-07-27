import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig, loadEnv } from "vite";
import wasm from "vite-plugin-wasm";
import viteReact from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    define: {
      "process.env.PINO_LOG_LEVEL": JSON.stringify(
        env.PINO_LOG_LEVEL ?? "info",
      ),
    },
    plugins: [wasm(), tsconfigPaths(), viteReact()],
  };
});
