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
  await expect(page.getByText('03 / Geocodes', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Start with a ticker.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Browse the catalog' }).first()).toHaveAttribute(
    'href',
    '#catalog',
  );
  const closingSection = page.locator('#closing');
  await expect(
    closingSection.getByText('Updated monthly / growing regularly', { exact: true }),
  ).toBeVisible();
  await expect(
    closingSection.getByRole('link', { name: 'Browse available tickers' }),
  ).toBeVisible();
});

test('all public data pages render seeded beta data', async ({ page }) => {
  await page.goto('/');
  const tickerLink = page.getByRole('link', { name: 'HFTEST View properties', exact: true });
  await expect(tickerLink).toBeVisible();

  await tickerLink.click();
  await expect(page).toHaveURL(/\/properties\/HFTEST$/);
  await expect(page).toHaveTitle('Housefire | HFTEST Property Data');
  await expect(page.getByRole('heading', { name: 'HFTEST Properties' })).toBeVisible();
  await expect(page.locator('#map')).toHaveClass(/leaflet-container/);
  await expect(
    page.getByRole('link', { name: 'View North Harbor Logistics property details' }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'View Front Range Distribution Center property details' }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'View Peachtree Industrial Campus property details' }),
  ).toBeVisible();

  await page.getByRole('link', { name: 'View North Harbor Logistics property details' }).click();
  await expect(page).toHaveURL(/\/properties\/HFTEST\/[^/]+$/);
  await expect(page).toHaveTitle('Housefire | HFTEST | North Harbor Logistics Property Details');
  await expect(page.getByRole('heading', { name: 'North Harbor Logistics' })).toBeVisible();
  await expect(
    page.getByRole('banner').getByText('101 Harbor Way, Seattle, WA 98101, USA', { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Property location' })).toBeVisible();
  await expect(page.locator('#property-map')).toHaveClass(/leaflet-container/);
  await expect(page.getByText('Square footage', { exact: true })).toBeVisible();
  await expect(page.getByText('120,000', { exact: true })).toBeVisible();
  await expect(page.getByText('Year built', { exact: true })).toBeVisible();
  await expect(page.getByText('2018', { exact: true })).toBeVisible();
  await expect(page.getByText('Lease term', { exact: true })).toBeVisible();
  await expect(page.getByText('12 years', { exact: true })).toBeVisible();
  await expect(page.getByText('47.606', { exact: true })).toBeVisible();
  await expect(page.getByText('-122.332', { exact: true })).toBeVisible();
});
