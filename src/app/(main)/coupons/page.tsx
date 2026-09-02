'use client';

import { Suspense } from 'react';
import Coupons from './_components/coupons';

/**
 * The list reads its page, search and filters from the URL, and
 * `useSearchParams` cannot be prerendered — without this boundary the build
 * fails on "should be wrapped in a suspense boundary".
 */
export default function CouponsPage() {
  return (
    <Suspense fallback={null}>
      <Coupons />
    </Suspense>
  );
}
