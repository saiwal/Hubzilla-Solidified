import { defineConfig, type Plugin } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import solid from "vite-plugin-solid";
import path from "path";
import { readdirSync, readFileSync, writeFileSync, statSync } from "fs";
import { THEME_SLUG, ASSET_WEB_PATH, BUILD_OUT_DIR_REL } from "./theme.config.mjs";
import { SPA_CORE_PLACEHOLDER } from "@utsukta/spa-core";

// Step 2 plumbing check: this repo (theme-solidified) resolving
// @utsukta/spa-core via the npm workspace. Remove once Step 3 gives this
// package a real consumer.
console.log(`[spa-core] workspace link ok: ${SPA_CORE_PLACEHOLDER}`);

/** Virtual module `virtual:public-listing/<folder>` → sorted filename array. */
function publicDirListing(): Plugin {
  const PREFIX = "virtual:public-listing/";
  const RESOLVED = "\0" + PREFIX;
  return {
    name: "public-dir-listing",
    resolveId(id) {
      if (id.startsWith(PREFIX)) return RESOLVED + id.slice(PREFIX.length);
    },
    load(id) {
      if (!id.startsWith(RESOLVED)) return;
      const folder = id.slice(RESOLVED.length);
      const dir = path.join(__dirname, "public", folder);
      const files = readdirSync(dir)
        .filter((f) => /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(f))
        .sort();
      return `export default ${JSON.stringify(files)}`;
    },
  };
}

const FFMPEG_CORE_DIR = path.resolve(__dirname, "node_modules/@ffmpeg/core/dist/umd");

const FFMPEG_WORKER_SRC = path.resolve(__dirname, "src/ffmpeg-worker.js");

/** Serve @ffmpeg/core WASM files + our custom worker during dev at the same path used in production. */
function serveFFmpegCore(): Plugin {
  const FFMPEG_BASE = ASSET_WEB_PATH + "/ffmpeg/";
  const CORE_FILES: Record<string, string> = {
    "ffmpeg-core.js":   "text/javascript",
    "ffmpeg-core.wasm": "application/wasm",
  };
  return {
    name: "serve-ffmpeg-core",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith(FFMPEG_BASE)) return next();
        const file = req.url.slice(FFMPEG_BASE.length).split("?")[0];
        let filePath: string;
        let contentType: string;
        if (file === "ffmpeg-worker.js") {
          filePath = FFMPEG_WORKER_SRC;
          contentType = "text/javascript";
        } else if (CORE_FILES[file]) {
          filePath = path.join(FFMPEG_CORE_DIR, file);
          contentType = CORE_FILES[file];
        } else {
          return next();
        }
        const data = readFileSync(filePath);
        res.setHeader("Content-Type", contentType);
        res.setHeader("Cache-Control", "no-store");
        res.end(data);
      });
    },
  };
}
const OUT_DIR = path.resolve(__dirname, BUILD_OUT_DIR_REL);

/**
 * Post-processes the PHP files vite-plugin-static-copy just wrote (theme.php,
 * manifest.php, mod/spa.php, hooks/webpush.php) so the "solidified" literals
 * baked into function names / asset paths track THEME_SLUG instead. No-op
 * text substitution while THEME_SLUG stays "solidified" — becomes real
 * templating the day a second theme sets a different slug.
 *
 * Does NOT touch the deployed `spa-core/` folder — that's the shared
 * utsukta/spa-core package (namespace `Utsukta\SpaCore\...`), identical
 * across every theme, never slug-specific.
 */
