'use client';

import { Suspense } from 'react';
import Tournaments from './_components/tournaments';

/**
 * The list reads its page, search and filters from the URL, and
 * `useSearchParams` cannot be prerendered — without this boundary the build
 * fails on "should be wrapped in a suspense boundary".
 */
export default function TournamentsPage() {
  return (
    <Suspense fallback={null}>
      <Tournaments />
    </Suspense>
  );
}
