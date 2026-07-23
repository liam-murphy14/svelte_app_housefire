import type { ZodError } from 'zod';

export const formatZodError = (error: ZodError): string => {
  return error.issues.map((issue) => issue.message).join(', ');
};
