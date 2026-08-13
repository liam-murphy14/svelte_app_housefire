import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import Page from './+page.svelte';

describe('ticker property page', () => {
  it('renders property rows before the map initializes', () => {
    const { body } = render(Page, {
      props: {
        data: {
          ticker: 'PLD',
          properties: [
            {
              id: 'property-1',
              name: 'Warehouse',
              addressInput: '1 Main Street, Dallas, TX',
              city: 'Dallas',
              state: 'TX',
              facts: [],
            },
          ],
          metaTags: { title: 'PLD Property Data', description: 'Property data' },
        },
      } as never,
    });

    const tableStart = body.indexOf('<table');
    const tableEnd = body.indexOf('</table>') + '</table>'.length;
    const tableMarkup = body.slice(tableStart, tableEnd);

    expect(tableMarkup).toContain('Warehouse');
  });

  it('keeps the desktop table narrow and links the property name to details', () => {
    const { body } = render(Page, {
      props: {
        data: {
          ticker: 'PLD',
          properties: [
            {
              id: 'property-1',
              name: 'Warehouse',
              addressInput: '1 Main Street, Dallas, TX',
              city: 'Dallas',
              state: 'TX',
              facts: [],
            },
          ],
          metaTags: { title: 'PLD Property Data', description: 'Property data' },
        },
      } as never,
    });

    const tableStart = body.indexOf('<table');
    const tableEnd = body.indexOf('</table>') + '</table>'.length;
    const tableMarkup = body.slice(tableStart, tableEnd);

    expect(tableMarkup).toContain('Name');
    expect(tableMarkup).toContain('City');
    expect(tableMarkup).toContain('State');
    expect(tableMarkup).not.toContain('Address');
    expect(tableMarkup).not.toContain('Square Footage');
    expect(tableMarkup).toContain('href="/properties/PLD/property-1"');
    expect(tableMarkup).toContain('View Warehouse property details');
  });

  it('renders desktop controls and only the first mobile property batch', () => {
    const properties = Array.from({ length: 26 }, (_, index) => ({
      id: `property-${index + 1}`,
      name: `Property ${index + 1}`,
      addressInput: `${index + 1} Main Street, Dallas, TX`,
      city: 'Dallas',
      state: 'TX',
      facts: [],
    }));
    const { body } = render(Page, {
      props: {
        data: {
          ticker: 'PLD',
          properties,
          metaTags: { title: 'PLD Property Data', description: 'Property data' },
        },
      } as never,
    });

    expect(body).toContain('Search properties');
    expect(body).toContain('Showing 1–10 of 26 properties');
    expect(body).toContain('Showing 25 of 26 properties.');
    expect(body).not.toContain('>Property 26</h3>');
  });

  it('renders the empty paginated table state for an empty property list', () => {
    const { body } = render(Page, {
      props: {
        data: {
          ticker: 'PLD',
          properties: [],
          metaTags: { title: 'PLD Property Data', description: 'Property data' },
        },
      } as never,
    });

    expect(body).toContain('No property records are available.');
    expect(body).toContain('No property records are available for this ticker yet.');
  });
});
