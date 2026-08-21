'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MemberPicker, type PickedMember } from '@/features/teams/components/member-picker';
import { useAssignUserToSchool } from '../hooks/use-schools';
import { School } from '../services/school.service';

interface AssignUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  school: School | null;
}

/**
 * Puts players into a school.
 *
 * Uses the same picker as adding team members — several at a time, searchable,
 * with players already at this school shown as taken rather than silently
 * doing nothing when picked.
 */
export function AssignUserDialog({ open, onOpenChange, school }: AssignUserDialogProps) {
  const { mutateAsync: assignPlayers, isPending } = useAssignUserToSchool();

  const [members, setMembers] = useState<PickedMember[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setMembers([]);
      setError('');
    }
  }, [open]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!school) return;

    if (members.length === 0) {
      setError('Please select at least one player');
      return;
    }

    try {
      await assignPlayers({
        id: school._id,
        playerIds: members.map((member) => member.id),
      });
      onOpenChange(false);
    } catch {
      // surfaced by the mutation's toast
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] rounded-[24px] p-6">
        <DialogTitle className="font-poppins text-[22px] font-semibold text-[#083F92]">
          Assign Players
        </DialogTitle>
        <p className="font-poppins text-[13px] text-[#8C8C8C]">
          {school ? `Add players to ${school.name}.` : 'Add players to this school.'}
        </p>

        <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label className="font-poppins text-[14px] font-medium text-[#181818]">
              Players
            </Label>
            <MemberPicker
              selected={members}
              onChange={(next) => {
                setMembers(next);
                setError('');
              }}
              disabled={isPending}
              excludedLabel="At this school"
              excludedSchoolId={school?._id}
            />
            {error ? <p className="text-[12px] text-[#CE2D32]">{error}</p> : null}
          </div>

          <div className="mt-2 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-full px-6"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-11 rounded-full bg-[#083F92] px-6 hover:bg-[#062f6e]"
              disabled={isPending}
            >
              {isPending ? 'Assigning...' : 'Assign'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
