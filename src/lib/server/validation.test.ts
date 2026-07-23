import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { formatZodError } from './validation';

describe('formatZodError', () => {
  it('joins Zod issue messages in input order', () => {
    const result = z.object({ ticker: z.string().min(1), count: z.number() }).safeParse({
      ticker: '',
      count: 'not a number',
    });

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(formatZodError(result.error)).toBe(
      'Too small: expected string to have >=1 characters, Invalid input: expected number, received string',
    );
  });
});
