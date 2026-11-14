import type { Coordinates } from '../domain/Coordinates.js';
import type { Place } from '../domain/Place.js';
import type { Webcam } from '../domain/Webcam.js';
import { validatePlace, validateWebcam } from '../domain/PlaceValidation.js';
import { slugify } from '../utils/url-state.js';

export type CreatePlaceInput = Omit<Place, 'id'> & { id?: string };

export interface PlaceDetailsUpdate {
	name: string;
	country: string;
	state: string;
	url: string;
	description?: string;
	coordinates: Coordinates;
}

export function createPlaceInList(
	places: readonly Place[],
	input: CreatePlaceInput
): { places: Place[]; created: Place } {
	const id = (input.id?.trim() || slugify(input.name)).trim();
	if (!id) {
		throw new Error('Place name must produce a valid ID.');
	}
	if (places.some((p) => p.id === id)) {
		throw new Error(`A place with ID "${id}" already exists.`);
	}

	const candidate: Place = {
		...input,
		id,
		webcams: input.webcams ?? []
	};

	const result = validatePlace(candidate);
	if (!result.success) {
		throw new Error(result.message);
	}

	return {
		places: [...places, result.data],
		created: result.data
	};
}

export function updatePlaceInList(
	places: readonly Place[],
	id: string,
	details: PlaceDetailsUpdate
): { places: Place[]; updated: Place } {
	const existing = places.find((p) => p.id === id);
	if (!existing) {
		throw new Error(`Place "${id}" not found.`);
	}

	const candidate: Place = {
		...existing,
		name: details.name,
		country: details.country,
		state: details.state,
		url: details.url,
		description: details.description,
		coordinates: { ...details.coordinates },
		webcams: existing.webcams ?? []
	};

	const result = validatePlace(candidate);
	if (!result.success) {
		throw new Error(result.message);
	}

	return {
		places: places.map((p) => (p.id === id ? result.data : p)),
		updated: result.data
	};
}

export function deletePlaceInList(places: readonly Place[], id: string): Place[] {
	if (!places.some((p) => p.id === id)) {
		throw new Error(`Place "${id}" not found.`);
	}
	return places.filter((p) => p.id !== id);
}

function mutatePlaceWebcams(
	places: readonly Place[],
	placeId: string,
	mutator: (webcams: Webcam[]) => Webcam[] | null
): { places: Place[]; updated: Place } {
	const existing = places.find((p) => p.id === placeId);
	if (!existing) {
		throw new Error(`Place "${placeId}" not found.`);
	}

	const nextWebcams = mutator([...(existing.webcams ?? [])]);
	if (nextWebcams === null) {
		return { places: [...places], updated: existing };
	}

	const nextPlace: Place = { ...existing, webcams: nextWebcams };
	return {
		places: places.map((p) => (p.id === placeId ? nextPlace : p)),
		updated: nextPlace
	};
}

export function addPlaceWebcam(
	places: readonly Place[],
	placeId: string,
	webcam: Webcam
): { places: Place[]; updated: Place } {
	const validated = validateWebcam(webcam);
	if (!validated.success) {
		throw new Error(validated.message);
	}
	return mutatePlaceWebcams(places, placeId, (webcams) => [...webcams, validated.data]);
}

export function updatePlaceWebcam(
	places: readonly Place[],
	placeId: string,
	index: number,
	webcam: Webcam
): { places: Place[]; updated: Place } {
	const validated = validateWebcam(webcam);
	if (!validated.success) {
		throw new Error(validated.message);
	}
	return mutatePlaceWebcams(places, placeId, (webcams) => {
		if (index < 0 || index >= webcams.length) {
			throw new Error('Invalid webcam index.');
		}
		webcams[index] = validated.data;
		return webcams;
	});
}

export function removePlaceWebcam(
	places: readonly Place[],
	placeId: string,
	index: number
): { places: Place[]; updated: Place } {
	return mutatePlaceWebcams(places, placeId, (webcams) => {
		if (index < 0 || index >= webcams.length) {
			throw new Error('Invalid webcam index.');
		}
		webcams.splice(index, 1);
		return webcams;
	});
}

export function reorderPlaceWebcam(
	places: readonly Place[],
	placeId: string,
	fromIndex: number,
	toIndex: number
): { places: Place[]; updated: Place } {
	return mutatePlaceWebcams(places, placeId, (webcams) => {
		if (fromIndex < 0 || fromIndex >= webcams.length || toIndex < 0 || toIndex >= webcams.length) {
			throw new Error('Invalid webcam reorder index.');
		}
		if (fromIndex === toIndex) return null;

		const [moved] = webcams.splice(fromIndex, 1);
		webcams.splice(toIndex, 0, moved);
		return webcams;
	});
}
