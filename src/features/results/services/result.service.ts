import { axiosInstance } from '@/lib/axios';

/**
 * Publishing a tournament's results.
 *
 * The files come from WinTD, which has already scored and rated the event. The
 * platform reads them, links the names to players, replaces ratings and
 * produces the results document.
 */

/** One division's pair of files, plus how many trophies it awards. */
export interface DivisionUploadEntry {
  divisionId: string;
  divisionLabel: string;
  individualFile: File | null;
  teamFile: File | null;
  individualTrophyCount: number;
  teamTrophyCount: number;
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
  teamCount: number;
  matchedCount: number;
  unmatchedCount: number;
  players: PreviewPlayer[];
  teams: PreviewTeam[];
}

export interface ResultPreview {
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
  status: 'processing' | 'published' | 'failed';
  divisions: {
    divisionLabel: string;
    playerCount: number;
    teamCount: number;
    matchedCount: number;
    unmatchedCount: number;
    ratingsUpdatedCount: number;
    individualTrophyCount: number;
    teamTrophyCount: number;
  }[];
}

/**
 * Packs the entries into multipart.
 *
 * Files are named by their position — individual-0, team-0, individual-1 — so
 * the server can pair them back to the division described at the same index in
 * the JSON. A flat file list has no other way to say which file belongs to what.
 */
function buildFormData(entries: DivisionUploadEntry[], director?: string) {
  const form = new FormData();

  form.append(
    'divisions',
    JSON.stringify(
      entries.map((entry) => ({
        divisionId: entry.divisionId,
        divisionLabel: entry.divisionLabel,
        individualTrophyCount: entry.individualTrophyCount,
        teamTrophyCount: entry.teamTrophyCount,
      }))
    )
  );

  entries.forEach((entry, index) => {
    if (entry.individualFile) form.append(`individual-${index}`, entry.individualFile);
    if (entry.teamFile) form.append(`team-${index}`, entry.teamFile);
  });

  if (director) form.append('tournamentDirector', director);

  return form;
}

export const resultService = {
  /** Reads the files and reports what publishing would do. Writes nothing. */
  preview: async (
    tournamentId: string,
    entries: DivisionUploadEntry[]
  ): Promise<{ data: ResultPreview }> => {
    const response = await axiosInstance.post(
      `/result/${tournamentId}/preview`,
      buildFormData(entries),
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  /** One-way: replaces ratings and writes player histories. */
  publish: async (
    tournamentId: string,
    entries: DivisionUploadEntry[],
    director: string
  ) => {
    const response = await axiosInstance.post(
      `/result/${tournamentId}/publish`,
      buildFormData(entries, director),
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  get: async (tournamentId: string): Promise<{ data: { results: PublishedResults | null } }> => {
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
