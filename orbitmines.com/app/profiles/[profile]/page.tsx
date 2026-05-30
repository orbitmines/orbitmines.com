import ProfileRedirect from './ProfileRedirect';

const KNOWN_PROFILES = ['fadi-shawki'];

export function generateStaticParams() {
  return KNOWN_PROFILES.map((profile) => ({ profile }));
}

export const dynamicParams = false;

export default function Page() {
  return <ProfileRedirect />;
}
