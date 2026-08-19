'use client';

import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, MapPin, Calendar, CheckCircle2 } from 'lucide-react';
import { PageTransition } from '@/components/animations/page-transition';
import { useSchoolDetails } from '@/features/schools/hooks/use-schools';
import { Skeleton } from '@/components/ui/skeleton';

export default function SchoolDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const { data, isLoading } = useSchoolDetails(id);
  // Extract school based on common API response formats
  const school = data?.data?.school || data?.data || data;

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
            <div className="flex flex-col gap-8 w-full max-w-4xl">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {/* Address Card */}
                <div className="flex flex-col gap-3 p-6 bg-[#083F92]/5 border border-[#083F92]/10 rounded-[16px] transition-all hover:bg-[#083F92]/10">
                  <div className="flex items-center gap-3 text-[#083F92] mb-1">
                    <MapPin className="w-6 h-6" />
                    <h3 className="font-poppins font-semibold text-[18px]">Location Address</h3>
                  </div>
                  <p className="font-poppins text-[15px] text-[#181818]/80 leading-relaxed pl-9">
                    {school.address || 'No address provided'}
                  </p>
                </div>

                {/* Status Card */}
                <div className="flex flex-col gap-3 p-6 bg-[#083F92]/5 border border-[#083F92]/10 rounded-[16px] transition-all hover:bg-[#083F92]/10">
                  <div className="flex items-center gap-3 text-[#083F92] mb-1">
                    <CheckCircle2 className="w-6 h-6" />
                    <h3 className="font-poppins font-semibold text-[18px]">Status Overview</h3>
                  </div>
                  <div className="font-poppins text-[15px] text-[#181818]/80 leading-relaxed pl-9 flex flex-col gap-1">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span> Active Registration
                    </span>
                    <span className="text-[#181818]/50 text-[13px] mt-1">
                      Last updated: {school.updatedAt ? new Date(school.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                    </span>
                  </div>
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
