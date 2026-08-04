// client/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills'; // <-- Import the polyfill plugin

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills(), // <-- Add it here so simple-peer can run smoothly in the browser
  ],
});