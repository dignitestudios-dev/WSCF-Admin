'use client';

import { useEffect, useState } from 'react';
import { Award, AlertTriangle, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAssignRating } from '@/features/ratings/hooks/use-ratings';

interface EditPlayerRatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playerId: string;
  playerName: string;
  currentRating: number;
}

export function EditPlayerRatingDialog({
  open,
  onOpenChange,
  playerId,
  playerName,
  currentRating,
}: EditPlayerRatingDialogProps) {
  const [rating, setRating] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const { mutateAsync: assignRating, isPending } = useAssignRating();

  useEffect(() => {
    if (open) {
      setRating(currentRating > 0 ? String(currentRating) : '');
      setError(null);
      setShowConfirm(false);
    }
  }, [open, currentRating]);

  const handleRatingChange = (val: string) => {
    // Only whole digits allowed (no decimals, no letters)
    const sanitized = val.replace(/[^0-9]/g, '');
    setRating(sanitized);

    if (!sanitized) {
      setError('Rating is required.');
      return;
    }

    const num = Number(sanitized);
    if (num <= 0) {
      setError('Rating must be a positive whole number greater than 0.');
    } else {
      setError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating.trim()) {
      setError('Please enter a rating.');
      return;
    }

    const num = Number(rating);
    if (num <= 0 || !Number.isInteger(num)) {
      setError('Rating must be a positive whole number greater than 0.');
      return;
    }

    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    try {
      await assignRating({
        childId: playerId,
        payload: {
          rating: Number(rating),
          confirmReassign: true,
        },
      });
      setShowConfirm(false);
      onOpenChange(false);
    } catch {
      // toast shown by hook
    }
  };

  const isValid = rating.trim() !== '' && Number(rating) > 0 && Number.isInteger(Number(rating));

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[480px] rounded-[24px] p-6 bg-white shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-[42px] h-[42px] bg-[#083F92]/10 rounded-full flex items-center justify-center text-[#083F92] shrink-0">
              <Award className="w-5 h-5 text-[#083F92]" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="font-poppins text-[20px] font-semibold text-[#083F92]">
                Edit Player Rating
              </DialogTitle>
              <p className="font-poppins text-[13px] text-[#8C8C8C] break-words break-all [overflow-wrap:anywhere] max-w-full">
                {playerName}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-[12px] bg-[#F8F9FA] border border-[#E9ECEF] p-3 flex items-center justify-between">
            <span className="font-poppins text-[13px] text-[#636363]">Current Rating</span>
            <span className="font-poppins text-[15px] font-bold text-[#083F92]">
              {currentRating > 0 ? currentRating : 'Unrated'}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="new-rating" className="font-poppins font-medium text-[14px] text-[#181818]">
                New Rating <span className="text-red-500">*</span>
              </Label>
              <Input
                id="new-rating"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Enter new rating (e.g. 1350)"
                value={rating}
                onChange={(e) => handleRatingChange(e.target.value)}
                className="h-[48px] rounded-[12px] border border-[#DADADA] px-4 font-poppins text-[15px] focus-visible:ring-1 focus-visible:ring-[#083F92]"
                autoFocus
              />
              {error && (
                <p className="font-poppins text-[12px] font-medium text-red-500">{error}</p>
              )}
            </div>

            {/* Warning Callout */}
            <div className="rounded-[12px] bg-[#FFF8E6] border border-[#FFE4A0] p-3 flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-[#B54708] shrink-0 mt-0.5" />
              <p className="font-poppins text-[12px] text-[#7A3F00] leading-[18px]">
                Modifying this player&apos;s rating will immediately affect their eligibility for upcoming tournaments with rating-restricted divisions.
              </p>
            </div>

            <div className="mt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="h-[44px] px-5 rounded-[100px] border border-[#DADADA] font-poppins text-[13px] font-medium text-[#636363] hover:bg-black/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isValid || isPending}
                className="h-[44px] px-6 rounded-[100px] bg-[#083F92] font-poppins text-[14px] font-semibold text-white shadow-sm hover:bg-[#062c68] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Rating
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Confirm Rating Update"
        tone="danger"
        description={
          `Warning: Are you sure you want to change ${playerName}'s rating from ${
            currentRating > 0 ? currentRating : 'Unrated'
          } to ${rating}? This will immediately affect their division eligibility in tournaments, and the parent will be notified via email and in-app alert.`
        }
        confirmText="Yes, Update Rating"
        loadingText="Updating..."
        isLoading={isPending}
        onConfirm={handleConfirm}
      />
    </>
  );
}
