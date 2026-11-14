import { describe, expect, it } from 'vitest';
import { LocalPlacesStore, type LocalPlacesPorts } from './local-places-store.svelte';

function createMemoryPorts(initialFileContent?: string): {
	ports: LocalPlacesPorts;
	getDiskContent: () => string;
	setDiskContent: (next: string) => void;
	getSavedPath: () => string | null;
} {
	let diskPath: string | null = initialFileContent ? '/tmp/places.json' : null;
	let diskContent = initialFileContent ?? '[]';
	let savedPath: string | null = null;

	const ports: LocalPlacesPorts = {
		filePicker: {
			async pickFile() {
				return diskPath;
			}
		},
		repository: {
			async readFile(path: string) {
				if (path !== diskPath) {
					throw new Error('File not found');
				}
				return diskContent;
			},
			async writeFile(path: string, content: string) {
				diskPath = path;
				diskContent = content;
			}
		},
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
		getDiskContent: () => diskContent,
		setDiskContent: (next: string) => {
			diskContent = next;
		},
		getSavedPath: () => savedPath
	};
}

describe('LocalPlacesStore', () => {
	it('picks, remembers, creates, updates, manages webcams, and deletes places', async () => {
		const mem = createMemoryPorts(
			JSON.stringify([
				{
					id: 'albiez',
					name: 'Albiez',
					country: 'France',
					state: 'Savoie',
					url: 'https://www.albiez.fr',
					coordinates: { latitude: 45.21, longitude: 6.34 },
					webcams: []
				}
			])
		);

		const store = new LocalPlacesStore(mem.ports);
		expect(await store.pickAndLoadFile()).toBe(true);
		expect(store.places).toHaveLength(1);
		expect(mem.getSavedPath()).toBe('/tmp/places.json');

		const restoredStore = new LocalPlacesStore(mem.ports);
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
		expect(store.places).toHaveLength(2);

		await store.addWebcam('chamonix-mont-blanc', {
			name: 'Cam A',
			largeImage: 'https://example.com/a-large.jpg',
			thumbnailImage: 'https://example.com/a-small.jpg'
		});
		expect(store.getById('chamonix-mont-blanc')?.webcams).toHaveLength(1);

		await store.deletePlace('albiez');
		expect(store.places).toHaveLength(1);
		expect(JSON.parse(mem.getDiskContent())).toHaveLength(1);
	});

	it('preserves active session when reload fails on invalid JSON', async () => {
		const mem = createMemoryPorts(
			JSON.stringify([
				{
					id: 'albiez',
					name: 'Albiez',
					country: 'France',
					state: 'Savoie',
					url: 'https://www.albiez.fr',
					coordinates: { latitude: 45.21, longitude: 6.34 },
					webcams: []
				}
			])
		);

		const store = new LocalPlacesStore(mem.ports);
		expect(await store.pickAndLoadFile()).toBe(true);

		mem.setDiskContent('{corrupted');
		expect(await store.reload()).toBe(false);
		expect(store.filePath).toBe('/tmp/places.json');
		expect(store.places).toHaveLength(1);
		expect(store.error).toBeTruthy();
	});
});
