'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Legacy /papers/* URL space — redirect into /archive/* keeping the suffix.
export default function PapersRedirect() {
  const router = useRouter();

  useEffect(() => {
    const suffix = window.location.pathname.replace(/^\/papers\/?/, '');
    router.replace(`/archive/${suffix}`);
  }, [router]);

  return null;
}
