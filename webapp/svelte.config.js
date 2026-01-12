import adapterAuto from '@sveltejs/adapter-auto';
import adapterDeno from '@deno/svelte-adapter';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: process.env.ADAPTER === 'deno' ? adapterDeno() : adapterAuto()
	}
};

export default config;
