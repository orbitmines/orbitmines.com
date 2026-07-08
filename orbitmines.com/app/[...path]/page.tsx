import CatchAllClient from './CatchAllClient';
import { PROFILE_NAMES } from '../profiles/[profile]/page';
export function generateStaticParams() {
  return [
    { path: ['_catchall'] },
    ...Object.keys(PROFILE_NAMES).map((handle) => ({ path: [`@${handle}`] })),
  ];
}

export const dynamicParams = false;

export default function Page() {
  return <CatchAllClient />;
}
