<script lang="ts">
	import '../app.css';
	import Sidebar from '#lib/components/organisms/Sidebar.svelte';
	import Header from '#lib/components/organisms/Header.svelte';
	import BottomNavBar from '#lib/components/organisms/BottomNavBar.svelte';
	import { uiStore } from '#lib/stores/ui.svelte';
	import { searchStore } from '#lib/stores/search.svelte';
	import { page } from '$app/state';

	let { children } = $props();

	const handleSearch = (query: string) => {
		searchStore.query = query;
	};

	let title = $derived(page.url.pathname === '/map' ? 'Explorer Map' : 'Places');
</script>

<div
	class="bg-background text-text selection:bg-primary selection:text-primary-text flex min-h-screen"
>
	<Sidebar />

	<div class="flex min-w-0 flex-1 flex-col">
		<Header
			showFavoritesOnly={uiStore.showFavoritesOnly}
			onToggleFavorites={(v: boolean) => (uiStore.showFavoritesOnly = v)}
			onSearch={handleSearch}
			{title}
		/>

		<main class="flex-1 px-6 pb-32 lg:px-12 lg:pb-12">
			{@render children()}
		</main>
	</div>

	<BottomNavBar />
</div>
