'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdateTeam } from '../hooks/use-teams';
import { teamSchema, TeamFormData } from '../schema/team.schema';
import { Team } from '../services/team.service';

interface EditTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: Team | null;
}

/** The name is the only editable field — members are managed on the team page. */
export function EditTeamDialog({ open, onOpenChange, team }: EditTeamDialogProps) {
  const { mutateAsync: updateTeam, isPending } = useUpdateTeam();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    // `values` re-syncs whenever the team changes, which is what an effect
    // would otherwise be doing by hand.
    values: { name: team?.name ?? '' },
  });

  const onSubmit = async (data: TeamFormData) => {
    if (!team) return;
    try {
      await updateTeam({ teamId: team._id, name: data.name });
      onOpenChange(false);
    } catch {
      // surfaced by the mutation's toast
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <DialogContent
        showCloseButton={false}
        className="w-[90vw]! sm:w-[480px]! max-w-[480px]! rounded-[12px] border-none bg-white p-0 shadow-2xl"
      >
        <div className="flex items-start justify-between px-8 pb-0 pt-8">
          <DialogTitle className="font-poppins text-[24px] font-semibold text-[#181818]">
            Rename Team
          </DialogTitle>
          <button
            type="button"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
            className="mt-1 text-[#181818]/60 transition-colors hover:text-[#181818] disabled:opacity-50 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 px-8 pb-8 pt-6">
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="edit-team-name"
              className="font-poppins text-[14px] font-medium text-[#181818]"
            >
              Team Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-team-name"
              maxLength={100}
              autoComplete="off"
              disabled={isPending}
              className="h-[44px] rounded-[24px] border border-[#3D3775] bg-white px-4 text-[14px] font-normal text-[#181818] placeholder:text-[#181818]/40 focus-visible:ring-0 focus-visible:ring-offset-0"
              {...register('name')}
            />
            {errors.name && (
              <p className="font-poppins text-[12px] text-red-500">{errors.name.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="h-[48px] w-full rounded-[12px] bg-[#083F92] shadow-md hover:bg-[#083F92]/90"
          >
            <span className="font-poppins text-[14px] font-semibold capitalize text-white">
              {isPending ? 'Saving...' : 'Save Changes'}
            </span>
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
