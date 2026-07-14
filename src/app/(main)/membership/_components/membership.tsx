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
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<'status' | 'lastActive' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Send Notification modal state
  const [notifyingMember, setNotifyingMember] = useState<Member | null>(null);
  const [notificationText, setNotificationText] = useState('');

  const membersList: Member[] = [
    { userId: '00000001', name: 'Ethan Carter', purchaseDate: 'Jan-07-2026', status: { type: 'active', text: '🟢 120d Left', daysLeft: 120 }, lastActive: '2d ago', lastActiveDays: 2 },
    { userId: '00000002', name: 'Olivia Brown', purchaseDate: 'Jan-07-2026', status: { type: 'warning', text: '🟡 5d Left', daysLeft: 5 }, lastActive: '12d ago', lastActiveDays: 12 },
    { userId: '00000003', name: 'Lucas White', purchaseDate: 'Fab-07-2026', status: { type: 'active', text: '🟢 120d Left', daysLeft: 120 }, lastActive: '20d ago', lastActiveDays: 20 },
    { userId: '00000004', name: 'Sophia Green', purchaseDate: 'Fab-02-2026', status: { type: 'expired', text: '🔴 Expired', daysLeft: -1 }, lastActive: '20d ago', lastActiveDays: 20 },
    { userId: '00000005', name: 'Mason Johnson', purchaseDate: 'Fab-05-2026', status: { type: 'expired', text: '🔴 Expired', daysLeft: -1 }, lastActive: '2d ago', lastActiveDays: 2 },
    { userId: '00000006', name: 'Ava Martinez', purchaseDate: 'Mar-05-2026', status: { type: 'active', text: '🟢 40d Left', daysLeft: 40 }, lastActive: '2hr ago', lastActiveDays: 0.08 },
    { userId: '00000007', name: 'James Wilson', purchaseDate: 'Mar-08-2026', status: { type: 'active', text: '🟢 120d Left', daysLeft: 120 }, lastActive: '2hr ago', lastActiveDays: 0.08 },
    { userId: '00000008', name: 'Isabella Davis', purchaseDate: 'Apr-08-2026', status: { type: 'warning', text: '🟡 7d Left', daysLeft: 7 }, lastActive: '36min ago', lastActiveDays: 0.025 },
    { userId: '00000009', name: 'James Wilson', purchaseDate: 'Apr-08-2026', status: { type: 'warning', text: '🟡 7d Left', daysLeft: 7 }, lastActive: 'Active now', lastActiveDays: 0 },
    { userId: '00000010', name: 'Liam Smith', purchaseDate: 'Jun-15-2026', status: { type: 'warning', text: '🟡 15d Left', daysLeft: 15 }, lastActive: '5d ago', lastActiveDays: 5 },
    { userId: '00000011', name: 'Amelia Clark', purchaseDate: 'May-10-2026', status: { type: 'active', text: '🟢 30d Left', daysLeft: 30 }, lastActive: '1h ago', lastActiveDays: 0.04 },
    { userId: '00000012', name: 'Ella Johnson', purchaseDate: 'Jul-20-2026', status: { type: 'active', text: '🟢 50d Left', daysLeft: 50 }, lastActive: '3d ago', lastActiveDays: 3 },
    { userId: '00000013', name: 'Lucas Brown', purchaseDate: 'Aug-12-2026', status: { type: 'warning', text: '🟡 20d Left', daysLeft: 20 }, lastActive: '1d ago', lastActiveDays: 1 },
    { userId: '00000014', name: 'Sophia Wilson', purchaseDate: 'Sep-10-2026', status: { type: 'active', text: '🟢 25d Left', daysLeft: 25 }, lastActive: '2d ago', lastActiveDays: 2 },
  ];

  // Search filtering
  const filteredMembers = useMemo(() => {
    return membersList.filter(member => 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.userId.includes(searchQuery) ||
      member.purchaseDate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.status.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Sorting
  const sortedMembers = useMemo(() => {
    if (!sortField) return filteredMembers;

    return [...filteredMembers].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'status') {
        const daysA = a.status.daysLeft ?? 9999;
        const daysB = b.status.daysLeft ?? 9999;
        comparison = daysA - daysB;
      } else if (sortField === 'lastActive') {
        comparison = a.lastActiveDays - b.lastActiveDays;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredMembers, sortField, sortDirection]);

  // Pagination (5 members per page, total 3 pages for 14 members)
  const itemsPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(sortedMembers.length / itemsPerPage));
  
  // Adjust current page if search filters list to fewer items
  const activePage = Math.min(currentPage, totalPages);

  const displayedMembers = useMemo(() => {
    const startIdx = (activePage - 1) * itemsPerPage;
    return sortedMembers.slice(startIdx, startIdx + itemsPerPage);
  }, [sortedMembers, activePage, itemsPerPage]);

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
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            {/* Export CSV Button */}
            <button className="flex items-center gap-2 px-[15px] py-[15px] bg-[#083F92]/10 hover:bg-[#083F92]/15 text-[#000000] rounded-[100px] transition-colors focus:outline-none h-[72px] shadow-sm w-full md:w-[174px] justify-center shrink-0 cursor-pointer">
              <div className="w-[42px] h-[42px] bg-[#083F92] rounded-full flex items-center justify-center text-white relative shadow-md shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <span className="font-poppins font-medium text-[14px] leading-[20px] tracking-[-0.019em]">
                Export As CSV
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

                  {/* Last Active Heading with Sorting */}
                  <th className="px-6 py-3 font-semibold w-[150px]">
                    <div 
                      onClick={() => handleSort('lastActive')}
                      className="flex items-center gap-1.5 cursor-pointer hover:opacity-85 justify-center"
                    >
                      <span>Last Active</span>
                      {sortField === 'lastActive' ? (
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
                {displayedMembers.length > 0 ? (
                  displayedMembers.map((member, idx) => {
                    const isAltRow = idx % 2 === 1;
                    const isExpired = member.status.type === 'expired';

                    return (
                      <tr 
                        key={member.userId} 
                        className={`h-[68px] border-b border-[#EEEEEE] last:border-b-0 font-poppins font-semibold text-[13px] text-[#636363] transition-colors ${
                          isAltRow ? 'bg-[#F4F4F4]' : 'bg-white'
                        }`}
                      >
                        <td className="px-6 py-3 font-semibold select-text">{member.userId}</td>
                        <td className="px-6 py-3 font-bold text-[#636363] select-text">{member.name}</td>
                        <td className="px-6 py-3 font-semibold text-[#636363] select-text">{member.purchaseDate}</td>
                        <td className="px-6 py-3 font-semibold select-text">{member.status.text}</td>
                        <td className="px-6 py-3 font-semibold select-text text-center">{member.lastActive}</td>
                        
                        <td className="px-6 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link 
                              href={`/users/${parseInt(member.userId)}`}
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
                                  setNotificationText('');
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
                    <td colSpan={6} className="py-12 text-center text-[#787878] font-poppins">
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
              currentPage={activePage}
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
            
            <div className="flex flex-col gap-[22px] w-full">
              <div className="flex flex-col gap-[8px] w-full">
                <div className="flex justify-between items-center w-full">
                  <label className="font-general-sans font-medium text-[14px] leading-[19px] text-[#181818] capitalize">
                    Notification Text
                  </label>
                  <span className="font-general-sans text-[12px] text-[#808080]">
                    {notificationText.length}/200
                  </span>
                </div>
                <textarea
                  placeholder="Write heading here"
                  value={notificationText}
                  maxLength={200}
                  onChange={(e) => setNotificationText(e.target.value)}
                  className="w-full h-[90px] bg-white border border-[#3D3775] rounded-[12px] p-4 font-general-sans font-normal text-[14px] leading-[19px] text-[#181818] placeholder:text-[#808080] outline-none resize-none focus:ring-1 focus:ring-[#3D3775]"
                />
              </div>

              <button
                onClick={() => {
                  if (notificationText.trim().length < 4) {
                    toast.error("Notification text must be at least 4 characters");
                    return;
                  }
                  toast.success(`Notification sent to ${notifyingMember?.name || 'user'}`);
                  setNotifyingMember(null);
                }}
                className="w-full h-[48px] bg-[#083F92] hover:bg-[#083F92]/90 rounded-[100px] flex items-center justify-center cursor-pointer transition-colors shadow-sm focus:outline-none"
              >
                <span className="font-general-sans font-semibold text-[14px] leading-[19px] text-white text-center capitalize">
                  Send
                </span>
              </button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </PageTransition>
  );
}
