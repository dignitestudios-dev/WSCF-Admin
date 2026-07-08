'use client';

import { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Search,
  Calendar, 
  MapPin, 
  ArrowRight, 
  Upload, 
  X, 
  FileText, 
  Check, 
  Loader2,
  Trophy,
  Award,
  Crown
} from 'lucide-react';
import { SearchInput } from '@/components/ui/search-input';
import { PageTransition } from '@/components/animations/page-transition';

interface Tournament {
  id: string;
  title: string;
  location: string;
  date: string;
  status: 'ready' | 'uploaded';
}

interface Standing {
  rank: number;
  name: string;
  rating: number;
  score: number;
  record: string;
}

export default function ResultUploaderPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // For viewing already uploaded results
  const [viewingResultsTournament, setViewingResultsTournament] = useState<Tournament | null>(null);

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

  // Mock standings data for previewing uploaded results
  const mockStandings: Record<string, Standing[]> = {
    default: [
      { rank: 1, name: 'Ethan Carter', rating: 1650, score: 4.5, record: '4-0-1' },
      { rank: 2, name: 'Olivia Brown', rating: 1580, score: 4.0, record: '4-1-0' },
      { rank: 3, name: 'Ava Martinez', rating: 1420, score: 3.5, record: '3-1-1' },
      { rank: 4, name: 'Lucas White', rating: 1390, score: 3.0, record: '3-2-0' },
      { rank: 5, name: 'James Wilson', rating: 1510, score: 3.0, record: '2-1-2' },
      { rank: 6, name: 'Amelia Clark', rating: 1200, score: 2.5, record: '2-2-1' }
    ]
  };

  // Filter list
  const filteredTournaments = useMemo(() => {
    return tournaments.filter(t => 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.date.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tournaments, searchQuery]);

  // Handle file drop/change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Simulate file upload
  const startUpload = () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            setUploadSuccess(true);
            
            // Mark tournament as uploaded in list
            if (selectedTournament) {
              setTournaments(prevTournaments => 
                prevTournaments.map(t => 
                  t.id === selectedTournament.id ? { ...t, status: 'uploaded' } : t
                )
              );
            }
          }, 600);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const resetUploadState = () => {
    setSelectedTournament(null);
    setSelectedFile(null);
    setIsUploading(false);
    setUploadProgress(0);
    setUploadSuccess(false);
  };

  const handleExportCSV = () => {
    // Generate CSV data from tournaments list
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
              className="flex items-center gap-2 px-[15px] py-[15px] bg-[#083F92]/10 hover:bg-[#083F92]/15 text-[#000000] rounded-[100px] transition-colors focus:outline-none h-[72px] shadow-sm w-[174px] justify-center shrink-0"
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
                  className="w-full bg-white border border-[#083F92] hover:border-[#083F92]/70 shadow-[0px_4px_12px_rgba(8,63,146,0.1)] hover:shadow-[0px_6px_16px_rgba(8,63,146,0.15)] rounded-[12px] p-5 flex flex-col gap-3 relative transition-all duration-200"
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
                    {isUploaded ? (
                      <button 
                        onClick={() => setViewingResultsTournament(t)}
                        className="flex items-center gap-2 font-poppins font-semibold text-[13px] leading-[18px] text-[#083F92] hover:opacity-80 transition-all group shrink-0"
                      >
                        <span className="group-hover:underline">File Uploaded</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    ) : (
                      <button 
                        onClick={() => setSelectedTournament(t)}
                        className="flex items-center gap-2 font-poppins font-semibold text-[13px] leading-[18px] text-[#000000] hover:text-[#083F92] transition-all group shrink-0"
                      >
                        <span className="group-hover:underline">Ready to upload result</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    )}
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

        {/* glassmorphism upload modal */}
        {selectedTournament && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in">
            <div className="bg-white rounded-[24px] shadow-2xl border border-[#DADADA] w-full max-w-[550px] overflow-hidden flex flex-col transition-all duration-300 transform scale-100">
              
              {/* Modal Header */}
              <div className="bg-[#083F92] text-white p-6 flex justify-between items-start shrink-0">
                <div className="flex flex-col gap-1 pr-6">
                  <h3 className="font-poppins font-bold text-[18px] leading-[24px]">
                    Upload Tournament Results
                  </h3>
                  <p className="font-poppins font-light text-[12px] leading-[18px] text-white/80 line-clamp-1">
                    {selectedTournament.title}
                  </p>
                </div>
                <button 
                  onClick={resetUploadState}
                  className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-1.5 transition-colors shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 flex flex-col gap-5 flex-grow">
                {uploadSuccess ? (
                  // Success State
                  <div className="flex flex-col items-center justify-center py-8 gap-4 text-center animate-scale-up">
                    <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center border border-green-200 shadow-md shrink-0">
                      <Check className="w-8 h-8 stroke-[3]" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <h4 className="font-poppins font-bold text-[18px] text-green-700">Upload Successful!</h4>
                      <p className="font-poppins font-light text-[13px] text-[#636363] max-w-[320px]">
                        Results file <strong>{selectedFile?.name}</strong> has been uploaded and parsed.
                      </p>
                    </div>
                    <button 
                      onClick={resetUploadState}
                      className="mt-4 px-6 py-2.5 bg-[#083F92] hover:bg-[#083F92]/90 text-white rounded-[100px] font-poppins font-semibold text-[14px] shadow-sm transition-all"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  // Selection/Uploading State
                  <div className="flex flex-col gap-4">
                    {/* Drag-and-drop Area */}
                    <div className="border-2 border-dashed border-[#083F92]/30 hover:border-[#083F92]/60 bg-[#083F92]/5 hover:bg-[#083F92]/10 rounded-[16px] p-8 flex flex-col items-center justify-center gap-3 text-center relative cursor-pointer group transition-all">
                      <input 
                        type="file" 
                        accept=".csv,.xlsx,.txt"
                        onChange={handleFileChange}
                        disabled={isUploading}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <Upload className="w-10 h-10 text-[#083F92] group-hover:scale-105 transition-transform duration-200" />
                      <div className="flex flex-col">
                        <span className="font-poppins font-semibold text-[14px] text-[#151515]">
                          Drag & drop results file here
                        </span>
                        <span className="font-poppins font-light text-[12px] text-[#636363]">
                          Supports .csv, .xlsx, or .txt files
                        </span>
                      </div>
                    </div>

                    {/* Selected File Details */}
                    {selectedFile && (
                      <div className="flex items-center justify-between p-4 bg-[#F4F4F4] border border-[#DADADA]/60 rounded-[12px] animate-slide-up">
                        <div className="flex items-center gap-3">
                          <FileText className="w-8 h-8 text-[#083F92] shrink-0" />
                          <div className="flex flex-col max-w-[300px]">
                            <span className="font-poppins font-bold text-[13px] text-[#151515] truncate">
                              {selectedFile.name}
                            </span>
                            <span className="font-poppins font-light text-[11px] text-[#636363]">
                              {(selectedFile.size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                        </div>
                        {!isUploading && (
                          <button 
                            onClick={() => setSelectedFile(null)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-full transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}

                    {/* Progress Bar */}
                    {isUploading && (
                      <div className="flex flex-col gap-2 w-full mt-2">
                        <div className="flex justify-between items-center text-[12px] font-poppins font-semibold text-[#636363]">
                          <span className="flex items-center gap-1.5">
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#083F92]" />
                            Uploading & processing...
                          </span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-[#EEEEEE] h-[8px] rounded-full overflow-hidden">
                          <div 
                            className="bg-[#083F92] h-full rounded-full transition-all duration-150"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-3 mt-4 border-t pt-4">
                      <button 
                        onClick={resetUploadState}
                        disabled={isUploading}
                        className="px-5 py-2.5 border border-[#DADADA] hover:bg-black/5 rounded-[100px] font-poppins font-semibold text-[13px] text-[#636363] transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={startUpload}
                        disabled={!selectedFile || isUploading}
                        className="px-6 py-2.5 bg-[#083F92] hover:bg-[#083F92]/90 disabled:bg-[#083F92]/30 disabled:text-white/60 text-white rounded-[100px] font-poppins font-semibold text-[13px] transition-all shadow-sm"
                      >
                        Start Upload
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* View Results Modal */}
        {viewingResultsTournament && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in">
            <div className="bg-white rounded-[24px] shadow-2xl border border-[#DADADA] w-full max-w-[700px] overflow-hidden flex flex-col transition-all duration-300 transform scale-100 max-h-[85vh]">
              
              {/* Modal Header */}
              <div className="bg-[#083F92] text-white p-6 flex justify-between items-start shrink-0">
                <div className="flex flex-col gap-1 pr-6">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-300" />
                    <h3 className="font-poppins font-bold text-[18px] leading-[24px]">
                      Tournament Results
                    </h3>
                  </div>
                  <p className="font-poppins font-light text-[12px] leading-[18px] text-white/80 line-clamp-1">
                    {viewingResultsTournament.title}
                  </p>
                </div>
                <button 
                  onClick={() => setViewingResultsTournament(null)}
                  className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-1.5 transition-colors shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[60vh] no-scrollbar">
                
                {/* Meta Row */}
                <div className="flex items-center justify-between text-[#151515] border-b pb-4 text-[13px] font-poppins bg-[#083F92]/5 p-3 rounded-lg border border-[#083F92]/10">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-[#083F92]" />
                    <span><strong>Venue:</strong> {viewingResultsTournament.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-[#083F92]" />
                    <span><strong>Date:</strong> {viewingResultsTournament.date}</span>
                  </div>
                </div>

                {/* Standings Table */}
                <div className="w-full border border-[#DADADA] rounded-[16px] overflow-hidden flex flex-col">
                  {/* Table Header */}
                  <div className="w-full bg-[#083F92] flex items-center py-3 px-4 text-white text-[12px] font-bold font-poppins shrink-0">
                    <div className="w-[60px] shrink-0 text-center">Rank</div>
                    <div className="w-[200px] shrink-0">Player Name</div>
                    <div className="w-[100px] shrink-0 text-center">USCF Rating</div>
                    <div className="w-[80px] shrink-0 text-center">Points</div>
                    <div className="flex-grow text-center shrink-0">Record (W-L-D)</div>
                  </div>

                  {/* Table Rows */}
                  <div className="flex flex-col w-full">
                    {mockStandings.default.map((standing, idx) => {
                      const isAltRow = idx % 2 === 1;
                      const isTop3 = standing.rank <= 3;
                      
                      return (
                        <div 
                          key={standing.rank}
                          className={`w-full flex items-center py-3 px-4 border-b border-[#EEEEEE] last:border-b-0 font-poppins text-[13px] leading-[20px] text-[#636363] ${
                            isAltRow ? 'bg-[#F4F4F4]' : 'bg-white'
                          } ${isTop3 ? 'font-semibold text-[#151515]' : ''}`}
                        >
                          <div className="w-[60px] shrink-0 flex justify-center items-center">
                            {standing.rank === 1 ? (
                              <Award className="w-5 h-5 text-yellow-500 fill-yellow-100" />
                            ) : standing.rank === 2 ? (
                              <Award className="w-5 h-5 text-slate-400 fill-slate-100" />
                            ) : standing.rank === 3 ? (
                              <Award className="w-5 h-5 text-amber-600 fill-amber-50" />
                            ) : (
                              <span>{standing.rank}</span>
                            )}
                          </div>
                          <div className="w-[200px] shrink-0">{standing.name}</div>
                          <div className="w-[100px] shrink-0 text-center">{standing.rating}</div>
                          <div className="w-[80px] shrink-0 text-center text-[#083F92] font-bold">{standing.score}</div>
                          <div className="flex-grow text-center shrink-0">{standing.record}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t flex justify-end shrink-0">
                <button 
                  onClick={() => setViewingResultsTournament(null)}
                  className="px-6 py-2 bg-[#083F92] hover:bg-[#083F92]/90 text-white rounded-[100px] font-poppins font-semibold text-[13px] transition-all shadow-sm"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </PageTransition>
  );
}
