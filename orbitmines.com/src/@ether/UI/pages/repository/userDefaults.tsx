import React from 'react';
import {Helmet} from 'react-helmet';
import {PROFILES} from '../../../../routes/profiles/profiles';
import type {TProfile, ExternalProfile} from '../../../../lib/organizations/ORGANIZATIONS';
import {FadiShawkiBody} from '../../../../routes/profiles/fadi-shawki/FadiShawki';
import {Grid, value} from '../../../../lib/post/Post';
import {SOCIAL_PLATFORMS} from './icons';
import type {ProfileSocial} from './storage';

const PROFILE_BY_SLUG: Record<string, TProfile> = Object.values(PROFILES).reduce(
  (acc, p) => {
    if (p.profile) acc[p.profile] = p;
    return acc;
  },
  {} as Record<string, TProfile>,
);

const USER_CONTENT: Record<string, React.ReactNode> = {
  'fadi-shawki': (
    <Grid fluid style={{padding: 0, fontSize: '1.1rem'}}>
      <FadiShawkiBody />
    </Grid>
  ),
};

export function getUserContent(user: string): React.ReactNode | null {
  return USER_CONTENT[user] ?? null;
}

export function getProfileDefaults(user: string): TProfile | null {
  return PROFILE_BY_SLUG[user] ?? null;
}

const KNOWN_PLATFORM_IDS = new Set(SOCIAL_PLATFORMS.map((p) => p.id));

const stripUsername = (raw: string | undefined, fallbackLink: string): string => {
  const v = (raw ?? '').trim();
  if (v) return v.replace(/^@+/, '');
  try {
    const u = new URL(fallbackLink);
    const path = u.pathname.replace(/^\/+|\/+$/g, '');
    return path.split('/').pop() ?? '';
  } catch {
    return '';
  }
};

interface ProfileMetaProps {
  profile: TProfile;
  user: string;
}

export const ProfileMeta: React.FC<ProfileMetaProps> = ({profile, user}) => {
  const title = value(profile.title) ?? profile.name;
  const description = value(profile.subtitle) ?? '';
  const url = `https://orbitmines.com/@${user}`;
  const picture = profile.picture;

  return (
    <>
      <Helmet>
        <title lang="en">{title}</title>
        <meta name="description" content={description} />
      </Helmet>
      <Helmet>
        <meta property="og:type" content="profile" />
        <meta property="og:title" content={title} />
        <meta property="og:url" content={url} />
        <meta property="og:description" content={description} />
        {picture ? <meta property="og:image" content={picture} /> : null}
        {picture ? <meta property="og:image:alt" content="Profile picture" /> : null}
        {profile.first_name ? (
          <meta property="og:profile:first_name" content={profile.first_name} />
        ) : null}
        {profile.last_name ? (
          <meta property="og:profile:last_name" content={profile.last_name} />
        ) : null}
        {profile.profile ? (
          <meta property="og:profile:username" content={profile.profile} />
        ) : null}
      </Helmet>
      <Helmet>
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description} />
        {picture ? <meta property="twitter:image" content={picture} /> : null}
      </Helmet>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: profile.name,
            email: profile.email,
            givenName: profile.first_name,
            familyName: profile.last_name,
            url,
            image: picture,
            identifier: profile.orcid
              ? {'@type': 'PropertyValue', propertyID: 'ORCID', value: profile.orcid}
              : undefined,
            sameAs: profile.external?.map((e) => e.link),
          })}
        </script>
      </Helmet>
    </>
  );
};

export function externalToSocials(external: ExternalProfile[] | undefined): ProfileSocial[] {
  if (!external) return [];
  const out: ProfileSocial[] = [];
  for (const ext of external) {
    const key = ext.organization?.key;
    if (!key || !KNOWN_PLATFORM_IDS.has(key)) continue;
    const username = stripUsername(ext.display, ext.link);
    if (!username) continue;
    out.push({platform: key, username});
  }
  return out;
}
