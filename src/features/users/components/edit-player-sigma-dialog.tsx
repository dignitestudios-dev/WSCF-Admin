'use client';

import { useState } from 'react';
import { Award } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/lib/toast';
import { useUpdateUser } from '../hooks/use-users';

// Matches the limit the API enforces.
const SIGMA_MAX_LENGTH = 30;

interface EditPlayerSigmaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playerId: string;
  playerName: string;
  currentSigma: string | null | undefined;
}

/**
 * Updates one thing: the player's sigma. The rating has its own dialog and the
 * full profile dialog edits everything else, so this sends nothing but `sigma`.
 *
 * Saving an empty box sends "" on purpose — the API reads that as "clear it".
 * Leaving the field out would mean "leave it alone", which is why the profile
 * dialog cannot clear a sigma that has been set.
 */
export function EditPlayerSigmaDialog({ open, onOpenChange, ...formProps }: EditPlayerSigmaDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-[24px] p-6 bg-white shadow-xl">
        {/* Mounted only while open, so the box starts from the saved value each time. */}
        {open && <SigmaForm onClose={() => onOpenChange(false)} {...formProps} />}
      </DialogContent>
    </Dialog>
  );
}

function SigmaForm({
  onClose,
  playerId,
  playerName,
  currentSigma,
}: Omit<EditPlayerSigmaDialogProps, 'open' | 'onOpenChange'> & { onClose: () => void }) {
  const saved = (currentSigma ?? '').trim();
  const [sigma, setSigma] = useState(saved);
  const { mutateAsync: updateUser, isPending } = useUpdateUser(playerId);

  const unchanged = sigma.trim() === saved;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (unchanged) return;

    try {
      await updateUser({ sigma: sigma.trim() });
      toast.success(sigma.trim() ? 'Sigma updated successfully' : 'Sigma cleared');
      onClose();
    } catch (error) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message || 'Could not update sigma. Please try again.');
    }
  };

  return (
    <>
        <div className="flex items-center gap-3">
          <div className="w-[42px] h-[42px] bg-[#083F92]/10 rounded-full flex items-center justify-center text-[#083F92] shrink-0">
            <Award className="w-5 h-5 text-[#083F92]" />
          </div>
          <div className="min-w-0 flex-1">
            <DialogTitle className="font-poppins text-[20px] font-semibold text-[#083F92]">
              Edit Sigma
            </DialogTitle>
            <p className="font-poppins text-[13px] text-[#8C8C8C] break-words [overflow-wrap:anywhere] max-w-full">
              {playerName}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-[12px] bg-[#F8F9FA] border border-[#E9ECEF] p-3 flex items-center justify-between gap-4">
          <span className="font-poppins text-[13px] text-[#636363]">Current Sigma</span>
          <span className="font-poppins text-[15px] font-bold text-[#083F92] break-words [overflow-wrap:anywhere] text-right">
            {saved || 'Not set'}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="player-sigma" className="font-poppins font-medium text-[14px] text-[#181818]">
              New Sigma <span className="text-[#8C8C8C] font-normal">(leave empty to clear)</span>
            </Label>
            <Input
              id="player-sigma"
              type="text"
              placeholder="Enter sigma"
              maxLength={SIGMA_MAX_LENGTH}
              value={sigma}
              onChange={(e) => setSigma(e.target.value)}
              className="h-[48px] rounded-[12px] border border-[#DADADA] px-4 font-poppins text-[15px] focus-visible:ring-1 focus-visible:ring-[#083F92]"
              autoFocus
            />
          </div>

          <div className="mt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-[44px] px-5 rounded-[100px] border border-[#DADADA] font-poppins text-[13px] font-medium text-[#636363] hover:bg-black/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={unchanged || isPending}
              className="h-[44px] px-6 rounded-[100px] bg-[#083F92] font-poppins text-[14px] font-semibold text-white shadow-sm hover:bg-[#062c68] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Saving...' : 'Update Sigma'}
            </button>
          </div>
        </form>
    </>
  );
}
