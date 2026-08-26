'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown, Loader2, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { useUsers } from '@/features/users/hooks/use-users';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';
import { MAX_MEMBERS_PER_REQUEST } from '../services/team.service';

export interface PickedMember {
  id: string;
  name: string;
}

interface MemberPickerProps {
  selected: PickedMember[];
  onChange: (members: PickedMember[]) => void;
  disabled?: boolean;
  /** Already in this group — shown as taken and not selectable. */
  excludedIds?: string[];
  /** What to call being already in it. */
  excludedLabel?: string;
}

/**
 * Searchable, paginated multi-select over the users list.
 *
 * Picks stay in a chip row above the trigger so the admin can see the whole
 * batch while continuing to search — the list underneath re-queries the API on
 * every keystroke, so a selection made three searches ago would otherwise be
 * invisible.
 */
export function MemberPicker({
  selected,
  onChange,
  disabled,
  excludedIds = [],
  excludedLabel = 'On this team',
}: MemberPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 400);

  // Page resets where the search changes rather than in an effect reacting to
  // it, so there is no render with a stale page against a new query.
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const { data, isFetching } = useUsers(page, 10, debouncedSearch);
  const users = data?.data?.users || [];
  const totalPages = data?.data?.pagination?.totalPages || 1;

  const selectedIds = new Set(selected.map((member) => member.id));
  const excluded = new Set(excludedIds);
  const isFull = selected.length >= MAX_MEMBERS_PER_REQUEST;

  const toggle = (id: string, name: string) => {
    if (selectedIds.has(id)) {
      onChange(selected.filter((member) => member.id !== id));
      return;
    }
    if (isFull) return;
    onChange([...selected, { id, name }]);
  };

  return (
    <div className="flex flex-col gap-2">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 rounded-[12px] border border-[#DADADA] bg-[#083F92]/[0.04] p-3">
          {selected.map((member) => (
            <span
              key={member.id}
              className="flex items-center gap-1.5 rounded-full bg-[#083F92] py-1 pl-3 pr-1.5 font-poppins text-[12px] font-medium text-white"
            >
              {member.name}
              <button
                type="button"
                disabled={disabled}
                aria-label={`Remove ${member.name}`}
                onClick={() => onChange(selected.filter((m) => m.id !== member.id))}
                className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/35 disabled:opacity-50 cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger
          type="button"
          disabled={disabled}
          className="flex h-[44px] w-full items-center justify-between rounded-[24px] border border-[#3D3775] bg-white px-4 font-poppins text-[14px] text-[#181818] outline-none focus:ring-0 focus-visible:ring-0 disabled:opacity-60 cursor-pointer"
        >
          <span className={cn('truncate', selected.length === 0 && 'text-[#181818]/40')}>
            {selected.length === 0
              ? 'Search and select players'
              : `${selected.length} player${selected.length === 1 ? '' : 's'} selected`}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="w-[300px] rounded-[12px] border-[#DADADA] bg-white p-0 sm:w-[416px]"
        >
          <div className="flex w-full flex-col">
            <div className="border-b border-[#DADADA]/50 px-3 py-2">
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(event) => handleSearchChange(event.target.value)}
                className="h-8 border-none px-0 font-poppins text-sm shadow-none focus-visible:ring-0"
              />
            </div>

            <div className="max-h-[240px] overflow-y-auto p-1">
              {isFetching ? (
                <div className="flex items-center justify-center gap-2 py-6 font-poppins text-sm text-[#565656]">
                  <Loader2 className="h-4 w-4 animate-spin text-[#083F92]" />
                  Loading...
                </div>
              ) : users.length === 0 ? (
                <div className="py-6 text-center font-poppins text-sm text-[#565656]">
                  No player found.
                </div>
              ) : (
                users.map(
                  (user: {
                    _id: string;
                    firstName?: string;
                    lastName?: string;
                    name?: string;
                    membershipId?: string;
                    grade?: string;
                    email?: string;
                    status?: string;
                  }) => {
                  // A row is a player — a child. Siblings share a surname and
                  // their parent's email, so the grade and membership id are
                  // what actually tell two of them apart.
                  const name =
                    user.name ||
                    [user.firstName, user.lastName].filter(Boolean).join(' ') ||
                    'Unnamed';
                  const details = [
                    user.grade ? `Grade ${user.grade}` : null,
                    user.membershipId,
                    user.email,
                  ]
                    .filter(Boolean)
                    .join(' · ');
                  const isSelected = selectedIds.has(user._id);
                  const isOnTeam =
                    excluded.has(user._id);
                  // The API rejects players whose account is deactivated, so
                  // block them here rather than letting the batch come back
                  // with a failure.
                  const isInactive = user.status !== undefined && user.status !== 'active';
                  const isBlocked = isOnTeam || isInactive || (isFull && !isSelected);

                  return (
                    <div
                      key={user._id}
                      onClick={() => !isBlocked && toggle(user._id, name)}
                      className={cn(
                        'relative mb-1 flex select-none items-center rounded-[8px] px-3 py-2 font-poppins text-sm outline-none transition-colors last:mb-0',
                        isBlocked
                          ? 'cursor-not-allowed opacity-50'
                          : 'cursor-pointer hover:bg-[#083F92]/10 hover:text-[#083F92]',
                        isSelected ? 'bg-[#083F92]/10 font-medium text-[#083F92]' : 'text-[#181818]'
                      )}
                    >
                      <Check
                        className={cn('mr-2 h-4 w-4 shrink-0', isSelected ? 'opacity-100' : 'opacity-0')}
                      />
                      <span className="min-w-0 flex-1 truncate">
                        {name}
                        {details ? (
                          <span className="ml-2 text-[11px] text-[#8C8C8C]">{details}</span>
                        ) : null}
                      </span>
                      {isOnTeam ? (
                        <span className="ml-2 shrink-0 text-[11px] text-[#8C8C8C]">
                          {excludedLabel}
                        </span>
                      ) : isInactive ? (
                        <span className="ml-2 shrink-0 rounded-full bg-[#CE2D32]/10 px-2 py-0.5 text-[11px] font-medium text-[#CE2D32]">
                          Inactive
                        </span>
                      ) : null}
                    </div>
                  );
                  },
                )
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between rounded-b-[12px] border-t border-[#DADADA]/50 bg-[#F9FAFB] px-3 py-2">
                <button
                  type="button"
                  disabled={page <= 1 || isFetching}
                  onClick={() => setPage((current) => current - 1)}
                  className="font-poppins text-[12px] font-medium text-[#083F92] hover:underline disabled:opacity-50 cursor-pointer"
                >
                  Previous
                </button>
                <span className="font-poppins text-[11px] text-[#565656]">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages || isFetching}
                  onClick={() => setPage((current) => current + 1)}
                  className="font-poppins text-[12px] font-medium text-[#083F92] hover:underline disabled:opacity-50 cursor-pointer"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {isFull && (
        <p className="font-poppins text-[12px] text-[#B54708]">
          {MAX_MEMBERS_PER_REQUEST} is the maximum per request. Save these, then add more.
        </p>
      )}
    </div>
  );
}
