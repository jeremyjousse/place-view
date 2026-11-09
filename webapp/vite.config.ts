import { defineConfig } from 'vitest/config';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import adapterStatic from '@sveltejs/adapter-static';
import adapterDeno from '@deno/svelte-adapter';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
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
		})
	],

	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
