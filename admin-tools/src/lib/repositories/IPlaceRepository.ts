import type { Place } from '../domain/Place';

export interface IPlaceRepository {
	fetchAll(): Promise<Place[]>;
	fetchOne(id: string): Promise<Place | null>;
	persist(place: Place): Promise<void>;
	delete(id: string): Promise<void>;
}
