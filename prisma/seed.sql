-- Seed default plan, package and microfrontend for development
-- Adjust IDs if you have UUID generation or use defaults

BEGIN;

-- Microfrontend
INSERT INTO microfrontend (id, name, remoteUrl, imageUrl, version, "order", "isActive", "createdAt")
VALUES ('mfe-default-1', 'Default MFE', 'https://mfe.example.com', NULL, '1.0.0', 1, true, now())
ON CONFLICT (id) DO NOTHING;

-- Plan (stored as package with type = 'PLAN')
INSERT INTO "package" (id, name, description, "priceCents", currency, "isFree", "isActive", type, "createdAt")
VALUES ('plan-dev-free', 'Free Plan', 'Default free plan for development', 0, 'USD', true, true, 'PLAN', now())
ON CONFLICT (id) DO NOTHING;

-- Package belonging to plan
INSERT INTO "package" (id, name, description, "priceCents", currency, "isFree", "isActive", type, "planId", "createdAt")
VALUES ('pkg-dev-basic', 'Basic Package', 'Basic package included in Free Plan', 0, 'USD', true, true, 'PACKAGE', 'plan-dev-free', now())
ON CONFLICT (id) DO NOTHING;

-- Map microfrontend access to package
INSERT INTO microfrontend_access (id, "packageId", "mfeId", "createdAt")
VALUES ('mfa-1', 'pkg-dev-basic', 'mfe-default-1', now())
ON CONFLICT (id) DO NOTHING;

COMMIT;
