-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Reit" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ticker" TEXT NOT NULL,

    CONSTRAINT "Reit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "addressInput" TEXT NOT NULL,
    "name" TEXT,
    "address" TEXT,
    "address2" TEXT,
    "neighborhood" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "country" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "squareFootage" DOUBLE PRECISION,
    "reitTicker" TEXT NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Geocode" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "addressInput" TEXT NOT NULL,
    "streetNumber" TEXT,
    "route" TEXT,
    "locality" TEXT,
    "administrativeAreaLevel1" TEXT,
    "administrativeAreaLevel2" TEXT,
    "country" TEXT,
    "postalCode" TEXT,
    "formattedAddress" TEXT,
    "globalPlusCode" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Geocode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Reit_ticker_key" ON "Reit"("ticker");

-- CreateIndex
CREATE UNIQUE INDEX "Property_addressInput_key" ON "Property"("addressInput");

-- CreateIndex
CREATE INDEX "Property_reitTicker_idx" ON "Property"("reitTicker");

-- CreateIndex
CREATE UNIQUE INDEX "Geocode_addressInput_key" ON "Geocode"("addressInput");

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_reitTicker_fkey" FOREIGN KEY ("reitTicker") REFERENCES "Reit"("ticker") ON DELETE RESTRICT ON UPDATE CASCADE;

