import { expect, test } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';

test.beforeEach(async ({ page }) => {
	await page.route('**/places.json*', async (route) => {
		await route.fulfill({
			json: [
				{
					id: 'abondance',
					name: 'Abondance',
					state: 'Haute-Savoie',
					country: 'France',
					coordinates: { latitude: 45.9237, longitude: 6.8694 },
					webcams: []
				},
				{
					id: 'annecy',
					name: 'Annecy',
					state: 'Haute-Savoie',
					country: 'France',
					coordinates: { latitude: 45.8992, longitude: 6.1294 },
					webcams: []
				}
			]
		});
	});
});

test('restores filters and retains them across views and place links', async ({ page }) => {
	await page.goto('/?q=Abondance');
	const search = page.getByPlaceholder('Search places...');
	await expect(search).toHaveValue('Abondance');
	await expect(page.getByRole('link', { name: /Abondance/ })).toBeVisible();
	await expect(page.getByRole('link', { name: /Annecy/ })).toHaveCount(0);

	await page.getByRole('link', { name: /Abondance/ }).click();
	await expect(page).toHaveURL(/\/place\/abondance\/\?q=Abondance/);
	await page.reload();
	await expect(page.getByRole('heading', { name: 'Abondance' })).toBeVisible();
	await expect(search).toHaveValue('Abondance');
	await page.getByRole('link', { name: 'Back to Explorer' }).click();
	await expect(search).toHaveValue('Abondance');
});

test('restores map position, filters and browser history', async ({ page }) => {
	await page.goto('/map/?q=Abondance&lat=46.00000&lon=3.00000&zoom=7');
	await expect(page.locator('.leaflet-container')).toBeVisible();
	await expect(page.getByPlaceholder('Search places...')).toHaveValue('Abondance');
	await expect(page).toHaveURL(/lat=46\.00000.*lon=3\.00000.*zoom=7/);

	await page.getByRole('button', { name: 'Favorites Only' }).click();
	await expect(page).toHaveURL(/favorites=1/);
	await page.locator('.leaflet-control-zoom-in').click();
	await expect(page).toHaveURL(/zoom=8/);
	await page.goBack();
	await expect(page).not.toHaveURL(/favorites=1/);
	await expect(page).toHaveURL(/lat=46\.00000.*lon=3\.00000.*zoom=7/);

	await page.locator('.leaflet-control-zoom-in').click();
	await expect(page).toHaveURL(/zoom=8/);
	await page.reload();
	await expect(page.locator('.leaflet-container')).toBeVisible();
	await expect(page).toHaveURL(/zoom=8/);
});

test('opens a prerendered place directly', async ({ page }) => {
	const response = await page.goto('/place/abondance/');
	expect(response?.status()).toBe(200);
	await expect(page.getByRole('heading', { name: 'Abondance' })).toBeVisible();
});

test('preserves search input and filters while switching views', async ({ page }) => {
	await page.setViewportSize({ width: 800, height: 900 });
	await page.addInitScript(() => localStorage.setItem('favorites', JSON.stringify(['abondance'])));
	await page.goto('/');
	const search = page.getByPlaceholder('Search places...');
	await search.pressSequentially('Abondance');
	await expect(page).toHaveURL(/q=Abondance/);
	await page.getByRole('button', { name: 'Favorites Only' }).click();
	await expect(page).toHaveURL(/favorites=1/);
	await expect(page.getByRole('link', { name: /Abondance/ })).toBeVisible();
	await page.getByRole('link', { name: 'Map', exact: true }).click();
	await expect(page).toHaveURL(/\/map\/\?.*q=Abondance.*favorites=1/);
	await expect(search).toHaveValue('Abondance');
	await page.goBack();
	await expect(page).toHaveURL(/\/\?.*q=Abondance.*favorites=1/);
});

test('replaces invalid map coordinates with a valid position', async ({ page }) => {
	await page.goto('/map/?lat=91&lon=2&zoom=99');
	await expect(page.locator('.leaflet-container')).toBeVisible();
	await expect(page).not.toHaveURL(/lat=91/);
	await expect(page).not.toHaveURL(/zoom=99/);
});

test('shares the selected place and map movements', async ({ page }) => {
	await page.goto('/place/abondance/?q=Abondance');
	await page.getByRole('link', { name: 'OPEN ON MAP' }).click();
	await expect(page).toHaveURL(/place=abondance/);
	await expect(page).toHaveURL(/zoom=12/);
	const map = page.locator('.leaflet-container');
	const bounds = await map.boundingBox();
	expect(bounds).not.toBeNull();
	if (!bounds) throw new Error('Map has no bounding box');
	const initialUrl = new URL(page.url());
	await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
	await page.mouse.down();
	await page.mouse.move(bounds.x + bounds.width / 2 + 100, bounds.y + bounds.height / 2, {
		steps: 10
	});
	await page.mouse.up();
	await expect
		.poll(() => new URL(page.url()).searchParams.get('lon'))
		.not.toBe(initialUrl.searchParams.get('lon'));
	await expect(page).toHaveURL(/q=Abondance/);
	await expect(page).toHaveURL(/place=abondance/);

	await page.getByRole('link', { name: 'Map', exact: true }).click();
	await expect(page).not.toHaveURL(/place=/);
	await expect(page).toHaveURL(/q=Abondance/);
});

test('build contains a static page for every place and the map', () => {
	const places: { id: string }[] = JSON.parse(readFileSync('../resources/places.json', 'utf8'));
	expect(existsSync('build/map/index.html')).toBe(true);
	for (const place of places) {
		expect(existsSync(`build/place/${place.id}/index.html`), place.id).toBe(true);
	}
});
