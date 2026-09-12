'use client';

import { useState } from 'react';
import { Award, Ban } from 'lucide-react';
import { SearchInput } from '@/components/ui/search-input';
import { PageTransition } from '@/components/animations/page-transition';
import { Pagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ActionIconButton } from '@/components/ui/action-button';
import { Highlight } from '@/components/ui/highlight';
import { useListParams } from '@/hooks/use-list-params';
import {
  useAssignRating,
  useRatingRequests,
} from '@/features/ratings/hooks/use-ratings';
import { AssignRatingDialog } from '@/features/ratings/components/assign-rating-dialog';
import type { RatingRequestPlayer } from '@/features/ratings/services/rating.service';

/** How long this family has been waiting on someone here. */
function waitingFor(since: string) {
  const days = Math.floor(
    (Date.now() - new Date(since).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (days < 1) return 'Today';
  if (days === 1) return '1 day';
  return `${days} days`;
}

const fullName = (player: RatingRequestPlayer) =>
  [player.firstName, player.lastName].filter(Boolean).join(' ').trim();

function getPrimaryParentInfo(user: RatingRequestPlayer['userId']) {
  if (!user) return { name: '—', email: '' };

  const father = user.parents?.father;
  const mother = user.parents?.mother;

  let primary = null;
  if (father?.isPrimary) {
    primary = father;
  } else if (mother?.isPrimary) {
    primary = mother;
  }

  const name = primary?.name || user.name || '—';
  const email = primary?.email || user.email || '';

  return { name, email };
}

export default function RatingRequests() {
  const {
    page: currentPage,
    setPage: setCurrentPage,
    searchInput: searchQuery,
    setSearchInput: setSearchQuery,
    search: debouncedSearchQuery,
  } = useListParams();

  const itemsPerPage = 10;

  const [playerToAssign, setPlayerToAssign] = useState<RatingRequestPlayer | null>(
    null
  );
  const [playerToLeaveUnrated, setPlayerToLeaveUnrated] =
    useState<RatingRequestPlayer | null>(null);

  const { data, isLoading } = useRatingRequests(
    currentPage,
    itemsPerPage,
    debouncedSearchQuery,
    'pending'
  );
  const { mutateAsync: assign, isPending: isSaving } = useAssignRating();

  const players = data?.data?.players || [];
  const totalPages = data?.pagination?.totalPages || 1;

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const confirmNoRating = async () => {
    if (!playerToLeaveUnrated) return;

    try {
      await assign({
        childId: playerToLeaveUnrated._id,
        payload: {
          noRating: true,
        },
      });
      setPlayerToLeaveUnrated(null);
    } catch {
      // surfaced by the mutation's toast
    }
  };

  return (
    <PageTransition>
      <div className="flex flex-col gap-6 w-full h-full font-sans select-none">
        {/* Top Header Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 w-full sm:max-w-[620px]">
            <h1 className="font-poppins font-bold sm:text-[42px] text-[28px] sm:leading-[63px] leading-[36px] text-[#083F92] m-0 shrink-0">
              Rating Requests
            </h1>

            <div className="w-full sm:w-auto">
              <SearchInput
                value={searchQuery}
                onChangeValue={handleSearch}
                placeholder="Search by first name, last name or member ID"
              />
            </div>
          </div>
        </div>

        {/* Main Table Container Card */}
        <div className="w-full bg-white border border-[#DADADA] rounded-[24px] shadow-sm flex flex-col justify-between overflow-hidden flex-1 relative min-h-[600px] mb-8 pb-20">
          <div className="overflow-x-auto w-full">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#083F92] text-white text-left h-[50px] font-poppins font-semibold text-[13px]">
                  <th className="px-6 py-3 font-semibold w-[130px]">Member ID</th>
                  <th className="px-6 py-3 font-semibold w-auto">Player</th>
                  <th className="px-6 py-3 font-semibold w-[90px]">Grade</th>
                  <th className="px-6 py-3 font-semibold w-auto">Parent</th>
                  <th className="px-6 py-3 font-semibold w-[130px]">Waiting</th>
                  <th className="px-6 py-3 font-semibold text-right w-[190px]">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr
                      key={`skeleton-${i}`}
                      className="h-[50px] border-b border-[#DADADA]/30 bg-white"
                    >
                      <td className="px-6 py-3"><Skeleton className="h-4 w-[90px]" /></td>
                      <td className="px-6 py-3"><Skeleton className="h-4 w-[140px]" /></td>
                      <td className="px-6 py-3"><Skeleton className="h-4 w-[30px]" /></td>
                      <td className="px-6 py-3">
                        <div className="flex flex-col gap-1.5">
                          <Skeleton className="h-3.5 w-[120px]" />
                          <Skeleton className="h-3 w-[150px]" />
                        </div>
                      </td>
                      <td className="px-6 py-3"><Skeleton className="h-4 w-[60px]" /></td>
                      <td className="px-6 py-3">
                        <Skeleton className="ml-auto h-8 w-[150px] rounded-full" />
                      </td>
                    </tr>
                  ))
                ) : players.length > 0 ? (
                  players.map((player, index) => {
                    const isEven = index % 2 !== 0;
                    const parent = getPrimaryParentInfo(player.userId);
                    return (
                      <tr
                        key={player._id}
                        className={`h-[56px] border-b border-[#DADADA]/30 font-poppins text-[13px] text-[#636363] ${
                          isEven ? 'bg-[#083F92]/10' : 'bg-white'
                        }`}
                      >
                        <td className="px-6 py-3 font-semibold text-nowrap">
                          <Highlight
                            text={player.membershipId ?? '—'}
                            query={debouncedSearchQuery}
                          />
                        </td>

                        <td className="px-6 py-3 font-semibold text-[#181818] max-w-[200px] truncate" title={fullName(player)}>
                          <Highlight
                            text={fullName(player)}
                            query={debouncedSearchQuery}
                          />
                        </td>

                        <td className="px-6 py-3 font-semibold">
                          {player.grade || '—'}
                        </td>

                        <td className="px-6 py-2.5 max-w-[260px]">
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-[#181818] truncate leading-[18px]">
                              <Highlight
                                text={parent.name}
                                query={debouncedSearchQuery}
                              />
                            </span>
                            {parent.email ? (
                              <span
                                className="text-[12px] text-[#636363] truncate leading-[16px]"
                                title={parent.email}
                              >
                                <Highlight
                                  text={parent.email}
                                  query={debouncedSearchQuery}
                                />
                              </span>
                            ) : null}
                          </div>
                        </td>

                        <td className="px-6 py-3 font-semibold">
                          {waitingFor(player.createdAt)}
                        </td>

                        <td className="px-6 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <ActionIconButton
                              icon={Award}
                              label="Assign rating"
                              onClick={() => setPlayerToAssign(player)}
                            />
                            <ActionIconButton
                              icon={Ban}
                              label="Start with no rating"
                              tone="danger"
                              onClick={() => setPlayerToLeaveUnrated(player)}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-16 text-center font-poppins text-[14px] text-[#8C8C8C]"
                    >
                      {debouncedSearchQuery
                        ? `No player matches "${debouncedSearchQuery}".`
                        : 'Nothing waiting. Every player has had their rating assigned or set as unrated.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              className="absolute right-[24px] bottom-[16px]"
            />
          )}
        </div>
      </div>

      <AssignRatingDialog
        open={Boolean(playerToAssign)}
        onOpenChange={(open) => !open && setPlayerToAssign(null)}
        player={playerToAssign}
      />

      <ConfirmDialog
        open={Boolean(playerToLeaveUnrated)}
        onOpenChange={(open) => !open && setPlayerToLeaveUnrated(null)}
        title="Start with no rating?"
        description={
          playerToLeaveUnrated
            ? `${fullName(playerToLeaveUnrated)} will start unrated. They can still enter tournaments, but not divisions with a minimum rating.`
            : ''
        }
        confirmText="Confirm"
        onConfirm={confirmNoRating}
        isLoading={isSaving}
      />
    </PageTransition>
  );
}
