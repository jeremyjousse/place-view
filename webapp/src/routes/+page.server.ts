import type { PageServerLoad } from './$types';
import { placeRepository } from '$lib/server';

export const load: PageServerLoad = async () => {
	const result = await placeRepository.search('', 12, 0);

	return {
		places: result.places
	};
};
