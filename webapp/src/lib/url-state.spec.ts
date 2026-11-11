import { describe, expect, it } from 'vitest';
import { mapPositionFromUrl, positionParameters, viewHref, withParameters } from './url-state';

describe('URL state', () => {
	it('reads a valid map position', () => {
		const url = new URL('https://example.test/map/?lat=46.5&lon=-1.25&zoom=12');
		expect(mapPositionFromUrl(url)).toEqual({ latitude: 46.5, longitude: -1.25, zoom: 12 });
	});

	it.each([
		'lat=&lon=1&zoom=5',
		'lat=91&lon=1&zoom=5',
		'lat=1&lon=181&zoom=5',
		'lat=1&lon=1&zoom=20',
		'lat=1&lon=1&zoom=2.5',
		'lat=NaN&lon=1&zoom=5',
		'lat=1&lon=1'
	])('rejects invalid coordinates: %s', (query) => {
		expect(mapPositionFromUrl(new URL(`https://example.test/map/?${query}`))).toBeUndefined();
	});

	it('updates parameters without changing the original URL', () => {
		const url = new URL('https://example.test/?q=snow&favorites=1');
		expect(withParameters(url, { q: 'Alpes', favorites: null }).search).toBe('?q=Alpes');
		expect(url.search).toBe('?q=snow&favorites=1');
		expect(viewHref(url, '/map/')).toBe('/map/?q=snow&favorites=1');
	});

	it('rounds coordinates and wraps longitudes', () => {
		expect(positionParameters({ latitude: 45.123456, longitude: 181, zoom: 9 })).toEqual({
			lat: '45.12346',
			lon: '-179.00000',
			zoom: '9'
		});
	});
});
