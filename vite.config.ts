import vinext from "vinext";
import { defineConfig } from "vite";
import { localAuth } from "./build/local-auth";

export default defineConfig(async () => {
  process.env.CLOUDFLARE_CF_FETCH_ENABLED ??= "false";
  process.env.WRANGLER_SEND_METRICS ??= "false";
  const { cloudflare } = await import("@cloudflare/vite-plugin");
  return {
    server: { host: "127.0.0.1", port: 5173, strictPort: true },
    plugins: [
      vinext(),
      localAuth(),
      cloudflare({
        configPath: "./wrangler.jsonc",
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        inspectorPort: false,
      }),
    ],
  };
});
