'use client';

interface HighlightProps {
  /** The cell's text. Undefined and null render as nothing. */
  text?: string | null;
  /** The active search term. Empty means render the text untouched. */
  query?: string;
  className?: string;
}

/** Regex metacharacters in a search box are literal text, not syntax. */
function escapeForRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Marks where a search term appears in a value.
 *
 * Only used on the fields the API actually searches — highlighting a column
 * the query never looked at would suggest a match that is not why the row came
 * back.
 *
 * Splitting on a capturing group returns alternating pieces: even indexes are
 * the text between matches, odd indexes are the matches themselves. That is
 * why the parts are keyed off position rather than re-testing each one, which
 * would carry the regex's `lastIndex` between calls and skip matches.
 */
export function Highlight({ text, query, className = '' }: HighlightProps) {
  const value = text ?? '';
  const term = query?.trim() ?? '';

  if (!term || !value) return <span className={className}>{value}</span>;

  const parts = String(value).split(new RegExp(`(${escapeForRegex(term)})`, 'gi'));

  // No match: one part back, nothing to mark.
  if (parts.length === 1) return <span className={className}>{value}</span>;

  return (
    <span className={className}>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <mark
            key={index}
            className="bg-[#FDE68A]/70 text-inherit rounded-[2px] px-[1px]"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
}
