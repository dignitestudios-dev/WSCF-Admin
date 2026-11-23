'use client';

import { FileText, Trophy, Users } from 'lucide-react';
import { ResultReportPanel } from './result-report';
import type { ResultPreview } from '../services/result.service';

/**
 * What publishing will do, shown before it is done.
 *
 * The two numbers that matter most are how many players we recognised and how
 * many we did not — an unrecognised player still appears in the document, but
 * no rating of ours moves for them. Saying so here is the difference between
 * an admin noticing a mis-typed name now and discovering it after the ratings
 * have already been replaced.
 */
export function ResultPreviewPanel({ preview }: { preview: ResultPreview }) {
  return (
    <div className="flex flex-col gap-5">
      {/* Counts and the cards for anyone who needs a second look; the same
          panel is shown again once the results are published. */}
      <ResultReportPanel report={preview.report} />

      {preview.attachments.length > 0 ? (
        <div className="flex flex-col gap-2 rounded-[12px] border border-[#DADADA] bg-white px-5 py-4">
          <p className="font-poppins text-[13px] font-semibold text-[#181818]">
            Extra pages at the back —{' '}
            {preview.attachments.reduce((sum, a) => sum + a.pageCount, 0)} page(s)
          </p>
          {preview.attachments.map((attachment, index) => (
            <div
              key={`${attachment.name}-${index}`}
              className="flex items-center gap-3 font-poppins text-[12px] text-[#565656]"
            >
              <FileText className="h-3.5 w-3.5 shrink-0 text-[#083F92]" />
              <span className="min-w-0 flex-1 truncate">{attachment.name}</span>
              <span className="shrink-0 text-[#8C8C8C]">
                {attachment.pageCount} page(s)
              </span>
            </div>
          ))}
        </div>
      ) : null}

      {preview.divisions.map((division) => (
        <div
          key={division.divisionId}
          className="overflow-hidden rounded-[24px] border border-[#DADADA] bg-white"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EFEFEF] px-5 py-4">
            <div className="flex min-w-0 max-w-full flex-wrap items-center gap-x-3 gap-y-1">
              <span className="max-w-full rounded-[16px] bg-[#083F92] px-3 py-1 font-poppins text-[13px] font-bold text-white break-words [overflow-wrap:anywhere]">
                {division.divisionLabel}
              </span>
              <span className="font-poppins text-[12px] text-[#8C8C8C]">
                {division.printedCount} players
                {division.printedCount < division.playerCount
                  ? ` (+${division.playerCount - division.printedCount} withdrawn)`
                  : ''}{' '}
                · {division.teamCount} teams · {division.roundLabels.length} rounds
              </span>
            </div>

            <div className="flex items-center gap-4 font-poppins text-[12px] text-[#565656]">
              <span className="flex items-center gap-1.5">
                <Trophy className="h-3.5 w-3.5 text-[#083F92]" />
                {division.individualTrophyCount} individual
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-[#083F92]" />
                {division.teamTrophyCount} team
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-0 lg:grid-cols-2">
            {/* Only the trophy places are listed. The full standings run to
                dozens of rows and are already in the file the admin just
                chose — what needs checking here is who wins. */}
            <div className="border-b border-[#EFEFEF] p-5 lg:border-b-0 lg:border-r">
              <p className="mb-3 font-poppins text-[13px] font-semibold text-[#181818]">
                Individual trophy winners
              </p>

              {division.players.filter((p) => p.trophyPlace).length === 0 ? (
                <p className="font-poppins text-[12px] text-[#8C8C8C]">
                  No trophies for this division.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {division.players
                    .filter((player) => player.trophyPlace)
                    .map((player) => (
                      <div
                        key={`${player.place}-${player.name}`}
                        className="flex items-center gap-3 rounded-[12px] bg-[#F7F6FF] px-3 py-2"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#083F92] font-poppins text-[11px] font-bold text-white">
                          {player.trophyPlace}
                        </span>
                        <span className="min-w-0 flex-1 truncate font-poppins text-[13px] font-medium text-[#181818]">
                          {player.name}
                        </span>
                        <span className="font-poppins text-[12px] text-[#565656]">
                          {player.points} pts · {player.rating ?? 'unrated'}
                        </span>
                        {player.highlightLabel ? (
                          <span className="shrink-0 rounded-full bg-[#F7F6FF] px-2 py-0.5 font-poppins text-[10px] font-semibold text-[#083F92]">
                            {player.highlightLabel}
                          </span>
                        ) : null}
                        {!player.matched ? (
                          <span className="shrink-0 rounded-full bg-[#FFF4E5] px-2 py-0.5 font-poppins text-[10px] font-semibold text-[#B54708]">
                            not on system
                          </span>
                        ) : null}
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="p-5">
              <p className="mb-3 font-poppins text-[13px] font-semibold text-[#181818]">
                Team trophy winners
              </p>

              {division.teams.filter((t) => t.trophyPlace).length === 0 ? (
                <p className="font-poppins text-[12px] text-[#8C8C8C]">
                  No trophies for this division.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {division.teams
                    .filter((team) => team.trophyPlace)
                    .map((team) => (
                      <div
                        key={team.teamCode}
                        className="flex items-center gap-3 rounded-[12px] bg-[#F7F6FF] px-3 py-2"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#083F92] font-poppins text-[11px] font-bold text-white">
                          {team.trophyPlace}
                        </span>
                        <span className="min-w-0 flex-1 truncate font-poppins text-[13px] font-medium text-[#181818]">
                          {team.teamName}
                        </span>
                        <span className="font-poppins text-[12px] text-[#565656]">
                          {team.score}
                        </span>
                        {!team.resolved ? (
                          <span className="shrink-0 rounded-full bg-[#FFF4E5] px-2 py-0.5 font-poppins text-[10px] font-semibold text-[#B54708]">
                            code only
                          </span>
                        ) : null}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
