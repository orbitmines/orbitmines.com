import CatchAllClient from './CatchAllClient';
import { PROFILE_NAMES } from '../profiles/[profile]/page';
import loreData from '../../src/lore/generated/lore.json';

// Enumerate the lore reader URLs so /lore/... is directly loadable (dev) and
// prerendered (prod) — otherwise dynamicParams=false would 404 these. All
// render the same client SPA; deeper state (?p, ?entity) is client-side only.
function loreParams() {
  const params: { path: string[] }[] = [
    { path: ['lore'] },
    { path: ['lore', 'edit'] },
  ];
  for (const id of Object.keys(loreData.books)) {
    params.push({ path: ['lore', id] });
    params.push({ path: ['lore', id, 'read'] });
    params.push({ path: ['lore', id, 'codex'] });
  }
  return params;
}

export function generateStaticParams() {
  return [
    { path: ['_catchall'] },
    ...Object.keys(PROFILE_NAMES).map((handle) => ({ path: [`@${handle}`] })),
    ...loreParams(),
  ];
}

export const dynamicParams = false;

export default function Page() {
  return <CatchAllClient />;
}
