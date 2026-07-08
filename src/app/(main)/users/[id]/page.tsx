'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  Edit3, 
  Trash2, 
  MapPin, 
  Calendar, 
  Armchair, 
  Tag, 
  ArrowRight,
  Crown,
  Trophy,
  Flag,
  Star,
  Users,
  Phone,
  Mail,
  ChevronRight,
  FileSpreadsheet
} from 'lucide-react';
import Image from 'next/image';
import { PageTransition } from '@/components/animations/page-transition';
import Link from 'next/link';

interface TournamentItem {
  id: number;
  title: string;
  location: string;
  date: string;
  seats: string;
  price: string;
  status: 'Upcoming' | 'Completed';
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'basic' | 'tournaments'>('basic');
  const [tournamentFilter, setTournamentFilter] = useState<'Upcoming' | 'Completed'>('Upcoming');

  const userData = {
    name: "Leo Denzin",
    email: "Denzin@gmail.com",
    userId: "00000001",
    grade: "7th",
    team: "Milwaukee Knights Chess Club",
    rating: "13456",
    city: "Milwaukee, Wisconsin",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face",
    performance: {
      totalTournaments: "12",
      totalWins: "05",
      quickestWin: "2.5mins",
      currentRating: "1234"
    },
    parentDetail: {
      name: "Jennifer Carter",
      contact: "+1 (414) 555-7821",
      email: "ethan.carter@email.com"
    }
  };

  const userTournaments: TournamentItem[] = [
    { id: 1, title: 'USCF-Rated Scholastic May Summer Tournament', location: 'Old Guard Games', date: 'June 20, 2026', seats: '8/24', price: '$40', status: 'Upcoming' },
    { id: 2, title: 'USCF-Rated Scholastic May Summer Tournament', location: 'Old Guard Games', date: 'June 20, 2026', seats: '8/24', price: '$40', status: 'Upcoming' },
    { id: 3, title: 'USCF-Rated Scholastic May Summer Tournament', location: 'Old Guard Games', date: 'June 20, 2026', seats: '8/24', price: '$40', status: 'Upcoming' },
    { id: 4, title: 'USCF-Rated Scholastic April Summer Tournament', location: 'Old Guard Games', date: 'April 15, 2026', seats: '8/24', price: '$40', status: 'Completed' },
    { id: 5, title: 'USCF-Rated Scholastic March Blitz', location: 'Old Guard Games', date: 'March 10, 2026', seats: '8/24', price: '$40', status: 'Completed' },
  ];

  const filteredTournaments = userTournaments.filter(t => t.status === tournamentFilter);

