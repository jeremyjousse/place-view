import { describe, expect, it } from 'vitest';
import {
	isValidHttpUrl,
	parsePlacesJson,
	validatePlace,
	validateWebcam
} from './PlaceValidation.js';

describe('PlaceValidation', () => {
	it('validates HTTP(S) URLs strictly', () => {
		expect(isValidHttpUrl('https://example.com/cam.jpg')).toBe(true);
		expect(isValidHttpUrl('http://example.com')).toBe(true);
		expect(isValidHttpUrl('ftp://example.com/file')).toBe(false);
		expect(isValidHttpUrl('javascript:alert(1)')).toBe(false);
		expect(isValidHttpUrl('')).toBe(false);
	});

	it('validates webcam entries', () => {
		const valid = validateWebcam({
			name: ' Summit ',
			largeImage: 'https://example.com/large.jpg',
			thumbnailImage: 'https://example.com/thumb.jpg'
		});
		expect(valid.success).toBe(true);
		if (valid.success) {
			expect(valid.data.name).toBe('Summit');
		}

		const invalid = validateWebcam({
			name: '',
			largeImage: 'not-a-url',
			thumbnailImage: 'https://example.com/thumb.jpg'
		});
		expect(invalid.success).toBe(false);
		if (!invalid.success) {
			expect(invalid.errors.name).toBeDefined();
			expect(invalid.errors.largeImage).toBeDefined();
		}
	});

	it('validates places including optional empty url and coordinate bounds', () => {
		const valid = validatePlace({
			id: 'samoens',
			name: 'Samoëns',
			country: 'France',
			state: 'Haute-Savoie',
			url: '',
			coordinates: { latitude: 46.08, longitude: 6.72 },
			webcams: []
		});
		expect(valid.success).toBe(true);

		const badCoords = validatePlace({
			id: 'bad',
			name: 'Bad',
			country: 'France',
			state: 'Savoie',
			url: 'ftp://invalid',
			coordinates: { latitude: 120, longitude: -200 },
			webcams: []
		});
		expect(badCoords.success).toBe(false);
		if (!badCoords.success) {
			expect(badCoords.errors.url).toBeDefined();
			expect(badCoords.errors.latitude).toBeDefined();
			expect(badCoords.errors.longitude).toBeDefined();
		}
	});

	it('parses and normalizes places.json arrays while rejecting missing coordinates or blank ids', () => {
		const parsed = parsePlacesJson(
			JSON.stringify([
				{
					id: ' demo ',
					name: ' Demo Resort ',
					coordinates: { latitude: 45.5, longitude: 6.5 }
				}
			])
		);
		expect(parsed).toEqual([
			{
				id: 'demo',
				name: 'Demo Resort',
				country: '',
				state: '',
				url: '',
				coordinates: { latitude: 45.5, longitude: 6.5 },
				webcams: []
			}
		]);

		expect(() => parsePlacesJson('{"id":"not-array"}')).toThrow();
		expect(() =>
			parsePlacesJson('[{"name":"Missing ID","coordinates":{"latitude":45,"longitude":6}}]')
		).toThrow();
		expect(() =>
			parsePlacesJson('[{"id":"   ","name":"Blank","coordinates":{"latitude":45,"longitude":6}}]')
		).toThrow();
		expect(() => parsePlacesJson('[{"id":"no-coords","name":"No Coords"}]')).toThrow();
	});
});
