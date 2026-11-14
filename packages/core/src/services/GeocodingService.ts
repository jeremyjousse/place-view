import type { FetchTextFn } from '../ports/index.js';

export interface LocationPrediction {
	id: string;
	latitude: number;
	longitude: number;
	displayName: string;
	country?: string;
	state?: string;
}

interface NominatimResult {
	place_id: number;
	lat: string;
	lon: string;
	display_name: string;
	address?: {
		country?: string;
		state?: string;
		county?: string;
		region?: string;
	};
}

export function parseNominatimResponse(jsonText: string): LocationPrediction[] {
	const raw = JSON.parse(jsonText) as NominatimResult[];
	if (!Array.isArray(raw)) return [];

	const mapped = raw
		.map((item) => {
			const latitude = Number.parseFloat(item.lat);
			const longitude = Number.parseFloat(item.lon);
			if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
				return null;
			}
			const state = item.address?.county || item.address?.state || item.address?.region;
			const prediction: LocationPrediction = {
				id: String(item.place_id),
				latitude,
				longitude,
				displayName: item.display_name,
				...(item.address?.country ? { country: item.address.country } : {}),
				...(state ? { state } : {})
			};
			return prediction;
		})
		.filter((item): item is LocationPrediction => item !== null);

	return mapped.filter(
		(item, index) => mapped.findIndex((other) => other.displayName === item.displayName) === index
	);
}

export async function searchLocations(
	query: string,
	fetchText: FetchTextFn
): Promise<LocationPrediction[]> {
	const trimmed = query.trim();
	if (trimmed.length < 3) return [];

	const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(trimmed)}&format=json&limit=6&addressdetails=1`;
	const body = await fetchText(url);
	return parseNominatimResponse(body);
}
