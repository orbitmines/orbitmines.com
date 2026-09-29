import type { Metadata } from 'next';
import ThumbnailClient from './ThumbnailClient';

export const metadata: Metadata = { title: 'Thumbnail' };

export default function Page() {
  return <ThumbnailClient />;
}