function templateThemeSlug(): Plugin {
  const slugLower = THEME_SLUG.toLowerCase();
  const slugPascal = slugLower.charAt(0).toUpperCase() + slugLower.slice(1);
  const dirs = ["php", "mod", "hooks"];

  function walk(dir: string, out: string[]) {
    for (const entry of readdirSync(dir)) {
      const full = path.join(dir, entry);
      if (statSync(full).isDirectory()) walk(full, out);
      else if (full.endsWith(".php")) out.push(full);
    }
  }

  return {
    name: "template-theme-slug",
    closeBundle() {
      const files: string[] = [];
      for (const d of dirs) {
        const full = path.join(OUT_DIR, "..", d);
        try {
          walk(full, files);
        } catch {
          // dir not copied (e.g. partial build) — skip
        }
      }
      for (const file of files) {
        const content = readFileSync(file, "utf-8");
        const replaced = content
          .replaceAll("solidified", slugLower)
          .replaceAll("Solidified", slugPascal);
        if (replaced !== content) writeFileSync(file, replaced);
      }
    },
  };
}

export default defineConfig({
  plugins: [
    publicDirListing(),
    serveFFmpegCore(),
    solid(),
    viteStaticCopy({
      targets: [
        { src: "src/docs", dest: "../" },
        { src: "src/img", dest: "../" },
        { src: "src/mod", dest: "../" },
        { src: "src/php", dest: "../" },
        { src: "src/hooks", dest: "../" },
        { src: "src/composer.json", dest: "../" },
        // Shared Router/Handlers — deployed alongside this theme so its composer.json's
        // path repository (utsukta/spa-core) can resolve via a same-directory relative path.
        { src: "packages/spa-core/php", dest: "../", rename: "spa-core" },
        { src: `${FFMPEG_CORE_DIR}/ffmpeg-core.js`,   dest: "ffmpeg" },
        { src: `${FFMPEG_CORE_DIR}/ffmpeg-core.wasm`, dest: "ffmpeg" },
        { src: FFMPEG_WORKER_SRC,                     dest: "ffmpeg" },
      ],
    }),
    templateThemeSlug(),
  ],
  define: {
    __THEME_SLUG__: JSON.stringify(THEME_SLUG),
  },
  build: {
    outDir: OUT_DIR,
    emptyOutDir: true,
    cssCodeSplit: false,
    // .vite/manifest.json maps entry → hashed filenames; read by php/manifest.php
    manifest: true,
    // removed watch: {} — use vite build --watch from CLI
    rollupOptions: {
      output: {
        entryFileNames: "app-[hash].js",
        chunkFileNames: "app-[name]-[hash].js",
        assetFileNames: (info) =>
          info.name?.endsWith(".css") ? "app-[hash].css" : "[name][extname]",
        manualChunks(id) {
          // React + Filerobot image editor land in a single vendor chunk so
          // the browser can cache them across deploys independently of app code.
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/react-filerobot-image-editor/") ||
            id.includes("node_modules/filerobot-image-editor/")
          ) {
            return "vendor-image-editor";
          }
          if (id.includes("node_modules/plyr/")) return "vendor-plyr";
          if (id.includes("node_modules/dompurify/")) return "vendor-dompurify";
        },
      },
    },
  },
  server: {
    proxy: {
      "/spa": {
        target: "https://hz-ddev.ddev.site",
        changeOrigin: true,
        secure: false,
      },
      "/perfstats": {
        target: "https://hz-ddev.ddev.site",
        changeOrigin: true,
        secure: false,
      },
      "/cloud": {
        target: "https://hz-ddev.ddev.site",
        changeOrigin: true,
        secure: false,
      },
      "/photo": {
        target: "https://hz-ddev.ddev.site",
        changeOrigin: true,
        secure: false,
      },
      "/attach": {
        target: "https://hz-ddev.ddev.site",
        changeOrigin: true,
        secure: false,
      },
      "/wall_upload": {
        target: "https://hz-ddev.ddev.site",
        changeOrigin: true,
        secure: false,
      },
      "/wall_attach": {
        target: "https://hz-ddev.ddev.site",
        changeOrigin: true,
        secure: false,
      },
      "/item": {
        target: "https://hz-ddev.ddev.site",
        changeOrigin: true,
        secure: false,
      },
      "/follow": {
        target: "https://hz-ddev.ddev.site",
        changeOrigin: true,
        secure: false,
      },
      "/subthread": {
        target: "https://hz-ddev.ddev.site",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  base: ASSET_WEB_PATH + "/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
