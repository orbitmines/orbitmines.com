import {createProviders} from './data';
import type {SettingsState} from './types';

const KEY = 'ether:settings';

export function loadSettings(): SettingsState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const fresh = createProviders();
      for (const p of fresh) {
        const saved = parsed.providers?.find((sp: any) => sp.id === p.id);
        if (saved) {
          p.enabled = saved.enabled;
          p.selectedRegion = saved.selectedRegion;
          if (p.gcRegionType && saved.gcRegionType) p.gcRegionType = saved.gcRegionType;
        }
      }
      return {
        billingPeriod: parsed.billingPeriod || 'monthly',
        currencyCode: parsed.currencyCode || 'USD',
        storageQuotaGB: parsed.storageQuotaGB || 10,
        storageUsedGB: parsed.storageUsedGB || 2.84,
        providers: fresh,
      };
    }
  } catch {
    /* ignore */
  }
  return {
    billingPeriod: 'monthly',
    currencyCode: 'USD',
    storageQuotaGB: 10,
    storageUsedGB: 2.84,
    providers: createProviders(),
  };
}

export function saveSettings(state: SettingsState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}
