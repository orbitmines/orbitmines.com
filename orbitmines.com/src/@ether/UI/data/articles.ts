import type {FileEntry, TreeEntry} from './types';

// Maps the existing orbitmines.com archive routes into ether `FileEntry`
// records. Each article becomes a file inside `@ether/archive/`; clicking
// the file in the ether browser sends the user to `/archive/<slug>`, where
// the existing React component renders it.
//
// Adding a new article: add an entry below and ensure the `slug` matches
// the key in `routes/Archive.tsx`.

type Article = {
  /** Slug used by routes/Archive.tsx — i.e. /archive/<slug>. */
  slug: string;
  /** Title shown in the file browser. Year-prefixed to match the existing
   *  on-site presentation. */
  title: string;
  /** File-system name within @ether/archive/. */
  fileName: string;
  /** Date string for the "modified" column. */
  modified: string;
};

const ARTICLES: Article[] = [
  {
    slug: 'on-intelligibility',
    title: '2022 — On Intelligibility',
    fileName: '2022.on-intelligibility',
    modified: '2022',
  },
  {
    slug: 'on-orbits-equivalence-and-inconsistencies',
    title: '2023 — On Orbits, Equivalence, Inconsistencies',
    fileName: '2023.on-orbits',
    modified: '2023',
  },
  {
    slug: '2024-02-ngi-grant-proposal',
    title: '2024.02 — NGI Grant Proposal',
    fileName: '2024.02.ngi-grant-proposal',
    modified: '2024-02',
  },
  {
    slug: '2024-02-orbitmines-as-a-game-project',
    title: '2024.02 — OrbitMines as a Game Project',
    fileName: '2024.02.orbitmines-as-a-game-project',
    modified: '2024-02',
  },
  {
    slug: 'towards-a-universal-language',
    title: '2025 — Towards a Universal Language',
    fileName: '2025.towards-a-universal-language',
    modified: '2025',
  },
  {
    slug: '2025-09-ngi-grant-proposal',
    title: '2025.09 — NGI Grant Proposal (3)',
    fileName: '2025.09.ngi-grant-proposal',
    modified: '2025-09',
  },
  {
    slug: 'the-orbitmines-minecraft-server',
    title: '2026 — The OrbitMines Minecraft Server',
    fileName: '2026.minecraft-archive',
    modified: '2026',
  },
];

export function archiveTree(): TreeEntry[] {
  return ARTICLES.map<FileEntry>((a) => ({
    name: a.fileName,
    isDirectory: false,
    modified: a.modified,
    access: 'public',
    externalRoute: `/archive/${a.slug}`,
  }));
}

export function articleTitleForRoute(routePath: string): string | null {
  const match = ARTICLES.find((a) => `/archive/${a.slug}` === routePath);
  return match?.title ?? null;
}
