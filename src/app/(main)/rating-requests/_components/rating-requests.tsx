'use client';

import { useState } from 'react';
import { Search, Ban } from 'lucide-react';
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

const TABS = [
  { key: 'pending', label: 'Pending' },
  { key: 'assigned', label: 'Assigned' },
] as const;

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

export default function RatingRequests() {
  const {
    page: currentPage,
    setPage: setCurrentPage,
    searchInput: searchQuery,
    setSearchInput: setSearchQuery,
    search: debouncedSearchQuery,
    getFilter,
    setFilter,
  } = useListParams({ defaultFilters: { tab: 'pending' } });

  const itemsPerPage = 10;
  const tab = getFilter('tab') as 'pending' | 'assigned';

  const [playerToAssign, setPlayerToAssign] = useState<RatingRequestPlayer | null>(
    null
  );
  const [playerToLeaveUnrated, setPlayerToLeaveUnrated] =
    useState<RatingRequestPlayer | null>(null);

  const { data, isLoading } = useRatingRequests(
    currentPage,
    itemsPerPage,
    debouncedSearchQuery,
    tab
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
          confirmReassign: playerToLeaveUnrated.ratingStatus !== 'pending',
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
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

          {/* Pending / Assigned */}
          <div
            className="flex items-center gap-2 rounded-[100px] bg-[#083F92]/10 p-1.5 shrink-0"
            role="tablist"
          >
            {TABS.map((item) => {
              const isActive = tab === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setFilter('tab', item.key)}
                  className={`h-[54px] cursor-pointer rounded-[100px] px-6 font-poppins text-[14px] font-medium tracking-[-0.019em] transition-colors focus:outline-none ${
                    isActive
                      ? 'bg-[#083F92] text-white shadow-md'
                      : 'text-[#000000]/70 hover:text-[#083F92]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
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
                  <th className="px-6 py-3 font-semibold w-[130px]">
                    {tab === 'pending' ? 'Waiting' : 'Rating'}
                  </th>
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
                      <td className="px-6 py-3"><Skeleton className="h-4 w-[160px]" /></td>
                      <td className="px-6 py-3"><Skeleton className="h-4 w-[60px]" /></td>
                      <td className="px-6 py-3">
                        <Skeleton className="ml-auto h-8 w-[150px] rounded-full" />
                      </td>
                    </tr>
                  ))
                ) : players.length > 0 ? (
                  players.map((player, index) => {
                    const isEven = index % 2 !== 0;
                    return (
                      <tr
                        key={player._id}
                        className={`h-[50px] border-b border-[#DADADA]/30 font-poppins text-[13px] text-[#636363] ${
                          isEven ? 'bg-[#083F92]/10' : 'bg-white'
                        }`}
                      >
                        <td className="px-6 py-3 font-semibold text-nowrap">
                          <Highlight
                            text={player.membershipId ?? '—'}
                            query={debouncedSearchQuery}
                          />
                        </td>

                        <td className="px-6 py-3 font-semibold text-[#181818]">
                          <Highlight
                            text={fullName(player)}
                            query={debouncedSearchQuery}
                          />
                        </td>

                        <td className="px-6 py-3 font-semibold">
                          {player.grade || '—'}
                        </td>

                        <td className="px-6 py-3 max-w-[240px] truncate" title={player.userId?.email}>
                          {player.userId?.name || '—'}
                        </td>

                        <td className="px-6 py-3 font-semibold">
                          {tab === 'pending' ? (
                            waitingFor(player.createdAt)
                          ) : player.ratingStatus === 'unrated' ? (
                            <span className="rounded-full bg-[#F4F4F4] px-2.5 py-0.5 text-[11px] font-semibold text-[#8C8C8C]">
                              Unrated
                            </span>
                          ) : (
                            <span className="text-[#083F92]">{player.rating}</span>
                          )}
                        </td>

                        <td className="px-6 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <ActionIconButton
                              icon={Search}
                              label={
                                tab === 'pending'
                                  ? 'Assign rating'
                                  : 'Change rating'
                              }
                              onClick={() => setPlayerToAssign(player)}
                            />
                            {/* Reachable without opening the dialog: most new
                                players have no record to find, and making the
                                admin search first to learn that is busywork. */}
                            <ActionIconButton
                              icon={Ban}
                              label="Start with no rating"
                              tone="danger"
                              disabled={player.ratingStatus === 'unrated'}
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
                        : tab === 'pending'
                          ? 'Nothing waiting. Every player has had their rating looked up.'
                          : 'No ratings assigned yet.'}
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
