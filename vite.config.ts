import fs from "fs";
import path from "path";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import react from "@vitejs/plugin-react";

function getContentType(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".js":
      return "application/javascript";
    case ".css":
      return "text/css";
    case ".json":
      return "application/json";
    case ".wasm":
      return "application/wasm";
    case ".svg":
      return "image/svg+xml";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".woff":
      return "font/woff";
    case ".woff2":
      return "font/woff2";
    default:
      return "application/octet-stream";
  }
}

const assetRoot = path.resolve(__dirname, ".output/public");

export default defineConfig(({ command }) => ({
  appType: "spa",
  plugins: [
    tailwindcss(),
    tanstackStart({
      importProtection: {
        behavior: "error",
        client: { files: ["**/server/**"], specifiers: ["server-only"] },
      },
      server: { entry: "server" },
    }),
    ...(command === "build" ? [nitro({ defaultPreset: "cloudflare-module" })] : []),
    react(),
    {
      name: "preview-serve-output-assets",
      configurePreviewServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (!req.url) return next();
          if (!req.url.startsWith("/assets/") && req.url !== "/favicon.ico" && req.url !== "/robots.txt") {
            return next();
          }
          const filePath = path.join(assetRoot, req.url.replace(/^\//, ""));
          try {
            await fs.promises.access(filePath, fs.constants.R_OK);
          } catch {
            return next();
          }
          const contentType = getContentType(filePath);
          res.statusCode = 200;
          res.setHeader("Content-Type", contentType);
          fs.createReadStream(filePath).pipe(res);
        });
      },
    },
  ],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-dom/client", "react/jsx-runtime", "react/jsx-dev-runtime"],
    ignoreOutdatedRequests: true,
  },
  ssr: {
    external: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
    noExternal: [/^@supabase\//, "zod"],
  },
}));
