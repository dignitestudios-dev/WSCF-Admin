'use client';

import { useState, useMemo, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Search,
  Calendar, 
  MapPin, 
  ArrowRight, 
  Upload, 
  X, 
  Check, 
  Loader2,
  Crown,
  DollarSign,
  Users,
  Shield,
  User,
  ArrowLeft
} from 'lucide-react';
import { SearchInput } from '@/components/ui/search-input';
import { PageTransition } from '@/components/animations/page-transition';
import { toast } from 'sonner';

interface Tournament {
  id: string;
  title: string;
  location: string;
  date: string;
  status: 'ready' | 'uploaded';
}

const getTournamentDetails = (tournament: Tournament) => {
  switch (tournament.id) {
    case '1':
      return {
        entryFee: '$40',
        division: 'U-10, U-14, U18, U20',
        host: 'James',
        director: 'Alex',
        idString: '00000'
      };
    case '2':
      return {
        entryFee: '$50',
        division: 'Open, Under 1800, Under 1400',
        host: 'Robert',
        director: 'Emily',
        idString: '00001'
      };
    case '3':
      return {
        entryFee: '$35',
        division: 'U-8, U-12, U-16',
        host: 'Michael',
        director: 'Sarah',
        idString: '00002'
      };
    case '4':
      return {
        entryFee: '$25',
        division: 'Open Blitz',
        host: 'William',
        director: 'Jessica',
        idString: '00003'
      };
    case '5':
      return {
        entryFee: '$45',
        division: 'Open, Under 2000, Under 1600',
        host: 'David',
        director: 'Daniel',
        idString: '00004'
      };
    default:
      return {
        entryFee: '$30',
        division: 'Open',
        host: 'Admin',
        director: 'Staff',
        idString: '00000'
      };
  }
};

