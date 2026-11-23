'use client';

import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

interface InfiniteScrollFooterProps {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => unknown;
  /** Rows currently on screen; used to say how many there are at the end. */
  itemCount: number;
  /** Singular noun for the end-of-list line, e.g. "user". */
  label?: string;
  className?: string;
}

/** The nearest ancestor that scrolls vertically, or null for the page itself. */
function findScrollParent(node: HTMLElement | null): HTMLElement | null {
  let current = node?.parentElement ?? null;

  while (current) {
    const { overflowY } = getComputedStyle(current);
    if (overflowY === 'auto' || overflowY === 'scroll') return current;
    current = current.parentElement;
  }

  return null;
}

/**
 * The bottom of an infinitely scrolling list.
 *
 * Loads the next batch before the reader gets there — the trigger sits 600px
 * below the last row — so scrolling feels continuous instead of stopping at
 * the end to wait. While a batch is on its way it shows a quiet spinner, and
 * once everything is loaded it says so.
 */
export function InfiniteScrollFooter({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  itemCount,
  label = 'item',
  className = '',
}: InfiniteScrollFooterProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Re-attached after every batch. An observer only reports when visibility
  // *changes*, so if a batch still leaves the sentinel on screen (a tall
  // monitor, or a batch of short rows) nothing would ever ask for the next
  // one. Observing again makes the browser report the current state.
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasNextPage || isFetchingNextPage) return;

    // When the list scrolls inside its own box, that box is the root: the
    // margin below only reaches past the edge of the root, so with the page as
    // the root the trigger would never fire until the last row was in view.
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) fetchNextPage();
      },
      { root: findScrollParent(node), rootMargin: '0px 0px 600px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, itemCount]);

  return (
    <div
      className={`flex w-full flex-col items-center justify-center py-5 font-poppins text-[12px] text-[#8C8C8C] ${className}`}
    >
      {/* The trigger line itself; takes no space. */}
      <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />

      {isFetchingNextPage ? (
        <span className="flex items-center gap-2" role="status">
          <Loader2 className="h-4 w-4 animate-spin text-[#083F92]" />
          Loading more...
        </span>
      ) : !hasNextPage && itemCount > 0 ? (
        <span>
          Showing all {itemCount.toLocaleString('en-US')} {label}
          {itemCount === 1 ? '' : 's'}
        </span>
      ) : null}
    </div>
  );
}
