<script lang="ts">
	import { onMount } from 'svelte';
	import type { Place } from '$lib/domain/Place';
	import { base } from '$app/paths';

	interface Props {
		latitude: number;
		longitude: number;
		zoom?: number;
		height?: string;
		places?: Place[];
		fitToPlaces?: boolean;
	}

	let {
		latitude = $bindable(),
		longitude = $bindable(),
		zoom = 13,
		height = '300px',
		places = [],
		fitToPlaces = false
	}: Props = $props();

	let mapElement: HTMLElement;
	let map: import('leaflet').Map;
	let L: typeof import('leaflet');
	let markersLayer: import('leaflet').LayerGroup;

	onMount(async () => {
		// Leaflet needs window, so we import it dynamically
		L = await import('leaflet');

		if (!mapElement) return;

		// Fix for default marker icons in Leaflet with Vite/SvelteKit
		const DefaultIcon = L.icon({
			iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
			iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
			shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
			iconSize: [25, 41],
			iconAnchor: [12, 41],
			popupAnchor: [1, -34],
			shadowSize: [41, 41]
		});
		L.Marker.prototype.options.icon = DefaultIcon;

		map = L.map(mapElement).setView([latitude, longitude], zoom);

		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(map);

		markersLayer = L.layerGroup().addTo(map);

		map.on('click', (e: import('leaflet').LeafletMouseEvent) => {
			if (!places || places.length === 0) {
				latitude = e.latlng.lat;
				longitude = e.latlng.lng;
			}
		});

		map.on('moveend', () => {
			if (!places || places.length === 0) {
				const center = map.getCenter();
				if (center.lat !== latitude || center.lng !== longitude) {
					latitude = center.lat;
					longitude = center.lng;
				}
			}
		});

		updateMap();
	});

	function updateMap() {
		if (!map || !L || !markersLayer) return;

		// Validate coordinates
		if (isNaN(latitude) || isNaN(longitude)) return;

		markersLayer.clearLayers();

		if (places && places.length > 0) {
			const bounds = L.latLngBounds([]);

			for (const place of places) {
				const pos: [number, number] = [place.coordinates.latitude, place.coordinates.longitude];
				bounds.extend(pos);

				// Use circle markers for performance with many places
				const marker = L.circleMarker(pos, {
					radius: 5,
					fillColor: '#4f46e5',
					color: '#ffffff',
					weight: 1,
					opacity: 1,
					fillOpacity: 0.8
				});

				marker.bindPopup(`
					<div class="text-sm">
						<strong class="block">${place.name}</strong>
						<span class="text-gray-500">${place.country}, ${place.state}</span><br/>
						<a href="${base}/places/${place.id}" class="text-indigo-600 hover:underline mt-1 inline-block">View Details</a>
					</div>
				`);
				markersLayer.addLayer(marker);
			}

			if (fitToPlaces) {
				map.fitBounds(bounds, { padding: [20, 20] });
			} else {
				map.setView([latitude, longitude], zoom, { animate: true });
			}
		} else {
			const pos: [number, number] = [latitude, longitude];

			// Only update view if the center has changed significantly to avoid loops
			const center = map.getCenter();
			if (Math.abs(center.lat - latitude) > 0.00001 || Math.abs(center.lng - longitude) > 0.00001) {
				map.setView(pos, zoom, { animate: true });
			}

			const marker = L.marker(pos, { draggable: true }).addTo(markersLayer);

			marker.on('dragend', () => {
				const newPos = marker.getLatLng();
				latitude = newPos.lat;
				longitude = newPos.lng;
			});
		}
	}

	// Re-run update when places or position changes
	let lastPlaces: Place[] | undefined;

	$effect(() => {
		// Explicitly track dependencies
		latitude;
		longitude;

		// If places changed, always rebuild markers
		if (places !== lastPlaces) {
			updateMap();
			lastPlaces = places;
			return;
		}

		if (!map) return;

		if (!places || places.length === 0) {
			// Single marker mode: update view and marker position
			updateMap();
		} else if (!fitToPlaces) {
			// Multiple places mode but fitToPlaces is false: just update view center
			map.setView([latitude, longitude], zoom);
		}
	});
</script>

{latitude} - {longitude}

<div class="overflow-hidden rounded-lg border border-gray-200 shadow-sm" style="height: {height}">
	<div bind:this={mapElement} class="h-full w-full"></div>
</div>

<style>
	/* Ensure leaflet controls are below other UI if needed, but usually fine */
	:global(.leaflet-container) {
		z-index: 1;
		font-family: inherit;
	}
</style>
