import {
	buildRoundshotWebcam,
	extractRoundshotCamId,
	slugify,
	validatePlace,
	validateWebcam,
	type Coordinates,
	type LocationPrediction,
	type Place,
	type Webcam
} from '@place-view/core/pure';

export const ROUNDSHOT_FEED_URL = 'https://backend.roundshot.com/schema_list/12/list_frame.json';

const COORDINATE_MATCH_MAX_KM = 1.0;

export interface RoundshotFeedItem {
	picture: string;
	link: string;
	name?: string;
	cam_name: string;
	customer_name: string;
	category?: string;
	region: string;
	altitude?: number;
	angle?: number;
	status?: string;
	date?: string;
	generation?: string;
}

export interface RoundshotGroup {
	id: string;
	customerName: string;
	rootUrl: string;
	region: string;
	webcams: Webcam[];
}

export interface ImportInvalidEntry {
	idOrName: string;
	reason: string;
}

export interface ImportNotGeocodedEntry {
	customerName: string;
	query: string;
}

export interface ImportReport {
	placesCreated: number;
	placesUpdated: number;
	webcamsAdded: number;
	notGeocoded: ImportNotGeocodedEntry[];
	invalidEntries: ImportInvalidEntry[];
}

export type GeocodeLookupFn = (query: string) => Promise<LocationPrediction[]>;

export function parseRoundshotFeedJson(raw: string): RoundshotFeedItem[] {
	const parsed: unknown = JSON.parse(raw);
	if (
		!parsed ||
		typeof parsed !== 'object' ||
		!Array.isArray((parsed as { list?: unknown }).list)
	) {
		throw new Error('Roundshot feed JSON must contain a "list" array.');
	}

	return (parsed as { list: unknown[] }).list.filter((item): item is RoundshotFeedItem =>
		Boolean(item && typeof item === 'object')
	);
}

export function normalizeRoundshotRegion(region: string): string {
	const trimmed = region.trim();
	if (/^USA\s+IID$/i.test(trimmed)) return 'USA';
	return trimmed;
}

export function buildGeocodeQuery(customerName: string, region: string): string {
	const normalizedRegion = normalizeRoundshotRegion(region);
	return normalizedRegion ? `${customerName.trim()}, ${normalizedRegion}` : customerName.trim();
}

function extractRootUrl(link: string): string {
	try {
		const parsed = new URL(link.trim());
		if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
			return `${parsed.origin}/`;
		}
	} catch {
		// ignore invalid link
	}
	return '';
}