export default function ResultUploader() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Record<number, { name: string; size: string } | null>>({
    0: null,
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
  });
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const [tournaments, setTournaments] = useState<Tournament[]>([
    { 
      id: '1', 
      title: 'USCF-Rated Scholastic May Summer Tournament', 
      location: 'Old Guard Games', 
      date: 'June 20, 2026', 
      status: 'ready' 
    },
    { 
      id: '2', 
      title: 'Milwaukee Knights Club Championship', 
      location: 'Old Guard Games', 
      date: 'June 22, 2026', 
      status: 'ready' 
    },
    { 
      id: '3', 
      title: 'USCF-Rated Scholastic April Summer Tournament', 
      location: 'Old Guard Games', 
      date: 'April 18, 2026', 
      status: 'uploaded' 
    },
    { 
      id: '4', 
      title: 'Old Guard Games Anniversary Blitz', 
      location: 'Old Guard Games', 
      date: 'May 24, 2026', 
      status: 'ready' 
    },
    { 
      id: '5', 
      title: 'Spring Open Chess Championship', 
      location: 'Old Guard Games', 
      date: 'May 10, 2026', 
      status: 'uploaded' 
    }
  ]);

  // Pre-populate files if the tournament is already uploaded
  useEffect(() => {
    if (selectedTournament) {
      if (selectedTournament.status === 'uploaded') {
        setUploadedFiles({
          0: { name: 'section_u10_results.pdf', size: '1.24 MB' },
          1: { name: 'section_u14_results.pdf', size: '1.45 MB' },
          2: { name: 'section_u18_results.pdf', size: '1.12 MB' },
          3: { name: 'section_u20_results.pdf', size: '1.30 MB' },
          4: null,
          5: null,
        });
      } else {
        setUploadedFiles({
          0: null,
          1: null,
          2: null,
          3: null,
          4: null,
          5: null,
        });
      }
    }
  }, [selectedTournament]);

  // Filter list
  const filteredTournaments = useMemo(() => {
    return tournaments.filter(t => 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.date.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tournaments, searchQuery]);

  // Handle file uploader slot change
  const handleSlotFileChange = (slotIndex: number, file: File) => {
    setUploadingSlot(slotIndex);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setUploadedFiles((prevFiles) => ({
              ...prevFiles,
              [slotIndex]: {
                name: file.name,
                size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
              },
            }));
            setUploadingSlot(null);
            
            // Mark tournament as uploaded in the listing
            setTournaments((prevTournaments) =>
              prevTournaments.map((t) =>
                t.id === selectedTournament?.id ? { ...t, status: 'uploaded' } : t
              )
            );
            toast.success(`Document uploaded successfully in slot ${slotIndex + 1}!`);
          }, 400);
          return 100;
        }
        return prev + 20;
      });
    }, 100);
  };

  const handleRemoveFile = (slotIndex: number) => {
    setUploadedFiles((prevFiles) => {
      const updated = { ...prevFiles, [slotIndex]: null };
      
      // If all files are null, we revert the tournament status to 'ready'
      const hasAnyFile = Object.values(updated).some((f) => f !== null);
      if (!hasAnyFile && selectedTournament) {
        setTournaments((prevTournaments) =>
          prevTournaments.map((t) =>
            t.id === selectedTournament.id ? { ...t, status: 'ready' } : t
          )
        );
      }
      return updated;
    });
    toast.info(`Document removed from slot ${slotIndex + 1}.`);
  };

  const handleExportCSV = () => {
    const headers = 'ID,Tournament Title,Location,Date,Status\n';
    const rows = tournaments.map(t => `${t.id},"${t.title.replace(/"/g, '""')}","${t.location}",${t.date},${t.status}`).join('\n');
    const csvContent = 'data:text/csv;charset=utf-8,' + headers + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'tournaments_upload_status.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Detailed view of selected tournament result uploader page
  if (selectedTournament) {
    const details = getTournamentDetails(selectedTournament);
    return (
      <PageTransition>
        <div className="flex flex-col gap-6 w-full h-full font-sans select-none pb-12">
          {/* Back Button */}
          <div className="flex items-center">
            <button 
              onClick={() => setSelectedTournament(null)}
              className="flex items-center gap-2 font-poppins font-semibold text-[18px] text-[#083F92] hover:opacity-80 transition-opacity bg-transparent border-none p-0 cursor-pointer outline-none"
            >
              <ArrowLeft className="w-[15px] h-[27px] text-[#083F92]" />
              <span>Back</span>
            </button>
          </div>

          {/* Tournament Header Title */}
          <h1 className="font-poppins font-bold text-[24px] md:text-[28px] leading-[36px] text-[#083F92] m-0">
            {selectedTournament.title}
          </h1>

          {/* White Card Wrapper (bg: #FFFFFF, rounded: 24px) */}
          <div className="w-full bg-white rounded-[24px] p-6 md:p-8 flex flex-col gap-6 border border-[#DADADA]/30 shadow-[0px_4px_12px_rgba(8,63,146,0.05)]">
            
            {/* Tournament Details Section Card */}
            <div className="flex flex-col gap-6 relative">
              <h2 className="font-poppins font-bold text-[24px] leading-[36px] text-[#083F92] m-0">
                Tournament details
              </h2>

              {/* Light blue border-box matching spec: bg rgba(8,63,146,0.1), rounded 12px */}
              <div className="w-full bg-[#083F92]/10 rounded-[12px] p-6 flex flex-col gap-4">
                {/* Location row */}
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#083F92] flex items-center justify-center text-white shrink-0">
                      <MapPin className="w-[16px] h-[16px]" />
                    </div>
                    <span className="font-poppins font-medium text-[16px] md:text-[20px] leading-[30px] text-[#636363] truncate">
                      Location
                    </span>
                  </div>
                  <span className="font-general-sans font-medium text-[20px] leading-[27px] text-black">:</span>
                  <span className="font-poppins font-bold text-[16px] md:text-[20px] leading-[30px] text-[#083F92]">
                    {selectedTournament.location}
                  </span>
                </div>

                {/* Entry fee row */}
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#083F92] flex items-center justify-center text-white shrink-0">
                      <DollarSign className="w-[16px] h-[16px]" />
                    </div>
                    <span className="font-poppins font-medium text-[16px] md:text-[20px] leading-[30px] text-[#636363] truncate">
                      Entry fee
                    </span>
                  </div>
                  <span className="font-general-sans font-medium text-[20px] leading-[27px] text-black">:</span>
                  <span className="font-poppins font-bold text-[16px] md:text-[20px] leading-[30px] text-[#083F92]">
                    {details.entryFee}
                  </span>
                </div>

                {/* Date of Tournament row */}
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#083F92] flex items-center justify-center text-white shrink-0">
                      <Calendar className="w-[16px] h-[16px]" />
                    </div>
                    <span className="font-poppins font-medium text-[16px] md:text-[20px] leading-[30px] text-[#636363] truncate">
                      Date of Tournament
                    </span>
                  </div>
                  <span className="font-general-sans font-medium text-[20px] leading-[27px] text-black">:</span>
                  <span className="font-poppins font-bold text-[16px] md:text-[20px] leading-[30px] text-[#083F92]">
                    {selectedTournament.date}
                  </span>
                </div>

                {/* Division row */}
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#083F92] flex items-center justify-center text-white shrink-0">
                      <Users className="w-[16px] h-[16px]" />
                    </div>
                    <span className="font-poppins font-medium text-[16px] md:text-[20px] leading-[30px] text-[#636363] truncate">
                      Division
                    </span>
                  </div>
                  <span className="font-general-sans font-medium text-[20px] leading-[27px] text-black">:</span>
                  <span className="font-poppins font-bold text-[16px] md:text-[20px] leading-[30px] text-[#083F92]">
                    {details.division}
                  </span>
                </div>

                {/* Tournament Id row */}
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#083F92] flex items-center justify-center text-white shrink-0">
                      <Shield className="w-[16px] h-[16px]" />
                    </div>
                    <span className="font-poppins font-medium text-[16px] md:text-[20px] leading-[30px] text-[#636363] truncate">
                      Tournament Id
                    </span>
                  </div>
                  <span className="font-general-sans font-medium text-[20px] leading-[27px] text-black">:</span>
                  <span className="font-poppins font-bold text-[16px] md:text-[20px] leading-[30px] text-[#083F92]">
                    {details.idString}
                  </span>
                </div>

                {/* Tournament Host row */}
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#083F92] flex items-center justify-center text-white shrink-0">
                      <User className="w-[16px] h-[16px]" />
                    </div>
                    <span className="font-poppins font-medium text-[16px] md:text-[20px] leading-[30px] text-[#636363] truncate">
                      Tournament Host
                    </span>
                  </div>
                  <span className="font-general-sans font-medium text-[20px] leading-[27px] text-black">:</span>
                  <span className="font-poppins font-bold text-[16px] md:text-[20px] leading-[30px] text-[#083F92]">
                    {details.host}
                  </span>
                </div>

                {/* Tournament Director row */}
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#083F92] flex items-center justify-center text-white shrink-0">
                      <User className="w-[16px] h-[16px]" />
                    </div>
                    <span className="font-poppins font-medium text-[16px] md:text-[20px] leading-[30px] text-[#636363] truncate">
                      Tournament Director
                    </span>
                  </div>
                  <span className="font-general-sans font-medium text-[20px] leading-[27px] text-black">:</span>
                  <span className="font-poppins font-bold text-[16px] md:text-[20px] leading-[30px] text-[#083F92]">
                    {details.director}
                  </span>
                </div>
              </div>
            </div>

            {/* Result Doc Section Card */}
            <div className="flex flex-col gap-6">
              <h2 className="font-poppins font-bold text-[24px] leading-[36px] text-[#083F92] m-0">
                Result Doc
              </h2>

              {/* Light blue border-box matching spec: bg rgba(8,63,146,0.1), rounded 12px */}
              <div className="w-full bg-[#083F92]/10 rounded-[12px] p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                  {[...Array(6)].map((_, idx) => {
                    const file = uploadedFiles[idx];
                    const isThisUploading = uploadingSlot === idx;

                    return (
                      <div 
                        key={idx}
                        className={`relative aspect-[140/122] rounded-[19.2px] border flex flex-col items-center justify-center p-3 text-center transition-all bg-white overflow-hidden group select-none ${
                          file 
                            ? 'border-green-500 shadow-sm' 
                            : isThisUploading
                            ? 'border-[#083F92]/40 bg-[#083F92]/5'
                            : 'border-[#C9C9C9] hover:border-[#083F92] hover:shadow-[0px_4px_12px_rgba(8,63,146,0.1)] cursor-pointer'
                        }`}
                      >
                        {/* Hidden File Input */}
                        {!file && !isThisUploading && (
                          <input 
                            type="file"
                            accept=".pdf,.csv,.xlsx,.txt"
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleSlotFileChange(idx, e.target.files[0]);
                              }
                            }}
                          />
                        )}

                        {isThisUploading ? (
                          /* Uploading State */
                          <div className="flex flex-col items-center justify-center gap-2 w-full h-full">
                            <Loader2 className="w-6 h-6 animate-spin text-[#083F92]" />
                            <span className="font-poppins font-semibold text-[11px] text-[#083F92]">
                              {uploadProgress}%
                            </span>
                            <div className="w-4/5 bg-[#EEEEEE] h-[4px] rounded-full overflow-hidden">
                              <div 
                                className="bg-[#083F92] h-full rounded-full transition-all duration-150"
                                style={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                          </div>
                        ) : file ? (
                          /* Uploaded State */
                          <div className="flex flex-col items-center justify-center gap-1.5 w-full h-full relative">
                            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center border border-green-200 text-green-600 shrink-0">
                              <Check className="w-[16px] h-[16px] stroke-[3]" />
                            </div>
                            <span className="font-poppins font-semibold text-[12px] text-green-700 truncate w-full px-1">
                              {file.name}
                            </span>
                            <span className="font-poppins font-light text-[10px] text-gray-500">
                              {file.size}
                            </span>
                            {/* Remove button */}
                            <button
                              onClick={() => handleRemoveFile(idx)}
                              className="absolute top-1 right-1 p-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-full transition-colors border border-red-100 z-20"
                              title="Remove document"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          /* Default Upload State */
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Upload className="w-6 h-6 text-[#A6A6A6] group-hover:text-[#083F92] group-hover:scale-110 transition-all duration-200" />
                            <div className="flex flex-col gap-0.5">
                              <span className="font-poppins font-medium text-[13px] text-[#083F92]">
                                Upload Doc
                              </span>
                              <span className="font-poppins font-normal text-[11px] text-[#636363]">
                                upto 20mb, PDF
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        </div>
      </PageTransition>
    );
  }

  // Listing View
  return (
    <PageTransition>
      <div className="flex flex-col gap-6 w-full h-full font-sans select-none pb-12">
        
        {/* Top Title & Action Button Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
          <div className="flex flex-col">
            <h1 className="font-poppins font-bold text-[42px] leading-[63px] text-[#083F92] m-0">
              Upload Result
            </h1>
          </div>

          <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
            {/* Search Input Box */}
            <SearchInput value={searchQuery} onChangeValue={setSearchQuery} />

            {/* Export CSV Button */}
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-[15px] py-[15px] bg-[#083F92]/10 hover:bg-[#083F92]/15 text-[#000000] rounded-[100px] transition-colors focus:outline-none h-[72px] shadow-sm w-[174px] justify-center shrink-0 border-none cursor-pointer"
            >
              <div className="w-[42px] h-[42px] bg-[#083F92] rounded-full flex items-center justify-center text-white relative shadow-md shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <span className="font-poppins font-medium text-[14px] leading-[20px] tracking-[-0.019em]">
                Export As CSV
              </span>
            </button>
          </div>
        </div>

        {/* Main List Container */}
        <div className="w-full bg-white border border-[#DADADA] rounded-[24px] shadow-sm p-6 flex flex-col gap-5 min-h-[500px]">
          {filteredTournaments.length > 0 ? (
            filteredTournaments.map((t) => {
              const isUploaded = t.status === 'uploaded';
              return (
                <div 
                  key={t.id} 
                  className="w-full bg-white border border-[#083F92] hover:border-[#083F92]/70 shadow-[0px_4px_12px_rgba(8,63,146,0.1)] hover:shadow-[0px_6px_16px_rgba(8,63_146,0.15)] rounded-[12px] p-5 flex flex-col gap-3 relative transition-all duration-200"
                >
                  {/* Top Row: Icon + Title + Status Badge */}
                  <div className="flex items-center justify-between gap-4 w-full">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Chess icon in a dark blue circle */}
                      <div className="w-[40px] h-[40px] bg-[#083F92] rounded-full flex items-center justify-center text-white shrink-0 shadow-sm">
                        <Crown className="w-5 h-5" />
                      </div>
                      <h2 className="font-poppins font-medium text-[18px] leading-[27px] text-[#151515] truncate">
                        {t.title}
                      </h2>
                    </div>

                    {/* Status Badge */}
                    {isUploaded ? (
                      <div className="flex items-center px-4 py-2 bg-[#083F92] text-white rounded-[8px] gap-2 font-medium text-[13px] leading-[18px] shadow-sm shrink-0">
                        <span>Completed</span>
                        <div className="w-[2px] h-[14px] bg-white/40 shrink-0" />
                        <span>Uploaded</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center px-4 py-2 bg-[#083F92] text-white rounded-[8px] font-medium text-[13px] leading-[18px] shadow-sm shrink-0">
                        Completed
                      </div>
                    )}
                  </div>

                  {/* Bottom Row: Location + Date + Action Anchor */}
                  <div className="flex items-center justify-between border-t border-[#EEEEEE] pt-3 mt-1 gap-4 flex-wrap sm:flex-nowrap">
                    <div className="flex items-center gap-6 text-[#151515]">
                      {/* Location details */}
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#083F92]" />
                        <span className="font-poppins font-normal text-[14px] leading-[21px]">
                          {t.location}
                        </span>
                      </div>
                      {/* Date details */}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#083F92]" />
                        <span className="font-poppins font-normal text-[14px] leading-[21px]">
                          {t.date}
                        </span>
                      </div>
                    </div>

                    {/* Action trigger */}
                    <button 
                      onClick={() => setSelectedTournament(t)}
                      className={`flex items-center gap-2 font-poppins font-semibold text-[13px] leading-[18px] transition-all group shrink-0 bg-transparent border-none cursor-pointer outline-none ${
                        isUploaded ? 'text-[#083F92] hover:opacity-80' : 'text-[#000000] hover:text-[#083F92]'
                      }`}
                    >
                      <span className="group-hover:underline">
                        {isUploaded ? 'File Uploaded' : 'Ready to upload result'}
                      </span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="w-full py-16 text-center text-[#787878] font-poppins flex flex-col items-center justify-center gap-3">
              <Search className="w-10 h-10 text-[#083F92]/20" />
              <span>No completed tournaments found matching "{searchQuery}"</span>
            </div>
          )}
        </div>

      </div>
    </PageTransition>
  );
}
