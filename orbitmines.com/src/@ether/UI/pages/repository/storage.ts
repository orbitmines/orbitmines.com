// LocalStorage state for repository: current player identity, stars,
// follows, and per-user session (sidebar expand set + IDE layout).
// Mirrors ray's API.ts local-state functions 1:1.

// ---- Player identity ----

export function getCurrentPlayer(): string {
  return localStorage.getItem('ether:name') || 'anonymous';
}

// ---- Stars ----

const STARS_KEY = 'ether:stars';

function setStars(stars: string[]): void {
  localStorage.setItem(STARS_KEY, stars.join('\n'));
}

export function getStars(): string[] {
  const raw = localStorage.getItem(STARS_KEY);
  return raw ? raw.split('\n').filter(Boolean) : [];
}

export function getStarCount(canonicalPath: string): number {
  const raw = localStorage.getItem(`ether:star-count:${canonicalPath}`);
  return raw ? parseInt(raw, 10) || 0 : 0;
}

export function setStarCount(canonicalPath: string, count: number): void {
  localStorage.setItem(`ether:star-count:${canonicalPath}`, String(Math.max(0, count)));
}

export function isStarred(canonicalPath: string): boolean {
  const stars = getStars();
  if (stars.includes(canonicalPath)) return true;
  // Parent match — but not for worlds (#), players (@), or top-level libraries.
  const parts = canonicalPath.split('/');
  for (let i = parts.length - 1; i >= 1; i--) {
    const parent = parts.slice(0, i).join('/');
    const child = parts[i];
    if (child.startsWith('@') || child.startsWith('#') || child.startsWith('~')) break;
    if (
      i === 1 ||
      parts[i - 1].startsWith('@') ||
      parts[i - 1].startsWith('#') ||
      parts[i - 1].startsWith('~')
    )
      break;
    if (stars.includes(parent)) return true;
  }
  return false;
}

export function toggleStar(canonicalPath: string): boolean {
  const stars = getStars();
  const idx = stars.indexOf(canonicalPath);
  if (idx >= 0) {
    stars.splice(idx, 1);
    setStars(stars);
    return false;
  }
  stars.push(canonicalPath);
  setStars(stars);
  return true;
}

// ---- Follows ----

export function getFollowerCount(user: string): number {
  const raw = localStorage.getItem(`ether:follower-count:${user}`);
  return raw ? parseInt(raw, 10) || 0 : 0;
}

export function setFollowerCount(user: string, count: number): void {
  localStorage.setItem(`ether:follower-count:${user}`, String(Math.max(0, count)));
}

export function isFollowing(user: string): boolean {
  const raw = localStorage.getItem('ether:following');
  const list = raw ? raw.split('\n').filter(Boolean) : [];
  return list.includes(user);
}

export function toggleFollow(user: string): boolean {
  const raw = localStorage.getItem('ether:following');
  const list = raw ? raw.split('\n').filter(Boolean) : [];
  const idx = list.indexOf(user);
  if (idx >= 0) {
    list.splice(idx, 1);
    localStorage.setItem('ether:following', list.join('\n'));
    return false;
  }
  list.push(user);
  localStorage.setItem('ether:following', list.join('\n'));
  return true;
}

// ---- Sessions (sidebar-expanded set + IDE layout) ----

function sessionKey(user: string): string {
  return `ether:session:${user}`;
}

export interface RepoSession {
  sidebarExpanded?: string[];
  ideLayout?: unknown;
  ideLayoutBase?: string;
  [k: string]: unknown;
}

export function loadSession(user: string): RepoSession {
  try {
    const raw = localStorage.getItem(sessionKey(user));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveSession(user: string, data: RepoSession): void {
  localStorage.setItem(sessionKey(user), JSON.stringify(data, null, 2));
}

export function getSessionContent(user: string): string {
  return JSON.stringify(loadSession(user), null, 2);
}

// ---- Profile data ----

export interface ProfileSocial {
  platform: string;
  username: string;
}

export interface ProfileData {
  displayName: string;
  socials: ProfileSocial[];
}

export function loadProfile(user: string): ProfileData {
  try {
    const raw = localStorage.getItem(`ether:profile:${user}`);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return {displayName: '', socials: []};
}

export function saveProfile(user: string, data: ProfileData): void {
  localStorage.setItem(`ether:profile:${user}`, JSON.stringify(data));
}
