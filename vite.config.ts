import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Ensure a single React copy is used (prevents hooks errors like `useEffect` of null)
    // Include jsx runtimes too, since some deps import them directly.
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
  optimizeDeps: {
    // Avoid pre-bundling React; a corrupted optimize cache can surface as
    // "Cannot read properties of null (reading 'useEffect')".
    exclude: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
}));
