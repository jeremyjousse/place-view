import { describe, it, expect } from 'vitest';
import { placeService, favoritesStore } from '@place-view/core';

describe('Tauri App Core Integration', () => {
	it('loads places service', () => {
		expect(placeService).toBeDefined();
		expect(typeof placeService.getAll).toBe('function');
	});

	it('interacts with favorites store', () => {
		expect(favoritesStore).toBeDefined();
		expect(favoritesStore.isFavorite('test-id')).toBe(false);
		favoritesStore.toggle('test-id');
		expect(favoritesStore.isFavorite('test-id')).toBe(true);
		favoritesStore.toggle('test-id');
		expect(favoritesStore.isFavorite('test-id')).toBe(false);
	});
});
