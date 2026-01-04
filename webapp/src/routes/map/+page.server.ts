import type { PageServerLoad } from './$types';
import { placeRepository } from '$lib/server';

export const load: PageServerLoad = async () => {
	const places = await placeRepository.getAll();

	return {
		places
	};
};
