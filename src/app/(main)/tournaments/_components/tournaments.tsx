'use client';

import { useState } from 'react';
import { 
  Plus, 
  MapPin, 
  Calendar, 
  Armchair, 
  Tag, 
  ArrowRight,
  CheckCircle2,
  Crown
} from 'lucide-react';
import { SearchInput } from '@/components/ui/search-input';
import { useDebounce } from '@/hooks/use-debounce';
import { PageTransition } from '@/components/animations/page-transition';
import Link from 'next/link';
import { Pagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { useTournaments, useMarkTournamentCompleted } from '@/features/tournaments/hooks/use-tournaments';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useDeleteTournament } from '@/features/tournaments/hooks/use-delete-tournament';

export default function Tournaments() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [activeTab, setActiveTab] = useState<'All' | 'upcoming' | 'ongoing' | 'completed'>('All');
  const [currentPage, setCurrentPage] = useState(1); 
  const itemsPerPage = 10;

  const statusParam = activeTab === 'All' ? undefined : activeTab;

  // Completion is manual and one-way, so it asks first.
  const [tournamentToComplete, setTournamentToComplete] = useState<{
    _id: string;
    title: string;
  } | null>(null);
  const { mutateAsync: markCompleted, isPending: isCompleting } =
    useMarkTournamentCompleted();
  const { mutateAsync: deleteTournament, isPending: isDeleting } = useDeleteTournament();

  const [tournamentToDelete, setTournamentToDelete] = useState<any>(null);

  const { data: tournamentsData, isLoading, isFetching } = useTournaments(currentPage, itemsPerPage, debouncedSearchQuery, statusParam);

  const tournaments = tournamentsData?.data?.tournaments || [];
  const totalPages = tournamentsData?.pagination?.totalPages || 1;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC'
    });
  };

  return (
    <PageTransition>
      <div className="flex flex-col gap-6 w-full h-full font-sans select-none">
        
        {/* Top Header Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
          
          {/* Left Title + Search pill bar */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 w-full sm:max-w-[500px]">
            <h1 className="font-poppins font-bold sm:text-[42px] text-[28px] sm:leading-[63px] leading-[36px] text-[#083F92] m-0 shrink-0">
              Tournaments
            </h1>
            
            {/* Search Pill Input */}
            <div className="w-full sm:w-auto">
              <SearchInput value={searchQuery} onChangeValue={setSearchQuery} />
            </div>
          </div>

          {/* Right Button: Add Tournament */}
          <Link
            href="/tournaments/create"
            className="flex items-center gap-2.5 px-[15px] py-[15px] bg-[#083F92]/10 hover:bg-[#083F92]/15 text-[#000000] rounded-[100px] transition-colors focus:outline-none h-[72px] shrink-0 shadow-sm w-full sm:w-auto justify-center cursor-pointer"
          >
            <div className="w-[42px] h-[42px] bg-[#083F92] rounded-full flex items-center justify-center text-white relative shadow-md">
              <Plus className="w-5 h-5" />
            </div>
            <span className="font-poppins font-medium text-[14px] leading-[20px] tracking-[-0.019em] pr-2">
              Add Tournament
            </span>
          </Link>

        </div>

        {/* Status Filter Tab Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full h-auto mt-2">
          {(['All', 'upcoming', 'ongoing', 'completed'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                className={`min-w-[103px] px-4 h-[50px] rounded-[100px] border-4 border-[#F4F4F4] font-poppins font-semibold text-[14px] leading-[19px] flex items-center justify-center transition-all duration-150 capitalize cursor-pointer ${
                  isActive 
                    ? 'bg-[#083F92] text-white border-transparent' 
                    : 'bg-white text-black hover:bg-black/5'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Main List Container Card */}
        <div className="w-full bg-white border border-[#DADADA] rounded-[24px] shadow-sm flex flex-col justify-between overflow-hidden flex-1 relative min-h-[640px] p-6 mb-8 pb-20">
          
          {/* Tournament List Stack */}
          <div className="flex flex-col gap-3 w-full">
            {isLoading || isFetching ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={`skeleton-${i}`} className="w-full min-h-[107px] py-4 md:py-0 bg-white border border-[#083F92]/30 rounded-[12px] flex flex-col md:flex-row md:items-center justify-between px-6 gap-4">
                  <div className="flex items-center gap-4 w-full md:max-w-[85%]">
                    <Skeleton className="w-[40px] h-[40px] rounded-full shrink-0" />
                    <div className="flex flex-col gap-2 w-full">
                      <Skeleton className="h-5 w-1/3" />
                      <div className="flex gap-4">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                    </div>
                  </div>
                  <Skeleton className="w-[89px] h-[38px] rounded-[8px]" />
                </div>
              ))
            ) : tournaments.length > 0 ? (
              tournaments.map((t) => (
                <Link 
                  key={t._id}
                  href={`/tournaments/${t._id}`}
                  className="w-full min-h-[107px] py-4 md:py-0 bg-white border border-[#083F92]/30 rounded-[12px] shadow-[0px_4px_4px_rgba(0,0,0,0.05)] hover:shadow-[0px_4px_4px_rgba(0,0,0,0.1)] transition-all duration-150 flex flex-col md:flex-row md:items-center justify-between px-6 cursor-pointer gap-4"
                >
                  {/* Left Card Details */}
                  <div className="flex items-start md:items-center gap-4 w-full md:max-w-[85%]">
                    {/* Chess icon circle container */}
                    <div className="w-[40px] h-[40px] bg-[#083F92] text-white rounded-full flex items-center justify-center shrink-0">
                      <Crown className="w-5 h-5" />
                    </div>

                    {/* Text descriptions */}
                    <div className="flex flex-col gap-2 min-w-0 flex-1">
                      <h2 className="font-poppins font-medium text-[16px] md:text-[18px] leading-[24px] md:leading-[27px] text-[#083F92] truncate w-full">
                        {t.title}
                      </h2>
                      
                      {/* Inner items horizontal details row */}
                      <div className="flex items-center gap-x-4 gap-y-2 flex-wrap text-[#151515]/90">
                        
                        {/* Location details */}
                        <div className="flex items-center gap-1.5 shrink-0 max-w-full">
                          <MapPin className="w-4 h-4 text-[#083F92] shrink-0" />
                          <span className="font-poppins font-normal text-[13px] md:text-[14px] truncate max-w-[150px] sm:max-w-[250px] md:max-w-[400px]">{t.location}</span>
                        </div>

                        {/* Date details */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Calendar className="w-4 h-4 text-[#083F92]" />
                          <span className="font-poppins font-normal text-[13px] md:text-[14px]">{formatDate(t.date)}</span>
                        </div>

                        {/* Seats details */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Armchair className="w-4 h-4 text-[#083F92]" />
                          <span className="font-poppins font-normal text-[13px] md:text-[14px]">N/A</span>
                        </div>

                        {/* Price tag details */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Tag className="w-4 h-4 text-[#083F92]" />
                          <span className="font-poppins font-normal text-[13px] md:text-[14px]">${t.entryFee}</span>
                        </div>

                      </div>
                    </div>
                  </div>

                  {/* Right Card Actions (Status Pill + Navigation Chevron) */}
                  <div className="flex items-center justify-between md:justify-end gap-6 shrink-0 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-neutral-100">
                    {/* Status badge */}
                    <div className={`w-[89px] h-[38px] rounded-[8px] flex items-center justify-center font-poppins font-medium text-[13px] leading-[18px] capitalize ${
                      t.status === 'completed'
                        ? 'bg-[#083F92] text-white shadow-sm'
                        : 'bg-[#083F92]/10 text-[#083F92]'
                    }`}>
                      {t.status}
                    </div>
                    
                    {/* Only an ongoing tournament can be completed; the API
                        enforces the same rule. */}
                    {t.status === 'ongoing' && (
                      <button
                        type="button"
                        title="Mark as completed"
                        onClick={(event) => {
                          // The whole card is a link.
                          event.preventDefault();
                          event.stopPropagation();
                          setTournamentToComplete({ _id: t._id, title: t.title });
                        }}
                        className="flex h-[38px] shrink-0 cursor-pointer items-center gap-2 rounded-[100px] bg-[#083F92] px-4 text-white shadow-sm transition-opacity hover:opacity-90"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="font-poppins text-[13px] font-semibold">
                          Mark Completed
                        </span>
                      </button>
                    )}

                    {/* Action arrow icon */}
                    <ArrowRight className="w-6 h-6 text-black/80 hover:translate-x-0.5 transition-transform hidden md:block" />
                  </div>

                </Link>
              ))
            ) : (
              <div className="w-full py-16 text-center text-[#787878] font-poppins bg-[#083F92]/5 rounded-[12px] border border-dashed border-[#083F92]/20">
                {activeTab === 'All'
                  ? 'No tournaments found. Click "Add Tournament" to create one.'
                  : `No ${activeTab} tournaments found.`}
              </div>
            )}
          </div>

          {/* Floating Pagination Bar (Bottom Right) */}
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

      <ConfirmDialog
        open={Boolean(tournamentToComplete)}
        onOpenChange={(open) => !open && setTournamentToComplete(null)}
        title={`Mark ${tournamentToComplete?.title ?? 'tournament'} as completed?`}
        description="Players will see it as completed and it moves out of the ongoing list. This cannot be undone from the panel."
        confirmText="Mark Completed"
        loadingText="Marking..."
        tone="primary"
        icon={CheckCircle2}
        isLoading={isCompleting}
        onConfirm={async () => {
          if (!tournamentToComplete) return;
          try {
            await markCompleted(tournamentToComplete._id);
            setTournamentToComplete(null);
          } catch {
            // surfaced by the mutation toast
          }
        }}
      />
    </PageTransition>
  );
}
