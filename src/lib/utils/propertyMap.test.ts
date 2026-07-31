import { describe, expect, it } from 'vitest';
import { propertyDetailsPath, propertyPopupContent } from './propertyMap';

describe('propertyDetailsPath', () => {
  it('builds the nested property route', () => {
    expect(propertyDetailsPath('PLD', 'property-1')).toBe('/properties/PLD/property-1');
  });
});

describe('propertyPopupContent', () => {
  it('includes escaped summary text and a property-detail link', () => {
    const popup = propertyPopupContent(
      {
        id: 'property-1',
        name: '<Warehouse>',
        address: '1 Main & 2nd',
        addressInput: '1 Main & 2nd, Dallas, TX',
      },
      'PLD',
    );

    expect(popup).toContain('&lt;Warehouse&gt;');
    expect(popup).toContain('1 Main &amp; 2nd');
    expect(popup).toContain('href="/properties/PLD/property-1"');
    expect(popup).toContain('View property details');
    expect(popup).not.toContain('<Warehouse>');
  });
});