export function mapFeedItemToWebcam(item: RoundshotFeedItem): Webcam | null {
	const name = typeof item.cam_name === 'string' ? item.cam_name.trim() : '';
	const picture = typeof item.picture === 'string' ? item.picture.trim() : '';
	if (!name || !picture) return null;

	const camId = extractRoundshotCamId(picture);
	const candidate: Webcam = camId
		? buildRoundshotWebcam(camId, name)
		: {
				name,
				largeImage: picture.replace(/\/thumbnail(?=[?#]|$)/, '/default'),
				thumbnailImage: picture
			};

	const validated = validateWebcam(candidate);
	return validated.success ? validated.data : null;
}

function getWebcamCamId(webcam: Webcam): string | null {
	return extractRoundshotCamId(webcam.largeImage) ?? extractRoundshotCamId(webcam.thumbnailImage);
}

export function isSameWebcam(a: Webcam, b: Webcam): boolean {
	if (a.largeImage.trim() === b.largeImage.trim()) return true;
	const aId = getWebcamCamId(a);
	const bId = getWebcamCamId(b);
	return aId !== null && bId !== null && aId === bId;
}

export function groupRoundshotItems(items: readonly RoundshotFeedItem[]): {
	groups: RoundshotGroup[];
	invalidEntries: ImportInvalidEntry[];
} {
	const groupMap = new Map<string, RoundshotGroup>();
	const invalidEntries: ImportInvalidEntry[] = [];

	for (const item of items) {
		const customerName = typeof item.customer_name === 'string' ? item.customer_name.trim() : '';
		if (!customerName) {
			invalidEntries.push({
				idOrName: String(item.name || item.picture || 'unknown'),
				reason: 'Missing customer_name.'
			});
			continue;
		}

		const id = slugify(customerName);
		if (!id) {
			invalidEntries.push({
				idOrName: customerName,
				reason: 'customer_name produced an empty place ID.'
			});
			continue;
		}

		const webcam = mapFeedItemToWebcam(item);
		if (!webcam) {
			invalidEntries.push({
				idOrName: `${customerName} / ${String(item.cam_name ?? '')}`,
				reason: 'Invalid webcam name or image URL.'
			});
			continue;
		}

		const rootUrl = typeof item.link === 'string' ? extractRootUrl(item.link) : '';
		const region = typeof item.region === 'string' ? item.region.trim() : '';

		let group = groupMap.get(customerName);
		if (!group) {
			group = {
				id,
				customerName,
				rootUrl,
				region,
				webcams: []
			};
			groupMap.set(customerName, group);
		} else {
			if (!group.rootUrl && rootUrl) group.rootUrl = rootUrl;
			if (!group.region && region) group.region = region;
		}

		if (!group.webcams.some((existing) => isSameWebcam(existing, webcam))) {
			group.webcams.push(webcam);
		}
	}

	return {
		groups: [...groupMap.values()],
		invalidEntries
	};
}

function isValidCoordinates(coords: Coordinates | undefined | null): coords is Coordinates {
	if (!coords) return false;
	const { latitude, longitude } = coords;
	return (
		typeof latitude === 'number' &&
		typeof longitude === 'number' &&
		Number.isFinite(latitude) &&
		Number.isFinite(longitude) &&
		latitude >= -90 &&
		latitude <= 90 &&
		longitude >= -180 &&
		longitude <= 180
	);
}

function haversineKm(a: Coordinates, b: Coordinates): number {
	const earthRadiusKm = 6371;
	const toRad = (deg: number) => (deg * Math.PI) / 180;
	const dLat = toRad(b.latitude - a.latitude);
	const dLon = toRad(b.longitude - a.longitude);
	const sinLat = Math.sin(dLat / 2);
	const sinLon = Math.sin(dLon / 2);
	const h =
		sinLat * sinLat + Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * sinLon * sinLon;
	return 2 * earthRadiusKm * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function findMatchingPlaceByIdOrName(
	places: readonly Place[],
	group: RoundshotGroup
): Place | undefined {
	const normalizedName = group.customerName.trim().toLowerCase();
	return places.find(
		(place) =>
			place.id === group.id ||
			slugify(place.id) === group.id ||
			place.name.trim().toLowerCase() === normalizedName ||
			slugify(place.name) === group.id
	);
}

function findMatchingPlaceByCoordinates(
	places: readonly Place[],
	preExistingIds: ReadonlySet<string>,
	target: Coordinates
): Place | undefined {
	let bestMatch: Place | undefined;
	let bestDistance = COORDINATE_MATCH_MAX_KM;

	for (const place of places) {
		if (!preExistingIds.has(place.id) || !isValidCoordinates(place.coordinates)) continue;
		const distance = haversineKm(place.coordinates, target);
		if (distance <= bestDistance) {
			bestDistance = distance;
			bestMatch = place;
		}
	}

	return bestMatch;
}

function pickBestPrediction(predictions: readonly LocationPrediction[]): LocationPrediction | null {
	if (predictions.length === 0) return null;
	return predictions.find((p) => Boolean(p.country && p.state)) ?? predictions[0];
}

function appendMissingWebcams(
	existingPlace: Place,
	candidateWebcams: readonly Webcam[],
	completion: LocationPrediction | null
): { updatedPlace: Place; addedCount: number; metadataUpdated: boolean } {
	const missingWebcams = candidateWebcams.filter(
		(cam) => !existingPlace.webcams.some((existing) => isSameWebcam(existing, cam))
	);

	let country = existingPlace.country;
	let state = existingPlace.state;
	let coordinates = existingPlace.coordinates;
	let metadataUpdated = false;

	if (completion) {
		if (!country.trim() && completion.country) {
			country = completion.country;
			metadataUpdated = true;
		}
		if (!state.trim() && completion.state) {
			state = completion.state;
			metadataUpdated = true;
		}
		if (!isValidCoordinates(coordinates)) {
			coordinates = { latitude: completion.latitude, longitude: completion.longitude };
			metadataUpdated = true;
		}
	}

	if (missingWebcams.length === 0 && !metadataUpdated) {
		return { updatedPlace: existingPlace, addedCount: 0, metadataUpdated: false };
	}

	return {
		updatedPlace: {
			...existingPlace,
			country,
			state,
			coordinates,
			webcams: [...existingPlace.webcams, ...missingWebcams]
		},
		addedCount: missingWebcams.length,
		metadataUpdated
	};
}

function applyPlaceUpdate(
	places: Place[],
	match: Place,
	candidateWebcams: readonly Webcam[],
	completion: LocationPrediction | null,
	report: ImportReport
): boolean {
	const { updatedPlace, addedCount, metadataUpdated } = appendMissingWebcams(
		match,
		candidateWebcams,
		completion
	);
	if (addedCount === 0 && !metadataUpdated) return false;

	const validation = validatePlace(updatedPlace);
	if (!validation.success) {
		report.invalidEntries.push({
			idOrName: updatedPlace.id,
			reason: validation.message
		});
		return false;
	}

	const idx = places.findIndex((p) => p.id === match.id);
	places[idx] = validation.data;
	report.placesUpdated += 1;
	report.webcamsAdded += addedCount;
	return true;
}

export async function importRoundshotPlaces(
	existingPlaces: readonly Place[],
	items: readonly RoundshotFeedItem[],
	geocode: GeocodeLookupFn
): Promise<{ places: Place[]; report: ImportReport; changed: boolean }> {
	const places = existingPlaces.map((p) => ({
		...p,
		coordinates: { ...p.coordinates },
		webcams: [...p.webcams]
	}));
	const preExistingIds = new Set(existingPlaces.map((p) => p.id));

	const { groups, invalidEntries } = groupRoundshotItems(items);
	const report: ImportReport = {
		placesCreated: 0,
		placesUpdated: 0,
		webcamsAdded: 0,
		notGeocoded: [],
		invalidEntries: [...invalidEntries]
	};

	let changed = false;

	for (const group of groups) {
		const idOrNameMatch = findMatchingPlaceByIdOrName(places, group);

		if (idOrNameMatch) {
			const needsMetadata =
				!idOrNameMatch.country.trim() || !isValidCoordinates(idOrNameMatch.coordinates);
			let completion: LocationPrediction | null = null;
			if (needsMetadata) {
				const query = buildGeocodeQuery(group.customerName, group.region);
				completion = pickBestPrediction(await geocode(query));
				if (!completion) {
					report.notGeocoded.push({ customerName: group.customerName, query });
				}
			}

			if (applyPlaceUpdate(places, idOrNameMatch, group.webcams, completion, report)) {
				changed = true;
			}
			continue;
		}

		const query = buildGeocodeQuery(group.customerName, group.region);
		const prediction = pickBestPrediction(await geocode(query));
		if (!prediction) {
			report.notGeocoded.push({ customerName: group.customerName, query });
			continue;
		}

		const coordMatch = findMatchingPlaceByCoordinates(places, preExistingIds, {
			latitude: prediction.latitude,
			longitude: prediction.longitude
		});

		if (coordMatch) {
			if (applyPlaceUpdate(places, coordMatch, group.webcams, prediction, report)) {
				changed = true;
			}
			continue;
		}

		const candidatePlace: Place = {
			id: group.id,
			name: group.customerName,
			country: prediction.country ?? '',
			state: prediction.state ?? '',
			url: group.rootUrl,
			coordinates: {
				latitude: prediction.latitude,
				longitude: prediction.longitude
			},
			webcams: group.webcams
		};

		const validation = validatePlace(candidatePlace);
		if (!validation.success) {
			report.invalidEntries.push({
				idOrName: candidatePlace.id,
				reason: validation.message
			});
			continue;
		}

		places.push(validation.data);
		report.placesCreated += 1;
		report.webcamsAdded += validation.data.webcams.length;
		changed = true;
	}

	return {
		places,
		report,
		changed
	};
}

export function formatImportSummary(report: ImportReport, dryRun: boolean): string {
	const lines = [
		`Mode: ${dryRun ? 'dry-run (pass --write to persist)' : 'write'}`,
		`Places created: ${report.placesCreated}`,
		`Places updated: ${report.placesUpdated}`,
		`Webcams added: ${report.webcamsAdded}`,
		`Places not geocoded: ${report.notGeocoded.length}`,
		`Invalid entries skipped: ${report.invalidEntries.length}`
	];

	if (report.notGeocoded.length > 0) {
		lines.push('', 'Not geocoded:');
		for (const entry of report.notGeocoded) {
			lines.push(`  - ${entry.customerName} (query: "${entry.query}")`);
		}
	}

	if (report.invalidEntries.length > 0) {
		lines.push('', 'Invalid entries skipped:');
		for (const entry of report.invalidEntries) {
			lines.push(`  - ${entry.idOrName}: ${entry.reason}`);
		}
	}

	return lines.join('\n');
}
