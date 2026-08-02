import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import Page from './+page.svelte';

describe('property detail page', () => {
  it('renders visible property data, a focused map, and ordered facts', () => {
    const { body } = render(Page, {
      props: {
        data: {
          ticker: 'PLD',
          property: {
            id: 'property-1',
            name: 'Warehouse',
            addressInput: 'backend-only-address-input',
            address: '1 Main Street',
            address2: 'Suite 100',
            neighborhood: 'Design District',
            city: 'Dallas',
            state: 'TX',
            zip: '75001',
            country: 'United States',
            latitude: 32.7767,
            longitude: -96.797,
            facts: [
              { label: 'Square footage', value: '125,000' },
              { label: 'Year built', value: '2022' },
              { label: 'Lease term', value: '15 years' },
            ],
          },
          metaTags: { title: 'Warehouse Property Details', description: 'Property details' },
        },
      } as never,
    });

    expect(body).toContain('Warehouse');
    expect(body).toContain('1 Main Street, Suite 100, Dallas, TX 75001, United States');
    expect(body).toContain('Property location');
    expect(body).toContain('id="property-map"');
    expect(body).toContain('Square footage');
    expect(body).toContain('125,000');
    expect(body).not.toContain('backend-only-address-input');
    expect(body).toContain('Design District');
    expect(body).toContain('32.777');
    expect(body).toContain('-96.797');
    expect(body).toContain('Year built');
    expect(body).toContain('2022');
    expect(body.indexOf('Year built')).toBeLessThan(body.indexOf('Lease term'));
    expect(body).toContain('href="/properties/PLD"');
  });

  it('uses the visible address as the heading when the property name is only whitespace', () => {
    const { body } = render(Page, {
      props: {
        data: {
          ticker: 'PLD',
          property: {
            id: 'property-1',
            name: '   ',
            addressInput: 'backend-only-address-input',
            address: '1 Main Street',
            city: 'Dallas',
            state: 'TX',
            zip: '75001',
            country: 'United States',
            facts: [],
          },
          metaTags: { title: 'Property Details', description: 'Property details' },
        },
      } as never,
    });

    expect(body).toMatch(/<h1[^>]*>\s*1 Main Street, Dallas, TX 75001, United States\s*<\/h1>/);
    expect(body).not.toContain('backend-only-address-input');
  });

  it('renders a map unavailable state when the property has no coordinates', () => {
    const { body } = render(Page, {
      props: {
        data: {
          ticker: 'PLD',
          property: {
            id: 'property-1',
            addressInput: 'backend-only-address-input',
            address: '1 Main Street',
            facts: [],
          },
          metaTags: { title: 'Property Details', description: 'Property details' },
        },
      } as never,
    });

    expect(body).toContain('Map unavailable for this property');
    expect(body).not.toContain('id="property-map"');
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
