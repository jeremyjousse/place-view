import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { placeRepository } from '$lib/server';

export const GET: RequestHandler = async ({ url }) => {
	const query = url.searchParams.get('q') || '';
	const limit = parseInt(url.searchParams.get('limit') || '20');
	const offset = parseInt(url.searchParams.get('offset') || '0');

	try {
		const result = await placeRepository.search(query, limit, offset);

		return json(result);
	} catch (error) {
		console.error('API Error:', error);
		return json({ error: 'Failed to load places' }, { status: 500 });
	}
};
