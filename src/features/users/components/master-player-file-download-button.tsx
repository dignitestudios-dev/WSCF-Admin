'use client';

import { useState } from 'react';
import { FileSpreadsheet, Loader2 } from 'lucide-react';
import { userService } from '@/features/users/services/user.service';
import { toast } from '@/lib/toast';

/**
 * Downloads the whole Master Player File straight away, with no filters. The
 * Users page has a button that opens a filter dialog instead.
 *
 * The file is built on request from the whole roster, so on a large database it
 * takes a while; the button says so and stays disabled until the download
 * starts, rather than looking frozen or inviting a second click.
 */
export function MasterPlayerFileDownloadButton() {
  const [isPreparing, setIsPreparing] = useState(false);

  const handleDownload = async () => {
    if (isPreparing) return;
    try {
      setIsPreparing(true);
      toast.info('Preparing the Master Player File. This can take a minute for a large roster.');
      const blob = await userService.exportMasterPlayerFile();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'master-player-file.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Master Player File downloaded.');
    } catch (error) {
      console.error('Failed to export master player file:', error);
      toast.error('Failed to download the Master Player File. Please try again.');
    } finally {
      setIsPreparing(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={isPreparing}
      aria-busy={isPreparing}
      className="flex items-center gap-2.5 px-[15px] py-[15px] bg-[#083F92]/10 hover:bg-[#083F92]/15 text-[#000000] rounded-[100px] transition-colors focus:outline-none h-[72px] shrink-0 shadow-sm w-full sm:w-auto justify-center cursor-pointer disabled:cursor-wait"
    >
      <div className="w-[42px] h-[42px] bg-[#083F92] rounded-full flex items-center justify-center text-white relative shadow-md">
        {isPreparing ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <FileSpreadsheet className="w-5 h-5" />
        )}
      </div>
      <span className="flex flex-col items-start pr-2 text-left">
        <span className="font-poppins font-medium text-[14px] leading-[20px] tracking-[-0.019em]">
          {isPreparing ? 'Preparing file...' : 'Master Player File'}
        </span>
        <span className="font-poppins font-light text-[11px] leading-[14px] text-[#000000]/60">
          {isPreparing ? 'Please wait, do not close this page' : 'Format: CSV'}
        </span>
      </span>
    </button>
  );
}
