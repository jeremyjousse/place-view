import { describe, expect, it } from 'vitest';
import {
	detectWebcamFromUrl,
	extractWebcamFromTrinumImage,
	parsePanomaxHtml,
	parseSkapingHtml,
	parseWebcamHdGroupJson
} from './WebcamDetector.js';

const noopFetch = async () => '';

describe('WebcamDetector', () => {
	it('extracts Trinum mega/small URLs and name', () => {
		const cam = extractWebcamFromTrinumImage(
			'https://www.trinum.com/ibox/ftpcam/mega_ot-peva_tc-essert.jpg'
		);
		expect(cam).toEqual({
			name: 'ot peva tc essert',
			largeImage: 'https://www.trinum.com/ibox/ftpcam/mega_ot-peva_tc-essert.jpg',
			thumbnailImage: 'https://www.trinum.com/ibox/ftpcam/small_ot-peva_tc-essert.jpg'
		});
	});

	it('parses Skaping HTML config and decodes title entities', async () => {
		const html = `
			<html>
				<head><title>Summit &amp; Peak</title></head>
				<body>
					<script>
						SkapingAPI.setConfig('http://api.skaping.com/', '3v74F-ptbOF-IaH1a-yLTFK');
					</script>
				</body>
			</html>
		`;

		const detected = await detectWebcamFromUrl(
			'https://www.skaping.com/aillons/centre',
			async () => html
		);
		expect(detected).toEqual({
			name: 'Summit & Peak',
			largeImage:
				'https://api.skaping.com/media/getLatest?format=jpg&api_key=3v74F-ptbOF-IaH1a-yLTFK&quality=large',
			thumbnailImage:
				'https://api.skaping.com/media/getLatest?format=jpg&api_key=3v74F-ptbOF-IaH1a-yLTFK&quality=small'
		});
		expect(parseSkapingHtml('<html></html>')).toBeNull();
	});

	it('parses Panomax HTML camId and title', async () => {
		const html = `
			<html>
				<head><title>Panomax Peak</title></head>
				<body><script>var camId = "12345";</script></body>
			</html>
		`;

		const detected = await detectWebcamFromUrl(
			'https://example.panomax.com/peak',
			async () => html
		);
		expect(detected).toEqual({
			name: 'Panomax Peak',
			largeImage: 'https://live-image.panomax.com/cams/12345/recent_reduced.jpg',
			thumbnailImage: 'https://live-image.panomax.com/cams/12345/recent_reduced.jpg'
		});
		expect(parsePanomaxHtml('<html></html>')).toBeNull();
	});

	it('parses Webcam-HD group JSON', async () => {
		const payload = JSON.stringify([
			{
				url_part_2: 'front-de-neige',
				webcam_display_str_image: 'station_front',
				webcam_display_in_group_web_page_title: 'Front de Neige'
			}
		]);

		const detected = await detectWebcamFromUrl(
			'https://app.webcam-hd.com/station/front-de-neige',
			async () => payload
		);
		expect(detected).toEqual({
			name: 'Front de Neige',
			largeImage: 'https://trinum3.trinum.com/ibox/ftpcam/mega_station_front.jpg',
			thumbnailImage: 'https://trinum3.trinum.com/ibox/ftpcam/small_station_front.jpg'
		});
		expect(parseWebcamHdGroupJson(payload, 'missing')).toBeNull();
	});

	it('supports direct jpg URLs and rejects unsupported URLs', async () => {
		const jpg = await detectWebcamFromUrl('https://example.com/live/cam.jpg', noopFetch);
		expect(jpg).toEqual({
			name: '',
			largeImage: 'https://example.com/live/cam.jpg',
			thumbnailImage: 'https://example.com/live/cam.jpg'
		});

		expect(await detectWebcamFromUrl('https://example.com/page', noopFetch)).toBeNull();
	});
});
