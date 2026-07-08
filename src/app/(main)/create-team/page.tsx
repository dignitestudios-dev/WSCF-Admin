'use client';

import { useState, useMemo } from 'react';
import { 
  Check, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  UserPlus
} from 'lucide-react';
import { PageTransition } from '@/components/animations/page-transition';
import { CreateTeamForm } from '@/features/teams/components/create-team-form';
import { TeamFormData } from '@/features/teams/schema/team.schema';
import { toast } from 'sonner';

interface TeamItem {
  id: string;
  name: string;
  code: string;
}

export default function CreateTeamPage() {
  // State for Created Teams
  const [createdTeams, setCreatedTeams] = useState<TeamItem[]>([
    { id: 't1', name: 'Milwaukee Knights School', code: '00000001' },
    { id: 't2', name: 'Milwaukee Knights School', code: '00000002' },
    { id: 't3', name: 'Milwaukee Knights School', code: '00000003' },
    { id: 't4', name: 'Milwaukee Knights School', code: '00000004' },
    { id: 't5', name: 'Milwaukee Knights School', code: '00000005' },
    { id: 't6', name: 'Milwaukee Knights School', code: '00000006' },
    { id: 't7', name: 'Milwaukee Knights School', code: '00000007' },
  ]);

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

  // Pagination for Created Teams
  const paginatedCreatedTeams = useMemo(() => {
    const start = (createdTeamsPage - 1) * itemsPerPage;
    return createdTeams.slice(start, start + itemsPerPage);
  }, [createdTeams, createdTeamsPage]);

  const totalCreatedTeamsPages = Math.max(1, Math.ceil(createdTeams.length / itemsPerPage));

  // Pagination for Requests
  const paginatedRequests = useMemo(() => {
    const start = (requestsPage - 1) * itemsPerPage;
    return teamRequests.slice(start, start + itemsPerPage);
  }, [teamRequests, requestsPage]);

  const totalRequestsPages = Math.max(1, Math.ceil(teamRequests.length / itemsPerPage));

  // Handlers
  const handleCreateTeam = (data: TeamFormData) => {
    // Check if code already exists in created teams
    if (createdTeams.some(t => t.code === data.teamCode)) {
      toast.error(`Team code ${data.teamCode} is already assigned to a team`);
      return;
    }

    const newTeam: TeamItem = {
      id: `t_${Date.now()}`,
      name: data.teamName,
      code: data.teamCode
    };

    setCreatedTeams([newTeam, ...createdTeams]);
    toast.success(`Team "${data.teamName}" created successfully`);
  };

  const handleDeleteCreatedTeam = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the team "${name}"?`)) {
      setCreatedTeams(createdTeams.filter(t => t.id !== id));
      toast.success(`Team "${name}" deleted`);
    }
  };

  const handleApproveRequest = (request: TeamItem) => {
    // Add to created teams (if code not already taken)
    if (createdTeams.some(t => t.code === request.code)) {
      toast.error(`Cannot approve: Team code ${request.code} is already taken`);
      return;
    }

    setCreatedTeams([request, ...createdTeams]);
    setTeamRequests(teamRequests.filter(r => r.id !== request.id));
    toast.success(`Approved team request for "${request.name}"`);
  };

  const handleRejectRequest = (request: TeamItem) => {
    if (window.confirm(`Are you sure you want to reject the team request for "${request.name}"?`)) {
      setTeamRequests(teamRequests.filter(r => r.id !== request.id));
      toast.success(`Team request for "${request.name}" rejected`);
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
            <CreateTeamForm onSubmitSuccess={handleCreateTeam} />
          </div>

          {/* Right Column: Created Teams Card */}
          <div className="flex flex-col gap-4 w-full h-full">
            <h2 className="font-poppins font-bold text-[24px] leading-[36px] text-[#083F92] m-0">
              Created Teams
            </h2>

            <div className="w-full bg-white border border-[#DADADA] rounded-[24px] shadow-sm flex flex-col justify-between overflow-hidden min-h-[384px] h-[384px] relative pb-16">
              <div className="overflow-x-auto w-full">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#083F92] border-4 border-[#F4F4F4] rounded-t-[20px] text-white text-left h-[50px] font-general-sans font-semibold text-[14px]">
                      <th className="px-6 py-3 font-semibold w-[60%]">Team Name</th>
                      <th className="px-6 py-3 font-semibold w-[25%]">Team Code</th>
                      <th className="px-6 py-3 font-semibold text-right w-[15%]">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCreatedTeams.length > 0 ? (
                      paginatedCreatedTeams.map((team, idx) => {
                        const isEven = idx % 2 !== 0;
                        return (
                          <tr 
                            key={team.id}
                            className={`h-[50px] font-poppins text-[13px] text-[#000000] border-b border-[#EEEEEE] last:border-b-0 ${
                              isEven ? 'bg-[#083F92]/10' : 'bg-white'
                            }`}
                          >
                            <td className="px-6 py-3 truncate max-w-[240px] font-medium">{team.name}</td>
                            <td className="px-6 py-3 font-medium select-text">{team.code}</td>
                            <td className="px-6 py-3 text-right">
                              <button
                                onClick={() => handleDeleteCreatedTeam(team.id, team.name)}
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
                    {Array.from({ length: totalCreatedTeamsPages }).map((_, i) => {
                      const page = i + 1;
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
        <div className="flex flex-col gap-4 w-full mt-4">
          <h2 className="font-poppins font-bold text-[24px] leading-[36px] text-[#083F92] m-0">
            Create Team Requests
          </h2>

          <div className="w-full bg-white border border-[#DADADA] rounded-[24px] shadow-sm flex flex-col justify-between overflow-hidden min-h-[384px] h-[384px] relative pb-16">
            <div className="overflow-x-auto w-full">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#083F92] border-4 border-[#F4F4F4] rounded-t-[20px] text-white text-left h-[50px] font-general-sans font-semibold text-[14px]">
                    <th className="px-6 py-3 font-semibold w-[60%]">Team Name</th>
                    <th className="px-6 py-3 font-semibold w-[20%]">Team Code</th>
                    <th className="px-6 py-3 font-semibold text-right w-[20%]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRequests.length > 0 ? (
                    paginatedRequests.map((request, idx) => {
                      const isEven = idx % 2 !== 0;
                      return (
                        <tr 
                          key={request.id}
                          className={`h-[50px] font-poppins text-[13px] text-[#000000] border-b border-[#EEEEEE] last:border-b-0 ${
                            isEven ? 'bg-[#083F92]/10' : 'bg-white'
                          }`}
                        >
                          <td className="px-6 py-3 truncate max-w-[400px] font-medium">{request.name}</td>
                          <td className="px-6 py-3 font-medium select-text">{request.code}</td>
                          <td className="px-6 py-3">
                            <div className="flex items-center justify-end gap-3">
                              {/* Approve Button */}
                              <button
                                onClick={() => handleApproveRequest(request)}
                                className="w-[32px] h-[32px] bg-[#083F92]/10 hover:bg-[#083F92]/20 rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-xs"
                                title="Approve Request"
                              >
                                <Check className="w-[18px] h-[18px] text-[#083F92] stroke-[3]" />
                              </button>

                              {/* Reject Button */}
                              <button
                                onClick={() => handleRejectRequest(request)}
                                className="w-[32px] h-[32px] bg-[#083F92]/10 hover:bg-destructive/15 rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-xs"
                                title="Reject Request"
                              >
                                <Trash2 className="w-[18px] h-[18px] text-[#CE2D32]" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={3} className="text-center py-16 text-[#787878] font-poppins">
                        No team creation requests available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Requests Pagination */}
            {totalRequestsPages > 1 && (
              <div className="absolute bottom-3 right-6 flex items-center gap-1.5 z-10 bg-white px-2 py-1 rounded-[100px] shadow-xs border border-[#EEEEEE]">
                <button 
                  disabled={requestsPage === 1}
                  onClick={() => setRequestsPage(prev => Math.max(1, prev - 1))}
                  className="w-[32px] h-[32px] bg-[#083F92]/10 hover:bg-[#083F92]/15 text-[#919191] rounded-full flex items-center justify-center cursor-pointer disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-[18px] h-[18px]" />
                </button>
                
                <div className="flex items-center bg-[#083F92]/10 rounded-full h-[32px]">
                  {Array.from({ length: totalRequestsPages }).map((_, i) => {
                    const page = i + 1;
                    const isActive = requestsPage === page;
                    return (
                      <button
                        key={page}
                        onClick={() => setRequestsPage(page)}
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
                  disabled={requestsPage === totalRequestsPages}
                  onClick={() => setRequestsPage(prev => Math.min(totalRequestsPages, prev + 1))}
                  className="w-[32px] h-[32px] bg-[#083F92]/10 hover:bg-[#083F92]/15 text-[#083F92] rounded-full flex items-center justify-center cursor-pointer disabled:opacity-40 transition-colors"
                >
                  <ChevronRight className="w-[18px] h-[18px]" />
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </PageTransition>
  );
}
