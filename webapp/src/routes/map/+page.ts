import type { PageLoad } from './$types';
import { placeService } from '@place-view/core';

export const load: PageLoad = async () => {
	const places = await placeService.getAll();

	return {
		places
	};
};
