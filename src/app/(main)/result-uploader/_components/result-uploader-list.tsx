'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  ArrowRight,
  Calendar,
  Crown,
  MapPin,
  Search,
} from 'lucide-react';
import { SearchInput } from '@/components/ui/search-input';
import { PageTransition } from '@/components/animations/page-transition';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from '@/hooks/use-debounce';
import { useTournaments } from '@/features/tournaments/hooks/use-tournaments';

/**
 * The completed tournaments, and whether each already has results.
 *
 * Opening one goes to its own page rather than swapping this view out, so the
 * address bar names the tournament being worked on and the browser's back
 * button does what it looks like it does.
 */
export default function ResultUploaderList() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Results only go onto completed tournaments, so only those are listed.
  const { data: tournamentsData, isLoading } = useTournaments(
    1,
    100,
    debouncedSearchQuery,
    'completed'
  );

  const tournaments = tournamentsData?.data?.tournaments || [];

  return (
    <PageTransition>
      <div className="flex h-full w-full flex-col gap-6 font-sans select-none pb-12">
        <div className="flex w-full flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <h1 className="m-0 font-poppins text-[28px] font-bold leading-[36px] text-[#083F92] sm:text-[42px] sm:leading-[63px]">
            Upload Result
          </h1>

          <div className="w-full sm:w-auto">
            <SearchInput
              value={searchQuery}
              onChangeValue={setSearchQuery}
              placeholder="Search by tournament name"
            />
          </div>
        </div>

        <div className="flex min-h-[500px] w-full flex-col gap-5 rounded-[24px] border border-[#DADADA] bg-white p-6 shadow-sm">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-[118px] w-full rounded-[12px]" />
            ))
          ) : tournaments.length > 0 ? (
            tournaments.map((tournament: any) => {
              // Set the moment the results job finishes.
              const isUploaded = Boolean(tournament.resultsPublishedAt);

              return (
                <div
                  key={tournament._id}
                  className="relative flex w-full flex-col gap-3 rounded-[12px] border border-[#083F92] bg-white p-5 shadow-[0px_4px_12px_rgba(8,63,146,0.1)] transition-all duration-200 hover:border-[#083F92]/70"
                >
                  <div className="flex w-full flex-col justify-between gap-2 sm:flex-row sm:items-center sm:gap-4">
                    <div className="flex w-full min-w-0 items-center gap-3 sm:w-auto">
                      <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-[#083F92] text-white shadow-sm">
                        <Crown className="h-5 w-5" />
                      </div>
                      <h2 className="flex-1 truncate font-poppins text-[15px] font-medium leading-[22px] text-[#151515] sm:text-[18px] sm:leading-[27px]">
                        {tournament.title}
                      </h2>
                    </div>

                    {isUploaded ? (
                      <div className="flex shrink-0 items-center gap-2 self-start rounded-[8px] bg-[#083F92] px-4 py-2 text-[13px] font-medium leading-[18px] text-white shadow-sm sm:self-auto">
                        <span>Completed</span>
                        <div className="h-[14px] w-[2px] shrink-0 bg-white/40" />
                        <span>Uploaded</span>
                      </div>
                    ) : (
                      <div className="flex shrink-0 items-center justify-center self-start rounded-[8px] bg-[#083F92] px-4 py-2 text-[13px] font-medium leading-[18px] text-white shadow-sm sm:self-auto">
                        Completed
                      </div>
                    )}
                  </div>

                  <div className="mt-1 flex flex-wrap items-center justify-between gap-4 border-t border-[#EEEEEE] pt-3 sm:flex-nowrap">
                    <div className="flex flex-wrap items-center gap-4 text-[#151515] sm:flex-nowrap sm:gap-6">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[#083F92]" />
                        <span className="font-poppins text-[14px] font-normal leading-[21px]">
                          {tournament.location || '—'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-[#083F92]" />
                        <span className="font-poppins text-[14px] font-normal leading-[21px]">
                          {tournament.date
                            ? format(new Date(tournament.date), 'dd MMM yyyy')
                            : '—'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => router.push(`/result-uploader/${tournament._id}`)}
                      className={`group flex shrink-0 cursor-pointer items-center gap-2 border-none bg-transparent font-poppins text-[13px] font-semibold leading-[18px] outline-none transition-all ${
                        isUploaded
                          ? 'text-[#083F92] hover:opacity-80'
                          : 'text-[#000000] hover:text-[#083F92]'
                      }`}
                    >
                      <span className="group-hover:underline">
                        {isUploaded ? 'View result' : 'Ready to upload result'}
                      </span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex w-full flex-col items-center justify-center gap-3 py-16 text-center font-poppins text-[#787878]">
              <Search className="h-10 w-10 text-[#083F92]/20" />
              <span>
                {debouncedSearchQuery
                  ? `No completed tournaments found matching "${debouncedSearchQuery}"`
                  : 'No completed tournaments yet.'}
              </span>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
