<script lang="ts">
	import { LayoutList, Map as MapIcon } from 'lucide-svelte';
	import Button from '../atoms/Button.svelte';
	import { page } from '$app/stores';

	let currentPath = $derived($page.url.pathname);
	let isMap = $derived(currentPath === '/map');
</script>

<aside
	class="bg-background border-border sticky top-0 hidden h-screen w-20 shrink-0 flex-col items-center border-r py-8 lg:flex"
>
	<div class="mb-12">
		<!-- Mini Logo Placeholder -->
		<div class="bg-primary flex h-10 w-10 items-center justify-center rounded-xl">
			<a href="/" aria-label="Home">
				<div
					class="border-primary-text h-5 w-5 translate-x-0.5 translate-y-0.5 rotate-45 transform border-t-2 border-l-2"
				></div>
			</a>
		</div>
	</div>

	<nav class="flex flex-col gap-6">
		<Button
			variant="ghost"
			size="icon"
			href="/"
			class="group relative {!isMap ? 'text-primary' : ''}"
		>
			<LayoutList size={24} />
			{#if !isMap}
				<div
					class="bg-primary absolute -left-4 h-6 w-1 rounded-r-full shadow-[0_0_10px_rgba(197,255,41,0.5)]"
				></div>
			{/if}
		</Button>

		<Button
			variant="ghost"
			size="icon"
			href="/map"
			class="group relative {isMap ? 'text-primary' : ''}"
		>
			<MapIcon size={24} />
			{#if isMap}
				<div
					class="bg-primary absolute -left-4 h-6 w-1 rounded-r-full shadow-[0_0_10px_rgba(197,255,41,0.5)]"
				></div>
			{/if}
		</Button>
	</nav>
</aside>