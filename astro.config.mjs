// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import node from "@astrojs/node";

const isDev = process.env.NODE_ENV !== 'production';

// https://astro.build/config
export default defineConfig({
  site: "https://ibedes.xyz",
  output: isDev ? "static" : "server",
  adapter: isDev ? undefined : node({
    mode: 'standalone'
  }),
  image: {
    remotePatterns: [
      { protocol: "https", hostname: "**.susercontent.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },

  vite: {
    plugins: [/** @type {any} */ (tailwindcss())],
  },

  integrations: [react(), sitemap()],

});