import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import 'dotenv/config';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  
  const getValidKey = (k: string | undefined) => {
    const placeholders = ['MY_GEMINI_API_KEY', 'undefined', 'null', ''];
    return (!k || placeholders.includes(k)) ? null : k;
  };

  const allEnvKeys = Object.keys({...process.env, ...env});
  const potentialKeys = allEnvKeys.filter(k => /key|token|api|gemini|google/i.test(k));
  console.log('Vite Config: Potential API Keys found in environment:', potentialKeys);

  const geminiKey = getValidKey(env.GEMINI_API_KEY) || 
                    getValidKey(process.env.GEMINI_API_KEY) || 
                    getValidKey(env.API_KEY) || 
                    getValidKey(process.env.API_KEY) || 
                    getValidKey(env.GOOGLE_API_KEY) || 
                    getValidKey(process.env.GOOGLE_API_KEY) || 
                    '';

  console.log('Vite Config Debug:');
  console.log('- env.GEMINI_API_KEY:', env.GEMINI_API_KEY ? 'EXISTS' : 'MISSING');
  console.log('- process.env.GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'EXISTS' : 'MISSING');
  console.log('- env.API_KEY:', env.API_KEY ? 'EXISTS' : 'MISSING');
  console.log('- process.env.API_KEY:', process.env.API_KEY ? 'EXISTS' : 'MISSING');
  console.log('- env.GOOGLE_API_KEY:', env.GOOGLE_API_KEY ? 'EXISTS' : 'MISSING');
  console.log('- process.env.GOOGLE_API_KEY:', process.env.GOOGLE_API_KEY ? 'EXISTS' : 'MISSING');
  console.log('Vite Config: Resolved Gemini Key Status:', geminiKey ? 'FOUND' : 'NOT_FOUND');

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(geminiKey),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
