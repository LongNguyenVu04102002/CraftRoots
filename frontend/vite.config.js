// CẤU HÌNH VITE
// Nơi cấu hình công cụ chạy và build Frontend nếu dự án cần tùy chỉnh.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
