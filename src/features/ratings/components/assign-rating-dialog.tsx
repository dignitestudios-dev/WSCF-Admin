'use client';

import { useEffect, useState } from 'react';
import { Award, Ban } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAssignRating } from '@/features/ratings/hooks/use-ratings';
import type { RatingRequestPlayer } from '@/features/ratings/services/rating.service';

interface AssignRatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  player: RatingRequestPlayer | null;
}

const fullName = (player: RatingRequestPlayer | null) =>
  player ? [player.firstName, player.lastName].filter(Boolean).join(' ').trim() : '';

export function AssignRatingDialog({
  open,
  onOpenChange,
  player,
}: AssignRatingDialogProps) {
  const [rating, setRating] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<{
    type: 'rating' | 'noRating';
    value?: number;
  } | null>(null);

  const { mutateAsync: assign, isPending: isSaving } = useAssignRating();

  useEffect(() => {
    if (open) {
      setRating('');
      setError(null);
      setConfirming(null);
    }
  }, [open, player?._id]);

  const handleRatingChange = (val: string) => {
    // Only allow digits
    const sanitized = val.replace(/[^0-9]/g, '');
    setRating(sanitized);

    if (!sanitized) {
      setError(null);
      return;
    }

    const num = Number(sanitized);
    if (num <= 0) {
      setError('Rating must be a whole number greater than 0.');
    } else {
      setError(null);
    }
  };

  const handleAssignClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) {
      setError('Please enter a rating.');
      return;
    }

    const num = Number(rating);
    if (num <= 0 || !Number.isInteger(num)) {
      setError('Rating must be a whole number greater than 0.');
      return;
    }

    setConfirming({ type: 'rating', value: num });
  };

  const handleStartWithNoRatingClick = () => {
    setConfirming({ type: 'noRating' });
  };

  const commit = async () => {
    if (!confirming || !player) return;

    try {
      const payload =
        confirming.type === 'noRating'
          ? { noRating: true as const }
          : { rating: confirming.value as number };

      await assign({
        childId: player._id,
        payload,
      });
      setConfirming(null);
      onOpenChange(false);
    } catch {
      // surfaced by the mutation's toast
    }
  };

  const isValidRating = rating.trim() !== '' && Number(rating) > 0 && Number.isInteger(Number(rating));

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] rounded-[24px] p-6 bg-white shadow-xl">
          <DialogTitle className="font-poppins text-[22px] font-semibold text-[#083F92]">
            Assign Rating
          </DialogTitle>

          <p className="font-poppins text-[13px] text-[#8C8C8C] mt-1">
            <span className="font-semibold text-[#181818]">{fullName(player)}</span>
            {player?.membershipId ? ` — ${player.membershipId}` : ''}
            {player?.grade ? ` · Grade ${player.grade}` : ''}
          </p>

          <form onSubmit={handleAssignClick} className="mt-5 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="manual-rating" className="font-poppins font-medium text-[14px] text-[#181818]">
                Manual Rating <span className="text-red-500">*</span>
              </Label>
              <Input
                id="manual-rating"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Enter rating (e.g. 1200)"
                value={rating}
                onChange={(e) => handleRatingChange(e.target.value)}
                className="h-[48px] rounded-[12px] border border-[#DADADA] px-4 font-poppins text-[15px] focus-visible:ring-1 focus-visible:ring-[#083F92]"
                autoFocus
              />
              {error && (
                <p className="font-poppins text-[12px] font-medium text-red-500">{error}</p>
              )}
            </div>

            <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="submit"
                disabled={!isValidRating || isSaving}
                className="w-full sm:flex-1 h-[46px] flex items-center justify-center gap-2 rounded-[100px] bg-[#083F92] px-6 font-poppins text-[14px] font-semibold text-white shadow-sm transition-colors hover:bg-[#062c68] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Award className="w-4 h-4" />
                <span>Assign Rating</span>
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={handleStartWithNoRatingClick}
                className="w-full sm:w-auto h-[46px] flex items-center justify-center gap-2 rounded-[100px] border border-[#DADADA] bg-white px-5 font-poppins text-[13px] font-medium text-[#636363] transition-colors hover:border-[#CE2D32] hover:text-[#CE2D32] disabled:opacity-50"
              >
                <Ban className="w-4 h-4" />
                <span>Start with no rating</span>
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(confirming)}
        onOpenChange={(open: boolean) => !open && setConfirming(null)}
        title={confirming?.type === 'noRating' ? 'Start with no rating?' : 'Assign this rating?'}
        description={
          confirming && player
            ? confirming.type === 'noRating'
              ? `${fullName(player)} will start unrated (rating 0). They can still enter tournaments, but not divisions with a minimum rating.`
              : `${fullName(player)} will be assigned a rating of ${confirming.value}. This will determine their division eligibility in tournaments.`
            : ''
        }
        confirmText={confirming?.type === 'noRating' ? 'Confirm Unrated' : 'Assign Rating'}
        onConfirm={commit}
        isLoading={isSaving}
      />
    </>
  );
}
