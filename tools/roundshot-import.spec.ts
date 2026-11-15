import { describe, expect, it, vi } from 'vitest';
import type { LocationPrediction, Place } from '@place-view/core/pure';
import {
	buildGeocodeQuery,
	groupRoundshotItems,
	importRoundshotPlaces,
	normalizeRoundshotRegion,
	parseRoundshotFeedJson,
	type RoundshotFeedItem
} from './roundshot-import.js';

const samplePlace = (overrides: Partial<Place> = {}): Place => ({
	id: 'tignes',
	name: 'Tignes',
	country: 'France',
	state: 'Savoie',
	url: 'https://www.tignes.net/',
	coordinates: { latitude: 45.469729, longitude: 6.907594 },
	webcams: [],
	...overrides
});

const sampleItem = (overrides: Partial<RoundshotFeedItem> = {}): RoundshotFeedItem => ({
	picture: 'https://backend.roundshot.com/cams/220/thumbnail',
	link: 'https://tignes.roundshot.com/lac/',
	name: 'Tignes - Lac',
	cam_name: 'Lac',
	customer_name: 'Tignes',
	category: 'Ski resorts',
	region: 'France',
	status: 'working',
	...overrides
});

describe('roundshot-import', () => {
	it('parses Roundshot feed JSON without filtering by category, region, or status', () => {
		const raw = JSON.stringify({
			list: [
				sampleItem({ status: 'working' }),
				sampleItem({
					picture: 'https://backend.roundshot.com/cams/7c489eeced76dff9294e39d9925bed1b/thumbnail',
					link: 'https://iid.roundshot.com/anza-borrego/',
					cam_name: 'Anza-Borrego',
					customer_name: 'IID',
					category: 'Weather cams',
					region: 'USA IID',
					status: 'broken'
				}),
				sampleItem({
					picture: 'https://backend.roundshot.com/cams/225/thumbnail',
					cam_name: 'Les Boisses - 1800',
					status: 'late'
				}),
				sampleItem({
					picture: 'https://backend.roundshot.com/cams/224/thumbnail',
					cam_name: 'Brévières',
					status: 'idle'
				})
			]
		});

		const parsed = parseRoundshotFeedJson(raw);
		expect(parsed).toHaveLength(4);
		expect(() => parseRoundshotFeedJson('{}')).toThrow('list');
	});

	it('normalizes feed regions such as USA IID for geocoding queries', () => {
		expect(normalizeRoundshotRegion('USA IID')).toBe('USA');
		expect(normalizeRoundshotRegion('  Switzerland ')).toBe('Switzerland');
		expect(buildGeocodeQuery('IID', 'USA IID')).toBe('IID, USA');
		expect(buildGeocodeQuery('Tignes', 'France')).toBe('Tignes, France');
	});

	it('groups cams by customer_name, maps URLs, deduplicates, and reports invalid items', () => {
		const { groups, invalidEntries } = groupRoundshotItems([
			sampleItem(),
			sampleItem({
				picture: 'https://backend.roundshot.com/cams/220/thumbnail',
				cam_name: 'Lac duplicate'
			}),
			sampleItem({
				picture: 'https://backend.roundshot.com/cams/225/thumbnail',
				link: 'https://tignes.roundshot.com/1800/',
				cam_name: 'Les Boisses - 1800'
			}),
			sampleItem({
				picture: 'not-a-url',
				cam_name: 'Broken Image'
			})
		]);

		expect(invalidEntries).toHaveLength(1);
		expect(groups).toEqual([
			{
				id: 'tignes',
				customerName: 'Tignes',
				rootUrl: 'https://tignes.roundshot.com/',
				region: 'France',
				webcams: [
					{
						name: 'Lac',
						largeImage: 'https://backend.roundshot.com/cams/220/default',
						thumbnailImage: 'https://backend.roundshot.com/cams/220/thumbnail'
					},
					{
						name: 'Les Boisses - 1800',
						largeImage: 'https://backend.roundshot.com/cams/225/default',
						thumbnailImage: 'https://backend.roundshot.com/cams/225/thumbnail'
					}
				]
			}
		]);
	});

	it('matches existing places by slugified ID/name without re-geocoding and deduplicates cams', async () => {
		const existing: Place[] = [
			samplePlace({
				webcams: [
					{
						name: 'Existing Lac',
						largeImage: 'https://backend.roundshot.com/cams/220/default',
						thumbnailImage: 'https://backend.roundshot.com/cams/220/thumbnail'
					}
				]
			}),
			samplePlace({
				id: 'menuires',
				name: 'Les Ménuires',
				url: 'https://lesmenuires.com/',
				coordinates: { latitude: 45.3228, longitude: 6.5375 },
				webcams: []
			})
		];

		const geocode = vi.fn<() => Promise<LocationPrediction[]>>(async () => []);
		const items: RoundshotFeedItem[] = [
			sampleItem(),
			sampleItem({
				picture: 'https://backend.roundshot.com/cams/225/thumbnail',
				link: 'https://tignes.roundshot.com/1800/',
				cam_name: 'Les Boisses - 1800'
			}),
			sampleItem({
				picture: 'https://backend.roundshot.com/cams/500/thumbnail',
				link: 'https://lesmenuires.roundshot.com/masse/',
				cam_name: 'Pointe de la Masse',
				customer_name: 'Les Menuires'
			})
		];

		const { places, report, changed } = await importRoundshotPlaces(existing, items, geocode);

		expect(geocode).not.toHaveBeenCalled();
		expect(changed).toBe(true);
		expect(report).toEqual({
			placesCreated: 0,
			placesUpdated: 2,
			webcamsAdded: 2,
			notGeocoded: [],
			invalidEntries: []
		});

		const tignes = places.find((p) => p.id === 'tignes');
		expect(tignes?.url).toBe('https://www.tignes.net/');
		expect(tignes?.webcams).toHaveLength(2);
		expect(tignes?.webcams[0].name).toBe('Existing Lac');
		expect(tignes?.webcams[1].name).toBe('Les Boisses - 1800');

		const menuires = places.find((p) => p.id === 'menuires');
		expect(menuires?.webcams).toHaveLength(1);
	});

	it('completes empty country on existing matched place and matches by coordinates when needed', async () => {
		const existing: Place[] = [
			samplePlace({
				id: 'custom-resort',
				name: 'Custom Resort',
				country: '',
				state: 'Savoie',
				coordinates: { latitude: 46.0, longitude: 7.0 }
			}),
			samplePlace({
				id: 'lake-louise',
				name: 'Lake Louise',
				country: 'Canada',
				state: 'Alberta',
				coordinates: { latitude: 51.425, longitude: -116.177 }
			})
		];

		const geocode = vi.fn(async (query: string): Promise<LocationPrediction[]> => {
			if (query.startsWith('Custom Resort')) {
				return [
					{
						id: '1',
						latitude: 46.0,
						longitude: 7.0,
						displayName: 'Custom Resort, France',
						country: 'France',
						state: 'Savoie'
					}
				];
			}
			if (query.startsWith('Ski Lake Louise')) {
				return [
					{
						id: '2',
						latitude: 51.4252,
						longitude: -116.1772,
						displayName: 'Lake Louise, Alberta, Canada',
						country: 'Canada',
						state: 'Alberta'
					}
				];
			}
			return [];
		});

		const items: RoundshotFeedItem[] = [
			sampleItem({
				picture: 'https://backend.roundshot.com/cams/901/thumbnail',
				link: 'https://custom.roundshot.com/',
				cam_name: 'Summit',
				customer_name: 'Custom Resort',
				region: 'France'
			}),
			sampleItem({
				picture: 'https://backend.roundshot.com/cams/585/thumbnail',
				link: 'https://skilouise.roundshot.com/ptarmigan/',
				cam_name: 'Ptarmigan',
				customer_name: 'Ski Lake Louise',
				region: 'Canada'
			})
		];

		const { places, report, changed } = await importRoundshotPlaces(existing, items, geocode);
		expect(changed).toBe(true);
		expect(report.placesCreated).toBe(0);
		expect(report.placesUpdated).toBe(2);
		expect(places.find((p) => p.id === 'custom-resort')?.country).toBe('France');
		expect(places.find((p) => p.id === 'lake-louise')?.webcams).toHaveLength(1);
	});

	it('creates new places, skips ungeocodable or invalid places, and is idempotent', async () => {
		const geocode = vi.fn(async (query: string): Promise<LocationPrediction[]> => {
			if (query === 'Zermatt, Switzerland') {
				return [
					{
						id: '10',
						latitude: 46.0207,
						longitude: 7.7491,
						displayName: 'Zermatt, Valais, Suisse',
						country: 'Suisse',
						state: 'Valais'
					}
				];
			}
			if (query === 'MissingState, Switzerland') {
				return [
					{
						id: '11',
						latitude: 47.0,
						longitude: 8.0,
						displayName: 'MissingState, Suisse',
						country: 'Suisse'
					}
				];
			}
			return [];
		});

		const items: RoundshotFeedItem[] = [
			sampleItem({
				picture: 'https://backend.roundshot.com/cams/100/thumbnail',
				link: 'https://zermatt.roundshot.com/gornergrat/',
				cam_name: 'Gornergrat',
				customer_name: 'Zermatt',
				region: 'Switzerland'
			}),
			sampleItem({
				picture: 'https://backend.roundshot.com/cams/101/thumbnail',
				link: 'https://missingstate.roundshot.com/',
				cam_name: 'View',
				customer_name: 'MissingState',
				region: 'Switzerland'
			}),
			sampleItem({
				picture: 'https://backend.roundshot.com/cams/102/thumbnail',
				link: 'https://unknown.roundshot.com/',
				cam_name: 'Unknown',
				customer_name: 'UnknownCorp',
				region: 'Switzerland'
			})
		];

		const firstRun = await importRoundshotPlaces([], items, geocode);
		expect(firstRun.changed).toBe(true);
		expect(firstRun.report.placesCreated).toBe(1);
		expect(firstRun.report.webcamsAdded).toBe(1);
		expect(firstRun.report.notGeocoded).toEqual([
			{ customerName: 'UnknownCorp', query: 'UnknownCorp, Switzerland' }
		]);
		expect(firstRun.report.invalidEntries).toHaveLength(1);
		expect(firstRun.places).toEqual([
			{
				id: 'zermatt',
				name: 'Zermatt',
				country: 'Suisse',
				state: 'Valais',
				url: 'https://zermatt.roundshot.com/',
				coordinates: { latitude: 46.0207, longitude: 7.7491 },
				webcams: [
					{
						name: 'Gornergrat',
						largeImage: 'https://backend.roundshot.com/cams/100/default',
						thumbnailImage: 'https://backend.roundshot.com/cams/100/thumbnail'
					}
				]
			}
		]);

		// Second run on valid result is idempotent
		const secondRun = await importRoundshotPlaces(firstRun.places, [items[0]], geocode);
		expect(secondRun.changed).toBe(false);
		expect(secondRun.report).toEqual({
			placesCreated: 0,
			placesUpdated: 0,
			webcamsAdded: 0,
			notGeocoded: [],
			invalidEntries: []
		});
		expect(secondRun.places).toEqual(firstRun.places);
	});
});
