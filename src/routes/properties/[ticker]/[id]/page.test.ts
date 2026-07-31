import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import Page from './+page.svelte';

describe('property detail page', () => {
  it('renders the property fields and ordered facts', () => {
    const { body } = render(Page, {
      props: {
        data: {
          ticker: 'PLD',
          property: {
            id: 'property-1',
            name: 'Warehouse',
            addressInput: '1 Main Street, Dallas, TX',
            address: '1 Main Street',
            city: 'Dallas',
            state: 'TX',
            zip: '75001',
            squareFootage: 125000,
            facts: [
              { label: 'Year built', value: '2022' },
              { label: 'Lease term', value: '15 years' },
            ],
          },
          metaTags: { title: 'Warehouse Property Details', description: 'Property details' },
        },
      } as never,
    });

    expect(body).toContain('Warehouse');
    expect(body).toContain('125,000');
    expect(body).toContain('Year built');
    expect(body).toContain('2022');
    expect(body.indexOf('Year built')).toBeLessThan(body.indexOf('Lease term'));
    expect(body).toContain('href="/properties/PLD"');
  });

  it('renders an empty-state message when there are no facts', () => {
    const { body } = render(Page, {
      props: {
        data: {
          ticker: 'PLD',
          property: { id: 'property-1', addressInput: '1 Main Street', facts: [] },
          metaTags: { title: 'Property Details', description: 'Property details' },
        },
      } as never,
    });

    expect(body).toContain('No property facts are available for this record yet.');
  });
});
