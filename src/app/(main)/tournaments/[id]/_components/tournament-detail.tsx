'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  Edit3, 
  Trash2, 
  MapPin, 
  DollarSign, 
  Calendar, 
  GitMerge, 
  Hash, 
  User, 
  Award, 
  FileSpreadsheet
} from 'lucide-react';
import Link from 'next/link';
import { PageTransition } from '@/components/animations/page-transition';
import { CreateTournamentDialog } from '@/features/tournaments/components/create-tournament-dialog';
import { Pagination } from '@/components/ui/pagination';
import { ConfirmDeleteDialog } from '@/components/ui/alert-dialog';

interface PlayerRow {
  userId: string;
  name: string;
  grade: string;
  team: string;
  rating: string;
  city: string;
}

export default function TournamentDetail() {
  const params = useParams();
  const router = useRouter();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentPage, setCurrentPage] = useState(2); // Match Figma pagination

  // In a real app we would fetch this by params.id
  const tournamentTitle = "USCF-Rated Scholastic May Summer Tournament";
  
  const tournamentDetails = {
    location: "Old Guard Games",
    entryFee: "$40",
    date: "June 20, 2026",
    division: "U-10, U-14, U18, U20",
    tournamentId: "00000",
    tournamentHost: "James",
    tournamentDirector: "Alex"
  };

  const registeredPlayers: PlayerRow[] = [
    { userId: '00000001', name: 'Ethan Carter', grade: '7th', team: 'Milwaukee Knights Chess Club', rating: '13456', city: 'Milwaukee, Wisconsin' },
    { userId: '00000002', name: 'Olivia Brown', grade: '7th', team: 'Milwaukee Knights Chess Club', rating: '13457', city: 'Milwaukee, Wisconsin' },
    { userId: '00000003', name: 'Lucas White', grade: '7th', team: 'Milwaukee Knights Chess Club', rating: '13458', city: 'Milwaukee, Wisconsin' },
    { userId: '00000004', name: 'Sophia Green', grade: '7th', team: 'Milwaukee Knights Chess Club', rating: '13459', city: 'Milwaukee, Wisconsin' },
    { userId: '00000005', name: 'Mason Johnson', grade: '7th', team: 'Milwaukee Knights Chess Club', rating: '13460', city: 'Milwaukee, Wisconsin' },
    { userId: '00000006', name: 'Ava Martinez', grade: '7th', team: 'Milwaukee Knights Chess Club', rating: '13461', city: 'Milwaukee, Wisconsin' },
    { userId: '00000007', name: 'James Wilson', grade: '7th', team: 'Milwaukee Knights Chess Club', rating: '13462', city: 'Milwaukee, Wisconsin' },
  ];

  return (
    <PageTransition>
      <div className="flex flex-col gap-6 w-full h-full font-sans select-none pb-12">
        
        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
          {/* Back button and title */}
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => router.push('/tournaments')}
              className="flex items-center gap-1.5 text-[#083F92] hover:opacity-80 transition-opacity focus:outline-none w-fit"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
              <span className="font-poppins font-medium text-[18px] leading-[27px]">Back</span>
            </button>
            <h1 className="font-poppins font-bold text-[24px] leading-[36px] text-[#083F92] m-0">
              {tournamentTitle}
            </h1>
          </div>

          {/* Right Action buttons: Edit & Delete */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Edit Button */}
            <button 
              onClick={() => setShowEditDialog(true)}
              className="flex items-center gap-2.5 px-[15px] py-[15px] bg-[#083F92]/10 hover:bg-[#083F92]/15 text-[#000000] rounded-[100px] transition-colors focus:outline-none h-[72px] shadow-sm w-[105px] justify-center"
            >
              <div className="w-[42px] h-[42px] bg-[#083F92] rounded-full flex items-center justify-center text-white relative shadow-md shrink-0">
                <Edit3 className="w-4 h-4" />
              </div>
              <span className="font-poppins font-medium text-[14px] leading-[20px] tracking-[-0.019em] pr-1">
                Edit
              </span>
            </button>

            {/* Delete Button */}
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2.5 px-[15px] py-[15px] bg-[#083F92]/10 hover:bg-[#083F92]/15 text-[#000000] rounded-[100px] transition-colors focus:outline-none h-[72px] shadow-sm w-[124px] justify-center"
            >
              <div className="w-[42px] h-[42px] bg-[#083F92] rounded-full flex items-center justify-center text-white relative shadow-md shrink-0">
                <Trash2 className="w-4 h-4" />
              </div>
              <span className="font-poppins font-medium text-[14px] leading-[20px] tracking-[-0.019em] pr-1">
                Delete
              </span>
            </button>
          </div>
        </div>

        {/* Main Details Container Scrollable Wrapper */}
        <div className="w-full bg-white border border-[#DADADA] rounded-[24px] shadow-sm flex flex-col gap-6 p-6 overflow-hidden min-h-[700px]">
          
          {/* Tournament Details Section Card */}
          <div className="w-full bg-[#083F92]/10 rounded-[12px] p-6 flex flex-col gap-6">
            <h2 className="font-poppins font-bold text-[24px] leading-[36px] text-[#083F92] m-0 border-b border-[#083F92]/10 pb-2">
              Tournament details
            </h2>

            {/* Details Fields Table/Grid */}
            <div className="flex flex-col gap-4 max-w-[900px] w-full">
              {[
                { label: 'Location', value: tournamentDetails.location, icon: MapPin },
                { label: 'Entry fee', value: tournamentDetails.entryFee, icon: DollarSign },
                { label: 'Date of Tournament', value: tournamentDetails.date, icon: Calendar },
                { label: 'Division', value: tournamentDetails.division, icon: GitMerge },
                { label: 'Tournament Id', value: tournamentDetails.tournamentId, icon: Hash },
                { label: 'Tournament Host', value: tournamentDetails.tournamentHost, icon: User },
                { label: 'Tournament Director', value: tournamentDetails.tournamentDirector, icon: Award }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center w-full sm:h-[32px] gap-1 sm:gap-0 border-b border-[#083F92]/5 pb-2 sm:pb-0 sm:border-b-0">
                  
                  {/* Left Label column with Icon */}
                  <div className="flex items-center gap-2.5 w-full sm:w-[280px] shrink-0">
                    <div className="w-[32px] h-[32px] bg-[#083F92] text-white rounded-full flex items-center justify-center shrink-0">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <span className="font-poppins font-medium text-[16px] sm:text-[20px] leading-[30px] text-[#636363]">
                      {item.label}
                    </span>
                  </div>

                  {/* Colon Separator */}
                  <span className="hidden sm:inline font-sans font-medium text-[20px] leading-[27px] text-[#000000] w-[30px] shrink-0 text-center">
                    :
                  </span>

                  {/* Value column */}
                  <span className="font-poppins font-bold text-[16px] sm:text-[20px] leading-[30px] text-[#083F92] truncate pl-11 sm:pl-0">
                    {item.value}
                  </span>

                </div>
              ))}
            </div>
          </div>

          {/* Registered Players Section Card */}
          <div className="w-full bg-[#083F92]/10 rounded-[12px] p-6 flex flex-col gap-6 relative">
            
            {/* Header titles + CSV action button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full border-b border-[#083F92]/10 pb-2 gap-4">
              <h2 className="font-poppins font-bold text-[24px] leading-[36px] text-[#083F92] m-0">
                Registered Players ({registeredPlayers.length})
              </h2>
              
              {/* CSV Button */}
              <button className="flex items-center gap-2 px-3 py-1.5 bg-[#083F92]/10 hover:bg-[#083F92]/15 text-[#000000] rounded-[100px] transition-colors focus:outline-none h-[42px] shrink-0 shadow-sm w-full sm:w-auto justify-center cursor-pointer">
                <div className="w-[32px] h-[32px] bg-[#083F92] rounded-full flex items-center justify-center text-white relative shadow-md">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <span className="font-poppins font-medium text-[12px] leading-[20px] tracking-[-0.019em] pr-1 pl-1">
                  Export As CVS
                </span>
              </button>
            </div>

            {/* Inner Sub-Table White Card Container */}
            <div className="w-full bg-white border border-[#DADADA] rounded-[24px] shadow-sm flex flex-col justify-between overflow-hidden relative min-h-[400px] pb-20">
              
              {/* Scrollable Table Area */}
              <div className="overflow-x-auto w-full">
                <table className="w-full border-collapse min-w-[800px]">
                  
                  {/* Table Header */}
                  <thead>
                    <tr className="bg-[#083F92] text-white text-left h-[50px] font-poppins font-semibold text-[13px]">
                      <th className="px-6 py-3 font-semibold w-[120px]">UserId</th>
                      <th className="px-6 py-3 font-semibold w-[120px]">Name</th>
                      <th className="px-6 py-3 font-semibold w-[80px]">Grade</th>
                      <th className="px-6 py-3 font-semibold w-[200px]">Team</th>
                      <th className="px-6 py-3 font-semibold w-[70px]">Rating</th>
                      <th className="px-6 py-3 font-semibold w-[170px]">City</th>
                      <th className="px-6 py-3 font-semibold text-right w-[126px]">Action</th>
                    </tr>
                  </thead>
                  
                  {/* Table Body */}
                  <tbody>
                    {registeredPlayers.map((player, index) => {
                      const isEven = index % 2 !== 0;
                      return (
                        <tr 
                          key={player.userId}
                          className={`h-[50px] border-b border-[#DADADA]/30 font-poppins text-[13px] text-[#636363] ${
                            isEven ? 'bg-[#083F92]/10' : 'bg-white'
                          }`}
                        >
                          <td className="px-6 py-3 font-semibold">{player.userId}</td>
                          <td className="px-6 py-3 font-semibold text-black">{player.name}</td>
                          <td className="px-6 py-3 font-semibold text-black">{player.grade}</td>
                          <td className="px-6 py-3 font-semibold text-black tracking-[-0.02em]">{player.team}</td>
                          <td className="px-6 py-3 font-semibold text-black">{player.rating}</td>
                          <td className="px-6 py-3 font-semibold text-black tracking-[-0.02em]">{player.city}</td>
                          <td className="px-6 py-3 text-right">
                            <Link 
                              href={`/users/${player.userId}`} 
                              className="font-semibold underline text-black hover:opacity-80 transition-opacity tracking-[-0.02em]"
                            >
                              View Profile
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>

                </table>
              </div>

              {/* Floating Pagination Bar (Bottom Right) */}
              <Pagination 
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                className="absolute right-[24px] bottom-[16px]"
              />

            </div>

          </div>

        </div>

      </div>

      {/* Edit Tournament Dialog Modal */}
      <CreateTournamentDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />

      <ConfirmDeleteDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Tournament"
        description="Are you sure you want to delete this tournament? This action cannot be undone."
        onConfirm={() => router.push('/tournaments')}
      />
    </PageTransition>
  );
}
