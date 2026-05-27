// Path -> repo / world / tree resolution. Shared between the React entry
// and tests. Mirrors the renderRepo() prologue from ray's Repository.ts.

import {flattenEntries, resolveDirectory, resolveFile, resolveFiles} from '../../data';
import type {FileEntry, Repository as RepoData, TreeEntry} from '../../data';
import {getAPI} from '../../data';
import {
  buildBasePath,
  buildCanonicalPath,
  unescapePathSegment,
} from './paths';
import {getCurrentPlayer, getSessionContent, getStars} from './storage';
import type {HeaderChainItem} from './Header';

export interface ResolvedRepoParams {
  effectiveUser: string;
  effectiveWorld: string | null;
  effectiveWorldParent: string;
  worldParentKey: string;
  treePath: string[];
  treePathStart: number;
  userPathEnd: number;
  showUsersListing: boolean;
  showWorldsListing: boolean;
  hasWildcard: boolean;
  headerChain: HeaderChainItem[];
  accessGroupContext: string;
}

export function processPath(
  user: string,
  path: string[],
  base: string,
): ResolvedRepoParams {
  let effectiveUser = user;
  let effectiveWorld: string | null = null;
  let effectiveWorldParent = user;
  let worldParentKey = user;
  let treePath: string[] = [];
  let treePathStart = 0;
  let userPathEnd = 0;
  let showUsersListing = false;
  let showWorldsListing = false;
  let hasWildcard = false;

  // Hide the implicit @user when the path immediately enters a world.
  const firstNonWild = path.find((s) => s !== '*' && s !== '**');
  const startsWithWorld =
    firstNonWild !== undefined && (firstNonWild === '~' || firstNonWild.startsWith('~'));
  const headerChain: HeaderChainItem[] =
    base || !startsWithWorld ? [{label: `@${user}`, pathEnd: 0}] : [];

  for (let i = 0; i < path.length; i++) {
    const seg = path[i];
    if (seg === '*' || seg === '**') {
      hasWildcard = true;
      if (treePath.length === 0) {
        treePathStart = i + 1;
        userPathEnd = i + 1;
      }
      continue;
    } else if (seg === '@') {
      if (i === path.length - 1) {
        showUsersListing = true;
      } else {
        effectiveUser = path[i + 1];
        effectiveWorld = null;
        worldParentKey = effectiveUser;
        treePath = [];
        treePathStart = i + 2;
        userPathEnd = i + 2;
        headerChain.push({label: `@${effectiveUser}`, pathEnd: i + 2});
        i++;
      }
    } else if (seg.startsWith('@')) {
      effectiveUser = seg.slice(1);
      effectiveWorld = null;
      worldParentKey = effectiveUser;
      treePath = [];
      treePathStart = i + 1;
      userPathEnd = i + 1;
      headerChain.push({label: `@${effectiveUser}`, pathEnd: i + 1});
    } else if (seg === '~') {
      if (i === path.length - 1) showWorldsListing = true;
    } else if (seg.startsWith('~')) {
      const parentKey = worldParentKey;
      effectiveWorld = seg.slice(1);
      treePath = [];
      treePathStart = i + 1;
      headerChain.push({label: `#${effectiveWorld}`, pathEnd: i + 1});
      worldParentKey = effectiveWorld;
      effectiveWorldParent = parentKey;
    } else {
      treePath.push(unescapePathSegment(seg));
    }
  }

  if (showUsersListing) {
    headerChain.push({label: '@{: String}', pathEnd: -1});
  } else if (showWorldsListing) {
    headerChain.push({label: '#{: String}', pathEnd: -1});
  } else if (treePath.length > 0) {
    headerChain.push({label: treePath[0], pathEnd: treePathStart + 1});
  }

  const accessGroupContext = effectiveWorld ? '#' + effectiveWorld : '@' + effectiveUser;

  return {
    effectiveUser,
    effectiveWorld,
    effectiveWorldParent,
    worldParentKey,
    treePath,
    treePathStart,
    userPathEnd,
    showUsersListing,
    showWorldsListing,
    hasWildcard,
    headerChain,
    accessGroupContext,
  };
}

export interface LoadRepoResult {
  repository: RepoData;
  entries: TreeEntry[];
  /** If non-null, hash/path resolution should redirect to this URL. */
  redirect?: string;
}

export interface LoadRepoArgs extends ResolvedRepoParams {
  user: string;
  path: string[];
  base: string;
  versions: [number, string][];
  hash: string | null;
}

