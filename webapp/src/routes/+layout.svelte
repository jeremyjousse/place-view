<script lang="ts">
	import '../app.css';
	import Sidebar from '$lib/components/organisms/Sidebar.svelte';
	import Header from '$lib/components/organisms/Header.svelte';
	import BottomNavBar from '$lib/components/organisms/BottomNavBar.svelte';
	import { uiStore } from '$lib/stores/ui.svelte';
	import { searchStore } from '$lib/stores/search.svelte';
	import { page } from '$app/stores';

	let { children } = $props();

	const handleSearch = (query: string) => {
		searchStore.query = query;
	};

	let title = $derived($page.url.pathname === '/map' ? 'Explorer Map' : 'Places');
</script>

<div class="flex min-h-screen bg-background text-text selection:bg-primary selection:text-primary-text">
	<Sidebar />
	
	<div class="flex-1 flex flex-col min-w-0">
		<Header 
			showFavoritesOnly={uiStore.showFavoritesOnly} 
			onToggleFavorites={(v) => uiStore.showFavoritesOnly = v} 
			onSearch={handleSearch}
			{title}
		/>
		
		<main class="flex-1 px-6 lg:px-12 pb-32 lg:pb-12">
			{@render children()}
		</main>
	</div>

	<BottomNavBar />
</div>