// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";

import sitemap from "@astrojs/sitemap";

import node from "@astrojs/node";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  site: "https://ibedes.xyz",
  output: "server",
  adapter: cloudflare({
    platformProxy: {
      enabled: true
    }
  }),
  image: {
    remotePatterns: [
      { protocol: "https", hostname: "**.susercontent.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [react(), sitemap()],
});
