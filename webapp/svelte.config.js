import adapterAuto from '@sveltejs/adapter-auto';
import adapterDeno from '@deno/svelte-adapter';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// Select adapter based on environment variable
		adapter: process.env.ADAPTER === 'deno' ? adapterDeno() : adapterAuto()
	}
};

export default config;