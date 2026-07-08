export interface CloudRegion {
  id: string;
  name: string;
  storagePricePerGBMonth: number;
  putPer1000: number;
  getPer1000: number;
  listPer1000: number;
  deletePer1000: number;
  egressPerGB: number;
  ingressPerGB: number;
}

export interface CloudProvider {
  id: string;
  name: string;
  enabled: boolean;
  selectedRegion: string;
  regions: CloudRegion[];
  gcRegionType?: 'single' | 'dual' | 'multi';
}

export interface UsageTreeNode {
  name: string;
  isDirectory: boolean;
  storageBytes: number;
  readOps: number;
  writeOps: number;
  networkEgressBytes: number;
  networkIngressBytes: number;
  children: UsageTreeNode[];
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  /** USD → currency rate. */
  rate: number;
}

export type BillingPeriod = 'hourly' | 'daily' | 'monthly' | 'yearly';

export interface SettingsState {
  billingPeriod: BillingPeriod;
  currencyCode: string;
  storageQuotaGB: number;
  storageUsedGB: number;
  providers: CloudProvider[];
}
