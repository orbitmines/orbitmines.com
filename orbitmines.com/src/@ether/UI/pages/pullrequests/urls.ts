import type {PRParams} from '../../router/types';

export function buildPullsUrl(params: PRParams, suffix?: string): string {
  const base = params.base || '';
  const pathPart = params.path.length > 0 ? '/' + params.path.join('/') : '';
  const categoryPart = params.category ? '/' + params.category : '';
  return `${base}${pathPart}/-${categoryPart}/pulls${suffix ? '/' + suffix : ''}`;
}

export function buildRepoUrl(params: PRParams): string {
  const base = params.base || '';
  const pathPart = params.path.length > 0 ? '/' + params.path.join('/') : '';
  return `${base}${pathPart}` || '/';
}

export function buildBranchUrl(label: string): string | null {
  return label.includes('/') ? `/@${label}` : null;
}

export function displaySegment(seg: string): string {
  return seg;
}

export function displayPath(relPath: string): string {
  return relPath;
}
