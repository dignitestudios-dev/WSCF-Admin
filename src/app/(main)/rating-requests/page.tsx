'use client';

import { Suspense } from 'react';
import RatingRequests from './_components/rating-requests';

/**
 * The list reads its tab, page and search from the URL, and `useSearchParams`
 * cannot be prerendered — without this boundary the build fails on
 * "should be wrapped in a suspense boundary".
 */
export default function RatingRequestsPage() {
  return (
    <Suspense fallback={null}>
      <RatingRequests />
    </Suspense>
  );
}
