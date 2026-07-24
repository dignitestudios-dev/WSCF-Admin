'use client';

import { useState, useMemo } from 'react';
import { 
  Check, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageTransition } from '@/components/animations/page-transition';
import { CreateTeamForm } from '@/features/teams/components/create-team-form';
import { TeamFormData } from '@/features/teams/schema/team.schema';
import { toast } from 'sonner';
import { ConfirmDeleteDialog } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useTeams } from '@/features/teams/hooks/use-teams';
import { useCreateTeam } from '@/features/teams/hooks/use-create-team';
import { useDeleteTeam } from '@/features/teams/hooks/use-delete-team';

interface TeamItem {
  id: string;
  name: string;
  code: string;
}

const getPaginationRange = (current: number, total: number) => {
  if (total <= 3) return Array.from({ length: total }, (_, i) => i + 1);
  if (current === 1) return [1, 2, 3];
  if (current === total) return [total - 2, total - 1, total];
  return [current - 1, current, current + 1];
};

export default function CreateTeam() {
  const router = useRouter();
  
  // Confirmation state
  const [teamToDelete, setTeamToDelete] = useState<TeamItem | null>(null);
  const [requestToReject, setRequestToReject] = useState<TeamItem | null>(null);

  // State for Create Team Requests
  const [teamRequests, setTeamRequests] = useState<TeamItem[]>([
    { id: 'r1', name: 'Milwaukee Knights School', code: '00000001' },
    { id: 'r2', name: 'Milwaukee Knights School', code: '00000002' },
    { id: 'r3', name: 'Milwaukee Knights School', code: '00000003' },
    { id: 'r4', name: 'Milwaukee Knights School', code: '00000004' },
    { id: 'r5', name: 'Milwaukee Knights School', code: '00000005' },
    { id: 'r6', name: 'Milwaukee Knights School', code: '00000006' },
    { id: 'r7', name: 'Milwaukee Knights School', code: '00000007' },
  ]);

  // Pagination states
  const [createdTeamsPage, setCreatedTeamsPage] = useState(1);
  const [requestsPage, setRequestsPage] = useState(1);
  const itemsPerPage = 5; // 5 items per page matches standard row limits

  // TanStack Query & Mutation hooks
  const { data: teamsData, isLoading: loading, isFetching } = useTeams(createdTeamsPage, itemsPerPage);
  const { mutateAsync: createTeam, isPending: isCreating } = useCreateTeam();
  const { mutateAsync: deleteTeam, isPending: isDeleting } = useDeleteTeam();

  // Map API response to UI items
  const createdTeams = useMemo(() => {
    if (!teamsData?.data?.teams) return [];
    return teamsData.data.teams.map((t) => ({
      id: t._id,
      name: t.name,
      code: t.teamCode || t._id.substring(0, 8).toUpperCase(),
    }));
  }, [teamsData]);

  const totalCreatedTeamsPages = useMemo(() => {
    return teamsData?.pagination?.totalPages || 1;
  }, [teamsData]);

  // Since we fetch paginated teams from the backend, we display the current page's teams directly
  const paginatedCreatedTeams = createdTeams;

  // Pagination for Requests
  const paginatedRequests = useMemo(() => {
    const start = (requestsPage - 1) * itemsPerPage;
    return teamRequests.slice(start, start + itemsPerPage);
  }, [teamRequests, requestsPage]);

  const totalRequestsPages = Math.max(1, Math.ceil(teamRequests.length / itemsPerPage));

  // Handlers
  const handleCreateTeam = async (data: TeamFormData) => {
    try {
      await createTeam({
        name: data.teamName,
        teamCode: data.teamCode
      });
      // React query automatically refetches on mutation success
    } catch (e) {
      // Error handling is managed by the mutation hook onError callback
      throw e;
    }
  };

  const handleDeleteCreatedTeam = (team: TeamItem) => {
    setTeamToDelete(team);
  };

  const executeDeleteTeam = async () => {
    if (teamToDelete) {
      try {
        await deleteTeam(teamToDelete.id);
        setTeamToDelete(null);
        // React query automatically refetches on mutation success
      } catch {
        // Error handling is managed by the mutation hook onError callback
      }
    }
  };

  const handleApproveRequest = async (request: TeamItem) => {
    try {
      await createTeam({
        name: request.name,
        teamCode: request.code,
      });
      setTeamRequests(teamRequests.filter(r => r.id !== request.id));
      // React query automatically refetches on mutation success
    } catch {
      // Error handling is managed by the mutation hook onError callback
    }
  };

  const handleRejectRequest = (request: TeamItem) => {
    setRequestToReject(request);
  };

  const executeRejectRequest = () => {
    if (requestToReject) {
      setTeamRequests(teamRequests.filter(r => r.id !== requestToReject.id));
      toast.success(`Team request for "${requestToReject.name}" rejected`);
      setRequestToReject(null);
    }
  };

  return (
    <PageTransition>
      <div className="flex flex-col gap-8 w-full h-full font-sans select-none pb-12">
        
        {/* Top Grid: Create Form (Left) & Created Teams List (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-[403px_1fr] gap-6 items-start w-full">
          
          {/* Left Column: Create Team Card */}
          <div className="flex flex-col gap-4">
            <h2 className="font-poppins font-bold text-[24px] leading-[36px] text-[#083F92] m-0">
              Create Team
            </h2>
            <CreateTeamForm onSubmitSuccess={handleCreateTeam} isLoading={isCreating} />
          </div>

          {/* Right Column: Created Teams Card */}
          <div className="flex flex-col gap-4 w-full h-full">
            <h2 className="font-poppins font-bold text-[24px] leading-[36px] text-[#083F92] m-0">
              Created Teams
            </h2>

            <div className="w-full bg-white border border-[#DADADA] rounded-[24px] shadow-sm flex flex-col justify-between overflow-hidden min-h-[384px] h-[384px] relative pb-16">
              <div className="w-full">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#083F92] text-white text-left h-[50px] font-poppins font-semibold text-[13px]">
                      <th className="px-6 py-3 font-semibold w-[60%]">Team Name</th>
                      <th className="px-6 py-3 font-semibold w-[25%]">Team Code</th>
                      <th className="px-6 py-3 font-semibold text-right w-[15%]">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isFetching || loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={`skeleton-${i}`} className="h-[50px] border-b border-[#EEEEEE] bg-white">
                          <td className="px-6 py-3"><Skeleton className="h-4 w-3/4 max-w-[200px]" /></td>
                          <td className="px-6 py-3"><Skeleton className="h-4 w-24" /></td>
                          <td className="px-6 py-3"><Skeleton className="h-8 w-8 rounded-full float-right" /></td>
                        </tr>
                      ))
                    ) : paginatedCreatedTeams.length > 0 ? (
                      paginatedCreatedTeams.map((team, idx) => {
                        const isEven = idx % 2 !== 0;
                        return (
                          <tr 
                            key={team.id}
                            onClick={() => router.push(`/create-team/${team.id}`)}
                            className={`h-[50px] font-poppins text-[13px] text-[#000000] border-b border-[#EEEEEE] last:border-b-0 cursor-pointer hover:bg-[#083F92]/15 transition-colors ${
                              isEven ? 'bg-[#083F92]/10' : 'bg-white'
                            }`}
                          >
                            <td className="px-6 py-3 truncate max-w-[240px] font-medium">
                              <span className="text-[#083F92] font-medium">
                                {team.name}
                              </span>
                            </td>
                            <td className="px-6 py-3 font-medium select-text">{team.code}</td>
                            <td className="px-6 py-3 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCreatedTeam(team);
                                }}
                                className="w-[32px] h-[32px] bg-[#083F92]/10 hover:bg-destructive/15 rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-xs"
                                title="Delete Team"
                              >
                                <Trash2 className="w-[18px] h-[18px] text-[#CE2D32]" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={3} className="text-center py-16 text-[#787878] font-poppins">
                          No teams created yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Created Teams Pagination */}
              {totalCreatedTeamsPages > 1 && (
                <div className="absolute bottom-3 right-6 flex items-center gap-1.5 z-10 bg-white px-2 py-1 rounded-[100px] shadow-xs border border-[#EEEEEE]">
                  <button 
                    disabled={createdTeamsPage === 1}
                    onClick={() => setCreatedTeamsPage(prev => Math.max(1, prev - 1))}
                    className="w-[32px] h-[32px] bg-[#083F92]/10 hover:bg-[#083F92]/15 text-[#919191] rounded-full flex items-center justify-center cursor-pointer disabled:opacity-40 transition-colors"
                  >
                    <ChevronLeft className="w-[18px] h-[18px]" />
                  </button>
                  
                  <div className="flex items-center bg-[#083F92]/10 rounded-full h-[32px]">
                    {getPaginationRange(createdTeamsPage, totalCreatedTeamsPages).map((page) => {
                      const isActive = createdTeamsPage === page;
                      return (
                        <button
                          key={page}
                          onClick={() => setCreatedTeamsPage(page)}
                          className={`w-[32px] h-[32px] rounded-full flex items-center justify-center font-poppins text-[13px] cursor-pointer transition-colors ${
                            isActive 
                              ? 'bg-[#083F92] text-white font-semibold' 
                              : 'text-[#636363] hover:bg-black/5'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  <button 
                    disabled={createdTeamsPage === totalCreatedTeamsPages}
                    onClick={() => setCreatedTeamsPage(prev => Math.min(totalCreatedTeamsPages, prev + 1))}
                    className="w-[32px] h-[32px] bg-[#083F92]/10 hover:bg-[#083F92]/15 text-[#083F92] rounded-full flex items-center justify-center cursor-pointer disabled:opacity-40 transition-colors"
                  >
                    <ChevronRight className="w-[18px] h-[18px]" />
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Bottom Section: Create Team Requests Card */}
      

        <ConfirmDeleteDialog
          open={!!teamToDelete}
          onOpenChange={(open) => !open && setTeamToDelete(null)}
          title="Delete Team"
          description={teamToDelete ? `Are you sure you want to delete the team "${teamToDelete.name}"? This action cannot be undone.` : ''}
          onConfirm={executeDeleteTeam}
          isLoading={isDeleting}
        />

        <ConfirmDeleteDialog
          open={!!requestToReject}
          onOpenChange={(open) => !open && setRequestToReject(null)}
          title="Reject Request"
          description={requestToReject ? `Are you sure you want to reject the team request for "${requestToReject.name}"?` : ''}
          confirmText="Reject"
          onConfirm={executeRejectRequest}
        />

      </div>
    </PageTransition>
  );
}