// Loads the repository (or world), augments its tree at the root with the
// virtual @/~ navigation entries + session/stars files, and returns the
// directory entries that should be shown for the current path. Returns null
// when the target repo/world doesn't exist.
export async function loadRepoEntries(args: LoadRepoArgs): Promise<LoadRepoResult | null> {
  const {
    effectiveUser,
    effectiveWorld,
    effectiveWorldParent,
    worldParentKey,
    treePath,
    treePathStart,
    showUsersListing,
    showWorldsListing,
    user,
    path,
    base,
    versions,
    hash,
  } = args;

  const currentPlayer = getCurrentPlayer();
  let repository = effectiveWorld
    ? await getAPI().getWorld(effectiveWorldParent, effectiveWorld)
    : await getAPI().getRepository(effectiveUser);
  if (!repository && !effectiveWorld && effectiveUser === currentPlayer) {
    repository = {user: currentPlayer, description: `@${currentPlayer}`, tree: []};
  }
  if (!repository) return null;

  let entries: TreeEntry[];

  if (showUsersListing) {
    const referencedUsers = await getAPI().getReferencedUsers(effectiveUser, effectiveWorld);
    const users = referencedUsers.includes(currentPlayer)
      ? referencedUsers
      : [currentPlayer, ...referencedUsers];
    entries = users.map<FileEntry>((u) => ({
      name: u,
      isDirectory: true,
      modified: '',
    }));
  } else if (showWorldsListing) {
    const referencedWorlds = await getAPI().getReferencedWorlds(effectiveUser, effectiveWorld);
    entries = referencedWorlds.map<FileEntry>((w) => ({
      name: w,
      isDirectory: true,
      modified: '',
    }));
  } else {
    let resolved =
      treePath.length > 0 ? resolveDirectory(repository.tree, treePath) : repository.tree;

    if (!resolved && treePath.length > 0) {
      const apiPath = effectiveWorld
        ? `@${effectiveWorldParent}/~${effectiveWorld}/${treePath.join('/')}`
        : `@${effectiveUser}/${treePath.join('/')}`;
      const fetched = await getAPI().listDirectory(apiPath);
      if (fetched.length > 0) resolved = fetched;
    }

    if (!resolved) {
      // Try the hash-redirect path: maybe the user typed a file path inline
      if (!hash && treePath.length > 0) {
        const resolveTree = await augmentTreeRoot(
          repository.tree,
          effectiveUser,
          effectiveWorld,
          worldParentKey,
          currentPlayer,
        );
        const files = resolveFiles(resolveTree, treePath);
        if (files.length > 0) {
          let dirDepth = treePath.length - 1;
          while (dirDepth > 0 && !resolveDirectory(resolveTree, treePath.slice(0, dirDepth))) {
            dirDepth--;
          }
          const dirPart = treePath.slice(0, dirDepth);
          const filePart = treePath.slice(dirDepth);
          const parentUrl = buildBasePath(base, versions, [
            ...path.slice(0, treePathStart),
            ...dirPart,
          ]);
          return {repository, entries: [], redirect: parentUrl + '#' + filePart.join('/')};
        }
      }
      return null;
    }
    entries = resolved;

    if (treePath.length === 0) {
      const augmented = await augmentTreeRoot(
        entries,
        effectiveUser,
        effectiveWorld,
        worldParentKey,
        currentPlayer,
      );
      entries = augmented;
    }
  }

  return {repository, entries};
}

async function augmentTreeRoot(
  tree: TreeEntry[],
  effectiveUser: string,
  effectiveWorld: string | null,
  worldParentKey: string,
  currentPlayer: string,
): Promise<TreeEntry[]> {
  const virtuals: FileEntry[] = [];

  const refUsers = await getAPI().getReferencedUsers(effectiveUser, effectiveWorld);
  if (refUsers.length > 0) {
    const userChildren: FileEntry[] = await Promise.all(
      (refUsers.includes(currentPlayer) ? refUsers : [currentPlayer, ...refUsers]).map(
        async (u) => {
          const repo = await getAPI().getRepository(u);
          return {
            name: u,
            isDirectory: true,
            modified: '',
            children: repo ? [...repo.tree] : [],
          } as FileEntry;
        },
      ),
    );
    virtuals.push({name: '@', isDirectory: true, modified: '', children: userChildren});
  }

  const refWorlds = await getAPI().getReferencedWorlds(effectiveUser, effectiveWorld);
  if (refWorlds.length > 0) {
    const worldChildren: FileEntry[] = await Promise.all(
      refWorlds.map(async (w) => {
        const worldRepo = await getAPI().getWorld(worldParentKey, w);
        return {
          name: w,
          isDirectory: true,
          modified: '',
          children: worldRepo ? [...worldRepo.tree] : [],
        } as FileEntry;
      }),
    );
    virtuals.push({name: '~', isDirectory: true, modified: '', children: worldChildren});
  }

  if (effectiveUser === currentPlayer && !effectiveWorld) {
    const stars = getStars();
    virtuals.push({
      name: '.stars.list.ray',
      isDirectory: false,
      modified: '',
      content: stars.length > 0 ? stars.join('\n') : '',
    });
    virtuals.push({
      name: 'Session.ray.json',
      isDirectory: false,
      modified: '',
      content: getSessionContent(currentPlayer),
    });
  }

  const virtualNames = new Set(virtuals.map((v) => v.name));
  return [...virtuals, ...tree.filter((e) => 'name' in e && !virtualNames.has((e as FileEntry).name))];
}

