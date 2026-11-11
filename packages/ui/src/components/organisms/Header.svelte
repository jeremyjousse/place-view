<script lang="ts">
	import { Search, Heart, RotateCw } from 'lucide-svelte';
	import { placeService } from '@place-view/core';

	interface Props {
		showFavoritesOnly?: boolean;
		searchQuery?: string;
		onToggleFavorites?: (show: boolean) => void;
		onSearch?: (query: string) => void;
		onRefresh?: () => Promise<void>;
		title?: string;
	}

	let {
		showFavoritesOnly = false,
		searchQuery = '',
		onToggleFavorites,
		onSearch,
		onRefresh,
		title = 'Places'
	}: Props = $props();

	let isRefreshing = $state(false);

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		onSearch?.(target.value);
	}

	async function handleRefresh() {
		if (isRefreshing) return;
		isRefreshing = true;
		try {
			if (onRefresh) {
				await onRefresh();
			} else {
				await placeService.refresh();
			}
		} catch (e) {
			console.error('Failed to refresh places:', e);
		} finally {
			isRefreshing = false;
		}
	}
</script>

<header
	class="bg-background sticky top-0 z-40 flex w-full items-center justify-between px-6 py-6 lg:px-12"
>
	<div class="flex flex-1 flex-col gap-2 lg:flex-row lg:items-center lg:gap-8">
		<h1 class="shrink-0 text-3xl font-black tracking-tight lg:text-4xl">{title}</h1>

		<div class="relative w-full max-w-md">
			<Search class="text-text-muted absolute top-1/2 left-4 -translate-y-1/2" size={18} />
			<input
				type="text"
				placeholder="Search places..."
				value={searchQuery}
				oninput={handleInput}
				class="bg-surface border-border focus:ring-primary placeholder:text-text-muted/50 w-full rounded-2xl border py-3 pr-4 pl-12 font-medium transition-all focus:border-transparent focus:ring-2 focus:outline-none"
			/>
		</div>
	</div>

	<div class="flex items-center gap-3">
		<div class="mr-6 hidden items-center gap-2 lg:flex">
			<div class="bg-primary/20 flex h-8 w-8 items-center justify-center rounded-lg">
				<div
					class="border-primary h-4 w-4 translate-x-0.5 translate-y-0.5 rotate-45 transform border-t-2 border-l-2"
				></div>
			</div>
			<span class="text-xl font-black tracking-tighter whitespace-nowrap uppercase">Place View</span
			>
		</div>

		<button
			class="bg-surface border-border hover:border-text-muted text-text-muted flex cursor-pointer items-center gap-2 rounded-full border p-2 transition-all hover:text-white"
			onclick={handleRefresh}
			disabled={isRefreshing}
			aria-label="Refresh places cache"
			title="Refresh places cache"
		>
			<RotateCw size={16} class={isRefreshing ? 'text-primary animate-spin' : ''} />
			<span class="hidden pr-1 text-[10px] font-black tracking-widest uppercase sm:inline">
				{isRefreshing ? 'Refreshing' : 'Clear Cache'}
			</span>
		</button>

		<button
			class="bg-surface border-border hover:border-text-muted flex cursor-pointer items-center gap-3 rounded-full border p-1 pr-4 transition-all"
			onclick={() => onToggleFavorites?.(!showFavoritesOnly)}
		>
			<div
				class="rounded-full p-2 {showFavoritesOnly
					? 'bg-primary text-primary-text'
					: 'bg-background text-text-muted'} transition-colors"
			>
				<Heart size={16} fill={showFavoritesOnly ? 'currentColor' : 'none'} />
			</div>
			<span
				class="hidden text-[10px] font-black tracking-widest whitespace-nowrap uppercase sm:inline"
				>Favorites Only</span
			>
		</button>
	</div>
</header>
