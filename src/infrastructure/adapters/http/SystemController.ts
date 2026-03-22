import { Request, Response, Router } from 'express';
import { Container } from '../../di/container';

const router = Router();
const container = Container.getInstance();

// Bootstrap: returns plans/packages/microfrontends available to the authenticated user
router.get('/bootstrap', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const result = await container.getUserConfigUseCase.execute(userId);
    if (result?.isFailure) return res.status(404).json({ success: false, error: result.error });

    return res.json({ success: true, config: result.getValue ? result.getValue() : result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Catalog endpoints (minimal)
router.get('/packages', async (_req: Request, res: Response) => {
  res.json({ success: true, packages: [] });
});

// Backwards-compatible plans endpoint: plans are now packages with type = 'PLAN'
router.get('/plans', async (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Plans migrated: use /packages?type=PLAN to list available plans (they are packages with type=PLAN)', plans: [] });
});

// Purchase / subscribe
router.post('/subscriptions', async (req: Request, res: Response) => {
  // { userId, type: 'package'|'plan', targetId, cycle }
  res.json({ success: true });
});

// Admin endpoints: create/update plans, packages and microfrontends
router.post('/admin/plans', async (req: Request, res: Response) => {
  try {
    const { id, name, tier, maxPackages, description } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'name is required' });
    const pkg = await container.configRepository.savePlan({ id, name, tier, maxPackages, description });
    return res.json({ success: true, plan: pkg });
  } catch (err: any) {
    console.error('admin/plans failed', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/admin/packages', async (req: Request, res: Response) => {
  try {
    const { id, name, description, priceCents, currency, isFree, isActive, planId } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'name is required' });
    const pkg = await container.configRepository.savePackage({ id, name, description, priceCents, currency, isFree, isActive, planId });
    return res.json({ success: true, package: pkg });
  } catch (err: any) {
    console.error('admin/packages failed', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/admin/packages', async (req: Request, res: Response) => {
  try {
    const type = (req.query.type as string)?.toUpperCase();
    const pkgs = await container.configRepository.listPackages(type === 'PLAN' ? 'PLAN' : type === 'PACKAGE' ? 'PACKAGE' : undefined);
    return res.json({ success: true, packages: pkgs });
  } catch (err: any) {
    console.error('admin/packages list failed', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/admin/microfrontends', async (req: Request, res: Response) => {
  try {
    const { id, name, remoteUrl, imageUrl, version, isActive } = req.body;
    if (!name || !remoteUrl) return res.status(400).json({ success: false, error: 'name and remoteUrl are required' });
    const mfe = await container.configRepository.saveMicrofrontend({ id, name, remoteUrl, imageUrl, version, isActive });
    return res.json({ success: true, microfrontend: mfe });
  } catch (err: any) {
    console.error('admin/microfrontends failed', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
