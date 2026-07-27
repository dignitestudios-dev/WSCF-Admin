'use client';

import { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  ChevronsUpDown
} from 'lucide-react';
import { SearchInput } from '@/components/ui/search-input';
import Link from 'next/link';
import { Pagination } from '@/components/ui/pagination';
import { useDebounce } from '@/hooks/use-debounce';
import { useTournaments } from '@/features/tournaments/hooks/use-tournaments';
import { useGetTournamentParticipants } from '@/features/tournaments/hooks/use-get-tournament-participants';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronDown } from 'lucide-react';
import { tournamentService } from '@/features/tournaments/services/tournament.service';
import { toast } from 'sonner';

export default function CurrentEnrolledUsers() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>('');
  
  // Tournament Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tournamentSearch, setTournamentSearch] = useState('');
  const debouncedTournamentSearch = useDebounce(tournamentSearch, 500);
  const [tournamentPage, setTournamentPage] = useState(1);

  const { data: tournamentsData, isLoading: isTournamentsLoading } = useTournaments(tournamentPage, 10, debouncedTournamentSearch);
  const tournaments = tournamentsData?.data?.tournaments || [];
  const totalTournamentPages = tournamentsData?.pagination?.totalPages || 1;

  const { data: participantsData, isLoading: isParticipantsLoading } = useGetTournamentParticipants(selectedTournamentId, currentPage, 10, debouncedSearchQuery);
  const participants = participantsData?.data?.participants || [];
  const totalPages = participantsData?.pagination?.totalPages || 1;

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  // In case selectedTournament is not in the current paginated list, we could store it separately.
  // But for now, we'll try to find it, or we could just save its title in state.
  const [selectedTournamentTitle, setSelectedTournamentTitle] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCSV = async () => {
    if (!selectedTournamentId) {
      toast.error('Please select a tournament first.');
      return;
    }
    
    try {
      setIsExporting(true);
      toast.info('Starting export...');
      const blob = await tournamentService.exportTournamentParticipants(selectedTournamentId);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${selectedTournamentTitle.replace(/\s+/g, '_')}_participants.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Export completed successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export participants.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSelectTournament = (id: string, title: string) => {
    setSelectedTournamentId(id);
    setSelectedTournamentTitle(title);
    setCurrentPage(1);
    setIsDialogOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 w-full h-full font-sans select-none pb-12">
      
      {/* Top Title & Action Button Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
        <h1 className="font-poppins font-bold sm:text-[42px] text-[28px] sm:leading-[63px] leading-[36px] text-[#083F92] m-0">
          Current Enrolled Users
        </h1>

        {/* Export Button */}
        <button 
          onClick={handleExportCSV}
          disabled={isExporting}
          className="flex items-center gap-2 px-[15px] py-[15px] bg-[#083F92]/10 hover:bg-[#083F92]/15 text-[#000000] rounded-[100px] transition-colors focus:outline-none h-[72px] shadow-sm w-full md:w-[174px] justify-center shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="w-[42px] h-[42px] bg-[#083F92] rounded-full flex items-center justify-center text-white relative shadow-md shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <span className="font-poppins font-medium text-[14px] leading-[20px] tracking-[-0.019em]">
            {isExporting ? 'Exporting...' : 'Export As CSV'}
          </span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4 items-center w-full">
        {/* Search Input Box */}
        <div className="w-full md:w-[350px]">
          <SearchInput value={searchQuery} onChangeValue={setSearchQuery} />
        </div>
        
        {/* Tournament Selection Button */}
        <div className="w-full md:w-[300px]">
          <button
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center justify-between w-full h-[44px] bg-white border border-[#3D3775] rounded-[24px] px-4 font-normal text-[14px] outline-none hover:bg-black/5 transition-colors"
          >
            <span className={selectedTournamentId ? 'text-[#181818]' : 'text-[#181818]/50'}>
              {selectedTournamentId ? selectedTournamentTitle : 'Select a tournament'}
            </span>
            <ChevronDown className="w-4 h-4 text-[#181818]/50" />
          </button>
        </div>
      </div>

      {/* Table Main Container */}
      <div className="w-full bg-white border border-[#DADADA] rounded-[24px] shadow-sm flex flex-col overflow-hidden">
        
        {/* Scrollable Table Area */}
        <div className="overflow-x-auto w-full min-h-[400px]">
          <table className="w-full border-collapse">
            
            {/* Table Header */}
            <thead>
              <tr className="bg-[#083F92] text-white text-left h-[50px] font-poppins font-semibold text-[13px]">
                <th className="px-6 py-3 font-semibold w-[100px]">UserId</th>
                <th className="px-6 py-3 font-semibold w-[120px]">Name</th>
                <th className="px-6 py-3 font-semibold w-[80px]">
                  <div className="flex items-center gap-1.5 cursor-pointer hover:opacity-80">
                    Grade <ChevronsUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th className="px-6 py-3 font-semibold w-[230px]">
                  <div className="flex items-center gap-1.5 cursor-pointer hover:opacity-80">
                    Team <ChevronsUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th className="px-6 py-3 font-semibold w-[110px]">
                  <div className="flex items-center gap-1.5 cursor-pointer hover:opacity-80">
                    Division <ChevronsUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th className="px-6 py-3 font-semibold w-[170px]">
                  <div className="flex items-center gap-1.5 cursor-pointer hover:opacity-80">
                    Tournament <ChevronsUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th className="px-6 py-3 font-semibold text-right w-[126px]">Action</th>
              </tr>
            </thead>
            
            {/* Table Body */}
            <tbody>
              {!selectedTournamentId ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-[#636363] font-poppins">
                    Please select a tournament to view enrolled users.
                  </td>
                </tr>
              ) : isParticipantsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr 
                    key={`skeleton-${i}`} 
                    className={`h-[68px] border-b border-[#EEEEEE] last:border-b-0 ${i % 2 === 1 ? 'bg-[#083F92]/10' : 'bg-white'}`}
                  >
                    <td className="px-6 py-3"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-6 py-3"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-6 py-3"><Skeleton className="h-4 w-12" /></td>
                    <td className="px-6 py-3"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-6 py-3"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-6 py-3"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-6 py-3 text-right">
                      <Skeleton className="h-4 w-20 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : participants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-[#636363] font-poppins">
                    No participants found.
                  </td>
                </tr>
              ) : (
                participants.map((user: any, idx: number) => {
                  const isAltRow = idx % 2 === 1;
                  const userId = user.user?._id;
                  return (
                    <tr 
                      key={user._id} 
                      className={`h-[68px] border-b border-[#EEEEEE] last:border-b-0 font-poppins font-semibold text-[13px] text-[#636363] transition-colors ${
                        isAltRow ? 'bg-[#083F92]/10 hover:bg-[#083F92]/15' : 'bg-white hover:bg-black/5'
                      }`}
                    >
                      <td className="px-6 py-3 font-semibold select-text">{user.playerProfile?.membershipId || 'N/A'}</td>
                      <td className="px-6 py-3 font-bold text-[#636363] select-text">{user.user?.name || 'N/A'}</td>
                      <td className="px-6 py-3 font-bold text-[#636363] select-text">{user.playerProfile?.grade || 'N/A'}</td>
                      <td className="px-6 py-3 font-medium tracking-[-0.02em] select-text">{user.team?.name || 'N/A'}</td>
                      <td className="px-6 py-3 font-semibold select-text">{user.division || 'N/A'}</td>
                      <td className="px-6 py-3 font-semibold tracking-[-0.02em] select-text pr-2 max-w-[170px] truncate">
                        {selectedTournamentTitle || 'N/A'}
                      </td>
                      <td className="px-6 py-3 text-right">
                        {userId ? (
                          <Link 
                            href={`/users/${userId}`}
                            className="font-semibold tracking-[-0.02em] underline text-[#636363] hover:text-[#083F92] transition-colors"
                          >
                            View Profile
                          </Link>
                        ) : (
                          <span className="text-[#919191]">N/A</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

          </table>
        </div>

      </div>

      {/* Pagination Row */}
      {totalPages > 1 && (
        <div className="flex justify-end items-center w-full mt-4">
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Tournament Selection Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent 
          showCloseButton={true} 
          className="sm:max-w-[700px] w-[90vw] max-h-[90vh] overflow-hidden bg-white rounded-[12px] p-0 border-none shadow-2xl flex flex-col"
        >
          <div className="p-6 sm:p-8 flex flex-col gap-6 h-full max-h-[90vh]">
            <DialogTitle className="font-general-sans font-semibold text-[24px] leading-[32px] text-[#181818] m-0">
              Select a Tournament
            </DialogTitle>
            
            <div className="w-full shrink-0">
              <SearchInput value={tournamentSearch} onChangeValue={setTournamentSearch} />
            </div>

            <div className="flex flex-col gap-2 overflow-y-auto min-h-[300px] flex-1">
              {isTournamentsLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={`skel-${i}`} className="flex items-center justify-between gap-4 p-4 bg-[#083F92]/5 rounded-[12px] w-full">
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-4 w-24 shrink-0" />
                  </div>
                ))
              ) : tournaments.length === 0 ? (
                <div className="py-8 text-center text-[#636363] font-poppins">No tournaments found.</div>
              ) : (
                tournaments.map((t: any) => (
                  <div 
                    key={t._id} 
                    onClick={() => handleSelectTournament(t._id, t.title)}
                    className="flex items-center justify-between gap-4 p-4 bg-[#083F92]/5 hover:bg-[#083F92]/10 rounded-[12px] cursor-pointer transition-colors border border-transparent hover:border-[#083F92]/20 w-full overflow-hidden"
                  >
                    <span className="font-poppins font-semibold text-[15px] text-[#083F92] truncate flex-1 min-w-0" title={t.title}>
                      {t.title}
                    </span>
                    <span className="text-[13px] text-[#636363] font-medium shrink-0 whitespace-nowrap">
                      {t.date ? new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                    </span>
                  </div>
                ))
              )}
            </div>

            {totalTournamentPages > 1 && (
              <div className="flex justify-end shrink-0 pt-4 border-t border-[#EEEEEE]">
                <Pagination 
                  currentPage={tournamentPage}
                  totalPages={totalTournamentPages}
                  onPageChange={setTournamentPage}
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
