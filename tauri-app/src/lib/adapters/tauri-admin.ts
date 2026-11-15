import type {
	CreatePlaceInput,
	FetchTextFn,
	FilePickerPort,
	PathStoragePort,
	Place,
	PlaceDetailsUpdate,
	Webcam
} from '@place-view/core';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import type { LocalPlacesBackend, PlaceMutationResult } from '#lib/admin/local-places-store.svelte';

const STORAGE_KEY_FILE_PATH = 'place-view:admin-places-file-path';

export const tauriPlacesBackend: LocalPlacesBackend = {
	loadPlaces(path: string) {
		return invoke<Place[]>('load_local_places', { path });
	},
	createPlace(path: string, input: CreatePlaceInput) {
		return invoke<PlaceMutationResult>('create_local_place', { path, input });
	},
	updatePlace(path: string, id: string, details: PlaceDetailsUpdate) {
		return invoke<PlaceMutationResult>('update_local_place', { path, id, details });
	},
	deletePlace(path: string, id: string) {
		return invoke<Place[]>('delete_local_place', { path, id });
	},
	addWebcam(path: string, placeId: string, webcam: Webcam) {
		return invoke<PlaceMutationResult>('add_local_place_webcam', { path, placeId, webcam });
	},
	updateWebcam(path: string, placeId: string, index: number, webcam: Webcam) {
		return invoke<PlaceMutationResult>('update_local_place_webcam', {
			path,
			placeId,
			index,
			webcam
		});
	},
	removeWebcam(path: string, placeId: string, index: number) {
		return invoke<PlaceMutationResult>('remove_local_place_webcam', { path, placeId, index });
	},
	reorderWebcam(path: string, placeId: string, fromIndex: number, toIndex: number) {
		return invoke<PlaceMutationResult>('reorder_local_place_webcam', {
			path,
			placeId,
			fromIndex,
			toIndex
		});
	}
};

export const tauriFilePicker: FilePickerPort = {
	async pickFile() {
		const selected = await open({
			title: 'Select local places.json file',
			multiple: false,
			directory: false,
			filters: [{ name: 'JSON Files', extensions: ['json'] }]
		});
		return typeof selected === 'string' ? selected : null;
	}
};

export const localStoragePathStorage: PathStoragePort = {
	getSavedPath() {
		if (typeof localStorage === 'undefined') return null;
		return localStorage.getItem(STORAGE_KEY_FILE_PATH);
	},
	setSavedPath(path: string | null) {
		if (typeof localStorage === 'undefined') return;
		if (path) {
			localStorage.setItem(STORAGE_KEY_FILE_PATH, path);
		} else {
			localStorage.removeItem(STORAGE_KEY_FILE_PATH);
		}
	}
};

export const tauriFetchText: FetchTextFn = (url: string) =>
	invoke<string>('fetch_external_text', { url });
