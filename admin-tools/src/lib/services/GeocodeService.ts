import { env } from '$env/dynamic/private';

export interface LocationPrediction {
	id: string;
	latitude: number;
	longitude: number;
	displayName: string;
}

export interface GeocodeMapsResponse {
	place_id: number;
	lat: string;
	lon: string;
	display_name: string;
}

export class GeocodeService {
	async getLocationPrediction(locationSearch: string): Promise<LocationPrediction[]> {
		const apiKey = env.GEOCODE_MAPS_KEY;
		if (!apiKey) {
			console.warn('GEOCODE_MAPS_KEY is not defined in environment variables');
			return [];
		}

		const url = `https://geocode.maps.co/search?city=${encodeURIComponent(
			locationSearch
		)}&api_key=${apiKey}`;

		try {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`Geocode API error: ${response.statusText}`);
			}
			const geocodeMapsResponse = (await response.json()) as GeocodeMapsResponse[];

			const mappedPredictions = geocodeMapsResponse.map((place) => {
				return {
					id: place.place_id.toString(),
					latitude: Number.parseFloat(place.lat),
					longitude: Number.parseFloat(place.lon),
					displayName: place.display_name
				};
			});

			// Filter duplicates
			return mappedPredictions.filter(
				(data, index) =>
					mappedPredictions.findIndex((obj) => obj.displayName === data.displayName) === index
			);
		} catch (error) {
			console.error('Error fetching geocode predictions:', error);
			return [];
		}
	}
}
