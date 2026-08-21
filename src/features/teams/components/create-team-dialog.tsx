'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateTeam } from '../hooks/use-teams';
import { teamSchema, TeamFormData } from '../schema/team.schema';
import { MemberPicker, PickedMember } from './member-picker';

interface CreateTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTeamDialog({ open, onOpenChange }: CreateTeamDialogProps) {
  const { mutateAsync: createTeam, isPending } = useCreateTeam();
  const [members, setMembers] = useState<PickedMember[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: { name: '' },
  });

  // Cleared on the way out rather than on the way in, so there is no effect
  // reacting to `open` — the next open always starts from a blank form.
  const handleOpenChange = (next: boolean) => {
    if (isPending) return;
    if (!next) {
      reset({ name: '' });
      setMembers([]);
    }
    onOpenChange(next);
  };

  const onSubmit = async (data: TeamFormData) => {
    try {
      await createTeam({
        name: data.name,
        // Omitted entirely when empty — the backend treats a team with no
        // members as perfectly valid.
        ...(members.length > 0 ? { playerIds: members.map((member) => member.id) } : {}),
      });
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
            Create Team
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

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 px-8 pb-8 pt-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name" className="font-poppins text-[14px] font-medium text-[#181818]">
              Team Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              maxLength={100}
              autoComplete="off"
              placeholder="e.g. Milwaukee Knights"
              disabled={isPending}
              className="h-[44px] rounded-[24px] border border-[#3D3775] bg-white px-4 text-[14px] font-normal text-[#181818] placeholder:text-[#181818]/40 focus-visible:ring-0 focus-visible:ring-offset-0"
              {...register('name')}
            />
            {errors.name && (
              <p className="font-poppins text-[12px] text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label className="font-poppins text-[14px] font-medium text-[#181818]">
              Members <span className="font-normal text-[#8C8C8C]">(optional)</span>
            </Label>
            <MemberPicker selected={members} onChange={setMembers} disabled={isPending} />
            <p className="font-poppins text-[12px] text-[#8C8C8C]">
              A player already on another team will be moved to this one.
            </p>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="mt-2 h-[48px] w-full rounded-[12px] bg-[#083F92] shadow-md hover:bg-[#083F92]/90"
          >
            <span className="font-poppins text-[14px] font-semibold capitalize text-white">
              {isPending ? 'Creating...' : 'Create Team'}
            </span>
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
