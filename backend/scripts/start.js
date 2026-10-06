import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const quiet = (cmd, cwd) => {
  try { execSync(cmd, { cwd, stdio: 'inherit', shell: true }); return true; }
  catch { return false; }
};

console.log('[1/2] Building frontend...');
quiet('npm run build', path.join(root, 'frontend'));

console.log('[2/2] Starting server on http://localhost:5000');
quiet('node server.js', path.join(root, 'backend'));