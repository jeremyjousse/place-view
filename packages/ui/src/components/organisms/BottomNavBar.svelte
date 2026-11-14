<script lang="ts">
	import { LayoutList, Map as MapIcon, Wrench } from 'lucide-svelte';
	import { resolveNavItems, type NavKey } from './nav';

	interface Props {
		currentPath?: string;
		isMap?: boolean;
		isAdmin?: boolean;
		showAdmin?: boolean;
		listHref?: string;
		mapHref?: string;
		adminHref?: string;
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

<nav
	class="bg-surface/80 border-border fixed right-0 bottom-0 left-0 z-50 flex items-center justify-around border-t py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden"
	aria-label="Mobile navigation"
>
	{#each items as item (item.key)}
		{@const Icon = icons[item.key]}
		<a
			href={item.href}
			onclick={(e) => {
				if (onNavigate) {
					e.preventDefault();
					onNavigate(item.href);
				}
			}}
			class="flex flex-col items-center gap-1 transition-colors {item.active
				? 'text-primary'
				: 'text-text-muted'}"
		>
			<Icon size={22} />
			<span class="text-[10px] font-black tracking-widest uppercase">{item.label}</span>
		</a>
	{/each}
</nav>
