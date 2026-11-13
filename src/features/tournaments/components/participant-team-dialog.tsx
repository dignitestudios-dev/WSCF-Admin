'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, Loader2, TriangleAlert, UsersRound } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { teamService } from '@/features/teams/services/team.service';
import { useSetParticipantTeam } from '@/features/tournaments/hooks/use-set-participant-team';

interface ParticipantTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tournamentId: string;
  /** The tournament entry being edited. */
  participantId: string;
  playerName: string;
  /** The team recorded on this entry now (`name` is already "CODE (Name)"). */
  currentTeam: { _id: string; name?: string | null } | null;
}

/**
 * Corrects the team recorded on ONE tournament entry. The player's own team and
 * their other tournaments are not touched: an entry keeps the team from the day
 * the player applied, and this is the admin's way to fix that record.
 */
export function ParticipantTeamDialog({ open, onOpenChange, ...formProps }: ParticipantTeamDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-[500px] rounded-[24px] p-5 sm:p-6 bg-white shadow-xl">
        {/* Mounted only while open, so it starts from the current team each time. */}
        {open && <ParticipantTeamForm onClose={() => onOpenChange(false)} {...formProps} />}
      </DialogContent>
    </Dialog>
  );
}

// '' = "no team"; anything else is a team id.
function ParticipantTeamForm({
  onClose,
  tournamentId,
  participantId,
  playerName,
  currentTeam,
}: Omit<ParticipantTeamDialogProps, 'open' | 'onOpenChange'> & { onClose: () => void }) {
  const [selected, setSelected] = useState<string>(currentTeam?._id ?? '');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  // Waits for a pause in typing before asking the server.
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading } = useQuery({
    queryKey: ['assign-team-options', search],
    queryFn: () => teamService.getTeams(1, 50, search),
  });
  const teams = data?.data?.teams ?? [];

  const { mutateAsync: setTeam, isPending: isSaving } = useSetParticipantTeam(tournamentId);

  const currentId = currentTeam?._id ?? '';
  const unchanged = selected === currentId;

  const handleSave = async () => {
    if (unchanged || isSaving) return;
    try {
      await setTeam({ participantId, teamId: selected || null });
      onClose();
    } catch {
      // surfaced by the mutation's toast
    }
  };

  const optionClass = (active: boolean) =>
    `flex w-full cursor-pointer items-center justify-between gap-3 rounded-[12px] border px-4 py-3 text-left transition-colors ${
      active
        ? 'border-[#083F92] bg-[#083F92]/10'
        : 'border-[#DADADA] bg-white hover:bg-[#083F92]/5'
    }`;

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="w-[42px] h-[42px] bg-[#083F92]/10 rounded-full flex items-center justify-center text-[#083F92] shrink-0">
          <UsersRound className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <DialogTitle className="font-poppins text-[20px] font-semibold text-[#083F92]">
            Edit Tournament Team
          </DialogTitle>
          <p className="font-poppins text-[13px] text-[#8C8C8C] break-words [overflow-wrap:anywhere]">
            {playerName}
          </p>
        </div>
      </div>

      {/* The part an admin must not miss. */}
      <div
        role="alert"
        className="mt-4 flex gap-3 rounded-[12px] border border-[#F5B971] bg-[#FFF4E5] p-3.5"
      >
        <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#B54708]" />
        <div className="font-poppins text-[13px] leading-[19px] text-[#7A3F00]">
          <p className="font-semibold">Download the WinTD files again after this change</p>
          <p className="mt-1">
            If you have already downloaded WinTD files for this tournament, they still contain the old team.
            Using them can give wrong team results. Download fresh files after saving.
          </p>
          <p className="mt-1">
            This changes the team for <strong>this tournament only</strong>. The player&apos;s own team and
            their other tournaments are not changed.
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-[12px] bg-[#F8F9FA] border border-[#E9ECEF] p-3 flex items-center justify-between gap-3">
        <span className="font-poppins text-[13px] text-[#636363] shrink-0">Current team</span>
        <span className="font-poppins text-[14px] font-bold text-[#083F92] truncate" title={currentTeam?.name ?? undefined}>
          {currentTeam?.name || 'No team'}
        </span>
      </div>

      <Input
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder="Search by team code or name"
        autoComplete="off"
        disabled={isSaving}
        className="mt-4 h-[44px] rounded-[12px] border border-[#DADADA] px-4 font-poppins text-[14px] focus-visible:ring-1 focus-visible:ring-[#083F92]"
      />

      <div className="mt-3 flex max-h-[220px] flex-col gap-2 overflow-y-auto pr-1" role="radiogroup" aria-label="Team">
        <button
          type="button"
          role="radio"
          aria-checked={selected === ''}
          disabled={isSaving}
          onClick={() => setSelected('')}
          className={optionClass(selected === '')}
        >
          <span className="font-poppins text-[14px] font-medium text-[#181818]">No team</span>
          {selected === '' && <Check className="h-4 w-4 text-[#083F92]" />}
        </button>

        {isLoading ? (
          <div className="flex items-center justify-center py-6 text-[#083F92]">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : teams.length === 0 ? (
          <p className="py-4 text-center font-poppins text-[13px] text-[#8C8C8C]">
            {search ? 'No teams match that search.' : 'No teams yet.'}
          </p>
        ) : (
          teams.map((team) => (
            <button
              key={team._id}
              type="button"
              role="radio"
              aria-checked={selected === team._id}
              disabled={isSaving}
              onClick={() => setSelected(team._id)}
              className={optionClass(selected === team._id)}
            >
              <span className="flex min-w-0 flex-col">
                <span className="font-mono text-[13px] font-semibold tracking-wide text-[#083F92]">
                  {team.code || '—'}
                </span>
                {team.name ? (
                  <span className="truncate font-poppins text-[13px] text-[#636363]">{team.name}</span>
                ) : null}
              </span>
              {selected === team._id && <Check className="h-4 w-4 shrink-0 text-[#083F92]" />}
            </button>
          ))
        )}
      </div>

      <div className="mt-5 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={isSaving}
          className="h-[44px] px-5 rounded-[100px] border border-[#DADADA] font-poppins text-[13px] font-medium text-[#636363] hover:bg-black/5 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={unchanged || isSaving}
          className="h-[44px] px-6 rounded-[100px] bg-[#083F92] font-poppins text-[14px] font-semibold text-white shadow-sm hover:bg-[#062c68] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSaving ? 'Saving...' : selected ? 'Save Team' : 'Remove Team'}
        </button>
      </div>
    </>
  );
}
