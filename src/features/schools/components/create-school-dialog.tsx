'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateSchool } from '../hooks/use-schools';
import { schoolSchema, SchoolFormData } from '../schema/school.schema';

interface CreateSchoolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateSchoolDialog({ open, onOpenChange }: CreateSchoolDialogProps) {
  const { mutateAsync: createSchool, isPending } = useCreateSchool();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SchoolFormData>({
    resolver: zodResolver(schoolSchema),
    defaultValues: {
      name: '',
      address: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset();
    }
  }, [open, reset]);

  const onSubmit = async (data: SchoolFormData) => {
    try {
      await createSchool(data);
      onOpenChange(false);
    } catch (error) {
      // Error handled by react-query
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        showCloseButton={false}
        className="w-[90vw]! sm:w-[480px]! max-w-[480px]! bg-white rounded-[12px] p-0 border-none shadow-2xl"
      >
        <div className="flex items-start justify-between px-8 pt-8 pb-0">
          <DialogTitle className="font-poppins font-semibold text-[24px] text-[#181818]">
            Create School
          </DialogTitle>
          <button
            onClick={handleClose}
            className="text-[#181818]/60 hover:text-[#181818] transition-colors mt-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 px-8 pb-8 pt-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name" className="font-poppins font-medium text-[14px] text-[#181818]">
              School Name <span className="text-red-500">*</span>
            </Label>
            <div className="relative h-[44px]">
              <Input
                id="name"
                maxLength={150}
                placeholder="Enter school name"
                disabled={isPending}
                className="h-full bg-white border border-[#3D3775] rounded-[24px] px-4 font-normal text-[14px] text-[#181818] focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#181818]/40"
                {...register('name')}
              />
            </div>
            {errors.name && (
              <p className="text-[12px] text-red-500">{errors.name.message as string}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="address" className="font-poppins font-medium text-[14px] text-[#181818]">
              School Address <span className="text-red-500">*</span>
            </Label>
            <div className="relative h-[44px]">
              <Input
                id="address"
                maxLength={300}
                placeholder="Enter school address"
                disabled={isPending}
                className="h-full bg-white border border-[#3D3775] rounded-[24px] px-4 font-normal text-[14px] text-[#181818] focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#181818]/40"
                {...register('address')}
              />
            </div>
            {errors.address && (
              <p className="text-[12px] text-red-500">{errors.address.message as string}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-[48px] bg-[#083F92] hover:bg-[#083F92]/90 rounded-[12px] mt-4 shadow-md"
          >
            <span className="font-poppins font-semibold text-[14px] text-white capitalize">
              {isPending ? 'Creating...' : 'Create School'}
            </span>
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
