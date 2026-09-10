'use client';

import { Suspense } from 'react';
import Membership from './_components/membership';

/**
 * The list reads its page, search and filters from the URL, and
 * `useSearchParams` cannot be prerendered — without this boundary the build
 * fails on "should be wrapped in a suspense boundary".
 */
export default function MembershipPage() {
  return (
    <Suspense fallback={null}>
      <Membership />
    </Suspense>
  );
}
