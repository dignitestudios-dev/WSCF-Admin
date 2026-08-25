'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { toast } from '@/lib/toast';
import { resultService } from '../services/result.service';

interface Division {
  _id: string;
  type?: string;
  divisionName?: string;
}

/** The results sheets and the entry files both name a division "K3". */
const labelFor = (division: Division) =>
  division.type === 'open' ? 'Open' : division.divisionName || 'Division';

/**
 * The entry lists handed to WinTD before the tournament is played.
 *
 * One file per division, because WinTD imports a section at a time. Each file
 * carries the players' ratings, which is what WinTD ranks and pairs on — so
 * this is offered for every division, including open ones that have no rating
 * rule of their own.
 */
export function WinTdExportCard({
  tournamentId,
  divisions,
}: {
  tournamentId: string;
  divisions: Division[];
}) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const download = async (division: Division) => {
    try {
      setDownloadingId(division._id);

      const blob = await resultService.exportEntries(tournamentId, division._id);
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${labelFor(division)}-Entries.csv`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || 'Could not build the entry file'
      );
    } finally {
      setDownloadingId(null);
    }
  };

  if (divisions.length === 0) return null;

  return (
    <div className="flex w-full flex-col gap-4 rounded-[12px] bg-[#083F92]/10 p-6">
      <div className="flex flex-col gap-1 border-b border-[#083F92]/10 pb-2">
        <h2 className="m-0 font-poppins text-[20px] font-bold leading-[30px] text-[#083F92]">
          Entry files for WinTD
        </h2>
        <p className="font-poppins text-[12px] text-[#565656]">
          One file per division, listing every registered player with their
          rating. Import each into the matching WinTD section.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {divisions.map((division) => (
          <button
            key={division._id}
            type="button"
            disabled={downloadingId !== null}
            onClick={() => download(division)}
            className="flex h-[42px] cursor-pointer items-center gap-2 rounded-[100px] bg-white px-4 font-poppins text-[13px] font-semibold text-[#083F92] shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {downloadingId === division._id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {labelFor(division)}
          </button>
        ))}
      </div>
    </div>
  );
}
