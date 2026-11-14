<script lang="ts">
	import { onMount } from 'svelte';
	import type L from 'leaflet';
	import 'leaflet/dist/leaflet.css';
	import '../../lib/leaflet-theme.css';
	import type { Place, MapPosition } from '@place-view/core';
	import {
		createLeafletMap,
		createPlacePopupElement,
		DEFAULT_MAP_CENTER,
		loadLeaflet
	} from '../../lib/leaflet';

	interface Props {
		places: Place[];
		center?: [number, number];
		zoom?: number;
		fitBounds?: boolean;
		persistPosition?: boolean;
		heightClass?: string;
		position?: MapPosition;
		markerVariant?: 'pin' | 'dot';
		actionLabel?: string;
		onPositionChange?: (position: MapPosition) => void;
		getPlaceHref?: (place: Place) => string;
		onSelectPlace?: (place: Place) => void;
	}

	let {
		places = [],
		center = DEFAULT_MAP_CENTER,
		zoom = 6,
		fitBounds = false,
		persistPosition = false,
		heightClass = 'h-full min-h-[500px]',
		position,
		markerVariant = 'pin',
		actionLabel = 'View Place',
		onPositionChange,
		getPlaceHref = (place: Place) => `/place/${encodeURIComponent(place.id)}/`,
		onSelectPlace
	}: Props = $props();

	let mapElement: HTMLElement;
	let map = $state.raw<L.Map>();
	let markerGroup: L.LayerGroup | undefined;
	let Leaflet: typeof L;

	const STORAGE_KEY_LAT = 'mapCenterLat';
	const STORAGE_KEY_LON = 'mapCenterLon';
	const STORAGE_KEY_ZOOM = 'mapZoom';
	const isBrowser = typeof window !== 'undefined';

	function getInitialCoordinates(): { center: [number, number]; zoom: number } {
		if (position) {
			return { center: [position.latitude, position.longitude], zoom: position.zoom };
		}
		if (persistPosition && isBrowser && typeof localStorage !== 'undefined') {
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
		if (!map || !isBrowser) return;
		const currentCenter = map.getCenter();
		const currentZoom = map.getZoom();

		if (persistPosition && typeof localStorage !== 'undefined') {
			localStorage.setItem(STORAGE_KEY_LAT, currentCenter.lat.toString());
			localStorage.setItem(STORAGE_KEY_LON, currentCenter.lng.toString());
			localStorage.setItem(STORAGE_KEY_ZOOM, currentZoom.toString());
		}
		onPositionChange?.({
			latitude: currentCenter.lat,
			longitude: currentCenter.lng,
			zoom: currentZoom
		});
	}

	onMount(() => {
		let cancelled = false;

		async function initialize() {
			Leaflet = await loadLeaflet();
			if (cancelled || !mapElement) return;

			const initial = getInitialCoordinates();
			map = createLeafletMap(Leaflet, mapElement, initial.center, initial.zoom);
			markerGroup = Leaflet.layerGroup().addTo(map);
			updateMarkers();
			map.on('moveend', savePosition);
			savePosition();
		}

		void initialize().catch((error) => console.error('Failed to initialize map:', error));

		return () => {
			cancelled = true;
			map?.off('moveend', savePosition);
			map?.remove();
		};
	});

	$effect(() => {
		const currentPlaces = places;
		if (map && markerGroup && Leaflet && currentPlaces) {
			updateMarkers();
		}
	});

	$effect(() => {
		const currentMap = map;
		const target = position;
		if (!currentMap || !target) return;
		const current = currentMap.getCenter();
		if (
			Math.abs(current.lat - target.latitude) > 0.00001 ||
			Math.abs(current.lng - target.longitude) > 0.00001 ||
			currentMap.getZoom() !== target.zoom
		) {
			currentMap.off('moveend', savePosition);
			currentMap.setView([target.latitude, target.longitude], target.zoom, { animate: false });
			currentMap.on('moveend', savePosition);
		}
	});

	function updateMarkers() {
		if (!Leaflet || !markerGroup || !map) return;

		markerGroup.clearLayers();
		const bounds = Leaflet.latLngBounds([]);

		for (const place of places) {
			const lat = place.coordinates?.latitude;
			const lon = place.coordinates?.longitude;
			if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;

			const popup = createPlacePopupElement({
				place,
				href: getPlaceHref(place),
				actionLabel,
				onSelect: onSelectPlace
			});

			const marker =
				markerVariant === 'dot'
					? Leaflet.circleMarker([lat, lon], {
							radius: 6,
							fillColor: '#c5ff29',
							color: '#0f1115',
							weight: 2,
							opacity: 1,
							fillOpacity: 0.9
						}).bindPopup(popup)
					: Leaflet.marker([lat, lon]).bindPopup(popup);

			markerGroup.addLayer(marker);
			bounds.extend([lat, lon]);
		}

		if (!position && places.length === 1 && Number.isFinite(places[0].coordinates?.latitude)) {
			map.setView([places[0].coordinates.latitude, places[0].coordinates.longitude], 12);
		} else if (fitBounds && places.length > 1 && bounds.isValid()) {
			map.fitBounds(bounds, { padding: [50, 50] });
		}
	}
</script>

<div
	bind:this={mapElement}
	class="border-border relative isolate z-0 w-full overflow-hidden rounded-3xl border shadow-2xl {heightClass}"
></div>
