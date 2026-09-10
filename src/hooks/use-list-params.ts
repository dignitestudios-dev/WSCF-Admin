'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/use-debounce';

/**
 * Keeps a list's page, search and filters in the URL.
 *
 * Before this each screen held them in `useState`, so they were gone the
 * moment you opened a record and came back — an admin working through page 7
 * of a filtered list lost their place on every visit, and the URL could not be
 * bookmarked or shared.
 *
 * The URL is the single source of truth. Only the search box keeps local state,
 * because a URL rewritten on every keystroke would fill the history and refetch
 * per character; the debounced value is what reaches the address bar.
 *
 * Defaults are omitted from the URL rather than written out, so an untouched
 * list stays on a clean path.
 */
export function useListParams({
  defaultFilters = {} as Record<string, string>,
  debounceMs = 500,
} = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlSearch = searchParams.get('search') ?? '';
  const page = Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1);

  const [searchInput, setSearchInput] = useState(urlSearch);
  const debouncedSearch = useDebounce(searchInput, debounceMs);

  /** Writes the given keys, dropping any that match their default. */
  const write = (next: Record<string, string | number | null | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, raw] of Object.entries(next)) {
      const value = raw === null || raw === undefined ? '' : String(raw);
      const isDefault =
        !value || value === defaultFilters[key] || (key === 'page' && value === '1');

      if (isDefault) params.delete(key);
      else params.set(key, value);
    }

    const query = params.toString();
    // replace, not push: paging is not something the back button should walk.
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  // Typing settles, then the URL catches up. Guarded so the first render of a
  // page opened from a bookmark does not immediately rewrite its own URL.
  useEffect(() => {
    if (debouncedSearch !== urlSearch) write({ search: debouncedSearch, page: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // A back/forward that changes the search must be reflected in the box.
  useEffect(() => {
    setSearchInput((current) => (current === urlSearch ? current : urlSearch));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlSearch]);

  return {
    page,
    // Accepts a functional updater so it drops straight into call sites that
    // were written against useState, e.g. setPage((p) => p - 1).
    setPage: (next: number | ((prev: number) => number)) =>
      write({ page: typeof next === 'function' ? next(page) : next }),

    /** Bind to the input. */
    searchInput,
    setSearchInput,
    /** Pass this to the query — it is the settled value. */
    search: debouncedSearch,

    getFilter: (key: string) => searchParams.get(key) ?? defaultFilters[key] ?? '',
    /** Changing a filter always returns to page 1; page 7 of the old filter is meaningless. */
    setFilter: (key: string, value: string) => write({ [key]: value, page: null }),
  };
}
