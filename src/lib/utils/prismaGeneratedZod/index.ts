import { z } from 'zod';
import type { Prisma } from '@prisma/client';

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////

/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum([
  'ReadUncommitted',
  'ReadCommitted',
  'RepeatableRead',
  'Serializable',
]);

export const ReitScalarFieldEnumSchema = z.enum(['id', 'createdAt', 'updatedAt', 'ticker']);

export const PropertyScalarFieldEnumSchema = z.enum([
  'id',
  'createdAt',
  'updatedAt',
  'addressInput',
  'name',
  'address',
  'address2',
  'neighborhood',
  'city',
  'state',
  'zip',
  'country',
  'latitude',
  'longitude',
  'squareFootage',
  'reitTicker',
]);

export const GeocodeScalarFieldEnumSchema = z.enum([
  'id',
  'createdAt',
  'updatedAt',
  'addressInput',
  'streetNumber',
  'route',
  'locality',
  'administrativeAreaLevel1',
  'administrativeAreaLevel2',
  'country',
  'postalCode',
  'formattedAddress',
  'globalPlusCode',
  'latitude',
  'longitude',
]);

export const SortOrderSchema = z.enum(['asc', 'desc']);

export const QueryModeSchema = z.enum(['default', 'insensitive']);

export const NullsOrderSchema = z.enum(['first', 'last']);
/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// REIT SCHEMA
/////////////////////////////////////////

export const ReitSchema = z.object({
  id: z.string().cuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  ticker: z.string(),
});

export type Reit = z.infer<typeof ReitSchema>;

/////////////////////////////////////////
// PROPERTY SCHEMA
/////////////////////////////////////////

export const PropertySchema = z.object({
  id: z.string().cuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  addressInput: z.string(),
  name: z.string().nullable(),
  address: z.string().nullable(),
  address2: z.string().nullable(),
  neighborhood: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  zip: z.string().nullable(),
  country: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  squareFootage: z.number().nullable(),
  reitTicker: z.string(),
});

export type Property = z.infer<typeof PropertySchema>;

/////////////////////////////////////////
// GEOCODE SCHEMA
/////////////////////////////////////////

export const GeocodeSchema = z.object({
  id: z.string().cuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  addressInput: z.string(),
  streetNumber: z.string().nullable(),
  route: z.string().nullable(),
  locality: z.string().nullable(),
  administrativeAreaLevel1: z.string().nullable(),
  administrativeAreaLevel2: z.string().nullable(),
  country: z.string().nullable(),
  postalCode: z.string().nullable(),
  formattedAddress: z.string().nullable(),
  globalPlusCode: z.string().nullable(),
  latitude: z.number(),
  longitude: z.number(),
});

export type Geocode = z.infer<typeof GeocodeSchema>;

/////////////////////////////////////////
// SELECT & INCLUDE
/////////////////////////////////////////

// REIT
//------------------------------------------------------

export const ReitIncludeSchema: z.ZodType<Prisma.ReitInclude> = z
  .object({
    properties: z.union([z.boolean(), z.lazy(() => PropertyFindManyArgsSchema)]).optional(),
    _count: z.union([z.boolean(), z.lazy(() => ReitCountOutputTypeArgsSchema)]).optional(),
  })
  .strict();

export const ReitArgsSchema: z.ZodType<Prisma.ReitDefaultArgs> = z
  .object({
    select: z.lazy(() => ReitSelectSchema).optional(),
    include: z.lazy(() => ReitIncludeSchema).optional(),
  })
  .strict();

export const ReitCountOutputTypeArgsSchema: z.ZodType<Prisma.ReitCountOutputTypeDefaultArgs> = z
  .object({
    select: z.lazy(() => ReitCountOutputTypeSelectSchema).nullish(),
  })
  .strict();

export const ReitCountOutputTypeSelectSchema: z.ZodType<Prisma.ReitCountOutputTypeSelect> = z
  .object({
    properties: z.boolean().optional(),
  })
  .strict();

export const ReitSelectSchema: z.ZodType<Prisma.ReitSelect> = z
  .object({
    id: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional(),
    ticker: z.boolean().optional(),
    properties: z.union([z.boolean(), z.lazy(() => PropertyFindManyArgsSchema)]).optional(),
    _count: z.union([z.boolean(), z.lazy(() => ReitCountOutputTypeArgsSchema)]).optional(),
  })
  .strict();

// PROPERTY
//------------------------------------------------------

export const PropertyIncludeSchema: z.ZodType<Prisma.PropertyInclude> = z
  .object({
    reit: z.union([z.boolean(), z.lazy(() => ReitArgsSchema)]).optional(),
  })
  .strict();

export const PropertyArgsSchema: z.ZodType<Prisma.PropertyDefaultArgs> = z
  .object({
    select: z.lazy(() => PropertySelectSchema).optional(),
    include: z.lazy(() => PropertyIncludeSchema).optional(),
  })
  .strict();

export const PropertySelectSchema: z.ZodType<Prisma.PropertySelect> = z
  .object({
    id: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional(),
    addressInput: z.boolean().optional(),
    name: z.boolean().optional(),
    address: z.boolean().optional(),
    address2: z.boolean().optional(),
    neighborhood: z.boolean().optional(),
    city: z.boolean().optional(),
    state: z.boolean().optional(),
    zip: z.boolean().optional(),
    country: z.boolean().optional(),
    latitude: z.boolean().optional(),
    longitude: z.boolean().optional(),
    squareFootage: z.boolean().optional(),
    reitTicker: z.boolean().optional(),
    reit: z.union([z.boolean(), z.lazy(() => ReitArgsSchema)]).optional(),
  })
  .strict();

// GEOCODE
//------------------------------------------------------

export const GeocodeSelectSchema: z.ZodType<Prisma.GeocodeSelect> = z
  .object({
    id: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional(),
    addressInput: z.boolean().optional(),
    streetNumber: z.boolean().optional(),
    route: z.boolean().optional(),
    locality: z.boolean().optional(),
    administrativeAreaLevel1: z.boolean().optional(),
    administrativeAreaLevel2: z.boolean().optional(),
    country: z.boolean().optional(),
    postalCode: z.boolean().optional(),
    formattedAddress: z.boolean().optional(),
    globalPlusCode: z.boolean().optional(),
    latitude: z.boolean().optional(),
    longitude: z.boolean().optional(),
  })
  .strict();

/////////////////////////////////////////
// INPUT TYPES
/////////////////////////////////////////

export const ReitWhereInputSchema: z.ZodType<Prisma.ReitWhereInput> = z
  .object({
    AND: z
      .union([z.lazy(() => ReitWhereInputSchema), z.lazy(() => ReitWhereInputSchema).array()])
      .optional(),
    OR: z
      .lazy(() => ReitWhereInputSchema)
      .array()
      .optional(),
    NOT: z
      .union([z.lazy(() => ReitWhereInputSchema), z.lazy(() => ReitWhereInputSchema).array()])
      .optional(),
    id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    ticker: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    properties: z.lazy(() => PropertyListRelationFilterSchema).optional(),
  })
  .strict();

export const ReitOrderByWithRelationInputSchema: z.ZodType<Prisma.ReitOrderByWithRelationInput> = z
  .object({
    id: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    updatedAt: z.lazy(() => SortOrderSchema).optional(),
    ticker: z.lazy(() => SortOrderSchema).optional(),
    properties: z.lazy(() => PropertyOrderByRelationAggregateInputSchema).optional(),
  })
  .strict();

export const ReitWhereUniqueInputSchema: z.ZodType<Prisma.ReitWhereUniqueInput> = z
  .union([
    z.object({
      id: z.string().cuid(),
      ticker: z.string(),
    }),
    z.object({
      id: z.string().cuid(),
    }),
    z.object({
      ticker: z.string(),
    }),
  ])
  .and(
    z
      .object({
        id: z.string().cuid().optional(),
        ticker: z.string().optional(),
        AND: z
          .union([z.lazy(() => ReitWhereInputSchema), z.lazy(() => ReitWhereInputSchema).array()])
          .optional(),
        OR: z
          .lazy(() => ReitWhereInputSchema)
          .array()
          .optional(),
        NOT: z
          .union([z.lazy(() => ReitWhereInputSchema), z.lazy(() => ReitWhereInputSchema).array()])
          .optional(),
        createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
        updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
        properties: z.lazy(() => PropertyListRelationFilterSchema).optional(),
      })
      .strict(),
  );

export const ReitOrderByWithAggregationInputSchema: z.ZodType<Prisma.ReitOrderByWithAggregationInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
      updatedAt: z.lazy(() => SortOrderSchema).optional(),
      ticker: z.lazy(() => SortOrderSchema).optional(),
      _count: z.lazy(() => ReitCountOrderByAggregateInputSchema).optional(),
      _max: z.lazy(() => ReitMaxOrderByAggregateInputSchema).optional(),
      _min: z.lazy(() => ReitMinOrderByAggregateInputSchema).optional(),
    })
    .strict();

export const ReitScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.ReitScalarWhereWithAggregatesInput> =
  z
    .object({
      AND: z
        .union([
          z.lazy(() => ReitScalarWhereWithAggregatesInputSchema),
          z.lazy(() => ReitScalarWhereWithAggregatesInputSchema).array(),
        ])
        .optional(),
      OR: z
        .lazy(() => ReitScalarWhereWithAggregatesInputSchema)
        .array()
        .optional(),
      NOT: z
        .union([
          z.lazy(() => ReitScalarWhereWithAggregatesInputSchema),
          z.lazy(() => ReitScalarWhereWithAggregatesInputSchema).array(),
        ])
        .optional(),
      id: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
      createdAt: z
        .union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()])
        .optional(),
      updatedAt: z
        .union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()])
        .optional(),
      ticker: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    })
    .strict();

export const PropertyWhereInputSchema: z.ZodType<Prisma.PropertyWhereInput> = z
  .object({
    AND: z
      .union([
        z.lazy(() => PropertyWhereInputSchema),
        z.lazy(() => PropertyWhereInputSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => PropertyWhereInputSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => PropertyWhereInputSchema),
        z.lazy(() => PropertyWhereInputSchema).array(),
      ])
      .optional(),
    id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    addressInput: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    name: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    address: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    address2: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    neighborhood: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    city: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    state: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    zip: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    country: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    latitude: z
      .union([z.lazy(() => FloatNullableFilterSchema), z.number()])
      .optional()
      .nullable(),
    longitude: z
      .union([z.lazy(() => FloatNullableFilterSchema), z.number()])
      .optional()
      .nullable(),
    squareFootage: z
      .union([z.lazy(() => FloatNullableFilterSchema), z.number()])
      .optional()
      .nullable(),
    reitTicker: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    reit: z
      .union([z.lazy(() => ReitRelationFilterSchema), z.lazy(() => ReitWhereInputSchema)])
      .optional(),
  })
  .strict();

export const PropertyOrderByWithRelationInputSchema: z.ZodType<Prisma.PropertyOrderByWithRelationInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
      updatedAt: z.lazy(() => SortOrderSchema).optional(),
      addressInput: z.lazy(() => SortOrderSchema).optional(),
      name: z.union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)]).optional(),
      address: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      address2: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      neighborhood: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      city: z.union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)]).optional(),
      state: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      zip: z.union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)]).optional(),
      country: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      latitude: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      longitude: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      squareFootage: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      reitTicker: z.lazy(() => SortOrderSchema).optional(),
      reit: z.lazy(() => ReitOrderByWithRelationInputSchema).optional(),
    })
    .strict();

