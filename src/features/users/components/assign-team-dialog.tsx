'use client';

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Loader2, UsersRound } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { teamLabel, teamService } from '@/features/teams/services/team.service';
import { useAddTeamMembers, useRemoveTeamMembers } from '@/features/teams/hooks/use-teams';

interface AssignTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playerId: string;
  playerName: string;
  /** The team the player is on now, or null. */
  currentTeam: { _id: string; name?: string | null; code?: string | null } | null;
}

/**
 * Puts a player on a team, moves them to another, or takes them off, from the
 * player's own page. A player is on at most one team, so choosing a different
 * one is a move; the server reports which.
 *
 * Teams are found by code or name, since either can be all a team has.
 */
export function AssignTeamDialog({ open, onOpenChange, ...formProps }: AssignTeamDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-[24px] p-6 bg-white shadow-xl">
        {/* Mounted only while open, so it starts from the current team each time. */}
        {open && <AssignTeamForm onClose={() => onOpenChange(false)} {...formProps} />}
      </DialogContent>
    </Dialog>
  );
}

// '' = "no team"; anything else is a team id.
function AssignTeamForm({
  onClose,
  playerId,
  playerName,
  currentTeam,
}: Omit<AssignTeamDialogProps, 'open' | 'onOpenChange'> & { onClose: () => void }) {
  const queryClient = useQueryClient();
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

  const { mutateAsync: addMember, isPending: isAdding } = useAddTeamMembers();
  const { mutateAsync: removeMember, isPending: isRemoving } = useRemoveTeamMembers();
  const isSaving = isAdding || isRemoving;

  const currentId = currentTeam?._id ?? '';
  const unchanged = selected === currentId;

  const handleSave = async () => {
    if (unchanged || isSaving) return;
    try {
      if (selected) {
        // Adding to a team the player is already on is a no-op, and adding to a
        // different one moves them, so no separate "leave" step is needed.
        await addMember({ teamId: selected, playerIds: [playerId] });
      } else if (currentId) {
        await removeMember({ teamId: currentId, playerIds: [playerId] });
      }
      queryClient.invalidateQueries({ queryKey: ['user', playerId] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
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
            Assign Team
          </DialogTitle>
          <p className="font-poppins text-[13px] text-[#8C8C8C] break-words [overflow-wrap:anywhere]">
            {playerName}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-[12px] bg-[#F8F9FA] border border-[#E9ECEF] p-3 flex items-center justify-between gap-3">
        <span className="font-poppins text-[13px] text-[#636363]">Current team</span>
        <span className="font-poppins text-[14px] font-bold text-[#083F92] truncate">
          {currentTeam ? teamLabel(currentTeam) : 'No team'}
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

      <div className="mt-3 flex max-h-[260px] flex-col gap-2 overflow-y-auto pr-1" role="radiogroup" aria-label="Team">
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

      {currentId && selected && selected !== currentId ? (
        <p className="mt-3 font-poppins text-[12px] text-[#7A3F00]">
          {playerName} will be moved from {teamLabel(currentTeam)} to the selected team.
        </p>
      ) : null}

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
          {isSaving ? 'Saving...' : selected ? 'Save Team' : 'Remove from Team'}
        </button>
      </div>
    </>
  );
}
