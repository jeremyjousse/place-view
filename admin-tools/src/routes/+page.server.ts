import type { PageServerLoad } from './$types';
import { placeService } from '$lib/server/services';

export const load: PageServerLoad = async () => {
	const places = await placeService.getAllPlaces();
	return {
		places
	};
};
