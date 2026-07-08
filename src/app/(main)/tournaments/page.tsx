'use client';

import { useState } from 'react';
import { 
  Plus, 
  MapPin, 
  Calendar, 
  Armchair, 
  Tag, 
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Crown
} from 'lucide-react';
import { SearchInput } from '@/components/ui/search-input';
import { PageTransition } from '@/components/animations/page-transition';
import { CreateTournamentDialog } from '@/features/tournaments/components/create-tournament-dialog';
import Link from 'next/link';
import { Pagination } from '@/components/ui/pagination';

interface TournamentItem {
  id: number;
  title: string;
  location: string;
  date: string;
  seats: string;
  price: string;
  status: 'Upcoming' | 'Completed';
}

export default function TournamentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'Completed'>('All');
  const [currentPage, setCurrentPage] = useState(2); // Matches Figma page 2 selection
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const tournaments: TournamentItem[] = [
    { id: 1, title: 'USCF-Rated Scholastic May Summer Tournament', location: 'Old Guard Games', date: 'June 20, 2026', seats: '8/24', price: '$40', status: 'Upcoming' },
    { id: 2, title: 'USCF-Rated Scholastic May Summer Tournament', location: 'Old Guard Games', date: 'June 20, 2026', seats: '8/24', price: '$40', status: 'Upcoming' },
    { id: 3, title: 'USCF-Rated Scholastic May Summer Tournament', location: 'Old Guard Games', date: 'June 20, 2026', seats: '8/24', price: '$40', status: 'Upcoming' },
    { id: 4, title: 'USCF-Rated Scholastic May Summer Tournament', location: 'Old Guard Games', date: 'June 20, 2026', seats: '8/24', price: '$40', status: 'Completed' },
    { id: 5, title: 'USCF-Rated Scholastic June Challenge', location: 'Old Guard Games', date: 'June 20, 2026', seats: '8/24', price: '$40', status: 'Upcoming' },
    { id: 6, title: 'USCF-Rated Scholastic April Blitz', location: 'Old Guard Games', date: 'June 20, 2026', seats: '8/24', price: '$40', status: 'Completed' },
  ];

  // Filtering based on search query and status tabs
  const filteredTournaments = tournaments.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'All') return matchesSearch;
    if (activeTab === 'Active') return matchesSearch && t.status === 'Upcoming';
    if (activeTab === 'Completed') return matchesSearch && t.status === 'Completed';
    return matchesSearch;
  });

  return (
    <PageTransition>
      <div className="flex flex-col gap-6 w-full h-full font-sans select-none">
        
        {/* Top Header Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
          
          {/* Left Title + Search pill bar */}
          <div className="flex items-center gap-6 w-full max-w-[500px]">
            <h1 className="font-poppins font-bold text-[42px] leading-[63px] text-[#151515] m-0 shrink-0">
              Tournaments
            </h1>
            
            {/* Search Pill Input */}
            <SearchInput value={searchQuery} onChangeValue={setSearchQuery} />
          </div>

          {/* Right Button: Add Tournament */}
          <button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2.5 px-[15px] py-[15px] bg-[#083F92]/10 hover:bg-[#083F92]/15 text-[#000000] rounded-[100px] transition-colors focus:outline-none h-[72px] shrink-0 shadow-sm"
          >
            <div className="w-[42px] h-[42px] bg-[#083F92] rounded-full flex items-center justify-center text-white relative shadow-md">
              <Plus className="w-5 h-5" />
            </div>
            <span className="font-poppins font-medium text-[14px] leading-[20px] tracking-[-0.019em] pr-2">
              Add Tournament
            </span>
          </button>

        </div>

        {/* Status Filter Tab Pills */}
        <div className="flex items-center gap-2 w-full max-w-[325px] h-[50px] mt-2">
          {(['All', 'Active', 'Completed'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-[103px] h-[50px] rounded-[100px] border-4 border-[#F4F4F4] font-poppins font-semibold text-[14px] leading-[19px] flex items-center justify-center transition-all duration-150 ${
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
            {filteredTournaments.map((t) => (
              <Link 
                key={t.id}
                href={`/tournaments/${t.id}`}
                className="w-full h-[107px] bg-white border border-[#083F92]/30 rounded-[12px] shadow-[0px_4px_4px_rgba(0,0,0,0.05)] hover:shadow-[0px_4px_4px_rgba(0,0,0,0.1)] transition-all duration-150 flex items-center justify-between px-6 cursor-pointer"
              >
                {/* Left Card Details */}
                <div className="flex items-center gap-4 max-w-[85%]">
                  {/* Chess icon circle container */}
                  <div className="w-[40px] h-[40px] bg-[#083F92] text-white rounded-full flex items-center justify-center shrink-0">
                    <Crown className="w-5 h-5" />
                  </div>

                  {/* Text descriptions */}
                  <div className="flex flex-col gap-2">
                    <h2 className="font-poppins font-medium text-[18px] leading-[27px] text-[#083F92] truncate w-full">
                      {t.title}
                    </h2>
                    
                    {/* Inner items horizontal details row */}
                    <div className="flex items-center gap-4 flex-wrap text-[#151515]/90">
                      
                      {/* Location details */}
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[#083F92]" />
                        <span className="font-poppins font-normal text-[14px] leading-[21px]">{t.location}</span>
                      </div>

                      {/* Date details */}
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-[#083F92]" />
                        <span className="font-poppins font-normal text-[14px] leading-[21px]">{t.date}</span>
                      </div>

                      {/* Seats details */}
                      <div className="flex items-center gap-1.5">
                        <Armchair className="w-4 h-4 text-[#083F92]" />
                        <span className="font-poppins font-normal text-[14px] leading-[21px]">{t.seats}</span>
                      </div>

                      {/* Price tag details */}
                      <div className="flex items-center gap-1.5">
                        <Tag className="w-4 h-4 text-[#083F92]" />
                        <span className="font-poppins font-normal text-[14px] leading-[21px]">{t.price}</span>
                      </div>

                    </div>
                  </div>
                </div>

                {/* Right Card Actions (Status Pill + Navigation Chevron) */}
                <div className="flex items-center gap-6 shrink-0">
                  {/* Status badge */}
                  <div className={`w-[89px] h-[38px] rounded-[8px] flex items-center justify-center font-poppins font-medium text-[13px] leading-[18px] ${
                    t.status === 'Completed'
                      ? 'bg-[#083F92] text-white shadow-sm'
                      : 'bg-[#083F92]/10 text-[#083F92]'
                  }`}>
                    {t.status}
                  </div>
                  
                  {/* Action arrow icon */}
                  <ArrowRight className="w-6 h-6 text-black/80 hover:translate-x-0.5 transition-transform" />
                </div>

              </Link>
            ))}
          </div>

          {/* Floating Pagination Bar (Bottom Right) */}
          <Pagination 
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            className="absolute right-[24px] bottom-[16px]"
          />

        </div>

      </div>

      {/* Create Tournament Dialog */}
      <CreateTournamentDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </PageTransition>
  );
}
