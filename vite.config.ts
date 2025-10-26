import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig, Plugin } from "vite";

console.log("Vite config loaded");
console.log("NODE_ENV:", process.env.NODE_ENV);

let createServerFunc: (() => Promise<any>) | undefined;

if (process.env.NODE_ENV === "development") {
  try {
    console.log("Importing server for dev...");
    createServerFunc = (await import("./server")).createServer;
    console.log("Server imported successfully");
  } catch (err) {
    console.error("Failed to import server:", err);
  }
}

export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8081,
    fs: {
      allow: [
        path.resolve(__dirname, "./client"),
        path.resolve(__dirname, "./shared"),
        path.resolve(__dirname, "."),
      ],
      deny: [".env", ".env.", ".{crt,pem}", "/.git/", "server/"],
    },
  },
  build: {
    outDir: "dist/spa",
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
    apply: "serve",
    async configureServer(server) {
      if (!createServerFunc) {
        console.warn("createServerFunc not available, skipping Express middleware");
        return;
      }
      try {
        const app = await createServerFunc();
        console.log("Express server attached to Vite dev server");
        server.middlewares.use(app as any);
      } catch (err) {
        console.error("Error attaching Express server:", err);
      }
    },
  };
}
