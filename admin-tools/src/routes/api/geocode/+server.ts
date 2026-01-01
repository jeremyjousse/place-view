import { json } from '@sveltejs/kit';
import { geocodeService } from '$lib/server/services';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const query = url.searchParams.get('q');
	if (!query) {
		return json([]);
	}

	const predictions = await geocodeService.getLocationPrediction(query);
	return json(predictions);
};
