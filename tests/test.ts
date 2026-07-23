import { expect, test } from '@playwright/test';

test('index page renders Housefire content', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByAltText('Housefire Logo')).toBeVisible();
  await expect(
    page.getByText('See fine-grained property data for your favorite REITs'),
  ).toBeVisible();
});
