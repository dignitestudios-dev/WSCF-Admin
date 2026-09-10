'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface PaginationProps {
  currentPage: number;
  totalPages?: number;
  onPageChange: (page: number) => void;
  className?: string;
  /** Hide the "go to page" box on tight layouts. */
  showJump?: boolean;
}

/** Marks a run of hidden pages. Not a page, so it is never clickable. */
const GAP = 'gap' as const;
type Slot = number | typeof GAP;

/**
 * The pages worth showing: always the first and last, always the current one
 * and its immediate neighbours, and an ellipsis for whatever that skips.
 *
 * This used to render every page as a button. Past a handful of pages the row
 * outgrew the pill it sits in and ran off the side of the screen, which put
 * the arrows out of reach — so with a lot of records you could not page at all.
 * The window keeps it to at most seven slots however many pages there are.
 */
export function pageSlots(currentPage: number, totalPages: number): Slot[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const slots: Slot[] = [1];

  // One page either side of the current one — but nudged inward at the ends so
  // the first and last pages still show three numbers rather than trailing off
  // into an ellipsis straight away.
  const from = Math.max(2, Math.min(currentPage - 1, totalPages - 3));
  const to = Math.min(totalPages - 1, Math.max(currentPage + 1, 4));

  // A gap hiding a single page is pointless — it takes the same room as the
  // page it hides, so show the page instead.
  if (from > 3) slots.push(GAP);
  else if (from === 3) slots.push(2);

  for (let page = from; page <= to; page += 1) slots.push(page);

  if (to < totalPages - 2) slots.push(GAP);
  else if (to === totalPages - 2) slots.push(totalPages - 1);

  slots.push(totalPages);
  return slots;
}

export function Pagination({
  currentPage,
  totalPages = 1,
  onPageChange,
  className = '',
  showJump = true,
}: PaginationProps) {
  const [jump, setJump] = useState('');

  // Paging by arrow or number should clear a half-typed jump, otherwise the
  // box keeps showing a page the reader has already moved away from.
  useEffect(() => setJump(''), [currentPage]);

  if (totalPages < 1) return null;

  const slots = pageSlots(currentPage, totalPages);

  /**
   * Goes to whatever is in the box.
   *
   * The field refuses out-of-range input as it is typed, so this should always
   * receive something valid; the clamp stays as a backstop for anything that
   * reaches the value without a keystroke, such as browser autofill.
   */
  const goToTyped = () => {
    const wanted = Number.parseInt(jump.trim(), 10);
    if (!Number.isFinite(wanted)) {
      setJump('');
      return;
    }

    const target = Math.min(Math.max(wanted, 1), totalPages);
    setJump('');
    if (target !== currentPage) onPageChange(target);
  };

  return (
    <div
      className={`min-w-[299px] h-[61px] bg-white border border-[#DADADA]/20 shadow-lg rounded-[100px] flex items-center justify-between gap-3 px-4 ${className}`}
    >
      {/* Previous */}
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        aria-label="Previous page"
        className="w-[38px] h-[38px] bg-[#083F92]/10 text-[#083F92] rounded-full flex items-center justify-center hover:bg-[#083F92]/20 transition-colors disabled:opacity-40 disabled:text-[#919191] shrink-0"
      >
        <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
      </button>

      {/* Page numbers */}
      <div className="flex items-center bg-[#083F92]/10 h-[38px] rounded-[88px] px-1 shrink-0 relative">
        {slots.map((slot, index) =>
          slot === GAP ? (
            <span
              key={`gap-${index}`}
              aria-hidden="true"
              className="font-poppins font-bold text-[14px] text-[#636363] w-[24px] h-[32px] flex items-end justify-center pb-1 select-none"
            >
              …
            </span>
          ) : (
            <button
              key={slot}
              type="button"
              onClick={() => onPageChange(slot)}
              aria-label={`Page ${slot}`}
              aria-current={slot === currentPage ? 'page' : undefined}
              className={`relative font-poppins font-bold text-[14px] flex items-center justify-center transition-colors mx-0.5 rounded-full w-[32px] h-[32px] shrink-0 ${
                slot === currentPage
                  ? 'text-white'
                  : 'text-[#636363] hover:text-[#083F92]'
              }`}
            >
              {slot === currentPage && (
                <motion.div
                  layoutId="activePaginationPill"
                  className="absolute inset-0 bg-[#083F92] rounded-full"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{slot}</span>
            </button>
          )
        )}
      </div>

      {/* Next */}
      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        aria-label="Next page"
        className="w-[38px] h-[38px] bg-[#083F92]/10 text-[#083F92] rounded-full flex items-center justify-center hover:bg-[#083F92]/20 transition-colors disabled:opacity-40 disabled:text-[#919191] shrink-0"
      >
        <ChevronRight className="w-5 h-5 stroke-[2.5]" />
      </button>

      {/* Go to page — only earns its space once paging by hand is tedious */}
      {showJump && totalPages > 7 && (
        <div className="flex items-center gap-2 pl-1 shrink-0">
          <label
            htmlFor="pagination-jump"
            className="font-poppins text-[13px] text-[#636363] whitespace-nowrap"
          >
            Go to
          </label>
          <input
            id="pagination-jump"
            type="text"
            inputMode="numeric"
            value={jump}
            placeholder={String(currentPage)}
            aria-label={`Go to page, 1 to ${totalPages}`}
            maxLength={String(totalPages).length}
            onChange={(e) => {
              // Out-of-range input is refused as it is typed, so a page that
              // does not exist can never appear in the box. Typing 4 then 5
              // against a 42-page list simply leaves the 5 off; clearing the
              // box and starting again always works.
              const digits = e.target.value.replace(/[^0-9]/g, '');
              if (digits === '') {
                setJump('');
                return;
              }
              const wanted = Number.parseInt(digits, 10);
              if (wanted < 1 || wanted > totalPages) return;
              setJump(digits);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                goToTyped();
              }
            }}
            onBlur={goToTyped}
            className="w-[52px] h-[34px] rounded-[17px] bg-[#083F92]/10 text-center font-poppins font-medium text-[14px] text-[#083F92] outline-none placeholder:text-[#9AA6B2] placeholder:font-normal focus-visible:ring-2 focus-visible:ring-[#083F92]/40"
          />
          <span className="font-poppins text-[13px] text-[#9AA6B2] whitespace-nowrap">
            of {totalPages}
          </span>
        </div>
      )}
    </div>
  );
}
