import {
	addPlaceWebcam,
	createPlaceInList,
	deletePlaceInList,
	parsePlacesJson,
	removePlaceWebcam,
	reorderPlaceWebcam,
	updatePlaceInList,
	updatePlaceWebcam,
	type CreatePlaceInput,
	type FilePickerPort,
	type PathStoragePort,
	type Place,
	type PlaceDetailsUpdate,
	type PlacesRepository,
	type Webcam
} from '@place-view/core';

export interface LocalPlacesPorts {
	repository: PlacesRepository;
	filePicker: FilePickerPort;
	pathStorage: PathStoragePort;
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
		const { places, created } = createPlaceInList(this.places, input);
		await this.persistPlaces(places);
		return created;
	}

	async updatePlace(id: string, details: PlaceDetailsUpdate): Promise<Place> {
		const { places, updated } = updatePlaceInList(this.places, id, details);
		await this.persistPlaces(places);
		return updated;
	}

	async deletePlace(id: string): Promise<void> {
		const places = deletePlaceInList(this.places, id);
		await this.persistPlaces(places);
	}

	async addWebcam(placeId: string, webcam: Webcam): Promise<Place> {
		const { places, updated } = addPlaceWebcam(this.places, placeId, webcam);
		await this.persistPlaces(places);
		return updated;
	}

	async updateWebcam(placeId: string, index: number, webcam: Webcam): Promise<Place> {
		const { places, updated } = updatePlaceWebcam(this.places, placeId, index, webcam);
		await this.persistPlaces(places);
		return updated;
	}

	async removeWebcam(placeId: string, index: number): Promise<Place> {
		const { places, updated } = removePlaceWebcam(this.places, placeId, index);
		await this.persistPlaces(places);
		return updated;
	}

	async reorderWebcam(placeId: string, fromIndex: number, toIndex: number): Promise<Place> {
		const { places, updated } = reorderPlaceWebcam(this.places, placeId, fromIndex, toIndex);
		await this.persistPlaces(places);
		return updated;
	}

	private async loadFromPath(path: string, preserveSessionOnError: boolean): Promise<boolean> {
		this.isLoading = true;
		this.error = null;
		try {
			const raw = await this.ports.repository.readFile(path);
			const parsed = parsePlacesJson(raw);
			this.places = parsed;
			this.filePath = path;
			this.ports.pathStorage.setSavedPath(path);
			return true;
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Failed to load local JSON file.';
			if (!preserveSessionOnError) {
				this.filePath = null;
				this.places = [];
			}
			return false;
		} finally {
			this.isLoading = false;
		}
	}

	private async persistPlaces(nextPlaces: Place[]): Promise<void> {
		if (!this.filePath) {
			throw new Error('No local places.json file is currently selected.');
		}

		this.isSaving = true;
		this.error = null;
		try {
			const serialized = `${JSON.stringify(nextPlaces, null, 2)}\n`;
			await this.ports.repository.writeFile(this.filePath, serialized);
			this.places = nextPlaces;
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to write local JSON file.';
			this.error = message;
			throw new Error(message, { cause: err });
		} finally {
			this.isSaving = false;
		}
	}
}
