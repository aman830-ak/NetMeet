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
    Sitemap({ hostname: 'https://netmeet.vercel.app' }) // Replace with your actual Vercel domain
  ],
});