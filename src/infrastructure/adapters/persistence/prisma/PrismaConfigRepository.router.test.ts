import router from '../../adapters/http/SystemController';

describe('SystemController routes', () => {
  test('exposes admin endpoints', () => {
    // Express Router stores routes in .stack with layers that have a .route
    const stack = (router as any).stack || [];
    const paths = stack.filter((l: any) => l.route).map((l: any) => l.route.path);
    expect(paths).toEqual(expect.arrayContaining(['/admin/plans', '/admin/packages', '/admin/microfrontends']));
  });
});
