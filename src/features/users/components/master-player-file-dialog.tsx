'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileSpreadsheet, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { teamService } from '@/features/teams/services/team.service';
import { userService, type MasterFileFilters } from '@/features/users/services/user.service';
import { toast } from '@/lib/toast';

const EMPTY_FILTERS: MasterFileFilters = {
  gradeMin: '',
  gradeMax: '',
  ratingMin: '',
  ratingMax: '',
  team: '',
  membership: '',
  rated: '',
  playerStatus: '',
};

const GRADES = [
  { value: '0', label: 'K' },
  ...Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) })),
];

const selectClass =
  'h-[44px] w-full rounded-[12px] border border-[#DADADA] bg-white px-3 font-poppins text-[14px] text-[#181818] outline-none focus-visible:ring-1 focus-visible:ring-[#083F92] disabled:opacity-50';
const inputClass =
  'h-[44px] rounded-[12px] border border-[#DADADA] px-3 font-poppins text-[14px] focus-visible:ring-1 focus-visible:ring-[#083F92]';
const labelClass = 'font-poppins font-medium text-[13px] text-[#181818]';

interface MasterPlayerFileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Lets an admin narrow the Master Player File before downloading it. Every
 * filter is optional; with none set the file holds every player who has ever
 * had a membership. The filtering is done by the server, so the file is exactly
 * what the dialog describes.
 */
