import {CURRENCIES} from './data';
import type {
  CloudProvider,
  CloudRegion,
  Currency,
  SettingsState,
  UsageTreeNode,
} from './types';

// All cost math takes state as input — no module-level singletons — so the
// React component can derive values from props/state cleanly.

export function findCurrency(code: string): Currency {
  return CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];
}

export function periodMultiplier(s: SettingsState): number {
  if (s.billingPeriod === 'hourly') return 1 / 720;
  if (s.billingPeriod === 'daily') return 1 / 30;
  if (s.billingPeriod === 'yearly') return 12;
  return 1;
}

export function periodLabel(s: SettingsState): string {
  if (s.billingPeriod === 'hourly') return '/hr';
  if (s.billingPeriod === 'daily') return '/day';
  if (s.billingPeriod === 'yearly') return '/yr';
  return '/mo';
}

export function formatCost(s: SettingsState, usdMonthly: number): string {
  const cur = findCurrency(s.currencyCode);
  const val = usdMonthly * periodMultiplier(s) * cur.rate;
  if (Math.abs(val) < 0.0001 && val !== 0) return `${cur.symbol}${val.toExponential(2)}`;
  if (Math.abs(val) < 0.01 && val !== 0) return `${cur.symbol}${val.toFixed(6)}`;
  if (Math.abs(val) < 1) return `${cur.symbol}${val.toFixed(4)}`;
  if (cur.rate > 100) return `${cur.symbol}${val.toFixed(0)}`;
  return `${cur.symbol}${val.toFixed(2)}`;
}

export function getActiveRegion(p: CloudProvider): CloudRegion {
  return p.regions.find((r) => r.id === p.selectedRegion) || p.regions[0];
}

export function avgStoragePrice(s: SettingsState): number {
  const enabled = s.providers.filter((p) => p.enabled);
  if (enabled.length === 0) return 0;
  return enabled.reduce((sum, p) => sum + getActiveRegion(p).storagePricePerGBMonth, 0) / enabled.length;
}

export function nodeStorageCostMonthly(s: SettingsState, node: UsageTreeNode): number {
  return (node.storageBytes / (1024 ** 3)) * avgStoragePrice(s);
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 ** 3) return (bytes / 1024 ** 3).toFixed(2) + ' GB';
  if (bytes >= 1024 ** 2) return (bytes / 1024 ** 2).toFixed(2) + ' MB';
  if (bytes >= 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return bytes + ' B';
}

export interface OpSub {
  label: string;
  costUSD: number;
  usageLabel?: string;
  icon: 'network' | 'disk-read' | 'disk-write';
}

export interface OpCategory {
  id: string;
  label: string;
  icon: 'clone' | 'explorer' | 'search';
  usageBytes: number;
  subcategories: OpSub[];
}

export function computeOperationCosts(s: SettingsState): OpCategory[] {
  const enabled = s.providers.filter((p) => p.enabled);
  if (enabled.length === 0) return [];

  const avgGet = enabled.reduce((acc, p) => acc + getActiveRegion(p).getPer1000, 0) / enabled.length;
  const avgPut = enabled.reduce((acc, p) => acc + getActiveRegion(p).putPer1000, 0) / enabled.length;
  const avgEgress = enabled.reduce((acc, p) => acc + getActiveRegion(p).egressPerGB, 0) / enabled.length;

  return [
    {
      id: 'cloning', label: 'Cloning', icon: 'clone', usageBytes: 1.2 * 1024 ** 3,
      subcategories: [
        {label: 'Network', icon: 'network', costUSD: 0.2 * avgEgress, usageLabel: '214 MB transferred'},
        {label: 'Disk Read', icon: 'disk-read', costUSD: (200 / 1000) * avgGet, usageLabel: '200 ops'},
        {label: 'Disk Write', icon: 'disk-write', costUSD: (150 / 1000) * avgPut, usageLabel: '150 ops'},
      ],
    },
    {
      id: 'explorer', label: 'Explorer', icon: 'explorer', usageBytes: 340 * 1024 ** 2,
      subcategories: [
        {label: 'Network', icon: 'network', costUSD: 0.1 * avgEgress, usageLabel: '102 MB transferred'},
        {label: 'Disk Read', icon: 'disk-read', costUSD: (100 / 1000) * avgGet, usageLabel: '100 ops'},
      ],
    },
    {
      id: 'search', label: 'Search Index', icon: 'search', usageBytes: 680 * 1024 ** 2,
      subcategories: [
        {label: 'Disk Read', icon: 'disk-read', costUSD: (80 / 1000) * avgGet, usageLabel: '80 ops'},
        {label: 'Disk Write', icon: 'disk-write', costUSD: (60 / 1000) * avgPut, usageLabel: '60 ops'},
      ],
    },
  ];
}

export function computeTotalCostMonthly(s: SettingsState): number {
  const storage = s.storageUsedGB * avgStoragePrice(s);
  const processing = computeOperationCosts(s).reduce(
    (acc, cat) => acc + cat.subcategories.reduce((aa, sub) => aa + sub.costUSD, 0),
    0,
  );
  return storage + processing;
}

export function processingNodeCost(s: SettingsState, node: UsageTreeNode): number {
  const enabled = s.providers.filter((p) => p.enabled);
  if (enabled.length === 0) return 0;
  const avgGet = enabled.reduce((acc, p) => acc + getActiveRegion(p).getPer1000, 0) / enabled.length;
  const avgPut = enabled.reduce((acc, p) => acc + getActiveRegion(p).putPer1000, 0) / enabled.length;
  const avgEgress = enabled.reduce((acc, p) => acc + getActiveRegion(p).egressPerGB, 0) / enabled.length;
  return (
    (node.readOps / 1000) * avgGet +
    (node.writeOps / 1000) * avgPut +
    (node.networkEgressBytes / (1024 ** 3)) * avgEgress
  );
}
