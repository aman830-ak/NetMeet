// client/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'; 
import { nodePolyfills } from 'vite-plugin-node-polyfills'; 
import Sitemap from 'vite-plugin-sitemap';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), 
    nodePolyfills(), 
    Sitemap({
      hostname: 'https://netmeet.live',
      dynamicRoutes: [
        '/'
      ],
      exclude: [
        '/room',      
        '/admin',     
        '/login',     
        '/test',      
        '/thank-you', 
        '/*'          
      ],
      generateRobotsTxt: false, // 🔥 Fixed Vercel build ENOENT error
    })
  ],
});