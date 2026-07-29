import { z } from 'zod';

export const PropertyFactSchema = z.strictObject({
  label: z.string().trim().min(1),
  value: z.string().trim().min(1),
});

export const PropertyFactsSchema = z.array(PropertyFactSchema);

export type PropertyFact = z.infer<typeof PropertyFactSchema>;
