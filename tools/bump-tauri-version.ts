import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { bumpTauriVersion } from './tauri-version.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

const version = process.argv[2];
if (!version) {
	console.error('Usage: bump-tauri-version.ts <version>');
	process.exit(1);
}

const updated = bumpTauriVersion(REPO_ROOT, version);
console.log(`Updated Tauri version to ${version}: ${updated.join(', ')}`);
