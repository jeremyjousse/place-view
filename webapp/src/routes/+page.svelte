<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import PlaceCard from '$lib/components/molecules/PlaceCard.svelte';
	import { uiStore } from '$lib/stores/ui.svelte';
	import { searchStore } from '$lib/stores/search.svelte';
	import { favoritesStore } from '$lib/stores/favorites.svelte';
	import { placeService } from '$lib/services/PlaceService';
	import type { Place } from '$lib/common/domain/Place';

	let { data } = $props();

	let places = $state<Place[]>(data.places);
	let offset = $state(data.places.length);
	let hasMore = $state(true);
	let isLoading = $state(false);

	let filteredPlaces = $derived(
		uiStore.showFavoritesOnly ? places.filter((p) => favoritesStore.isFavorite(p.id)) : places
	);

	async function loadMore() {
		if (isLoading || !hasMore || searchStore.query) return;
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
		const query = searchStore.query;
		if (query) {
			placeService
				.search(query, 100, 0)
				.then((result) => {
					places = result.places;
					hasMore = false;
				})
				.catch((err) => console.error(err));
		} else {
			places = data.places;
			offset = data.places.length;
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

{#if hasMore && !searchStore.query}
	<div bind:this={loaderElement} class="flex h-20 items-center justify-center">
		<div
			class="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"
		></div>
	</div>
{/if}
