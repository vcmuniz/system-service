-- Migration: migrate Plan rows into Package (type=PLAN) and adapt related tables
-- Run this on your Postgres database connected to the service. Review and run in a maintenance window.

BEGIN;

-- 1) Copy each plan into packages (preserve same id to keep references stable)
INSERT INTO packages (id, name, description, type, tier, "maxPackages", features, "isActive", "createdAt", "updatedAt", metadata, "priceCents", currency, "isFree", "microfrontendId")
SELECT id, name, description, 'PLAN'::text, tier, "maxPackages", features, "isActive", "createdAt", "updatedAt", '{}'::json, 0, 'USD', false, NULL
FROM plans
ON CONFLICT (id) DO NOTHING;

-- 2) Move mfe_access.planId -> mfe_access.packageId (keep same values)
ALTER TABLE IF EXISTS mfe_access ADD COLUMN IF NOT EXISTS "packageId" uuid;
UPDATE mfe_access SET "packageId" = "planId" WHERE "planId" IS NOT NULL;
-- drop old planId column (if desired)
ALTER TABLE IF EXISTS mfe_access DROP COLUMN IF EXISTS "planId";
-- add foreign key to packages
ALTER TABLE IF EXISTS mfe_access
  ADD CONSTRAINT IF NOT EXISTS mfe_access_packageId_fkey FOREIGN KEY ("packageId") REFERENCES packages(id) ON DELETE CASCADE;

-- 3) Move user_plans.planId -> user_plans.packageId
ALTER TABLE IF EXISTS user_plans ADD COLUMN IF NOT EXISTS "packageId" uuid;
UPDATE user_plans SET "packageId" = "planId" WHERE "planId" IS NOT NULL;
ALTER TABLE IF EXISTS user_plans DROP COLUMN IF EXISTS "planId";
ALTER TABLE IF EXISTS user_plans
  ADD CONSTRAINT IF NOT EXISTS user_plans_packageId_fkey FOREIGN KEY ("packageId") REFERENCES packages(id) ON DELETE CASCADE;

-- 4) Normalize subscriptions: convert any subscription.type='plan' to 'package' (targetId continues to point to package id)
UPDATE subscriptions SET type = 'package' WHERE type = 'plan';

-- Optional: drop plans table after verification
-- DROP TABLE IF EXISTS plans;

COMMIT;

-- NOTE: Constraint names may differ across databases. Review FK constraints and indexes after running this script.
