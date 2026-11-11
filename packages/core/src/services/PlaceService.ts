import type { Place } from '../domain/Place.js';

export interface SearchPlacesResult {
	places: Place[];
	total: number;
	hasMore: boolean;
}

export const REMOTE_PLACES_URL = 'https://jeremyjousse.github.io/place-view/places.json';
export const LOCAL_FALLBACK_URL = '/places.json';

export class PlaceService {
	private cachedPlaces: Place[] | null = null;
	private fetchPromise: Promise<Place[]> | null = null;

	constructor(
		private readonly remoteUrl: string = REMOTE_PLACES_URL,
		private readonly fallbackUrl: string = LOCAL_FALLBACK_URL
	) {}

	async getAll(forceRefresh = false): Promise<Place[]> {
		if (this.cachedPlaces && !forceRefresh) {
			return this.cachedPlaces;
		}

		if (this.fetchPromise !== null && !forceRefresh) {
			return this.fetchPromise;
		}

		this.fetchPromise = this.fetchFromRemoteOrFallback(forceRefresh)
			.then((places) => {
				this.cachedPlaces = places;
				this.fetchPromise = null;
				return places;
			})
			.catch((err) => {
				this.fetchPromise = null;
				throw err;
			});

		return this.fetchPromise;
	}

	private async fetchFromRemoteOrFallback(forceRefresh: boolean): Promise<Place[]> {
		const fetchOptions: RequestInit = forceRefresh ? { cache: 'reload' } : {};
		const urlWithBuster = forceRefresh ? `${this.remoteUrl}?_t=${Date.now()}` : this.remoteUrl;

		try {
			const res = await fetch(urlWithBuster, fetchOptions);
			if (res.ok) {
				const data = (await res.json()) as Place[];
				if (Array.isArray(data) && data.length > 0) {
					return data;
				}
			}
		} catch (error) {
			console.warn('Failed to fetch places from remote, attempting fallback:', error);
		}

		// Fallback to local static asset
		try {
			const fallbackRes = await fetch(this.fallbackUrl);
			if (fallbackRes.ok) {
				return (await fallbackRes.json()) as Place[];
			}
		} catch (fallbackError) {
			console.error('Failed to fetch places from fallback:', fallbackError);
		}

		if (this.cachedPlaces) {
			return this.cachedPlaces;
		}

		throw new Error('Unable to load places from remote or local fallback.');
	}

	async getById(id: string): Promise<Place | undefined> {
		const places = await this.getAll();
		return places.find((p) => p.id === id);
	}

	async search(query: string, limit: number = 20, offset: number = 0): Promise<SearchPlacesResult> {
		let places = await this.getAll();

		if (query && query.trim() !== '') {
			const lowerQuery = query.toLowerCase().trim();
			places = places.filter(
				(place) =>
					place.name.toLowerCase().includes(lowerQuery) ||
					Boolean(place.state?.toLowerCase().includes(lowerQuery)) ||
					Boolean(place.country?.toLowerCase().includes(lowerQuery))
			);
		}

		const total = places.length;
		const paginatedPlaces = places.slice(offset, offset + limit);

		return {
			places: paginatedPlaces,
			total,
			hasMore: offset + limit < total
		};
	}

	async refresh(): Promise<Place[]> {
		return this.getAll(true);
	}
}

export const placeService = new PlaceService();