export const PropertyWhereUniqueInputSchema: z.ZodType<Prisma.PropertyWhereUniqueInput> = z
  .union([
    z.object({
      id: z.string().cuid(),
      addressInput: z.string(),
    }),
    z.object({
      id: z.string().cuid(),
    }),
    z.object({
      addressInput: z.string(),
    }),
  ])
  .and(
    z
      .object({
        id: z.string().cuid().optional(),
        addressInput: z.string().optional(),
        AND: z
          .union([
            z.lazy(() => PropertyWhereInputSchema),
            z.lazy(() => PropertyWhereInputSchema).array(),
          ])
          .optional(),
        OR: z
          .lazy(() => PropertyWhereInputSchema)
          .array()
          .optional(),
        NOT: z
          .union([
            z.lazy(() => PropertyWhereInputSchema),
            z.lazy(() => PropertyWhereInputSchema).array(),
          ])
          .optional(),
        createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
        updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
        name: z
          .union([z.lazy(() => StringNullableFilterSchema), z.string()])
          .optional()
          .nullable(),
        address: z
          .union([z.lazy(() => StringNullableFilterSchema), z.string()])
          .optional()
          .nullable(),
        address2: z
          .union([z.lazy(() => StringNullableFilterSchema), z.string()])
          .optional()
          .nullable(),
        neighborhood: z
          .union([z.lazy(() => StringNullableFilterSchema), z.string()])
          .optional()
          .nullable(),
        city: z
          .union([z.lazy(() => StringNullableFilterSchema), z.string()])
          .optional()
          .nullable(),
        state: z
          .union([z.lazy(() => StringNullableFilterSchema), z.string()])
          .optional()
          .nullable(),
        zip: z
          .union([z.lazy(() => StringNullableFilterSchema), z.string()])
          .optional()
          .nullable(),
        country: z
          .union([z.lazy(() => StringNullableFilterSchema), z.string()])
          .optional()
          .nullable(),
        latitude: z
          .union([z.lazy(() => FloatNullableFilterSchema), z.number()])
          .optional()
          .nullable(),
        longitude: z
          .union([z.lazy(() => FloatNullableFilterSchema), z.number()])
          .optional()
          .nullable(),
        squareFootage: z
          .union([z.lazy(() => FloatNullableFilterSchema), z.number()])
          .optional()
          .nullable(),
        reitTicker: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
        reit: z
          .union([z.lazy(() => ReitRelationFilterSchema), z.lazy(() => ReitWhereInputSchema)])
          .optional(),
      })
      .strict(),
  );

export const PropertyOrderByWithAggregationInputSchema: z.ZodType<Prisma.PropertyOrderByWithAggregationInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
      updatedAt: z.lazy(() => SortOrderSchema).optional(),
      addressInput: z.lazy(() => SortOrderSchema).optional(),
      name: z.union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)]).optional(),
      address: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      address2: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      neighborhood: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      city: z.union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)]).optional(),
      state: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      zip: z.union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)]).optional(),
      country: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      latitude: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      longitude: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      squareFootage: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      reitTicker: z.lazy(() => SortOrderSchema).optional(),
      _count: z.lazy(() => PropertyCountOrderByAggregateInputSchema).optional(),
      _avg: z.lazy(() => PropertyAvgOrderByAggregateInputSchema).optional(),
      _max: z.lazy(() => PropertyMaxOrderByAggregateInputSchema).optional(),
      _min: z.lazy(() => PropertyMinOrderByAggregateInputSchema).optional(),
      _sum: z.lazy(() => PropertySumOrderByAggregateInputSchema).optional(),
    })
    .strict();

export const PropertyScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.PropertyScalarWhereWithAggregatesInput> =
  z
    .object({
      AND: z
        .union([
          z.lazy(() => PropertyScalarWhereWithAggregatesInputSchema),
          z.lazy(() => PropertyScalarWhereWithAggregatesInputSchema).array(),
        ])
        .optional(),
      OR: z
        .lazy(() => PropertyScalarWhereWithAggregatesInputSchema)
        .array()
        .optional(),
      NOT: z
        .union([
          z.lazy(() => PropertyScalarWhereWithAggregatesInputSchema),
          z.lazy(() => PropertyScalarWhereWithAggregatesInputSchema).array(),
        ])
        .optional(),
      id: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
      createdAt: z
        .union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()])
        .optional(),
      updatedAt: z
        .union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()])
        .optional(),
      addressInput: z
        .union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()])
        .optional(),
      name: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
      address: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
      address2: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
      neighborhood: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
      city: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
      state: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
      zip: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
      country: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
      latitude: z
        .union([z.lazy(() => FloatNullableWithAggregatesFilterSchema), z.number()])
        .optional()
        .nullable(),
      longitude: z
        .union([z.lazy(() => FloatNullableWithAggregatesFilterSchema), z.number()])
        .optional()
        .nullable(),
      squareFootage: z
        .union([z.lazy(() => FloatNullableWithAggregatesFilterSchema), z.number()])
        .optional()
        .nullable(),
      reitTicker: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    })
    .strict();

export const GeocodeWhereInputSchema: z.ZodType<Prisma.GeocodeWhereInput> = z
  .object({
    AND: z
      .union([z.lazy(() => GeocodeWhereInputSchema), z.lazy(() => GeocodeWhereInputSchema).array()])
      .optional(),
    OR: z
      .lazy(() => GeocodeWhereInputSchema)
      .array()
      .optional(),
    NOT: z
      .union([z.lazy(() => GeocodeWhereInputSchema), z.lazy(() => GeocodeWhereInputSchema).array()])
      .optional(),
    id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    addressInput: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    streetNumber: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    route: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    locality: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    administrativeAreaLevel1: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    administrativeAreaLevel2: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    country: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    postalCode: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    formattedAddress: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    globalPlusCode: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    latitude: z.union([z.lazy(() => FloatFilterSchema), z.number()]).optional(),
    longitude: z.union([z.lazy(() => FloatFilterSchema), z.number()]).optional(),
  })
  .strict();

export const GeocodeOrderByWithRelationInputSchema: z.ZodType<Prisma.GeocodeOrderByWithRelationInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
      updatedAt: z.lazy(() => SortOrderSchema).optional(),
      addressInput: z.lazy(() => SortOrderSchema).optional(),
      streetNumber: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      route: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      locality: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      administrativeAreaLevel1: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      administrativeAreaLevel2: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      country: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      postalCode: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      formattedAddress: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      globalPlusCode: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      latitude: z.lazy(() => SortOrderSchema).optional(),
      longitude: z.lazy(() => SortOrderSchema).optional(),
    })
    .strict();

export const GeocodeWhereUniqueInputSchema: z.ZodType<Prisma.GeocodeWhereUniqueInput> = z
  .union([
    z.object({
      id: z.string().cuid(),
      addressInput: z.string(),
    }),
    z.object({
      id: z.string().cuid(),
    }),
    z.object({
      addressInput: z.string(),
    }),
  ])
  .and(
    z
      .object({
        id: z.string().cuid().optional(),
        addressInput: z.string().optional(),
        AND: z
          .union([
            z.lazy(() => GeocodeWhereInputSchema),
            z.lazy(() => GeocodeWhereInputSchema).array(),
          ])
          .optional(),
        OR: z
          .lazy(() => GeocodeWhereInputSchema)
          .array()
          .optional(),
        NOT: z
          .union([
            z.lazy(() => GeocodeWhereInputSchema),
            z.lazy(() => GeocodeWhereInputSchema).array(),
          ])
          .optional(),
        createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
        updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
        streetNumber: z
          .union([z.lazy(() => StringNullableFilterSchema), z.string()])
          .optional()
          .nullable(),
        route: z
          .union([z.lazy(() => StringNullableFilterSchema), z.string()])
          .optional()
          .nullable(),
        locality: z
          .union([z.lazy(() => StringNullableFilterSchema), z.string()])
          .optional()
          .nullable(),
        administrativeAreaLevel1: z
          .union([z.lazy(() => StringNullableFilterSchema), z.string()])
          .optional()
          .nullable(),
        administrativeAreaLevel2: z
          .union([z.lazy(() => StringNullableFilterSchema), z.string()])
          .optional()
          .nullable(),
        country: z
          .union([z.lazy(() => StringNullableFilterSchema), z.string()])
          .optional()
          .nullable(),
        postalCode: z
          .union([z.lazy(() => StringNullableFilterSchema), z.string()])
          .optional()
          .nullable(),
        formattedAddress: z
          .union([z.lazy(() => StringNullableFilterSchema), z.string()])
          .optional()
          .nullable(),
        globalPlusCode: z
          .union([z.lazy(() => StringNullableFilterSchema), z.string()])
          .optional()
          .nullable(),
        latitude: z.union([z.lazy(() => FloatFilterSchema), z.number()]).optional(),
        longitude: z.union([z.lazy(() => FloatFilterSchema), z.number()]).optional(),
      })
      .strict(),
  );

export const GeocodeOrderByWithAggregationInputSchema: z.ZodType<Prisma.GeocodeOrderByWithAggregationInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
      updatedAt: z.lazy(() => SortOrderSchema).optional(),
      addressInput: z.lazy(() => SortOrderSchema).optional(),
      streetNumber: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      route: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      locality: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      administrativeAreaLevel1: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      administrativeAreaLevel2: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      country: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      postalCode: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      formattedAddress: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      globalPlusCode: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      latitude: z.lazy(() => SortOrderSchema).optional(),
      longitude: z.lazy(() => SortOrderSchema).optional(),
      _count: z.lazy(() => GeocodeCountOrderByAggregateInputSchema).optional(),
      _avg: z.lazy(() => GeocodeAvgOrderByAggregateInputSchema).optional(),
      _max: z.lazy(() => GeocodeMaxOrderByAggregateInputSchema).optional(),
      _min: z.lazy(() => GeocodeMinOrderByAggregateInputSchema).optional(),
      _sum: z.lazy(() => GeocodeSumOrderByAggregateInputSchema).optional(),
    })
    .strict();

export const GeocodeScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.GeocodeScalarWhereWithAggregatesInput> =
  z
    .object({
      AND: z
        .union([
          z.lazy(() => GeocodeScalarWhereWithAggregatesInputSchema),
          z.lazy(() => GeocodeScalarWhereWithAggregatesInputSchema).array(),
        ])
        .optional(),
      OR: z
        .lazy(() => GeocodeScalarWhereWithAggregatesInputSchema)
        .array()
        .optional(),
      NOT: z
        .union([
          z.lazy(() => GeocodeScalarWhereWithAggregatesInputSchema),
          z.lazy(() => GeocodeScalarWhereWithAggregatesInputSchema).array(),
        ])
        .optional(),
      id: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
      createdAt: z
        .union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()])
        .optional(),
      updatedAt: z
        .union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()])
        .optional(),
      addressInput: z
        .union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()])
        .optional(),
      streetNumber: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
      route: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
      locality: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
      administrativeAreaLevel1: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
      administrativeAreaLevel2: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
      country: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
      postalCode: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
      formattedAddress: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
      globalPlusCode: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
      latitude: z.union([z.lazy(() => FloatWithAggregatesFilterSchema), z.number()]).optional(),
      longitude: z.union([z.lazy(() => FloatWithAggregatesFilterSchema), z.number()]).optional(),
    })
    .strict();

