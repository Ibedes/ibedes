// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";

import sitemap from "@astrojs/sitemap";

import cloudflare from "@astrojs/cloudflare";

// Use Netlify adapter only in production build
const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('dev');

// https://astro.build/config
export default defineConfig({
  site: "https://ibedes.xyz",
  output: "server",
  adapter: cloudflare({
    edgeMiddleware: false,
    imageCDN: false,
    cacheOnDemandPages: false,
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