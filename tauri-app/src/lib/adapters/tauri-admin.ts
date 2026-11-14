import type {
	FetchTextFn,
	FilePickerPort,
	PathStoragePort,
	PlacesRepository
} from '@place-view/core';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';

const STORAGE_KEY_FILE_PATH = 'place-view:admin-places-file-path';

export const tauriPlacesRepository: PlacesRepository = {
	readFile(path: string) {
		return invoke<string>('read_local_places', { path });
	},
	writeFile(path: string, content: string) {
		return invoke<void>('write_local_places', { path, content });
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
