import type { Place } from '$lib/common/domain/Place';
import type { PlaceRepository } from './PlaceRepository';
import placesData from '../../../../../resources/places.json';

export class JSONPlaceRepository implements PlaceRepository {
	constructor() {}

	private async readPlaces(): Promise<Place[]> {
		return placesData as unknown as Place[];
	}

	async getAll(): Promise<Place[]> {
		return this.readPlaces();
	}

	async getById(id: string): Promise<Place | undefined> {
		const places = await this.readPlaces();
		return places.find((p) => p.id === id);
	}

	async search(
		query: string,
		limit: number = 20,
		offset: number = 0
	): Promise<{ places: Place[]; total: number; hasMore: boolean }> {
		let places = await this.readPlaces();

		if (query) {
			const lowerQuery = query.toLowerCase();
			places = places.filter(
				(place) =>
					place.name.toLowerCase().includes(lowerQuery) ||
					(place.state && place.state.toLowerCase().includes(lowerQuery)) ||
					(place.country && place.country.toLowerCase().includes(lowerQuery))
			);
		}

		const total = places.length;
		const paginatedPlaces = places.slice(offset, offset + limit);

		return {
			places: paginatedPlaces,
			total,
			hasMore: offset + limit < total
		};
	}
}