import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Base "/" par défaut (Lovable preview + emcoaching.lovable.app).
  // GitHub Pages : on définit DEPLOY_TARGET=gh-pages dans le workflow
  // pour utiliser le sous-chemin du repo.
  base: process.env.DEPLOY_TARGET === 'gh-pages' ? '/emcoaching-c539e048/' : '/',
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
