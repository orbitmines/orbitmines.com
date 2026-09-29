'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

// /profiles/:profile redirects to /@:profile. Server-side redirect would be
// nicer, but `output: 'export'` has no server, so we do it on the client
// immediately on mount.
export default function ProfileRedirect() {
  const params = useParams<{ profile: string }>();
  const router = useRouter();

  useEffect(() => {
    if (params?.profile) router.replace(`/@${params.profile}`);
  }, [params, router]);

  return null;
}
