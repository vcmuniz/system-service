export type PackageId = string;

export interface PackageProps {
  id: PackageId;
  name: string;
  description?: string;
  priceCents?: number;
  currency?: string;
  isFree?: boolean;
  isActive?: boolean;
  microfrontend?: { name: string; remoteUrl: string; imageUrl?: string; route?: string } | null;
  createdAt?: Date;
}

export class Package {
  private constructor(private props: PackageProps) {}

  static create(props: Omit<PackageProps, 'id'|'createdAt'> & { id?: PackageId }) {
    const p: PackageProps = { id: (props.id || (Math.random().toString(36).slice(2))), createdAt: new Date(), isActive: props.isActive ?? true, priceCents: props.priceCents ?? 0, currency: props.currency ?? 'USD', microfrontend: props.microfrontend ?? null, ...props } as any;
    return new Package(p);
  }

  get id() { return this.props.id; }
  get name() { return this.props.name; }
  get microfrontend() { return this.props.microfrontend; }
}
