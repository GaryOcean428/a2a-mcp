import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import fs from "fs";

// Custom plugin to inject production CSS during build
const injectProductionCss = () => {
  return {
    name: "inject-production-css",
    transformIndexHtml: {
      enforce: "post",
      transform(html, ctx) {
        // Only modify in production build
        if (ctx.bundle && process.env.NODE_ENV === "production") {
          // Read the production CSS content
          const productionCssPath = path.resolve(
            process.cwd(),
            "client/src/production.css",
          );

          if (fs.existsSync(productionCssPath)) {
            const cssContent = fs.readFileSync(productionCssPath, "utf-8");

            // Inject the CSS content into the HTML
            return html.replace(
              "</head>",
              `<style id="production-critical-css">
                ${cssContent}
              </style>
              <!-- Preload critical CSS -->
              <link rel="preload" href="/assets/index.css" as="style">
              </head>`,
            );
          }
        }
        return html;
      },
    },
    generateBundle(options, bundle) {
      // Ensure production.css is included in the build
      if (process.env.NODE_ENV === "production") {
        const productionCssPath = path.resolve(
          process.cwd(),
          "client/src/production.css",
        );

        if (fs.existsSync(productionCssPath)) {
          const cssContent = fs.readFileSync(productionCssPath, "utf-8");
          this.emitFile({
            type: "asset",
            fileName: "assets/production.css",
            source: cssContent,
          });
        }
      }
    },
  };
};

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    injectProductionCss(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    cssCodeSplit: false, // Prevent CSS code splitting to ensure all styles are in one file
    rollupOptions: {
      output: {
        manualChunks: undefined, // Disable manual chunks
        assetFileNames: (assetInfo) => {
          // Make sure CSS files keep a predictable name
          if (assetInfo.name.endsWith(".css")) {
            return "assets/[name][extname]";
          }
          return "assets/[name]-[hash][extname]";
        },
      },
    },
  },
  css: {
    postcss: {
      plugins: [
        // This ensures the CSS purging is not too aggressive
        require("tailwindcss/nesting"),
        require("tailwindcss"),
        require("autoprefixer"),
      ],
    },
  },
});
