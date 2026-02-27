-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('FREE', 'STARTER', 'GROWTH', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'OPERATOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "OptimizationStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "CompatibilityRule" AS ENUM ('INCOMPATIBLE', 'MUST_SHIP_TOGETHER');

-- CreateEnum
CREATE TYPE "PackagingCategory" AS ENUM ('BOX', 'POLY_MAILER', 'PADDED_ENVELOPE', 'TUBE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "Carrier" AS ENUM ('FEDEX', 'UPS', 'USPS');

-- CreateEnum
CREATE TYPE "UsageType" AS ENUM ('OPTIMIZATION_RUN', 'API_CALL');

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "plan" "Plan" NOT NULL DEFAULT 'FREE',
    "settings" JSONB NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "stripeCustomerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'OPERATOR',
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "width" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "depth" DOUBLE PRECISION NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "isFragile" BOOLEAN NOT NULL DEFAULT false,
    "canRotate" BOOLEAN NOT NULL DEFAULT true,
    "maxStackWeight" DOUBLE PRECISION,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoxType" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "innerWidth" DOUBLE PRECISION NOT NULL,
    "innerHeight" DOUBLE PRECISION NOT NULL,
    "innerDepth" DOUBLE PRECISION NOT NULL,
    "outerWidth" DOUBLE PRECISION NOT NULL,
    "outerHeight" DOUBLE PRECISION NOT NULL,
    "outerDepth" DOUBLE PRECISION NOT NULL,
    "wallThickness" DOUBLE PRECISION NOT NULL,
    "boxWeight" DOUBLE PRECISION NOT NULL,
    "maxWeight" DOUBLE PRECISION NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BoxType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackagingType" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "PackagingCategory" NOT NULL,
    "maxWidth" DOUBLE PRECISION,
    "maxHeight" DOUBLE PRECISION,
    "maxDepth" DOUBLE PRECISION,
    "maxWeight" DOUBLE PRECISION,
    "cost" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackagingType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemCompatibility" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "itemIdA" TEXT NOT NULL,
    "itemIdB" TEXT NOT NULL,
    "rule" "CompatibilityRule" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ItemCompatibility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsertMaterial" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "width" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "depth" DOUBLE PRECISION NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "alwaysInclude" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InsertMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OptimizationRun" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT,
    "status" "OptimizationStatus" NOT NULL DEFAULT 'PENDING',
    "algorithm" TEXT NOT NULL DEFAULT 'EB-AFIT',
    "parameters" JSONB NOT NULL DEFAULT '{}',
    "duration" INTEGER,
    "errorMsg" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OptimizationRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OptimizationResult" (
    "id" TEXT NOT NULL,
    "optimizationRunId" TEXT NOT NULL,
    "boxTypeId" TEXT,
    "boxIndex" INTEGER NOT NULL,
    "utilization" DOUBLE PRECISION NOT NULL,
    "placements" JSONB NOT NULL,
    "voidFillVolume" DOUBLE PRECISION,
    "totalWeight" DOUBLE PRECISION,
    "dimWeight" DOUBLE PRECISION,
    "billableWeight" DOUBLE PRECISION,
    "surcharges" JSONB NOT NULL DEFAULT '[]',
    "packInstructions" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OptimizationResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "permissions" TEXT[] DEFAULT ARRAY['optimize', 'items:read', 'boxes:read']::TEXT[],
    "expiresAt" TIMESTAMP(3),
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsageRecord" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" "UsageType" NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "billingPeriod" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsageRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavingsLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "optimizationRunId" TEXT NOT NULL,
    "naiveBoxCost" DOUBLE PRECISION NOT NULL,
    "optimizedCost" DOUBLE PRECISION NOT NULL,
    "savingsAmount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavingsLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarrierConstraint" (
    "id" TEXT NOT NULL,
    "carrier" "Carrier" NOT NULL,
    "maxLengthInches" DOUBLE PRECISION NOT NULL,
    "maxGirthInches" DOUBLE PRECISION NOT NULL,
    "maxWeightLbs" DOUBLE PRECISION NOT NULL,
    "dimDivisor" INTEGER NOT NULL,
    "ahsCubicThreshold" DOUBLE PRECISION,
    "oversizeCubicThreshold" DOUBLE PRECISION,
    "ahsLengthThreshold" DOUBLE PRECISION,
    "ahsWidthThreshold" DOUBLE PRECISION,
    "ahsMinBillableWeight" DOUBLE PRECISION,
    "surchargeRates" JSONB NOT NULL DEFAULT '{}',
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarrierConstraint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_stripeCustomerId_key" ON "Tenant"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "User_tenantId_idx" ON "User"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "User_tenantId_email_key" ON "User"("tenantId", "email");

-- CreateIndex
CREATE INDEX "Item_tenantId_idx" ON "Item"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Item_tenantId_sku_key" ON "Item"("tenantId", "sku");

-- CreateIndex
CREATE INDEX "BoxType_tenantId_idx" ON "BoxType"("tenantId");

-- CreateIndex
CREATE INDEX "PackagingType_tenantId_idx" ON "PackagingType"("tenantId");

-- CreateIndex
CREATE INDEX "ItemCompatibility_tenantId_idx" ON "ItemCompatibility"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "ItemCompatibility_tenantId_itemIdA_itemIdB_key" ON "ItemCompatibility"("tenantId", "itemIdA", "itemIdB");

-- CreateIndex
CREATE INDEX "InsertMaterial_tenantId_idx" ON "InsertMaterial"("tenantId");

-- CreateIndex
CREATE INDEX "OptimizationRun_tenantId_idx" ON "OptimizationRun"("tenantId");

-- CreateIndex
CREATE INDEX "OptimizationRun_tenantId_status_idx" ON "OptimizationRun"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_keyHash_key" ON "ApiKey"("keyHash");

-- CreateIndex
CREATE INDEX "ApiKey_tenantId_idx" ON "ApiKey"("tenantId");

-- CreateIndex
CREATE INDEX "ApiKey_keyHash_idx" ON "ApiKey"("keyHash");

-- CreateIndex
CREATE INDEX "UsageRecord_tenantId_billingPeriod_idx" ON "UsageRecord"("tenantId", "billingPeriod");

-- CreateIndex
CREATE UNIQUE INDEX "SavingsLog_optimizationRunId_key" ON "SavingsLog"("optimizationRunId");

-- CreateIndex
CREATE INDEX "SavingsLog_tenantId_idx" ON "SavingsLog"("tenantId");

-- CreateIndex
CREATE INDEX "CarrierConstraint_carrier_idx" ON "CarrierConstraint"("carrier");

-- CreateIndex
CREATE UNIQUE INDEX "CarrierConstraint_carrier_effectiveDate_key" ON "CarrierConstraint"("carrier", "effectiveDate");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoxType" ADD CONSTRAINT "BoxType_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackagingType" ADD CONSTRAINT "PackagingType_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemCompatibility" ADD CONSTRAINT "ItemCompatibility_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsertMaterial" ADD CONSTRAINT "InsertMaterial_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OptimizationRun" ADD CONSTRAINT "OptimizationRun_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OptimizationRun" ADD CONSTRAINT "OptimizationRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OptimizationResult" ADD CONSTRAINT "OptimizationResult_optimizationRunId_fkey" FOREIGN KEY ("optimizationRunId") REFERENCES "OptimizationRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OptimizationResult" ADD CONSTRAINT "OptimizationResult_boxTypeId_fkey" FOREIGN KEY ("boxTypeId") REFERENCES "BoxType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageRecord" ADD CONSTRAINT "UsageRecord_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavingsLog" ADD CONSTRAINT "SavingsLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavingsLog" ADD CONSTRAINT "SavingsLog_optimizationRunId_fkey" FOREIGN KEY ("optimizationRunId") REFERENCES "OptimizationRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
