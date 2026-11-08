<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import type L from 'leaflet';
	import 'leaflet/dist/leaflet.css';
	import type { Place } from '$lib/common/domain/Place';

	let {
		places = [],
		center = [46.2276, 2.2137],
		zoom = 6,
		fitBounds = false,
		persistPosition = false,
		heightClass = 'h-full min-h-[500px]'
	} = $props<{
		places: Place[];
		center?: [number, number];
		zoom?: number;
		fitBounds?: boolean;
		persistPosition?: boolean;
		heightClass?: string;
	}>();

	let mapElement: HTMLElement;
	let map: L.Map | undefined;
	let markerGroup: L.LayerGroup | undefined;
	let Leaflet: typeof L;

	const STORAGE_KEY_LAT = 'mapCenterLat';
	const STORAGE_KEY_LON = 'mapCenterLon';
	const STORAGE_KEY_ZOOM = 'mapZoom';

	function getInitialCoordinates(): { center: [number, number]; zoom: number } {
		if (persistPosition && browser) {
			const savedLat = localStorage.getItem(STORAGE_KEY_LAT);
			const savedLon = localStorage.getItem(STORAGE_KEY_LON);
			const savedZoom = localStorage.getItem(STORAGE_KEY_ZOOM);

			if (savedLat && savedLon && savedZoom) {
				const lat = parseFloat(savedLat);
				const lon = parseFloat(savedLon);
				const z = parseInt(savedZoom, 10);
				if (!isNaN(lat) && !isNaN(lon) && !isNaN(z)) {
					return { center: [lat, lon], zoom: z };
				}
			}
		}
		return { center, zoom };
	}

	function savePosition() {
		if (!persistPosition || !map || !browser) return;
		const currentCenter = map.getCenter();
		const currentZoom = map.getZoom();

		localStorage.setItem(STORAGE_KEY_LAT, currentCenter.lat.toString());
		localStorage.setItem(STORAGE_KEY_LON, currentCenter.lng.toString());
		localStorage.setItem(STORAGE_KEY_ZOOM, currentZoom.toString());
	}

	onMount(async () => {
		if (!browser) return;

		// Dynamically import Leaflet
		Leaflet = (await import('leaflet')).default;

		// Fix Leaflet marker icons
		// @ts-expect-error Leaflet icon prototype override
		delete Leaflet.Icon.Default.prototype._getIconUrl;
		Leaflet.Icon.Default.mergeOptions({
			iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
			iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
			shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
		});

		const initial = getInitialCoordinates();
		map = Leaflet.map(mapElement).setView(initial.center, initial.zoom);

		Leaflet.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
			maxZoom: 19
		}).addTo(map);

		markerGroup = Leaflet.layerGroup().addTo(map);

		if (persistPosition) {
			map.on('moveend', savePosition);
		}

		updateMarkers();
	});

	$effect(() => {
		if (markerGroup && Leaflet && places) {
			updateMarkers();
		}
	});

	function updateMarkers() {
		if (!Leaflet || !markerGroup || !map) return;

		markerGroup.clearLayers();
		const bounds = Leaflet.latLngBounds([]);

		places.forEach((place: Place) => {
			if (place.coordinates?.latitude && place.coordinates?.longitude) {
				const marker = Leaflet.marker([place.coordinates.latitude, place.coordinates.longitude])
					.bindPopup(`
					<div class="font-bold text-sm">${place.name}</div>
					<div class="text-xs text-neutral-400 mb-2">${place.state || ''}${place.country ? ' • ' + place.country : ''}</div>
					<a href="/place/${place.id}" class="inline-block bg-primary text-black font-black px-3 py-1.5 rounded-lg text-xs uppercase tracking-wider hover:opacity-90">View Place</a>
				`);
				markerGroup?.addLayer(marker);
				bounds.extend([place.coordinates.latitude, place.coordinates.longitude]);
			}
		});

		// Auto center if only 1 place
		if (places.length === 1 && places[0].coordinates?.latitude) {
			map.setView([places[0].coordinates.latitude, places[0].coordinates.longitude], 12);
		} else if (fitBounds && places.length > 1 && bounds.isValid()) {
			map.fitBounds(bounds, { padding: [50, 50] });
		}
	}

	onDestroy(() => {
		if (map) {
			if (persistPosition) {
				map.off('moveend', savePosition);
			}
			map.remove();
		}
	});
</script>

<div
	bind:this={mapElement}
	class="border-border relative isolate z-0 w-full overflow-hidden rounded-3xl border shadow-2xl {heightClass}"
></div>

<style>
	:global(.leaflet-popup-content-wrapper) {
		background: #1a1d23;
		color: white;
		border: 1px solid #2a2d35;
		border-radius: 1rem;
		padding: 0.5rem;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
	}
	:global(.leaflet-popup-tip) {
		background: #1a1d23;
	}
	:global(.leaflet-popup-content) {
		margin: 8px 12px;
		line-height: 1.4;
	}
</style>
