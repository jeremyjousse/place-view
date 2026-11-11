<script lang="ts">
	import { LayoutList, Map as MapIcon } from 'lucide-svelte';

	interface Props {
		currentPath?: string;
		isMap?: boolean;
		listHref?: string;
		mapHref?: string;
		onNavigate?: (path: string) => void;
	}

	let {
		currentPath = '/',
		isMap = currentPath.startsWith('/map'),
		listHref = '/',
		mapHref = '/map/',
		onNavigate
	}: Props = $props();
</script>

<nav
	class="bg-background/80 border-border fixed right-0 bottom-0 left-0 z-50 flex items-center justify-around border-t px-6 pt-3 pb-6 backdrop-blur-xl lg:hidden"
>
	<a
		href={listHref}
		onclick={(e) => {
			if (onNavigate) {
				e.preventDefault();
				onNavigate(listHref);
			}
		}}
		class="flex flex-col items-center gap-1 transition-colors {!isMap
			? 'text-primary'
			: 'text-text-muted'}"
	>
		<LayoutList size={22} />
		<span class="text-[10px] font-black tracking-widest uppercase">List</span>
	</a>

	<a
		href={mapHref}
		onclick={(e) => {
			if (onNavigate) {
				e.preventDefault();
				onNavigate(mapHref);
			}
		}}
		class="flex flex-col items-center gap-1 transition-colors {isMap
			? 'text-primary'
			: 'text-text-muted'}"
	>
		<MapIcon size={22} />
		<span class="text-[10px] font-black tracking-widest uppercase">Map</span>
	</a>
</nav>
