import type { PageLoad } from './$types';
import { placeService } from '@place-view/core';

export const load: PageLoad = async () => {
	const result = await placeService.search('', 12, 0);

	return {
		places: result.places
	};
};
