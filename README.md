# System Service

Service responsible for packages, plans, subscriptions and microfrontends. Exposes a bootstrap endpoint used by the frontend after login to fetch user entitlements and microfrontend metadata.

Endpoints (initial):
- GET /bootstrap        -> returns plans, packages and microfrontends available to the authenticated user
- GET /packages         -> catalog of packages
- GET /plans            -> catalog of plans
- POST /subscriptions   -> create subscription / purchase

Run locally:

cd apps/system-service
npm install
npm run dev

Docker: see /docker-compose.yml for integration with the monorepo.
