import * as cheerio from 'cheerio';

import type { IWebcamDetectorService } from './IWebcamDetectorService';
import type { Webcam } from '../domain/Webcam';

export class WebcamDetectorService implements IWebcamDetectorService {
	async detectWebcam(url: string): Promise<Webcam | null> {
		if (url.startsWith('https://www.skaping.com')) {
			return await this.extractWebcamFromSkapingWebsite(url);
		}

		if (url.startsWith('https://app.webcam-hd.com')) {
			return await this.extractWebcamFromWebcamHd(url);
		}

		if (url.startsWith('https://www.trinum.com/ibox/ftpcam/')) {
			return this.extractWebcamFromTrinumImage(url);
		}

		if (url.includes('panomax.com')) {
			return this.extractWebcamFromPanomax(url);
		}

		if (/.{5,255}\.jpg$/.test(url)) {
			return {
				name: '',
				largeImage: url,
				thumbnailImage: url
			};
		}

		return null;
	}

	private extractWebcamFromTrinumImage(url: string): Webcam {
		const parts = url.split(/(mega_|small_)/);
		const name = parts[2]?.replaceAll(/[-_]/gi, ' ').replace('.jpg', '') || '';
		return {
			name,
			largeImage: url.replace('/small_', '/mega_'),
			thumbnailImage: url.replace('/mega_', '/small_')
		};
	}

	private async extractWebcamFromSkapingWebsite(url: string): Promise<Webcam> {
		try {
			const skapingPageResponse = await fetch(url);
			const skapingPageSource = await skapingPageResponse.text();

			const $ = cheerio.load(skapingPageSource);
			const scriptTag = $('script')
				.get()
				.find((s) => {
					const data =
						s.children[0] && 'data' in s.children[0] ? (s.children[0].data as string) : null;
					return data && data.includes('SkapingAPI.setConfig');
				});

			const script =
				scriptTag && scriptTag.children[0] && 'data' in scriptTag.children[0]
					? (scriptTag.children[0].data as string)
					: null;
			if (!script) throw new Error('Skaping script not found');

			const skapingWebcamKeyMatches = script.match(
				/SkapingAPI\.setConfig\('http:\/\/api\.skaping\.com\/', '([a-zA-Z0-9-]+)'\);/
			);

			const skapingWebcamKey = skapingWebcamKeyMatches ? skapingWebcamKeyMatches[1] : null;
			if (!skapingWebcamKey) throw new Error('Skaping API key not found');

			return {
				name: $('title').text(),
				largeImage: `https://api.skaping.com/media/getLatest?format=jpg&api_key=${skapingWebcamKey}&quality=large`,
				thumbnailImage: `https://api.skaping.com/media/getLatest?format=jpg&api_key=${skapingWebcamKey}&quality=small`
			};
		} catch (e) {
			console.error('Error detecting Skaping webcam:', e);
			return {
				name: '',
				largeImage: '',
				thumbnailImage: ''
			};
		}
	}

	private async extractWebcamFromPanomax(url: string): Promise<Webcam> {
		try {
			const panomaxPageResponse = await fetch(url);
			const panomaxPageSource = await panomaxPageResponse.text();

			const $ = cheerio.load(panomaxPageSource);
			const scriptTag = $('script[type="text/javascript"][language="JavaScript"]')
				.get()
				.find((s) => {
					const data =
						s.children[0] && 'data' in s.children[0] ? (s.children[0].data as string) : null;
					return data && data.includes('var camId =');
				});

			const script =
				scriptTag && scriptTag.children[0] && 'data' in scriptTag.children[0]
					? (scriptTag.children[0].data as string)
					: null;
			if (!script) throw new Error('Panomax script not found');

			const panomaxWebcamIds = script.match(/var camId = "([0-9]+)";/);
			const panomaxWebcamId = panomaxWebcamIds ? panomaxWebcamIds[1] : null;
			if (!panomaxWebcamId) throw new Error('Panomax camId not found');

			return {
				name: $('title').text(),
				largeImage: `https://live-image.panomax.com/cams/${panomaxWebcamId}/recent_reduced.jpg`,
				thumbnailImage: `https://live-image.panomax.com/cams/${panomaxWebcamId}/recent_reduced.jpg`
			};
		} catch (e) {
			console.error('Error detecting Panomax webcam:', e);
			return {
				name: '',
				largeImage: '',
				thumbnailImage: ''
			};
		}
	}

	private async extractWebcamFromWebcamHd(url: string): Promise<Webcam> {
		console.log('Extracting Webcam-HD webcam from URL:', url);
		try {
			const urlObj = new URL(url);
			const pathParts = urlObj.pathname.split('/').filter(Boolean);
			if (pathParts.length < 2) throw new Error('Invalid Webcam-HD URL');

			const group = pathParts[0];
			const webcamIdPart = pathParts[1];

			// Fetch JSON data
			const jsonUrl = `https://app.webcam-hd.com/smr/json/webcam_display_group/${group}.json`;
			console.log('Fetching Webcam-HD JSON data from URL:', jsonUrl);
			const jsonResponse = await fetch(jsonUrl);
			const jsonData = (await jsonResponse.json()) as Array<{
				url_part_2: string;
				webcam_display_str_image: string;
				webcam_display_in_group_web_page_title: string;
			}>;
			console.log('Webcam-HD JSON data fetched:', jsonData);
			const webcamData = jsonData.find((w) => w.url_part_2 === webcamIdPart);
			console.log('Extracted Webcam-HD webcam data:', webcamData);
			if (!webcamData) throw new Error('Webcam data not found in JSON');

			const imageIdentifier = webcamData.webcam_display_str_image;
			const name = webcamData.webcam_display_in_group_web_page_title;

			const image = {
				name,
				largeImage: `https://trinum3.trinum.com/ibox/ftpcam/mega_${imageIdentifier}.jpg`,
				thumbnailImage: `https://trinum3.trinum.com/ibox/ftpcam/small_${imageIdentifier}.jpg`
			};
			console.log('Constructed Webcam-HD webcam image data:', JSON.stringify(image));

			return image;
		} catch (e) {
			console.error('Error detecting Webcam-HD webcam:', e);
			return {
				name: '',
				largeImage: '',
				thumbnailImage: ''
			};
		}
	}
}
