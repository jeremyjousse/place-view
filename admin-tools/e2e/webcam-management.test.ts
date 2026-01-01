import { expect, test } from '@playwright/test';

test('manage webcams', async ({ page }) => {
	// 1. Navigate to a place detail page
	// 1. Navigate to a place detail page
	await page.goto('/');
	await page.click('text=Abondance');

	// 2. Add a new webcam

	// 2. Add a new webcam
	await page.fill('#webcam-name', 'Test Webcam');
	await page.fill('#webcam-large', 'https://example.com/large.jpg');
	await page.fill('#webcam-thumb', 'https://example.com/thumb.jpg');
	await page.click('button:has-text("Add Webcam")');
	await expect(page.getByText('Webcam added successfully')).toBeVisible();

	// 3. Verify the webcam is added
	await expect(page.getByText('Test Webcam')).toBeVisible();
	await expect(page.getByText('https://example.com/thumb.jpg')).toBeVisible();

	// 4. Remove the webcam
	const webcamCard = page.locator('.relative', { hasText: 'Test Webcam' });
	await webcamCard.getByRole('button', { name: 'Remove' }).click();
	await expect(page.getByText('Webcam removed successfully')).toBeVisible();

	// 5. Verify the webcam is removed
	await expect(page.getByText('Test Webcam')).not.toBeVisible();
});

test('reorder webcams', async ({ page }) => {
	// 1. Navigate to a place detail page
	await page.goto('/');
	await page.click('text=Abondance');

	// 2. Add a new webcam

	// Add Webcam A
	await page.fill('#webcam-name', 'Reorder A');
	await page.fill('#webcam-large', 'http://a.com/l');
	await page.fill('#webcam-thumb', 'http://a.com/t');
	await page.click('button:has-text("Add Webcam")');
	await expect(page.getByText('Webcam added successfully')).toBeVisible();
	await expect(page.getByText('Webcam added successfully')).toBeHidden();

	// Add Webcam B
	await page.fill('#webcam-name', 'Reorder B');
	await page.fill('#webcam-large', 'http://b.com/l');
	await page.fill('#webcam-thumb', 'http://b.com/t');
	await page.click('button:has-text("Add Webcam")');
	await expect(page.getByText('Webcam added successfully')).toBeVisible();
	await expect(page.getByText('Webcam added successfully')).toBeHidden();

	// Verify initial order
	const webcamNames = page.locator('.relative p.text-gray-900');
	let names = await webcamNames.allTextContents();
	let indexA = names.indexOf('Reorder A');
	let indexB = names.indexOf('Reorder B');
	expect(indexA).toBeLessThan(indexB);

	// Drag Webcam B to Webcam A's position (swap them)
	const cardA = page.locator('.relative', { hasText: 'Reorder A' });
	const cardB = page.locator('.relative', { hasText: 'Reorder B' });

	await cardB.dragTo(cardA);

	await expect(page.getByText('Webcam order saved')).toBeVisible();
	// await expect(page.getByText('Webcam order saved')).toBeHidden({ timeout: 10000 });

	// Verify new order
	names = await webcamNames.allTextContents();
	indexA = names.indexOf('Reorder A');
	indexB = names.indexOf('Reorder B');
	expect(indexB).toBeLessThan(indexA);

	// Reload and verify
	await page.reload();
	names = await webcamNames.allTextContents();
	indexA = names.indexOf('Reorder A');
	indexB = names.indexOf('Reorder B');
	expect(indexB).toBeLessThan(indexA);

	// Clean up
	await page
		.locator('.relative', { hasText: 'Reorder A' })
		.getByRole('button', { name: 'Remove' })
		.click();
	await expect(page.getByText('Webcam removed successfully')).toBeVisible();
	await expect(page.getByText('Webcam removed successfully')).toBeHidden();

	await page
		.locator('.relative', { hasText: 'Reorder B' })
		.getByRole('button', { name: 'Remove' })
		.click();
	await expect(page.getByText('Webcam removed successfully')).toBeVisible();
});
