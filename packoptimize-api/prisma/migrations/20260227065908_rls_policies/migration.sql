-- Create a function to get current tenant ID from session variable
CREATE OR REPLACE FUNCTION current_tenant_id() RETURNS TEXT AS $$
  SELECT current_setting('app.tenant_id', true);
$$ LANGUAGE sql STABLE;

-- Apply RLS policies to all tenant-scoped tables
-- Pattern: USING (tenant_id = current_tenant_id()) WITH CHECK (tenant_id = current_tenant_id())

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_user ON "User" USING ("tenantId" = current_tenant_id()) WITH CHECK ("tenantId" = current_tenant_id());

ALTER TABLE "Item" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_item ON "Item" USING ("tenantId" = current_tenant_id()) WITH CHECK ("tenantId" = current_tenant_id());

ALTER TABLE "BoxType" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_boxtype ON "BoxType" USING ("tenantId" = current_tenant_id()) WITH CHECK ("tenantId" = current_tenant_id());

ALTER TABLE "PackagingType" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_packagingtype ON "PackagingType" USING ("tenantId" = current_tenant_id()) WITH CHECK ("tenantId" = current_tenant_id());

ALTER TABLE "ItemCompatibility" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_itemcompat ON "ItemCompatibility" USING ("tenantId" = current_tenant_id()) WITH CHECK ("tenantId" = current_tenant_id());

ALTER TABLE "InsertMaterial" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_insertmaterial ON "InsertMaterial" USING ("tenantId" = current_tenant_id()) WITH CHECK ("tenantId" = current_tenant_id());

ALTER TABLE "OptimizationRun" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_optrun ON "OptimizationRun" USING ("tenantId" = current_tenant_id()) WITH CHECK ("tenantId" = current_tenant_id());

ALTER TABLE "ApiKey" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_apikey ON "ApiKey" USING ("tenantId" = current_tenant_id()) WITH CHECK ("tenantId" = current_tenant_id());

ALTER TABLE "UsageRecord" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_usage ON "UsageRecord" USING ("tenantId" = current_tenant_id()) WITH CHECK ("tenantId" = current_tenant_id());

ALTER TABLE "SavingsLog" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_savings ON "SavingsLog" USING ("tenantId" = current_tenant_id()) WITH CHECK ("tenantId" = current_tenant_id());

-- IMPORTANT: Create a non-superuser role for the application
-- Superusers bypass RLS, so the app must connect as a regular user
-- This is handled at the connection level via DATABASE_URL credentials
