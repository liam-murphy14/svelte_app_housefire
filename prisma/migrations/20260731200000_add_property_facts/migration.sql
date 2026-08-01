-- Add the facts field introduced in prisma/schema.prisma.
ALTER TABLE "Property"
ADD COLUMN "facts" JSONB NOT NULL DEFAULT '[]'::jsonb;
