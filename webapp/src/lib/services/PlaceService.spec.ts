import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PlaceService } from './PlaceService';
import type { Place } from '$lib/common/domain/Place';

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
		const place = await service.getById('val-thorens');

		expect(place).toBeDefined();
		expect(place?.name).toBe('Val Thorens');

		const nonExistent = await service.getById('non-existent');
		expect(nonExistent).toBeUndefined();
	});

	it('searches places by name, state, or country with pagination', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				json: async () => mockPlaces
			})
		);

		const service = new PlaceService();

		// Search by name
		const byName = await service.search('chamonix');
		expect(byName.places).toHaveLength(1);
		expect(byName.places[0].id).toBe('chamonix');
		expect(byName.total).toBe(1);

		// Search by country
		const byCountry = await service.search('Suisse');
		expect(byCountry.places).toHaveLength(1);
		expect(byCountry.places[0].id).toBe('zermatt');

		// Pagination
		const paginated = await service.search('', 2, 0);
		expect(paginated.places).toHaveLength(2);
		expect(paginated.hasMore).toBe(true);
		expect(paginated.total).toBe(3);

		const page2 = await service.search('', 2, 2);
		expect(page2.places).toHaveLength(1);
		expect(page2.hasMore).toBe(false);
	});

	it('forces refresh when calling refresh()', async () => {
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

	it('retains cached data if refresh fails', async () => {
		let callCount = 0;
		const fetchMock = vi.fn(() => {
			callCount++;
			if (callCount === 1) {
				return Promise.resolve({
					ok: true,
					json: async () => mockPlaces
				});
			}
			return Promise.reject(new Error('Offline'));
		});
		vi.stubGlobal('fetch', fetchMock);

		const service = new PlaceService('https://remote.test/places.json', '/fallback.json');
		const initial = await service.getAll();
		expect(initial).toEqual(mockPlaces);

		// Refresh fails, but cached data is returned
		const refreshed = await service.refresh();
		expect(refreshed).toEqual(mockPlaces);
	});
});
