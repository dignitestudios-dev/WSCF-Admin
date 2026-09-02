'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ChevronLeft, Pencil, Trash2, UserPlus, UsersRound } from 'lucide-react';
import { PageTransition } from '@/components/animations/page-transition';
import { SearchInput } from '@/components/ui/search-input';
import { Pagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ActionIconButton, ActionPillButton } from '@/components/ui/action-button';
import { useDebounce } from '@/hooks/use-debounce';
import {
  useDeleteTeam,
  useRemoveTeamMembers,
  useTeamDetails,
  useTeamMembers,
} from '@/features/teams/hooks/use-teams';
import { AddMembersDialog } from '@/features/teams/components/add-members-dialog';
import { EditTeamDialog } from '@/features/teams/components/edit-team-dialog';

const ITEMS_PER_PAGE = 10;

export default function TeamDetail() {
  const params = useParams();
  const router = useRouter();
  const teamId = String(params?.id ?? '');

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteTeamOpen, setIsDeleteTeamOpen] = useState(false);
  const [pendingRemoval, setPendingRemoval] = useState<string[] | null>(null);

  const { data: detailData, isLoading: isTeamLoading } = useTeamDetails(teamId);
  const { data: membersData, isLoading: areMembersLoading } = useTeamMembers(
    teamId,
    currentPage,
    ITEMS_PER_PAGE,
    debouncedSearch
  );

  const { mutateAsync: removeMembers, isPending: isRemoving } = useRemoveTeamMembers();
  const { mutateAsync: deleteTeam, isPending: isDeletingTeam } = useDeleteTeam();

  const team = detailData?.data?.team;
  const members = useMemo(() => membersData?.data?.members || [], [membersData]);
  const totalPages = membersData?.pagination?.totalPages || 1;
  const totalMembers = membersData?.pagination?.totalItems ?? team?.memberCount ?? 0;

  const memberUserIds = members
    .map((member) => member._id)
    .filter((id): id is string => Boolean(id));

  const allOnPageSelected =
    memberUserIds.length > 0 && memberUserIds.every((id) => selectedIds.includes(id));

  const toggleAllOnPage = () => {
    setSelectedIds((current) =>
      allOnPageSelected
        ? current.filter((id) => !memberUserIds.includes(id))
        : [...new Set([...current, ...memberUserIds])]
    );
  };

  const toggleOne = (playerId: string) => {
    setSelectedIds((current) =>
      current.includes(playerId)
        ? current.filter((id) => id !== playerId)
        : [...current, playerId]
    );
  };

  const handleRemove = async () => {
    if (!pendingRemoval?.length) return;
    try {
      await removeMembers({ teamId, playerIds: pendingRemoval });
      setSelectedIds((current) => current.filter((id) => !pendingRemoval.includes(id)));
      setPendingRemoval(null);
      // The page may no longer exist once the last rows on it are gone.
      if (members.length === pendingRemoval.length && currentPage > 1) {
        setCurrentPage((page) => page - 1);
      }
    } catch {
      // surfaced by the mutation's toast
    }
  };

  const handleDeleteTeam = async () => {
    try {
      await deleteTeam(teamId);
      setIsDeleteTeamOpen(false);
      router.push('/teams');
    } catch {
      // surfaced by the mutation's toast
    }
  };

  // The member is the player — a child. The account underneath is the parent's,
  // and their name is not the one on the roster.
  const memberName = (member: (typeof members)[number]) =>
    member.name ||
    [member.firstName, member.lastName].filter(Boolean).join(' ') ||
    'Unnamed';

  return (
    <PageTransition>
      <div className="flex h-full w-full flex-col gap-6 font-sans select-none">
        {/* Header */}
        <div className="flex w-full flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => router.push('/teams')}
              className="flex w-fit cursor-pointer items-center gap-1.5 text-[#083F92] transition-opacity hover:opacity-80 focus:outline-none"
            >
              <ChevronLeft className="h-5 w-5 stroke-[2.5]" />
              <span className="font-poppins text-[18px] font-medium leading-[27px]">Back</span>
            </button>

            {isTeamLoading ? (
              <Skeleton className="h-9 w-[260px]" />
            ) : (
              <h1 className="m-0 max-w-[calc(100vw-150px)] break-words font-poppins text-[24px] font-bold leading-[36px] text-[#083F92] md:max-w-[500px]">
                {team?.name ?? 'Team not found'}
              </h1>
            )}

            {!isTeamLoading && team && (
              <p className="font-poppins text-[13px] text-[#8C8C8C]">
                {totalMembers} member{totalMembers === 1 ? '' : 's'}
                {team.createdAt ? ` · created ${format(new Date(team.createdAt), 'dd MMM yyyy')}` : ''}
              </p>
            )}
          </div>

          {team && (
            <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
              <ActionPillButton
                icon={UserPlus}
                label="Add Members"
                onClick={() => setIsAddOpen(true)}
                className="flex-1 sm:flex-none"
              />
              <ActionPillButton
                icon={Pencil}
                label="Rename"
                onClick={() => setIsEditOpen(true)}
              />
              <ActionPillButton
                icon={Trash2}
                label="Delete"
                tone="danger"
                onClick={() => setIsDeleteTeamOpen(true)}
              />
            </div>
          )}
        </div>

        {/* Roster */}
        <div className="relative mb-8 flex min-h-[560px] w-full flex-1 flex-col justify-between overflow-hidden rounded-[24px] border border-[#DADADA] bg-white pb-20 shadow-sm">
          <div className="flex flex-col gap-4 border-b border-[#DADADA]/40 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            {/* The total sits on the section heading, so it is visible while
                scrolling the roster rather than only in the page header. */}
            <h2 className="font-poppins text-[18px] font-semibold text-[#181818]">
              Members ({totalMembers})
            </h2>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {selectedIds.length > 0 && (
                <ActionPillButton
                  icon={Trash2}
                  label={`Remove ${selectedIds.length} selected`}
                  tone="danger"
                  onClick={() => setPendingRemoval(selectedIds)}
                />
              )}
              <SearchInput
                value={searchQuery}
                onChangeValue={(value) => {
                  setSearchQuery(value);
                  setCurrentPage(1);
                }}
                placeholder="Search by first name, last name or member ID"
              />
            </div>
          </div>

          <div className="w-full flex-1 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="h-[50px] bg-[#083F92] text-left font-poppins text-[13px] font-semibold text-white">
                  <th className="w-[56px] px-6 py-3">
                    <input
                      type="checkbox"
                      aria-label="Select all members on this page"
                      checked={allOnPageSelected}
                      onChange={toggleAllOnPage}
                      disabled={members.length === 0}
                      className="h-4 w-4 cursor-pointer accent-white"
                    />
                  </th>
                  <th className="px-6 py-3 font-semibold">Name</th>
                  <th className="w-[220px] px-6 py-3 font-semibold">Email</th>
                  <th className="w-[110px] px-6 py-3 font-semibold">Grade</th>
                  <th className="w-[110px] px-6 py-3 font-semibold">Rating</th>
                  <th className="w-[150px] px-6 py-3 font-semibold">Membership ID</th>
                  <th className="w-[110px] px-6 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>

              <tbody>
                {areMembersLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr
                      key={`skeleton-${index}`}
                      className="h-[50px] border-b border-[#DADADA]/30 bg-white"
                    >
                      <td className="px-6 py-3">
                        <Skeleton className="h-4 w-4" />
                      </td>
                      <td className="px-6 py-3">
                        <Skeleton className="h-4 w-[160px]" />
                      </td>
                      <td className="px-6 py-3">
                        <Skeleton className="h-4 w-[180px]" />
                      </td>
                      <td className="px-6 py-3">
                        <Skeleton className="h-4 w-[40px]" />
                      </td>
                      <td className="px-6 py-3">
                        <Skeleton className="h-4 w-[50px]" />
                      </td>
                      <td className="px-6 py-3">
                        <Skeleton className="h-4 w-[90px]" />
                      </td>
                      <td className="px-6 py-3">
                        <Skeleton className="float-right h-4 w-[32px]" />
                      </td>
                    </tr>
                  ))
                ) : members.length > 0 ? (
                  members.map((member, index) => {
                    const isEven = index % 2 !== 0;
                    // The player, not the parent account behind them.
                    const playerId = member._id;
                    const isSelected = Boolean(playerId && selectedIds.includes(playerId));

                    return (
                      <tr
                        key={member.teamMemberId || member._id}
                        className={`h-[50px] border-b border-[#DADADA]/30 font-poppins text-[13px] text-[#636363] ${
                          isEven ? 'bg-[#083F92]/10' : 'bg-white'
                        }`}
                      >
                        <td className="px-6 py-3">
                          <input
                            type="checkbox"
                            aria-label={`Select ${memberName(member)}`}
                            checked={isSelected}
                            disabled={!playerId}
                            onChange={() => playerId && toggleOne(playerId)}
                            className="h-4 w-4 cursor-pointer accent-[#083F92]"
                          />
                        </td>
                        <td className="max-w-[260px] px-6 py-3">
                          {playerId ? (
                            <Link
                              href={`/users/${playerId}`}
                              title={memberName(member)}
                              className="block truncate font-semibold text-[#083F92] hover:underline"
                            >
                              {memberName(member)}
                            </Link>
                          ) : (
                            <span className="font-semibold">{memberName(member)}</span>
                          )}
                        </td>
                        <td
                          className="max-w-[220px] truncate px-6 py-3 font-semibold"
                          title={member.userId?.email}
                        >
                          {member.userId?.email || '—'}
                        </td>
                        <td className="px-6 py-3 font-semibold">{member.grade || '—'}</td>
                        <td className="px-6 py-3 font-semibold">{member.rating ?? '—'}</td>
                        <td className="px-6 py-3 font-semibold">{member.membershipId || '—'}</td>
                        <td className="px-6 py-3">
                          <div className="flex items-center justify-end">
                            <ActionIconButton
                              icon={Trash2}
                              label="Remove from team"
                              tone="danger"
                              disabled={!playerId}
                              onClick={() => playerId && setPendingRemoval([playerId])}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-16">
                      <div className="flex flex-col items-center justify-center gap-3 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#083F92]">
                          <UsersRound className="h-6 w-6 text-white" />
                        </div>
                        <p className="font-poppins text-[14px] font-semibold text-[#181818]">
                          {debouncedSearch ? 'No members match that search' : 'No members yet'}
                        </p>
                        <p className="font-poppins text-[13px] text-[#8C8C8C]">
                          {debouncedSearch
                            ? 'Try a different name or email.'
                            : 'Add players to build this roster.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {!areMembersLoading && members.length > 0 && (
            <div className="absolute bottom-0 left-0 flex w-full items-center justify-between gap-4 border-t border-[#DADADA]/40 bg-white px-6 py-4">
              <span className="font-poppins text-[13px] text-[#8C8C8C]">
                {selectedIds.length > 0
                  ? `${selectedIds.length} selected`
                  : `${totalMembers} member${totalMembers === 1 ? '' : 's'}`}
              </span>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>

      {team && (
        <>
          <AddMembersDialog
            open={isAddOpen}
            onOpenChange={setIsAddOpen}
            teamId={teamId}
            teamName={team.name}
            existingUserIds={memberUserIds}
          />

          <EditTeamDialog open={isEditOpen} onOpenChange={setIsEditOpen} team={team} />
        </>
      )}

      <ConfirmDialog
        open={Boolean(pendingRemoval)}
        onOpenChange={(open) => !open && setPendingRemoval(null)}
        title={
          pendingRemoval && pendingRemoval.length > 1
            ? `Remove ${pendingRemoval.length} members?`
            : 'Remove this member?'
        }
        description="They will be released from the team. Their account and player profile are not affected, and they can be added to a team again at any time."
        confirmText="Remove"
        loadingText="Removing..."
        isLoading={isRemoving}
        onConfirm={handleRemove}
      />

      <ConfirmDialog
        open={isDeleteTeamOpen}
        onOpenChange={setIsDeleteTeamOpen}
        title={`Delete ${team?.name ?? 'team'}?`}
        description={
          totalMembers
            ? `This team has ${totalMembers} member${
                totalMembers === 1 ? '' : 's'
              }. They will be released from the team, but their accounts are not affected.`
            : 'This team will be removed. Its name becomes available again.'
        }
        confirmText="Delete Team"
        loadingText="Deleting..."
        isLoading={isDeletingTeam}
        onConfirm={handleDeleteTeam}
      />
    </PageTransition>
  );
}
