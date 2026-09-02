'use client';

import { Suspense } from 'react';
import Teams from './_components/teams';

/**
 * The list reads its page, search and filters from the URL, and
 * `useSearchParams` cannot be prerendered — without this boundary the build
 * fails on "should be wrapped in a suspense boundary".
 */
export default function TeamsPage() {
  return (
    <Suspense fallback={null}>
      <Teams />
    </Suspense>
  );
}
