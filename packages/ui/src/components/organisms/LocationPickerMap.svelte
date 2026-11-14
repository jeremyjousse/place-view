<script lang="ts">
	import { onMount } from 'svelte';
	import type L from 'leaflet';
	import 'leaflet/dist/leaflet.css';
	import '../../lib/leaflet-theme.css';
	import { createLeafletMap, DEFAULT_MAP_CENTER, loadLeaflet } from '../../lib/leaflet';

	interface Props {
		latitude?: number;
		longitude?: number;
		zoom?: number;
		heightClass?: string;
	}

	let {
		latitude = $bindable(DEFAULT_MAP_CENTER[0]),
		longitude = $bindable(DEFAULT_MAP_CENTER[1]),
		zoom = 6,
		heightClass = 'h-72'
	}: Props = $props();

	let mapElement: HTMLElement;
	let map = $state.raw<L.Map>();
	let Leaflet: typeof L;
	let marker: L.Marker | undefined;

	onMount(() => {
		let cancelled = false;

		async function initialize() {
			Leaflet = await loadLeaflet();
			if (cancelled || !mapElement) return;

			const initialLat = Number.isFinite(latitude) ? latitude : DEFAULT_MAP_CENTER[0];
			const initialLon = Number.isFinite(longitude) ? longitude : DEFAULT_MAP_CENTER[1];

			map = createLeafletMap(Leaflet, mapElement, [initialLat, initialLon], zoom);
			map.on('click', (e: L.LeafletMouseEvent) => {
				latitude = Number(e.latlng.lat.toFixed(6));
				longitude = Number(e.latlng.lng.toFixed(6));
			});

			syncMarker();
		}

		void initialize().catch((err) => console.error('Failed to initialize location picker:', err));

		return () => {
			cancelled = true;
			map?.remove();
		};
	});

	function syncMarker() {
		if (!map || !Leaflet || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
		const pos: [number, number] = [latitude, longitude];

		if (!marker) {
			marker = Leaflet.marker(pos, { draggable: true }).addTo(map);
			marker.on('dragend', () => {
				if (!marker) return;
				const next = marker.getLatLng();
				latitude = Number(next.lat.toFixed(6));
				longitude = Number(next.lng.toFixed(6));
			});
		} else {
			const current = marker.getLatLng();
			if (
				Math.abs(current.lat - latitude) > 0.000001 ||
				Math.abs(current.lng - longitude) > 0.000001
			) {
				marker.setLatLng(pos);
			}
		}

		const center = map.getCenter();
		if (Math.abs(center.lat - latitude) > 0.0001 || Math.abs(center.lng - longitude) > 0.0001) {
			map.setView(pos, map.getZoom(), { animate: true });
		}
	}

	$effect(() => {
		void latitude;
		void longitude;
		if (map && Leaflet) {
			syncMarker();
		}
	});
</script>

<div class="border-border relative overflow-hidden rounded-3xl border shadow-2xl {heightClass}">
	<div bind:this={mapElement} class="h-full w-full"></div>

	<div
		class="bg-surface/90 border-border text-text-muted pointer-events-none absolute bottom-3 left-3 z-[400] rounded-xl border px-3 py-1.5 font-mono text-[11px] backdrop-blur-md"
	>
		Click map or drag pin • {latitude.toFixed(5)}, {longitude.toFixed(5)}
	</div>
</div>
