// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";
import compression from "vite-plugin-compression";
import metaMapPlugin from "vite-plugin-react-meta-map";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react({
      fastRefresh: true,
      jsxRuntime: "automatic",
    }),
    tailwindcss(),
    metaMapPlugin({
      pageMetaMapFilePath: "./src/seo/pageMetaMap.js",
      pageTemplateFilePath: "./src/seo/PageTemplate.jsx",
    }),
    compression({
      algorithm: "gzip",
      ext: ".gz",
    }),
    compression({
      algorithm: "brotliCompress",
      ext: ".br",
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log", "console.info", "console.debug", "console.trace"],
        arrows: true,
        collapse_vars: true,
        conditionals: true,
        dead_code: true,
      },
      output: {
        comments: false,
        ecma: 2020,
      },
    },
    cssMinify: true,
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        assetFileNames: "assets/[name].[hash].[ext]",
        chunkFileNames: "assets/[name].[hash].js",
        entryFileNames: "assets/[name].[hash].js",
        manualChunks: {
          vendor: [
            "react",
            "react-dom",
            "react-router-dom",
            "axios",
            "redux",
            "react-redux",
          ],
          ui: ["framer-motion", "react-icons", "sonner"],
          utils: ["lodash", "date-fns"],
        },
      },
    },
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/node_modules/],
    },
    reportCompressedSize: false,
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "axios"],
    esbuildOptions: {
      target: "es2020",
    },
  },
});
