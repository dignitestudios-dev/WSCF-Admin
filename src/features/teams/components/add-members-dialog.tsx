'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAddTeamMembers } from '../hooks/use-teams';
import { MemberPicker, PickedMember } from './member-picker';

interface AddMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: string;
  teamName: string;
  /** Ids already on the roster, so they cannot be picked twice. */
  existingUserIds: string[];
}

export function AddMembersDialog({
  open,
  onOpenChange,
  teamId,
  teamName,
  existingUserIds,
}: AddMembersDialogProps) {
  const { mutateAsync: addMembers, isPending } = useAddTeamMembers();
  const [members, setMembers] = useState<PickedMember[]>([]);

  // Cleared on close rather than in an effect watching `open`.
  const handleOpenChange = (next: boolean) => {
    if (isPending) return;
    if (!next) setMembers([]);
    onOpenChange(next);
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (members.length === 0) return;

    try {
      await addMembers({ teamId, playerIds: members.map((member) => member.id) });
      handleOpenChange(false);
    } catch {
      // surfaced by the mutation's toast
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[90vw]! sm:w-[520px]! max-w-[520px]! rounded-[12px] border-none bg-white p-0 shadow-2xl"
      >
        <div className="flex items-start justify-between px-8 pb-0 pt-8">
          <DialogTitle className="font-poppins text-[24px] font-semibold text-[#181818]">
            Add Members
          </DialogTitle>
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleOpenChange(false)}
            className="mt-1 text-[#181818]/60 transition-colors hover:text-[#181818] disabled:opacity-50 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-2 px-8">
          <p className="font-poppins text-[14px] text-[#565656]">
            Adding to <span className="font-semibold text-[#181818]">{teamName}</span>
          </p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-6 px-8 pb-8 pt-4">
          <div className="flex flex-col gap-2">
            <Label className="font-poppins text-[14px] font-medium text-[#181818]">
              Players <span className="text-red-500">*</span>
            </Label>
            <MemberPicker
              selected={members}
              onChange={setMembers}
              disabled={isPending}
              excludedIds={existingUserIds}
            />
            <p className="font-poppins text-[12px] text-[#8C8C8C]">
              A player already on another team will be moved to this one.
            </p>
          </div>

          <Button
            type="submit"
            disabled={isPending || members.length === 0}
            className="h-[48px] w-full rounded-[12px] bg-[#083F92] shadow-md hover:bg-[#083F92]/90 disabled:opacity-50"
          >
            <span className="font-poppins text-[14px] font-semibold capitalize text-white">
              {isPending
                ? 'Adding...'
                : members.length > 0
                  ? `Add ${members.length} Member${members.length === 1 ? '' : 's'}`
                  : 'Add Members'}
            </span>
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
