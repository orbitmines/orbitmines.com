import ArchiveClient from './ArchiveClient';

const ITEMS = [
  '2025-09-ngi-grant-proposal',
  '2024-02-ngi-grant-proposal',
  '2024-02-orbitmines-as-a-game-project',
  'on-intelligibility',
  'on-orbits-equivalence-and-inconsistencies',
  'towards-a-universal-language',
  'the-orbitmines-minecraft-server',
];

export function generateStaticParams() {
  return ITEMS.map((item) => ({ item }));
}

export const dynamicParams = false;

export default function Page() {
  return <ArchiveClient />;
}
