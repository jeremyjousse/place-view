import type { Place } from './Place.js';
import type { Webcam } from './Webcam.js';

export interface ValidationErrors {
	[field: string]: string;
}

export type ValidationResult<T> =
	{ success: true; data: T } | { success: false; errors: ValidationErrors; message: string };

export function isValidHttpUrl(value: string): boolean {
	const trimmed = value.trim();
	if (!trimmed) return false;
	try {
		const parsed = new URL(trimmed);
		return parsed.protocol === 'http:' || parsed.protocol === 'https:';
	} catch {
		return false;
	}
}

export function validateWebcam(webcam: Webcam): ValidationResult<Webcam> {
	const errors: ValidationErrors = {};
	const name = webcam.name.trim();
	const largeImage = webcam.largeImage.trim();
	const thumbnailImage = webcam.thumbnailImage.trim();

	if (!name) {
		errors.name = 'Webcam name is required.';
	}
	if (!isValidHttpUrl(largeImage)) {
		errors.largeImage = 'Large image must be a valid HTTP(S) URL.';
	}
	if (!isValidHttpUrl(thumbnailImage)) {
		errors.thumbnailImage = 'Thumbnail image must be a valid HTTP(S) URL.';
	}

	if (Object.keys(errors).length > 0) {
		return {
			success: false,
			errors,
			message: Object.values(errors)[0]
		};
	}

	return {
		success: true,
		data: {
			...(webcam.isActive !== undefined ? { isActive: webcam.isActive } : {}),
			name,
			largeImage,
			thumbnailImage
		}
	};
}

export function validatePlace(place: Place): ValidationResult<Place> {
	const errors: ValidationErrors = {};
	const id = place.id.trim();
	const name = place.name.trim();
	const country = place.country.trim();
	const state = place.state.trim();
	const url = place.url.trim();
	const description = place.description?.trim();
	const latitude = Number(place.coordinates?.latitude);
	const longitude = Number(place.coordinates?.longitude);

	if (!id) {
		errors.id = 'Place ID is required.';
	}
	if (!name) {
		errors.name = 'Place name is required.';
	}
	if (!country) {
		errors.country = 'Country is required.';
	}
	if (!state) {
		errors.state = 'State / region is required.';
	}
	if (url && !isValidHttpUrl(url)) {
		errors.url = 'Official URL must be a valid HTTP(S) URL.';
	}
	if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
		errors.latitude = 'Latitude must be between -90 and 90.';
	}
	if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
		errors.longitude = 'Longitude must be between -180 and 180.';
	}

	const validatedWebcams: Webcam[] = [];
	for (let i = 0; i < (place.webcams ?? []).length; i++) {
		const res = validateWebcam(place.webcams[i]);
		if (!res.success) {
			errors[`webcams.${i}`] = res.message;
		} else {
			validatedWebcams.push(res.data);
		}
	}

	if (Object.keys(errors).length > 0) {
		return {
			success: false,
			errors,
			message: Object.values(errors)[0]
		};
	}

	const normalized: Place = {
		id,
		name,
		country,
		state,
		url,
		coordinates: {
			latitude,
			longitude
		},
		webcams: validatedWebcams
	};

	if (description) {
		normalized.description = description;
	}

	return {
		success: true,
		data: normalized
	};
}

export function parsePlacesJson(raw: string): Place[] {
	const parsed: unknown = JSON.parse(raw);
	if (!Array.isArray(parsed)) {
		throw new Error('Selected JSON file must contain a top-level array of places.');
	}

	return parsed.map((item, index) => {
		if (!item || typeof item !== 'object') {
			throw new Error(`Invalid place entry at index ${index}.`);
		}
		const record = item as Record<string, unknown>;
		const id = typeof record.id === 'string' ? record.id.trim() : '';
		const name = typeof record.name === 'string' ? record.name.trim() : '';
		if (!id || !name) {
			throw new Error(`Place at index ${index} is missing required "id" or "name".`);
		}

		const coords =
			record.coordinates && typeof record.coordinates === 'object'
				? (record.coordinates as Record<string, unknown>)
				: null;

		const latitude = coords?.latitude;
		const longitude = coords?.longitude;
		if (
			typeof latitude !== 'number' ||
			!Number.isFinite(latitude) ||
			latitude < -90 ||
			latitude > 90 ||
			typeof longitude !== 'number' ||
			!Number.isFinite(longitude) ||
			longitude < -180 ||
			longitude > 180
		) {
			throw new Error(`Place "${id}" at index ${index} has invalid or missing coordinates.`);
		}

		const webcamsRaw = Array.isArray(record.webcams) ? record.webcams : [];
		const webcams: Webcam[] = webcamsRaw
			.filter((w): w is Record<string, unknown> => Boolean(w && typeof w === 'object'))
			.map((w) => ({
				name: typeof w.name === 'string' ? w.name : '',
				largeImage: typeof w.largeImage === 'string' ? w.largeImage : '',
				thumbnailImage: typeof w.thumbnailImage === 'string' ? w.thumbnailImage : '',
				...(typeof w.isActive === 'boolean' ? { isActive: w.isActive } : {})
			}));

		const place: Place = {
			id,
			name,
			country: typeof record.country === 'string' ? record.country : '',
			state: typeof record.state === 'string' ? record.state : '',
			url: typeof record.url === 'string' ? record.url : '',
			coordinates: { latitude, longitude },
			webcams
		};

		if (typeof record.description === 'string' && record.description.trim()) {
			place.description = record.description;
		}

		return place;
	});
}
