<script lang="ts">
	import '../app.css';
	import { Sidebar, Header, BottomNavBar } from '@place-view/ui';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { withParameters } from '@place-view/core';

	let { children } = $props();

	function updateFilters(parameters: Record<string, string | null>, replaceState = false) {
		void goto(withParameters(page.url, parameters), { replace: replaceState, reset: false }).catch(
			(error) => console.error('Failed to update filters:', error)
		);
	}

	let title = $derived(page.url.pathname === '/map/' ? 'Explorer Map' : 'Places');
</script>

<div
	class="bg-background text-text selection:bg-primary selection:text-primary-text flex min-h-screen"
>
	<Sidebar />

	<div class="flex min-w-0 flex-1 flex-col">
		<Header
			showFavoritesOnly={page.url.searchParams.get('favorites') === '1'}
			searchQuery={page.url.searchParams.get('q') ?? ''}
			onToggleFavorites={(v: boolean) => updateFilters({ favorites: v ? '1' : null })}
			onSearch={(query: string) => updateFilters({ q: query }, true)}
			{title}
		/>

		<main class="flex-1 px-6 pb-32 lg:px-12 lg:pb-12">
			{@render children()}
		</main>
	</div>

	<BottomNavBar />
</div>
