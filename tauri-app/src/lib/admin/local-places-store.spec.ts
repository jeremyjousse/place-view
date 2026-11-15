import type { Place } from '@place-view/core';
import { describe, expect, it, vi } from 'vitest';
import {
	LocalPlacesStore,
	type LocalPlacesBackend,
	type LocalPlacesPorts
} from './local-places-store.svelte';

function createMockPorts(initialPlaces: Place[]): {
	ports: LocalPlacesPorts;
	backend: LocalPlacesBackend;
	setFailLoad: (message: string | null) => void;
	getSavedPath: () => string | null;
} {
	const diskPath = '/tmp/places.json';
	let savedPath: string | null = null;
	let places = [...initialPlaces];
	let loadFailure: string | null = null;

	const sortById = (items: Place[]) =>
		[...items].sort((a, b) => a.id.toLowerCase().localeCompare(b.id.toLowerCase()));

	const backend: LocalPlacesBackend = {
		loadPlaces: vi.fn(async (path: string) => {
			if (loadFailure) throw loadFailure;
			if (path !== diskPath) throw new Error('File not found');
			return places;
		}),
		createPlace: vi.fn(async (_path, input) => {
			const created: Place = {
				id: input.id?.trim() || 'chamonix-mont-blanc',
				name: input.name,
				country: input.country,
				state: input.state,
				url: input.url,
				...(input.description ? { description: input.description } : {}),
				coordinates: input.coordinates,
				webcams: input.webcams ?? []
			};
			places = sortById([...places, created]);
			return { places, place: created };
		}),
		updatePlace: vi.fn(async (_path, id, details) => {
			const existing = places.find((p) => p.id === id);
			if (!existing) throw `Place "${id}" not found.`;
			const updated: Place = { ...existing, ...details };
			places = sortById(places.map((p) => (p.id === id ? updated : p)));
			return { places, place: updated };
		}),
		deletePlace: vi.fn(async (_path, id) => {
			places = sortById(places.filter((p) => p.id !== id));
			return places;
		}),
		addWebcam: vi.fn(async (_path, placeId, webcam) => {
			const existing = places.find((p) => p.id === placeId);
			if (!existing) throw `Place "${placeId}" not found.`;
			const updated: Place = { ...existing, webcams: [...existing.webcams, webcam] };
			places = places.map((p) => (p.id === placeId ? updated : p));
			return { places, place: updated };
		}),
		updateWebcam: vi.fn(async (_path, placeId, index, webcam) => {
			const existing = places.find((p) => p.id === placeId)!;
			const webcams = existing.webcams.map((w, i) => (i === index ? webcam : w));
			const updated: Place = { ...existing, webcams };
			places = places.map((p) => (p.id === placeId ? updated : p));
			return { places, place: updated };
		}),
		removeWebcam: vi.fn(async (_path, placeId, index) => {
			const existing = places.find((p) => p.id === placeId)!;
			const updated: Place = {
				...existing,
				webcams: existing.webcams.filter((_, i) => i !== index)
			};
			places = places.map((p) => (p.id === placeId ? updated : p));
			return { places, place: updated };
		}),
		reorderWebcam: vi.fn(async (_path, placeId, fromIndex, toIndex) => {
			const existing = places.find((p) => p.id === placeId)!;
			const webcams = [...existing.webcams];
			const [moved] = webcams.splice(fromIndex, 1);
			webcams.splice(toIndex, 0, moved);
			const updated: Place = { ...existing, webcams };
			places = places.map((p) => (p.id === placeId ? updated : p));
			return { places, place: updated };
		})
	};

	const ports: LocalPlacesPorts = {
		filePicker: {
			async pickFile() {
				return diskPath;
			}
		},
		backend,
		pathStorage: {
			getSavedPath() {
				return savedPath;
			},
			setSavedPath(path: string | null) {
				savedPath = path;
			}
		}
	};

	return {
		ports,
		backend,
		setFailLoad: (message: string | null) => {
			loadFailure = message;
		},
		getSavedPath: () => savedPath
	};
}

describe('LocalPlacesStore', () => {
	const seedPlace: Place = {
		id: 'val-thorens',
		name: 'Val Thorens',
		country: 'France',
		state: 'Savoie',
		url: 'https://www.valthorens.com',
		coordinates: { latitude: 45.2979, longitude: 6.5802 },
		webcams: []
	};

	it('delegates load and mutations to backend and syncs sorted places state', async () => {
		const mock = createMockPorts([seedPlace]);
		const store = new LocalPlacesStore(mock.ports);

		expect(await store.pickAndLoadFile()).toBe(true);
		expect(store.places).toHaveLength(1);
		expect(mock.getSavedPath()).toBe('/tmp/places.json');

		const restoredStore = new LocalPlacesStore(mock.ports);
		expect(await restoredStore.restoreRememberedFile()).toBe(true);
		expect(restoredStore.places).toHaveLength(1);

		const created = await store.createPlace({
			name: 'Chamonix Mont-Blanc',
			country: 'France',
			state: 'Haute-Savoie',
			url: 'https://www.chamonix.com',
			coordinates: { latitude: 45.9237, longitude: 6.8694 },
			webcams: []
		});
		expect(created.id).toBe('chamonix-mont-blanc');
		expect(store.places.map((p) => p.id)).toEqual(['chamonix-mont-blanc', 'val-thorens']);

		await store.addWebcam('chamonix-mont-blanc', {
			name: 'Cam A',
			largeImage: 'https://example.com/a-large.jpg',
			thumbnailImage: 'https://example.com/a-small.jpg'
		});
		expect(store.getById('chamonix-mont-blanc')?.webcams).toHaveLength(1);

		await store.deletePlace('val-thorens');
		expect(store.places.map((p) => p.id)).toEqual(['chamonix-mont-blanc']);
	});

	it('preserves active session and surfaces string IPC errors when reload fails', async () => {
		const mock = createMockPorts([seedPlace]);
		const store = new LocalPlacesStore(mock.ports);
		expect(await store.pickAndLoadFile()).toBe(true);

		mock.setFailLoad('Invalid JSON content: expected value');
		expect(await store.reload()).toBe(false);
		expect(store.filePath).toBe('/tmp/places.json');
		expect(store.places).toHaveLength(1);
		expect(store.error).toBe('Invalid JSON content: expected value');
	});

	it('rejects mutations when no file is selected', async () => {
		const mock = createMockPorts([seedPlace]);
		const store = new LocalPlacesStore(mock.ports);

		await expect(store.deletePlace('val-thorens')).rejects.toThrow(/no local places\.json file/i);
	});
});
