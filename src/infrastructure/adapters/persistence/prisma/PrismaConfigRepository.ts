import { PrismaClient } from '@prisma/client';
import { Package as PackageDomain } from '../../../../domain/entities/Package.entity';
import { Plan as PlanDomain } from '../../../../domain/entities/Plan.entity';

export class PrismaConfigRepository {
  constructor(private prisma: PrismaClient) {}

  private mapPrismaPackageToDomain(p: any): PackageDomain {
    const mfe = p.mfe ? { name: p.mfe.name, remoteUrl: p.mfe.remoteUrl, imageUrl: p.mfe.imageUrl ?? undefined, route: p.mfe.remoteUrl } : null;

    return PackageDomain.create({
      id: p.id,
      name: p.name,
      description: p.description ?? undefined,
      priceCents: p.priceCents ?? 0,
      currency: p.currency ?? 'USD',
      isFree: p.isFree ?? false,
      isActive: p.isActive ?? true,
      microfrontend: mfe
    } as any);
  }

  async getPlansByUserId(userId: string): Promise<PackageDomain[]> {
    // packages that the user explicitly has (user_packages) or has via subscriptions
    const userPackages = await this.prisma.userPackage.findMany({ where: { userId, isActive: true } });
    const subscriptions = await this.prisma.subscription.findMany({ where: { userId, isActive: true, type: 'package' } });

    const ids = new Set<string>();
    userPackages.forEach((up: any) => ids.add(up.packageId));
    subscriptions.forEach((s: any) => ids.add(s.targetId));

    if (ids.size === 0) return [];

    const pkgs = await this.prisma.package.findMany({ where: { id: { in: Array.from(ids) }, type: 'PLAN' }, include: { mfe: true } });
    return pkgs.map((p: any) => this.mapPrismaPackageToDomain(p));
  }

  async getPackagesByPlan(planId: string): Promise<PackageDomain[]> {
    const pkgs = await this.prisma.package.findMany({ where: { planId, isActive: true }, include: { mfe: true } });
    return pkgs.map((p: any) => this.mapPrismaPackageToDomain(p));
  }

  async getMicrofrontendsByUser(userId: string): Promise<Array<any>> {
    const userPackages = await this.prisma.userPackage.findMany({ where: { userId, isActive: true } });
    const subscriptions = await this.prisma.subscription.findMany({ where: { userId, isActive: true, type: 'package' } });

    const packageIds = Array.from(new Set([...userPackages.map((u: any) => u.packageId), ...subscriptions.map((s: any) => s.targetId)]));
    if (packageIds.length === 0) return [];

    const access = await this.prisma.microfrontendAccess.findMany({ where: { packageId: { in: packageIds } }, include: { mfe: true } });

    const map = new Map<string, any>();
    access.forEach((a: any) => {
      if (a.mfe && !map.has(a.mfe.id)) {
        map.set(a.mfe.id, {
          id: a.mfe.id,
          name: a.mfe.name,
          remoteUrl: a.mfe.remoteUrl,
          imageUrl: a.mfe.imageUrl,
          version: a.mfe.version,
          order: a.mfe.order,
          isActive: a.mfe.isActive
        });
      }
    });

    return Array.from(map.values());
  }

  async findPlanById(planId: string): Promise<PlanDomain | null> {
    const p = await this.prisma.package.findUnique({ where: { id: planId }, include: { mfe: true } });
    if (!p || p.type !== 'PLAN') return null;
    const pkg = this.mapPrismaPackageToDomain(p);
    return PlanDomain.fromPackage(pkg);
  }

  async savePlan(data: { id?: string; name: string; tier?: string; maxPackages?: number; description?: string }): Promise<PackageDomain> {
    if (data.id) {
      const updated = await this.prisma.package.update({
        where: { id: data.id },
        data: { name: data.name, description: data.description ?? null, tier: data.tier ?? null, maxPackages: data.maxPackages ?? null, type: 'PLAN' }
      });
      return this.mapPrismaPackageToDomain(updated);
    }

    const created = await this.prisma.package.create({ data: { name: data.name, description: data.description ?? null, tier: data.tier ?? null, maxPackages: data.maxPackages ?? null, type: 'PLAN' } });
    return this.mapPrismaPackageToDomain(created);
  }

  // Generic package create/update (non-plan)
  async savePackage(data: { id?: string; name: string; description?: string; priceCents?: number; currency?: string; isFree?: boolean; isActive?: boolean; planId?: string }): Promise<PackageDomain> {
    if (data.id) {
      const updated = await this.prisma.package.update({
        where: { id: data.id },
        data: {
          name: data.name,
          description: data.description ?? null,
          priceCents: data.priceCents ?? null,
          currency: data.currency ?? null,
          isFree: data.isFree ?? false,
          isActive: data.isActive ?? true,
          planId: data.planId ?? null,
          type: 'PACKAGE'
        },
        include: { mfe: true }
      });
      return this.mapPrismaPackageToDomain(updated as any);
    }

    const created = await this.prisma.package.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        priceCents: data.priceCents ?? null,
        currency: data.currency ?? null,
        isFree: data.isFree ?? false,
        isActive: data.isActive ?? true,
        planId: data.planId ?? null,
        type: 'PACKAGE'
      },
      include: { mfe: true }
    });

    return this.mapPrismaPackageToDomain(created as any);
  }

  async listPackages(type?: 'PLAN' | 'PACKAGE'): Promise<PackageDomain[]> {
    const where: any = {};
    if (type) where.type = type;
    const pkgs = await this.prisma.package.findMany({ where, include: { mfe: true } });
    return pkgs.map((p: any) => this.mapPrismaPackageToDomain(p));
  }

  async saveMicrofrontend(data: { id?: string; name: string; remoteUrl: string; imageUrl?: string; version?: string; isActive?: boolean }): Promise<any> {
    if (data.id) {
      const updated = await this.prisma.microfrontend.update({ where: { id: data.id }, data: { name: data.name, remoteUrl: data.remoteUrl, imageUrl: data.imageUrl ?? null, version: data.version ?? null, isActive: data.isActive ?? true } });
      return updated;
    }

    const created = await this.prisma.microfrontend.create({ data: { name: data.name, remoteUrl: data.remoteUrl, imageUrl: data.imageUrl ?? null, version: data.version ?? null } });
    return created;
  }
}

