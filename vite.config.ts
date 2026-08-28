// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import fs from "fs";
import path from "path";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

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

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    appType: "spa",
    ssr: {
      external: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
      noExternal: [/^@supabase\//, "zod"],
    },
    resolve: {
      tsconfigPaths: true,
    },
    plugins: [
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
  },
});