export const ReitCreateInputSchema: z.ZodType<Prisma.ReitCreateInput> = z
  .object({
    id: z.string().cuid().optional(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    ticker: z.string(),
    properties: z.lazy(() => PropertyCreateNestedManyWithoutReitInputSchema).optional(),
  })
  .strict();

export const ReitUncheckedCreateInputSchema: z.ZodType<Prisma.ReitUncheckedCreateInput> = z
  .object({
    id: z.string().cuid().optional(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    ticker: z.string(),
    properties: z.lazy(() => PropertyUncheckedCreateNestedManyWithoutReitInputSchema).optional(),
  })
  .strict();

export const ReitUpdateInputSchema: z.ZodType<Prisma.ReitUpdateInput> = z
  .object({
    id: z
      .union([z.string().cuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    updatedAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    ticker: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    properties: z.lazy(() => PropertyUpdateManyWithoutReitNestedInputSchema).optional(),
  })
  .strict();

export const ReitUncheckedUpdateInputSchema: z.ZodType<Prisma.ReitUncheckedUpdateInput> = z
  .object({
    id: z
      .union([z.string().cuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    updatedAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    ticker: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    properties: z.lazy(() => PropertyUncheckedUpdateManyWithoutReitNestedInputSchema).optional(),
  })
  .strict();

export const ReitCreateManyInputSchema: z.ZodType<Prisma.ReitCreateManyInput> = z
  .object({
    id: z.string().cuid().optional(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    ticker: z.string(),
  })
  .strict();

export const ReitUpdateManyMutationInputSchema: z.ZodType<Prisma.ReitUpdateManyMutationInput> = z
  .object({
    id: z
      .union([z.string().cuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    updatedAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    ticker: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
  })
  .strict();

export const ReitUncheckedUpdateManyInputSchema: z.ZodType<Prisma.ReitUncheckedUpdateManyInput> = z
  .object({
    id: z
      .union([z.string().cuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    updatedAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    ticker: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
  })
  .strict();

export const PropertyCreateInputSchema: z.ZodType<Prisma.PropertyCreateInput> = z
  .object({
    id: z.string().cuid().optional(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    addressInput: z.string(),
    name: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    address2: z.string().optional().nullable(),
    neighborhood: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    zip: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    latitude: z.number().optional().nullable(),
    longitude: z.number().optional().nullable(),
    squareFootage: z.number().optional().nullable(),
    reit: z.lazy(() => ReitCreateNestedOneWithoutPropertiesInputSchema),
  })
  .strict();

export const PropertyUncheckedCreateInputSchema: z.ZodType<Prisma.PropertyUncheckedCreateInput> = z
  .object({
    id: z.string().cuid().optional(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    addressInput: z.string(),
    name: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    address2: z.string().optional().nullable(),
    neighborhood: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    zip: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    latitude: z.number().optional().nullable(),
    longitude: z.number().optional().nullable(),
    squareFootage: z.number().optional().nullable(),
    reitTicker: z.string(),
  })
  .strict();

export const PropertyUpdateInputSchema: z.ZodType<Prisma.PropertyUpdateInput> = z
  .object({
    id: z
      .union([z.string().cuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    updatedAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    addressInput: z
      .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
      .optional(),
    name: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    address: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    address2: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    neighborhood: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    city: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    state: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    zip: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    country: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    latitude: z
      .union([z.number(), z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    longitude: z
      .union([z.number(), z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    squareFootage: z
      .union([z.number(), z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    reit: z.lazy(() => ReitUpdateOneRequiredWithoutPropertiesNestedInputSchema).optional(),
  })
  .strict();

export const PropertyUncheckedUpdateInputSchema: z.ZodType<Prisma.PropertyUncheckedUpdateInput> = z
  .object({
    id: z
      .union([z.string().cuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    updatedAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    addressInput: z
      .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
      .optional(),
    name: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    address: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    address2: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    neighborhood: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    city: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    state: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    zip: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    country: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    latitude: z
      .union([z.number(), z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    longitude: z
      .union([z.number(), z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    squareFootage: z
      .union([z.number(), z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    reitTicker: z
      .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
      .optional(),
  })
  .strict();

export const PropertyCreateManyInputSchema: z.ZodType<Prisma.PropertyCreateManyInput> = z
  .object({
    id: z.string().cuid().optional(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    addressInput: z.string(),
    name: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    address2: z.string().optional().nullable(),
    neighborhood: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    zip: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    latitude: z.number().optional().nullable(),
    longitude: z.number().optional().nullable(),
    squareFootage: z.number().optional().nullable(),
    reitTicker: z.string(),
  })
  .strict();

export const PropertyUpdateManyMutationInputSchema: z.ZodType<Prisma.PropertyUpdateManyMutationInput> =
  z
    .object({
      id: z
        .union([z.string().cuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
        .optional(),
      createdAt: z
        .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
        .optional(),
      updatedAt: z
        .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
        .optional(),
      addressInput: z
        .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
        .optional(),
      name: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      address: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      address2: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      neighborhood: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      city: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      state: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      zip: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      country: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      latitude: z
        .union([z.number(), z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      longitude: z
        .union([z.number(), z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      squareFootage: z
        .union([z.number(), z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
    })
    .strict();

export const PropertyUncheckedUpdateManyInputSchema: z.ZodType<Prisma.PropertyUncheckedUpdateManyInput> =
  z
    .object({
      id: z
        .union([z.string().cuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
        .optional(),
      createdAt: z
        .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
        .optional(),
      updatedAt: z
        .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
        .optional(),
      addressInput: z
        .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
        .optional(),
      name: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      address: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      address2: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      neighborhood: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      city: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      state: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      zip: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      country: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      latitude: z
        .union([z.number(), z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      longitude: z
        .union([z.number(), z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      squareFootage: z
        .union([z.number(), z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      reitTicker: z
        .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
        .optional(),
    })
    .strict();

export const GeocodeCreateInputSchema: z.ZodType<Prisma.GeocodeCreateInput> = z
  .object({
    id: z.string().cuid().optional(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    addressInput: z.string(),
    streetNumber: z.string().optional().nullable(),
    route: z.string().optional().nullable(),
    locality: z.string().optional().nullable(),
    administrativeAreaLevel1: z.string().optional().nullable(),
    administrativeAreaLevel2: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    postalCode: z.string().optional().nullable(),
    formattedAddress: z.string().optional().nullable(),
    globalPlusCode: z.string().optional().nullable(),
    latitude: z.number(),
    longitude: z.number(),
  })
  .strict();

export const GeocodeUncheckedCreateInputSchema: z.ZodType<Prisma.GeocodeUncheckedCreateInput> = z
  .object({
    id: z.string().cuid().optional(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    addressInput: z.string(),
    streetNumber: z.string().optional().nullable(),
    route: z.string().optional().nullable(),
    locality: z.string().optional().nullable(),
    administrativeAreaLevel1: z.string().optional().nullable(),
    administrativeAreaLevel2: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    postalCode: z.string().optional().nullable(),
    formattedAddress: z.string().optional().nullable(),
    globalPlusCode: z.string().optional().nullable(),
    latitude: z.number(),
    longitude: z.number(),
  })
  .strict();

export const GeocodeUpdateInputSchema: z.ZodType<Prisma.GeocodeUpdateInput> = z
  .object({
    id: z
      .union([z.string().cuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    updatedAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    addressInput: z
      .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
      .optional(),
    streetNumber: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    route: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    locality: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    administrativeAreaLevel1: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    administrativeAreaLevel2: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    country: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    postalCode: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    formattedAddress: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    globalPlusCode: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    latitude: z.union([z.number(), z.lazy(() => FloatFieldUpdateOperationsInputSchema)]).optional(),
    longitude: z
      .union([z.number(), z.lazy(() => FloatFieldUpdateOperationsInputSchema)])
      .optional(),
  })
  .strict();

export const GeocodeUncheckedUpdateInputSchema: z.ZodType<Prisma.GeocodeUncheckedUpdateInput> = z
  .object({
    id: z
      .union([z.string().cuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    updatedAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    addressInput: z
      .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
      .optional(),
    streetNumber: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    route: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    locality: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    administrativeAreaLevel1: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    administrativeAreaLevel2: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    country: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    postalCode: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    formattedAddress: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    globalPlusCode: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    latitude: z.union([z.number(), z.lazy(() => FloatFieldUpdateOperationsInputSchema)]).optional(),
    longitude: z
      .union([z.number(), z.lazy(() => FloatFieldUpdateOperationsInputSchema)])
      .optional(),
  })
  .strict();

export const GeocodeCreateManyInputSchema: z.ZodType<Prisma.GeocodeCreateManyInput> = z
  .object({
    id: z.string().cuid().optional(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    addressInput: z.string(),
    streetNumber: z.string().optional().nullable(),
    route: z.string().optional().nullable(),
    locality: z.string().optional().nullable(),
    administrativeAreaLevel1: z.string().optional().nullable(),
    administrativeAreaLevel2: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    postalCode: z.string().optional().nullable(),
    formattedAddress: z.string().optional().nullable(),
    globalPlusCode: z.string().optional().nullable(),
    latitude: z.number(),
    longitude: z.number(),
  })
  .strict();

export const GeocodeUpdateManyMutationInputSchema: z.ZodType<Prisma.GeocodeUpdateManyMutationInput> =
  z
    .object({
      id: z
        .union([z.string().cuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
        .optional(),
      createdAt: z
        .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
        .optional(),
      updatedAt: z
        .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
        .optional(),
      addressInput: z
        .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
        .optional(),
      streetNumber: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      route: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      locality: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      administrativeAreaLevel1: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      administrativeAreaLevel2: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      country: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      postalCode: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      formattedAddress: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      globalPlusCode: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      latitude: z
        .union([z.number(), z.lazy(() => FloatFieldUpdateOperationsInputSchema)])
        .optional(),
      longitude: z
        .union([z.number(), z.lazy(() => FloatFieldUpdateOperationsInputSchema)])
        .optional(),
    })
    .strict();

export const GeocodeUncheckedUpdateManyInputSchema: z.ZodType<Prisma.GeocodeUncheckedUpdateManyInput> =
  z
    .object({
      id: z
        .union([z.string().cuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
        .optional(),
      createdAt: z
        .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
        .optional(),
      updatedAt: z
        .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
        .optional(),
      addressInput: z
        .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
        .optional(),
      streetNumber: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      route: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      locality: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      administrativeAreaLevel1: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      administrativeAreaLevel2: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      country: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      postalCode: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      formattedAddress: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      globalPlusCode: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      latitude: z
        .union([z.number(), z.lazy(() => FloatFieldUpdateOperationsInputSchema)])
        .optional(),
      longitude: z
        .union([z.number(), z.lazy(() => FloatFieldUpdateOperationsInputSchema)])
        .optional(),
    })
    .strict();

export const StringFilterSchema: z.ZodType<Prisma.StringFilter> = z
  .object({
    equals: z.string().optional(),
    in: z.string().array().optional(),
    notIn: z.string().array().optional(),
    lt: z.string().optional(),
    lte: z.string().optional(),
    gt: z.string().optional(),
    gte: z.string().optional(),
    contains: z.string().optional(),
    startsWith: z.string().optional(),
    endsWith: z.string().optional(),
    mode: z.lazy(() => QueryModeSchema).optional(),
    not: z.union([z.string(), z.lazy(() => NestedStringFilterSchema)]).optional(),
  })
  .strict();

export const DateTimeFilterSchema: z.ZodType<Prisma.DateTimeFilter> = z
  .object({
    equals: z.coerce.date().optional(),
    in: z.coerce.date().array().optional(),
    notIn: z.coerce.date().array().optional(),
    lt: z.coerce.date().optional(),
    lte: z.coerce.date().optional(),
    gt: z.coerce.date().optional(),
    gte: z.coerce.date().optional(),
    not: z.union([z.coerce.date(), z.lazy(() => NestedDateTimeFilterSchema)]).optional(),
  })
  .strict();

export const PropertyListRelationFilterSchema: z.ZodType<Prisma.PropertyListRelationFilter> = z
  .object({
    every: z.lazy(() => PropertyWhereInputSchema).optional(),
    some: z.lazy(() => PropertyWhereInputSchema).optional(),
    none: z.lazy(() => PropertyWhereInputSchema).optional(),
  })
  .strict();

export const PropertyOrderByRelationAggregateInputSchema: z.ZodType<Prisma.PropertyOrderByRelationAggregateInput> =
  z
    .object({
      _count: z.lazy(() => SortOrderSchema).optional(),
    })
    .strict();

export const ReitCountOrderByAggregateInputSchema: z.ZodType<Prisma.ReitCountOrderByAggregateInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
      updatedAt: z.lazy(() => SortOrderSchema).optional(),
      ticker: z.lazy(() => SortOrderSchema).optional(),
    })
    .strict();

export const ReitMaxOrderByAggregateInputSchema: z.ZodType<Prisma.ReitMaxOrderByAggregateInput> = z
  .object({
    id: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    updatedAt: z.lazy(() => SortOrderSchema).optional(),
    ticker: z.lazy(() => SortOrderSchema).optional(),
  })
  .strict();

export const ReitMinOrderByAggregateInputSchema: z.ZodType<Prisma.ReitMinOrderByAggregateInput> = z
  .object({
    id: z.lazy(() => SortOrderSchema).optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    updatedAt: z.lazy(() => SortOrderSchema).optional(),
    ticker: z.lazy(() => SortOrderSchema).optional(),
  })
  .strict();

export const StringWithAggregatesFilterSchema: z.ZodType<Prisma.StringWithAggregatesFilter> = z
  .object({
    equals: z.string().optional(),
    in: z.string().array().optional(),
    notIn: z.string().array().optional(),
    lt: z.string().optional(),
    lte: z.string().optional(),
    gt: z.string().optional(),
    gte: z.string().optional(),
    contains: z.string().optional(),
    startsWith: z.string().optional(),
    endsWith: z.string().optional(),
    mode: z.lazy(() => QueryModeSchema).optional(),
    not: z.union([z.string(), z.lazy(() => NestedStringWithAggregatesFilterSchema)]).optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _min: z.lazy(() => NestedStringFilterSchema).optional(),
    _max: z.lazy(() => NestedStringFilterSchema).optional(),
  })
  .strict();

export const DateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.DateTimeWithAggregatesFilter> = z
  .object({
    equals: z.coerce.date().optional(),
    in: z.coerce.date().array().optional(),
    notIn: z.coerce.date().array().optional(),
    lt: z.coerce.date().optional(),
    lte: z.coerce.date().optional(),
    gt: z.coerce.date().optional(),
    gte: z.coerce.date().optional(),
    not: z
      .union([z.coerce.date(), z.lazy(() => NestedDateTimeWithAggregatesFilterSchema)])
      .optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
    _max: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  })
  .strict();

export const StringNullableFilterSchema: z.ZodType<Prisma.StringNullableFilter> = z
  .object({
    equals: z.string().optional().nullable(),
    in: z.string().array().optional().nullable(),
    notIn: z.string().array().optional().nullable(),
    lt: z.string().optional(),
    lte: z.string().optional(),
    gt: z.string().optional(),
    gte: z.string().optional(),
    contains: z.string().optional(),
    startsWith: z.string().optional(),
    endsWith: z.string().optional(),
    mode: z.lazy(() => QueryModeSchema).optional(),
    not: z
      .union([z.string(), z.lazy(() => NestedStringNullableFilterSchema)])
      .optional()
      .nullable(),
  })
  .strict();

export const FloatNullableFilterSchema: z.ZodType<Prisma.FloatNullableFilter> = z
  .object({
    equals: z.number().optional().nullable(),
    in: z.number().array().optional().nullable(),
    notIn: z.number().array().optional().nullable(),
    lt: z.number().optional(),
    lte: z.number().optional(),
    gt: z.number().optional(),
    gte: z.number().optional(),
    not: z
      .union([z.number(), z.lazy(() => NestedFloatNullableFilterSchema)])
      .optional()
      .nullable(),
  })
  .strict();

export const ReitRelationFilterSchema: z.ZodType<Prisma.ReitRelationFilter> = z
  .object({
    is: z.lazy(() => ReitWhereInputSchema).optional(),
    isNot: z.lazy(() => ReitWhereInputSchema).optional(),
  })
  .strict();

export const SortOrderInputSchema: z.ZodType<Prisma.SortOrderInput> = z
  .object({
    sort: z.lazy(() => SortOrderSchema),
    nulls: z.lazy(() => NullsOrderSchema).optional(),
  })
  .strict();

export const PropertyCountOrderByAggregateInputSchema: z.ZodType<Prisma.PropertyCountOrderByAggregateInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
      updatedAt: z.lazy(() => SortOrderSchema).optional(),
      addressInput: z.lazy(() => SortOrderSchema).optional(),
      name: z.lazy(() => SortOrderSchema).optional(),
      address: z.lazy(() => SortOrderSchema).optional(),
      address2: z.lazy(() => SortOrderSchema).optional(),
      neighborhood: z.lazy(() => SortOrderSchema).optional(),
      city: z.lazy(() => SortOrderSchema).optional(),
      state: z.lazy(() => SortOrderSchema).optional(),
      zip: z.lazy(() => SortOrderSchema).optional(),
      country: z.lazy(() => SortOrderSchema).optional(),
      latitude: z.lazy(() => SortOrderSchema).optional(),
      longitude: z.lazy(() => SortOrderSchema).optional(),
      squareFootage: z.lazy(() => SortOrderSchema).optional(),
      reitTicker: z.lazy(() => SortOrderSchema).optional(),
    })
    .strict();

export const PropertyAvgOrderByAggregateInputSchema: z.ZodType<Prisma.PropertyAvgOrderByAggregateInput> =
  z
    .object({
      latitude: z.lazy(() => SortOrderSchema).optional(),
      longitude: z.lazy(() => SortOrderSchema).optional(),
      squareFootage: z.lazy(() => SortOrderSchema).optional(),
    })
    .strict();

export const PropertyMaxOrderByAggregateInputSchema: z.ZodType<Prisma.PropertyMaxOrderByAggregateInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
      updatedAt: z.lazy(() => SortOrderSchema).optional(),
      addressInput: z.lazy(() => SortOrderSchema).optional(),
      name: z.lazy(() => SortOrderSchema).optional(),
      address: z.lazy(() => SortOrderSchema).optional(),
      address2: z.lazy(() => SortOrderSchema).optional(),
      neighborhood: z.lazy(() => SortOrderSchema).optional(),
      city: z.lazy(() => SortOrderSchema).optional(),
      state: z.lazy(() => SortOrderSchema).optional(),
      zip: z.lazy(() => SortOrderSchema).optional(),
      country: z.lazy(() => SortOrderSchema).optional(),
      latitude: z.lazy(() => SortOrderSchema).optional(),
      longitude: z.lazy(() => SortOrderSchema).optional(),
      squareFootage: z.lazy(() => SortOrderSchema).optional(),
      reitTicker: z.lazy(() => SortOrderSchema).optional(),
    })
    .strict();

export const PropertyMinOrderByAggregateInputSchema: z.ZodType<Prisma.PropertyMinOrderByAggregateInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
      updatedAt: z.lazy(() => SortOrderSchema).optional(),
      addressInput: z.lazy(() => SortOrderSchema).optional(),
      name: z.lazy(() => SortOrderSchema).optional(),
      address: z.lazy(() => SortOrderSchema).optional(),
      address2: z.lazy(() => SortOrderSchema).optional(),
      neighborhood: z.lazy(() => SortOrderSchema).optional(),
      city: z.lazy(() => SortOrderSchema).optional(),
      state: z.lazy(() => SortOrderSchema).optional(),
      zip: z.lazy(() => SortOrderSchema).optional(),
      country: z.lazy(() => SortOrderSchema).optional(),
      latitude: z.lazy(() => SortOrderSchema).optional(),
      longitude: z.lazy(() => SortOrderSchema).optional(),
      squareFootage: z.lazy(() => SortOrderSchema).optional(),
      reitTicker: z.lazy(() => SortOrderSchema).optional(),
    })
    .strict();

export const PropertySumOrderByAggregateInputSchema: z.ZodType<Prisma.PropertySumOrderByAggregateInput> =
  z
    .object({
      latitude: z.lazy(() => SortOrderSchema).optional(),
      longitude: z.lazy(() => SortOrderSchema).optional(),
      squareFootage: z.lazy(() => SortOrderSchema).optional(),
    })
    .strict();

export const StringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.StringNullableWithAggregatesFilter> =
  z
    .object({
      equals: z.string().optional().nullable(),
      in: z.string().array().optional().nullable(),
      notIn: z.string().array().optional().nullable(),
      lt: z.string().optional(),
      lte: z.string().optional(),
      gt: z.string().optional(),
      gte: z.string().optional(),
      contains: z.string().optional(),
      startsWith: z.string().optional(),
      endsWith: z.string().optional(),
      mode: z.lazy(() => QueryModeSchema).optional(),
      not: z
        .union([z.string(), z.lazy(() => NestedStringNullableWithAggregatesFilterSchema)])
        .optional()
        .nullable(),
      _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
      _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
      _max: z.lazy(() => NestedStringNullableFilterSchema).optional(),
    })
    .strict();

export const FloatNullableWithAggregatesFilterSchema: z.ZodType<Prisma.FloatNullableWithAggregatesFilter> =
  z
    .object({
      equals: z.number().optional().nullable(),
      in: z.number().array().optional().nullable(),
      notIn: z.number().array().optional().nullable(),
      lt: z.number().optional(),
      lte: z.number().optional(),
      gt: z.number().optional(),
      gte: z.number().optional(),
      not: z
        .union([z.number(), z.lazy(() => NestedFloatNullableWithAggregatesFilterSchema)])
        .optional()
        .nullable(),
      _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
      _avg: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
      _sum: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
      _min: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
      _max: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
    })
    .strict();

export const FloatFilterSchema: z.ZodType<Prisma.FloatFilter> = z
  .object({
    equals: z.number().optional(),
    in: z.number().array().optional(),
    notIn: z.number().array().optional(),
    lt: z.number().optional(),
    lte: z.number().optional(),
    gt: z.number().optional(),
    gte: z.number().optional(),
    not: z.union([z.number(), z.lazy(() => NestedFloatFilterSchema)]).optional(),
  })
  .strict();

export const GeocodeCountOrderByAggregateInputSchema: z.ZodType<Prisma.GeocodeCountOrderByAggregateInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
      updatedAt: z.lazy(() => SortOrderSchema).optional(),
      addressInput: z.lazy(() => SortOrderSchema).optional(),
      streetNumber: z.lazy(() => SortOrderSchema).optional(),
      route: z.lazy(() => SortOrderSchema).optional(),
      locality: z.lazy(() => SortOrderSchema).optional(),
      administrativeAreaLevel1: z.lazy(() => SortOrderSchema).optional(),
      administrativeAreaLevel2: z.lazy(() => SortOrderSchema).optional(),
      country: z.lazy(() => SortOrderSchema).optional(),
      postalCode: z.lazy(() => SortOrderSchema).optional(),
      formattedAddress: z.lazy(() => SortOrderSchema).optional(),
      globalPlusCode: z.lazy(() => SortOrderSchema).optional(),
      latitude: z.lazy(() => SortOrderSchema).optional(),
      longitude: z.lazy(() => SortOrderSchema).optional(),
    })
    .strict();

export const GeocodeAvgOrderByAggregateInputSchema: z.ZodType<Prisma.GeocodeAvgOrderByAggregateInput> =
  z
    .object({
      latitude: z.lazy(() => SortOrderSchema).optional(),
      longitude: z.lazy(() => SortOrderSchema).optional(),
    })
    .strict();

export const GeocodeMaxOrderByAggregateInputSchema: z.ZodType<Prisma.GeocodeMaxOrderByAggregateInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
      updatedAt: z.lazy(() => SortOrderSchema).optional(),
      addressInput: z.lazy(() => SortOrderSchema).optional(),
      streetNumber: z.lazy(() => SortOrderSchema).optional(),
      route: z.lazy(() => SortOrderSchema).optional(),
      locality: z.lazy(() => SortOrderSchema).optional(),
      administrativeAreaLevel1: z.lazy(() => SortOrderSchema).optional(),
      administrativeAreaLevel2: z.lazy(() => SortOrderSchema).optional(),
      country: z.lazy(() => SortOrderSchema).optional(),
      postalCode: z.lazy(() => SortOrderSchema).optional(),
      formattedAddress: z.lazy(() => SortOrderSchema).optional(),
      globalPlusCode: z.lazy(() => SortOrderSchema).optional(),
      latitude: z.lazy(() => SortOrderSchema).optional(),
      longitude: z.lazy(() => SortOrderSchema).optional(),
    })
    .strict();

export const GeocodeMinOrderByAggregateInputSchema: z.ZodType<Prisma.GeocodeMinOrderByAggregateInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
      updatedAt: z.lazy(() => SortOrderSchema).optional(),
      addressInput: z.lazy(() => SortOrderSchema).optional(),
      streetNumber: z.lazy(() => SortOrderSchema).optional(),
      route: z.lazy(() => SortOrderSchema).optional(),
      locality: z.lazy(() => SortOrderSchema).optional(),
      administrativeAreaLevel1: z.lazy(() => SortOrderSchema).optional(),
      administrativeAreaLevel2: z.lazy(() => SortOrderSchema).optional(),
      country: z.lazy(() => SortOrderSchema).optional(),
      postalCode: z.lazy(() => SortOrderSchema).optional(),
      formattedAddress: z.lazy(() => SortOrderSchema).optional(),
      globalPlusCode: z.lazy(() => SortOrderSchema).optional(),
      latitude: z.lazy(() => SortOrderSchema).optional(),
      longitude: z.lazy(() => SortOrderSchema).optional(),
    })
    .strict();

export const GeocodeSumOrderByAggregateInputSchema: z.ZodType<Prisma.GeocodeSumOrderByAggregateInput> =
  z
    .object({
      latitude: z.lazy(() => SortOrderSchema).optional(),
      longitude: z.lazy(() => SortOrderSchema).optional(),
    })
    .strict();

export const FloatWithAggregatesFilterSchema: z.ZodType<Prisma.FloatWithAggregatesFilter> = z
  .object({
    equals: z.number().optional(),
    in: z.number().array().optional(),
    notIn: z.number().array().optional(),
    lt: z.number().optional(),
    lte: z.number().optional(),
    gt: z.number().optional(),
    gte: z.number().optional(),
    not: z.union([z.number(), z.lazy(() => NestedFloatWithAggregatesFilterSchema)]).optional(),
    _count: z.lazy(() => NestedIntFilterSchema).optional(),
    _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
    _sum: z.lazy(() => NestedFloatFilterSchema).optional(),
    _min: z.lazy(() => NestedFloatFilterSchema).optional(),
    _max: z.lazy(() => NestedFloatFilterSchema).optional(),
  })
  .strict();

export const PropertyCreateNestedManyWithoutReitInputSchema: z.ZodType<Prisma.PropertyCreateNestedManyWithoutReitInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => PropertyCreateWithoutReitInputSchema),
          z.lazy(() => PropertyCreateWithoutReitInputSchema).array(),
          z.lazy(() => PropertyUncheckedCreateWithoutReitInputSchema),
          z.lazy(() => PropertyUncheckedCreateWithoutReitInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => PropertyCreateOrConnectWithoutReitInputSchema),
          z.lazy(() => PropertyCreateOrConnectWithoutReitInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => PropertyCreateManyReitInputEnvelopeSchema).optional(),
      connect: z
        .union([
          z.lazy(() => PropertyWhereUniqueInputSchema),
          z.lazy(() => PropertyWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export const PropertyUncheckedCreateNestedManyWithoutReitInputSchema: z.ZodType<Prisma.PropertyUncheckedCreateNestedManyWithoutReitInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => PropertyCreateWithoutReitInputSchema),
          z.lazy(() => PropertyCreateWithoutReitInputSchema).array(),
          z.lazy(() => PropertyUncheckedCreateWithoutReitInputSchema),
          z.lazy(() => PropertyUncheckedCreateWithoutReitInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => PropertyCreateOrConnectWithoutReitInputSchema),
          z.lazy(() => PropertyCreateOrConnectWithoutReitInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => PropertyCreateManyReitInputEnvelopeSchema).optional(),
      connect: z
        .union([
          z.lazy(() => PropertyWhereUniqueInputSchema),
          z.lazy(() => PropertyWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export const StringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.StringFieldUpdateOperationsInput> =
  z
    .object({
      set: z.string().optional(),
    })
    .strict();

export const DateTimeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.DateTimeFieldUpdateOperationsInput> =
  z
    .object({
      set: z.coerce.date().optional(),
    })
    .strict();

export const PropertyUpdateManyWithoutReitNestedInputSchema: z.ZodType<Prisma.PropertyUpdateManyWithoutReitNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => PropertyCreateWithoutReitInputSchema),
          z.lazy(() => PropertyCreateWithoutReitInputSchema).array(),
          z.lazy(() => PropertyUncheckedCreateWithoutReitInputSchema),
          z.lazy(() => PropertyUncheckedCreateWithoutReitInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => PropertyCreateOrConnectWithoutReitInputSchema),
          z.lazy(() => PropertyCreateOrConnectWithoutReitInputSchema).array(),
        ])
        .optional(),
      upsert: z
        .union([
          z.lazy(() => PropertyUpsertWithWhereUniqueWithoutReitInputSchema),
          z.lazy(() => PropertyUpsertWithWhereUniqueWithoutReitInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => PropertyCreateManyReitInputEnvelopeSchema).optional(),
      set: z
        .union([
          z.lazy(() => PropertyWhereUniqueInputSchema),
          z.lazy(() => PropertyWhereUniqueInputSchema).array(),
        ])
        .optional(),
      disconnect: z
        .union([
          z.lazy(() => PropertyWhereUniqueInputSchema),
          z.lazy(() => PropertyWhereUniqueInputSchema).array(),
        ])
        .optional(),
      delete: z
        .union([
          z.lazy(() => PropertyWhereUniqueInputSchema),
          z.lazy(() => PropertyWhereUniqueInputSchema).array(),
        ])
        .optional(),
      connect: z
        .union([
          z.lazy(() => PropertyWhereUniqueInputSchema),
          z.lazy(() => PropertyWhereUniqueInputSchema).array(),
        ])
        .optional(),
      update: z
        .union([
          z.lazy(() => PropertyUpdateWithWhereUniqueWithoutReitInputSchema),
          z.lazy(() => PropertyUpdateWithWhereUniqueWithoutReitInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => PropertyUpdateManyWithWhereWithoutReitInputSchema),
          z.lazy(() => PropertyUpdateManyWithWhereWithoutReitInputSchema).array(),
        ])
        .optional(),
      deleteMany: z
        .union([
          z.lazy(() => PropertyScalarWhereInputSchema),
          z.lazy(() => PropertyScalarWhereInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export const PropertyUncheckedUpdateManyWithoutReitNestedInputSchema: z.ZodType<Prisma.PropertyUncheckedUpdateManyWithoutReitNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => PropertyCreateWithoutReitInputSchema),
          z.lazy(() => PropertyCreateWithoutReitInputSchema).array(),
          z.lazy(() => PropertyUncheckedCreateWithoutReitInputSchema),
          z.lazy(() => PropertyUncheckedCreateWithoutReitInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => PropertyCreateOrConnectWithoutReitInputSchema),
          z.lazy(() => PropertyCreateOrConnectWithoutReitInputSchema).array(),
        ])
        .optional(),
      upsert: z
        .union([
          z.lazy(() => PropertyUpsertWithWhereUniqueWithoutReitInputSchema),
          z.lazy(() => PropertyUpsertWithWhereUniqueWithoutReitInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => PropertyCreateManyReitInputEnvelopeSchema).optional(),
      set: z
        .union([
          z.lazy(() => PropertyWhereUniqueInputSchema),
          z.lazy(() => PropertyWhereUniqueInputSchema).array(),
        ])
        .optional(),
      disconnect: z
        .union([
          z.lazy(() => PropertyWhereUniqueInputSchema),
          z.lazy(() => PropertyWhereUniqueInputSchema).array(),
        ])
        .optional(),
      delete: z
        .union([
          z.lazy(() => PropertyWhereUniqueInputSchema),
          z.lazy(() => PropertyWhereUniqueInputSchema).array(),
        ])
        .optional(),
      connect: z
        .union([
          z.lazy(() => PropertyWhereUniqueInputSchema),
          z.lazy(() => PropertyWhereUniqueInputSchema).array(),
        ])
        .optional(),
      update: z
        .union([
          z.lazy(() => PropertyUpdateWithWhereUniqueWithoutReitInputSchema),
          z.lazy(() => PropertyUpdateWithWhereUniqueWithoutReitInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => PropertyUpdateManyWithWhereWithoutReitInputSchema),
          z.lazy(() => PropertyUpdateManyWithWhereWithoutReitInputSchema).array(),
        ])
        .optional(),
      deleteMany: z
        .union([
          z.lazy(() => PropertyScalarWhereInputSchema),
          z.lazy(() => PropertyScalarWhereInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export const ReitCreateNestedOneWithoutPropertiesInputSchema: z.ZodType<Prisma.ReitCreateNestedOneWithoutPropertiesInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => ReitCreateWithoutPropertiesInputSchema),
          z.lazy(() => ReitUncheckedCreateWithoutPropertiesInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => ReitCreateOrConnectWithoutPropertiesInputSchema).optional(),
      connect: z.lazy(() => ReitWhereUniqueInputSchema).optional(),
    })
    .strict();

export const NullableStringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableStringFieldUpdateOperationsInput> =
  z
    .object({
      set: z.string().optional().nullable(),
    })
    .strict();

export const NullableFloatFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableFloatFieldUpdateOperationsInput> =
  z
    .object({
      set: z.number().optional().nullable(),
      increment: z.number().optional(),
      decrement: z.number().optional(),
      multiply: z.number().optional(),
      divide: z.number().optional(),
    })
    .strict();

export const ReitUpdateOneRequiredWithoutPropertiesNestedInputSchema: z.ZodType<Prisma.ReitUpdateOneRequiredWithoutPropertiesNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => ReitCreateWithoutPropertiesInputSchema),
          z.lazy(() => ReitUncheckedCreateWithoutPropertiesInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => ReitCreateOrConnectWithoutPropertiesInputSchema).optional(),
      upsert: z.lazy(() => ReitUpsertWithoutPropertiesInputSchema).optional(),
      connect: z.lazy(() => ReitWhereUniqueInputSchema).optional(),
      update: z
        .union([
          z.lazy(() => ReitUpdateToOneWithWhereWithoutPropertiesInputSchema),
          z.lazy(() => ReitUpdateWithoutPropertiesInputSchema),
          z.lazy(() => ReitUncheckedUpdateWithoutPropertiesInputSchema),
        ])
        .optional(),
    })
    .strict();

export const FloatFieldUpdateOperationsInputSchema: z.ZodType<Prisma.FloatFieldUpdateOperationsInput> =
  z
    .object({
      set: z.number().optional(),
      increment: z.number().optional(),
      decrement: z.number().optional(),
      multiply: z.number().optional(),
      divide: z.number().optional(),
    })
    .strict();

export const NestedStringFilterSchema: z.ZodType<Prisma.NestedStringFilter> = z
  .object({
    equals: z.string().optional(),
    in: z.string().array().optional(),
    notIn: z.string().array().optional(),
    lt: z.string().optional(),
    lte: z.string().optional(),
    gt: z.string().optional(),
    gte: z.string().optional(),
    contains: z.string().optional(),
    startsWith: z.string().optional(),
    endsWith: z.string().optional(),
    not: z.union([z.string(), z.lazy(() => NestedStringFilterSchema)]).optional(),
  })
  .strict();

export const NestedDateTimeFilterSchema: z.ZodType<Prisma.NestedDateTimeFilter> = z
  .object({
    equals: z.coerce.date().optional(),
    in: z.coerce.date().array().optional(),
    notIn: z.coerce.date().array().optional(),
    lt: z.coerce.date().optional(),
    lte: z.coerce.date().optional(),
    gt: z.coerce.date().optional(),
    gte: z.coerce.date().optional(),
    not: z.union([z.coerce.date(), z.lazy(() => NestedDateTimeFilterSchema)]).optional(),
  })
  .strict();

export const NestedStringWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringWithAggregatesFilter> =
  z
    .object({
      equals: z.string().optional(),
      in: z.string().array().optional(),
      notIn: z.string().array().optional(),
      lt: z.string().optional(),
      lte: z.string().optional(),
      gt: z.string().optional(),
      gte: z.string().optional(),
      contains: z.string().optional(),
      startsWith: z.string().optional(),
      endsWith: z.string().optional(),
      not: z.union([z.string(), z.lazy(() => NestedStringWithAggregatesFilterSchema)]).optional(),
      _count: z.lazy(() => NestedIntFilterSchema).optional(),
      _min: z.lazy(() => NestedStringFilterSchema).optional(),
      _max: z.lazy(() => NestedStringFilterSchema).optional(),
    })
    .strict();

export const NestedIntFilterSchema: z.ZodType<Prisma.NestedIntFilter> = z
  .object({
    equals: z.number().optional(),
    in: z.number().array().optional(),
    notIn: z.number().array().optional(),
    lt: z.number().optional(),
    lte: z.number().optional(),
    gt: z.number().optional(),
    gte: z.number().optional(),
    not: z.union([z.number(), z.lazy(() => NestedIntFilterSchema)]).optional(),
  })
  .strict();

export const NestedDateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDateTimeWithAggregatesFilter> =
  z
    .object({
      equals: z.coerce.date().optional(),
      in: z.coerce.date().array().optional(),
      notIn: z.coerce.date().array().optional(),
      lt: z.coerce.date().optional(),
      lte: z.coerce.date().optional(),
      gt: z.coerce.date().optional(),
      gte: z.coerce.date().optional(),
      not: z
        .union([z.coerce.date(), z.lazy(() => NestedDateTimeWithAggregatesFilterSchema)])
        .optional(),
      _count: z.lazy(() => NestedIntFilterSchema).optional(),
      _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
      _max: z.lazy(() => NestedDateTimeFilterSchema).optional(),
    })
    .strict();

export const NestedStringNullableFilterSchema: z.ZodType<Prisma.NestedStringNullableFilter> = z
  .object({
    equals: z.string().optional().nullable(),
    in: z.string().array().optional().nullable(),
    notIn: z.string().array().optional().nullable(),
    lt: z.string().optional(),
    lte: z.string().optional(),
    gt: z.string().optional(),
    gte: z.string().optional(),
    contains: z.string().optional(),
    startsWith: z.string().optional(),
    endsWith: z.string().optional(),
    not: z
      .union([z.string(), z.lazy(() => NestedStringNullableFilterSchema)])
      .optional()
      .nullable(),
  })
  .strict();

export const NestedFloatNullableFilterSchema: z.ZodType<Prisma.NestedFloatNullableFilter> = z
  .object({
    equals: z.number().optional().nullable(),
    in: z.number().array().optional().nullable(),
    notIn: z.number().array().optional().nullable(),
    lt: z.number().optional(),
    lte: z.number().optional(),
    gt: z.number().optional(),
    gte: z.number().optional(),
    not: z
      .union([z.number(), z.lazy(() => NestedFloatNullableFilterSchema)])
      .optional()
      .nullable(),
  })
  .strict();

export const NestedStringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringNullableWithAggregatesFilter> =
  z
    .object({
      equals: z.string().optional().nullable(),
      in: z.string().array().optional().nullable(),
      notIn: z.string().array().optional().nullable(),
      lt: z.string().optional(),
      lte: z.string().optional(),
      gt: z.string().optional(),
      gte: z.string().optional(),
      contains: z.string().optional(),
      startsWith: z.string().optional(),
      endsWith: z.string().optional(),
      not: z
        .union([z.string(), z.lazy(() => NestedStringNullableWithAggregatesFilterSchema)])
        .optional()
        .nullable(),
      _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
      _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
      _max: z.lazy(() => NestedStringNullableFilterSchema).optional(),
    })
    .strict();

export const NestedIntNullableFilterSchema: z.ZodType<Prisma.NestedIntNullableFilter> = z
  .object({
    equals: z.number().optional().nullable(),
    in: z.number().array().optional().nullable(),
    notIn: z.number().array().optional().nullable(),
    lt: z.number().optional(),
    lte: z.number().optional(),
    gt: z.number().optional(),
    gte: z.number().optional(),
    not: z
      .union([z.number(), z.lazy(() => NestedIntNullableFilterSchema)])
      .optional()
      .nullable(),
  })
  .strict();

export const NestedFloatNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedFloatNullableWithAggregatesFilter> =
  z
    .object({
      equals: z.number().optional().nullable(),
      in: z.number().array().optional().nullable(),
      notIn: z.number().array().optional().nullable(),
      lt: z.number().optional(),
      lte: z.number().optional(),
      gt: z.number().optional(),
      gte: z.number().optional(),
      not: z
        .union([z.number(), z.lazy(() => NestedFloatNullableWithAggregatesFilterSchema)])
        .optional()
        .nullable(),
      _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
      _avg: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
      _sum: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
      _min: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
      _max: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
    })
    .strict();

export const NestedFloatFilterSchema: z.ZodType<Prisma.NestedFloatFilter> = z
  .object({
    equals: z.number().optional(),
    in: z.number().array().optional(),
    notIn: z.number().array().optional(),
    lt: z.number().optional(),
    lte: z.number().optional(),
    gt: z.number().optional(),
    gte: z.number().optional(),
    not: z.union([z.number(), z.lazy(() => NestedFloatFilterSchema)]).optional(),
  })
  .strict();

export const NestedFloatWithAggregatesFilterSchema: z.ZodType<Prisma.NestedFloatWithAggregatesFilter> =
  z
    .object({
      equals: z.number().optional(),
      in: z.number().array().optional(),
      notIn: z.number().array().optional(),
      lt: z.number().optional(),
      lte: z.number().optional(),
      gt: z.number().optional(),
      gte: z.number().optional(),
      not: z.union([z.number(), z.lazy(() => NestedFloatWithAggregatesFilterSchema)]).optional(),
      _count: z.lazy(() => NestedIntFilterSchema).optional(),
      _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
      _sum: z.lazy(() => NestedFloatFilterSchema).optional(),
      _min: z.lazy(() => NestedFloatFilterSchema).optional(),
      _max: z.lazy(() => NestedFloatFilterSchema).optional(),
    })
    .strict();

export const PropertyCreateWithoutReitInputSchema: z.ZodType<Prisma.PropertyCreateWithoutReitInput> =
  z
    .object({
      id: z.string().cuid().optional(),
      createdAt: z.coerce.date().optional(),
      updatedAt: z.coerce.date().optional(),
      addressInput: z.string(),
      name: z.string().optional().nullable(),
      address: z.string().optional().nullable(),
      address2: z.string().optional().nullable(),
      neighborhood: z.string().optional().nullable(),
      city: z.string().optional().nullable(),
      state: z.string().optional().nullable(),
      zip: z.string().optional().nullable(),
      country: z.string().optional().nullable(),
      latitude: z.number().optional().nullable(),
      longitude: z.number().optional().nullable(),
      squareFootage: z.number().optional().nullable(),
    })
    .strict();

export const PropertyUncheckedCreateWithoutReitInputSchema: z.ZodType<Prisma.PropertyUncheckedCreateWithoutReitInput> =
  z
    .object({
      id: z.string().cuid().optional(),
      createdAt: z.coerce.date().optional(),
      updatedAt: z.coerce.date().optional(),
      addressInput: z.string(),
      name: z.string().optional().nullable(),
      address: z.string().optional().nullable(),
      address2: z.string().optional().nullable(),
      neighborhood: z.string().optional().nullable(),
      city: z.string().optional().nullable(),
      state: z.string().optional().nullable(),
      zip: z.string().optional().nullable(),
      country: z.string().optional().nullable(),
      latitude: z.number().optional().nullable(),
      longitude: z.number().optional().nullable(),
      squareFootage: z.number().optional().nullable(),
    })
    .strict();

export const PropertyCreateOrConnectWithoutReitInputSchema: z.ZodType<Prisma.PropertyCreateOrConnectWithoutReitInput> =
  z
    .object({
      where: z.lazy(() => PropertyWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => PropertyCreateWithoutReitInputSchema),
        z.lazy(() => PropertyUncheckedCreateWithoutReitInputSchema),
      ]),
    })
    .strict();

export const PropertyCreateManyReitInputEnvelopeSchema: z.ZodType<Prisma.PropertyCreateManyReitInputEnvelope> =
  z
    .object({
      data: z.union([
        z.lazy(() => PropertyCreateManyReitInputSchema),
        z.lazy(() => PropertyCreateManyReitInputSchema).array(),
      ]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export const PropertyUpsertWithWhereUniqueWithoutReitInputSchema: z.ZodType<Prisma.PropertyUpsertWithWhereUniqueWithoutReitInput> =
  z
    .object({
      where: z.lazy(() => PropertyWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => PropertyUpdateWithoutReitInputSchema),
        z.lazy(() => PropertyUncheckedUpdateWithoutReitInputSchema),
      ]),
      create: z.union([
        z.lazy(() => PropertyCreateWithoutReitInputSchema),
        z.lazy(() => PropertyUncheckedCreateWithoutReitInputSchema),
      ]),
    })
    .strict();

export const PropertyUpdateWithWhereUniqueWithoutReitInputSchema: z.ZodType<Prisma.PropertyUpdateWithWhereUniqueWithoutReitInput> =
  z
    .object({
      where: z.lazy(() => PropertyWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => PropertyUpdateWithoutReitInputSchema),
        z.lazy(() => PropertyUncheckedUpdateWithoutReitInputSchema),
      ]),
    })
    .strict();

export const PropertyUpdateManyWithWhereWithoutReitInputSchema: z.ZodType<Prisma.PropertyUpdateManyWithWhereWithoutReitInput> =
  z
    .object({
      where: z.lazy(() => PropertyScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => PropertyUpdateManyMutationInputSchema),
        z.lazy(() => PropertyUncheckedUpdateManyWithoutReitInputSchema),
      ]),
    })
    .strict();

export const PropertyScalarWhereInputSchema: z.ZodType<Prisma.PropertyScalarWhereInput> = z
  .object({
    AND: z
      .union([
        z.lazy(() => PropertyScalarWhereInputSchema),
        z.lazy(() => PropertyScalarWhereInputSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => PropertyScalarWhereInputSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => PropertyScalarWhereInputSchema),
        z.lazy(() => PropertyScalarWhereInputSchema).array(),
      ])
      .optional(),
    id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    addressInput: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    name: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    address: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    address2: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    neighborhood: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    city: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    state: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    zip: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    country: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    latitude: z
      .union([z.lazy(() => FloatNullableFilterSchema), z.number()])
      .optional()
      .nullable(),
    longitude: z
      .union([z.lazy(() => FloatNullableFilterSchema), z.number()])
      .optional()
      .nullable(),
    squareFootage: z
      .union([z.lazy(() => FloatNullableFilterSchema), z.number()])
      .optional()
      .nullable(),
    reitTicker: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
  })
  .strict();

export const ReitCreateWithoutPropertiesInputSchema: z.ZodType<Prisma.ReitCreateWithoutPropertiesInput> =
  z
    .object({
      id: z.string().cuid().optional(),
      createdAt: z.coerce.date().optional(),
      updatedAt: z.coerce.date().optional(),
      ticker: z.string(),
    })
    .strict();

export const ReitUncheckedCreateWithoutPropertiesInputSchema: z.ZodType<Prisma.ReitUncheckedCreateWithoutPropertiesInput> =
  z
    .object({
      id: z.string().cuid().optional(),
      createdAt: z.coerce.date().optional(),
      updatedAt: z.coerce.date().optional(),
      ticker: z.string(),
    })
    .strict();

export const ReitCreateOrConnectWithoutPropertiesInputSchema: z.ZodType<Prisma.ReitCreateOrConnectWithoutPropertiesInput> =
  z
    .object({
      where: z.lazy(() => ReitWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => ReitCreateWithoutPropertiesInputSchema),
        z.lazy(() => ReitUncheckedCreateWithoutPropertiesInputSchema),
      ]),
    })
    .strict();

export const ReitUpsertWithoutPropertiesInputSchema: z.ZodType<Prisma.ReitUpsertWithoutPropertiesInput> =
  z
    .object({
      update: z.union([
        z.lazy(() => ReitUpdateWithoutPropertiesInputSchema),
        z.lazy(() => ReitUncheckedUpdateWithoutPropertiesInputSchema),
      ]),
      create: z.union([
        z.lazy(() => ReitCreateWithoutPropertiesInputSchema),
        z.lazy(() => ReitUncheckedCreateWithoutPropertiesInputSchema),
      ]),
      where: z.lazy(() => ReitWhereInputSchema).optional(),
    })
    .strict();

export const ReitUpdateToOneWithWhereWithoutPropertiesInputSchema: z.ZodType<Prisma.ReitUpdateToOneWithWhereWithoutPropertiesInput> =
  z
    .object({
      where: z.lazy(() => ReitWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => ReitUpdateWithoutPropertiesInputSchema),
        z.lazy(() => ReitUncheckedUpdateWithoutPropertiesInputSchema),
      ]),
    })
    .strict();

export const ReitUpdateWithoutPropertiesInputSchema: z.ZodType<Prisma.ReitUpdateWithoutPropertiesInput> =
  z
    .object({
      id: z
        .union([z.string().cuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
        .optional(),
      createdAt: z
        .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
        .optional(),
      updatedAt: z
        .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
        .optional(),
      ticker: z
        .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
        .optional(),
    })
    .strict();

export const ReitUncheckedUpdateWithoutPropertiesInputSchema: z.ZodType<Prisma.ReitUncheckedUpdateWithoutPropertiesInput> =
  z
    .object({
      id: z
        .union([z.string().cuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
        .optional(),
      createdAt: z
        .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
        .optional(),
      updatedAt: z
        .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
        .optional(),
      ticker: z
        .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
        .optional(),
    })
    .strict();

export const PropertyCreateManyReitInputSchema: z.ZodType<Prisma.PropertyCreateManyReitInput> = z
  .object({
    id: z.string().cuid().optional(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    addressInput: z.string(),
    name: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    address2: z.string().optional().nullable(),
    neighborhood: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    zip: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    latitude: z.number().optional().nullable(),
    longitude: z.number().optional().nullable(),
    squareFootage: z.number().optional().nullable(),
  })
  .strict();

export const PropertyUpdateWithoutReitInputSchema: z.ZodType<Prisma.PropertyUpdateWithoutReitInput> =
  z
    .object({
      id: z
        .union([z.string().cuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
        .optional(),
      createdAt: z
        .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
        .optional(),
      updatedAt: z
        .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
        .optional(),
      addressInput: z
        .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
        .optional(),
      name: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      address: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      address2: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      neighborhood: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      city: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      state: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      zip: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      country: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      latitude: z
        .union([z.number(), z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      longitude: z
        .union([z.number(), z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      squareFootage: z
        .union([z.number(), z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
    })
    .strict();

export const PropertyUncheckedUpdateWithoutReitInputSchema: z.ZodType<Prisma.PropertyUncheckedUpdateWithoutReitInput> =
  z
    .object({
      id: z
        .union([z.string().cuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
        .optional(),
      createdAt: z
        .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
        .optional(),
      updatedAt: z
        .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
        .optional(),
      addressInput: z
        .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
        .optional(),
      name: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      address: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      address2: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      neighborhood: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      city: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      state: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      zip: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      country: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      latitude: z
        .union([z.number(), z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      longitude: z
        .union([z.number(), z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      squareFootage: z
        .union([z.number(), z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
    })
    .strict();

export const PropertyUncheckedUpdateManyWithoutReitInputSchema: z.ZodType<Prisma.PropertyUncheckedUpdateManyWithoutReitInput> =
  z
    .object({
      id: z
        .union([z.string().cuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
        .optional(),
      createdAt: z
        .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
        .optional(),
      updatedAt: z
        .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
        .optional(),
      addressInput: z
        .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
        .optional(),
      name: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      address: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      address2: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      neighborhood: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      city: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      state: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      zip: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      country: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      latitude: z
        .union([z.number(), z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      longitude: z
        .union([z.number(), z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      squareFootage: z
        .union([z.number(), z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
    })
    .strict();

/////////////////////////////////////////
// ARGS
/////////////////////////////////////////

export const ReitFindFirstArgsSchema: z.ZodType<Prisma.ReitFindFirstArgs> = z
  .object({
    select: ReitSelectSchema.optional(),
    include: ReitIncludeSchema.optional(),
    where: ReitWhereInputSchema.optional(),
    orderBy: z
      .union([ReitOrderByWithRelationInputSchema.array(), ReitOrderByWithRelationInputSchema])
      .optional(),
    cursor: ReitWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z.union([ReitScalarFieldEnumSchema, ReitScalarFieldEnumSchema.array()]).optional(),
  })
  .strict();

export const ReitFindFirstOrThrowArgsSchema: z.ZodType<Prisma.ReitFindFirstOrThrowArgs> = z
  .object({
    select: ReitSelectSchema.optional(),
    include: ReitIncludeSchema.optional(),
    where: ReitWhereInputSchema.optional(),
    orderBy: z
      .union([ReitOrderByWithRelationInputSchema.array(), ReitOrderByWithRelationInputSchema])
      .optional(),
    cursor: ReitWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z.union([ReitScalarFieldEnumSchema, ReitScalarFieldEnumSchema.array()]).optional(),
  })
  .strict();

export const ReitFindManyArgsSchema: z.ZodType<Prisma.ReitFindManyArgs> = z
  .object({
    select: ReitSelectSchema.optional(),
    include: ReitIncludeSchema.optional(),
    where: ReitWhereInputSchema.optional(),
    orderBy: z
      .union([ReitOrderByWithRelationInputSchema.array(), ReitOrderByWithRelationInputSchema])
      .optional(),
    cursor: ReitWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z.union([ReitScalarFieldEnumSchema, ReitScalarFieldEnumSchema.array()]).optional(),
  })
  .strict();

export const ReitAggregateArgsSchema: z.ZodType<Prisma.ReitAggregateArgs> = z
  .object({
    where: ReitWhereInputSchema.optional(),
    orderBy: z
      .union([ReitOrderByWithRelationInputSchema.array(), ReitOrderByWithRelationInputSchema])
      .optional(),
    cursor: ReitWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export const ReitGroupByArgsSchema: z.ZodType<Prisma.ReitGroupByArgs> = z
  .object({
    where: ReitWhereInputSchema.optional(),
    orderBy: z
      .union([ReitOrderByWithAggregationInputSchema.array(), ReitOrderByWithAggregationInputSchema])
      .optional(),
    by: ReitScalarFieldEnumSchema.array(),
    having: ReitScalarWhereWithAggregatesInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export const ReitFindUniqueArgsSchema: z.ZodType<Prisma.ReitFindUniqueArgs> = z
  .object({
    select: ReitSelectSchema.optional(),
    include: ReitIncludeSchema.optional(),
    where: ReitWhereUniqueInputSchema,
  })
  .strict();

export const ReitFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.ReitFindUniqueOrThrowArgs> = z
  .object({
    select: ReitSelectSchema.optional(),
    include: ReitIncludeSchema.optional(),
    where: ReitWhereUniqueInputSchema,
  })
  .strict();

export const PropertyFindFirstArgsSchema: z.ZodType<Prisma.PropertyFindFirstArgs> = z
  .object({
    select: PropertySelectSchema.optional(),
    include: PropertyIncludeSchema.optional(),
    where: PropertyWhereInputSchema.optional(),
    orderBy: z
      .union([
        PropertyOrderByWithRelationInputSchema.array(),
        PropertyOrderByWithRelationInputSchema,
      ])
      .optional(),
    cursor: PropertyWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z
      .union([PropertyScalarFieldEnumSchema, PropertyScalarFieldEnumSchema.array()])
      .optional(),
  })
  .strict();

export const PropertyFindFirstOrThrowArgsSchema: z.ZodType<Prisma.PropertyFindFirstOrThrowArgs> = z
  .object({
    select: PropertySelectSchema.optional(),
    include: PropertyIncludeSchema.optional(),
    where: PropertyWhereInputSchema.optional(),
    orderBy: z
      .union([
        PropertyOrderByWithRelationInputSchema.array(),
        PropertyOrderByWithRelationInputSchema,
      ])
      .optional(),
    cursor: PropertyWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z
      .union([PropertyScalarFieldEnumSchema, PropertyScalarFieldEnumSchema.array()])
      .optional(),
  })
  .strict();

export const PropertyFindManyArgsSchema: z.ZodType<Prisma.PropertyFindManyArgs> = z
  .object({
    select: PropertySelectSchema.optional(),
    include: PropertyIncludeSchema.optional(),
    where: PropertyWhereInputSchema.optional(),
    orderBy: z
      .union([
        PropertyOrderByWithRelationInputSchema.array(),
        PropertyOrderByWithRelationInputSchema,
      ])
      .optional(),
    cursor: PropertyWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z
      .union([PropertyScalarFieldEnumSchema, PropertyScalarFieldEnumSchema.array()])
      .optional(),
  })
  .strict();

export const PropertyAggregateArgsSchema: z.ZodType<Prisma.PropertyAggregateArgs> = z
  .object({
    where: PropertyWhereInputSchema.optional(),
    orderBy: z
      .union([
        PropertyOrderByWithRelationInputSchema.array(),
        PropertyOrderByWithRelationInputSchema,
      ])
      .optional(),
    cursor: PropertyWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export const PropertyGroupByArgsSchema: z.ZodType<Prisma.PropertyGroupByArgs> = z
  .object({
    where: PropertyWhereInputSchema.optional(),
    orderBy: z
      .union([
        PropertyOrderByWithAggregationInputSchema.array(),
        PropertyOrderByWithAggregationInputSchema,
      ])
      .optional(),
    by: PropertyScalarFieldEnumSchema.array(),
    having: PropertyScalarWhereWithAggregatesInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export const PropertyFindUniqueArgsSchema: z.ZodType<Prisma.PropertyFindUniqueArgs> = z
  .object({
    select: PropertySelectSchema.optional(),
    include: PropertyIncludeSchema.optional(),
    where: PropertyWhereUniqueInputSchema,
  })
  .strict();

export const PropertyFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.PropertyFindUniqueOrThrowArgs> =
  z
    .object({
      select: PropertySelectSchema.optional(),
      include: PropertyIncludeSchema.optional(),
      where: PropertyWhereUniqueInputSchema,
    })
    .strict();

export const GeocodeFindFirstArgsSchema: z.ZodType<Prisma.GeocodeFindFirstArgs> = z
  .object({
    select: GeocodeSelectSchema.optional(),
    where: GeocodeWhereInputSchema.optional(),
    orderBy: z
      .union([GeocodeOrderByWithRelationInputSchema.array(), GeocodeOrderByWithRelationInputSchema])
      .optional(),
    cursor: GeocodeWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z
      .union([GeocodeScalarFieldEnumSchema, GeocodeScalarFieldEnumSchema.array()])
      .optional(),
  })
  .strict();

export const GeocodeFindFirstOrThrowArgsSchema: z.ZodType<Prisma.GeocodeFindFirstOrThrowArgs> = z
  .object({
    select: GeocodeSelectSchema.optional(),
    where: GeocodeWhereInputSchema.optional(),
    orderBy: z
      .union([GeocodeOrderByWithRelationInputSchema.array(), GeocodeOrderByWithRelationInputSchema])
      .optional(),
    cursor: GeocodeWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z
      .union([GeocodeScalarFieldEnumSchema, GeocodeScalarFieldEnumSchema.array()])
      .optional(),
  })
  .strict();

export const GeocodeFindManyArgsSchema: z.ZodType<Prisma.GeocodeFindManyArgs> = z
  .object({
    select: GeocodeSelectSchema.optional(),
    where: GeocodeWhereInputSchema.optional(),
    orderBy: z
      .union([GeocodeOrderByWithRelationInputSchema.array(), GeocodeOrderByWithRelationInputSchema])
      .optional(),
    cursor: GeocodeWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z
      .union([GeocodeScalarFieldEnumSchema, GeocodeScalarFieldEnumSchema.array()])
      .optional(),
  })
  .strict();

export const GeocodeAggregateArgsSchema: z.ZodType<Prisma.GeocodeAggregateArgs> = z
  .object({
    where: GeocodeWhereInputSchema.optional(),
    orderBy: z
      .union([GeocodeOrderByWithRelationInputSchema.array(), GeocodeOrderByWithRelationInputSchema])
      .optional(),
    cursor: GeocodeWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export const GeocodeGroupByArgsSchema: z.ZodType<Prisma.GeocodeGroupByArgs> = z
  .object({
    where: GeocodeWhereInputSchema.optional(),
    orderBy: z
      .union([
        GeocodeOrderByWithAggregationInputSchema.array(),
        GeocodeOrderByWithAggregationInputSchema,
      ])
      .optional(),
    by: GeocodeScalarFieldEnumSchema.array(),
    having: GeocodeScalarWhereWithAggregatesInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export const GeocodeFindUniqueArgsSchema: z.ZodType<Prisma.GeocodeFindUniqueArgs> = z
  .object({
    select: GeocodeSelectSchema.optional(),
    where: GeocodeWhereUniqueInputSchema,
  })
  .strict();

export const GeocodeFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.GeocodeFindUniqueOrThrowArgs> = z
  .object({
    select: GeocodeSelectSchema.optional(),
    where: GeocodeWhereUniqueInputSchema,
  })
  .strict();

export const ReitCreateArgsSchema: z.ZodType<Prisma.ReitCreateArgs> = z
  .object({
    select: ReitSelectSchema.optional(),
    include: ReitIncludeSchema.optional(),
    data: z.union([ReitCreateInputSchema, ReitUncheckedCreateInputSchema]),
  })
  .strict();

export const ReitUpsertArgsSchema: z.ZodType<Prisma.ReitUpsertArgs> = z
  .object({
    select: ReitSelectSchema.optional(),
    include: ReitIncludeSchema.optional(),
    where: ReitWhereUniqueInputSchema,
    create: z.union([ReitCreateInputSchema, ReitUncheckedCreateInputSchema]),
    update: z.union([ReitUpdateInputSchema, ReitUncheckedUpdateInputSchema]),
  })
  .strict();

export const ReitCreateManyArgsSchema: z.ZodType<Prisma.ReitCreateManyArgs> = z
  .object({
    data: z.union([ReitCreateManyInputSchema, ReitCreateManyInputSchema.array()]),
    skipDuplicates: z.boolean().optional(),
  })
  .strict();

export const ReitCreateManyAndReturnArgsSchema: z.ZodType<Prisma.ReitCreateManyAndReturnArgs> = z
  .object({
    data: z.union([ReitCreateManyInputSchema, ReitCreateManyInputSchema.array()]),
    skipDuplicates: z.boolean().optional(),
  })
  .strict();

export const ReitDeleteArgsSchema: z.ZodType<Prisma.ReitDeleteArgs> = z
  .object({
    select: ReitSelectSchema.optional(),
    include: ReitIncludeSchema.optional(),
    where: ReitWhereUniqueInputSchema,
  })
  .strict();

export const ReitUpdateArgsSchema: z.ZodType<Prisma.ReitUpdateArgs> = z
  .object({
    select: ReitSelectSchema.optional(),
    include: ReitIncludeSchema.optional(),
    data: z.union([ReitUpdateInputSchema, ReitUncheckedUpdateInputSchema]),
    where: ReitWhereUniqueInputSchema,
  })
  .strict();

export const ReitUpdateManyArgsSchema: z.ZodType<Prisma.ReitUpdateManyArgs> = z
  .object({
    data: z.union([ReitUpdateManyMutationInputSchema, ReitUncheckedUpdateManyInputSchema]),
    where: ReitWhereInputSchema.optional(),
  })
  .strict();

export const ReitDeleteManyArgsSchema: z.ZodType<Prisma.ReitDeleteManyArgs> = z
  .object({
    where: ReitWhereInputSchema.optional(),
  })
  .strict();

export const PropertyCreateArgsSchema: z.ZodType<Prisma.PropertyCreateArgs> = z
  .object({
    select: PropertySelectSchema.optional(),
    include: PropertyIncludeSchema.optional(),
    data: z.union([PropertyCreateInputSchema, PropertyUncheckedCreateInputSchema]),
  })
  .strict();

export const PropertyUpsertArgsSchema: z.ZodType<Prisma.PropertyUpsertArgs> = z
  .object({
    select: PropertySelectSchema.optional(),
    include: PropertyIncludeSchema.optional(),
    where: PropertyWhereUniqueInputSchema,
    create: z.union([PropertyCreateInputSchema, PropertyUncheckedCreateInputSchema]),
    update: z.union([PropertyUpdateInputSchema, PropertyUncheckedUpdateInputSchema]),
  })
  .strict();

export const PropertyCreateManyArgsSchema: z.ZodType<Prisma.PropertyCreateManyArgs> = z
  .object({
    data: z.union([PropertyCreateManyInputSchema, PropertyCreateManyInputSchema.array()]),
    skipDuplicates: z.boolean().optional(),
  })
  .strict();

export const PropertyCreateManyAndReturnArgsSchema: z.ZodType<Prisma.PropertyCreateManyAndReturnArgs> =
  z
    .object({
      data: z.union([PropertyCreateManyInputSchema, PropertyCreateManyInputSchema.array()]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export const PropertyDeleteArgsSchema: z.ZodType<Prisma.PropertyDeleteArgs> = z
  .object({
    select: PropertySelectSchema.optional(),
    include: PropertyIncludeSchema.optional(),
    where: PropertyWhereUniqueInputSchema,
  })
  .strict();

export const PropertyUpdateArgsSchema: z.ZodType<Prisma.PropertyUpdateArgs> = z
  .object({
    select: PropertySelectSchema.optional(),
    include: PropertyIncludeSchema.optional(),
    data: z.union([PropertyUpdateInputSchema, PropertyUncheckedUpdateInputSchema]),
    where: PropertyWhereUniqueInputSchema,
  })
  .strict();

export const PropertyUpdateManyArgsSchema: z.ZodType<Prisma.PropertyUpdateManyArgs> = z
  .object({
    data: z.union([PropertyUpdateManyMutationInputSchema, PropertyUncheckedUpdateManyInputSchema]),
    where: PropertyWhereInputSchema.optional(),
  })
  .strict();

export const PropertyDeleteManyArgsSchema: z.ZodType<Prisma.PropertyDeleteManyArgs> = z
  .object({
    where: PropertyWhereInputSchema.optional(),
  })
  .strict();

export const GeocodeCreateArgsSchema: z.ZodType<Prisma.GeocodeCreateArgs> = z
  .object({
    select: GeocodeSelectSchema.optional(),
    data: z.union([GeocodeCreateInputSchema, GeocodeUncheckedCreateInputSchema]),
  })
  .strict();

export const GeocodeUpsertArgsSchema: z.ZodType<Prisma.GeocodeUpsertArgs> = z
  .object({
    select: GeocodeSelectSchema.optional(),
    where: GeocodeWhereUniqueInputSchema,
    create: z.union([GeocodeCreateInputSchema, GeocodeUncheckedCreateInputSchema]),
    update: z.union([GeocodeUpdateInputSchema, GeocodeUncheckedUpdateInputSchema]),
  })
  .strict();

export const GeocodeCreateManyArgsSchema: z.ZodType<Prisma.GeocodeCreateManyArgs> = z
  .object({
    data: z.union([GeocodeCreateManyInputSchema, GeocodeCreateManyInputSchema.array()]),
    skipDuplicates: z.boolean().optional(),
  })
  .strict();

export const GeocodeCreateManyAndReturnArgsSchema: z.ZodType<Prisma.GeocodeCreateManyAndReturnArgs> =
  z
    .object({
      data: z.union([GeocodeCreateManyInputSchema, GeocodeCreateManyInputSchema.array()]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export const GeocodeDeleteArgsSchema: z.ZodType<Prisma.GeocodeDeleteArgs> = z
  .object({
    select: GeocodeSelectSchema.optional(),
    where: GeocodeWhereUniqueInputSchema,
  })
  .strict();

export const GeocodeUpdateArgsSchema: z.ZodType<Prisma.GeocodeUpdateArgs> = z
  .object({
    select: GeocodeSelectSchema.optional(),
    data: z.union([GeocodeUpdateInputSchema, GeocodeUncheckedUpdateInputSchema]),
    where: GeocodeWhereUniqueInputSchema,
  })
  .strict();

export const GeocodeUpdateManyArgsSchema: z.ZodType<Prisma.GeocodeUpdateManyArgs> = z
  .object({
    data: z.union([GeocodeUpdateManyMutationInputSchema, GeocodeUncheckedUpdateManyInputSchema]),
    where: GeocodeWhereInputSchema.optional(),
  })
  .strict();

export const GeocodeDeleteManyArgsSchema: z.ZodType<Prisma.GeocodeDeleteManyArgs> = z
  .object({
    where: GeocodeWhereInputSchema.optional(),
  })
  .strict();
