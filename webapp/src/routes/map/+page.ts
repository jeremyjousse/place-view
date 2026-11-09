import type { PageLoad } from './$types';
import { placeService } from '$lib/services/PlaceService';

export const load: PageLoad = async () => {
	const places = await placeService.getAll();

	return {
		places
	};
};
