import type { Metadata } from 'next';
import ProfileRedirect from './ProfileRedirect';

const PROFILE_NAMES: Record<string, string> = {
  'fadi-shawki': 'Fadi Shawki',
};

export function generateStaticParams() {
  return Object.keys(PROFILE_NAMES).map((profile) => ({ profile }));
}

export const dynamicParams = false;

export async function generateMetadata(
  { params }: { params: Promise<{ profile: string }> },
): Promise<Metadata> {
  const name = PROFILE_NAMES[(await params).profile];
  return name ? { title: name } : {};
}

export default function Page() {
  return <ProfileRedirect />;
}
