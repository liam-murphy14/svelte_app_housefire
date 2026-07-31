import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import Page from './+page.svelte';

describe('ticker property page', () => {
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
});
