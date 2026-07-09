'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { PageTransition } from '@/components/animations/page-transition';

// Form validation schema with Zod
const notificationSchema = z.object({
  title: z
    .string()
    .min(4, { message: 'Title must be at least 4 characters' })
    .max(100, { message: 'Title cannot exceed 100 characters' }),
  description: z
    .string()
    .min(4, { message: 'Description must be at least 4 characters' })
    .max(500, { message: 'Description cannot exceed 500 characters' }),
});

type NotificationFormValues = z.infer<typeof notificationSchema>;

export default function Notifications() {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const titleValue = watch('title', '');
  const descriptionValue = watch('description', '');

  const onSubmit = async (data: NotificationFormValues) => {
    // Simulate API push notification dispatch
    await new Promise((resolve) => setTimeout(resolve, 1200));
    
    toast.success('Push notification sent successfully!');
    reset();
  };

  return (
    <PageTransition>
      <div className="flex flex-col gap-6 w-full h-full font-sans select-none pb-12">
        
        {/* Page Title */}
        <div className="flex flex-col">
          <h1 className="font-poppins font-bold sm:text-[42px] text-[28px] sm:leading-[63px] leading-[36px] text-[#083F92] m-0">
            Push Notifications
          </h1>
        </div>

        {/* Main Content White Container */}
        <div className="w-full bg-white border border-[#DADADA] rounded-[24px] shadow-sm p-8 min-h-[500px] flex flex-col items-start">
          
          <form 
            onSubmit={handleSubmit(onSubmit)} 
            className="w-full max-w-[343px] flex flex-col gap-6"
          >
            {/* Title Field Group */}
            <div className="flex flex-col gap-2 w-full">
              <div className="flex justify-between items-center w-full">
                <label 
                  htmlFor="title" 
                  className="font-poppins font-medium text-[14px] leading-[21px] text-[#181818] capitalize"
                >
                  Title
                </label>
                <span className="font-poppins text-[12px] text-[#808080]">
                  {titleValue.length}/100
                </span>
              </div>
              <div className="relative w-full">
                <input
                  id="title"
                  type="text"
                  placeholder="Title"
                  maxLength={100}
                  disabled={isSubmitting}
                  {...register('title')}
                  className={`w-full h-[44px] bg-white border rounded-[24px] px-4 font-poppins font-normal text-[14px] text-[#181818] placeholder:text-[#565656] outline-none transition-all ${
                    errors.title ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-[#3D3775] focus:ring-1 focus:ring-[#3D3775]'
                  }`}
                />
              </div>
              {errors.title && (
                <span className="font-poppins text-[12px] text-red-500 mt-0.5 ml-2 animate-fade-in">
                  {errors.title.message}
                </span>
              )}
            </div>

            {/* Description Field Group */}
            <div className="flex flex-col gap-2 w-full">
              <div className="flex justify-between items-center w-full">
                <label 
                  htmlFor="description" 
                  className="font-poppins font-medium text-[14px] leading-[21px] text-[#181818] capitalize"
                >
                  Descriptions
                </label>
                <span className="font-poppins text-[12px] text-[#808080]">
                  {descriptionValue.length}/500
                </span>
              </div>
              <div className="relative w-full">
                <textarea
                  id="description"
                  placeholder="Write here"
                  maxLength={500}
                  disabled={isSubmitting}
                  {...register('description')}
                  className={`w-full h-[148px] bg-white border rounded-[12px] p-4 font-poppins font-normal text-[14px] text-[#181818] placeholder:text-[#565656] outline-none resize-none transition-all ${
                    errors.description ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-[#3D3775] focus:ring-1 focus:ring-[#3D3775]'
                  }`}
                />
              </div>
              {errors.description && (
                <span className="font-poppins text-[12px] text-red-500 mt-0.5 ml-2 animate-fade-in">
                  {errors.description.message}
                </span>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-[48px] bg-[#083F92] hover:bg-[#083F92]/95 active:bg-[#083F92]/90 disabled:bg-[#083F92]/40 rounded-[100px] flex items-center justify-center cursor-pointer transition-colors shadow-sm focus:outline-none shrink-0"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin text-white" />
              ) : (
                <span className="font-general-sans font-semibold text-[14px] leading-[19px] text-white text-center capitalize">
                  Push
                </span>
              )}
            </button>
          </form>

        </div>

      </div>
    </PageTransition>
  );
}
