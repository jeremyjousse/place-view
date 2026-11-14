import {
	detectWebcamFromUrl,
	searchLocations,
	type LocationPrediction,
	type Webcam
} from '@place-view/core';
import type { ToastType } from '@place-view/ui';
import { getContext, setContext } from 'svelte';
import {
	localStoragePathStorage,
	tauriFetchText,
	tauriFilePicker,
	tauriPlacesRepository
} from '#lib/adapters/tauri-admin';
import { LocalPlacesStore } from '#lib/admin/local-places-store.svelte';
import { addToast } from '#lib/admin/toast.svelte';

export interface AdminContextValue {
	placesStore: LocalPlacesStore;
	notify: (message: string, type?: ToastType) => void;
	detectWebcam: (url: string) => Promise<Webcam | null>;
	searchLocations: (query: string) => Promise<LocationPrediction[]>;
}

const ADMIN_CONTEXT_KEY = Symbol('place-view-admin-context');

export function createTauriAdminContext(): AdminContextValue {
	const placesStore = new LocalPlacesStore({
		repository: tauriPlacesRepository,
		filePicker: tauriFilePicker,
		pathStorage: localStoragePathStorage
	});

	return {
		placesStore,
		notify: (message, type = 'info') => {
			addToast(message, type);
		},
		detectWebcam: (url) => detectWebcamFromUrl(url, tauriFetchText),
		searchLocations: (query) => searchLocations(query, tauriFetchText)
	};
}

export function setAdminContext(value: AdminContextValue): AdminContextValue {
	setContext(ADMIN_CONTEXT_KEY, value);
	return value;
}

export function getAdminContext(): AdminContextValue {
	const ctx = getContext<AdminContextValue | undefined>(ADMIN_CONTEXT_KEY);
	if (!ctx) {
		throw new Error('Admin context is not initialized. Ensure route is under /admin/.');
	}
	return ctx;
}