export function buildRootStarPath(
  repository: RepoData,
  effectiveUser: string,
  effectiveWorld: string | null,
  treePath: string[],
  user: string,
  base: string,
): string {
  if (treePath.length > 0) {
    const flat = flattenEntries(repository.tree);
    const isTopDir = flat.some((e) => e.name === treePath[0] && e.isDirectory);
    if (isTopDir) {
      let p = buildCanonicalPath(effectiveUser, effectiveWorld, treePath.slice(0, 1));
      if (!base) {
        const prefix = `@${user}/`;
        if (p.startsWith(prefix)) p = p.slice(prefix.length);
      }
      return p;
    }
  }
  let p = buildCanonicalPath(effectiveUser, effectiveWorld, []);
  if (!base) {
    const prefix = `@${user}/`;
    if (p.startsWith(prefix)) p = p.slice(prefix.length);
  }
  return p;
}

export interface BreadcrumbBuildResult {
  rootLink?: {label: string; href: string};
  items: {label: string; href: string | null}[];
}

export function buildBreadcrumbItems(
  treePath: string[],
  headerChain: HeaderChainItem[],
  base: string,
  versions: [number, string][],
  path: string[],
  treePathStart: number,
  repoTree?: TreeEntry[],
): BreadcrumbBuildResult {
  if (treePath.length === 0) return {items: []};

  const isTopDir = repoTree
    ? flattenEntries(repoTree).some((e) => e.name === treePath[0] && e.isDirectory)
    : true;

  if (!isTopDir && treePath.length === 1) {
    const parentEntry =
      headerChain.length >= 2
        ? headerChain[headerChain.length - 2]
        : headerChain[headerChain.length - 1];
    const rootLabel = parentEntry?.label || '';
    const rootHref = buildBasePathSlice(base, versions, path, treePathStart);
    return {
      rootLink: {label: rootLabel, href: rootHref},
      items: [{label: treePath[0], href: null}],
    };
  }

  const rootLabel = treePath[0] || headerChain[headerChain.length - 1]?.label || '';
  const rootHref = buildBasePathSlice(base, versions, path, treePathStart + 1);
  const subPath = treePath.slice(1);
  const items = subPath.map((seg, i) => ({
    label: seg,
    href:
      i < subPath.length - 1
        ? buildBasePathSlice(base, versions, path, treePathStart + 1 + i + 1)
        : null,
  }));
  return {rootLink: {label: rootLabel, href: rootHref}, items};
}

function buildBasePathSlice(
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

// Look up index.ray.js content from a directory listing.
export function findIndexRay(entries: TreeEntry[]): FileEntry | null {
  const flat = flattenEntries(entries);
  return flat.find((e) => e.name === 'index.ray.js' && !e.isDirectory && e.content) || null;
}

// Convenience to fetch a file's content, falling back to the API.
export async function fetchFileContent(
  entries: TreeEntry[],
  hashPath: string[],
  effectiveWorld: string | null,
  effectiveWorldParent: string,
  effectiveUser: string,
  treePath: string[],
): Promise<FileEntry[]> {
  let files = resolveFiles(entries, hashPath);
  const needsFetch = files.length === 0 || files.every((f) => f.content === undefined);
  if (needsFetch) {
    const apiFilePath = effectiveWorld
      ? `@${effectiveWorldParent}/~${effectiveWorld}/${
          treePath.length > 0 ? treePath.join('/') + '/' : ''
        }${hashPath.join('/')}`
      : `@${effectiveUser}/${treePath.length > 0 ? treePath.join('/') + '/' : ''}${hashPath.join(
          '/',
        )}`;
    const content = await getAPI().readFile(apiFilePath);
    if (content !== null) {
      const name = hashPath[hashPath.length - 1];
      files = [{name, isDirectory: false, modified: '', content}];
    }
  }
  return files;
}

// Resolves a file from a sidebar href (decoding @/~ prefixes back into
// virtual @/~ tree segments so resolveFiles can navigate them).
export function hrefToFileTreePath(href: string, sidebarBasePath: string): string[] | null {
  const prefix = sidebarBasePath.endsWith('/') ? sidebarBasePath : sidebarBasePath + '/';
  if (!href.startsWith(prefix)) return null;
  const rel = href.slice(prefix.length).split('/').filter(Boolean);
  const segs: string[] = [];
  for (const raw of rel) {
    let seg: string;
    try {
      seg = decodeURIComponent(raw);
    } catch {
      seg = raw;
    }
    if (seg.length > 1 && (seg.startsWith('@') || seg.startsWith('~'))) {
      segs.push(seg[0], seg.slice(1));
    } else {
      segs.push(seg);
    }
  }
  return segs;
}
