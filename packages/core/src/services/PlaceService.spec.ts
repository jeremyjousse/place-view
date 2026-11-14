import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	filterAdminPlaces,
	isPlaceMissingMeta,
	matchesPlaceQuery,
	PlaceService
} from './PlaceService';
import type { Place } from '../domain/Place';

const mockPlaces: Place[] = [
	{
		id: 'chamonix',
		name: 'Chamonix-Mont-Blanc',
		state: 'Haute-Savoie',
		country: 'France',
		url: 'https://chamonix.com',
		coordinates: { latitude: 45.9237, longitude: 6.8694 },
		webcams: [
			{
				name: 'Aiguille du Midi',
				largeImage: 'https://example.com/chamonix_large.jpg',
				thumbnailImage: 'https://example.com/chamonix_thumb.jpg'
			}
		]
	},
	{
		id: 'val-thorens',
		name: 'Val Thorens',
		state: 'Savoie',
		country: 'France',
		url: 'https://valthorens.com',
		coordinates: { latitude: 45.2975, longitude: 6.58 },
		webcams: [
			{
				name: 'Caron',
				largeImage: 'https://example.com/valthorens_large.jpg',
				thumbnailImage: 'https://example.com/valthorens_thumb.jpg'
			}
		]
	},
	{
		id: 'zermatt',
		name: 'Zermatt',
		state: 'Valais',
		country: 'Suisse',
		url: 'https://zermatt.ch',
		coordinates: { latitude: 45.9765, longitude: 7.7491 },
		webcams: [
			{
				name: 'Matterhorn',
				largeImage: 'https://example.com/zermatt_large.jpg',
				thumbnailImage: 'https://example.com/zermatt_thumb.jpg'
			}
		]
	}
];

describe('PlaceService', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it('fetches places from remote URL and caches them', async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => mockPlaces
		});
		vi.stubGlobal('fetch', fetchMock);

		const service = new PlaceService('https://remote.test/places.json', '/fallback.json');
		const places = await service.getAll();

		expect(places).toEqual(mockPlaces);
		expect(fetchMock).toHaveBeenCalledTimes(1);

		// Second call should use cache
		const cached = await service.getAll();
		expect(cached).toEqual(mockPlaces);
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it('falls back to local JSON if remote fetch fails', async () => {
		const fetchMock = vi.fn((url: string) => {
			if (url.includes('remote.test')) {
				return Promise.reject(new Error('Network error'));
			}
			return Promise.resolve({
				ok: true,
				json: async () => mockPlaces
			});
		});
		vi.stubGlobal('fetch', fetchMock);

		const service = new PlaceService('https://remote.test/places.json', '/fallback.json');
		const places = await service.getAll();

		expect(places).toEqual(mockPlaces);
		expect(fetchMock).toHaveBeenCalledTimes(2);
	});

	it('finds place by ID', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				json: async () => mockPlaces
			})
		);

		const service = new PlaceService();
		const place = await service.getById('chamonix');
		expect(place?.name).toBe('Chamonix-Mont-Blanc');

		const nonExistent = await service.getById('non-existent');
		expect(nonExistent).toBeUndefined();
	});

	it('searches places with filtering and pagination', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				json: async () => mockPlaces
			})
		);

		const service = new PlaceService();

		// Search by name
		const searchByName = await service.search('chamonix');
		expect(searchByName.places).toHaveLength(1);
		expect(searchByName.places[0].id).toBe('chamonix');
		expect(searchByName.total).toBe(1);
		expect(searchByName.hasMore).toBe(false);

		// Search by state
		const searchByState = await service.search('savoie');
		expect(searchByState.places).toHaveLength(2); // Haute-Savoie and Savoie

		// Search by country
		const searchByCountry = await service.search('suisse');
		expect(searchByCountry.places).toHaveLength(1);
		expect(searchByCountry.places[0].id).toBe('zermatt');

		// Pagination
		const paginated = await service.search('', 1, 0);
		expect(paginated.places).toHaveLength(1);
		expect(paginated.places[0].id).toBe('chamonix');
		expect(paginated.total).toBe(3);
		expect(paginated.hasMore).toBe(true);

		const page2 = await service.search('', 1, 1);
		expect(page2.places).toHaveLength(1);
		expect(page2.places[0].id).toBe('val-thorens');
		expect(page2.hasMore).toBe(true);
	});

	it('force refreshes places cache', async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => mockPlaces
		});
		vi.stubGlobal('fetch', fetchMock);

		const service = new PlaceService('https://remote.test/places.json');
		await service.getAll();
		expect(fetchMock).toHaveBeenCalledTimes(1);

		await service.refresh();
		expect(fetchMock).toHaveBeenCalledTimes(2);
	});

	it('filters admin places by mode and query including id', () => {
		const places: Place[] = [
			...mockPlaces,
			{
				id: 'incomplete-spot',
				name: 'Incomplete Spot',
				state: '',
				country: 'France',
				url: '',
				coordinates: { latitude: 45, longitude: 6 },
				webcams: []
			}
		];

		expect(matchesPlaceQuery(places[0], 'chamonix')).toBe(true);
		expect(matchesPlaceQuery(places[1], 'val-thorens', false)).toBe(false);
		expect(matchesPlaceQuery(places[1], 'val-thorens', true)).toBe(true);
		expect(isPlaceMissingMeta(places[3])).toBe(true);
		expect(filterAdminPlaces(places, '', 'no-webcams').map((p) => p.id)).toEqual([
			'incomplete-spot'
		]);
		expect(filterAdminPlaces(places, 'incomplete', 'missing-meta').map((p) => p.id)).toEqual([
			'incomplete-spot'
		]);
	});
});
