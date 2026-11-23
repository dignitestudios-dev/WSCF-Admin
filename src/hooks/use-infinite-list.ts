import { useInfiniteQuery } from '@tanstack/react-query';

/** Every list loads this many rows at a time. */
export const LIST_BATCH_SIZE = 20;

interface PaginationInfo {
  totalPages?: number;
}

// Most endpoints return `pagination` at the top level; the users list nests it
// under `data`. Reading both here keeps every caller from repeating the choice.
const defaultPagination = (page: unknown): PaginationInfo | undefined => {
  const envelope = page as {
    pagination?: PaginationInfo;
    data?: { pagination?: PaginationInfo };
  };
  return envelope?.pagination ?? envelope?.data?.pagination;
};

/**
 * A list that grows as it is scrolled, one batch at a time.
 *
 * Replaces the page-number queries the lists used to run. The API is unchanged
 * — it still answers `page` and `limit` — so this just asks for page 1, then
 * page 2 when the reader nears the bottom, and so on until the server says
 * there are no more.
 *
 * Callers read the rows with `data.pages.flatMap(...)`, and the total from the
 * first page's pagination block.
 */
export function useInfiniteList<TPage>({
  queryKey,
  fetchPage,
  getPagination = defaultPagination,
  enabled = true,
  refetchInterval,
  refetchOnWindowFocus,
}: {
  /** Must include every parameter that changes the result (search, filters). */
  queryKey: readonly unknown[];
  fetchPage: (page: number) => Promise<TPage>;
  /** Defaults to `page.pagination`, or `page.data.pagination` for the older envelope. */
  getPagination?: (page: TPage) => PaginationInfo | undefined;
  enabled?: boolean;
  refetchInterval?: number;
  refetchOnWindowFocus?: boolean;
}) {
  return useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => fetchPage(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      const totalPages = getPagination(lastPage)?.totalPages ?? 1;
      return lastPageParam < totalPages ? lastPageParam + 1 : undefined;
    },
    enabled,
    refetchInterval,
    refetchOnWindowFocus,
  });
}
