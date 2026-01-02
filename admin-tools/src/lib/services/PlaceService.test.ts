import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PlaceService } from './PlaceService';
import type { IPlaceRepository } from '../repositories/IPlaceRepository';
import type { Place } from '../domain/Place';

// Mock Repository
const mockPlace: Place = {
	id: 'test-place',
	name: 'Test Place',
	country: 'Test Country',
	state: 'Test State',
	url: 'https://example.com',
	coordinates: { latitude: 0, longitude: 0 },
	webcams: []
};

const mockRepository = {
	fetchAll: vi.fn(),
	fetchOne: vi.fn(),
	persist: vi.fn()
};

describe('PlaceService', () => {
	let service: PlaceService;

	beforeEach(() => {
		vi.clearAllMocks();
		service = new PlaceService(mockRepository as unknown as IPlaceRepository);
	});

	it('should get all places', async () => {
		mockRepository.fetchAll.mockResolvedValue([mockPlace]);
		const places = await service.getAllPlaces();
		expect(places).toHaveLength(1);
		expect(places[0]).toEqual(mockPlace);
		expect(mockRepository.fetchAll).toHaveBeenCalled();
	});

	it('should get place by id', async () => {
		mockRepository.fetchOne.mockResolvedValue(mockPlace);
		const place = await service.getPlaceById('test-place');
		expect(place).toEqual(mockPlace);
		expect(mockRepository.fetchOne).toHaveBeenCalledWith('test-place');
	});

	it('should save a valid place', async () => {
		await service.savePlace(mockPlace);
		expect(mockRepository.persist).toHaveBeenCalledWith(mockPlace);
	});

	it('should throw error when saving invalid place', async () => {
		const invalidPlace = { ...mockPlace, url: 'invalid-url' };
		await expect(service.savePlace(invalidPlace)).rejects.toThrow('Validation failed');
		expect(mockRepository.persist).not.toHaveBeenCalled();
	});

	it('should update webcams for existing place', async () => {
		mockRepository.fetchOne.mockResolvedValue({ ...mockPlace });
		const newWebcams = [
			{ name: 'Cam 1', largeImage: 'https://a.com/l.jpg', thumbnailImage: 'https://a.com/t.jpg' }
		];

		await service.updateWebcams('test-place', newWebcams);

		expect(mockRepository.persist).toHaveBeenCalledWith(
			expect.objectContaining({
				id: 'test-place',
				webcams: newWebcams
			})
		);
	});

	it('should throw error when updating webcams for non-existent place', async () => {
		mockRepository.fetchOne.mockResolvedValue(null);
		await expect(service.updateWebcams('unknown', [])).rejects.toThrow(
			'Place with ID unknown not found'
		);
	});
});
