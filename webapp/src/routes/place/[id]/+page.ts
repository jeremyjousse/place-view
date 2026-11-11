import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import { placeService } from '@place-view/core';

export const load: PageLoad = async ({ params }) => {
	const { id } = params;

	try {
		const place = await placeService.getById(id);

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
