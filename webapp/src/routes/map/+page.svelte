<script lang="ts">
	import { page } from '$app/state';
	import MapView from '#lib/components/organisms/MapView.svelte';
	import { uiStore } from '#lib/stores/ui.svelte';
	import { favoritesStore } from '#lib/stores/favorites.svelte';
	import { searchStore } from '#lib/stores/search.svelte';
	import type { Place } from '#lib/common/domain/Place';

	let { data }: { data: { places: Place[] } } = $props();

	const targetPlaceId = $derived(page.url.searchParams.get('place'));

	let filteredPlaces = $derived.by(() => {
		let list = data.places;

		if (targetPlaceId) {
			const target = list.filter((p) => p.id === targetPlaceId);
			if (target.length > 0) return target;
		}

		if (uiStore.showFavoritesOnly) {
			list = list.filter((p) => favoritesStore.isFavorite(p.id));
		}

		if (searchStore.query && searchStore.query.trim()) {
			const q = searchStore.query.toLowerCase().trim();
			list = list.filter(
				(p) =>
					p.name.toLowerCase().includes(q) ||
					(p.state && p.state.toLowerCase().includes(q)) ||
					(p.country && p.country.toLowerCase().includes(q))
			);
		}

		return list;
	});

	// France coordinates and zoom level fallback
	const FRANCE_CENTER: [number, number] = [46.2276, 2.2137];
	const FRANCE_ZOOM = 6;
</script>

<div class="h-[calc(100vh-200px)] min-h-125 py-1">
	<MapView
		places={filteredPlaces}
		center={FRANCE_CENTER}
		zoom={FRANCE_ZOOM}
		persistPosition={!targetPlaceId}
	/>
</div>
