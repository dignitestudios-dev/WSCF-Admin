'use client';

import { useState } from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { MasterPlayerFileDialog } from '@/features/users/components/master-player-file-dialog';

/**
 * Opens the Master Player File dialog, where the admin picks any filters and
 * downloads the CSV. Used on the Dashboard and the Users page.
 */
export function MasterPlayerFileButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2.5 px-[15px] py-[15px] bg-[#083F92]/10 hover:bg-[#083F92]/15 text-[#000000] rounded-[100px] transition-colors focus:outline-none h-[72px] shrink-0 shadow-sm w-full sm:w-auto justify-center cursor-pointer"
      >
        <div className="w-[42px] h-[42px] bg-[#083F92] rounded-full flex items-center justify-center text-white relative shadow-md">
          <FileSpreadsheet className="w-5 h-5" />
        </div>
        <span className="flex flex-col items-start pr-2 text-left">
          <span className="font-poppins font-medium text-[14px] leading-[20px] tracking-[-0.019em]">
            Master Player File
          </span>
          <span className="font-poppins font-light text-[11px] leading-[14px] text-[#000000]/60">
            Format: CSV
          </span>
        </span>
      </button>
      <MasterPlayerFileDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
