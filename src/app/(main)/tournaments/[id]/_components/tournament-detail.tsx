'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGetTournament } from '@/features/tournaments/hooks/use-get-tournament';
import { useGetTournamentParticipants } from '@/features/tournaments/hooks/use-get-tournament-participants';
import { WinTdExportCard } from '@/features/results/components/wintd-export-card';
import { useDeleteTournament } from '@/features/tournaments/hooks/use-delete-tournament';
import { tournamentService } from '@/features/tournaments/services/tournament.service';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChevronLeft,
  Edit3,
  Trash2,
  MapPin,
  DollarSign,
  Calendar,
  GitMerge,
  Hash,
  FileSpreadsheet
} from 'lucide-react';
import Link from 'next/link';
import { PageTransition } from '@/components/animations/page-transition';
import { Pagination } from '@/components/ui/pagination';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';

export default function TournamentDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportDivisionId, setExportDivisionId] = useState<string>('all');

  const { data: response, isLoading } = useGetTournament(id);
  const { data: participantsResponse, isLoading: isParticipantsLoading } = useGetTournamentParticipants(id, currentPage, 10);
  const { mutate: deleteTournament, isPending: isDeleting } = useDeleteTournament();
  const tournament = response?.data?.tournament;

  const tournamentTitle = tournament?.title || "Tournament";

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      toast.info('Starting export...');
      const divisionParam = exportDivisionId === 'all' ? undefined : exportDivisionId;
      const blob = await tournamentService.exportTournamentParticipants(id, divisionParam);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const divisionPrefix = exportDivisionId !== 'all' && tournament?.divisions?.find((d: any) => d._id === exportDivisionId)
        ? `${getDivisionLabel(tournament.divisions.find((d: any) => d._id === exportDivisionId))}_`
        : '';
        
      link.setAttribute('download', `${tournamentTitle.replace(/\s+/g, '_')}_${divisionPrefix}participants.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Export completed successfully!');
      setShowExportDialog(false);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export participants.');
    } finally {
      setIsExporting(false);
    }
  };

  const getDivisionLabel = (d: any) => {
    if (d.type === 'conditional') {
      return `${d.divisionName}${(d.condition === 'over' || d.condition === 'above') ? 'o' : 'u'}${d.rating}`;
    }
    return 'Open';
  };

  const divisions = tournament?.divisions?.length > 0 
    ? tournament.divisions.map((d: any) => getDivisionLabel(d)).join(', ')
    : 'N/A';
  
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC'
    });
  };

  const tournamentDetails = {
    location: tournament?.location || "N/A",
    entryFee: tournament?.isPaid ? `$${tournament?.entryFee}` : 'Free',
    date: formatDate(tournament?.date),
    division: divisions,

  };

  if (isLoading) {
    return (
      <div className="w-full h-full p-6 flex flex-col gap-6">
        <Skeleton className="w-[100px] h-6" />
        <Skeleton className="w-1/3 h-8" />
        <Skeleton className="w-full h-[500px] rounded-[24px]" />
      </div>
    );
  }

  const registeredPlayers = participantsResponse?.data?.participants || [];
  const totalItems = participantsResponse?.pagination?.totalItems || 0;
  const totalPages = participantsResponse?.pagination?.totalPages || 1;

  return (
    <PageTransition>
      <div className="flex flex-col gap-6 w-full h-full font-sans select-none pb-12">

        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
          {/* Back button and title */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-[#083F92] hover:opacity-80 transition-opacity focus:outline-none w-fit"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
              <span className="font-poppins font-medium text-[18px] leading-[27px]">Back</span>
            </button>
            <h1 className="font-poppins font-bold text-[24px] leading-[36px] text-[#083F92] m-0 break-words max-w-[calc(100vw-150px)] md:max-w-[500px]">
              {tournamentTitle}
            </h1>
          </div>

          {/* Right Action buttons: Edit & Delete */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Edit Button */}
            <button
              onClick={() => router.push(`/tournaments/${id}/edit`)}
              className="flex items-center gap-2.5 px-[15px] py-[15px] bg-[#083F92]/10 hover:bg-[#083F92]/15 text-[#000000] rounded-[100px] transition-colors focus:outline-none h-[72px] shadow-sm w-[105px] justify-center"
            >
              <div className="w-[42px] h-[42px] bg-[#083F92] rounded-full flex items-center justify-center text-white relative shadow-md shrink-0">
                <Edit3 className="w-4 h-4" />
              </div>
              <span className="font-poppins font-medium text-[14px] leading-[20px] tracking-[-0.019em] pr-1">
                Edit
              </span>
            </button>

            {/* A tournament with anyone registered cannot be deleted — the API
                refuses it — so the button is not offered at all. */}
            {totalItems === 0 && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2.5 px-[15px] py-[15px] bg-[#083F92]/10 hover:bg-[#083F92]/15 text-[#000000] rounded-[100px] transition-colors focus:outline-none h-[72px] shadow-sm w-[124px] justify-center"
            >
              <div className="w-[42px] h-[42px] bg-[#083F92] rounded-full flex items-center justify-center text-white relative shadow-md shrink-0">
                <Trash2 className="w-4 h-4" />
              </div>
              <span className="font-poppins font-medium text-[14px] leading-[20px] tracking-[-0.019em] pr-1">
                Delete
              </span>
            </button>
            )}
          </div>
        </div>

        {/* Main Details Container Scrollable Wrapper */}
        <div className="w-full bg-white border border-[#DADADA] rounded-[24px] shadow-sm flex flex-col gap-6 p-6 overflow-hidden min-h-[700px]">

          {/* Tournament Details Section Card */}
          <div className="w-full bg-[#083F92]/10 rounded-[12px] p-6 flex flex-col gap-6">
            <h2 className="font-poppins font-bold text-[24px] leading-[36px] text-[#083F92] m-0 border-b border-[#083F92]/10 pb-2">
              Tournament details
            </h2>

            {/* Details Fields Table/Grid */}
            <div className="flex flex-col gap-4 max-w-[900px] w-full">
              {[
                { label: 'Location', value: tournamentDetails.location, icon: MapPin },
                { label: 'Entry fee', value: tournamentDetails.entryFee, icon: DollarSign },
                { label: 'Date of Tournament', value: tournamentDetails.date, icon: Calendar },
                { label: 'Division', value: tournamentDetails.division, icon: GitMerge },

              ].map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-start w-full gap-1 sm:gap-0 border-b border-[#083F92]/5 pb-2 sm:pb-0 sm:border-b-0">

                  {/* Left Label column with Icon */}
                  <div className="flex items-center gap-2.5 w-full sm:w-[280px] shrink-0">
                    <div className="w-[32px] h-[32px] bg-[#083F92] text-white rounded-full flex items-center justify-center shrink-0">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <span className="font-poppins font-medium text-[16px] sm:text-[20px] leading-[30px] text-[#636363]">
                      {item.label}
                    </span>
                  </div>

                  {/* Colon Separator */}
                  <span className="hidden sm:inline font-sans font-medium text-[20px] leading-[27px] text-[#000000] w-[30px] shrink-0 text-center">
                    :
                  </span>

                  {/* Value column */}
                  <span className="font-poppins font-bold text-[16px] sm:text-[20px] leading-[30px] text-[#083F92] break-words min-w-0 flex-1 pl-11 sm:pl-0">
                    {item.value}
                  </span>

                </div>
              ))}
            </div>
          </div>

          {/* Registered Players Section Card */}
          <div className="w-full bg-[#083F92]/10 rounded-[12px] p-6 flex flex-col gap-6 relative">

            {/* Header titles + CSV action button */}
            {/* Handed to WinTD before the event is played. */}
            {tournament?.divisions?.length > 0 && !tournament?.resultsPublishedAt ? (
              <WinTdExportCard
                tournamentId={id}
                divisions={tournament.divisions}
              />
            ) : null}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full border-b border-[#083F92]/10 pb-2 gap-4">
              <h2 className="font-poppins font-bold text-[24px] leading-[36px] text-[#083F92] m-0">
                Registered Players ({totalItems})
              </h2>

              {/* Nothing to export with nobody registered, so the button says
                  so rather than producing an empty file. */}
              <button 
                onClick={() => {
                  setExportDivisionId('all');
                  setShowExportDialog(true);
                }}
                disabled={totalItems === 0}
                title={totalItems === 0 ? 'No participants to export' : undefined}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#083F92]/10 hover:bg-[#083F92]/15 text-[#000000] rounded-[100px] transition-colors focus:outline-none h-[42px] shrink-0 shadow-sm w-full sm:w-auto justify-center cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#083F92]/10"
              >
                <div className="w-[32px] h-[32px] bg-[#083F92] rounded-full flex items-center justify-center text-white relative shadow-md">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <span className="font-poppins font-medium text-[12px] leading-[20px] tracking-[-0.019em] pr-1 pl-1">
                  Export As CSV
                </span>
              </button>
            </div>

            {/* Inner Sub-Table White Card Container */}
            <div className="w-full bg-white border border-[#DADADA] rounded-[24px] shadow-sm flex flex-col justify-between overflow-hidden relative min-h-[400px] pb-20">

              {/* Scrollable Table Area */}
              <div className="overflow-x-auto w-full">
                <table className="w-full border-collapse min-w-[800px]">

                  {/* Table Header */}
                  <thead>
                    <tr className="bg-[#083F92] text-white text-left h-[50px] font-poppins font-semibold text-[13px]">
                      <th className="px-6 py-3 font-semibold w-[120px]">User ID</th>
                      <th className="px-6 py-3 font-semibold w-[120px]">Name</th>
                      <th className="px-6 py-3 font-semibold w-[80px]">Grade</th>
                      <th className="px-6 py-3 font-semibold w-[150px]">Selected Division</th>
                      <th className="px-6 py-3 font-semibold w-[70px]">Rating</th>
                      <th className="px-6 py-3 font-semibold text-right w-[126px]">Action</th>
                    </tr>
                  </thead>

                  {/* Table Body */}
                  <tbody>
                    {isParticipantsLoading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-[#636363]">
                          Loading participants...
                        </td>
                      </tr>
                    ) : registeredPlayers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-[#636363]">
                          No participants found.
                        </td>
                      </tr>
                    ) : (
                      registeredPlayers.map((player: any, index: number) => {
                        const isEven = index % 2 !== 0;
                        const userId = player.user?._id;
                        return (
                          <tr
                            key={player._id}
                            className={`h-[50px] border-b border-[#DADADA]/30 font-poppins text-[13px] text-[#636363] ${isEven ? 'bg-[#083F92]/10' : 'bg-white'
                              }`}
                          >
                            <td className="px-6 py-3 font-semibold">{player.playerProfile?.membershipId || 'N/A'}</td>
                            <td className="px-6 py-3 font-semibold text-black">{player.user?.name || 'N/A'}</td>
                            <td className="px-6 py-3 font-semibold text-black">{player.playerProfile?.grade || 'N/A'}</td>
                            <td className="px-6 py-3 font-semibold text-[#083F92]">{player.division?.label || 'N/A'}</td>
                            <td className="px-6 py-3 font-semibold text-black">{player.playerProfile?.rating || '0'}</td>
                            <td className="px-6 py-3 text-right">
                              {userId ? (
                                <Link
                                  href={`/users/${userId}`}
                                  className="font-semibold underline text-black hover:opacity-80 transition-opacity tracking-[-0.02em]"
                                >
                                  View Profile
                                </Link>
                              ) : (
                                <span className="text-[#919191]">N/A</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
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

        </div>

      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Tournament"
        description="Are you sure you want to delete this tournament? This action cannot be undone."
        isLoading={isDeleting}
        onConfirm={() => {
          deleteTournament(id, {
            onSuccess: () => {
              router.push('/tournaments');
            }
          });
        }}
      />

      {/* Export CSV Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent
          showCloseButton={false}
          className="bg-white rounded-[24px] p-8 w-[90vw] sm:w-full max-w-[400px] border-none shadow-2xl"
        >
          <DialogTitle className="font-poppins font-semibold text-[24px] text-[#083F92] mb-2">
            Export Participants
          </DialogTitle>
          <p className="font-poppins text-[14px] text-[#636363] mb-6">Select a division to filter exports, or export all.</p>
          
          <div className="flex flex-col gap-2 mb-8">
            <label className="font-poppins font-medium text-[14px] text-[#181818]">Division</label>
            <Select
              value={exportDivisionId}
              onValueChange={(val) => setExportDivisionId(val || 'all')}
            >
              <SelectTrigger className="h-[48px]! w-full px-4 rounded-full border-[#DADADA] font-poppins text-[14px] text-[#181818] focus:ring-[#083F92] focus:border-[#083F92] shadow-none outline-none">
                <SelectValue placeholder="Select Division">
                  {exportDivisionId === 'all' 
                    ? 'All Divisions' 
                    : getDivisionLabel(tournament?.divisions?.find((d: any) => d._id === exportDivisionId) || {})}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-white rounded-[12px] border-[#DADADA] font-poppins">
                <SelectItem value="all" className="cursor-pointer hover:bg-[#083F92]/5 hover:text-[#083F92] rounded-[8px] mx-1 my-1">
                  All Divisions
                </SelectItem>
                {tournament?.divisions?.map((d: any) => (
                  <SelectItem key={d._id} value={d._id} className="cursor-pointer hover:bg-[#083F92]/5 hover:text-[#083F92] rounded-[8px] mx-1 my-1 mb-0 last:mb-1">
                    {getDivisionLabel(d)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4 w-full">
            <button
              onClick={() => setShowExportDialog(false)}
              className="flex-1 h-[48px] rounded-[100px] font-poppins font-semibold text-[14px] text-[#181818] bg-[#F6F6F6] hover:bg-[#EAEAEA] transition-colors cursor-pointer"
              disabled={isExporting}
            >
              Cancel
            </button>
            <button
              onClick={handleExportCSV}
              disabled={isExporting}
              className="flex-1 h-[48px] rounded-[100px] font-poppins font-semibold text-[14px] text-white bg-[#083F92] hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? 'Exporting...' : 'Export'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}

