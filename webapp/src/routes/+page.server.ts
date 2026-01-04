import type { PageServerLoad } from './$types';
import { placeRepository } from '$lib/server';

export const load: PageServerLoad = async () => {
	// Return only a few featured places for demonstration
	const result = await placeRepository.search('', 12, 0);

	return {
		places: result.places
	};
};
