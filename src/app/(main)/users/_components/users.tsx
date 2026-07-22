'use client';

import { useState } from 'react';
import {
  ChevronsUpDown,
  FileSpreadsheet
} from 'lucide-react';
import { SearchInput } from '@/components/ui/search-input';
import { useDebounce } from '@/hooks/use-debounce';
import Link from 'next/link';
import { PageTransition } from '@/components/animations/page-transition';
import { Pagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { useUsers } from '@/features/users/hooks/use-users';
import { userService } from '@/features/users/services/user.service';

interface UserRow {
  userId: string;
  name: string;
  grade: string;
  team: string;
  teamCode: string;
  city: string;
}

export default function Users() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isExporting, setIsExporting] = useState(false);

  const { data: usersData, isLoading } = useUsers(currentPage, itemsPerPage, debouncedSearchQuery);
  console.log(usersData, "usersData")
  const users = usersData?.data?.users || [];
  const totalPages = usersData?.data?.pagination?.totalPages || 1;

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const blob = await userService.exportUsers();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'users.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export users:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const mappedUsers = users.map((user: any) => ({
    userId: user.playerProfile?.membershipId || user._id.substring(0, 8).toUpperCase(),
    originalId: user._id, // Used for Link
    name: user.name,
    grade: user.playerProfile?.grade || 'N/A',
    team: user.team?.name || 'N/A',
    teamCode: user.team?.teamCode || 'N/A',
    city: user.playerProfile?.city || 'N/A',
  }));

  return (
    <PageTransition>
      <div className="flex flex-col gap-6 w-full h-full font-sans select-none">

        {/* Top Header Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">

          {/* Left Title + Search pill bar */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 w-full sm:max-w-[500px]">
            <h1 className="font-poppins font-bold sm:text-[42px] text-[28px] sm:leading-[63px] leading-[36px] text-[#083F92] m-0 shrink-0">
              Users
            </h1>

            {/* Search Pill Input */}
            <div className="w-full sm:w-auto">
              <SearchInput value={searchQuery} onChangeValue={setSearchQuery} />
            </div>
          </div>

          {/* Right Button: Export As CSV */}
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2.5 px-[15px] py-[15px] bg-[#083F92]/10 hover:bg-[#083F92]/15 text-[#000000] rounded-[100px] transition-colors focus:outline-none h-[72px] shrink-0 shadow-sm w-full sm:w-auto justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-[42px] h-[42px] bg-[#083F92] rounded-full flex items-center justify-center text-white relative shadow-md">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <span className="font-poppins font-medium text-[14px] leading-[20px] tracking-[-0.019em] pr-2">
              {isExporting ? 'Exporting...' : 'Export As CSV'}
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
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={`skeleton-${i}`} className="h-[50px] border-b border-[#DADADA]/30 bg-white">
                      <td className="px-6 py-3"><Skeleton className="h-4 w-[80px]" /></td>
                      <td className="px-6 py-3"><Skeleton className="h-4 w-[120px]" /></td>
                      <td className="px-6 py-3"><Skeleton className="h-4 w-[40px]" /></td>
                      <td className="px-6 py-3"><Skeleton className="h-4 w-[160px]" /></td>
                      <td className="px-6 py-3"><Skeleton className="h-4 w-[80px]" /></td>
                      <td className="px-6 py-3"><Skeleton className="h-4 w-[120px]" /></td>
                      <td className="px-6 py-3"><Skeleton className="h-4 w-[80px] float-right" /></td>
                    </tr>
                  ))
                ) : mappedUsers.length > 0 ? (
                  mappedUsers.map((user, index) => {
                    const isEven = index % 2 !== 0;
                    return (
                      <tr
                        key={user.originalId}
                        className={`h-[50px] border-b border-[#DADADA]/30 font-poppins text-[13px] text-[#636363] ${isEven ? 'bg-[#083F92]/10' : 'bg-white'
                          }`}
                      >
                        <td className="px-6 py-3 font-semibold text-nowrap">{user.userId}</td>
                        <td className={`px-6 py-3 ${isEven ? 'font-bold' : 'font-semibold'}`}>
                          {user.name}
                        </td>
                        <td className={`px-6 py-3 ${isEven ? 'font-bold' : 'font-semibold'}`}>
                          {user.grade}
                        </td>
                        <td className="px-6 py-3 font-semibold tracking-[-0.02em]">{user.team}</td>
                        <td className="px-6 py-3 font-semibold">{user.teamCode}</td>
                        <td className="px-6 py-3 font-semibold tracking-[-0.02em]">
                          <div className="line-clamp-2" title={user.city}>
                            {user.city}
                          </div>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <Link
                            href={`/users/${user.originalId}`}
                            className="font-semibold underline hover:opacity-80 transition-opacity tracking-[-0.02em]"
                          >
                            View Profile
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-[#787878] font-poppins">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
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
    </PageTransition>
  );
}
