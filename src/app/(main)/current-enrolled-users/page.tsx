'use client';

import { Suspense } from 'react';
import CurrentEnrolledUsers from './_components/current-enrolled-users';

/**
 * The list reads its page, search and filters from the URL, and
 * `useSearchParams` cannot be prerendered — without this boundary the build
 * fails on "should be wrapped in a suspense boundary".
 */
export default function CurrentEnrolledUsersPage() {
  return (
    <Suspense fallback={null}>
      <CurrentEnrolledUsers />
    </Suspense>
  );
}
