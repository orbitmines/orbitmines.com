import type { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import ArchiveClient from './ArchiveClient';

// Each archive slug maps to its source component (mirrors ITEMS in
// src/routes/Archive.tsx). The page title is read from that file's first
// `title: "..."` literal at build time, so titles stay in sync with the source
// rather than being hand-duplicated here.
export const ITEM_SOURCES: Record<string, string> = {
  '2024-02-orbitmines-as-a-game-project': 'src/routes/archive/2024.02.OrbitMines_as_a_Game_Project.tsx',
  'on-intelligibility': 'src/routes/archive/2022.OnIntelligibility.tsx',
  'on-orbits-equivalence-and-inconsistencies': 'src/routes/archive/2023.OnOrbits.tsx',
  'towards-a-universal-language': 'src/routes/archive/2025.TowardsAUniversalLanguage.tsx',
  'the-orbitmines-minecraft-server': 'src/routes/archive/2026.MinecraftArchive.tsx',
};

// Reads the reference object's `title` literal so the static <title> is owned
// by Next metadata. The description is rendered by the paper itself (Post),
// so it isn't duplicated here.
function itemTitle(item: string): string | undefined {
  const source = ITEM_SOURCES[item];
  if (!source) return undefined;
  const src = fs.readFileSync(path.join(process.cwd(), source), 'utf8');
  return src.match(/title:\s*"((?:[^"\\]|\\.)*)"/)?.[1];
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
