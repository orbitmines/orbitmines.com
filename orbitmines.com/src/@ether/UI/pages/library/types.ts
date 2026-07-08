export type LanguageRef = string | {name: string; icon?: string};

export interface Entry {
  type?: 'file' | 'library';
  name: string;
  icon?: string;
  language?: LanguageRef;
  library?: string;
  reference?: {name: string; icon?: string};
  versions?: Version[];
  snippet?: string;
}

export interface Version {
  tag: string;
  language?: LanguageRef;
  children?: VersionChild[];
}

export type VersionChild = Entry | LibrariesGroup;

export interface LibrariesGroup {
  type: 'libraries';
  count?: number;
  entries: LibraryEntryData[];
}

export interface LibraryEntryData {
  name: string;
  icon?: string;
  snippet?: string;
  reference?: {name: string; icon?: string};
}

export interface TagGroup {
  tag: string;
  langs: {name: string; icon: string}[];
}

export function resolveLanguageRef(
  ref?: LanguageRef,
): {name?: string; icon?: string} {
  if (!ref) return {};
  if (typeof ref === 'string') return {name: ref};
  return ref;
}

export function resolveLanguage(
  ref?: LanguageRef,
  defaultRef?: LanguageRef,
): {name: string; icon: string} {
  const resolved = resolveLanguageRef(ref);
  const defaults = resolveLanguageRef(defaultRef);
  return {
    name: resolved.name || defaults.name || '',
    icon: resolved.icon || defaults.icon || 'circle',
  };
}

export function entryKey(entry: Entry): string {
  if (entry.library) return `${entry.library}//${entry.name}`;
  if (entry.reference) return `${entry.name}->${entry.reference.name}`;
  return entry.name;
}

export function isLibrariesGroup(child: VersionChild): child is LibrariesGroup {
  return (child as LibrariesGroup).type === 'libraries';
}