  return (
    <PageTransition>
      <div className="flex flex-col gap-6 w-full h-full font-sans select-none pb-12">
        
        {/* Top Header Row */}
        <div className="flex justify-between items-end w-full pt-4">
          {/* Back button */}
          <button 
            onClick={() => router.push('/users')}
            className="flex items-center gap-2 text-[#083F92] hover:opacity-80 transition-opacity focus:outline-none"
          >
            <ChevronLeft className="w-5 h-5 stroke-[3]" />
            <span className="font-poppins font-medium text-[18px] leading-[27px]">Back</span>
          </button>

          {/* Right Action buttons */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Edit Button */}
            <button className="flex items-center gap-2 px-[15px] py-[15px] bg-[#083F92]/10 hover:bg-[#083F92]/15 text-[#000000] rounded-[100px] transition-colors focus:outline-none h-[72px] shadow-sm w-[105px] justify-center">
              <div className="w-[42px] h-[42px] bg-[#083F92] rounded-full flex items-center justify-center text-white relative shadow-md shrink-0">
                <Edit3 className="w-5 h-5" />
              </div>
              <span className="font-poppins font-medium text-[14px] leading-[20px] tracking-[-0.019em]">
                Edit
              </span>
            </button>

            {/* Deactivate Button */}
            <button className="flex items-center gap-2 px-[15px] py-[15px] bg-[#083F92]/10 hover:bg-[#083F92]/15 text-[#000000] rounded-[100px] transition-colors focus:outline-none h-[72px] shadow-sm w-[155px] justify-center">
              <div className="w-[42px] h-[42px] bg-[#083F92] rounded-full flex items-center justify-center text-white relative shadow-md shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <span className="font-poppins font-medium text-[14px] leading-[20px] tracking-[-0.019em]">
                Deactivate
              </span>
            </button>
          </div>
        </div>

        {/* Outer Banner and Details Container */}
        <div className="w-full bg-[#083F92] rounded-[20px] shadow-md flex flex-col relative min-h-[600px] mt-16">
          
          {/* Blue Top Profile Header Area */}
          <div className="w-full px-12 pt-4 pb-10 flex flex-col md:flex-row gap-6 items-center relative z-10">
            {/* Avatar Circle */}
            <div className="absolute w-[150px] h-[150px] rounded-full overflow-hidden border-[6px] border-[#EFEEF9] shrink-0 shadow-lg -top-[70px] bg-[#D9D9D9] z-30">
              <Image 
                src={userData.avatar}
                alt={userData.name}
                fill
                className="object-cover"
              />
            </div>

            {/* Profile text details & stats grid */}
            <div className="flex flex-col gap-6 flex-1 w-full text-white">
              {/* Title & Email */}
              <div className="flex flex-col ml-[170px] gap-1">
                <h1 className="font-poppins font-semibold text-[32px] leading-[38px] text-white m-0">
                  {userData.name}
                </h1>
                <span className="font-poppins font-normal text-[14px] leading-[21px] text-[#DBDBDB]">
                  {userData.email}
                </span>
              </div>

              {/* Metadata stats row */}
              <div className="flex flex-wrap items-center justify-between ml-2 gap-6 w-full mt-2 select-text">
                
                {/* Stats block - User ID */}
                <div className="flex flex-col">
                  <span className="font-poppins font-normal text-[12px] leading-[18px] text-white/70">UserID</span>
                  <span className="font-poppins font-medium text-[16px] leading-[24px] tracking-[-0.02em]">{userData.userId}</span>
                </div>

                {/* Divider Line & Stats block - Grade */}
                <div className="flex items-start gap-3">
                  <div className="w-[4px] h-[18px] bg-white rounded-full shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-poppins font-normal text-[12px] leading-[18px] text-white/70">Grade</span>
                    <span className="font-poppins font-medium text-[16px] leading-[24px] tracking-[-0.02em]">{userData.grade}</span>
                  </div>
                </div>

                {/* Divider Line & Stats block - Team */}
                <div className="flex items-start gap-3">
                  <div className="w-[4px] h-[18px] bg-white rounded-full shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-poppins font-normal text-[12px] leading-[18px] text-white/70">Team</span>
                    <span className="font-poppins font-medium text-[16px] leading-[24px] tracking-[-0.02em]">{userData.team}</span>
                  </div>
                </div>

                {/* Divider Line & Stats block - Rating */}
                <div className="flex items-start gap-3">
                  <div className="w-[4px] h-[18px] bg-white rounded-full shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-poppins font-normal text-[12px] leading-[18px] text-white/70">Rating</span>
                    <span className="font-poppins font-medium text-[16px] leading-[24px] tracking-[-0.02em]">{userData.rating}</span>
                  </div>
                </div>

                {/* Divider Line & Stats block - City */}
                <div className="flex items-start gap-3">
                  <div className="w-[4px] h-[18px] bg-white rounded-full shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-poppins font-normal text-[12px] leading-[18px] text-white/70">City</span>
                    <span className="font-poppins font-medium text-[16px] leading-[24px] tracking-[-0.02em]">{userData.city}</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* White Bottom Content Tab Panel Area (Overlaps Banner) */}
          <div className="w-full bg-white rounded-t-[24px] rounded-b-[20px] flex-1 min-h-[300px] z-20 flex flex-col p-8 gap-8 shadow-inner">
            
            {/* Tab switch button capsule */}
            <div className="flex items-center w-full max-w-[251px] h-[50px] bg-[#083F92]/10 rounded-[100px] shrink-0">
              <button
                onClick={() => setActiveTab('basic')}
                className={`flex-1 h-full font-poppins text-[14px] leading-[21px] rounded-[100px] flex items-center justify-center transition-all ${
                  activeTab === 'basic' 
                    ? 'bg-[#083F92] text-white font-semibold border-[4px] border-white ' 
                    : 'text-black font-normal hover:bg-black/5'
                }`}
              >
                Basic Detail
              </button>
              <button
                onClick={() => setActiveTab('tournaments')}
                className={`flex-1 h-full font-poppins text-[14px] leading-[21px] rounded-[100px] flex items-center justify-center transition-all ${
                  activeTab === 'tournaments' 
                    ? 'bg-[#083F92] text-white font-semibold border-[4px] border-white ' 
                    : 'text-black font-normal hover:bg-black/5'
                }`}
              >
                Tournaments
              </button>
            </div>

