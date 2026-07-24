import { describe, expect, it } from 'vitest';
import { displayPropertyValue } from './propertyDisplay';

describe('displayPropertyValue', () => {
  it('uses an em dash for missing values', () => {
    expect(displayPropertyValue(null)).toBe('—');
    expect(displayPropertyValue(undefined)).toBe('—');
    expect(displayPropertyValue('')).toBe('—');
  });

  it('preserves text and formats numeric values', () => {
    expect(displayPropertyValue('125 Main Street')).toBe('125 Main Street');
    expect(displayPropertyValue(125000)).toBe('125,000');
  });
});
