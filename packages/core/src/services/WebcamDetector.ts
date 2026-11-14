import type { Webcam } from '../domain/Webcam.js';
import type { FetchTextFn } from '../ports/index.js';

function decodeBasicEntities(text: string): string {
	return text
		.replaceAll('&amp;', '&')
		.replaceAll('&lt;', '<')
		.replaceAll('&gt;', '>')
		.replaceAll('&quot;', '"')
		.replaceAll('&#39;', "'")
		.replaceAll('&apos;', "'");
}

function extractHtmlTitle(html: string): string {
	const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
	return match?.[1] ? decodeBasicEntities(match[1]).trim() : '';
}

function extractScriptContents(html: string): string[] {
	const scripts: string[] = [];
	const regex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
	let match: RegExpExecArray | null;
	while ((match = regex.exec(html)) !== null) {
		if (match[1]) scripts.push(match[1]);
	}
	return scripts.length > 0 ? scripts : [html];
}

export function extractWebcamFromTrinumImage(url: string): Webcam {
	const parts = url.split(/(mega_|small_)/);
	const name = parts[2]?.replaceAll(/[-_]/gi, ' ').replace(/\.jpe?g$/i, '') || '';
	return {
		name: name.trim(),
		largeImage: url.replace('/small_', '/mega_'),
		thumbnailImage: url.replace('/mega_', '/small_')
	};
}

export function parseSkapingHtml(html: string): Webcam | null {
	const scripts = extractScriptContents(html);
	const configScript = scripts.find((s) => s.includes('SkapingAPI.setConfig'));
	if (!configScript) return null;

	const keyMatch = configScript.match(
		/SkapingAPI\.setConfig\(\s*['"]https?:\/\/api\.skaping\.com\/['"]\s*,\s*['"]([a-zA-Z0-9-]+)['"]\s*\)/
	);
	const apiKey = keyMatch?.[1];
	if (!apiKey) return null;

	return {
		name: extractHtmlTitle(html),
		largeImage: `https://api.skaping.com/media/getLatest?format=jpg&api_key=${apiKey}&quality=large`,
		thumbnailImage: `https://api.skaping.com/media/getLatest?format=jpg&api_key=${apiKey}&quality=small`
	};
}

export function parsePanomaxHtml(html: string): Webcam | null {
	const scripts = extractScriptContents(html);
	const camScript = scripts.find((s) => s.includes('var camId ='));
	if (!camScript) return null;

	const camMatch = camScript.match(/var camId\s*=\s*["']([0-9]+)["']/);
	const camId = camMatch?.[1];
	if (!camId) return null;

	return {
		name: extractHtmlTitle(html),
		largeImage: `https://live-image.panomax.com/cams/${camId}/recent_reduced.jpg`,
		thumbnailImage: `https://live-image.panomax.com/cams/${camId}/recent_reduced.jpg`
	};
}

interface WebcamHdGroupItem {
	url_part_2: string;
	webcam_display_str_image: string;
	webcam_display_in_group_web_page_title: string;
}

export function parseWebcamHdGroupJson(jsonText: string, webcamIdPart: string): Webcam | null {
	const jsonData = JSON.parse(jsonText) as WebcamHdGroupItem[];
	if (!Array.isArray(jsonData)) return null;

	const webcamData = jsonData.find((w) => w.url_part_2 === webcamIdPart);
	if (!webcamData) return null;

	const imageId = webcamData.webcam_display_str_image;
	return {
		name: webcamData.webcam_display_in_group_web_page_title ?? '',
		largeImage: `https://trinum3.trinum.com/ibox/ftpcam/mega_${imageId}.jpg`,
		thumbnailImage: `https://trinum3.trinum.com/ibox/ftpcam/small_${imageId}.jpg`
	};
}

export async function detectWebcamFromUrl(
	rawUrl: string,
	fetchText: FetchTextFn
): Promise<Webcam | null> {
	const url = rawUrl.trim();
	if (!url) return null;

	if (url.startsWith('https://www.skaping.com')) {
		const html = await fetchText(url);
		return parseSkapingHtml(html);
	}

	if (url.startsWith('https://app.webcam-hd.com')) {
		const urlObj = new URL(url);
		const pathParts = urlObj.pathname.split('/').filter(Boolean);
		if (pathParts.length < 2) return null;

		const [group, webcamIdPart] = pathParts;
		const jsonUrl = `https://app.webcam-hd.com/smr/json/webcam_display_group/${group}.json`;
		const jsonText = await fetchText(jsonUrl);
		return parseWebcamHdGroupJson(jsonText, webcamIdPart);
	}

	if (url.startsWith('https://www.trinum.com/ibox/ftpcam/')) {
		return extractWebcamFromTrinumImage(url);
	}

	if (url.includes('panomax.com')) {
		const html = await fetchText(url);
		return parsePanomaxHtml(html);
	}

	if (/^https?:\/\/.{5,255}\.jpe?g(\?.*)?$/i.test(url)) {
		return {
			name: '',
			largeImage: url,
			thumbnailImage: url
		};
	}

	return null;
}
