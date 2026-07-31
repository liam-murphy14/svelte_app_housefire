import { z } from 'zod';

export const PropertyFactSchema = z.strictObject({
  label: z.string().trim().min(1),
  value: z.string().trim().min(1),
});

export const PropertyFactsSchema = z.array(PropertyFactSchema);

export const parsePropertyFacts = (value: unknown): PropertyFact[] => {
  const result = PropertyFactsSchema.safeParse(value);
  return result.success ? result.data : [];
};

export type PropertyFact = z.infer<typeof PropertyFactSchema>;
