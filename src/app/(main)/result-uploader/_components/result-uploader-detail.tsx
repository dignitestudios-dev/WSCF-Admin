'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  DollarSign,
  Download,
  Loader2,
  MapPin,
  Search,
  Users,
} from 'lucide-react';
import { toast } from '@/lib/toast';
import { PageTransition } from '@/components/animations/page-transition';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { tournamentService } from '@/features/tournaments/services/tournament.service';
import {
  ResultFileBox,
  type DivisionOption,
} from '@/features/results/components/result-file-box';
import { ResultPreviewPanel } from '@/features/results/components/result-preview';
import { PlayerHighlightPanel } from '@/features/results/components/player-highlight-panel';
import { AttachmentBox } from '@/features/results/components/attachment-box';
import {
  usePreviewResults,
  usePublishResults,
  usePublishedResults,
} from '@/features/results/hooks/use-results';
import {
  pairFilesByDivision,
  type PlayerHighlight,
  type PublishPayload,
  type StagedAttachment,
  type ResultPreview,
  type StagedFile,
  type TrophyCounts,
} from '@/features/results/services/result.service';

/**
 * The results sheets name a division "K3", not "K3u800" — the rating bound is
 * a registration rule, and the people reading the standings do not need it.
 */
const divisionLabel = (division: any): string =>
  division?.type === 'open' ? 'Open' : division?.divisionName || 'Division';

/**
 * Guesses which division a file belongs to from its name.
 *
 * WinTD's files are named after the section — "Fond du Lac K3 Individual" — so
 * the label almost always appears in the filename. Getting this right most of
 * the time turns assigning ten files into checking ten dropdowns rather than
 * setting them.
 */
const guessDivisionId = (fileName: string, divisions: DivisionOption[]) => {
  const haystack = fileName.toUpperCase();

  // Longest label first, so "K12" is not claimed by "K1".
  const ordered = [...divisions].sort((a, b) => b.label.length - a.label.length);

  const hit = ordered.find((division) => {
    const label = division.label.toUpperCase();
    // Bounded, so K3 does not match the K3 inside K30.
    return new RegExp(`(^|[^A-Z0-9])${label}([^A-Z0-9]|$)`).test(haystack);
  });

  return hit?._id ?? '';
};

const newId = () => Math.random().toString(36).slice(2);

/**
 * One tournament's results: its details, the file upload, and the published
 * document once there is one.
 */
