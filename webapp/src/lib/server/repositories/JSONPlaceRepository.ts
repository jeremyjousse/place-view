import fs from 'node:fs';
import path from 'node:path';
import type { Place } from '$lib/common/domain/Place';
import type { PlaceRepository } from './PlaceRepository';

export class JSONPlaceRepository implements PlaceRepository {
	private placesPath: string;

	constructor() {
		// Resolving path relative to the executing script location isn't always reliable in all envs,
		// but for this project structure and Vite, we can try to locate 'resources/places.json'.
		// The previous code used path.resolve('../resources/places.json').
		this.placesPath = path.resolve('../resources/places.json');
	}

	private async readPlaces(): Promise<Place[]> {
		try {
			// In a real app, we might cache this or use a stream for large files.
			// For this scale, reading the file is acceptable.
			const fileContent = fs.readFileSync(this.placesPath, 'utf-8');
			return JSON.parse(fileContent) as Place[];
		} catch (error) {
			console.error('Error reading places file:', error);
			return [];
		}
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
