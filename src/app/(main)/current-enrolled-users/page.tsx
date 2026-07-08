'use client';

import { useState } from 'react';
import { 
  FileSpreadsheet, 
  ChevronsUpDown
} from 'lucide-react';
import { SearchInput } from '@/components/ui/search-input';
import Link from 'next/link';
import { Pagination } from '@/components/ui/pagination';

interface EnrolledUser {
  userId: string;
  name: string;
  grade: string;
  team: string;
  division: string;
  tournament: string;
}

export default function CurrentEnrolledUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(2);

  const enrolledUsers: EnrolledUser[] = [
    { userId: '00000001', name: 'Ethan Carter', grade: '7th', team: 'Milwaukee Knights Chess Club', division: 'X2', tournament: 'USCF-Rated Scholastic May Summer Tournament' },
    { userId: '00000002', name: 'Olivia Brown', grade: '7th', team: 'Milwaukee Knights Chess Club', division: 'X1', tournament: 'USCF-Rated Scholastic May Summer Tournament' },
    { userId: '00000003', name: 'Lucas White', grade: '7th', team: 'Milwaukee Knights Chess Club', division: 'X3', tournament: 'USCF-Rated Scholastic May Summer Tournament' },
    { userId: '00000004', name: 'Sophia Green', grade: '7th', team: 'Milwaukee Knights Chess Club', division: 'X3', tournament: 'USCF-Rated Scholastic May Summer Tournament' },
    { userId: '00000005', name: 'Mason Johnson', grade: '7th', team: 'Milwaukee Knights Chess Club', division: 'X1', tournament: 'USCF-Rated Scholastic May Summer Tournament' },
    { userId: '00000006', name: 'Ava Martinez', grade: '7th', team: 'Milwaukee Knights Chess Club', division: 'X1', tournament: 'USCF-Rated Scholastic May Summer Tournament' },
    { userId: '00000007', name: 'James Wilson', grade: '7th', team: 'Milwaukee Knights Chess Club', division: 'X2', tournament: 'USCF-Rated Scholastic May Summer Tournament' },
    { userId: '00000008', name: 'Isabella Davis', grade: '7th', team: 'Milwaukee Knights Chess Club', division: 'X2', tournament: 'USCF-Rated Scholastic May Summer Tournament' },
    { userId: '00000009', name: 'Liam Thompson', grade: '7th', team: 'Milwaukee Knights Chess Club', division: 'X2', tournament: 'USCF-Rated Scholastic May Summer Tournament' },
  ];

  const filteredUsers = enrolledUsers.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.userId.includes(searchQuery) ||
    user.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.tournament.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 w-full h-full font-sans select-none pb-12">
      
      {/* Top Title & Action Button Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
        <h1 className="font-poppins font-bold text-[42px] leading-[63px] text-[#083F92] m-0">
          Current Enrolled Users
        </h1>

        {/* Export Button */}
        <button className="flex items-center gap-2 px-[15px] py-[15px] bg-[#083F92]/10 hover:bg-[#083F92]/15 text-[#000000] rounded-[100px] transition-colors focus:outline-none h-[72px] shadow-sm w-[174px] justify-center shrink-0">
          <div className="w-[42px] h-[42px] bg-[#083F92] rounded-full flex items-center justify-center text-white relative shadow-md shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <span className="font-poppins font-medium text-[14px] leading-[20px] tracking-[-0.019em]">
            Export As CSV
          </span>
        </button>
      </div>

      {/* Search Input Box */}
      <SearchInput value={searchQuery} onChangeValue={setSearchQuery} />

      {/* Table Main Container */}
      <div className="w-full bg-white border border-[#DADADA] rounded-[24px] shadow-sm flex flex-col overflow-hidden">
        
        {/* Table Headings */}
        <div className="w-full bg-[#083F92] border-4 border-[#F4F4F4] rounded-t-[20px] flex items-center py-4 px-6 text-white text-[13px] font-bold font-poppins select-text shrink-0">
          <div className="w-[100px] shrink-0">UserId</div>
          <div className="w-[120px] shrink-0">Name</div>
          <div className="w-[80px] shrink-0 flex items-center gap-1.5 cursor-pointer hover:opacity-85">
            Grade <ChevronsUpDown className="w-4 h-4" />
          </div>
          <div className="w-[230px] shrink-0 flex items-center gap-1.5 cursor-pointer hover:opacity-85">
            Team <ChevronsUpDown className="w-4 h-4" />
          </div>
          <div className="w-[110px] shrink-0 flex items-center gap-1.5 cursor-pointer hover:opacity-85">
            Division <ChevronsUpDown className="w-4 h-4" />
          </div>
          <div className="w-[170px] shrink-0 flex items-center gap-1.5 cursor-pointer hover:opacity-85">
            Tournament <ChevronsUpDown className="w-4 h-4" />
          </div>
          <div className="flex-grow text-right shrink-0">Action</div>
        </div>

        {/* Table Rows List */}
        <div className="flex flex-col w-full">
          {filteredUsers.map((user, idx) => {
            const isAltRow = idx % 2 === 1;
            return (
              <div 
                key={user.userId} 
                className={`w-full h-[68px] flex items-center px-6 border-b border-[#EEEEEE] last:border-b-0 font-poppins font-semibold text-[13px] leading-[20px] text-[#636363] transition-colors ${
                  isAltRow ? 'bg-[#083F92]/10 hover:bg-[#083F92]/15' : 'bg-white hover:bg-black/5'
                }`}
              >
                <div className="w-[100px] font-semibold shrink-0 select-text">{user.userId}</div>
                <div className="w-[120px] font-bold text-[#636363] shrink-0 select-text">{user.name}</div>
                <div className="w-[80px] font-bold text-[#636363] shrink-0 select-text">{user.grade}</div>
                <div className="w-[230px] font-medium tracking-[-0.02em] shrink-0 select-text">{user.team}</div>
                <div className="w-[110px] font-semibold shrink-0 select-text">{user.division}</div>
                <div className="w-[170px] font-semibold text-[13px] leading-[19px] tracking-[-0.02em] shrink-0 select-text pr-2 line-clamp-2">
                  {user.tournament}
                </div>
                <div className="flex-grow text-right shrink-0">
                  <Link 
                    href={`/users/${parseInt(user.userId)}`}
                    className="font-semibold tracking-[-0.02em] underline text-[#636363] hover:text-[#083F92] transition-colors"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Pagination Row */}
      <div className="flex justify-end items-center w-full mt-4">
        <Pagination 
          currentPage={currentPage}
          totalPages={3}
          onPageChange={setCurrentPage}
        />
      </div>

    </div>
  );
}
