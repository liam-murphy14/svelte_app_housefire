import { describe, expect, it } from 'vitest';
import { getPrismaHttpError } from './prismaErrors';

describe('getPrismaHttpError', () => {
  it.each([
    ['P2002', 409],
    ['P2003', 400],
    ['P2025', 404],
  ])('maps Prisma %s errors to HTTP %i', (code, status) => {
    expect(getPrismaHttpError({ code })).toMatchObject({ status });
  });

  it('returns null for an unknown error', () => {
    expect(getPrismaHttpError({ code: 'P9999' })).toBeNull();
  });
});
