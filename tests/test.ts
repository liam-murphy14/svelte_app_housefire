import { expect, test } from '@playwright/test';

test('index page explains Housefire and exposes the catalog entry point', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByAltText('Housefire Logo')).toBeVisible();
  await expect(page).toHaveTitle('Housefire | REIT Property Data, Made Tangible');
  await expect(
    page.getByRole('heading', { name: "See the shape of a REIT's portfolio." }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'A portfolio, in three useful layers.' }),
  ).toBeVisible();
  await expect(page.getByText('Geocodes', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Start with a ticker.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Browse the catalog' }).first()).toHaveAttribute(
    'href',
    '#catalog',
  );
});
