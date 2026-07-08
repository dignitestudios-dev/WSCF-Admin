'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { teamSchema, TeamFormData } from '../schema/team.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CreateTeamFormProps {
  onSubmitSuccess: (data: TeamFormData) => void;
}

export function CreateTeamForm({ onSubmitSuccess }: CreateTeamFormProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      teamName: '',
      teamCode: '',
    },
  });

  const onSubmit = (data: TeamFormData) => {
    onSubmitSuccess(data);
    reset();
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
              maxLength={100}
              className="w-full h-full bg-white border border-[#3D3775] rounded-[24px] px-[16px] font-poppins font-normal text-[14px] text-[#181818] placeholder:text-[#565656]/50 focus:outline-none"
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
              maxLength={15}
              className="w-full h-full bg-white border border-[#3D3775] rounded-[24px] px-[16px] font-poppins font-normal text-[14px] text-[#181818] placeholder:text-[#565656]/50 focus:outline-none"
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
          className="w-full h-[48px] bg-[#083F92] hover:bg-[#083F92]/95 rounded-[100px] flex justify-center items-center cursor-pointer transition-colors shadow-sm focus:outline-none"
        >
          <span className="font-general-sans font-semibold text-[14px] leading-[19px] text-center capitalize text-white">
            Create
          </span>
        </Button>
      </div>
    </form>
  );
}
