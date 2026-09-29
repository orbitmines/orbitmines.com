// Group flat socials into ordered categories for rendering. Pulled out of
// the React Profile component so the data logic stays unit-testable.

import {
  EMAIL_SVG_HTML,
  ETHER_SVG_HTML,
  WORLD_SVG_HTML,
  getSocialLabel,
  getSocialSvg,
} from './icons';
import type {ProfileSocial} from './storage';

export type NameEntryMode = 'platform' | 'world' | 'email';

export function nameEntryMode(platform: string): NameEntryMode {
  if (platform.startsWith('#')) return 'world';
  if (!platform || platform.startsWith('@')) return 'platform';
  if (platform.includes('@')) return 'email';
  return 'platform';
}

export function isDomainName(name: string): boolean {
  return /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/.test(
    name,
  );
}

export interface SocialGroup {
  /** Category key — 'ether', 'domain', 'email', platform id, or per-world unique. */
  key: string;
  icon: string;
  label: string;
  entries: {idx: number; social: ProfileSocial}[];
}

export function groupSocials(socials: ProfileSocial[]): SocialGroup[] {
  const groups: SocialGroup[] = [];
  const keyToGroup = new Map<string, SocialGroup>();

  for (let i = 0; i < socials.length; i++) {
    const s = socials[i];
    const mode = nameEntryMode(s.platform);

    if (mode === 'world') {
      groups.push({
        key: `world:${i}`,
        icon: WORLD_SVG_HTML,
        label: '',
        entries: [{idx: i, social: s}],
      });
      continue;
    }

    let key: string;
    let icon: string;
    let label: string;

    if (s.platform === 'ether' && !isDomainName(s.username)) {
      key = 'ether';
      icon = ETHER_SVG_HTML;
      label = '';
    } else if (s.platform === 'ether' && isDomainName(s.username)) {
      key = 'domain';
      icon = WORLD_SVG_HTML;
      label = '';
    } else if (mode === 'email') {
      key = 'email';
      icon = EMAIL_SVG_HTML;
      label = '';
    } else {
      key = s.platform;
      icon = getSocialSvg(s.platform);
      label = `@${getSocialLabel(s.platform)}`;
    }

    const existing = keyToGroup.get(key);
    if (existing) {
      existing.entries.push({idx: i, social: s});
    } else {
      const group: SocialGroup = {key, icon, label, entries: [{idx: i, social: s}]};
      groups.push(group);
      keyToGroup.set(key, group);
    }
  }

  return groups;
}
