'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Pencil, Trash2, UsersRound } from 'lucide-react';
import { PageTransition } from '@/components/animations/page-transition';
import { SearchInput } from '@/components/ui/search-input';
import { Pagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ActionIconButton, ActionPillButton } from '@/components/ui/action-button';
import { useDebounce } from '@/hooks/use-debounce';
import { useDeleteTeam, useTeams } from '@/features/teams/hooks/use-teams';
import { Team } from '@/features/teams/services/team.service';
import { CreateTeamDialog } from '@/features/teams/components/create-team-dialog';
import { EditTeamDialog } from '@/features/teams/components/edit-team-dialog';

const ITEMS_PER_PAGE = 10;

export default function Teams() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [currentPage, setCurrentPage] = useState(1);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [teamToEdit, setTeamToEdit] = useState<Team | null>(null);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);

  const { data, isLoading } = useTeams(currentPage, ITEMS_PER_PAGE, debouncedSearch);
  const { mutateAsync: deleteTeam, isPending: isDeleting } = useDeleteTeam();

  const teams = data?.data?.teams || [];
  const totalPages = data?.pagination?.totalPages || 1;
  const totalItems = data?.pagination?.totalItems ?? teams.length;

  const handleDelete = async () => {
    if (!teamToDelete) return;
    try {
      await deleteTeam(teamToDelete._id);
      setTeamToDelete(null);
      // Deleting the last row of the last page would otherwise strand the view
      // on a page that no longer exists.
      if (teams.length === 1 && currentPage > 1) setCurrentPage((page) => page - 1);
    } catch {
      // surfaced by the mutation's toast
    }
  };

  return (
    <PageTransition>
      <div className="flex h-full w-full flex-col gap-6 font-sans select-none">
        {/* Header: title, search, create */}
        <div className="flex w-full flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="flex w-full flex-col gap-4 sm:max-w-[500px] sm:flex-row sm:items-center sm:gap-6">
            <h1 className="m-0 shrink-0 font-poppins text-[28px] font-bold leading-[36px] text-[#083F92] sm:text-[42px] sm:leading-[63px]">
              Teams
            </h1>
            <div className="w-full sm:w-auto">
              <SearchInput
                value={searchQuery}
                onChangeValue={(value) => {
                  setSearchQuery(value);
                  setCurrentPage(1);
                }}
                placeholder="Search teams"
              />
            </div>
          </div>

          <ActionPillButton
            icon={UsersRound}
            label="Create Team"
            onClick={() => setIsCreateOpen(true)}
            className="w-full sm:w-auto"
          />
        </div>

        {/* Table */}
        <div className="relative mb-8 flex min-h-[600px] w-full flex-1 flex-col justify-between overflow-hidden rounded-[24px] border border-[#DADADA] bg-white pb-20 shadow-sm">
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="h-[50px] bg-[#083F92] text-left font-poppins text-[13px] font-semibold text-white">
                  <th className="w-[70px] px-6 py-3 font-semibold">No</th>
                  <th className="px-6 py-3 font-semibold">Team Name</th>
                  <th className="w-[110px] px-6 py-3 font-semibold">Code</th>
                  <th className="w-[140px] px-6 py-3 font-semibold">Members</th>
                  <th className="w-[160px] px-6 py-3 font-semibold">Created</th>
                  <th className="w-[160px] px-6 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr
                      key={`skeleton-${index}`}
                      className="h-[50px] border-b border-[#DADADA]/30 bg-white"
                    >
                      <td className="px-6 py-3">
                        <Skeleton className="h-4 w-[30px]" />
                      </td>
                      <td className="px-6 py-3">
                        <Skeleton className="h-4 w-[200px]" />
                      </td>
                      <td className="px-6 py-3">
                        <Skeleton className="h-4 w-[60px]" />
                      </td>
                      <td className="px-6 py-3">
                        <Skeleton className="h-4 w-[100px]" />
                      </td>
                      <td className="px-6 py-3">
                        <Skeleton className="float-right h-4 w-[90px]" />
                      </td>
                    </tr>
                  ))
                ) : teams.length > 0 ? (
                  teams.map((team, index) => {
                    const isEven = index % 2 !== 0;
                    const rowNumber = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;

                    return (
                      <tr
                        key={team._id}
                        onClick={() => router.push(`/teams/${team._id}`)}
                        className={`h-[50px] cursor-pointer border-b border-[#DADADA]/30 font-poppins text-[13px] text-[#636363] transition-colors hover:bg-[#083F92]/15 ${
                          isEven ? 'bg-[#083F92]/10' : 'bg-white'
                        }`}
                      >
                        <td className="px-6 py-3 font-semibold">
                          {rowNumber.toString().padStart(2, '0')}
                        </td>
                        <td className="max-w-[320px] px-6 py-3">
                          <span
                            title={team.name}
                            className="block truncate font-semibold text-[#083F92]"
                          >
                            {team.name}
                          </span>
                        </td>
                        {/* The code WinTD knows this team by. It appears in the
                            entry files we hand over and the result files that
                            come back, so an admin reading WinTD needs it here. */}
                        <td className="px-6 py-3">
                          <span className="font-mono text-[12px] tracking-wide text-[#636363]">
                            {team.code || '—'}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <span className="inline-flex items-center rounded-full bg-[#083F92]/10 px-3 py-1 text-[12px] font-semibold text-[#083F92]">
                            {team.memberCount ?? 0}
                          </span>
                        </td>
                        <td className="px-6 py-3 font-semibold">
                          {team.createdAt ? format(new Date(team.createdAt), 'dd MMM yyyy') : '—'}
                        </td>
                        <td className="px-6 py-3">
                          {/* Stops the row link from firing underneath. */}
                          <div
                            className="flex items-center justify-end gap-2"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <ActionIconButton
                              icon={Pencil}
                              label="Rename team"
                              onClick={() => setTeamToEdit(team)}
                            />
                            <ActionIconButton
                              icon={Trash2}
                              label="Delete team"
                              tone="danger"
                              onClick={() => setTeamToDelete(team)}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-16">
                      <div className="flex flex-col items-center justify-center gap-3 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#083F92]">
                          <UsersRound className="h-6 w-6 text-white" />
                        </div>
                        <p className="font-poppins text-[14px] font-semibold text-[#181818]">
                          {debouncedSearch ? 'No teams match that search' : 'No teams yet'}
                        </p>
                        <p className="font-poppins text-[13px] text-[#8C8C8C]">
                          {debouncedSearch
                            ? 'Try a different name.'
                            : 'Create a team to start grouping players.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {!isLoading && teams.length > 0 && (
            <div className="absolute bottom-0 left-0 flex w-full items-center justify-between gap-4 border-t border-[#DADADA]/40 bg-white px-6 py-4">
              <span className="font-poppins text-[13px] text-[#8C8C8C]">
                {totalItems} team{totalItems === 1 ? '' : 's'}
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

      <CreateTeamDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />

      <EditTeamDialog
        open={Boolean(teamToEdit)}
        onOpenChange={(open) => !open && setTeamToEdit(null)}
        team={teamToEdit}
      />

      <ConfirmDialog
        open={Boolean(teamToDelete)}
        onOpenChange={(open) => !open && setTeamToDelete(null)}
        title={`Delete ${teamToDelete?.name ?? 'team'}?`}
        description={
          teamToDelete?.memberCount
            ? `This team has ${teamToDelete.memberCount} member${
                teamToDelete.memberCount === 1 ? '' : 's'
              }. They will be released from the team, but their accounts are not affected.`
            : 'This team will be removed. Its name becomes available again.'
        }
        confirmText="Delete Team"
        loadingText="Deleting..."
        isLoading={isDeleting}
        onConfirm={handleDelete}
      />
    </PageTransition>
  );
}
