import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { placeService } from '$lib/server/services';

export const actions: Actions = {
	createPlace: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name') as string;
		const country = data.get('country') as string;
		const latitude = parseFloat(data.get('latitude') as string);
		const longitude = parseFloat(data.get('longitude') as string);
		const state = data.get('state') as string;
		const url = data.get('url') as string;

		if (!name || !country || isNaN(latitude) || isNaN(longitude)) {
			return fail(400, { missing: true });
		}

		// Simple slugify for the ID
		const id = name
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)+/g, '');

		// Check if ID already exists
		const existing = await placeService.getPlaceById(id);
		if (existing) {
			return fail(400, { error: 'A place with a similar name already exists.' });
		}

		const newPlace = {
			id,
			name,
			country,
			coordinates: { latitude, longitude },
			state,
			url,
			webcams: []
		};

		try {
			await placeService.savePlace(newPlace);
		} catch (e) {
			const message = e instanceof Error ? e.message : 'Unknown error';
			return fail(400, { message });
		}

		throw redirect(303, `/places/${id}`);
	}
};
