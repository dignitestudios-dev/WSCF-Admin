'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { teamSchema, TeamFormData } from '../schema/team.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Controller } from 'react-hook-form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSchools, useSchoolDetails } from '@/features/schools/hooks/use-schools';
import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/use-debounce';

interface CreateTeamFormProps {
  onSubmitSuccess: (data: TeamFormData) => Promise<void> | void;
  isLoading?: boolean;
}

export function CreateTeamForm({ onSubmitSuccess, isLoading = false }: CreateTeamFormProps) {
  const { register, handleSubmit, reset, watch, control, formState: { errors } } = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    mode:"onChange",
    defaultValues: {
      teamName: '',
      teamCode: '',
      schoolId: '',
    },
  });

  const [openCombobox, setOpenCombobox] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data: schoolsData, isFetching: isSchoolsPending } = useSchools(page, 10, debouncedSearch);
  const schools = schoolsData?.data?.schools || [];
  const totalPages = schoolsData?.data?.pagination?.totalPages || 1;

  // Local state to display selected school name even when it's not on the current page
  const [selectedSchoolName, setSelectedSchoolName] = useState<string>('');

  const onSubmit = async (data: TeamFormData) => {
    try {
      await onSubmitSuccess(data);
      reset({ teamName: '', teamCode: '', schoolId: '' });
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

        {/* School Dropdown */}
        <div className="flex flex-col gap-2 w-full">
          <label htmlFor="schoolId" className="font-poppins font-medium text-[14px] leading-[21px] text-[#181818] capitalize">
            School
          </label>
          <div className="relative w-full h-[44px]">
            <Controller
              control={control}
              name="schoolId"
              render={({ field }) => (
                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                  <PopoverTrigger className="w-full h-full bg-white border border-[#3D3775] rounded-[24px] px-[16px] font-poppins font-normal text-[14px] text-[#181818] outline-none disabled:opacity-60 focus:ring-0 focus-visible:ring-0 flex items-center justify-between" disabled={isLoading}>
                    <span className="truncate">
                      {field.value
                        ? selectedSchoolName || schools.find((school) => school._id === field.value)?.name || "Select a school"
                        : "Select a school"}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] sm:w-[350px] p-0 rounded-[12px] bg-white border-[#DADADA]" align="start">
                    <div className="flex flex-col w-full">
                      <div className="px-3 py-2 border-b border-[#DADADA]/50">
                        <Input
                          placeholder="Search school by name..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="h-8 border-none focus-visible:ring-0 shadow-none font-poppins text-sm px-0"
                        />
                      </div>
                      <div className="max-h-[200px] overflow-y-auto p-1">
                        {isSchoolsPending ? (
                          <div className="py-6 text-center text-sm font-poppins text-[#565656]">Loading...</div>
                        ) : schools.length === 0 ? (
                          <div className="py-6 text-center text-sm font-poppins text-[#565656]">No school found.</div>
                        ) : (
                          schools.map((school) => (
                            <div
                              key={school._id}
                              className={cn(
                                "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-[#083F92]/10 hover:text-[#083F92] data-[disabled]:pointer-events-none data-[disabled]:opacity-50 font-poppins transition-colors",
                                field.value === school._id ? "bg-[#083F92]/10 text-[#083F92] font-medium" : "text-[#181818]"
                              )}
                              onClick={() => {
                                field.onChange(school._id);
                                setSelectedSchoolName(school.name);
                                setOpenCombobox(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === school._id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {school.name}
                            </div>
                          ))
                        )}
                      </div>
                      
                      {/* Pagination Controls inside Combobox */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between px-3 py-2 border-t border-[#DADADA]/50 bg-[#F9FAFB] rounded-b-[12px]">
                          <button
                            type="button"
                            disabled={page <= 1 || isSchoolsPending}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setPage(p => p - 1);
                            }}
                            className="text-[12px] font-poppins font-medium text-[#083F92] disabled:opacity-50 hover:underline cursor-pointer"
                          >
                            Previous
                          </button>
                          <span className="text-[11px] font-poppins text-[#565656]">
                            Page {page} of {totalPages}
                          </span>
                          <button
                            type="button"
                            disabled={page >= totalPages || isSchoolsPending}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setPage(p => p + 1);
                            }}
                            className="text-[12px] font-poppins font-medium text-[#083F92] disabled:opacity-50 hover:underline cursor-pointer"
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            />
          </div>
          {errors.schoolId && (
            <p className="text-[0.75rem] font-medium text-destructive mt-0.5 px-2">
              {errors.schoolId.message}
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
