'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  Plus,
  ChevronsUpDown,
  X,
  ChevronDown
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { PageTransition } from '@/components/animations/page-transition';
import { Pagination } from '@/components/ui/pagination';
import { SearchInput } from '@/components/ui/search-input';
import { useDebounce } from '@/hooks/use-debounce';
import { useTeamDetails } from '@/features/teams/hooks/use-team-details';
import { useTeamMembers } from '@/features/teams/hooks/use-team-members';
import { useAddTeamMember } from '@/features/teams/hooks/use-add-team-member';
import { useUsers } from '@/features/users/hooks/use-users';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import Link from 'next/link';

interface MemberRow {
  userId: string;
  name: string;
  grade: string;
  team: string;
  teamCode: string;
  city: string;
}

export default function TeamDetails() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Fetch dynamic team details
  const { data: teamData, isLoading: teamLoading } = useTeamDetails(id);
  const teamName = teamData?.data?.team?.name || "Milwaukee Knights School";
  const teamCode = teamData?.data?.team?.teamCode || "00001";

  // Interactivity: Add Member Dialog State
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<{ id: string; name: string; email?: string }[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const debouncedUserSearchQuery = useDebounce(userSearchQuery, 500);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [userPage, setUserPage] = useState(1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: usersData, isLoading: usersLoading } = useUsers(userPage, 10, debouncedUserSearchQuery);
  const usersList = usersData?.data?.users || [];
  const userTotalPages = usersData?.data?.pagination?.totalPages || 1;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sorting state
  const [sortField, setSortField] = useState<'grade' | 'team' | 'teamCode' | 'city' | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // TanStack hooks for team members
  const { data: membersData, isLoading: membersLoading } = useTeamMembers(id, currentPage, itemsPerPage, debouncedSearchQuery);
  const { mutateAsync: addTeamMember, isPending: isAddingMember } = useAddTeamMember(id);

  // Map backend members response to table rows
  const members = useMemo(() => {
    if (!membersData?.data?.members) return [];
    return membersData.data.members.map((member: any) => ({
      userId: member.userId?._id || member._id.substring(0, 8).toUpperCase(),
      name: member.name || member.userId?.name || 'Unknown',
      memberId: member?.membershipId || 'Unknown',
      grade: member.grade || '7th',
      team: `${teamName} Chess Club`,
      teamCode: teamCode,
      city: 'Milwaukee, Wisconsin',
    }));
  }, [membersData, teamName, teamCode]);

  // Sorting handler
  const handleSort = (field: 'grade' | 'team' | 'teamCode' | 'city') => {
    if (sortField === field) {
      if (sortOrder === 'asc') {
        setSortOrder('desc');
      } else if (sortOrder === 'desc') {
        setSortField(null);
        setSortOrder(null);
      } else {
        setSortOrder('asc');
      }
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Process sorting on current page members
  const sortedMembers = useMemo(() => {
    if (!sortField || !sortOrder) return members;
    return [...members].sort((a, b) => {
      const valA = a[sortField].toLowerCase();
      const valB = b[sortField].toLowerCase();
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [members, sortField, sortOrder]);

  // Since pagination is backend-driven, we display sortedMembers directly
  const paginatedMembers = sortedMembers;

  const totalPages = useMemo(() => {
    return membersData?.pagination?.totalPages || 1;
  }, [membersData]);

  // Add Member handler
  const handleAddMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one player to add');
      return;
    }

    try {
      await Promise.all(
        selectedUsers.map(user =>
          addTeamMember({
            userId: user.id,
          })
        )
      );

      // Reset states and close dialog
      setSelectedUsers([]);
      setUserSearchQuery('');
      setShowAddDialog(false);
    } catch {
      // Error is handled inside useAddTeamMember hook onError
    }
  };

  const handleRemoveSelectedUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(u => u.id !== userId));
  };

  return (
    <PageTransition>
      <div className="flex flex-col gap-6 w-full h-full font-sans select-none pb-12">

        {/* Top Navigation Row */}
        <div className="flex justify-between items-center w-full">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 font-poppins font-medium text-[18px] text-[#083F92] hover:opacity-80 transition-opacity cursor-pointer focus:outline-none bg-transparent border-none p-0"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            <span>Back</span>
          </button>

          {/* Add Member Button */}
          <button
            onClick={() => setShowAddDialog(true)}
            className="flex items-center gap-2.5 px-[15px] py-[15px] bg-[#083F92]/10 hover:bg-[#083F92]/15 text-[#000000] rounded-[100px] transition-colors focus:outline-none h-[72px] shrink-0 shadow-sm justify-center cursor-pointer"
          >
            <div className="w-[42px] h-[42px] bg-[#083F92] rounded-full flex items-center justify-center text-white relative shadow-md">
              <Plus className="w-5 h-5 bg-white text-[#083F92] rounded-full" />
            </div>
            <span className="font-poppins font-medium text-[14px] leading-[20px] tracking-[-0.019em] pr-2">
              Add Member
            </span>
          </button>
        </div>

        {/* Team Identification & Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 w-full mt-2">
          <div className="flex flex-col gap-2">
            {teamLoading ? (
              <>
                <Skeleton className="h-9 w-[250px] bg-[#083F92]/20" />
                <Skeleton className="h-6 w-[150px]" />
              </>
            ) : (
              <>
                <h1 className="font-poppins font-bold text-[24px] leading-[36px] text-[#083F92] m-0">
                  {teamName}
                </h1>
                <p className="font-poppins font-medium text-[18px] leading-[27px] text-[#151515] mt-1 mb-0">
                  Team Code: {teamCode}
                </p>
              </>
            )}
          </div>

          {/* Search Pill Input */}
          <div className="w-full sm:w-[300px]">
            <SearchInput 
              value={searchQuery} 
              onChangeValue={setSearchQuery} 
              disabled={membersLoading}
              containerClassName={membersLoading ? 'opacity-50 pointer-events-none' : ''}
            />
          </div>
        </div>

        {/* Members Table */}
        <div className="w-full bg-white border border-[#DADADA] rounded-[24px] shadow-sm flex flex-col justify-between overflow-hidden flex-1 relative min-h-[600px] mb-8 pb-20 mt-4">
          <div className="overflow-x-auto w-full">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#083F92] text-white text-left h-[50px] font-poppins font-semibold text-[13px]">
                  <th className="px-6 py-3 font-semibold w-[100px]">UserId</th>
                  <th className="px-6 py-3 font-semibold w-[120px]">Name</th>
                  <th className="px-6 py-3 font-semibold w-[80px]">
                    <button
                      onClick={() => handleSort('grade')}
                      className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity font-semibold"
                    >
                      Grade <ChevronsUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="px-6 py-3 font-semibold w-[170px]">
                    <button
                      onClick={() => handleSort('city')}
                      className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity font-semibold"
                    >
                      City <ChevronsUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="px-6 py-3 font-semibold text-right w-[126px]">Action</th>
                </tr>
              </thead>
              <tbody>
                {membersLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={`skeleton-${i}`} className="h-[50px] border-b border-[#DADADA]/30 bg-white">
                      <td className="px-6 py-3"><Skeleton className="h-4 w-[80px]" /></td>
                      <td className="px-6 py-3"><Skeleton className="h-4 w-[120px]" /></td>
                      <td className="px-6 py-3"><Skeleton className="h-4 w-[40px]" /></td>
                      <td className="px-6 py-3"><Skeleton className="h-4 w-[120px]" /></td>
                      <td className="px-6 py-3"><Skeleton className="h-4 w-[80px] float-right" /></td>
                    </tr>
                  ))
                ) : paginatedMembers.length > 0 ? (
                  paginatedMembers.map((member, index) => {
                    const isEven = index % 2 !== 0;
                    return (
                      <tr
                        key={member.userId}
                        className={`h-[50px] border-b border-[#DADADA]/30 font-poppins text-[13px] text-[#636363] ${isEven ? 'bg-[#083F92]/10' : 'bg-white'
                          }`}
                      >
                        <td className="px-6 py-3 font-semibold">{member.memberId}</td>
                        <td className={`px-6 py-3 ${isEven ? 'font-bold' : 'font-semibold'}`}>{member.name}</td>
                        <td className={`px-6 py-3 ${isEven ? 'font-bold' : 'font-semibold'}`}>{member.grade}</td>
                        <td className="px-6 py-3 font-semibold tracking-[-0.02em]">{member.city}</td>
                        <td className="px-6 py-3 text-right">
                          <Link
                            href={`/users/${member.userId}`}
                            className="font-semibold underline hover:opacity-85 transition-opacity tracking-[-0.02em]"
                          >
                            View Profile
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-16 text-[#787878] font-poppins">
                      No team members found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Floating Pagination Bar */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              className="absolute right-[24px] bottom-[16px]"
            />
          )}
        </div>

        {/* Add Member Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent showCloseButton={false} className="w-[90vw] sm:w-[589px] sm:max-w-[589px] min-h-[291px] bg-white rounded-[12px] p-[32px] border-none shadow-2xl">
            <button
              onClick={() => setShowAddDialog(false)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-5 h-5 text-[#565656]" />
            </button>

            <h2 className="font-general-sans font-semibold text-[32px] leading-[43px] text-[#181818] mb-[34px]">
              Add player
            </h2>

            <form onSubmit={handleAddMemberSubmit} className="flex flex-col gap-6">
              <div className="flex flex-col gap-[8px]" ref={dropdownRef}>
                <Label className="font-general-sans font-medium text-[14px] leading-[19px] capitalize text-[#181818]">
                  Search player
                </Label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="w-full h-[54px] bg-white border border-[#3D3775] rounded-[24px] pl-[16px] pr-[40px] font-general-sans font-normal text-[14px] leading-[19px] text-left focus:outline-none flex items-center justify-between"
                  >
                    <span className={selectedUsers.length > 0 ? 'text-[#181818] font-medium' : 'text-[#181818]/60'}>
                      {selectedUsers.length > 0
                        ? `${selectedUsers.length} player(s) selected`
                        : 'Enter player name to search'}
                    </span>
                  </button>
                  <ChevronDown className={`absolute right-[16px] top-1/2 -translate-y-1/2 w-[15px] h-[27px] text-[#000000] pointer-events-none transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />

                  {/* Dropdown Menu */}
                  {isUserDropdownOpen && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white border border-[#3D3775] rounded-[16px] shadow-lg overflow-hidden z-50 flex flex-col">
                      {/* Search Bar inside dropdown */}
                      <div className="p-3 border-b border-[#EEEEEE]">
                        <input
                          type="text"
                          placeholder="Search player..."
                          value={userSearchQuery}
                          onChange={(e) => {
                            setUserSearchQuery(e.target.value);
                            setUserPage(1);
                          }}
                          className="w-full h-[40px] bg-gray-50 border border-[#DADADA] rounded-[12px] px-3 font-general-sans text-[14px] focus:outline-none focus:border-[#083F92]"
                          autoFocus
                        />
                      </div>
                      <div className="max-h-[200px] overflow-y-auto">
                        {usersLoading ? (
                          <div className="p-4 text-center text-[#787878] font-general-sans text-[14px]">Loading...</div>
                        ) : usersList.length > 0 ? (
                          usersList.map((user) => {
                            const isAlreadySelected = selectedUsers.some(u => u.id === user._id);
                            return (
                              <div
                                key={user._id}
                                onClick={() => {
                                  if (isAlreadySelected) {
                                    setSelectedUsers(prev => prev.filter(u => u.id !== user._id));
                                  } else {
                                    setSelectedUsers(prev => [...prev, { id: user._id, name: user.name, email: user.email }]);
                                  }
                                  setUserSearchQuery('');
                                }}
                                className={`px-[16px] py-[12px] hover:bg-[#083F92]/10 cursor-pointer transition-colors border-b border-[#EEEEEE] last:border-b-0 flex items-center justify-between ${
                                  isAlreadySelected ? 'bg-[#083F92]/5' : ''
                                }`}
                              >
                                <div className="flex flex-col">
                                  <div className="font-general-sans w-[200px] break-word truncate font-medium text-[14px] text-[#181818]">{user.name}</div>
                                  <div className="font-general-sans text-[12px] text-[#636363]">{user.email}</div>
                                </div>
                                {isAlreadySelected && (
                                  <span className="font-general-sans font-semibold text-[12px] text-[#083F92]">Selected</span>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-4 text-center text-[#787878] font-general-sans text-[14px]">No players found.</div>
                        )}
                      </div>

                      {/* Pagination in Dropdown */}
                      {userTotalPages > 1 && (
                        <div className="flex items-center justify-between p-2 border-t border-[#EEEEEE] bg-gray-50">
                          <button
                            type="button"
                            disabled={userPage === 1}
                            onClick={(e) => { e.stopPropagation(); setUserPage(p => Math.max(1, p - 1)); }}
                            className="px-3 py-1 text-[12px] font-general-sans bg-white border border-[#DADADA] rounded-[100px] disabled:opacity-50 cursor-pointer hover:bg-gray-100"
                          >
                            Prev
                          </button>
                          <span className="text-[12px] font-general-sans text-[#636363]">
                            Page {userPage} of {userTotalPages}
                          </span>
                          <button
                            type="button"
                            disabled={userPage === userTotalPages}
                            onClick={(e) => { e.stopPropagation(); setUserPage(p => Math.min(userTotalPages, p + 1)); }}
                            className="px-3 py-1 text-[12px] font-general-sans bg-white border border-[#DADADA] rounded-[100px] disabled:opacity-50 cursor-pointer hover:bg-gray-100"
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Members Badges */}
                {selectedUsers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex max-w-[200px] break-words truncate items-center gap-1.5 h-[32px] px-3 bg-[#083F92]/10 text-[#083F92] rounded-[16px] font-general-sans text-[13px] font-medium"
                      >
                        <span className='max-w-[180px] break-words truncate'>{user.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSelectedUser(user.id)}
                          className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-[#083F92]/20 focus:outline-none"
                        >
                          <X className="w-3 h-3 text-[#083F92]" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6">
                <Button
                  type="submit"
                  disabled={isAddingMember || selectedUsers.length === 0}
                  className="w-full h-[48px] bg-[#083F92] hover:bg-[#083F92]/95 text-white font-general-sans font-semibold text-[14px] leading-[19px] capitalize rounded-[100px] cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAddingMember ? 'Adding...' : `Add into team${selectedUsers.length > 0 ? ` (${selectedUsers.length})` : ''}`}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

      </div>
    </PageTransition>
  );
}
