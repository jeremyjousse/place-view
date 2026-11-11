import { describe, expect, it } from 'vitest';
import {
	mapPositionFromUrl,
	positionParameters,
	slugify,
	viewHref,
	webcamIndexFromUrl,
	webcamParameter,
	withParameters
} from './url-state';

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

	describe('webcam URL state', () => {
		const sampleWebcams = [
			{ name: "Télécabine de l'Essert" },
			{ name: 'TSD Crêt-Béni' },
			{ name: 'Sommet' }
		];

		it('parses valid 1-based index', () => {
			expect(
				webcamIndexFromUrl(new URL('https://example.test/place/abondance/?webcam=1'), sampleWebcams)
			).toBe(0);
			expect(
				webcamIndexFromUrl(new URL('https://example.test/place/abondance/?webcam=2'), sampleWebcams)
			).toBe(1);
			expect(
				webcamIndexFromUrl(new URL('https://example.test/place/abondance/?webcam=3'), sampleWebcams)
			).toBe(2);
		});

		it('parses slugified name or case-insensitive name', () => {
			expect(
				webcamIndexFromUrl(
					new URL('https://example.test/place/abondance/?webcam=telecabine-de-l-essert'),
					sampleWebcams
				)
			).toBe(0);
			expect(
				webcamIndexFromUrl(
					new URL('https://example.test/place/abondance/?webcam=tsd-cret-beni'),
					sampleWebcams
				)
			).toBe(1);
			expect(
				webcamIndexFromUrl(
					new URL('https://example.test/place/abondance/?webcam=sommet'),
					sampleWebcams
				)
			).toBe(2);
		});

		it.each([
			'webcam=0',
			'webcam=4',
			'webcam=-1',
			'webcam=1.5',
			'webcam=NaN',
			'webcam=',
			'webcam=unknown-webcam'
		])('rejects invalid webcam identifier: %s', (query) => {
			expect(
				webcamIndexFromUrl(new URL(`https://example.test/place/abondance/?${query}`), sampleWebcams)
			).toBeUndefined();
		});

		it('generates webcam parameters', () => {
			expect(webcamParameter(0)).toEqual({ webcam: '1' });
			expect(webcamParameter(2)).toEqual({ webcam: '3' });
			expect(webcamParameter(null)).toEqual({ webcam: null });
			expect(webcamParameter(undefined)).toEqual({ webcam: null });
		});

		it('slugifies names with accents and special characters', () => {
			expect(slugify("Télécabine de l'Essert")).toBe('telecabine-de-l-essert');
			expect(slugify('Crêt-Béni')).toBe('cret-beni');
		});
	});
});
