'use client';

import { useMemo, useState } from 'react';
import { Check, Highlighter, Search, X } from 'lucide-react';
import type {
  PlayerHighlight,
  PreviewDivision,
} from '../services/result.service';

/**
 * Singling out players on the results document.
 *
 * The federation's sheets have always marked a handful of players for reasons
 * the standings alone do not show — a scholarship, an upset, a Grand Prix
 * placing. Their row is shaded and the reason is spelled out in a key along
 * the foot of the page.
 *
 * Tagging works like a highlighter pen: pick a reason once, then click the
 * players it applies to. Marking six scholarship winners is six clicks rather
 * than six trips through a dropdown.
 */

/** The reasons WSCF has always marked. Anything else is typed in. */
const PRESET_LABELS = ['Scholarship Winner', 'Upset Winner', 'Grand Prix'];

export function PlayerHighlightPanel({
  divisions,
  value,
  onChange,
  disabled,
}: {
  divisions: PreviewDivision[];
  value: PlayerHighlight[];
  onChange: (next: PlayerHighlight[]) => void;
  disabled?: boolean;
}) {
  const [activeLabel, setActiveLabel] = useState(PRESET_LABELS[0]);
  const [customLabel, setCustomLabel] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [query, setQuery] = useState('');

  const label = (isCustom ? customLabel : activeLabel).trim();

  /**
   * Every player in the upload, once.
   *
   * Notes are attached by name, so a name listed in two divisions is one entry
   * here — tagging it would shade it in both, which is the only thing the
   * document can express.
   */
  const players = useMemo(() => {
    const seen = new Map<string, { name: string; where: string[] }>();

    for (const division of divisions) {
      for (const player of division.players) {
        // A player left off the document cannot carry a note on it.
        if (player.hidden) continue;

        const entry = seen.get(player.name);
        if (entry) {
          if (!entry.where.includes(division.divisionLabel)) {
            entry.where.push(division.divisionLabel);
          }
        } else {
          seen.set(player.name, {
            name: player.name,
            where: [division.divisionLabel],
          });
        }
      }
    }

    return [...seen.values()].sort((a, b) =>
      a.name.localeCompare(b.name, 'en', { sensitivity: 'base' })
    );
  }, [divisions]);

  const labelByName = useMemo(
    () => new Map(value.map((entry) => [entry.name, entry.label])),
    [value]
  );

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return players;
    return players.filter((player) =>
      player.name.toLowerCase().includes(needle)
    );
  }, [players, query]);

  const toggle = (name: string) => {
    const current = labelByName.get(name);

    // Clicking a player who already carries this exact note takes it off, so
    // the same click both tags and untags.
    if (current === label) {
      onChange(value.filter((entry) => entry.name !== name));
      return;
    }

    if (!label) return;

    onChange([
      ...value.filter((entry) => entry.name !== name),
      { name, label },
    ]);
  };

  return (
    <div className="flex flex-col gap-4 rounded-[12px] bg-[#083F92]/10 p-5">
      <div className="flex flex-col gap-1">
        <h3 className="flex items-center gap-2 font-poppins text-[16px] font-bold text-[#083F92]">
          <Highlighter className="h-4 w-4" />
          Highlight players
          <span className="font-normal text-[#8C8C8C]">(optional)</span>
        </h3>
        <p className="font-poppins text-[11px] leading-4 text-[#636363]">
          Pick a reason, then click the players it applies to. Their row is
          shaded on the document and the reason is printed in a key at the
          bottom of the page. Colours are chosen automatically.
        </p>
      </div>

      {/* The pen: which reason the next click applies. */}
      <div className="flex flex-wrap items-center gap-2">
        {PRESET_LABELS.map((preset) => {
          const isActive = !isCustom && activeLabel === preset;
          return (
            <button
              key={preset}
              type="button"
              disabled={disabled}
              onClick={() => {
                setIsCustom(false);
                setActiveLabel(preset);
              }}
              className={`h-9 cursor-pointer rounded-full border px-4 font-poppins text-[12px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                isActive
                  ? 'border-[#083F92] bg-[#083F92] text-white'
                  : 'border-[#3D3775]/40 bg-white text-[#565656] hover:border-[#083F92]'
              }`}
            >
              {preset}
            </button>
          );
        })}

        {isCustom ? (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={customLabel}
              disabled={disabled}
              placeholder="Type a reason"
              onChange={(event) => setCustomLabel(event.target.value)}
              className="h-9 w-[180px] rounded-full border border-[#083F92] bg-white px-4 font-poppins text-[12px] text-[#181818] outline-none focus:ring-2 focus:ring-[#083F92]/15"
            />
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                setIsCustom(false);
                setCustomLabel('');
              }}
              aria-label="Cancel custom reason"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#DADADA] bg-white text-[#636363] transition-colors hover:bg-[#F3F3F3]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={disabled}
            onClick={() => setIsCustom(true)}
            className="h-9 cursor-pointer rounded-full border border-dashed border-[#3D3775]/50 bg-white px-4 font-poppins text-[12px] font-medium text-[#565656] transition-colors hover:border-[#083F92] hover:text-[#083F92] disabled:cursor-not-allowed disabled:opacity-50"
          >
            + Other
          </button>
        )}
      </div>

      {/* What has been tagged so far, so it can be checked and undone. */}
      {value.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {value.map((entry) => (
            <span
              key={entry.name}
              className="flex items-center gap-2 rounded-full border border-[#083F92]/30 bg-white py-1 pl-3 pr-1 font-poppins text-[12px] text-[#181818]"
            >
              <span className="font-medium">{entry.name}</span>
              <span className="text-[#8C8C8C]">{entry.label}</span>
              <button
                type="button"
                disabled={disabled}
                onClick={() =>
                  onChange(value.filter((item) => item.name !== entry.name))
                }
                aria-label={`Remove note from ${entry.name}`}
                className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full text-[#B42318] transition-colors hover:bg-[#FDECEA]"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C8C8C]" />
          <input
            value={query}
            disabled={disabled}
            placeholder={`Search ${players.length} players by name`}
            onChange={(event) => setQuery(event.target.value)}
            className="h-10 w-full rounded-full border border-[#3D3775] bg-white pl-11 pr-4 font-poppins text-[13px] text-[#181818] outline-none focus:ring-2 focus:ring-[#083F92]/15 disabled:opacity-60"
          />
        </div>

        <div className="max-h-[240px] overflow-y-auto rounded-[12px] border border-[#DADADA] bg-white">
          {matches.length === 0 ? (
            <p className="px-4 py-6 text-center font-poppins text-[12px] text-[#8C8C8C]">
              No players match “{query}”.
            </p>
          ) : (
            matches.map((player) => {
              const note = labelByName.get(player.name);

              return (
                <button
                  key={player.name}
                  type="button"
                  disabled={disabled || !label}
                  onClick={() => toggle(player.name)}
                  className="flex w-full cursor-pointer items-center gap-3 border-b border-[#F1F1F1] px-4 py-2.5 text-left transition-colors last:border-b-0 hover:bg-[#083F92]/5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                      note
                        ? 'border-[#083F92] bg-[#083F92] text-white'
                        : 'border-[#C9C9C9] bg-white'
                    }`}
                  >
                    {note ? <Check className="h-3 w-3 stroke-[3]" /> : null}
                  </span>

                  <span className="min-w-0 flex-1 truncate font-poppins text-[13px] text-[#181818]">
                    {player.name}
                  </span>

                  <span className="shrink-0 font-poppins text-[11px] text-[#8C8C8C]">
                    {player.where.join(', ')}
                  </span>

                  {note ? (
                    <span className="shrink-0 rounded-full bg-[#F7F6FF] px-2 py-0.5 font-poppins text-[10px] font-semibold text-[#083F92]">
                      {note}
                    </span>
                  ) : null}
                </button>
              );
            })
          )}
        </div>

        {!label ? (
          <p className="font-poppins text-[11px] text-[#B54708]">
            Type a reason before choosing players.
          </p>
        ) : null}
      </div>
    </div>
  );
}
