import type { Place } from '$lib/common/domain/Place';

export interface SearchPlacesResult {
	places: Place[];
	total: number;
	hasMore: boolean;
}

export class PlaceService {
	async search(query: string, limit: number = 20, offset: number = 0): Promise<SearchPlacesResult> {
		const params = new URLSearchParams();
		if (query) params.set('q', query);
		params.set('limit', limit.toString());
		params.set('offset', offset.toString());

		const res = await fetch(`/api/v1/places?${params.toString()}`);
		if (!res.ok) {
			throw new Error('Failed to fetch places');
		}
		return res.json();
	}
}

export const placeService = new PlaceService();
