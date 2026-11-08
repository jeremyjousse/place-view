import adapterStatic from '@sveltejs/adapter-static';
import adapterDeno from '@deno/svelte-adapter';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter:
			process.env.ADAPTER === 'deno'
				? adapterDeno()
				: adapterStatic({
						pages: 'build',
						assets: 'build',
						fallback: 'index.html',
						precompress: false,
						strict: true
					})
	}
};

export default config;
