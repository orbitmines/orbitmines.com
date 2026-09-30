import type { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import ArchiveClient from './ArchiveClient';

// Each archive slug maps to its source component (mirrors ITEMS in
// src/routes/Archive.tsx). Used to enumerate the static params.
export const ITEM_SOURCES: Record<string, string> = {
  '2024-02-orbitmines-as-a-game-project': 'src/routes/archive/2024.02.OrbitMines_as_a_Game_Project.tsx',
  'on-intelligibility': 'src/routes/archive/2022.OnIntelligibility.tsx',
  'on-orbits-equivalence-and-inconsistencies': 'src/routes/archive/2023.OnOrbits.tsx',
  'towards-a-universal-language': 'src/routes/archive/2025.TowardsAUniversalLanguage.tsx',
  'the-orbitmines-minecraft-server': 'src/routes/archive/2026.MinecraftArchive.tsx',
};

// The page title is read at build time from the item's reference object in
// src/routes/references.tsx (the `title` belonging to the reference whose
// `link` is https://orbitmines.com/archive/<item>), so titles stay in sync
// with the source rather than being hand-duplicated here. The description is
// rendered by the paper itself (Post), so it isn't duplicated here.
function itemTitle(item: string): string | undefined {
  if (!ITEM_SOURCES[item]) return undefined;
  const src = fs.readFileSync(path.join(process.cwd(), 'src/routes/references.tsx'), 'utf8');
  const link = src.search(new RegExp(`link:\\s*["'\`]https://orbitmines\\.com/archive/${item}["'\`]`));
  if (link < 0) return undefined;
  const titles = [...src.slice(0, link).matchAll(/\btitle:\s*(["'`])((?:(?!\1)[^\\]|\\.)*)\1/g)];
  return titles.at(-1)?.[2];
}

export function generateStaticParams() {
  return Object.keys(ITEM_SOURCES).map((item) => ({ item }));
}

export const dynamicParams = false;

export async function generateMetadata(
  { params }: { params: Promise<{ item: string }> },
): Promise<Metadata> {
  const title = itemTitle((await params).item);
  return title ? { title } : {};
}

export default function Page() {
  return <ArchiveClient />;
}
