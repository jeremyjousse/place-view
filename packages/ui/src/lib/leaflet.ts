import type L from 'leaflet';
import type { Place } from '@place-view/core';

export const DEFAULT_MAP_CENTER: [number, number] = [46.2276, 2.2137];

export async function loadLeaflet(): Promise<typeof L> {
	const Leaflet = (await import('leaflet')).default;
	// @ts-expect-error Leaflet icon prototype override for bundled Vite builds
	delete Leaflet.Icon.Default.prototype._getIconUrl;
	Leaflet.Icon.Default.mergeOptions({
		iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
		iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
		shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
	});
	return Leaflet;
}

export function createLeafletMap(
	Leaflet: typeof L,
	element: HTMLElement,
	center: [number, number],
	zoom: number
): L.Map {
	const map = Leaflet.map(element).setView(center, zoom);
	Leaflet.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution:
			'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		maxZoom: 19
	}).addTo(map);
	return map;
}

export function createPlacePopupElement(options: {
	place: Place;
	href: string;
	actionLabel: string;
	onSelect?: (place: Place) => void;
}): HTMLElement {
	const { place, href, actionLabel, onSelect } = options;
	const popup = document.createElement('div');

	const nameEl = document.createElement('div');
	nameEl.className = 'font-bold text-sm text-white';
	nameEl.textContent = place.name;

	const locationEl = document.createElement('div');
	locationEl.className = 'text-xs text-neutral-400 mb-2';
	locationEl.textContent = [place.state, place.country].filter(Boolean).join(' • ');

	const link = document.createElement('a');
	link.href = href;
	link.className =
		'inline-block bg-primary text-black font-black px-3 py-1.5 rounded-lg text-xs uppercase tracking-wider hover:opacity-90';
	link.textContent = actionLabel;
	if (onSelect) {
		link.onclick = (e) => {
			e.preventDefault();
			onSelect(place);
		};
	}

	popup.append(nameEl, locationEl, link);
	return popup;
}
