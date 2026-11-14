import { describe, expect, it } from 'vitest';
import type { Place } from '../domain/Place.js';
import {
	addPlaceWebcam,
	createPlaceInList,
	deletePlaceInList,
	removePlaceWebcam,
	reorderPlaceWebcam,
	updatePlaceInList,
	updatePlaceWebcam
} from './PlaceMutations.js';

const initial: Place[] = [
	{
		id: 'albiez',
		name: 'Albiez',
		country: 'France',
		state: 'Savoie',
		url: 'https://www.albiez.fr',
		coordinates: { latitude: 45.21, longitude: 6.34 },
		webcams: []
	}
];

describe('PlaceMutations', () => {
	it('creates, updates, mutates webcams, and deletes places purely', () => {
		const { places: afterCreate, created } = createPlaceInList(initial, {
			name: 'Chamonix Mont-Blanc',
			country: 'France',
			state: 'Haute-Savoie',
			url: 'https://www.chamonix.com',
			coordinates: { latitude: 45.9237, longitude: 6.8694 },
			webcams: []
		});
		expect(created.id).toBe('chamonix-mont-blanc');
		expect(afterCreate).toHaveLength(2);
		expect(initial).toHaveLength(1);

		expect(() =>
			createPlaceInList(afterCreate, {
				name: 'Chamonix Mont-Blanc',
				country: 'France',
				state: 'Haute-Savoie',
				url: '',
				coordinates: { latitude: 45.92, longitude: 6.86 },
				webcams: []
			})
		).toThrow(/already exists/i);

		const { places: afterCam1 } = addPlaceWebcam(afterCreate, created.id, {
			name: 'Cam A',
			largeImage: 'https://example.com/a-large.jpg',
			thumbnailImage: 'https://example.com/a-small.jpg'
		});
		const { places: afterCam2 } = addPlaceWebcam(afterCam1, created.id, {
			name: 'Cam B',
			largeImage: 'https://example.com/b-large.jpg',
			thumbnailImage: 'https://example.com/b-small.jpg'
		});
		const { places: afterReorder, updated: reordered } = reorderPlaceWebcam(
			afterCam2,
			created.id,
			0,
			1
		);
		expect(reordered.webcams.map((w) => w.name)).toEqual(['Cam B', 'Cam A']);

		const { places: afterUpdateCam, updated: updatedCam } = updatePlaceWebcam(
			afterReorder,
			created.id,
			0,
			{
				name: 'Cam B Updated',
				largeImage: 'https://example.com/b-large.jpg',
				thumbnailImage: 'https://example.com/b-small.jpg'
			}
		);
		expect(updatedCam.webcams[0].name).toBe('Cam B Updated');

		const { places: afterRemove, updated: afterRemPlace } = removePlaceWebcam(
			afterUpdateCam,
			created.id,
			1
		);
		expect(afterRemPlace.webcams).toHaveLength(1);

		const { places: afterPlaceUpdate, updated: updatedPlace } = updatePlaceInList(
			afterRemove,
			created.id,
			{
				name: 'Chamonix',
				country: 'France',
				state: 'Haute-Savoie',
				url: 'https://www.chamonix.com',
				coordinates: { latitude: 45.92, longitude: 6.87 }
			}
		);
		expect(updatedPlace.name).toBe('Chamonix');
		expect(updatedPlace.webcams).toHaveLength(1);

		const afterDelete = deletePlaceInList(afterPlaceUpdate, 'albiez');
		expect(afterDelete).toHaveLength(1);
	});
});
