import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { placeRepository } from '$lib/server';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;

	try {
		const place = await placeRepository.getById(id);

		if (!place) {
			throw error(404, 'Place not found');
		}

		return {
			place
		};
	} catch (e) {
		console.error('Error loading place:', e);
		throw error(404, 'Place not found');
	}
};
