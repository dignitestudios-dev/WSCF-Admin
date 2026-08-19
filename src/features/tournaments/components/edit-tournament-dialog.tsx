'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useUpdateTournament } from '../hooks/use-update-tournament';
import { TournamentForm } from './tournament-form';

interface EditTournamentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: any;
}

export function EditTournamentDialog({ open, onOpenChange, initialData }: EditTournamentDialogProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const { mutate: updateTournament, isPending } = useUpdateTournament();

  const handleSubmit = (data: any) => {
    if (initialData?._id) {
      updateTournament({ id: initialData._id, data }, {
        onSuccess: () => {
          onOpenChange(false);
          setShowSuccess(true);
        }
      });
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent
          showCloseButton={false}
          className="w-[90vw]! sm:w-[589px]! max-w-[589px]! max-h-[90vh]! overflow-hidden bg-white rounded-[12px] p-0 border-none shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-start justify-between px-8 pt-8 pb-4 shrink-0">
            <h2 className="font-poppins font-semibold text-[32px] leading-[43px] text-[#181818]">
              Edit Tournament
            </h2>
            <button
              onClick={handleClose}
              className="text-[#181818]/60 hover:text-[#181818] transition-colors mt-1"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form wrapper */}
          <div className="flex-1 overflow-y-auto no-scrollbar px-8 pb-8 pt-2">
            <TournamentForm
              initialData={initialData}
              onSubmitAction={handleSubmit}
              isPending={isPending}
              submitButtonText="Update"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent
          showCloseButton={false}
          className="w-[90vw]! sm:w-[515px]! max-w-[515px]! h-auto py-8 bg-white rounded-[12px] p-10 border-none shadow-2xl flex flex-col items-center justify-center"
        >
          <div className="flex flex-col items-center gap-6 w-full max-w-[90%]">
            <div className="w-[120px] h-[120px] rounded-full bg-[#083F92] flex items-center justify-center text-white relative shadow-md">
              <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-[50px] h-[50px]">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            
            <div className="flex flex-col items-center gap-2 w-full text-center">
              <h2 className="text-[32px] leading-[43px] font-semibold font-poppins text-[#181818] tracking-[-0.008em] capitalize m-0">
                Updated Successfully!
              </h2>
              <p className="text-[18px] leading-[28px] font-normal font-poppins text-[#565656] tracking-[-0.014em] m-0 break-words max-w-full">
                Tournament has been updated!
              </p>
            </div>
            <button
              onClick={() => setShowSuccess(false)}
              className="mt-4 w-[200px] h-[48px] bg-[#083F92] hover:bg-[#083F92]/90 rounded-[24px] text-white font-poppins font-semibold text-[14px] shadow-md transition-colors"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
