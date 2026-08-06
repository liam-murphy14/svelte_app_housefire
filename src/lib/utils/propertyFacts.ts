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

export const withSquareFootageFact = (
  facts: PropertyFact[],
  squareFootage: number | null | undefined,
): PropertyFact[] => {
  if (
    typeof squareFootage !== 'number' ||
    !Number.isFinite(squareFootage) ||
    facts.some((fact) => fact.label.trim().toLowerCase() === 'square footage')
  ) {
    return facts;
  }
  return [
    { label: 'Square footage', value: new Intl.NumberFormat('en-US').format(squareFootage) },
    ...facts,
  ];
};

export type PropertyFact = z.infer<typeof PropertyFactSchema>;
