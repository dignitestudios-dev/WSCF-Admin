'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, MapPin, Calendar, Users as UsersIcon, Eye } from 'lucide-react';
import { PageTransition } from '@/components/animations/page-transition';
import { useSchoolDetails } from '@/features/schools/hooks/use-schools';
import { useUsers } from '@/features/users/hooks/use-users';
import type { UserListItem } from '@/features/users/services/user.service';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/ui/pagination';

export default function SchoolDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const { data, isLoading } = useSchoolDetails(id);
  // Extract school based on common API response formats
  const school = data?.data?.school || data?.data || data;

  // Players assigned to this school
  const [playersPage, setPlayersPage] = useState(1);
  const playersPerPage = 10;
  const { data: playersData, isLoading: isLoadingPlayers } = useUsers(
    playersPage,
    playersPerPage,
    '',
    id
  );
  const players = playersData?.data?.users || [];
  const playersTotalPages = playersData?.data?.pagination?.totalPages || 1;
  const playersTotal = playersData?.data?.pagination?.totalItems ?? 0;

  return (
    <PageTransition>
      <div className="flex flex-col gap-6 w-full h-full font-sans pb-12">
        {/* Back Button */}
        <div className="flex items-center w-full pt-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#083F92] hover:opacity-80 transition-opacity focus:outline-none cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6 stroke-[3]" />
            <span className="font-poppins font-medium text-[18px] leading-[27px]">Back to Schools</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="w-full bg-[#FFFFFF] border border-[#DADADA] rounded-[24px] overflow-hidden flex flex-col shadow-xs mt-2 p-8 md:p-12 relative min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col gap-6 w-full">
              <Skeleton className="w-[300px] h-[48px] rounded-lg" />
              <div className="flex flex-col gap-4 mt-6">
                <Skeleton className="w-full max-w-[500px] h-[24px]" />
                <Skeleton className="w-full max-w-[400px] h-[24px]" />
              </div>
            </div>
          ) : school ? (
            <div className="flex flex-col gap-8 w-full max-w-6xl">
              {/* Header */}
              <div className="flex flex-col gap-2">
                <h1 className="font-poppins font-bold text-[36px] md:text-[48px] leading-tight text-[#083F92] m-0 capitalize">
                  {school.name}
                </h1>
                <div className="flex items-center gap-2 text-[#181818]/60 mt-2">
                  <Calendar className="w-5 h-5" />
                  <span className="font-poppins text-[15px]">
                    Added on {school.createdAt ? new Date(school.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Unknown'}
                  </span>
                </div>
              </div>

              {/* Details Cards */}
              <div className="grid grid-cols-1 gap-6 mt-4">
                {/* Address Card */}
                <div className="flex flex-col gap-3 p-6 bg-[#083F92]/5 border border-[#083F92]/10 rounded-[24px] transition-all hover:bg-[#083F92]/10">
                  <div className="flex items-center gap-3 text-[#083F92] mb-1">
                    <MapPin className="w-6 h-6" />
                    <h3 className="font-poppins font-semibold text-[18px]">Location Address</h3>
                  </div>
                  <p className="font-poppins text-[15px] text-[#181818]/80 leading-relaxed pl-9 break-words">
                    {school.address || 'No address provided'}
                  </p>
                </div>
              </div>

              {/* Players assigned to this school */}
              <div className="flex flex-col gap-4 mt-4">
                <div className="flex items-center gap-3 text-[#083F92]">
                  <UsersIcon className="w-6 h-6" />
                  <h3 className="font-poppins font-semibold text-[18px]">
                    Registered Players
                    {!isLoadingPlayers && (
                      <span className="ml-2 font-normal text-[15px] text-[#181818]/50">
                        ({playersTotal})
                      </span>
                    )}
                  </h3>
                </div>

                <div className="w-full border border-[#DADADA] rounded-[24px] overflow-hidden relative pb-14">
                  <table className="w-full border-collapse table-fixed">
                    <thead>
                      <tr className="bg-[#083F92] text-white text-left h-[50px] font-poppins font-semibold text-[13px]">
                        <th className="px-6 py-3 font-semibold w-[120px]">UserId</th>
                        <th className="px-6 py-3 font-semibold w-[140px]">First Name</th>
                        <th className="px-6 py-3 font-semibold w-[140px]">Last Name</th>
                        <th className="px-6 py-3 font-semibold w-[80px]">Grade</th>
                        <th className="px-6 py-3 font-semibold w-[180px]">Team</th>
                        <th className="px-6 py-3 font-semibold text-right w-[100px]">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoadingPlayers ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <tr key={`player-skeleton-${i}`} className="h-[50px] border-b border-[#DADADA]/30 bg-white">
                            <td className="px-6 py-3"><Skeleton className="h-4 w-[80px]" /></td>
                            <td className="px-6 py-3"><Skeleton className="h-4 w-[100px]" /></td>
                            <td className="px-6 py-3"><Skeleton className="h-4 w-[100px]" /></td>
                            <td className="px-6 py-3"><Skeleton className="h-4 w-[40px]" /></td>
                            <td className="px-6 py-3"><Skeleton className="h-4 w-[120px]" /></td>
                            <td className="px-6 py-3"><Skeleton className="h-4 w-[60px] float-right" /></td>
                          </tr>
                        ))
                      ) : players.length > 0 ? (
                        players.map((player: UserListItem, index: number) => {
                          const isEven = index % 2 !== 0;
                          return (
                            <tr
                              key={player._id}
                              className={`h-[50px] border-b border-[#DADADA]/30 font-poppins text-[13px] text-[#636363] ${isEven ? 'bg-[#083F92]/10' : 'bg-white'}`}
                            >
                              <td className="px-6 py-3 font-semibold text-nowrap">
                                {player.membershipId || player._id.substring(0, 8).toUpperCase()}
                              </td>
                              <td className="px-6 py-3 font-semibold truncate" title={player.firstName}>
                                {player.firstName || 'N/A'}
                              </td>
                              <td className="px-6 py-3 font-semibold truncate" title={player.lastName}>
                                {player.lastName || 'N/A'}
                              </td>
                              <td className="px-6 py-3 font-semibold">{player.grade || 'N/A'}</td>
                              <td className="px-6 py-3 font-semibold truncate" title={player.team?.name}>
                                {player.team?.name || 'N/A'}
                              </td>
                              <td className="px-6 py-3 text-right">
                                <Link
                                  href={`/users/${player._id}`}
                                  className="inline-flex items-center justify-center w-[32px] h-[32px] rounded-full bg-[#083F92]/10 hover:bg-[#083F92]/20 text-[#083F92] transition-colors"
                                  title="View player"
                                >
                                  <Eye className="w-4 h-4" />
                                </Link>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-[#787878] font-poppins bg-white">
                            No players are assigned to this school yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {playersTotalPages > 1 && (
                    <Pagination
                      currentPage={playersPage}
                      totalPages={playersTotalPages}
                      onPageChange={setPlayersPage}
                      className="absolute right-[24px] bottom-[16px]"
                    />
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full py-20 text-center gap-4">
              <div className="w-[80px] h-[80px] bg-[#083F92]/10 rounded-full flex items-center justify-center text-[#083F92]">
                <MapPin className="w-8 h-8 opacity-50" />
              </div>
              <p className="text-[#181818]/60 font-poppins text-[16px]">School not found or could not be loaded.</p>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
