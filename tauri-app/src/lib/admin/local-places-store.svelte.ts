import type {
	CreatePlaceInput,
	FilePickerPort,
	PathStoragePort,
	Place,
	PlaceDetailsUpdate,
	Webcam
} from '@place-view/core';

export interface PlaceMutationResult {
	places: Place[];
	place: Place;
}

export interface LocalPlacesBackend {
	loadPlaces: (path: string) => Promise<Place[]>;
	createPlace: (path: string, input: CreatePlaceInput) => Promise<PlaceMutationResult>;
	updatePlace: (
		path: string,
		id: string,
		details: PlaceDetailsUpdate
	) => Promise<PlaceMutationResult>;
	deletePlace: (path: string, id: string) => Promise<Place[]>;
	addWebcam: (path: string, placeId: string, webcam: Webcam) => Promise<PlaceMutationResult>;
	updateWebcam: (
		path: string,
		placeId: string,
		index: number,
		webcam: Webcam
	) => Promise<PlaceMutationResult>;
	removeWebcam: (path: string, placeId: string, index: number) => Promise<PlaceMutationResult>;
	reorderWebcam: (
		path: string,
		placeId: string,
		fromIndex: number,
		toIndex: number
	) => Promise<PlaceMutationResult>;
}

export interface LocalPlacesPorts {
	backend: LocalPlacesBackend;
	filePicker: FilePickerPort;
	pathStorage: PathStoragePort;
}

function extractErrorMessage(err: unknown, fallback: string): string {
	if (err instanceof Error && err.message) return err.message;
	if (typeof err === 'string' && err.trim()) return err;
	return fallback;
}

export class LocalPlacesStore {
	filePath = $state<string | null>(null);
	places = $state<Place[]>([]);
	isLoading = $state(false);
	isSaving = $state(false);
	error = $state<string | null>(null);
	hasAttemptedRestore = $state(false);

	constructor(private readonly ports: LocalPlacesPorts) {}

	get fileName(): string {
		if (!this.filePath) return '';
		const parts = this.filePath.split(/[\\/]/);
		return parts[parts.length - 1] || this.filePath;
	}

	async restoreRememberedFile(): Promise<boolean> {
		if (this.hasAttemptedRestore && this.filePath && this.places.length > 0) {
			return true;
		}
		this.hasAttemptedRestore = true;

		const saved = this.ports.pathStorage.getSavedPath();
		if (!saved) return false;

		return this.loadFromPath(saved, false);
	}

	async pickAndLoadFile(): Promise<boolean> {
		this.error = null;
		const selected = await this.ports.filePicker.pickFile();
		if (!selected) return false;

		return this.loadFromPath(selected, false);
	}

	async reload(): Promise<boolean> {
		if (!this.filePath) return false;
		return this.loadFromPath(this.filePath, true);
	}

	clearRememberedFile(): void {
		this.filePath = null;
		this.places = [];
		this.error = null;
		this.ports.pathStorage.setSavedPath(null);
	}

	getById(id: string): Place | undefined {
		return this.places.find((p) => p.id === id);
	}

	async createPlace(input: CreatePlaceInput): Promise<Place> {
		return this.runPlaceMutation((path) => this.ports.backend.createPlace(path, input));
	}

	async updatePlace(id: string, details: PlaceDetailsUpdate): Promise<Place> {
		return this.runPlaceMutation((path) => this.ports.backend.updatePlace(path, id, details));
	}

	async deletePlace(id: string): Promise<void> {
		const path = this.requireFilePath();
		this.isSaving = true;
		this.error = null;
		try {
			this.places = await this.ports.backend.deletePlace(path, id);
		} catch (err) {
			const message = extractErrorMessage(err, 'Failed to delete place from local JSON file.');
			this.error = message;
			throw new Error(message, { cause: err });
		} finally {
			this.isSaving = false;
		}
	}

	async addWebcam(placeId: string, webcam: Webcam): Promise<Place> {
		return this.runPlaceMutation((path) => this.ports.backend.addWebcam(path, placeId, webcam));
	}

	async updateWebcam(placeId: string, index: number, webcam: Webcam): Promise<Place> {
		return this.runPlaceMutation((path) =>
			this.ports.backend.updateWebcam(path, placeId, index, webcam)
		);
	}

	async removeWebcam(placeId: string, index: number): Promise<Place> {
		return this.runPlaceMutation((path) => this.ports.backend.removeWebcam(path, placeId, index));
	}

	async reorderWebcam(placeId: string, fromIndex: number, toIndex: number): Promise<Place> {
		return this.runPlaceMutation((path) =>
			this.ports.backend.reorderWebcam(path, placeId, fromIndex, toIndex)
		);
	}

	private requireFilePath(): string {
		if (!this.filePath) {
			throw new Error('No local places.json file is currently selected.');
		}
		return this.filePath;
	}

	private async loadFromPath(path: string, preserveSessionOnError: boolean): Promise<boolean> {
		this.isLoading = true;
		this.error = null;
		try {
			this.places = await this.ports.backend.loadPlaces(path);
			this.filePath = path;
			this.ports.pathStorage.setSavedPath(path);
			return true;
		} catch (err) {
			this.error = extractErrorMessage(err, 'Failed to load local JSON file.');
			if (!preserveSessionOnError) {
				this.filePath = null;
				this.places = [];
			}
			return false;
		} finally {
			this.isLoading = false;
		}
	}

	private async runPlaceMutation(
		mutate: (path: string) => Promise<PlaceMutationResult>
	): Promise<Place> {
		const path = this.requireFilePath();
		this.isSaving = true;
		this.error = null;
		try {
			const result = await mutate(path);
			this.places = result.places;
			return result.place;
		} catch (err) {
			const message = extractErrorMessage(err, 'Failed to update local JSON file.');
			this.error = message;
			throw new Error(message, { cause: err });
		} finally {
			this.isSaving = false;
		}
	}
}