export function MasterPlayerFileDialog({ open, onOpenChange }: MasterPlayerFileDialogProps) {
  const [filters, setFilters] = useState<MasterFileFilters>(EMPTY_FILTERS);
  const [isPreparing, setIsPreparing] = useState(false);

  // Teams are only needed once the dialog is opened.
  const { data: teamsData, isLoading: isLoadingTeams } = useQuery({
    queryKey: ['master-file-teams'],
    queryFn: () => teamService.getTeams(1, 100),
    enabled: open,
  });
  const teams = teamsData?.data?.teams ?? [];

  const set = <K extends keyof MasterFileFilters>(key: K, value: MasterFileFilters[K]) =>
    setFilters((current) => ({ ...current, [key]: value }));

  const digits = (value: string) => value.replace(/[^0-9]/g, '');

  const gradeError =
    filters.gradeMin && filters.gradeMax && Number(filters.gradeMin) > Number(filters.gradeMax)
      ? 'The first grade cannot be higher than the last grade.'
      : null;
  const ratingError =
    filters.ratingMin && filters.ratingMax && Number(filters.ratingMin) > Number(filters.ratingMax)
      ? 'The lowest Local rating cannot be higher than the highest.'
      : null;

  const activeCount = Object.values(filters).filter((value) => value !== '').length;

  const handleDownload = async () => {
    if (isPreparing || gradeError || ratingError) return;
    try {
      setIsPreparing(true);
      const blob = await userService.exportMasterPlayerFile(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'master-player-file.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Master Player File downloaded.');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to export master player file:', error);
      toast.error('Failed to download the Master Player File. Please try again.');
    } finally {
      setIsPreparing(false);
    }
  };

  return (
    <Dialog
      open={open}
      // Closing mid-download would leave the request running with nowhere to
      // report to, so the dialog stays put until it finishes.
      onOpenChange={(next) => {
        if (!isPreparing) onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto rounded-[24px] p-6 bg-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-[42px] h-[42px] bg-[#083F92]/10 rounded-full flex items-center justify-center text-[#083F92] shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <DialogTitle className="font-poppins text-[20px] font-semibold text-[#083F92]">
              Master Player File
            </DialogTitle>
            <p className="font-poppins text-[13px] text-[#8C8C8C]">
              Format: CSV. Leave a filter empty to include everyone.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="mf-grade-min" className={labelClass}>Grade from</Label>
              <select
                id="mf-grade-min"
                className={selectClass}
                value={filters.gradeMin}
                onChange={(e) => set('gradeMin', e.target.value)}
                disabled={isPreparing}
              >
                <option value="">Any</option>
                {GRADES.map((g) => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="mf-grade-max" className={labelClass}>Grade to</Label>
              <select
                id="mf-grade-max"
                className={selectClass}
                value={filters.gradeMax}
                onChange={(e) => set('gradeMax', e.target.value)}
                disabled={isPreparing}
              >
                <option value="">Any</option>
                {GRADES.map((g) => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>
            {gradeError && (
              <p className="col-span-2 font-poppins text-[12px] font-medium text-red-500">{gradeError}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="mf-rating-min" className={labelClass}>Local rating from</Label>
              <Input
                id="mf-rating-min"
                inputMode="numeric"
                placeholder="Any"
                value={filters.ratingMin}
                onChange={(e) => set('ratingMin', digits(e.target.value))}
                disabled={isPreparing}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="mf-rating-max" className={labelClass}>Local rating to</Label>
              <Input
                id="mf-rating-max"
                inputMode="numeric"
                placeholder="Any"
                value={filters.ratingMax}
                onChange={(e) => set('ratingMax', digits(e.target.value))}
                disabled={isPreparing}
                className={inputClass}
              />
            </div>
            {ratingError && (
              <p className="col-span-2 font-poppins text-[12px] font-medium text-red-500">{ratingError}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="mf-team" className={labelClass}>Team</Label>
            <select
              id="mf-team"
              className={selectClass}
              value={filters.team}
              onChange={(e) => set('team', e.target.value)}
              disabled={isPreparing || isLoadingTeams}
            >
              <option value="">{isLoadingTeams ? 'Loading teams...' : 'All teams'}</option>
              <option value="none">No team</option>
              {teams.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name ? `${t.name} (${t.code})` : t.code}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="mf-membership" className={labelClass}>Membership</Label>
              <select
                id="mf-membership"
                className={selectClass}
                value={filters.membership}
                onChange={(e) => set('membership', e.target.value as MasterFileFilters['membership'])}
                disabled={isPreparing}
              >
                <option value="">Active and expired</option>
                <option value="active">Active only</option>
                <option value="expired">Expired only</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="mf-rated" className={labelClass}>Rating</Label>
              <select
                id="mf-rated"
                className={selectClass}
                value={filters.rated}
                onChange={(e) => set('rated', e.target.value as MasterFileFilters['rated'])}
                disabled={isPreparing}
              >
                <option value="">Rated and unrated</option>
                <option value="rated">Rated only</option>
                <option value="unrated">Unrated only</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="mf-status" className={labelClass}>Player status</Label>
              <select
                id="mf-status"
                className={selectClass}
                value={filters.playerStatus}
                onChange={(e) => set('playerStatus', e.target.value as MasterFileFilters['playerStatus'])}
                disabled={isPreparing}
              >
                <option value="">Active and inactive</option>
                <option value="active">Active only</option>
                <option value="inactive">Inactive only</option>
              </select>
            </div>
          </div>
        </div>

        {isPreparing && (
          <p className="mt-4 font-poppins text-[12px] text-[#636363]">
            Preparing the file. This can take a minute for a large roster. Please do not close this page.
          </p>
        )}

        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setFilters(EMPTY_FILTERS)}
            disabled={isPreparing || activeCount === 0}
            className="font-poppins text-[13px] font-medium text-[#083F92] underline disabled:opacity-40 disabled:no-underline"
          >
            Clear filters
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isPreparing}
              className="h-[44px] px-5 rounded-[100px] border border-[#DADADA] font-poppins text-[13px] font-medium text-[#636363] hover:bg-black/5 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={isPreparing || Boolean(gradeError) || Boolean(ratingError)}
              aria-busy={isPreparing}
              className="h-[44px] px-6 rounded-[100px] bg-[#083F92] font-poppins text-[14px] font-semibold text-white shadow-sm hover:bg-[#062c68] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isPreparing && <Loader2 className="w-4 h-4 animate-spin" />}
              {isPreparing ? 'Preparing file...' : activeCount > 0 ? `Download (${activeCount} filter${activeCount === 1 ? '' : 's'})` : 'Download'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
