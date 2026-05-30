'use client';

import dynamic from 'next/dynamic';

const EtherOrMinimap = dynamic(
  () => import('../../src/@ether/UI/router/EtherOrMinimap'),
  { ssr: false },
);

export default function CatchAllClient() {
  return <EtherOrMinimap />;
}
