import type {FileEntry, Repository, TreeEntry} from './types';

// Profiles defined under `routes/profiles/` become dummy ether users.
// Currently exactly one profile (fadi-shawki) is real. Chat / PR / follow
// features expecting multiple users will render empty states rather than
// fabricating supporting cast.

type Profile = {
  /** Ether username (without the leading @). Matches the URL slug of the
   *  orbitmines.com profile route. */
  user: string;
  description: string;
  /** Path to the profile's /@<slug> page. */
  routePath: string;
};

export const PROFILES: Profile[] = [
  {
    user: 'fadi-shawki',
    description: 'Researcher; orbitmines.com primary profile.',
    routePath: '/@fadi-shawki',
  },
];

function profileRepository(p: Profile): Repository {
  const tree: TreeEntry[] = [
    <FileEntry>{
      name: 'profile',
      isDirectory: false,
      modified: 'today',
      access: 'public',
      externalRoute: p.routePath,
    },
  ];
  return {
    user: p.user,
    description: p.description,
    tree,
  };
}

const REPOS: Map<string, Repository> = new Map(
  PROFILES.map((p) => [p.user, profileRepository(p)]),
);

export function profileRepo(user: string): Repository | null {
  return REPOS.get(user) ?? null;
}

export function allProfileUsers(): string[] {
  return PROFILES.map((p) => p.user);
}
