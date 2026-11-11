<script lang="ts">
	import { LayoutList, Map as MapIcon } from 'lucide-svelte';
	import Button from '../atoms/Button.svelte';

	interface Props {
		currentPath?: string;
		isMap?: boolean;
		listHref?: string;
		mapHref?: string;
		homeHref?: string;
		onNavigate?: (path: string) => void;
	}

	let {
		currentPath = '/',
		isMap = currentPath.startsWith('/map'),
		listHref = '/',
		mapHref = '/map/',
		homeHref = '/',
		onNavigate
	}: Props = $props();
</script>

<aside
	class="bg-background border-border sticky top-0 hidden h-screen w-20 shrink-0 flex-col items-center border-r py-8 lg:flex"
>
	<div class="mb-12">
		<!-- Mini Logo Placeholder -->
		<div class="bg-primary flex h-10 w-10 items-center justify-center rounded-xl">
			<a
				href={homeHref}
				onclick={(e) => {
					if (onNavigate) {
						e.preventDefault();
						onNavigate(homeHref);
					}
				}}
				aria-label="Home"
			>
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
			href={listHref}
			onclick={(e: MouseEvent) => {
				if (onNavigate) {
					e.preventDefault();
					onNavigate(listHref);
				}
			}}
			class="group relative {!isMap ? 'text-primary' : ''}"
			aria-label="Places"
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
			href={mapHref}
			onclick={(e: MouseEvent) => {
				if (onNavigate) {
					e.preventDefault();
					onNavigate(mapHref);
				}
			}}
			class="group relative {isMap ? 'text-primary' : ''}"
			aria-label="Map"
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
