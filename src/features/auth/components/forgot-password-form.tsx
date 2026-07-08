'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Mail, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { forgotPasswordSchema, ForgotPasswordFormData } from '../schema/forgot-password.schema';

export function ForgotPasswordForm() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    setIsPending(true);
    // Simulate sending OTP code
    setTimeout(() => {
      setIsPending(false);
      toast.success('Verification OTP code sent to your email.');
      router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
    }, 1500);
  };

  return (
    <div className="w-[421px] flex flex-col items-center gap-[32px] relative">
      
      {/* Back Button */}
      <button 
        type="button"
        onClick={() => router.push('/login')}
        className="absolute left-[-160px] top-[-60px] lg:left-[-120px] lg:top-[-40px] xl:left-[-180px] xl:top-[-60px] w-[50px] h-[50px] bg-[#083F92] hover:bg-[#083F92]/90 transition-colors rounded-[25px] flex items-center justify-center text-white cursor-pointer shadow-md"
      >
        <ArrowLeft className="w-[32px] h-[32px]" />
      </button>

      {/* Header Key Icon with beautiful modern styling */}
     
        <div className="w-[100px] h-[100px] rounded-full bg-[#083F92]/10 flex items-center justify-center">
          <KeyRound className="w-[50px] h-[50px] text-[#083F92]" />
        </div>
   

      {/* Title Header */}
      <div className="flex flex-col justify-center items-center gap-[12px] w-[421px]">
        <h1 className="w-full h-[49px] font-semibold text-[36px] leading-[49px] text-center tracking-[-0.008em] capitalize text-[#083F92] m-0">
          Forgot Password
        </h1>
        <p className="w-[459px] h-[44px] font-normal text-[16px] leading-[22px] text-center tracking-[-0.014em] text-[#565656] m-0 max-w-[100vw] px-4">
          Enter your email address below, and we'll send you a 5-digit verification code to reset your password.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-center gap-[26px] w-full max-w-[421px]">
        <div className="w-full max-w-[343px] flex flex-col gap-[26px]">
          
          {/* Email Input */}
          <div className="flex flex-col items-start gap-[8px] w-full">
            <label htmlFor="email" className="font-medium text-[14px] leading-[19px] capitalize text-[#181818]">
              Email address
            </label>
            <div className="relative w-full h-[44px]">
              <Input 
                id="email"
                placeholder="designer@dignitestudios.com" 
                type="email"
                maxLength={254}
                className="w-full h-full bg-white border border-[#3D3775] rounded-[24px] px-[16px] font-normal text-[14px] text-[#181818] placeholder:text-[#181818]"
                {...register('email')} 
              />
            </div>
            {errors.email && (
              <p className="text-[0.8rem] font-medium text-destructive mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Action Button */}
          <div className="flex flex-col gap-2 w-full mt-[12px]">
            <Button 
              type="submit" 
              disabled={isPending}
              className="w-full h-[48px] bg-[#083F92] hover:bg-[#083F92]/90 rounded-[24px] flex justify-center items-center disabled:opacity-50 shadow-[0px_4px_4px_rgba(61,55,117,0.25)]"
            >
              <span className="font-semibold text-[14px] leading-[19px] text-center capitalize text-white">
                {isPending ? 'Sending...' : 'Send Code'}
              </span>
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
