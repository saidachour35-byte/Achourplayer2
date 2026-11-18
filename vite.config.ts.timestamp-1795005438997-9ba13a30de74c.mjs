// vite.config.ts
import tailwindcss from "file:///app/applet/node_modules/@tailwindcss/vite/dist/index.mjs";
import react from "file:///app/applet/node_modules/@vitejs/plugin-react/dist/index.js";
import path from "path";
import { defineConfig } from "file:///app/applet/node_modules/vite/dist/node/index.js";
var __vite_injected_original_dirname = "/app/applet";
var vite_config_default = defineConfig(() => {
  return {
    root: __vite_injected_original_dirname,
    base: "./",
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, ".")
      }
    },
    build: {
      outDir: "dist",
      emptyOutDir: true,
      rollupOptions: {
        input: path.resolve(__vite_injected_original_dirname, "index.html")
      }
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== "true",
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === "true" ? null : {}
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvYXBwL2FwcGxldFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2FwcC9hcHBsZXQvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2FwcC9hcHBsZXQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgdGFpbHdpbmRjc3MgZnJvbSAnQHRhaWx3aW5kY3NzL3ZpdGUnO1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0JztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtkZWZpbmVDb25maWd9IGZyb20gJ3ZpdGUnO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKCkgPT4ge1xuICByZXR1cm4ge1xuICAgIHJvb3Q6IF9fZGlybmFtZSxcbiAgICBiYXNlOiAnLi8nLFxuICAgIHBsdWdpbnM6IFtyZWFjdCgpLCB0YWlsd2luZGNzcygpXSxcbiAgICByZXNvbHZlOiB7XG4gICAgICBhbGlhczoge1xuICAgICAgICAnQCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuJyksXG4gICAgICB9LFxuICAgIH0sXG4gICAgYnVpbGQ6IHtcbiAgICAgIG91dERpcjogJ2Rpc3QnLFxuICAgICAgZW1wdHlPdXREaXI6IHRydWUsXG4gICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgIGlucHV0OiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnaW5kZXguaHRtbCcpLFxuICAgICAgfSxcbiAgICB9LFxuICAgIHNlcnZlcjoge1xuICAgICAgLy8gSE1SIGlzIGRpc2FibGVkIGluIEFJIFN0dWRpbyB2aWEgRElTQUJMRV9ITVIgZW52IHZhci5cbiAgICAgIC8vIERvIG5vdCBtb2RpZnlcdTIwMTRmaWxlIHdhdGNoaW5nIGlzIGRpc2FibGVkIHRvIHByZXZlbnQgZmxpY2tlcmluZyBkdXJpbmcgYWdlbnQgZWRpdHMuXG4gICAgICBobXI6IHByb2Nlc3MuZW52LkRJU0FCTEVfSE1SICE9PSAndHJ1ZScsXG4gICAgICAvLyBEaXNhYmxlIGZpbGUgd2F0Y2hpbmcgd2hlbiBESVNBQkxFX0hNUiBpcyB0cnVlIHRvIHNhdmUgQ1BVIGR1cmluZyBhZ2VudCBlZGl0cy5cbiAgICAgIHdhdGNoOiBwcm9jZXNzLmVudi5ESVNBQkxFX0hNUiA9PT0gJ3RydWUnID8gbnVsbCA6IHt9LFxuICAgIH0sXG4gIH07XG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBbU4sT0FBTyxpQkFBaUI7QUFDM08sT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixTQUFRLG9CQUFtQjtBQUgzQixJQUFNLG1DQUFtQztBQUt6QyxJQUFPLHNCQUFRLGFBQWEsTUFBTTtBQUNoQyxTQUFPO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixTQUFTLENBQUMsTUFBTSxHQUFHLFlBQVksQ0FBQztBQUFBLElBQ2hDLFNBQVM7QUFBQSxNQUNQLE9BQU87QUFBQSxRQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLEdBQUc7QUFBQSxNQUNsQztBQUFBLElBQ0Y7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNMLFFBQVE7QUFBQSxNQUNSLGFBQWE7QUFBQSxNQUNiLGVBQWU7QUFBQSxRQUNiLE9BQU8sS0FBSyxRQUFRLGtDQUFXLFlBQVk7QUFBQSxNQUM3QztBQUFBLElBQ0Y7QUFBQSxJQUNBLFFBQVE7QUFBQTtBQUFBO0FBQUEsTUFHTixLQUFLLFFBQVEsSUFBSSxnQkFBZ0I7QUFBQTtBQUFBLE1BRWpDLE9BQU8sUUFBUSxJQUFJLGdCQUFnQixTQUFTLE9BQU8sQ0FBQztBQUFBLElBQ3REO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