export default function ResultUploaderDetail({
  tournamentId,
}: {
  tournamentId: string;
}) {

  const router = useRouter();
  const selectedId = tournamentId;

  const [director, setDirector] = useState('');
  const [individualFiles, setIndividualFiles] = useState<StagedFile[]>([]);
  const [teamFiles, setTeamFiles] = useState<StagedFile[]>([]);
  // One setting for the whole tournament, applied to every division.
  const [trophies, setTrophies] = useState<TrophyCounts>({ individual: 3, team: 3 });
  const [preview, setPreview] = useState<ResultPreview | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Withdrawals are left off by default, which is what the sheets WSCF has
  // always handed out do.
  const [excludeWithdrawn, setExcludeWithdrawn] = useState(true);
  const [highlights, setHighlights] = useState<PlayerHighlight[]>([]);
  const [attachments, setAttachments] = useState<StagedAttachment[]>([]);

  const [divisions, setDivisions] = useState<DivisionOption[]>([]);
  const [isLoadingDivisions, setIsLoadingDivisions] = useState(false);

  // The tournament itself, fetched by id. Pulling it out of a paged list was
  // only ever workable because the list and the detail shared a component.
  const [selected, setSelected] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { data: publishedData } = usePublishedResults(selectedId);
  const published = publishedData?.data?.results ?? null;

  const isWorking =
    published?.status === 'queued' || published?.status === 'processing';
  const isPublished = published?.status === 'published';

  const { mutateAsync: runPreview, isPending: isPreviewing } = usePreviewResults();
  const { mutateAsync: publish, isPending: isPublishing } = usePublishResults();

  // Divisions come from the tournament itself, fetched when one is opened.
  useEffect(() => {
    if (!selectedId) {
      setDivisions([]);
      return;
    }

    let cancelled = false;
    setIsLoadingDivisions(true);
    setIsLoading(true);

    tournamentService
      .getTournament(selectedId)
      .then((response: any) => {
        if (cancelled) return;
        const tournament = response?.data?.tournament ?? null;
        setSelected(tournament);

        const list = tournament?.divisions || [];
        setDivisions(
          list.map((division: any) => ({
            _id: division._id,
            label: divisionLabel(division),
          }))
        );
      })
      .catch(() => {
        if (cancelled) return;
        setSelected(null);
        setDivisions([]);
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoadingDivisions(false);
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedId]);


  const addAttachments = (chosen: File[]) => {
    setAttachments((current) => [
      ...current,
      ...chosen.map((file) => ({ id: newId(), file })),
    ]);
  };

  /** Their order is the order they come out in, so it has to be changeable. */
  const moveAttachment = (id: string, direction: -1 | 1) => {
    setAttachments((current) => {
      const index = current.findIndex((item) => item.id === id);
      const target = index + direction;
      if (index === -1 || target < 0 || target >= current.length) return current;

      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  /**
   * Anything that changes which players are in the upload invalidates both the
   * preview and the notes attached to it — a note naming a player who is no
   * longer in the files would be sent and quietly ignored.
   */
  const resetPreview = () => {
    setPreview(null);
    setHighlights([]);
  };

  const divisionLabels = useMemo(
    () => Object.fromEntries(divisions.map((d) => [d._id, d.label])),
    [divisions]
  );

  // A division is ready when both of its files are in.
  const pairs = useMemo(
    () => pairFilesByDivision(individualFiles, teamFiles),
    [individualFiles, teamFiles]
  );

  /**
   * Adds the chosen files, refusing any that are already staged.
   *
   * Picking the same file twice is almost always a slip — the admin lost track
   * of what they had already selected. Left alone it produces two entries for
   * one division, which the division dropdown then blocks anyway, so it is
   * caught here where it can be explained.
   */
  const addFiles = (
    setter: React.Dispatch<React.SetStateAction<StagedFile[]>>,
    chosen: File[]
  ) => {
    const duplicates: string[] = [];

    setter((current) => {
      const seen = new Set(
        current.map((staged) => `${staged.file.name}:${staged.file.size}`)
      );

      const added: StagedFile[] = [];
      for (const file of chosen) {
        const key = `${file.name}:${file.size}`;
        if (seen.has(key)) {
          duplicates.push(file.name);
          continue;
        }
        seen.add(key);
        added.push({
          id: newId(),
          file,
          divisionId: guessDivisionId(file.name, divisions),
        });
      }

      return added.length > 0 ? [...current, ...added] : current;
    });

    if (duplicates.length > 0) {
      toast.error(
        duplicates.length === 1
          ? `${duplicates[0]} has already been added.`
          : `${duplicates.length} files have already been added: ${duplicates.join(', ')}`
      );
    }

    resetPreview();
  };

  const assign = (
    setter: React.Dispatch<React.SetStateAction<StagedFile[]>>,
    id: string,
    divisionId: string
  ) => {
    setter((current) =>
      current.map((staged) => (staged.id === id ? { ...staged, divisionId } : staged))
    );
    resetPreview();
  };

  const remove = (
    setter: React.Dispatch<React.SetStateAction<StagedFile[]>>,
    id: string
  ) => {
    setter((current) => current.filter((staged) => staged.id !== id));
    resetPreview();
  };


  const payload = (overrides: Partial<PublishPayload> = {}): PublishPayload => ({
    individualFiles,
    teamFiles,
    trophies,
    divisionLabels,
    director,
    excludeWithdrawn,
    highlights,
    attachments,
    ...overrides,
  });

  // Every staged file must know its division, and every division must have
  // both halves — otherwise something the admin chose would be silently
  // ignored.
  const unassignedCount =
    individualFiles.filter((f) => !f.divisionId).length +
    teamFiles.filter((f) => !f.divisionId).length;

  const incompletePairs =
    individualFiles.length + teamFiles.length - pairs.length * 2;

  const canSubmit =
    pairs.length > 0 && unassignedCount === 0 && incompletePairs === 0;

  const handlePreview = async (overrides: Partial<PublishPayload> = {}) => {
    const response = await runPreview({
      tournamentId: selectedId as string,
      payload: payload(overrides),
    });
    setPreview(response.data);

    // A note can only survive if its player is still going to be printed —
    // toggling withdrawals off can take a tagged player off the document.
    const printable = new Set(
      response.data.divisions.flatMap((division) =>
        division.players.filter((p) => !p.hidden).map((p) => p.name)
      )
    );
    setHighlights((current) => current.filter((entry) => printable.has(entry.name)));
  };

  /**
   * Leaving withdrawals out changes both the standings and who the trophies
   * fall to, so a preview already on screen is rebuilt rather than thrown
   * away — the admin would otherwise lose the player list they are tagging
   * from every time they flipped the switch.
   */
  const toggleWithdrawn = (next: boolean) => {
    setExcludeWithdrawn(next);
    if (preview) handlePreview({ excludeWithdrawn: next }).catch(() => {});
  };

  const [isDownloading, setIsDownloading] = useState(false);

  /**
   * Saves the results document rather than opening it in a tab.
   *
   * The stored URL is presigned and points straight at S3, so a plain
   * `download` attribute is ignored — it is a different origin. Fetching the
   * bytes and handing the browser a blob is what actually produces a file.
   */
  const downloadPdf = async () => {
    if (!published?.pdfUrl) return;

    setIsDownloading(true);
    try {
      const response = await fetch(published.pdfUrl);
      if (!response.ok) throw new Error('Could not fetch the document');

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = published.pdfFileName || 'Results.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(objectUrl);
    } catch {
      toast.error('Could not download the document. Try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePublish = async () => {
    await publish({ tournamentId: selectedId as string, payload: payload() });
    setIsConfirmOpen(false);
    setIndividualFiles([]);
    setTeamFiles([]);
    setAttachments([]);
    resetPreview();
  };

  if (isLoading) {
    return (
      <PageTransition>
        <div className="flex h-full w-full flex-col gap-6 pb-12">
          <Skeleton className="h-[36px] w-[120px] rounded-full" />
          <Skeleton className="h-[42px] w-[320px] rounded-[12px]" />
          <Skeleton className="h-[600px] w-full rounded-[24px]" />
        </div>
      </PageTransition>
    );
  }

  if (!selected) {
    return (
      <PageTransition>
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 py-24 text-center font-poppins">
          <Search className="h-10 w-10 text-[#083F92]/20" />
          <p className="text-[#787878]">That tournament could not be found.</p>
          <button
            type="button"
            onClick={() => router.push('/result-uploader')}
            className="cursor-pointer rounded-[100px] bg-[#083F92] px-6 py-3 text-[14px] font-semibold text-white"
          >
            Back to tournaments
          </button>
        </div>
      </PageTransition>
    );
  }

  const detailRows = [
    { label: 'Location', value: selected.location || '—', icon: MapPin },
    {
      label: 'Entry fee',
      value: selected.entryFee ? `$${selected.entryFee}` : 'Free',
      icon: DollarSign,
    },
    {
      label: 'Date of Tournament',
      value: selected.date ? format(new Date(selected.date), 'dd MMM yyyy') : '—',
      icon: Calendar,
    },
    {
      label: 'Division',
      value: divisions.map((d) => d.label).join(', ') || '—',
      icon: Users,
    },
  ];

  return (
    <PageTransition>
      <div className="flex h-full w-full flex-col gap-6 font-sans select-none pb-12">
        <div className="flex items-center">
          <button
            onClick={() => router.push('/result-uploader')}
            className="flex cursor-pointer items-center gap-2 border-none bg-transparent p-0 font-poppins text-[18px] font-semibold text-[#083F92] outline-none transition-opacity hover:opacity-80"
          >
            <ArrowLeft className="h-[27px] w-[15px] text-[#083F92]" />
            <span>Back</span>
          </button>
        </div>

        <h1 className="m-0 font-poppins text-[24px] font-bold leading-[36px] text-[#083F92] md:text-[28px]">
          {selected.title}
        </h1>

        <div className="flex w-full flex-col gap-6 rounded-[24px] border border-[#DADADA]/30 bg-white p-6 shadow-[0px_4px_12px_rgba(8,63,146,0.05)] md:p-8">
          {/* Tournament details */}
          <div className="relative flex flex-col gap-6">
            <h2 className="m-0 font-poppins text-[24px] font-bold leading-[36px] text-[#083F92]">
              Tournament details
            </h2>

            <div className="flex w-full flex-col gap-4 rounded-[12px] bg-[#083F92]/10 p-6">
              {detailRows.map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-1 items-start gap-1 border-b border-[#083F92]/5 pb-2 md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-4 md:border-b-0 md:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#083F92] text-white">
                      <row.icon className="h-[16px] w-[16px]" />
                    </div>
                    <span className="truncate font-poppins text-[16px] font-medium leading-[30px] text-[#636363] md:text-[20px]">
                      {row.label}
                    </span>
                  </div>
                  <span className="hidden font-general-sans text-[20px] font-medium leading-[27px] text-black md:inline">
                    :
                  </span>
                  <span className="pl-11 font-poppins text-[16px] font-bold leading-[30px] text-[#083F92] md:pl-0 md:text-[20px]">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Result Doc */}
          <div className="flex flex-col gap-6">
            <h2 className="m-0 font-poppins text-[24px] font-bold leading-[36px] text-[#083F92]">
              Result Doc
            </h2>

            {isPublished ? (
              /* Published: the document itself, nothing to upload. */
              <div className="flex w-full flex-col gap-5 rounded-[12px] bg-[#083F92]/10 p-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#0F8B4C]" />
                  <div className="flex flex-col gap-1">
                    <p className="font-poppins text-[15px] font-semibold text-[#0F5132]">
                      Results published
                      {published?.publishedAt
                        ? ` on ${format(new Date(published.publishedAt), 'dd MMM yyyy')}`
                        : ''}
                    </p>
                    <p className="font-poppins text-[12px] text-[#565656]">
                      {published?.divisions.length} division(s) ·{' '}
                      {published?.divisions.reduce(
                        (n, d) => n + d.ratingsUpdatedCount,
                        0
                      )}{' '}
                      rating(s) updated. Results are uploaded once and cannot be
                      replaced.
                    </p>
                    {published?.attachments?.length ? (
                      <p className="font-poppins text-[12px] text-[#565656]">
                        Includes {published.attachments.length} attached file(s)
                        at the back:{' '}
                        {published.attachments
                          .map((a) => a.fileName)
                          .join(', ')}
                        .
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {published?.divisions.map((division) => (
                    <div
                      key={division.divisionLabel}
                      className="flex flex-col gap-1 rounded-[12px] border border-[#DADADA] bg-white px-4 py-3"
                    >
                      <span className="font-poppins text-[13px] font-bold text-[#083F92]">
                        {division.divisionLabel}
                      </span>
                      <span className="font-poppins text-[11px] text-[#636363]">
                        {division.playerCount} players · {division.teamCount} teams
                      </span>
                      <span className="font-poppins text-[11px] text-[#636363]">
                        {division.ratingsUpdatedCount} rating(s) updated
                        {division.unmatchedCount > 0
                          ? ` · ${division.unmatchedCount} not on system`
                          : ''}
                      </span>
                    </div>
                  ))}
                </div>

                {published?.pdfUrl ? (
                  <div className="flex flex-col gap-3">
                    {/* The document is the point of this screen, so it is
                        shown here rather than behind a click. */}
                    <div className="h-[600px] w-full overflow-hidden rounded-[12px] border border-[#DADADA] bg-white">
                      <iframe
                        src={published.pdfUrl}
                        title={published.pdfFileName || 'Results'}
                        className="h-full w-full"
                      />
                    </div>

                    <button
                      type="button"
                      disabled={isDownloading}
                      onClick={downloadPdf}
                      className="flex h-[52px] w-fit cursor-pointer items-center gap-2.5 rounded-[100px] bg-[#083F92] px-5 font-poppins text-[14px] font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isDownloading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      {isDownloading
                        ? 'Preparing...'
                        : `Download ${published.pdfFileName || 'Results.pdf'}`}
                    </button>
                  </div>
                ) : null}
              </div>
            ) : isWorking ? (
              /* In flight: the job reports where it has got to. */
              <div className="flex w-full flex-col gap-4 rounded-[12px] bg-[#083F92]/10 p-6">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-[#083F92]" />
                  <div className="flex flex-col">
                    <span className="font-poppins text-[15px] font-semibold text-[#083F92]">
                      {published?.progressLabel || 'Working'}
                    </span>
                    <span className="font-poppins text-[12px] text-[#636363]">
                      Updating ratings and building the results document. You can
                      leave this page — it will keep running.
                    </span>
                  </div>
                </div>

                <div className="h-[8px] w-full overflow-hidden rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-[#083F92] transition-all duration-500"
                    style={{ width: `${published?.progress ?? 0}%` }}
                  />
                </div>
                <span className="font-poppins text-[12px] font-semibold text-[#083F92]">
                  {published?.progress ?? 0}%
                </span>
              </div>
            ) : (
              <>
                {published?.status === 'failed' ? (
                  <div className="flex items-start gap-3 rounded-[12px] border border-[#CE2D32]/30 bg-[#FDECEA] px-5 py-4">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#B42318]" />
                    <p className="font-poppins text-[12px] leading-5 text-[#7A1710]">
                      The last attempt failed: {published.failureReason}
                    </p>
                  </div>
                ) : null}

                {isLoadingDivisions ? (
                  <Skeleton className="h-[300px] w-full rounded-[12px]" />
                ) : divisions.length === 0 ? (
                  <div className="rounded-[12px] bg-[#083F92]/10 px-6 py-8 text-center font-poppins text-[13px] text-[#636363]">
                    This tournament has no divisions, so there is nothing to upload
                    against.
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      <ResultFileBox
                        title="Individual Results"
                        hint="one file per division"
                        files={individualFiles}
                        divisions={divisions}
                        disabled={isPublishing}
                        onAdd={(chosen) => addFiles(setIndividualFiles, chosen)}
                        onAssign={(id, divisionId) =>
                          assign(setIndividualFiles, id, divisionId)
                        }
                        onRemove={(id) => remove(setIndividualFiles, id)}
                      />

                      <ResultFileBox
                        title="Team Results"
                        hint="one file per division"
                        files={teamFiles}
                        divisions={divisions}
                        disabled={isPublishing}
                        onAdd={(chosen) => addFiles(setTeamFiles, chosen)}
                        onAssign={(id, divisionId) =>
                          assign(setTeamFiles, id, divisionId)
                        }
                        onRemove={(id) => remove(setTeamFiles, id)}
                      />
                    </div>

                    <AttachmentBox
                      files={attachments}
                      disabled={isPublishing}
                      onAdd={addAttachments}
                      onMove={moveAttachment}
                      onRemove={(id) =>
                        setAttachments((current) =>
                          current.filter((item) => item.id !== id)
                        )
                      }
                    />

                    {/* Trophies. One setting for the whole tournament. */}
                    {pairs.length > 0 ? (
                      <div className="flex flex-col gap-3 rounded-[12px] bg-[#083F92]/10 p-5">
                        <div className="flex flex-col gap-1">
                          <h3 className="font-poppins text-[16px] font-bold text-[#083F92]">
                            Trophies
                          </h3>
                          <p className="font-poppins text-[11px] leading-4 text-[#636363]">
                            Applied to every division — 3 individual trophies
                            means the top 3 of{' '}
                            {pairs.length === 1
                              ? 'the section'
                              : `each of the ${pairs.length} sections`}
                            , not 3 shared between them.
                          </p>
                        </div>

                        <div className="flex flex-col gap-3 rounded-[12px] border border-[#DADADA] bg-white p-3 sm:flex-row sm:items-center sm:gap-8">
                          <div className="flex items-center gap-3">
                            <Label className="font-poppins text-[13px] font-medium text-[#181818]">
                              Individual
                            </Label>
                            <Input
                              type="number"
                              min={0}
                              disabled={isPublishing}
                              value={trophies.individual}
                              onChange={(event) =>
                                setTrophies((current) => ({
                                  ...current,
                                  individual: Math.max(
                                    0,
                                    Number(event.target.value) || 0
                                  ),
                                }))
                              }
                              className="h-10 w-[76px] rounded-full border-[#3D3775] px-3 font-poppins"
                            />
                            <span className="font-poppins text-[11px] text-[#8C8C8C]">
                              per division
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <Label className="font-poppins text-[13px] font-medium text-[#181818]">
                              Team
                            </Label>
                            <Input
                              type="number"
                              min={0}
                              disabled={isPublishing}
                              value={trophies.team}
                              onChange={(event) =>
                                setTrophies((current) => ({
                                  ...current,
                                  team: Math.max(
                                    0,
                                    Number(event.target.value) || 0
                                  ),
                                }))
                              }
                              className="h-10 w-[76px] rounded-full border-[#3D3775] px-3 font-poppins"
                            />
                            <span className="font-poppins text-[11px] text-[#8C8C8C]">
                              per division
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {/* How the document itself is put together. */}
                    {pairs.length > 0 ? (
                      <div className="flex flex-col gap-3 rounded-[12px] bg-[#083F92]/10 p-5">
                        <h3 className="font-poppins text-[16px] font-bold text-[#083F92]">
                          Document options
                        </h3>

                        <button
                          type="button"
                          role="switch"
                          aria-checked={excludeWithdrawn}
                          disabled={isPublishing || isPreviewing}
                          onClick={() => toggleWithdrawn(!excludeWithdrawn)}
                          className="flex w-full cursor-pointer items-center gap-4 rounded-[12px] border border-[#DADADA] bg-white p-3 text-left transition-colors hover:border-[#083F92]/50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <span
                            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                              excludeWithdrawn ? 'bg-[#083F92]' : 'bg-[#D5D5D5]'
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                                excludeWithdrawn ? 'left-[22px]' : 'left-0.5'
                              }`}
                            />
                          </span>

                          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                            <span className="font-poppins text-[13px] font-semibold text-[#181818]">
                              Leave withdrawn players off the document
                            </span>
                            <span className="font-poppins text-[11px] leading-4 text-[#636363]">
                              Players the file marks &ldquo;Out&rdquo; are not
                              printed, and the trophies go to the first places
                              that are. They are still recorded and still rated
                              either way.
                            </span>
                          </span>

                          {isPreviewing ? (
                            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#083F92]" />
                          ) : null}
                        </button>
                      </div>
                    ) : null}

                    {/* Director, and the two actions. */}
                    <div className="flex flex-col gap-4">
                      <div className="flex max-w-[420px] flex-col gap-2">
                        <Label className="font-poppins text-[13px] font-medium text-[#181818]">
                          Tournament Director
                        </Label>
                        <Input
                          value={director}
                          disabled={isPublishing}
                          placeholder="Charles Windsor"
                          onChange={(event) => setDirector(event.target.value)}
                          className="h-11 rounded-full border-[#3D3775] px-4 font-poppins"
                        />
                        <p className="font-poppins text-[11px] text-[#8C8C8C]">
                          Printed on the results document.
                        </p>
                      </div>

                      {unassignedCount > 0 || incompletePairs > 0 ? (
                        <div className="flex items-start gap-3 rounded-[12px] border border-[#F5A524]/40 bg-[#FFF7E6] px-4 py-3">
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#B54708]" />
                          <p className="font-poppins text-[12px] leading-5 text-[#7A4B00]">
                            {unassignedCount > 0
                              ? `${unassignedCount} file(s) still need a division. `
                              : ''}
                            {incompletePairs > 0
                              ? 'Every division needs both an individual and a team file.'
                              : ''}
                          </p>
                        </div>
                      ) : null}

                      {/* Two ordered steps rather than two buttons side by
                          side. Publishing is irreversible, so it stays shut
                          until the files have actually been read — and any
                          change to the files sends the admin back to step
                          one, because the check they passed no longer
                          describes what they are about to publish. */}
                      <div className="flex flex-col gap-3 rounded-[12px] border border-[#DADADA] bg-white p-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-poppins text-[12px] font-bold text-white ${
                              preview ? "bg-[#0F8B4C]" : "bg-[#083F92]"
                            }`}
                          >
                            {preview ? <Check className="h-4 w-4" /> : "1"}
                          </span>

                          <div className="flex min-w-0 flex-1 flex-col">
                            <span className="font-poppins text-[13px] font-semibold text-[#181818]">
                              Check the files
                            </span>
                            <span className="font-poppins text-[11px] leading-4 text-[#636363]">
                              {preview
                                ? "Files read. Review the standings below, then publish."
                                : "Reads the files and shows the standings, the trophies and anyone we could not match."}
                            </span>
                          </div>

                          <button
                            type="button"
                            disabled={!canSubmit || isPreviewing || isPublishing}
                            onClick={() => handlePreview()}
                            className="flex h-[44px] shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[100px] border border-[#083F92] bg-white px-5 font-poppins text-[14px] font-semibold text-[#083F92] transition-colors hover:bg-[#083F92]/5 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isPreviewing ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Search className="h-4 w-4" />
                            )}
                            {isPreviewing
                              ? "Reading files..."
                              : preview
                                ? "Check again"
                                : "Check files"}
                          </button>
                        </div>

                        <div className="h-px w-full bg-[#EFEFEF]" />

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-poppins text-[12px] font-bold ${
                              preview
                                ? "bg-[#083F92] text-white"
                                : "bg-[#EFEFEF] text-[#A6A6A6]"
                            }`}
                          >
                            2
                          </span>

                          <div className="flex min-w-0 flex-1 flex-col">
                            <span
                              className={`font-poppins text-[13px] font-semibold ${
                                preview ? "text-[#181818]" : "text-[#A6A6A6]"
                              }`}
                            >
                              Publish the results
                            </span>
                            <span className="font-poppins text-[11px] leading-4 text-[#636363]">
                              {preview
                                ? "Replaces ratings and generates the document. This cannot be undone."
                                : "Available once the files have been checked."}
                            </span>
                          </div>

                          <button
                            type="button"
                            disabled={!canSubmit || !preview || isPublishing}
                            onClick={() => setIsConfirmOpen(true)}
                            className="flex h-[44px] shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[100px] bg-[#083F92] px-5 font-poppins text-[14px] font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Publish results
                          </button>
                        </div>
                      </div>

                      {preview ? (
                        <div className="flex flex-col gap-5">
                          <ResultPreviewPanel preview={preview} />

                          <PlayerHighlightPanel
                            divisions={preview.divisions}
                            value={highlights}
                            onChange={setHighlights}
                            disabled={isPublishing}
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Publish these results?"
        description={
          `This cannot be undone. Player ratings will be replaced with the ratings in these files, ` +
          `the results will appear in every matched player's history, and the results document will be generated. ` +
          (highlights.length > 0
            ? `${highlights.length} player(s) will be highlighted. `
            : '') +
          `Results can only be uploaded once for ${selected.title}.`
        }
        confirmText="Publish results"
        loadingText="Sending..."
        tone="primary"
        icon={CheckCircle2}
        isLoading={isPublishing}
        onConfirm={handlePublish}
      />
    </PageTransition>
  );
}
