import type { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import ArchiveClient from './ArchiveClient';

// Each archive slug maps to its source component (mirrors ITEMS in
// src/routes/Archive.tsx). The page title is read from that file's first
// `title: "..."` literal at build time, so titles stay in sync with the source
// rather than being hand-duplicated here.
const ITEM_SOURCES: Record<string, string> = {
  '2025-09-ngi-grant-proposal': 'src/routes/archive/2025.09.NGI.GrantProposal3.tsx',
  '2024-02-ngi-grant-proposal': 'src/routes/archive/2024.02.NGI.GrantProposal.tsx',
  '2024-02-orbitmines-as-a-game-project': 'src/routes/archive/2024.02.OrbitMines_as_a_Game_Project.tsx',
  'on-intelligibility': 'src/routes/archive/2022.OnIntelligibility.tsx',
  'on-orbits-equivalence-and-inconsistencies': 'src/routes/archive/2023.OnOrbits.tsx',
  'towards-a-universal-language': 'src/routes/archive/2025.TowardsAUniversalLanguage.tsx',
  'the-orbitmines-minecraft-server': 'src/routes/archive/2026.MinecraftArchive.tsx',
};

// Reads the reference object's `title` and its adjacent `subtitle` literal
// (the same pair the rendered paper uses for its title/description) so the
// static <title> and <meta name="description"> are owned by Next metadata
// rather than duplicated by a client-hoisted tag.
function itemMeta(item: string): { title?: string; description?: string } {
  const source = ITEM_SOURCES[item];
  if (!source) return {};
  const src = fs.readFileSync(path.join(process.cwd(), source), 'utf8');
  const m = src.match(
    /title:\s*"((?:[^"\\]|\\.)*)"\s*,\s*subtitle:\s*"((?:[^"\\]|\\.)*)"/,
  );
  return { title: m?.[1], description: m?.[2] || undefined };
}

export function generateStaticParams() {
  return Object.keys(ITEM_SOURCES).map((item) => ({ item }));
}

export const dynamicParams = false;

export async function generateMetadata(
  { params }: { params: Promise<{ item: string }> },
): Promise<Metadata> {
  const { title, description } = itemMeta((await params).item);
  const meta: Metadata = {};
  if (title) meta.title = title;
  if (description) meta.description = description;
  return meta;
}

export default function Page() {
  return <ArchiveClient />;
}
