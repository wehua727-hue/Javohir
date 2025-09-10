import react from "@vitejs/plugin-react-swc"
import path from "path"
import { defineConfig, Plugin } from "vite"
import { createServer } from "./server"

// Render uchun tayyor Vite konfiguratsiyasi
export default defineConfig(({ mode }) => ({
  server: {
    host: "::", // barcha interfeyslarni tinglaydi
    port: 8080, // Render aniqlagan port
    allowedHosts: ["fozilov.onrender.com"], // Render domeningiz
    fs: {
      allow: ["./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa", // build natijasi shu papkaga chiqadi
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // faqat development vaqtida ishlaydi
    configureServer(server) {
      const app = createServer();
      // Express app’ni Vite serverga middleware sifatida ulaymiz
      server.middlewares.use(app);
    },
  };
}
