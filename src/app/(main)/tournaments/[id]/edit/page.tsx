'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { TournamentForm } from '@/features/tournaments/components/tournament-form';
import { useGetTournament } from '@/features/tournaments/hooks/use-get-tournament';
import { useUpdateTournament } from '@/features/tournaments/hooks/use-update-tournament';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export default function EditTournamentPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const { data: tournament, isLoading: isFetching } = useGetTournament(id);
  const { mutate: updateTournament, isPending } = useUpdateTournament();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (data: any) => {
    updateTournament({ id, data }, {
      onSuccess: () => {
        setShowSuccess(true);
      }
    });
  };

  // The API refuses edits once a tournament has started. Say so here instead of
  // showing a form that can only fail when it is saved.
  const status: string | undefined = tournament?.data?.tournament?.status;
  const isLocked = Boolean(status) && status !== 'upcoming';

  const handleSuccessClose = () => {
    setShowSuccess(false);
    router.push('/tournaments');
  };

  return (
    <div className="flex-1 h-[calc(100vh-2rem)] bg-white rounded-[24px] shadow-sm flex flex-col relative overflow-hidden m-4 ml-0">
      {/* Header */}
      <div className="flex-none px-10 py-8 border-b border-[#DADADA]/50 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-[#083F92]/5 hover:bg-[#083F92]/10 flex items-center justify-center transition-colors shadow-xs group"
        >
          <ArrowLeft className="w-5 h-5 text-[#083F92] group-hover:-translate-x-0.5 transition-transform" />
        </button>
        <div>
          <h1 className="font-poppins font-semibold text-[32px] leading-[43px] text-[#181818] tracking-tight">
            Edit Tournament
          </h1>
          <p className="text-[14px] font-poppins text-[#565656] mt-1">
            Update the details for this tournament below.
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-10 py-8">
        <div className="">
          {isFetching ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#083F92]" />
            </div>
          ) : isLocked ? (
            <div className="flex flex-col items-center gap-3 py-20 text-center font-poppins">
              <p className="text-[18px] font-medium text-[#181818]">
                This tournament is {status} and can no longer be edited.
              </p>
              <p className="text-[14px] text-[#565656]">
                Only upcoming tournaments can be changed.
              </p>
              <button
                onClick={() => router.back()}
                className="mt-2 h-[44px] rounded-[24px] bg-[#083F92] px-8 text-[14px] font-semibold text-white transition-colors hover:bg-[#083F92]/90"
              >
                Go back
              </button>
            </div>
          ) : tournament?.data?.tournament ? (
            <TournamentForm
              initialData={tournament.data.tournament}
              onSubmitAction={handleSubmit}
              isPending={isPending}
              submitButtonText="Save Changes"
            />
          ) : (
            <div className="flex justify-center py-20 text-[#181818]/60">
              Tournament not found
            </div>
          )}
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={handleSuccessClose}>
        <DialogContent
          showCloseButton={false}
          className="w-[90vw]! sm:w-[515px]! max-w-[515px]! h-auto py-8 bg-white rounded-[12px] p-10 border-none shadow-2xl flex flex-col items-center justify-center"
        >
          <div className="flex flex-col items-center gap-6 w-full max-w-[90%]">
            {/* Circle with check */}
            <div className="w-[120px] h-[120px] rounded-full bg-[#083F92] flex items-center justify-center text-white relative shadow-md">
              <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-[50px] h-[50px]">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            
            {/* Header texts */}
            <div className="flex flex-col items-center gap-2 w-full text-center">
              <h2 className="text-[32px] leading-[43px] font-semibold font-poppins text-[#181818] tracking-[-0.008em] capitalize m-0">
                Updated Successfully!
              </h2>
              <p className="text-[18px] leading-[28px] font-normal font-poppins text-[#565656] tracking-[-0.014em] m-0 break-words max-w-full">
                The tournament details have been saved.
              </p>
            </div>

            <button
              onClick={handleSuccessClose}
              className="mt-4 w-[200px] h-[48px] bg-[#083F92] hover:bg-[#083F92]/90 rounded-[24px] text-white font-poppins font-semibold text-[14px] shadow-md transition-colors"
            >
              Continue
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
