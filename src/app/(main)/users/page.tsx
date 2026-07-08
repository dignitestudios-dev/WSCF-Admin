'use client';

import { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsUpDown,
  FileSpreadsheet
} from 'lucide-react';
import { SearchInput } from '@/components/ui/search-input';
import Link from 'next/link';
import { PageTransition } from '@/components/animations/page-transition';
import { Pagination } from '@/components/ui/pagination';

interface UserRow {
  userId: string;
  name: string;
  grade: string;
  team: string;
  teamCode: string;
  city: string;
}

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(2); // Match Figma mockup showing page 2 selected

  const allUsers: UserRow[] = [
    { userId: '00000001', name: 'Ethan Carter', grade: '7th', team: 'Milwaukee Knights Chess Club', teamCode: '13456', city: 'Milwaukee, Wisconsin' },
    { userId: '00000002', name: 'Olivia Brown', grade: '7th', team: 'Milwaukee Knights Chess Club', teamCode: '13457', city: 'Milwaukee, Wisconsin' },
    { userId: '00000003', name: 'Lucas White', grade: '7th', team: 'Milwaukee Knights Chess Club', teamCode: '13458', city: 'Milwaukee, Wisconsin' },
    { userId: '00000004', name: 'Sophia Green', grade: '7th', team: 'Milwaukee Knights Chess Club', teamCode: '13459', city: 'Milwaukee, Wisconsin' },
    { userId: '00000005', name: 'Mason Johnson', grade: '7th', team: 'Milwaukee Knights Chess Club', teamCode: '13460', city: 'Milwaukee, Wisconsin' },
    { userId: '00000006', name: 'Ava Martinez', grade: '7th', team: 'Milwaukee Knights Chess Club', teamCode: '13461', city: 'Milwaukee, Wisconsin' },
    { userId: '00000007', name: 'James Wilson', grade: '7th', team: 'Milwaukee Knights Chess Club', teamCode: '13462', city: 'Milwaukee, Wisconsin' },
    { userId: '00000008', name: 'Isabella Davis', grade: '7th', team: 'Milwaukee Knights Chess Club', teamCode: '13463', city: 'Milwaukee, Wisconsin' },
    { userId: '00000009', name: 'Oliver Thomas', grade: '7th', team: 'Milwaukee Knights Chess Club', teamCode: '13464', city: 'Milwaukee, Wisconsin' },
    { userId: '00000010', name: 'Mia Harris', grade: '7th', team: 'Milwaukee Knights Chess Club', teamCode: '13465', city: 'Milwaukee, Wisconsin' },
    { userId: '00000011', name: 'Benjamin Lee', grade: '7th', team: 'Milwaukee Knights Chess Club', teamCode: '13466', city: 'Milwaukee, Wisconsin' },
    { userId: '00000012', name: 'Charlotte Adams', grade: '7th', team: 'Milwaukee Knights Chess Club', teamCode: '13467', city: 'Milwaukee, Wisconsin' },
    { userId: '00000013', name: 'Henry Clark', grade: '7th', team: 'Milwaukee Knights Chess Club', teamCode: '13468', city: 'Milwaukee, Wisconsin' },
    { userId: '00000014', name: 'Ella Walker', grade: '7th', team: 'Milwaukee Knights Chess Club', teamCode: '13469', city: 'Milwaukee, Wisconsin' },
  ];

  // Filtering users based on search query
  const filteredUsers = allUsers.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.userId.includes(searchQuery) ||
    user.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageTransition>
      <div className="flex flex-col gap-6 w-full h-full font-sans select-none">
      
      {/* Top Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
        
        {/* Left Title + Search pill bar */}
        <div className="flex items-center gap-6 w-full max-w-[500px]">
          <h1 className="font-poppins font-bold text-[42px] leading-[63px] text-[#151515] m-0 shrink-0">
            Users
          </h1>
          
          {/* Search Pill Input */}
          <SearchInput value={searchQuery} onChangeValue={setSearchQuery} />
        </div>

        {/* Right Button: Export As CVS */}
        <button className="flex items-center gap-2.5 px-[15px] py-[15px] bg-[#083F92]/10 hover:bg-[#083F92]/15 text-[#000000] rounded-[100px] transition-colors focus:outline-none h-[72px] shrink-0 shadow-sm">
          <div className="w-[42px] h-[42px] bg-[#083F92] rounded-full flex items-center justify-center text-white relative shadow-md">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <span className="font-poppins font-medium text-[14px] leading-[20px] tracking-[-0.019em] pr-2">
            Export As CVS
          </span>
        </button>

      </div>

      {/* Main Table Container Card */}
      <div className="w-full bg-white border border-[#DADADA] rounded-[24px] shadow-sm flex flex-col justify-between overflow-hidden flex-1 relative min-h-[600px] mb-8 pb-20">
        
        {/* Scrollable Table Area */}
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse">
            
            {/* Table Header */}
            <thead>
              <tr className="bg-[#083F92] text-white text-left h-[50px] font-poppins font-semibold text-[13px]">
                <th className="px-6 py-3 font-semibold w-[100px]">UserId</th>
                <th className="px-6 py-3 font-semibold w-[120px]">Name</th>
                <th className="px-6 py-3 font-semibold w-[80px]">
                  <div className="flex items-center gap-1 cursor-pointer hover:opacity-80">
                    Grade <ChevronsUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th className="px-6 py-3 font-semibold w-[230px]">
                  <div className="flex items-center gap-1 cursor-pointer hover:opacity-80">
                    Team <ChevronsUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th className="px-6 py-3 font-semibold w-[110px]">
                  <div className="flex items-center gap-1 cursor-pointer hover:opacity-80">
                    Team Code <ChevronsUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th className="px-6 py-3 font-semibold w-[170px]">
                  <div className="flex items-center gap-1 cursor-pointer hover:opacity-80">
                    City <ChevronsUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th className="px-6 py-3 font-semibold text-right w-[126px]">Action</th>
              </tr>
            </thead>
            
            {/* Table Body */}
            <tbody>
              {filteredUsers.map((user, index) => {
                const isEven = index % 2 !== 0;
                return (
                  <tr 
                    key={user.userId}
                    className={`h-[50px] border-b border-[#DADADA]/30 font-poppins text-[13px] text-[#636363] ${
                      isEven ? 'bg-[#083F92]/10' : 'bg-white'
                    }`}
                  >
                    <td className="px-6 py-3 font-semibold">{user.userId}</td>
                    <td className={`px-6 py-3 ${isEven ? 'font-bold' : 'font-semibold'}`}>
                      {user.name}
                    </td>
                    <td className={`px-6 py-3 ${isEven ? 'font-bold' : 'font-semibold'}`}>
                      {user.grade}
                    </td>
                    <td className="px-6 py-3 font-semibold tracking-[-0.02em]">{user.team}</td>
                    <td className="px-6 py-3 font-semibold">{user.teamCode}</td>
                    <td className="px-6 py-3 font-semibold tracking-[-0.02em]">{user.city}</td>
                    <td className="px-6 py-3 text-right">
                      <Link 
                        href={`/users/${user.userId}`} 
                        className="font-semibold underline hover:opacity-80 transition-opacity tracking-[-0.02em]"
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
    </PageTransition>
  );
}
