import type { IPlaceService } from './IPlaceService';
import type { IPlaceRepository } from '../repositories/IPlaceRepository';
import type { Place } from '../domain/Place';
import type { Webcam } from '../domain/Webcam';
import { PlaceSchema } from '../domain/schemas';

export class PlaceService implements IPlaceService {
	constructor(private readonly placeRepository: IPlaceRepository) {}

	async getAllPlaces(): Promise<Place[]> {
		return this.placeRepository.fetchAll();
	}

	async getPlaceById(id: string): Promise<Place | null> {
		return this.placeRepository.fetchOne(id);
	}

	async savePlace(place: Place): Promise<void> {
		// Validate using Zod
		const validationResult = PlaceSchema.safeParse(place);
		if (!validationResult.success) {
			throw new Error(`Validation failed: ${validationResult.error.message}`);
		}
		// Persist the validated and stripped data
		await this.placeRepository.persist(validationResult.data);
	}

	async updateWebcams(placeId: string, webcams: Webcam[]): Promise<void> {
		const place = await this.placeRepository.fetchOne(placeId);
		if (!place) {
			throw new Error(`Place with ID ${placeId} not found`);
		}

		// Update only the webcams
		place.webcams = webcams;

		// Validate the updated place
		const validationResult = PlaceSchema.safeParse(place);
		if (!validationResult.success) {
			throw new Error(`Validation failed: ${validationResult.error.message}`);
		}

		// Persist the validated and stripped data
		await this.placeRepository.persist(validationResult.data);
	}

	async deletePlace(id: string): Promise<void> {
		await this.placeRepository.delete(id);
	}

	async updatePlaceDetails(
		id: string,
		details: {
			name: string;
			country: string;
			state: string;
			url: string;
			coordinates: { latitude: number; longitude: number };
		}
	): Promise<void> {
		const place = await this.getPlaceByIdOrThrow(id);
		const updatedPlace: Place = {
			...place,
			...details
		};
		await this.savePlace(updatedPlace);
	}

	async addWebcam(placeId: string, webcam: Webcam): Promise<void> {
		const place = await this.getPlaceByIdOrThrow(placeId);
		const webcams = [...(place.webcams || []), webcam];
		await this.updateWebcams(placeId, webcams);
	}

	async removeWebcam(placeId: string, index: number): Promise<void> {
		const place = await this.getPlaceByIdOrThrow(placeId);
		const webcams = [...(place.webcams || [])];

		if (index < 0 || index >= webcams.length) {
			throw new Error('Invalid webcam index');
		}

		webcams.splice(index, 1);
		await this.updateWebcams(placeId, webcams);
	}

	async reorderWebcam(placeId: string, index: number, direction: 'up' | 'down'): Promise<void> {
		const place = await this.getPlaceByIdOrThrow(placeId);
		const webcams = [...(place.webcams || [])];

		if (index < 0 || index >= webcams.length) {
			throw new Error('Invalid webcam index');
		}

		const newIndex = direction === 'up' ? index - 1 : index + 1;
		if (newIndex < 0 || newIndex >= webcams.length) {
			throw new Error('Invalid reorder target index');
		}

		// Swap
		[webcams[index], webcams[newIndex]] = [webcams[newIndex], webcams[index]];

		await this.updateWebcams(placeId, webcams);
	}

	private async getPlaceByIdOrThrow(id: string): Promise<Place> {
		const place = await this.placeRepository.fetchOne(id);
		if (!place) {
			throw new Error(`Place with ID ${id} not found`);
		}
		return place;
	}
}
