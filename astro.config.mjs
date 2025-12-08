// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  site: "https://ibedes.xyz",
  // Force full SSR in all environments so CRUD routes always execute on the server
  output: "server",
  adapter: node({
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
