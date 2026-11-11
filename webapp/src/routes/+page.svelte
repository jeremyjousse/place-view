<script lang="ts">
	import { onMount } from 'svelte';
	import PlaceCard from '#lib/components/molecules/PlaceCard.svelte';
	import { page } from '$app/state';
	import { favoritesStore } from '#lib/stores/favorites.svelte';
	import { placeService } from '#lib/services/PlaceService';
	import type { Place } from '#lib/common/domain/Place';

	let { data }: { data: { places: Place[] } } = $props();

	let places = $state<Place[]>([]);
	let offset = $state(0);
	let hasMore = $state(true);
	let isLoading = $state(false);
	let query = $derived(page.url.searchParams.get('q') ?? '');
	let showFavoritesOnly = $derived(page.url.searchParams.get('favorites') === '1');

	let filteredPlaces = $derived(
		showFavoritesOnly ? places.filter((p) => favoritesStore.isFavorite(p.id)) : places
	);

	async function loadMore() {
		if (isLoading || !hasMore || query) return;
		isLoading = true;

		try {
			const result = await placeService.search('', 20, offset);
			places = [...places, ...result.places];
			offset += result.places.length;
			hasMore = result.hasMore;
		} catch (error) {
			console.error('Failed to load more places:', error);
		} finally {
			isLoading = false;
		}
	}

	$effect(() => {
		const currentQuery = query;
		const initialPlaces = data.places;

		if (currentQuery) {
			placeService
				.search(currentQuery, 100, 0)
				.then((result) => {
					places = result.places;
					hasMore = false;
				})
				.catch((err) => console.error(err));
		} else {
			places = initialPlaces;
			offset = initialPlaces.length;
			hasMore = true;
		}
	});

	let observer: IntersectionObserver;
	let loaderElement = $state<HTMLElement>();

	onMount(() => {
		observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					loadMore();
				}
			},
			{ threshold: 0.1 }
		);

		return () => observer.disconnect();
	});

	$effect(() => {
		const el = loaderElement;
		if (el && observer) {
			observer.observe(el);
			return () => observer.unobserve(el);
		}
	});
</script>

<div class="grid grid-cols-1 gap-8 py-8 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
	{#each filteredPlaces as place (place.id)}
		<PlaceCard
			{place}
			isFavorite={favoritesStore.isFavorite(place.id)}
			onToggleFavorite={() => favoritesStore.toggle(place.id)}
		/>
	{/each}
</div>

{#if hasMore && !query}
	<div bind:this={loaderElement} class="flex h-20 items-center justify-center">
		<div
			class="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"
		></div>
	</div>
{/if}
