// Path helpers for the repository view. The ether URL scheme keeps several
// ray-specific conventions that don't map cleanly to react-router params —
// /~/version markers, @user / ~world segment escaping, etc. This module
// centralises all the URL construction so the rest of the page just calls
// `buildBasePath(...)` instead of stringifying segments themselves.

export type ParentContext = '@' | '~' | null;

export function encodeSegment(seg: string): string {
  return encodeURIComponent(seg);
}

export function buildBasePath(
  base: string,
  versions: [number, string][],
  path: string[],
): string {
  const relevant = versions
    .filter(([d]) => d <= path.length)
    .sort((a, b) => a[0] - b[0]);

  if (relevant.length === 0) {
    return (base || '') + (path.length > 0 ? '/' + path.join('/') : '');
  }

  let result = base || '';
  let pathIdx = 0;
  let verIdx = 0;

  while (pathIdx < path.length || verIdx < relevant.length) {
    if (verIdx < relevant.length && relevant[verIdx][0] === pathIdx) {
      result += '/~/' + relevant[verIdx][1];
      verIdx++;
    } else if (pathIdx < path.length) {
      result += '/' + path[pathIdx];
      pathIdx++;
    } else {
      break;
    }
  }

  return result;
}

// Segments that have special routing meaning and need escaping with '!'.
// (Backslash doesn't work — browsers convert \ to / in URLs.
//  Percent-encoding doesn't work for - and ~ — they're unreserved per RFC 3986
//  so browsers normalize %2D→- and %7E→~ when typed in the URL bar.)
export function needsPathEscaping(name: string): boolean {
  if (name.length === 0) return false;
  const ch = name[0];
  if (name === '@' || name === '~') return false;
  if (ch === '@' || ch === '~') return true;
  if (name === '*' || name === '**' || name === '-') return true;
  if (ch === '!') return true;
  return false;
}

export function escapePathSegment(name: string): string {
  return needsPathEscaping(name) ? '!' + name : name;
}

export function unescapePathSegment(seg: string): string {
  const stripped = seg.length > 1 && seg[0] === '!' ? seg.slice(1) : seg;
  try {
    return decodeURIComponent(stripped);
  } catch {
    return stripped;
  }
}

export function displayEntryName(
  name: string,
  parentContext: ParentContext = null,
): string {
  if (name === '@') return '@{: String}';
  if (name === '~') return '#{: String}';
  if (parentContext === '@') return `@${name}`;
  if (parentContext === '~') return `#${name}`;
  return name;
}

// Children of @ get /@name, children of ~ get /~name (no extra separator).
export function buildEntryHref(
  basePath: string,
  name: string,
  parentContext: ParentContext = null,
): string {
  if (parentContext === '@') {
    const parent = basePath.replace(/\/@$/, '');
    return parent + '/@' + encodeSegment(name);
  }
  if (parentContext === '~') {
    const parent = basePath.replace(/\/~$/, '');
    return parent + '/~' + encodeSegment(name);
  }
  if (name === '@' || name === '~') {
    return basePath + (basePath.endsWith('/') ? '' : '/') + name;
  }
  return basePath + (basePath.endsWith('/') ? '' : '/') + encodeSegment(escapePathSegment(name));
}

export function computeRelativeHash(sidebarBase: string, fullHref: string): string {
  const prefix = sidebarBase.endsWith('/') ? sidebarBase : sidebarBase + '/';
  if (fullHref.startsWith(prefix)) return fullHref.slice(prefix.length);
  return fullHref;
}

export function buildPathPreservingWildcards(
  base: string,
  versions: [number, string][],
  fullPath: string[],
  end: number,
): string {
  const sliced = fullPath.slice(0, end);
  for (const seg of fullPath.slice(end)) {
    if (seg === '*' || seg === '**') sliced.push(seg);
  }
  return buildBasePath(base, versions, sliced);
}

export function buildCanonicalPath(
  user: string,
  world: string | null,
  treePath: string[],
): string {
  let p = `@${user}`;
  if (world) p += `/#${world}`;
  if (treePath.length > 0) p += '/' + treePath.join('/');
  return p;
}
