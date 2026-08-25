'use client';

import { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  ChevronUp, 
  ChevronDown, 
  Check,
  ChevronsUpDown
} from 'lucide-react';
import { SearchInput } from '@/components/ui/search-input';
import Link from 'next/link';
import { Pagination } from '@/components/ui/pagination';
import { PageTransition } from '@/components/animations/page-transition';
import { useDebounce } from '@/hooks/use-debounce';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/lib/toast';
import { useMemberships, useExportMemberships } from '@/features/memberships/hooks/use-memberships';
import { useSendIndividualNotification } from '@/features/notifications/hooks/use-send-notification';
import { Skeleton } from '@/components/ui/skeleton';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const notificationSchema = z.object({
  message: z.string().min(4, "Notification text must be at least 4 characters").max(200, "Notification text must not exceed 200 characters"),
});
type NotificationFormData = z.infer<typeof notificationSchema>;

interface Member {
  userId: string;
  name: string;
  purchaseDate: string;
  status: {
    type: 'active' | 'warning' | 'expired';
    text: string;
    daysLeft?: number;
  };
  lastActive: string;
  lastActiveDays: number; // For sorting
}

export default function Membership() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<'status' | 'lastActive' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const itemsPerPage = 10;
  const { data: membershipsData, isLoading } = useMemberships(currentPage, itemsPerPage, debouncedSearchQuery);
  const members = membershipsData?.data || [];
  const totalPages = membershipsData?.pagination?.totalPages || 1;

  const { mutateAsync: exportMemberships, isPending: isExporting } = useExportMemberships();

  const handleExport = async () => {
    try {
      const blob = await exportMemberships();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `memberships_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Memberships exported successfully');
    } catch (error) {
      toast.error('Failed to export memberships');
    }
  };

  const { mutateAsync: sendIndividualNotification, isPending: isSendingNotification } = useSendIndividualNotification();

  // Send Notification modal state
  const [notifyingMember, setNotifyingMember] = useState<any>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: { message: '' },
  });

  const messageValue = watch('message');

  const onNotifySubmit = async (data: NotificationFormData) => {
    try {
      await sendIndividualNotification({
        userId: notifyingMember.userId,
        email: "", // Not provided in membership API, backend should handle via userId
        message: data.message.trim()
      });
      setNotifyingMember(null);
      reset({ message: '' });
    } catch (e) {
      // error handled in hook
    }
  };

  // Sorting
  const sortedMembers = useMemo(() => {
    if (!sortField) return members;

    return [...members].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'status') {
        comparison = (a.status || '').localeCompare(b.status || '');
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [members, sortField, sortDirection]);

  // Use sortedMembers for display directly
  const displayedMembers = sortedMembers;

  const handleSort = (field: 'status' | 'lastActive') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <PageTransition>
      <div className="flex flex-col gap-6 w-full h-full font-sans select-none pb-12">
        
        {/* Top Header & Export Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
          
          {/* Left Title + Search pill bar */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 w-full sm:max-w-[700px]">
            <div className="flex flex-col shrink-0">
              <h1 className="font-poppins font-bold sm:text-[42px] text-[28px] sm:leading-[63px] leading-[36px] text-[#083F92] m-0">
                Membership
              </h1>
              <p className="font-poppins font-medium text-[12px] leading-[18px] text-[#787878] m-0">
                Every Membership will Expire on 31st August
              </p>
            </div>
            
            {/* Search Pill Input */}
            <div className="w-full sm:w-auto">
              <SearchInput 
                value={searchQuery} 
                onChangeValue={(val) => {
                  setSearchQuery(val);
                  setCurrentPage(1);
                }} 
                disabled={isLoading}
                containerClassName={isLoading ? 'opacity-50 pointer-events-none' : ''}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            {/* Export CSV Button */}
            <button 
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 px-[15px] py-[15px] bg-[#083F92]/10 hover:bg-[#083F92]/15 text-[#000000] rounded-[100px] transition-colors focus:outline-none h-[72px] shadow-sm w-full md:w-[174px] justify-center shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-[42px] h-[42px] bg-[#083F92] rounded-full flex items-center justify-center text-white relative shadow-md shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <span className="font-poppins font-medium text-[14px] leading-[20px] tracking-[-0.019em]">
                {isExporting ? 'Exporting...' : 'Export As CSV'}
              </span>
            </button>
          </div>
        </div>

        {/* Table Main Container */}
        <div className="w-full bg-white border border-[#DADADA] rounded-[24px] shadow-sm flex flex-col overflow-hidden">
          
          {/* Scrollable Table Area */}
          <div className="overflow-x-auto w-full">
            <table className="w-full border-collapse">
              
              {/* Table Header */}
              <thead>
                <tr className="bg-[#083F92] text-white text-left h-[50px] font-poppins font-semibold text-[13px]">
                  <th className="px-6 py-3 font-semibold w-[120px]">UserId</th>
                  <th className="px-6 py-3 font-semibold w-[200px]">Member Name</th>
                  <th className="px-6 py-3 font-semibold w-[180px]">Purchase Date</th>
                  
                  {/* Membership Status Heading with Sorting */}
                  <th className="px-6 py-3 font-semibold w-[200px]">
                    <div 
                      onClick={() => handleSort('status')}
                      className="flex items-center gap-1.5 cursor-pointer hover:opacity-85"
                    >
                      <span>Membership Status</span>
                      {sortField === 'status' ? (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronsUpDown className="w-4 h-4 text-white/50" />
                      )}
                    </div>
                  </th>

                  <th className="px-6 py-3 font-semibold text-right w-[150px]">Action</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="h-[68px] border-b border-[#EEEEEE] bg-white">
                      <td className="px-6 py-3"><Skeleton className="h-4 w-[100px]" /></td>
                      <td className="px-6 py-3"><Skeleton className="h-4 w-[150px]" /></td>
                      <td className="px-6 py-3"><Skeleton className="h-4 w-[120px]" /></td>
                      <td className="px-6 py-3"><Skeleton className="h-4 w-[100px]" /></td>
                      <td className="px-6 py-3"><Skeleton className="h-4 w-[100px] float-right" /></td>
                    </tr>
                  ))
                ) : displayedMembers.length > 0 ? (
                  displayedMembers.map((member: any, idx: number) => {
                    const isAltRow = idx % 2 === 1;
                    const isExpired = member.status === 'expired';
                    const displayStatus = member.status === 'active' ? '🟢 Active' : member.status === 'expired' ? '🔴 Expired' : `🟡 ${member.status}`;
                    const displayDate = member.purchaseDate ? new Date(member.purchaseDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : '';

                    return (
                      <tr 
                        key={member._id} 
                        className={`h-[68px] border-b border-[#EEEEEE] last:border-b-0 font-poppins font-semibold text-[13px] text-[#636363] transition-colors ${
                          isAltRow ? 'bg-[#F4F4F4]' : 'bg-white'
                        }`}
                      >
                        <td className="px-6 py-3 font-semibold select-text">{member.membershipId}</td>
                        <td className="px-6 py-3 font-bold text-[#636363] select-text">{member.name}</td>
                        <td className="px-6 py-3 font-semibold text-[#636363] select-text">{displayDate}</td>
                        <td className="px-6 py-3 font-semibold select-text">{displayStatus}</td>
                        
                        <td className="px-6 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link 
                              // A membership belongs to a player, and the
                              // profile page is keyed on the player.
                              href={`/users/${member.playerProfileId}`}
                              className="font-semibold tracking-[-0.02em] underline text-[#636363] hover:text-[#083F92] transition-colors"
                            >
                              View Profile
                            </Link>
                            <span className="text-[#636363]">|</span>
                            {isExpired ? (
                              <div className="w-[24px] h-[24px] rounded-full bg-[#083F92] flex items-center justify-center text-white shrink-0 ml-1 shadow-sm">
                                <Check className="w-3.5 h-3.5" />
                              </div>
                            ) : (
                              <button 
                                onClick={() => {
                                  setNotifyingMember(member);
                                  reset({ message: '' });
                                }}
                                className="font-semibold tracking-[-0.02em] underline text-[#636363] hover:text-[#083F92] transition-colors"
                              >
                                Notify
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[#787878] font-poppins">
                      No membership records found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
          </div>

        </div>

        {/* Pagination Row */}
        {totalPages > 1 && (
          <div className="flex justify-end items-center w-full mt-4">
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {/* Send Notification Dialog */}
        <Dialog open={!!notifyingMember} onOpenChange={(open) => !open && setNotifyingMember(null)}>
          <DialogContent 
            showCloseButton={true}
            className="sm:max-w-[589px] w-[90vw] h-auto min-h-[311px] bg-white rounded-[12px] p-6 sm:p-8 gap-0 border border-[#DADADA]/40 shadow-2xl outline-none"
          >
            <DialogTitle className="font-general-sans font-semibold text-[32px] leading-[43px] text-[#181818] m-0 mb-6">
              Send Notification
            </DialogTitle>
            
            <form onSubmit={handleSubmit(onNotifySubmit)} className="flex flex-col gap-[22px] w-full">
              <div className="flex flex-col gap-[8px] w-full">
                <div className="flex justify-between items-center w-full">
                  <label className="font-general-sans font-medium text-[14px] leading-[19px] text-[#181818] capitalize">
                    Notification Text <span className="text-red-500">*</span>
                  </label>
                  <span className="font-general-sans text-[12px] text-[#808080]">
                    {(messageValue || '').length}/200
                  </span>
                </div>
                <textarea
                  placeholder="Write text here"
                  maxLength={200}
                  className={`w-full h-[90px] bg-white border ${errors.message ? 'border-red-500' : 'border-[#3D3775]'} rounded-[12px] p-4 font-general-sans font-normal text-[14px] leading-[19px] text-[#181818] placeholder:text-[#808080] outline-none resize-none focus:ring-1 ${errors.message ? 'focus:ring-red-500' : 'focus:ring-[#3D3775]'}`}
                  {...register('message')}
                />
                {errors.message && (
                  <p className="text-red-500 text-[12px] mt-[-4px]">{errors.message.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSendingNotification}
                className="w-full h-[48px] bg-[#083F92] hover:bg-[#083F92]/90 rounded-[100px] flex items-center justify-center cursor-pointer transition-colors shadow-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="font-general-sans font-semibold text-[14px] leading-[19px] text-white text-center capitalize">
                  {isSendingNotification ? 'Sending...' : 'Send'}
                </span>
              </button>
            </form>
          </DialogContent>
        </Dialog>

      </div>
    </PageTransition>
  );
}
