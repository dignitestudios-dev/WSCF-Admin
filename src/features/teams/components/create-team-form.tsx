'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { teamSchema, TeamFormData } from '../schema/team.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CreateTeamFormProps {
  onSubmitSuccess: (data: TeamFormData) => Promise<void> | void;
  isLoading?: boolean;
}

export function CreateTeamForm({ onSubmitSuccess, isLoading = false }: CreateTeamFormProps) {
  const { register, handleSubmit , reset, watch, formState: { errors } } = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    mode:"onChange",
    defaultValues: {
      teamName: '',
      teamCode: '',
    },
  });

  const onSubmit = async (data: TeamFormData) => {
    try {
      await onSubmitSuccess(data);
      reset({ teamName: '', teamCode: '' });
    } catch (error) {
      // Allow parent's mutation handler to throw and catch the error, so we don't reset the form on failure.
    }
  };

  return (
    <form 
      onSubmit={handleSubmit(onSubmit)} 
      className="w-full max-w-[403px] h-auto min-h-[298px] bg-white rounded-[24px] p-6 flex flex-col justify-between border border-[#DADADA]/30 shadow-[0px_4px_12px_rgba(0,0,0,0.05)]"
    >
      <div className="flex flex-col gap-4 w-full">
        
        {/* Team Name Input */}
        <div className="flex flex-col gap-2 w-full">
          <label htmlFor="teamName" className="font-poppins font-medium text-[14px] leading-[21px] text-[#181818] capitalize">
            Team Name
          </label>
          <div className="relative w-full h-[44px]">
            <Input
              id="teamName"
              placeholder="Title"
              type="text"
              value={watch('teamName')}
              maxLength={100}
              disabled={isLoading}
              className="w-full h-full bg-white border border-[#3D3775] rounded-[24px] px-[16px] font-poppins font-normal text-[14px] text-[#181818] placeholder:text-[#565656]/50 focus:outline-none disabled:opacity-60"
              {...register('teamName')}
            />
          </div>
          {errors.teamName && (
            <p className="text-[0.75rem] font-medium text-destructive mt-0.5 px-2">
              {errors.teamName.message}
            </p>
          )}
        </div>

        {/* Team Code Input */}
        <div className="flex flex-col gap-2 w-full">
          <label htmlFor="teamCode" className="font-poppins font-medium text-[14px] leading-[21px] text-[#181818] capitalize">
            Team Code
          </label>
          <div className="relative w-full h-[44px]">
            <Input
              id="teamCode"
              placeholder="Title"
              type="text"
              value={watch('teamCode')}
              maxLength={15}
              disabled={isLoading}
              className="w-full h-full bg-white border border-[#3D3775] rounded-[24px] px-[16px] font-poppins font-normal text-[14px] text-[#181818] placeholder:text-[#565656]/50 focus:outline-none disabled:opacity-60"
              {...register('teamCode')}
            />
          </div>
          {errors.teamCode && (
            <p className="text-[0.75rem] font-medium text-destructive mt-0.5 px-2">
              {errors.teamCode.message}
            </p>
          )}
        </div>

      </div>

      {/* Submit Button */}
      <div className="w-full mt-6">
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-[48px] bg-[#083F92] hover:bg-[#083F92]/95 rounded-[100px] flex justify-center items-center cursor-pointer transition-colors shadow-sm focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span className="font-general-sans font-semibold text-[14px] leading-[19px] text-center capitalize text-white">
            {isLoading ? 'Creating...' : 'Create'}
          </span>
        </Button>
      </div>
    </form>
  );
}
