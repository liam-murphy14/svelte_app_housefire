export type PrismaHttpError = {
  status: 400 | 404 | 409;
  message: string;
};

const prismaErrorResponses: Record<string, PrismaHttpError> = {
  P2002: {
    status: 409,
    message: 'A record with this value already exists',
  },
  P2003: {
    status: 400,
    message: 'A related record does not exist',
  },
  P2025: {
    status: 404,
    message: 'The requested record was not found',
  },
};

export const getPrismaHttpError = (error: unknown): PrismaHttpError | null => {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return null;
  }

  const code = error.code;
  if (typeof code !== 'string') {
    return null;
  }

  return prismaErrorResponses[code] ?? null;
};
