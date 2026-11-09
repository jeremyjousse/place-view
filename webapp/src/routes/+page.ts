import type { PageLoad } from './$types';
import { placeService } from '#lib/services/PlaceService';

export const load: PageLoad = async () => {
	const result = await placeService.search('', 12, 0);

	return {
		places: result.places
	};
};
