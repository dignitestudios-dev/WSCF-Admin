import { axiosInstance } from '@/lib/axios';

/**
 * Publishing a tournament's results.
 *
 * The files come from WinTD, which has already scored and rated the event. The
 * platform reads them, links the names to players, replaces ratings and
 * produces the results document.
 */

/** A chosen CSV, and the division it belongs to. */
export interface StagedFile {
  id: string;
  file: File;
  divisionId: string;
}

/**
 * An extra PDF to staple onto the back of the results document — a Grand Prix
 * sheet, a scholarship list, anything written outside the platform.
 */
export interface StagedAttachment {
  id: string;
  file: File;
}

/**
 * A player the admin singled out, and why.
 *
 * The name is copied verbatim from the parsed file, which is how the backend
 * finds the row again.
 */
export interface PlayerHighlight {
  name: string;
  label: string;
}

/**
 * How many trophies the tournament awards.
 *
 * Set once and applied to every division: three individual trophies means the
 * top three of each section, not three shared out across the whole event.
 */
export interface TrophyCounts {
  individual: number;
  team: number;
}

export interface PreviewPlayer {
  place: number | null;
  name: string;
  points: number | null;
  rating: number | null;
  grade: string;
  teamCode: string;
  status: string;
  trophyPlace: number | null;
  /** True when this player is withdrawn and will be left off the document. */
  hidden: boolean;
  /** The note the admin attached, if any. */
  highlightLabel: string | null;
  matched: boolean;
  matchedVia: 'registration' | 'name' | null;
}

export interface PreviewTeam {
  place: number | null;
  teamCode: string;
  teamName: string;
  /** False means the PDF will print the code rather than a school name. */
  resolved: boolean;
  playerCount: number | null;
  score: number | null;
  trophyPlace: number | null;
  members: { name: string; points: number | null; rating: number | null }[];
}

export interface PreviewDivision {
  divisionId: string;
  divisionLabel: string;
  roundLabels: string[];
  individualTrophyCount: number;
  teamTrophyCount: number;
  playerCount: number;
  /** How many of them the document will list. */
  printedCount: number;
  teamCount: number;
  matchedCount: number;
  unmatchedCount: number;
  players: PreviewPlayer[];
  teams: PreviewTeam[];
}

export interface ResultPreview {
  /** The extra PDFs, opened and counted. */
  attachments: { name: string; pageCount: number }[];
  tournament: { _id: string; title: string; date: string };
  participantCount: number;
  seasonParticipantCount: number;
  seasonLabel: string;
  divisions: PreviewDivision[];
}

export interface PublishedResults {
  _id: string;
  tournamentId: string;
  pdfUrl: string | null;
  pdfFileName: string | null;
  participantCount: number;
  seasonParticipantCount: number;
  seasonLabel: string;
  tournamentDirector: string | null;
  publishedAt: string | null;
  /** queued and processing both mean "still working". */
  status: 'queued' | 'processing' | 'published' | 'failed';
  progress: number;
  progressLabel: string | null;
  failureReason: string | null;
  attachments: { fileKey: string; fileName: string; pageCount: number }[];
  divisions: {
    divisionLabel: string;
    individualFileName: string;
    teamFileName: string;
    playerCount: number;
    printedCount: number;
    teamCount: number;
    matchedCount: number;
    unmatchedCount: number;
    ratingsUpdatedCount: number;
    individualTrophyCount: number;
    teamTrophyCount: number;
  }[];
}

/**
 * Pairs the two file lists into one entry per division.
 *
 * The admin chooses files in two boxes — every individual file in one, every
 * team file in the other — and tags each with its division. The API takes them
 * paired, so the pairing happens here, where both lists are in hand.
 *
 * A division missing either half is left out entirely rather than sent as a
 * half-entry: the server would only reject it, and the screen has already said
 * which division is incomplete.
 */
export function pairFilesByDivision(
  individualFiles: StagedFile[],
  teamFiles: StagedFile[]
) {
  const divisionIds = [
    ...new Set(
      [...individualFiles, ...teamFiles]
        .map((staged) => staged.divisionId)
        .filter(Boolean)
    ),
  ];

  return divisionIds
    .map((divisionId) => ({
      divisionId,
      individual: individualFiles.find((f) => f.divisionId === divisionId),
      team: teamFiles.find((f) => f.divisionId === divisionId),
    }))
    .filter((pair) => pair.individual && pair.team);
}

function buildFormData({
  individualFiles,
  teamFiles,
  trophies,
  divisionLabels,
  director,
  excludeWithdrawn,
  highlights,
  attachments,
}: {
  individualFiles: StagedFile[];
  teamFiles: StagedFile[];
  trophies: TrophyCounts;
  divisionLabels: Record<string, string>;
  director?: string;
  excludeWithdrawn: boolean;
  highlights: PlayerHighlight[];
  attachments: StagedAttachment[];
}) {
  const pairs = pairFilesByDivision(individualFiles, teamFiles);
  const form = new FormData();

  form.append(
    'divisions',
    JSON.stringify(
      pairs.map((pair) => ({
        divisionId: pair.divisionId,
        divisionLabel: divisionLabels[pair.divisionId] ?? '',
      }))
    )
  );

  // Named by position so the server can pair each file back to the division
  // described at the same index. A flat file list has no other way to say
  // which file belongs to what.
  pairs.forEach((pair, index) => {
    form.append(`individual-${index}`, pair.individual!.file);
    form.append(`team-${index}`, pair.team!.file);
  });

  if (director) form.append('tournamentDirector', director);

  form.append('individualTrophyCount', String(trophies.individual));
  form.append('teamTrophyCount', String(trophies.team));
  form.append('excludeWithdrawn', String(excludeWithdrawn));
  form.append('highlights', JSON.stringify(highlights));

  // Numbered so the server appends them in the order shown on screen.
  attachments.forEach((attachment, index) => {
    form.append(`attachment-${index}`, attachment.file);
  });

  return form;
}

export interface PublishPayload {
  individualFiles: StagedFile[];
  teamFiles: StagedFile[];
  trophies: TrophyCounts;
  divisionLabels: Record<string, string>;
  director?: string;
  excludeWithdrawn: boolean;
  highlights: PlayerHighlight[];
  attachments: StagedAttachment[];
}

export const resultService = {
  /** Reads the files and reports what publishing would do. Writes nothing. */
  preview: async (
    tournamentId: string,
    payload: PublishPayload
  ): Promise<{ data: ResultPreview }> => {
    const response = await axiosInstance.post(
      `/result/${tournamentId}/preview`,
      buildFormData(payload),
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  /**
   * Hands the files over. Returns as soon as they are accepted — the work runs
   * in the background and is followed by polling `get`.
   */
  publish: async (tournamentId: string, payload: PublishPayload) => {
    const response = await axiosInstance.post(
      `/result/${tournamentId}/publish`,
      buildFormData(payload),
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  get: async (
    tournamentId: string
  ): Promise<{ data: { results: PublishedResults | null } }> => {
    const response = await axiosInstance.get(`/result/${tournamentId}`);
    return response.data;
  },

  /**
   * The entry list for one division, ready to import into WinTD.
   *
   * One file per division — WinTD imports a section at a time and ranks the
   * players inside each file by the ratings it carries.
   */
  exportEntries: async (tournamentId: string, divisionId: string): Promise<Blob> => {
    const response = await axiosInstance.get(
      `/result/${tournamentId}/entries/${divisionId}`,
      { responseType: 'blob' }
    );
    return response.data;
  },
};
