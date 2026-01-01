import type { Actions, PageServerLoad } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { placeService, webcamDetectorService } from '$lib/server/services';
import type { Webcam } from '$lib/domain/Webcam';

export const load: PageServerLoad = async ({ params }) => {
	const place = await placeService.getPlaceById(params.id);
	if (!place) {
		throw error(404, 'Place not found');
	}
	return {
		place
	};
};

export const actions: Actions = {
	detectWebcam: async ({ request }) => {
		const data = await request.formData();
		const url = data.get('url') as string;

		if (!url) {
			return fail(400, { missingUrl: true });
		}

		try {
			const detected = await webcamDetectorService.detectWebcam(url);
			if (!detected) {
				return fail(400, { detectionFailed: true });
			}
			return { detected };
		} catch (e) {
			const message = e instanceof Error ? e.message : 'Unknown error';
			return fail(400, { message });
		}
	},

	deletePlace: async ({ params }) => {
		try {
			await placeService.deletePlace(params.id);
		} catch (e) {
			const message = e instanceof Error ? e.message : 'Unknown error';
			return fail(400, { message });
		}
		throw redirect(303, '/');
	},

	updatePlace: async ({ request, params }) => {
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

		try {
			await placeService.updatePlaceDetails(params.id, {
				name,
				country,
				state,
				url,
				coordinates: { latitude, longitude }
			});
			return { success: true };
		} catch (e) {
			const message = e instanceof Error ? e.message : 'Unknown error';
			return fail(400, { message });
		}
	},

	addWebcam: async ({ request, params }) => {
		const data = await request.formData();
		const name = data.get('name') as string;
		const largeImage = data.get('largeImage') as string;
		const thumbnailImage = data.get('thumbnailImage') as string;

		if (!name || !largeImage || !thumbnailImage) {
			return fail(400, { missing: true });
		}

		try {
			const newWebcam: Webcam = { name, largeImage, thumbnailImage };
			await placeService.addWebcam(params.id, newWebcam);
			return { success: true };
		} catch (e) {
			const message = e instanceof Error ? e.message : 'Unknown error';
			return fail(400, { message });
		}
	},

	removeWebcam: async ({ request, params }) => {
		const data = await request.formData();
		const index = parseInt(data.get('index') as string);

		if (isNaN(index)) {
			return fail(400, { invalidIndex: true });
		}

		try {
			await placeService.removeWebcam(params.id, index);
			return { success: true };
		} catch (e) {
			const message = e instanceof Error ? e.message : 'Unknown error';
			return fail(400, { message });
		}
	},

	reorderWebcam: async ({ request, params }) => {
		const data = await request.formData();
		const index = parseInt(data.get('index') as string);
		const direction = data.get('direction') as 'up' | 'down';

		if (isNaN(index)) {
			return fail(400, { invalidIndex: true });
		}

		if (direction !== 'up' && direction !== 'down') {
			return fail(400, { invalidDirection: true });
		}

		try {
			await placeService.reorderWebcam(params.id, index, direction);
			return { success: true };
		} catch (e) {
			const message = e instanceof Error ? e.message : 'Unknown error';
			return fail(400, { message });
		}
	},

	saveWebcamOrder: async ({ request, params }) => {
		const data = await request.formData();
		const webcamsJson = data.get('webcams') as string;

		if (!webcamsJson) {
			return fail(400, { missing: true });
		}

		try {
			const webcams = JSON.parse(webcamsJson);
			if (!Array.isArray(webcams)) throw new Error('Invalid format');
			await placeService.updateWebcams(params.id, webcams);
			return { success: true };
		} catch (e) {
			const message = e instanceof Error ? e.message : 'Unknown error';
			return fail(400, { message });
		}
	}
};
