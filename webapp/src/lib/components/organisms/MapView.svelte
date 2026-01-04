<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import type L from 'leaflet';
	import 'leaflet/dist/leaflet.css';

	let {
		places = [],
		center = [46.8, 8.2],
		zoom = 4,
		fitBounds = true
	} = $props<{
		places: any[];
		center?: [number, number];
		zoom?: number;
		fitBounds?: boolean;
	}>();

	let mapElement: HTMLElement;
	let map: L.Map;
	let markerGroup: L.LayerGroup;
	let Leaflet: typeof L;

	onMount(async () => {
		if (!browser) return;

		// Dynamically import Leaflet
		Leaflet = (await import('leaflet')).default;

		// Fix for Leaflet default marker icons not showing up with some bundlers
		// @ts-ignore
		delete Leaflet.Icon.Default.prototype._getIconUrl;
		Leaflet.Icon.Default.mergeOptions({
			iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
			iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
			shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
		});

		map = Leaflet.map(mapElement).setView(center, zoom);

		Leaflet.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
			subdomains: 'abcd',
			maxZoom: 20
		}).addTo(map);

		markerGroup = Leaflet.layerGroup().addTo(map);

		updateMarkers();
	});

	$effect(() => {
		if (markerGroup && Leaflet) {
			updateMarkers();
		}
	});

	function updateMarkers() {
		if (!Leaflet || !markerGroup) return;

		markerGroup.clearLayers();
		const bounds = Leaflet.latLngBounds([]);

		places.forEach((place: any) => {
			if (place.coordinates.latitude && place.coordinates.longitude) {
				console.log(
					'Adding marker for place:',
					place.name,
					place.coordinates.latitude,
					place.coordinates.longitude
				);
				const marker = Leaflet.marker([place.coordinates.latitude, place.coordinates.longitude])
					.bindPopup(`
            <div class="font-bold">${place.name}</div>
            <div class="text-xs">${place.state || ''} ${place.country || ''}</div>
            <a href="/place/${place.id}" class="text-primary font-black mt-2 block uppercase text-[10px]">View Details</a>
          `);
				markerGroup.addLayer(marker);
				// bounds.extend([place.latitude, place.longitude]);
			}
		});

		if (fitBounds && places.length > 0 && bounds.isValid()) {
			map.fitBounds(bounds, { padding: [50, 50] });
		}
	}

	onDestroy(() => {
		if (map) map.remove();
	});
</script>

<div
	bind:this={mapElement}
	class="border-border h-full min-h-[500px] w-full overflow-hidden rounded-3xl border shadow-2xl"
></div>

<style>
	:global(.leaflet-popup-content-wrapper) {
		background: #1a1a1a;
		color: white;
		border-radius: 1rem;
		padding: 0.5rem;
	}
	:global(.leaflet-popup-tip) {
		background: #1a1a1a;
	}
</style>
