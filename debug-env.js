import { execSync } from 'child_process';
try {
  const env = process.env;
  const keys = Object.keys(env).filter(k => k.includes('API') || k.includes('KEY') || k.includes('GEMINI'));
  console.log('Relevant Env Keys:', keys);
  keys.forEach(k => {
    const val = env[k];
    const isPlaceholder = ['MY_GEMINI_API_KEY', 'undefined', 'null', ''].includes(val || '');
    console.log(`${k}: ${isPlaceholder ? '[PLACEHOLDER/EMPTY]' : '[VALID VALUE]'}`);
  });
} catch (e) {
  console.error(e);
}
