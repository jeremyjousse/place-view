import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	parsePlacesJson,
	searchLocations,
	type FetchTextFn,
	type LocationPrediction
} from '@place-view/core/pure';
import {
	ROUNDSHOT_FEED_URL,
	formatImportSummary,
	importRoundshotPlaces,
	parseRoundshotFeedJson,
	type GeocodeLookupFn
} from './roundshot-import.js';

const USER_AGENT = 'place-view-roundshot-importer/1.0 (https://github.com/jeremyjousse/place-view)';
const MIN_NOMINATIM_INTERVAL_MS = 1100;

const __dirname = dirname(fileURLToPath(import.meta.url));
const PLACES_JSON_PATH = resolve(__dirname, '../resources/places.json');
const CACHE_FILE_PATH = resolve(__dirname, '.cache/nominatim.json');

const sleep = (ms: number) => new Promise((resolvePromise) => setTimeout(resolvePromise, ms));

const nodeFetchText: FetchTextFn = async (url: string) => {
	const response = await fetch(url, {
		headers: {
			'User-Agent': USER_AGENT,
			Accept: 'application/json'
		}
	});
	if (!response.ok) {
		throw new Error(`HTTP ${response.status} fetching ${url}`);
	}
	return response.text();
};

function loadCache(cachePath: string): Record<string, LocationPrediction[]> {
	if (!existsSync(cachePath)) return {};
	try {
		const raw = readFileSync(cachePath, 'utf8');
		const parsed: unknown = JSON.parse(raw);
		if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
			return parsed as Record<string, LocationPrediction[]>;
		}
	} catch {
		// ignore corrupt cache and rebuild
	}
	return {};
}

function saveCache(cachePath: string, cache: Record<string, LocationPrediction[]>): void {
	mkdirSync(dirname(cachePath), { recursive: true });
	writeFileSync(cachePath, `${JSON.stringify(cache, null, 2)}\n`, 'utf8');
}

function createCachedNominatimGeocoder(cachePath: string): GeocodeLookupFn {
	const cache = loadCache(cachePath);
	let lastRequestAt = 0;

	return async (query: string): Promise<LocationPrediction[]> => {
		const key = query.trim();
		if (key.length < 3) return [];

		if (Object.hasOwn(cache, key)) {
			return cache[key];
		}

		const elapsed = Date.now() - lastRequestAt;
		if (lastRequestAt > 0 && elapsed < MIN_NOMINATIM_INTERVAL_MS) {
			await sleep(MIN_NOMINATIM_INTERVAL_MS - elapsed);
		}

		lastRequestAt = Date.now();
		try {
			const results = await searchLocations(key, nodeFetchText, { acceptLanguage: 'fr' });
			cache[key] = results;
			saveCache(cachePath, cache);
			return results;
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			console.warn(`Geocoding failed for "${key}": ${message}`);
			return [];
		}
	};
}

async function main(): Promise<void> {
	const args = new Set(process.argv.slice(2));
	if (args.has('--help') || args.has('-h')) {
		console.log('Usage: import-roundshot.ts [--write]');
		console.log('  Default is dry-run. Pass --write to update resources/places.json.');
		return;
	}

	const writeMode = args.has('--write');
	const rawPlaces = readFileSync(PLACES_JSON_PATH, 'utf8');
	const existingPlaces = parsePlacesJson(rawPlaces);

	const feedRaw = await nodeFetchText(ROUNDSHOT_FEED_URL);
	const feedItems = parseRoundshotFeedJson(feedRaw);

	const geocode = createCachedNominatimGeocoder(CACHE_FILE_PATH);
	const { places, report, changed } = await importRoundshotPlaces(
		existingPlaces,
		feedItems,
		geocode
	);

	console.log(formatImportSummary(report, !writeMode));

	if (writeMode && changed) {
		writeFileSync(PLACES_JSON_PATH, `${JSON.stringify(places, null, 2)}\n`, 'utf8');
		console.log(`\nUpdated ${PLACES_JSON_PATH}`);
	}
}

await main();
