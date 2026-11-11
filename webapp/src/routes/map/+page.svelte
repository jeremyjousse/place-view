<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import MapView from '#lib/components/organisms/MapView.svelte';
	import { favoritesStore } from '#lib/stores/favorites.svelte';
	import type { Place } from '#lib/common/domain/Place';
	import {
		mapPositionFromUrl,
		positionParameters,
		withParameters,
		type MapPosition
	} from '#lib/url-state';

	let { data }: { data: { places: Place[] } } = $props();

	const targetPlaceId = $derived(page.url.searchParams.get('place'));
	const mapPosition = $derived(mapPositionFromUrl(page.url));
	const query = $derived(page.url.searchParams.get('q') ?? '');
	const showFavoritesOnly = $derived(page.url.searchParams.get('favorites') === '1');

	function updatePosition(position: MapPosition) {
		const url = withParameters(page.url, positionParameters(position));
		if (url.href === page.url.href) return;
		void goto(url, { replace: true, reset: false }).catch((error) =>
			console.error('Failed to update map position:', error)
		);
	}

	let filteredPlaces = $derived.by(() => {
		let list = data.places;

		if (targetPlaceId) {
			const target = list.filter((p) => p.id === targetPlaceId);
			if (target.length > 0) return target;
		}

		if (showFavoritesOnly) {
			list = list.filter((p) => favoritesStore.isFavorite(p.id));
		}

		if (query.trim()) {
			const q = query.toLowerCase().trim();
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
		position={mapPosition}
		onPositionChange={updatePosition}
	/>
</div>
