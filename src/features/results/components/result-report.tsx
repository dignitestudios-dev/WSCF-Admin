'use client';

import { AlertTriangle, Info } from 'lucide-react';
import type { ReviewReport } from '../services/result.service';

type Person = { name: string; division: string };

function PersonList({ people }: { people: Person[] }) {
  return (
    <ul className="flex flex-col gap-0.5 font-poppins text-[12px] leading-5 text-[#7A4B00]">
      {people.map((person, index) => (
        <li key={`${person.division}-${person.name}-${index}`} className="break-words">
          {person.name} <span className="text-[#B54708]/80">({person.division})</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * The review of an upload: the counts, and the cards for anyone who needs a
 * second look. Shown before publishing, from the preview, and again after it,
 * from the report saved with the published results.
 */
export function ResultReportPanel({
  report,
  published = false,
}: {
  report: ReviewReport;
  /** Past tense once the results are out. */
  published?: boolean;
}) {
  const stats = [
    { label: 'Players in files', value: report.playersInFiles },
    { label: 'Participants', value: report.participantCount },
    {
      label: `Season ${report.seasonLabel}`,
      value: report.seasonParticipantCount.toLocaleString('en-US'),
    },
    { label: 'Players matched', value: report.matchedCount },
    { label: 'Not registered here', value: report.notRegistered.length },
    { label: 'Not found', value: report.notMatchedCount },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {stats.map((item) => (
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

      {report.notRegistered.length > 0 ? (
        <div className="flex items-start gap-3 rounded-[12px] border border-[#F5A524]/40 bg-[#FFF7E6] px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#B54708]" />
          <div className="flex min-w-0 flex-col gap-1.5">
            <p className="font-poppins text-[12px] leading-5 text-[#7A4B00]">
              <strong>{report.notRegistered.length} player(s)</strong> are in our
              system but {published ? 'were' : 'are'} not registered for this
              tournament. They {published ? 'were' : 'are'} found by name, and their
              rating and history {published ? 'were' : 'will be'} updated.
              {published ? ' Check these were the right players.' : ' Make sure they are the right players.'}
            </p>
            <PersonList people={report.notRegistered} />
          </div>
        </div>
      ) : null}

      {report.notFound.length > 0 ? (
        <div className="flex items-start gap-3 rounded-[12px] border border-[#F5A524]/40 bg-[#FFF7E6] px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#B54708]" />
          <div className="flex min-w-0 flex-col gap-1.5">
            <p className="font-poppins text-[12px] leading-5 text-[#7A4B00]">
              <strong>{report.notFound.length} player(s)</strong> in these files{' '}
              {published ? 'were' : 'are'} not found in our database. They{' '}
              {published ? 'are' : 'will'} still {published ? 'printed' : 'be printed'} in the
              results document, but {published ? 'were' : 'are'} ignored otherwise: no
              profile, rating or history {published ? 'was' : 'is'} updated for them and
              nothing {published ? 'was' : 'is'} saved.
              {published ? '' : ' If a name is only misspelled, fix the player in WinTD and upload again.'}
            </p>
            <PersonList people={report.notFound} />
          </div>
        </div>
      ) : null}

      {report.repeated && report.repeated.length > 0 ? (
        <div className="flex items-start gap-3 rounded-[12px] border border-[#083F92]/20 bg-[#083F92]/5 px-4 py-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#083F92]" />
          <div className="flex min-w-0 flex-col gap-1.5">
            <p className="font-poppins text-[12px] leading-5 text-[#3D3775]">
              <strong>{report.repeated.length} entr{report.repeated.length === 1 ? 'y' : 'ies'}</strong>{' '}
              {published ? 'were' : 'are'} listed more than once in the files (usually an
              unplayed duplicate left in WinTD). Only the first entry counts for the
              rating and history, so nobody {published ? 'was' : 'is'} counted twice.
            </p>
            <ul className="flex flex-col gap-0.5 font-poppins text-[12px] leading-5 text-[#3D3775]">
              {report.repeated.map((person, index) => (
                <li key={`${person.division}-${person.name}-${index}`} className="break-words">
                  {person.name} <span className="opacity-70">({person.division})</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      {report.withdrawnCount > 0 ? (
        <div className="flex items-start gap-3 rounded-[12px] border border-[#083F92]/20 bg-[#083F92]/5 px-4 py-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#083F92]" />
          <p className="font-poppins text-[12px] leading-5 text-[#3D3775]">
            <strong>{report.withdrawnCount} player(s)</strong> withdrew (marked Out in
            the file). Their results are recorded and their ratings updated; whether
            they appear on the document depends on the withdrawn option.
          </p>
        </div>
      ) : null}

      {report.unresolvedTeams.length > 0 ? (
        <div className="flex items-start gap-3 rounded-[12px] border border-[#F5A524]/40 bg-[#FFF7E6] px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#B54708]" />
          <p className="font-poppins text-[12px] leading-5 text-[#7A4B00]">
            <strong>{report.unresolvedTeams.length} team(s)</strong> could not be
            matched to a team, so the document {published ? 'printed' : 'will print'}{' '}
            their code instead of a name:{' '}
            {report.unresolvedTeams
              .map((team) => `${team.teamCode} (${team.division})`)
              .join(', ')}
            .
          </p>
        </div>
      ) : null}
    </div>
  );
}
