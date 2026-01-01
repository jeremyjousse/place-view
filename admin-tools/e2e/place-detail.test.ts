import { expect, test } from '@playwright/test';

test('view and edit place details', async ({ page }) => {
	// Navigate to a place
	await page.goto('/');
	await page.click('text=Abondance');

	// Verify detail page
	await expect(page.locator('h1')).toContainText('Abondance');

	// Edit name
	await page.fill('#name', 'Abondance Updated');
	await page.getByRole('button', { name: 'Save Changes' }).click();
	const toast = page.getByText('Place updated successfully');
	await expect(toast).toBeVisible();

	// Verify update persisted
	await expect(page.locator('h1')).toContainText('Abondance Updated');

	// Reload to clear toasts and state
	await page.reload();

	// Revert change
	const nameInput2 = page.locator('#name');
	await nameInput2.fill('Abondance');
	await page.getByRole('button', { name: 'Save Changes' }).click();
	await expect(page.getByText('Place updated successfully')).toBeVisible();

	// Verify persistence by reloading
	await page.reload();
	await expect(page.locator('h1')).toHaveText('Abondance');
});
