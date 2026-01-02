import type { Place } from '../domain/Place';
import type { Webcam } from '../domain/Webcam';

export interface IPlaceService {
	getAllPlaces(): Promise<Place[]>;
	getPlaceById(id: string): Promise<Place | null>;
	savePlace(place: Place): Promise<void>;
	updateWebcams(placeId: string, webcams: Webcam[]): Promise<void>;
	deletePlace(id: string): Promise<void>;
	updatePlaceDetails(
		id: string,
		details: {
			name: string;
			country: string;
			state: string;
			url: string;
			coordinates: { latitude: number; longitude: number };
		}
	): Promise<void>;
	addWebcam(placeId: string, webcam: Webcam): Promise<void>;
	removeWebcam(placeId: string, index: number): Promise<void>;
	reorderWebcam(placeId: string, index: number, direction: 'up' | 'down'): Promise<void>;
}
