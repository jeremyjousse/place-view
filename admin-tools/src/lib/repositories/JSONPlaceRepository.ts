import type { IPlaceRepository } from './IPlaceRepository';
import type { Place } from '../domain/Place';
import fs from 'node:fs/promises';
import path from 'node:path';

export class JSONPlaceRepository implements IPlaceRepository {
	private readonly dataFile: string;

	constructor(dataFolder: string = 'resources') {
		if (path.isAbsolute(dataFolder)) {
			this.dataFile = path.join(dataFolder, 'places.json');
		} else {
			this.dataFile = path.join(process.cwd(), dataFolder, 'places.json');
		}
	}

	async fetchAll(): Promise<Place[]> {
		try {
			const data = await fs.readFile(this.dataFile, 'utf-8');
			return JSON.parse(data) as Place[];
		} catch (error) {
			console.error('Error reading places.json:', error);
			return [];
		}
	}

	async fetchOne(id: string): Promise<Place | null> {
		const places = await this.fetchAll();
		return places.find((p) => p.id === id) || null;
	}

	async persist(place: Place): Promise<void> {
		const places = await this.fetchAll();
		const index = places.findIndex((p) => p.id === place.id);

		if (index !== -1) {
			places[index] = place;
		} else {
			places.push(place);
		}

		await fs.writeFile(this.dataFile, JSON.stringify(places, null, 2));
	}

	async delete(id: string): Promise<void> {
		const places = await this.fetchAll();
		const updatedPlaces = places.filter((p) => p.id !== id);

		if (places.length === updatedPlaces.length) {
			throw new Error(`Place with ID ${id} not found`);
		}

		await fs.writeFile(this.dataFile, JSON.stringify(updatedPlaces, null, 2));
	}
}
