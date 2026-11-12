'use client';

import { useState } from 'react';
import {
  FileSpreadsheet
} from 'lucide-react';
import { SearchInput } from '@/components/ui/search-input';
import Link from 'next/link';
import { PageTransition } from '@/components/animations/page-transition';
import { Pagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { CountBadge } from '@/components/ui/count-badge';
import { useUsers } from '@/features/users/hooks/use-users';
import { userService, type EmailVerifiedFilter } from '@/features/users/services/user.service';
import { EmailVerifiedBadge } from '@/components/ui/email-verified-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { UserRound } from 'lucide-react';
import { useListParams } from '@/hooks/use-list-params';
import { Highlight } from '@/components/ui/highlight';
import { MasterPlayerFileButton } from '@/features/users/components/master-player-file-button';

interface UserRow {
  userId: string;
  firstName: string;
  lastName: string;
  grade: string;
  team: string;
  city: string;
}

export default function Users() {
  // Page and search live in the URL, so a filtered list survives opening a
  // user and coming back — and can be bookmarked or shared.
  const {
    page: currentPage,
    setPage: setCurrentPage,
    searchInput: searchQuery,
    setSearchInput: setSearchQuery,
    search: debouncedSearchQuery,
    getFilter,
    setFilter,
  } = useListParams();
  const itemsPerPage = 10;
  const [isExporting, setIsExporting] = useState(false);

  // Email verification is optional for parents, so the admin can tell who has
  // done it and who has not. Kept in the URL like the page and search.
  const rawVerified = getFilter('emailVerified');
  const emailVerified: EmailVerifiedFilter =
    rawVerified === 'verified' || rawVerified === 'unverified' ? rawVerified : 'all';

  const { data: usersData, isLoading } = useUsers(
    currentPage,
    itemsPerPage,
    debouncedSearchQuery,
    emailVerified
  );
  const users = usersData?.data?.users || [];
  const totalPages = usersData?.data?.pagination?.totalPages || 1;
  const totalItems = usersData?.data?.pagination?.totalItems;

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

  // A row is a player — a child. The membership id, grade and name are theirs;
  // the address comes from the parent account and is shared with any siblings.
  // The id is issued with a player's first membership, so someone who has only
  // signed up has none yet. Shown as a dash: a fragment of the database id here
  // would read as a real member id.
  const mappedUsers = users.map((user: any) => ({
    userId: user.membershipId || '—',
    originalId: user._id, // the player, which is what /users/[id] expects
    firstName: user.firstName || 'N/A',
    lastName: user.lastName || 'N/A',
    grade: user.grade || 'N/A',
    team: user.team?.name || 'N/A',
    city: user.account?.address?.city || 'N/A',
    emailVerified: user.account?.isEmailVerified as boolean | undefined,
  }));

  return (
    <PageTransition>
      <div className="flex flex-col gap-6 w-full h-full font-sans select-none">

        {/* Top Header Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">

          {/* Left Title + Search pill bar */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 w-full sm:max-w-[500px]">
            <div className="flex flex-col items-start gap-1 shrink-0">
              <h1 className="font-poppins font-bold sm:text-[42px] text-[28px] sm:leading-[63px] leading-[36px] text-[#083F92] m-0">
                Users
              </h1>
              <CountBadge count={totalItems} label="user" isLoading={isLoading} filtered={Boolean(debouncedSearchQuery) || emailVerified !== 'all'} />
            </div>

            {/* Search Pill Input */}
            <div className="w-full sm:w-auto">
              <SearchInput
                value={searchQuery}
                onChangeValue={setSearchQuery}
                placeholder="Search by first name, last name or user ID"
              />
            </div>
          </div>

          {/* Right Buttons: Master Player File (WinTD) and Export As CSV */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0">
          <MasterPlayerFileButton />
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

        </div>

        {/* Email verification filter */}
        <div role="tablist" aria-label="Email verification" className="flex w-fit gap-2 rounded-full bg-[#083F92]/10 p-1">
          {([
            { value: 'all', label: 'All' },
            { value: 'verified', label: 'Email verified' },
            { value: 'unverified', label: 'Not verified' },
          ] as const).map((tab) => (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={emailVerified === tab.value}
              onClick={() => setFilter('emailVerified', tab.value === 'all' ? '' : tab.value)}
              className={`cursor-pointer rounded-full px-5 py-2 font-poppins text-[13px] font-semibold transition-colors ${
                emailVerified === tab.value
                  ? 'bg-[#083F92] text-white shadow-sm'
                  : 'text-[#083F92] hover:bg-[#083F92]/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
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
                  <th className="px-6 py-3 font-semibold w-[130px]">First Name</th>
                  <th className="px-6 py-3 font-semibold w-[130px]">Last Name</th>
                  <th className="px-6 py-3 font-semibold w-[80px]">
                    Grade
                  </th>
                  <th className="px-6 py-3 font-semibold w-[190px]">
                    Team
                  </th>
                  <th className="px-6 py-3 font-semibold w-[140px]">
                    City
                  </th>
                  <th className="px-6 py-3 font-semibold w-[130px]">
                    Email Status
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
                      <td className="px-6 py-3"><Skeleton className="h-4 w-[100px]" /></td>
                      <td className="px-6 py-3"><Skeleton className="h-4 w-[100px]" /></td>
                      <td className="px-6 py-3"><Skeleton className="h-4 w-[40px]" /></td>
                      <td className="px-6 py-3"><Skeleton className="h-4 w-[160px]" /></td>
                      <td className="px-6 py-3"><Skeleton className="h-4 w-[120px]" /></td>
                      <td className="px-6 py-3"><Skeleton className="h-5 w-[90px] rounded-full" /></td>
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
                        <td className="px-6 py-3 font-semibold text-nowrap">
                          <Highlight text={user.userId} query={debouncedSearchQuery} />
                        </td>
                        <td className={`max-w-[130px] truncate px-6 py-3 ${isEven ? 'font-bold' : 'font-semibold'}`} title={user.firstName}>
                          <Highlight text={user.firstName} query={debouncedSearchQuery} />
                        </td>
                        <td className={`max-w-[130px] truncate px-6 py-3 ${isEven ? 'font-bold' : 'font-semibold'}`} title={user.lastName}>
                          <Highlight text={user.lastName} query={debouncedSearchQuery} />
                        </td>
                        <td className={`px-6 py-3 ${isEven ? 'font-bold' : 'font-semibold'}`}>
                          {user.grade}
                        </td>
                        <td className="max-w-[230px] truncate px-6 py-3 font-semibold tracking-[-0.02em]" title={user.team}>{user.team}</td>
                        <td className="px-6 py-3 font-semibold tracking-[-0.02em] max-w-[150px]">
                          <div className="line-clamp-2 break-words [overflow-wrap:anywhere]" title={user.city}>
                            {user.city}
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <EmailVerifiedBadge verified={user.emailVerified} />
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
                    <td colSpan={8}>
                      <EmptyState
                        icon={UserRound}
                        title="No users found"
                        description="Try a different search or filter, or clear them to see everyone."
                      />
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
