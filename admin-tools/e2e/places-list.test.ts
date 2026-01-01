import { expect, test } from '@playwright/test';

test('home page displays list of places', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('h1')).toHaveText('Places');

	// Check if at least one place is displayed
	const places = page.locator('a[href^="/places/"]');
	await expect(places.first()).toBeVisible();

	// Check for specific place content (e.g. from places.json)
	// Assuming "Abondance" is in the list (it is the first one in the file I read earlier)
	await expect(page.getByRole('heading', { name: 'Abondance', exact: true })).toBeVisible();
});
