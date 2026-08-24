'use client';

import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { CheckCircle2, Download, FileWarning, Plus, Upload } from 'lucide-react';
import { PageTransition } from '@/components/animations/page-transition';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTournaments } from '@/features/tournaments/hooks/use-tournaments';
import { tournamentService } from '@/features/tournaments/services/tournament.service';
import {
  DivisionUploadRow,
  type DivisionOption,
} from '@/features/results/components/division-upload-row';
import { ResultPreviewPanel } from '@/features/results/components/result-preview';
import {
  usePreviewResults,
  usePublishResults,
  usePublishedResults,
} from '@/features/results/hooks/use-results';
import type {
  DivisionUploadEntry,
  ResultPreview,
} from '@/features/results/services/result.service';

const emptyEntry = (): DivisionUploadEntry => ({
  divisionId: '',
  divisionLabel: '',
  individualFile: null,
  teamFile: null,
  individualTrophyCount: 3,
  teamTrophyCount: 3,
});

/**
 * The results sheets name a division "K3", not "K3u800" — the rating bound is
 * a registration rule, and the people reading the standings do not need it.
 */
const divisionLabel = (division: any): string => {
  if (division?.type === 'open') return 'Open';
  return division?.divisionName || 'Division';
};

export default function ResultUploader() {
  const [tournamentId, setTournamentId] = useState('');
  const [director, setDirector] = useState('');
  const [entries, setEntries] = useState<DivisionUploadEntry[]>([emptyEntry()]);
  const [preview, setPreview] = useState<ResultPreview | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [divisions, setDivisions] = useState<DivisionOption[]>([]);
  const [isLoadingDivisions, setIsLoadingDivisions] = useState(false);

  // Only a completed tournament can take results, so only those are offered.
  const { data: tournamentsData, isLoading: isLoadingTournaments } = useTournaments(
    1,
    100,
    '',
    'completed'
  );

  const tournaments = tournamentsData?.data?.tournaments || [];
  const selected = tournaments.find((t: any) => t._id === tournamentId);

  const { data: publishedData, isLoading: isLoadingPublished } =
    usePublishedResults(tournamentId || null);
  const published = publishedData?.data?.results ?? null;

  const { mutateAsync: runPreview, isPending: isPreviewing } = usePreviewResults();
  const { mutateAsync: publish, isPending: isPublishing } = usePublishResults();

  // The divisions come from the tournament itself, so the list is fetched when
  // one is chosen rather than held for all of them.
  useEffect(() => {
    if (!tournamentId) {
      setDivisions([]);
      return;
    }

    let cancelled = false;
    setIsLoadingDivisions(true);

    tournamentService
      .getTournament(tournamentId)
      .then((response: any) => {
        if (cancelled) return;
        const list = response?.data?.tournament?.divisions || [];
        setDivisions(
          list.map((division: any) => ({
            _id: division._id,
            label: divisionLabel(division),
          }))
        );
      })
      .catch(() => {
        if (!cancelled) setDivisions([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingDivisions(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tournamentId]);

  // Switching tournament abandons whatever was staged for the last one.
  const chooseTournament = (id: string | null) => {
    if (!id) return;

    setTournamentId(id);
    setEntries([emptyEntry()]);
    setPreview(null);
    setDirector('');
  };

  const usedDivisionIds = useMemo(
    () => entries.map((entry) => entry.divisionId).filter(Boolean),
    [entries]
  );

  const isComplete =
    Boolean(tournamentId) &&
    entries.length > 0 &&
    entries.every(
      (entry) => entry.divisionId && entry.individualFile && entry.teamFile
    );

  const updateEntry = (index: number, next: Partial<DivisionUploadEntry>) => {
    setEntries((current) =>
      current.map((entry, i) => (i === index ? { ...entry, ...next } : entry))
    );
    // Any change invalidates what was previewed.
    setPreview(null);
  };

  const handlePreview = async () => {
    const response = await runPreview({ tournamentId, entries });
    setPreview(response.data);
  };

  const handlePublish = async () => {
    await publish({ tournamentId, entries, director });
    setIsConfirmOpen(false);
    setPreview(null);
    setEntries([emptyEntry()]);
  };

  return (
    <PageTransition>
      <div className="flex h-full w-full flex-col gap-6 font-sans select-none pb-10">
        <div className="flex flex-col gap-2">
          <h1 className="m-0 font-poppins text-[28px] font-bold leading-[36px] text-[#083F92] sm:text-[42px] sm:leading-[63px]">
            Upload Results
          </h1>
          <p className="font-poppins text-[13px] text-[#8C8C8C]">
            Upload the WinTD files for each division. Ratings and trophy places come
            from the files exactly as they are — nothing is recalculated.
          </p>
        </div>

        {/* Which tournament */}
        <div className="flex flex-col gap-4 rounded-[16px] border border-[#DADADA] bg-white p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label className="font-poppins text-[13px] font-medium text-[#181818]">
                Tournament
              </Label>
              {isLoadingTournaments ? (
                <Skeleton className="h-11 w-full rounded-full" />
              ) : (
                <Select value={tournamentId} onValueChange={chooseTournament}>
                  <SelectTrigger className="h-11! w-full rounded-full border border-[#3D3775] px-4 font-poppins text-[14px]">
                    <SelectValue placeholder="Select a completed tournament" />
                  </SelectTrigger>
                  <SelectContent>
                    {tournaments.length === 0 ? (
                      <div className="px-3 py-4 text-center font-poppins text-[13px] text-[#8C8C8C]">
                        No completed tournaments yet.
                      </div>
                    ) : (
                      tournaments.map((tournament: any) => (
                        <SelectItem key={tournament._id} value={tournament._id}>
                          {tournament.title}
                          {tournament.date
                            ? ` — ${format(new Date(tournament.date), 'dd MMM yyyy')}`
                            : ''}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
              <p className="font-poppins text-[11px] text-[#8C8C8C]">
                Only completed tournaments can take results.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="font-poppins text-[13px] font-medium text-[#181818]">
                Tournament Director
              </Label>
              <Input
                value={director}
                disabled={!tournamentId || Boolean(published)}
                placeholder="Charles Windsor"
                onChange={(event) => setDirector(event.target.value)}
                className="h-11 rounded-full border-[#3D3775] px-4 font-poppins"
              />
              <p className="font-poppins text-[11px] text-[#8C8C8C]">
                Printed on the results document.
              </p>
            </div>
          </div>
        </div>

        {/* Already published: there is nothing to do but read it. */}
        {tournamentId && isLoadingPublished ? (
          <Skeleton className="h-[120px] w-full rounded-[16px]" />
        ) : published ? (
          <div className="flex flex-col gap-4 rounded-[16px] border border-[#0F8B4C]/30 bg-[#EDF9F2] p-5">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#0F8B4C]" />
              <div className="flex flex-col gap-1">
                <p className="font-poppins text-[14px] font-semibold text-[#0F5132]">
                  Results already published
                  {published.publishedAt
                    ? ` on ${format(new Date(published.publishedAt), 'dd MMM yyyy')}`
                    : ''}
                </p>
                <p className="font-poppins text-[12px] text-[#0F5132]/80">
                  {published.divisions.length} division(s) ·{' '}
                  {published.divisions.reduce((n, d) => n + d.ratingsUpdatedCount, 0)}{' '}
                  rating(s) updated. Results are uploaded once and cannot be replaced.
                </p>
              </div>
            </div>

            {published.pdfUrl ? (
              <a
                href={published.pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="flex h-11 w-fit items-center gap-2 rounded-full bg-[#083F92] px-5 font-poppins text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
              >
                <Download className="h-4 w-4" />
                Download results PDF
              </a>
            ) : null}
          </div>
        ) : tournamentId ? (
          <>
            {/* The files */}
            <div className="flex flex-col gap-4">
              {isLoadingDivisions ? (
                <Skeleton className="h-[220px] w-full rounded-[16px]" />
              ) : divisions.length === 0 ? (
                <div className="flex items-center gap-3 rounded-[16px] border border-[#F5A524]/40 bg-[#FFF7E6] px-5 py-4">
                  <FileWarning className="h-4 w-4 shrink-0 text-[#B54708]" />
                  <p className="font-poppins text-[12px] text-[#7A4B00]">
                    This tournament has no divisions, so there is nothing to upload
                    against.
                  </p>
                </div>
              ) : (
                <>
                  {entries.map((entry, index) => (
                    <DivisionUploadRow
                      key={index}
                      index={index}
                      entry={entry}
                      divisions={divisions}
                      usedDivisionIds={usedDivisionIds}
                      canRemove={entries.length > 1}
                      disabled={isPublishing}
                      onChange={(next) => updateEntry(index, next)}
                      onRemove={() => {
                        setEntries((current) => current.filter((_, i) => i !== index));
                        setPreview(null);
                      }}
                    />
                  ))}

                  {entries.length < divisions.length ? (
                    <button
                      type="button"
                      disabled={isPublishing}
                      onClick={() => setEntries((current) => [...current, emptyEntry()])}
                      className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-[16px] border border-dashed border-[#3D3775]/40 bg-[#F7F6FF] font-poppins text-[13px] font-semibold text-[#083F92] transition-colors hover:border-[#3D3775] hover:bg-[#ECEAFF] disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4" />
                      Add another division
                    </button>
                  ) : null}
                </>
              )}
            </div>

            {/* Check, then publish */}
            {divisions.length > 0 ? (
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={!isComplete || isPreviewing || isPublishing}
                    onClick={handlePreview}
                    className="flex h-12 cursor-pointer items-center gap-2 rounded-full border border-[#083F92] bg-white px-6 font-poppins text-[14px] font-semibold text-[#083F92] transition-colors hover:bg-[#083F92]/5 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Upload className="h-4 w-4" />
                    {isPreviewing ? 'Reading files...' : 'Check files'}
                  </button>

                  <button
                    type="button"
                    // Deliberately gated on having previewed: publishing
                    // replaces ratings and cannot be undone, so the admin sees
                    // what it will do before they can do it.
                    disabled={!preview || isPublishing}
                    onClick={() => setIsConfirmOpen(true)}
                    className="flex h-12 cursor-pointer items-center gap-2 rounded-full bg-[#083F92] px-6 font-poppins text-[14px] font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Publish results
                  </button>
                </div>

                {!preview && isComplete ? (
                  <p className="font-poppins text-[12px] text-[#8C8C8C]">
                    Check the files first — you will see the trophy winners and which
                    players were matched before anything is saved.
                  </p>
                ) : null}

                {preview ? <ResultPreviewPanel preview={preview} /> : null}
              </div>
            ) : null}
          </>
        ) : null}
      </div>

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Publish these results?"
        description={
          `This cannot be undone. Player ratings will be replaced with the ratings in these files, ` +
          `the results will appear in every matched player's history, and the results document will be generated. ` +
          `Results can only be uploaded once for ${selected?.title ?? 'this tournament'}.`
        }
        confirmText="Publish results"
        loadingText="Publishing..."
        tone="primary"
        icon={CheckCircle2}
        isLoading={isPublishing}
        onConfirm={handlePublish}
      />
    </PageTransition>
  );
}
