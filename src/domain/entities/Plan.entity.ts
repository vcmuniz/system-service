import { Package } from './Package.entity';

export type PlanId = string;

export class Plan {
  private pkg: Package;
  private constructor(pkg: Package) { this.pkg = pkg; }

  static fromPackage(pkg: Package) {
    return new Plan(pkg);
  }

  get id() { return this.pkg.id; }
  get name() { return this.pkg.name; }
  get tier() { return (this.pkg as any).tier; }
  get maxPackages() { return (this.pkg as any).maxPackages; }
  get isActive() { return (this.pkg as any).isActive; }
}
