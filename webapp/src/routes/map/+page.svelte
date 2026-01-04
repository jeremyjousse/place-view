<script lang="ts">
	import MapView from '$lib/components/organisms/MapView.svelte';
	import { uiStore } from '$lib/stores/ui.svelte';
	import { favoritesStore } from '$lib/stores/favorites.svelte';
	import type { Place } from '$lib/common/domain/Place';

	let { data }: { data: { places: Place[] } } = $props();

	let filteredPlaces = $derived(
		uiStore.showFavoritesOnly
			? data.places.filter((p) => favoritesStore.isFavorite(p.id))
			: data.places
	);

	// France coordinates and zoom level
	const FRANCE_CENTER: [number, number] = [46.2276, 2.2137];
	const FRANCE_ZOOM = 6;

	console.log('Map page loaded with places count:', data.places.length);
</script>

<div class="h-[calc(100vh-200px)] min-h-125 py-1">
	<MapView places={filteredPlaces} center={FRANCE_CENTER} zoom={FRANCE_ZOOM} fitBounds={false} />
</div>
