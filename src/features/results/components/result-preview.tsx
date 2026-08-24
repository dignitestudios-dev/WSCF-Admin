'use client';

import { AlertTriangle, Trophy, Users } from 'lucide-react';
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
  const totalMatched = preview.divisions.reduce((sum, d) => sum + d.matchedCount, 0);
  const totalUnmatched = preview.divisions.reduce((sum, d) => sum + d.unmatchedCount, 0);
  const unresolvedTeams = preview.divisions.flatMap((division) =>
    division.teams.filter((team) => !team.resolved)
  );

  return (
    <div className="flex flex-col gap-5">
      {/* The header figures that will be printed on the document. */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Participants', value: preview.participantCount },
          {
            label: `Season ${preview.seasonLabel}`,
            value: preview.seasonParticipantCount.toLocaleString('en-US'),
          },
          { label: 'Players matched', value: totalMatched },
          { label: 'Not matched', value: totalUnmatched },
        ].map((item) => (
          <div
            key={item.label}
            className="flex flex-col gap-1 rounded-[12px] border border-[#DADADA] bg-white px-4 py-3"
          >
            <span className="font-poppins text-[11px] text-[#8C8C8C]">{item.label}</span>
            <span className="font-poppins text-[20px] font-bold text-[#083F92]">
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {totalUnmatched > 0 ? (
        <div className="flex items-start gap-3 rounded-[12px] border border-[#F5A524]/40 bg-[#FFF7E6] px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#B54708]" />
          <p className="font-poppins text-[12px] leading-5 text-[#7A4B00]">
            <strong>{totalUnmatched} player(s)</strong> in these files are not on our
            system. They will still appear in the results document, and will be added
            to the master players file so their rating is waiting if they sign up — but
            no rating of ours changes for them.
          </p>
        </div>
      ) : null}

      {unresolvedTeams.length > 0 ? (
        <div className="flex items-start gap-3 rounded-[12px] border border-[#F5A524]/40 bg-[#FFF7E6] px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#B54708]" />
          <p className="font-poppins text-[12px] leading-5 text-[#7A4B00]">
            <strong>{unresolvedTeams.length} team(s)</strong> could not be matched to a
            school, so the document will print their code (
            {unresolvedTeams
              .slice(0, 4)
              .map((team) => team.teamCode)
              .join(', ')}
            {unresolvedTeams.length > 4 ? '…' : ''}) instead of a name.
          </p>
        </div>
      ) : null}

      {preview.divisions.map((division) => (
        <div
          key={division.divisionId}
          className="overflow-hidden rounded-[16px] border border-[#DADADA] bg-white"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EFEFEF] px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-[#083F92] px-3 py-1 font-poppins text-[13px] font-bold text-white">
                {division.divisionLabel}
              </span>
              <span className="font-poppins text-[12px] text-[#8C8C8C]">
                {division.playerCount} players · {division.teamCount} teams ·{' '}
                {division.roundLabels.length} rounds
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
                        className="flex items-center gap-3 rounded-[10px] bg-[#F7F6FF] px-3 py-2"
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
                        className="flex items-center gap-3 rounded-[10px] bg-[#F7F6FF] px-3 py-2"
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
