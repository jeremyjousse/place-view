<script lang="ts">
	import '../app.css';
	import { Sidebar, Header, BottomNavBar, ToastList } from '@place-view/ui';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { withParameters } from '@place-view/core';
	import { isDesktopTauri } from '#lib/platform';
	import { toastStore } from '#lib/admin/toast.svelte';

	let { children } = $props();

	const isDesktop = isDesktopTauri();
	const isAdminRoute = $derived(isDesktop && page.url.pathname.startsWith('/admin'));

	function updateFilters(parameters: Record<string, string | null>, replaceState = false) {
		void goto(withParameters(page.url, parameters), { replaceState, reset: false }).catch((error) =>
			console.error('Failed to update filters:', error)
		);
	}

	let title = $derived(page.url.pathname === '/map/' ? 'Explorer Map' : 'Places');
</script>

<div
	class="bg-background text-text selection:bg-primary selection:text-primary-text flex min-h-screen pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)]"
>
	<Sidebar currentPath={page.url.pathname} showAdmin={isDesktop} adminHref="/admin/" />

	<div class="flex min-w-0 flex-1 flex-col">
		{#if !isAdminRoute}
			<Header
				showFavoritesOnly={page.url.searchParams.get('favorites') === '1'}
				searchQuery={page.url.searchParams.get('q') ?? ''}
				onToggleFavorites={(v: boolean) => updateFilters({ favorites: v ? '1' : null })}
				onSearch={(query: string) => updateFilters({ q: query }, true)}
				{title}
			/>
		{/if}

		<main class="flex-1 {isAdminRoute ? 'pb-32 lg:pb-12' : 'px-6 pb-32 lg:px-12 lg:pb-12'}">
			{@render children()}
		</main>
	</div>

	<BottomNavBar currentPath={page.url.pathname} showAdmin={isDesktop} adminHref="/admin/" />

	{#if isDesktop}
		<ToastList items={toastStore.items} onDismiss={(id) => toastStore.dismiss(id)} />
	{/if}
</div>
