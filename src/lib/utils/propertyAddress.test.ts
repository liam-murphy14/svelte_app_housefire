import { describe, expect, it } from 'vitest';
import { formatPropertyAddress } from './propertyAddress';

describe('formatPropertyAddress', () => {
  it('formats the full address with state and ZIP together', () => {
    expect(
      formatPropertyAddress({
        address: '1 Main Street',
        address2: 'Suite 100',
        city: 'Dallas',
        state: 'TX',
        zip: '75001',
        country: 'United States',
      }),
    ).toBe('1 Main Street, Suite 100, Dallas, TX 75001, United States');
  });

  it('omits blank components', () => {
    expect(
      formatPropertyAddress({
        address: '1 Main Street',
        address2: '   ',
        city: 'Dallas',
        state: null,
        zip: '75001',
        country: 'United States',
      }),
    ).toBe('1 Main Street, Dallas, 75001, United States');
  });

  it('returns an empty string when no visible fields exist', () => {
    expect(formatPropertyAddress({})).toBe('');
  });
});
