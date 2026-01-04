import type { Place } from '$lib/common/domain/Place';

export interface PlaceRepository {
	getAll(): Promise<Place[]>;
	getById(id: string): Promise<Place | undefined>;
	search(query: string, limit: number, offset: number): Promise<{ places: Place[]; total: number; hasMore: boolean }>;
}
