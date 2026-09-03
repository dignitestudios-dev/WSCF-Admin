'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Highlight } from '@/components/ui/highlight';
import { SearchInput } from '@/components/ui/search-input';
import { useDebounce } from '@/hooks/use-debounce';
import {
  useAssignRating,
  useMasterFileSearch,
} from '@/features/ratings/hooks/use-ratings';
import type { RatingRequestPlayer } from '@/features/ratings/services/rating.service';

interface AssignRatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  player: RatingRequestPlayer | null;
}

const fullName = (player: RatingRequestPlayer | null) =>
  player ? [player.firstName, player.lastName].filter(Boolean).join(' ').trim() : '';

/**
 * Finding a player's previous rating in the master file.
 *
 * Opens pre-searched on the player's name, because that is what an admin would
 * type anyway. Claimed records stay in the list but cannot be picked — seeing
 * that a record exists and is taken answers "why can I not find them", which
 * hiding it does not.
 */
export function AssignRatingDialog({
  open,
  onOpenChange,
  player,
}: AssignRatingDialogProps) {
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search, 400);
  const [confirming, setConfirming] = useState<{
    recordId: string | null;
    label: string;
    rating: number | string;
  } | null>(null);

  const { data, isLoading } = useMasterFileSearch(open ? debounced : '');
  const { mutateAsync: assign, isPending: isSaving } = useAssignRating();

  const records = data?.data?.records ?? [];
  const isReassignment = player ? player.ratingStatus !== 'pending' : false;

  // A different player means a different search. Without this the dialog opens
  // showing the previous child's results.
  useEffect(() => {
    if (open) {
      setSearch(fullName(player));
      setConfirming(null);
    }
  }, [open, player?._id]);

  const commit = async () => {
    if (!confirming || !player) return;

    try {
      const payload =
        confirming.recordId === null
          ? { noRating: true as const, confirmReassign: isReassignment }
          : {
              masterPlayerId: confirming.recordId,
              confirmReassign: isReassignment,
            };

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

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[640px] rounded-[24px] p-6">
          <DialogTitle className="font-poppins text-[22px] font-semibold text-[#083F92]">
            {isReassignment ? 'Change Rating' : 'Assign Rating'}
          </DialogTitle>

          <p className="font-poppins text-[13px] text-[#8C8C8C]">
            <span className="font-semibold text-[#181818]">{fullName(player)}</span>
            {player?.membershipId ? ` — ${player.membershipId}` : ''}
            {player?.grade ? ` · Grade ${player.grade}` : ''}
          </p>

          {isReassignment && (
            <p className="mt-2 rounded-[12px] bg-[#FFF4E5] px-4 py-3 font-poppins text-[13px] text-[#B54708]">
              Currently rated {player?.rating}. Choosing a different record
              releases the one they hold now, so it can go to another player.
            </p>
          )}

          <div className="mt-4">
            <SearchInput
              value={search}
              onChangeValue={setSearch}
              placeholder="Search by first name, last name, USCF ID or team"
            />
          </div>

          <div className="mt-4 max-h-[340px] overflow-y-auto">
            {isLoading ? (
              <div className="flex flex-col gap-3">
                {[0, 1, 2].map((key) => (
                  <Skeleton key={key} className="h-[58px] w-full rounded-[12px]" />
                ))}
              </div>
            ) : records.length === 0 ? (
              <div className="py-10 text-center font-poppins text-[13px] text-[#8C8C8C]">
                {debounced.trim() ? (
                  <div className="flex flex-col items-center">
                    <span>No master file record matches &quot;{debounced}&quot;.</span>
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => setConfirming({ recordId: null, label: 'Unrated', rating: 'Unrated' })}
                      className="mt-4 rounded-[100px] bg-[#083F92] px-6 py-2.5 font-poppins text-[13px] font-semibold text-white transition-colors hover:bg-[#062c68] disabled:opacity-50"
                    >
                      Start with no rating
                    </button>
                  </div>
                ) : (
                  'Type a name or USCF ID to search the master file.'
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {records.map((record) => {
                  const name =
                    [record.firstName, record.lastName].filter(Boolean).join(' ') ||
                    record.rawName;

                  return (
                    <button
                      key={record._id}
                      type="button"
                      disabled={record.isClaimed || isSaving}
                      onClick={() =>
                        setConfirming({
                          recordId: record._id,
                          label: name,
                          rating: record.localRating,
                        })
                      }
                      className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-[12px] border border-[#DADADA] px-4 py-3 text-left transition-colors hover:border-[#083F92] hover:bg-[#083F92]/5 disabled:cursor-not-allowed disabled:border-[#EAEAEA] disabled:bg-[#F6F6F6] disabled:hover:bg-[#F6F6F6]"
                    >
                      {/* Name and rating only. The rating is the sole thing
                          being copied onto the player, so grade and team were
                          detail to weigh up that never affects the decision. */}
                      <span className="min-w-0 truncate font-poppins text-[14px] font-semibold text-[#181818]">
                        <Highlight text={name} query={debounced} />
                      </span>

                      <span className="flex shrink-0 items-center gap-2">
                        {record.isClaimed && (
                          <span className="rounded-full bg-[#FDECEA] px-2.5 py-0.5 font-poppins text-[11px] font-semibold text-[#B42318]">
                            Already assigned
                          </span>
                        )}
                        <span className="font-poppins text-[16px] font-bold text-[#083F92]">
                          {record.localRating}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {records.length > 0 && (
            <div className="mt-4 flex justify-center border-t border-[#DADADA]/50 pt-4">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => setConfirming({ recordId: null, label: 'Unrated', rating: 'Unrated' })}
                className="rounded-[100px] border border-[#083F92] px-6 py-2 font-poppins text-[13px] font-semibold text-[#083F92] transition-colors hover:bg-[#083F92]/5 disabled:opacity-50"
              >
                Player not in list? Start with no rating
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(confirming)}
        onOpenChange={(open: boolean) => !open && setConfirming(null)}
        title={confirming?.recordId === null ? 'Start with no rating?' : isReassignment ? 'Change this rating?' : 'Assign this rating?'}
        description={
          confirming && player
            ? confirming.recordId === null
              ? `${player.firstName} will start unrated. They can still enter tournaments, but not divisions with a minimum rating.`
              : `${player.firstName} will be rated ${confirming.rating}, taken from ${confirming.label}. This decides which divisions they can enter, and the record cannot then go to anyone else.`
            : ''
        }
        confirmText={confirming?.recordId === null ? 'Confirm' : isReassignment ? 'Change rating' : 'Assign rating'}
        onConfirm={commit}
        isLoading={isSaving}
      />
    </>
  );
}
