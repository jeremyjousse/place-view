import { describe, expect, it, vi } from 'vitest';
import { parseNominatimResponse, searchLocations } from './GeocodingService.js';

describe('GeocodingService', () => {
	it('parses Nominatim JSON and deduplicates by displayName', () => {
		const raw = JSON.stringify([
			{
				place_id: 1,
				lat: '46.2806',
				lon: '6.7199',
				display_name: 'Abondance, Haute-Savoie, France',
				address: { country: 'France', county: 'Haute-Savoie' }
			},
			{
				place_id: 2,
				lat: '46.2806',
				lon: '6.7199',
				display_name: 'Abondance, Haute-Savoie, France',
				address: { country: 'France', county: 'Haute-Savoie' }
			},
			{
				place_id: 3,
				lat: 'invalid',
				lon: '6.7',
				display_name: 'Broken Entry'
			}
		]);

		const parsed = parseNominatimResponse(raw);
		expect(parsed).toEqual([
			{
				id: '1',
				latitude: 46.2806,
				longitude: 6.7199,
				displayName: 'Abondance, Haute-Savoie, France',
				country: 'France',
				state: 'Haute-Savoie'
			}
		]);
	});

	it('skips short queries and calls fetcher for 3+ chars', async () => {
		const fetcher = vi.fn<(url: string) => Promise<string>>(async () => '[]');
		expect(await searchLocations('ab', fetcher)).toEqual([]);
		expect(fetcher).not.toHaveBeenCalled();

		await searchLocations('Chamonix', fetcher);
		expect(fetcher).toHaveBeenCalledTimes(1);
		expect(fetcher.mock.calls[0][0]).toContain('nominatim.openstreetmap.org/search?q=Chamonix');
	});
});
