<script lang="ts">
	import { LayoutList, Map as MapIcon, Wrench } from 'lucide-svelte';
	import Button from '../atoms/Button.svelte';
	import { resolveNavItems, type NavKey } from './nav';

	interface Props {
		currentPath?: string;
		isMap?: boolean;
		isAdmin?: boolean;
		showAdmin?: boolean;
		listHref?: string;
		mapHref?: string;
		adminHref?: string;
		homeHref?: string;
		onNavigate?: (path: string) => void;
	}

	let {
		currentPath = '/',
		isMap = undefined,
		isAdmin = undefined,
		showAdmin = false,
		listHref = '/',
		mapHref = '/map/',
		adminHref = '/admin/',
		homeHref = '/',
		onNavigate
	}: Props = $props();

	const items = $derived(
		resolveNavItems({ currentPath, isMap, isAdmin, showAdmin, listHref, mapHref, adminHref })
	);

	const icons: Record<NavKey, typeof LayoutList> = {
		list: LayoutList,
		map: MapIcon,
		admin: Wrench
	};
</script>

<aside
	class="border-border bg-background sticky top-0 z-50 hidden h-screen w-20 flex-col items-center gap-8 border-r py-8 lg:flex"
>
	<a
		href={homeHref}
		onclick={(e) => {
			if (onNavigate) {
				e.preventDefault();
				onNavigate(homeHref);
			}
		}}
		class="bg-primary text-primary-text flex h-10 w-10 items-center justify-center rounded-2xl shadow-lg transition-transform hover:scale-105"
		aria-label="Place View Home"
	>
		<div
			class="border-primary-text h-5 w-5 translate-x-0.5 translate-y-0.5 rotate-45 transform border-t-2 border-l-2"
		></div>
	</a>

	<nav class="flex flex-1 flex-col gap-6" aria-label="Primary navigation">
		{#each items as item (item.key)}
			{@const Icon = icons[item.key]}
			<Button
				variant="ghost"
				size="icon"
				href={item.href}
				onclick={(e: MouseEvent) => {
					if (onNavigate) {
						e.preventDefault();
						onNavigate(item.href);
					}
				}}
				class="group relative {item.active ? 'text-primary' : ''}"
				aria-label={item.ariaLabel}
				title={item.ariaLabel}
			>
				<Icon size={24} />
				{#if item.active}
					<div
						class="bg-primary absolute -left-4 h-6 w-1 rounded-r-full shadow-[0_0_10px_rgba(197,255,41,0.5)]"
					></div>
				{/if}
			</Button>
		{/each}
	</nav>
</aside>
