export type FetchTextFn = (url: string) => Promise<string>;

export interface PlacesRepository {
	readFile: (path: string) => Promise<string>;
	writeFile: (path: string, content: string) => Promise<void>;
}

export interface FilePickerPort {
	pickFile: () => Promise<string | null>;
}

export interface PathStoragePort {
	getSavedPath: () => string | null;
	setSavedPath: (path: string | null) => void;
}
