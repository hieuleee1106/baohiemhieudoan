import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // Cho phép truy cập từ các thiết bị khác trong mạng
    proxy: {
      // Khi frontend gọi đến '/api', Vite sẽ chuyển tiếp yêu cầu đó đến backend
      '/api': {
        target: 'http://localhost:3000', // Đảm bảo cổng này khớp với cổng của backend server
        changeOrigin: true, // Bắt buộc phải có để server ảo hóa origin
      },
      // Thêm proxy cho thư mục uploads để server có thể tìm thấy ảnh
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
