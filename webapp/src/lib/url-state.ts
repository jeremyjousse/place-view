export type MapPosition = {
	latitude: number;
	longitude: number;
	zoom: number;
};

export function mapPositionFromUrl(url: {
	searchParams: Pick<URLSearchParams, 'get'>;
}): MapPosition | undefined {
	const values = ['lat', 'lon', 'zoom'].map((key) => url.searchParams.get(key));
	if (values.some((value) => value === null || value.trim() === '')) return undefined;

	const [latitude, longitude, zoom] = values.map(Number);
	if (
		!Number.isFinite(latitude) ||
		!Number.isFinite(longitude) ||
		!Number.isInteger(zoom) ||
		Math.abs(latitude) > 90 ||
		Math.abs(longitude) > 180 ||
		zoom < 0 ||
		zoom > 19
	) {
		return undefined;
	}

	return { latitude, longitude, zoom };
}

export function withParameters(
	url: { href: string },
	parameters: Record<string, string | null>
): URL {
	const result = new URL(url.href);
	for (const [key, value] of Object.entries(parameters)) {
		if (value === null || value === '') result.searchParams.delete(key);
		else result.searchParams.set(key, value);
	}
	return result;
}

export function viewHref(
	url: { href: string },
	path: string,
	parameters: Record<string, string | null> = {}
): string {
	const result = withParameters(url, parameters);
	result.pathname = path;
	return `${result.pathname}${result.search}${result.hash}`;
}

export function positionParameters(position: MapPosition): Record<string, string> {
	const longitude = ((((position.longitude + 180) % 360) + 360) % 360) - 180;
	return {
		lat: position.latitude.toFixed(5),
		lon: longitude.toFixed(5),
		zoom: position.zoom.toString()
	};
}
