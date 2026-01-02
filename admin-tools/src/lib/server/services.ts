import { env } from '$env/dynamic/private';
import { PlaceService } from '$lib/services/PlaceService';
import { JSONPlaceRepository } from '$lib/repositories/JSONPlaceRepository';
import { WebcamDetectorService } from '$lib/services/WebcamDetectorService';
import { GeocodeService } from '$lib/services/GeocodeService';

// Singleton instances of services
// This ensures we reuse the same repository instance and service logic
const placeRepository = new JSONPlaceRepository(env.PLACES_DATA_FOLDER);
export const placeService = new PlaceService(placeRepository);
export const webcamDetectorService = new WebcamDetectorService();
export const geocodeService = new GeocodeService();