            {/* Gray Separator Line Below Switcher */}
            <hr className="w-full border-t-2 border-[#EEEEEE] m-0" />

            {/* TAB CONTENTS */}
            {activeTab === 'basic' ? (
              <div className="flex flex-col gap-8 w-full">
                
                {/* Performance stats section */}
                <div className="flex flex-col gap-4 w-full">
                  <h3 className="font-poppins font-medium text-[24px] leading-[32px] text-[#292D32] m-0">
                    Performance
                  </h3>

                  {/* Horizontal stats block */}
                  <div className="flex flex-wrap items-center gap-6 w-full mt-2">
                    
                    {/* Stat Item - Total Tournaments */}
                    <div className="flex items-center gap-3">
                      <div className="w-[32px] h-[32px] bg-[#083F92] text-white rounded-full flex items-center justify-center shrink-0">
                        <Crown className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-poppins font-normal text-[14px] leading-[21px] text-[#797979]">Total Tournaments</span>
                        <span className="font-poppins font-medium text-[20px] leading-[30px] text-[#083F92]">{userData.performance.totalTournaments}</span>
                      </div>
                    </div>

                    {/* Divider Line */}
                    <div className="hidden md:block w-[4px] h-[18px] bg-[#CDCDCD] rounded-full shrink-0" />

                    {/* Stat Item - Total Wins */}
                    <div className="flex items-center gap-3">
                      <div className="w-[32px] h-[32px] bg-[#083F92] text-white rounded-full flex items-center justify-center shrink-0">
                        <Trophy className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-poppins font-normal text-[14px] leading-[21px] text-[#797979]">Total Wins</span>
                        <span className="font-poppins font-medium text-[20px] leading-[30px] text-[#083F92]">{userData.performance.totalWins}</span>
                      </div>
                    </div>

                    {/* Divider Line */}
                    <div className="hidden md:block w-[4px] h-[18px] bg-[#CDCDCD] rounded-full shrink-0" />

                    {/* Stat Item - Quickest Win */}
                    <div className="flex items-center gap-3">
                      <div className="w-[32px] h-[32px] bg-[#083F92] text-white rounded-full flex items-center justify-center shrink-0">
                        <Flag className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-poppins font-normal text-[14px] leading-[21px] text-[#797979]">Quickest Win</span>
                        <span className="font-poppins font-medium text-[20px] leading-[30px] text-[#083F92]">{userData.performance.quickestWin}</span>
                      </div>
                    </div>

                    {/* Divider Line */}
                    <div className="hidden md:block w-[4px] h-[18px] bg-[#CDCDCD] rounded-full shrink-0" />

                    {/* Stat Item - Current Rating */}
                    <div className="flex items-center gap-3">
                      <div className="w-[32px] h-[32px] bg-[#083F92] text-white rounded-full flex items-center justify-center shrink-0">
                        <Star className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-poppins font-normal text-[14px] leading-[21px] text-[#797979]">Current Rating</span>
                        <span className="font-poppins font-medium text-[20px] leading-[30px] text-[#083F92]">{userData.performance.currentRating}</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Gray Separator Line */}
                <hr className="w-full border-t border-[#EEEEEE] m-0" />

                {/* Parent/Guardian Details Section */}
                <div className="flex flex-col gap-4 w-full">
                  <h3 className="font-poppins font-medium text-[24px] leading-[32px] text-[#292D32] m-0">
                    Parent/Guardian Detail
                  </h3>

                  {/* Details stats block */}
                  <div className="flex flex-wrap items-center gap-6 w-full mt-2">
                    
                    {/* Parent detail item - Name */}
                    <div className="flex items-center gap-3">
                      <div className="w-[32px] h-[32px] bg-[#083F92] text-white rounded-full flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-poppins font-normal text-[14px] leading-[21px] text-[#797979]">Name</span>
                        <span className="font-poppins font-medium text-[20px] leading-[30px] text-[#083F92]">{userData.parentDetail.name}</span>
                      </div>
                    </div>

                    {/* Divider Line */}
                    <div className="hidden md:block w-[4px] h-[18px] bg-[#CDCDCD] rounded-full shrink-0" />

                    {/* Parent detail item - Contact */}
                    <div className="flex items-center gap-3">
                      <div className="w-[32px] h-[32px] bg-[#083F92] text-white rounded-full flex items-center justify-center shrink-0">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-poppins font-normal text-[14px] leading-[21px] text-[#797979]">Contact No.</span>
                        <span className="font-poppins font-medium text-[20px] leading-[30px] text-[#083F92]">{userData.parentDetail.contact}</span>
                      </div>
                    </div>

                    {/* Divider Line */}
                    <div className="hidden md:block w-[4px] h-[18px] bg-[#CDCDCD] rounded-full shrink-0" />

                    {/* Parent detail item - Email */}
                    <div className="flex items-center gap-3">
                      <div className="w-[32px] h-[32px] bg-[#083F92] text-white rounded-full flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-poppins font-normal text-[14px] leading-[21px] text-[#797979]">Email</span>
                        <span className="font-poppins font-medium text-[20px] leading-[30px] text-[#083F92]">{userData.parentDetail.email}</span>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            ) : (
              <div className="flex flex-col gap-6 w-full">
                {/* Tab 2: Tournaments lists */}
                {/* Upcoming/Completed Sub Filter Tabs */}
                <div className="flex items-center gap-2 w-full max-w-[240px] h-[50px] shrink-0">
                  {(['Upcoming', 'Completed'] as const).map((filterVal) => {
                    const isActive = tournamentFilter === filterVal;
                    return (
                      <button
                        key={filterVal}
                        onClick={() => setTournamentFilter(filterVal)}
                        className={`px-6 h-[44px] rounded-[100px] border-4 border-[#F4F4F4] font-poppins font-semibold text-[14px] leading-[19px] flex items-center justify-center transition-all ${
                          isActive 
                            ? 'bg-[#083F92] text-white border-transparent' 
                            : 'bg-white text-black hover:bg-black/5'
                        }`}
                      >
                        {filterVal}
                      </button>
                    );
                  })}
                </div>

                {/* Sub Tournaments cards stack */}
                <div className="flex flex-col gap-3 w-full">
                  {filteredTournaments.map((t) => (
                    <Link 
                      key={t.id}
                      href={`/tournaments/${t.id}`}
                      className="w-full h-[107px] bg-white border border-[#083F92]/30 rounded-[12px] shadow-[0px_4px_4px_rgba(0,0,0,0.05)] hover:shadow-[0px_4px_4px_rgba(0,0,0,0.1)] transition-all duration-150 flex items-center justify-between px-6 cursor-pointer"
                    >
                      <div className="flex items-center gap-4 max-w-[85%]">
                        {/* Chess icon container */}
                        <div className="w-[40px] h-[40px] bg-[#083F92] text-white rounded-full flex items-center justify-center shrink-0">
                          <Crown className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col gap-2">
                          <h2 className="font-poppins font-medium text-[18px] leading-[27px] text-[#083F92] truncate w-full">
                            {t.title}
                          </h2>
                          <div className="flex items-center gap-4 flex-wrap text-[#151515]/90">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-4 h-4 text-[#083F92]" />
                              <span className="font-poppins font-normal text-[14px] leading-[21px]">{t.location}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4 text-[#083F92]" />
                              <span className="font-poppins font-normal text-[14px] leading-[21px]">{t.date}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Armchair className="w-4 h-4 text-[#083F92]" />
                              <span className="font-poppins font-normal text-[14px] leading-[21px]">{t.seats}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Tag className="w-4 h-4 text-[#083F92]" />
                              <span className="font-poppins font-normal text-[14px] leading-[21px]">{t.price}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action & Badge details */}
                      <div className="flex items-center gap-6 shrink-0">
                        <div className={`w-[89px] h-[38px] rounded-[8px] flex items-center justify-center font-poppins font-medium text-[13px] leading-[18px] ${
                          t.status === 'Completed'
                            ? 'bg-[#083F92] text-white shadow-sm'
                            : 'bg-[#083F92]/10 text-[#083F92]'
                        }`}>
                          {t.status}
                        </div>
                        <ArrowRight className="w-6 h-6 text-black/80 hover:translate-x-0.5 transition-transform" />
                      </div>
                    </Link>
                  ))}
                </div>

              </div>
            )}

          </div>

        </div>

      </div>
    </PageTransition>
  );
}
