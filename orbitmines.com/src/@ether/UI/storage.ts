// Single `@me` localStorage key holding everything about the user.
// Replaces the per-key `ether:*` scheme from the ray prototype.

const KEY = '@me';

export type MeRecord = {
  name: string;
  names: string[];      // history of chosen names, most recent last
  visited: boolean;     // has the user seen the boot intro
  // Future fields (stars, follows, etc.) live in the same object.
  [extra: string]: unknown;
};

const EMPTY: MeRecord = { name: '@me', names: [], visited: false };

function read(): MeRecord {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw);
    return { ...EMPTY, ...parsed };
  } catch {
    return { ...EMPTY };
  }
}

function write(record: MeRecord): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(record));
  } catch {}
}

export function getMe(): MeRecord {
  return read();
}

export function getName(): string {
  return read().name || '@me';
}

export function getNames(): string[] {
  return read().names;
}

export function setName(name: string): void {
  const me = read();
  const trimmed = name.trim() || '@me';
  const list = me.names.filter((n) => n !== trimmed);
  list.push(trimmed);
  write({ ...me, name: trimmed, names: list });
}

export function isFirstVisit(): boolean {
  return !read().visited;
}

export function markVisited(): void {
  write({ ...read(), visited: true });
}
