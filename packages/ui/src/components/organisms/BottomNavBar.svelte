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
		hideOnScroll?: boolean;
	}

	let {
		currentPath = '/',
		isMap = undefined,
		isAdmin = undefined,
		showAdmin = false,
		listHref = '/',
		mapHref = '/map/',
		adminHref = '/admin/',
		onNavigate,
		hideOnScroll = false
	}: Props = $props();

	let isHidden = $state(false);
	const SCROLL_THRESHOLD = 12;

	$effect(() => {
		isHidden = false;
		if (!hideOnScroll) return;

		function scrollPosition() {
			const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
			return Math.max(0, Math.min(window.scrollY, maxScroll));
		}

		let anchorY = scrollPosition();
		function handleScroll() {
			const currentY = scrollPosition();
			const delta = currentY - anchorY;
			if (currentY === 0) {
				isHidden = false;
			} else if (Math.abs(delta) < SCROLL_THRESHOLD) {
				return;
			} else {
				isHidden = delta > 0;
			}
			anchorY = currentY;
		}

		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	});

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
	class="bg-surface/80 border-border fixed right-0 bottom-0 left-0 z-50 flex items-center justify-around border-t py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-xl transition-transform duration-200 has-focus-visible:pointer-events-auto has-focus-visible:translate-y-0 motion-reduce:transition-none lg:hidden {isHidden
		? 'pointer-events-none translate-y-full'
		: ''}"
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
