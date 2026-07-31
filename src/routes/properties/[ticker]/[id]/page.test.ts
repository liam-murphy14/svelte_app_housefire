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
            address2: 'Suite 100',
            neighborhood: 'Design District',
            city: 'Dallas',
            state: 'TX',
            zip: '75001',
            country: 'United States',
            latitude: 32.7767,
            longitude: -96.797,
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
    expect(body).toContain('Suite 100');
    expect(body).toContain('Design District');
    expect(body).toContain('32.777');
    expect(body).toContain('-96.797');
    expect(body).toContain('125,000');
    expect(body).toContain('Year built');
    expect(body).toContain('2022');
    expect(body.indexOf('Year built')).toBeLessThan(body.indexOf('Lease term'));
    expect(body).toContain('href="/properties/PLD"');
  });

  it('uses the address input as the heading when the property name is only whitespace', () => {
    const { body } = render(Page, {
      props: {
        data: {
          ticker: 'PLD',
          property: {
            id: 'property-1',
            name: '   ',
            addressInput: '1 Main Street',
            facts: [],
          },
          metaTags: { title: 'Property Details', description: 'Property details' },
        },
      } as never,
    });

    expect(body).toMatch(/<h1[^>]*>\s*1 Main Street\s*<\/h1>/);
  });

  it('renders every fact when labels are duplicated', () => {
    const { body } = render(Page, {
      props: {
        data: {
          ticker: 'PLD',
          property: {
            id: 'property-1',
            addressInput: '1 Main Street',
            facts: [
              { label: 'Occupancy', value: '95%' },
              { label: 'Occupancy', value: '97%' },
            ],
          },
          metaTags: { title: 'Property Details', description: 'Property details' },
        },
      } as never,
    });

    expect(body).toContain('95%');
    expect(body).toContain('97%');
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
