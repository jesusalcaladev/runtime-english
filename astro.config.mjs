// @ts-check

import preact from "@astrojs/preact";
import tailwindcss from "@tailwindcss/vite";
import { AstroPWAIntegration } from "@vite-pwa/astro";
import { defineConfig } from "astro/config";

export default defineConfig({
  integrations: [
    preact(),
    AstroPWAIntegration({
      registerType: "autoUpdate",
      injectRegister: null,
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "DevLingo — Inglés técnico para developers",
        short_name: "DevLingo",
        description: "Inglés técnico A1-B2 para developers, con ejercicios, progreso y slang 2026.",
        start_url: "/",
        display: "standalone",
        background_color: "#101010",
        theme_color: "#101010",
        lang: "es",
        icons: [
          {
            src: "/favicon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
      generateSW: {
        navigateFallback: null,
        globPatterns: ["**/*.{js,css,html,svg,png,ico,txt,woff,woff2}"],
        globIgnores: ["**/kokoro*", "**/ort*", "**/*.onnx*", "**/voices/*"],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: ({ request, url }) =>
              request.mode === "navigate" ||
              request.headers.get("accept")?.includes("text/html") ||
              url.pathname.endsWith(".html"),
            handler: "NetworkFirst",
            options: {
              cacheName: "devlingo-pages",
              networkTimeoutSeconds: 3,
            },
          },
          {
            urlPattern: ({ request, sameOrigin }) =>
              sameOrigin && ["style", "script", "image", "font"].includes(request.destination),
            handler: "CacheFirst",
            options: {
              cacheName: "devlingo-assets",
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  build: {
    format: "file",
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      dedupe: ["preact", "preact/hooks", "preact/jsx-runtime", "preact/jsx-dev-runtime"],
    },
    optimizeDeps: {
      include: ["preact", "preact/hooks", "preact/jsx-runtime", "preact/jsx-dev-runtime"],
    },
  },
});
