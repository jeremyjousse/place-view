import { defineConfig } from 'vitest/config';
import { searchForWorkspaceRoot } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import adapterStatic from '@sveltejs/adapter-static';

const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			adapter: adapterStatic({
				pages: 'build',
				assets: 'build',
				fallback: '404.html',
				precompress: false,
				strict: true
			})
		})
	],

	clearScreen: false,

	server: {
		port: 1420,
		strictPort: true,
		host: host || false,
		hmr: host
			? {
					protocol: 'ws',
					host,
					port: 1421
				}
			: undefined,
		fs: {
			allow: [searchForWorkspaceRoot(process.cwd())]
		},
		watch: {
			ignored: ['**/src-tauri/**']
		}
	},

	ssr: {
		noExternal: ['@place-view/core', '@place-view/ui']
	},

	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
