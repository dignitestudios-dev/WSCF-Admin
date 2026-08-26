'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { toast } from '@/lib/toast';
import { resetPasswordSchema, ResetPasswordFormData } from '../schema/reset-password.schema';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useResetPassword } from '../hooks/use-reset-password';

export function ResetPasswordForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const { mutate: resetPassword, isPending } = useResetPassword();

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    const token = localStorage.getItem('reset-pass-token');
    if (!token) {
      toast.error('Session expired. Please request a new OTP code.');
      router.push('/forgot-password');
      return;
    }

    resetPassword(
      { data: { password: data.password }, token },
      {
        onSuccess: () => {
          setShowSuccessDialog(true);
        },
      }
    );
  };

  return (
    <div className="w-[421px] flex flex-col items-center gap-[32px]">

      {/* Header Password Icon */}
      <div className="rounded-full flex items-center justify-center overflow-hidden">
        <Image
          src="/images/set-password.webp"
          alt="Set Password Icon"
          width={150}
          height={150}
          className="object-contain"
        />
      </div>

      {/* Title Header */}
      <div className="flex flex-col justify-center items-center gap-[12px] w-[421px]">
        <h1 className="w-[316px] h-[49px] text-nowrap font-semibold text-[36px] leading-[49px] text-center tracking-[-0.008em] capitalize text-[#083F92] m-0">
          Set New Password
        </h1>
        <p className="w-[229px] h-[22px] font-normal text-[16px] leading-[22px] text-center tracking-[-0.014em] text-[#565656] m-0">
          Enter new password to continue!
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-center gap-[26px] w-full max-w-[421px]">
        {/* Locked while the request is in flight: disabling only the
            submit button leaves every field editable after the values
            have already been sent. `contents` keeps the fieldset out
            of the layout. */}
        <fieldset disabled={isPending} className="contents">
        <div className="w-full max-w-[343px] flex flex-col gap-[26px]">

          {/* New Password Input */}
          <div className="flex flex-col items-start gap-[8px] w-full relative">
            <Label htmlFor="password">Password</Label>
            <div className="relative w-full h-[44px]">
              <Input
                id="password"
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                maxLength={50}
                className="w-full h-full bg-white border border-[#3D3775] rounded-[24px] px-[16px] font-normal text-[14px] text-[#181818] pr-[40px] placeholder:tracking-widest"
                {...register('password')}
              />
              {/* Eye icon / hide icon toggle */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-[16px] top-1/2 -translate-y-1/2 flex items-center cursor-pointer p-0 bg-transparent border-0 focus:outline-none focus:ring-0 text-[#130F26]/60 hover:text-[#130F26] transition-colors"
              >
                {showPassword ? (
                  <Eye className="h-5 w-5" />
                ) : (
                  <EyeOff className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-[0.8rem] font-medium text-destructive mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password Input */}
          <div className="flex flex-col items-start gap-[8px] w-full relative">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative w-full h-[44px]">
              <Input
                id="confirmPassword"
                placeholder="••••••••"
                type={showConfirmPassword ? "text" : "password"}
                maxLength={50}
                className="w-full h-full bg-white border border-[#3D3775] rounded-[24px] px-[16px] font-normal text-[14px] text-[#181818] pr-[40px] placeholder:tracking-widest"
                {...register('confirmPassword')}
              />
              {/* Eye icon / hide icon toggle */}
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-[16px] top-1/2 -translate-y-1/2 flex items-center cursor-pointer p-0 bg-transparent border-0 focus:outline-none focus:ring-0 text-[#130F26]/60 hover:text-[#130F26] transition-colors"
              >
                {showConfirmPassword ? (
                  <Eye className="h-5 w-5" />
                ) : (
                  <EyeOff className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-[0.8rem] font-medium text-destructive mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        {/* Set Password Button */}
        <Button
          type="submit"
          disabled={isPending}
          className="w-full max-w-[343px] h-[48px] bg-[#083F92] hover:bg-[#083F92]/90 rounded-[24px] flex justify-center items-center mt-[12px] disabled:opacity-50 shadow-[0px_4px_4px_rgba(61, 55, 117, 0.25)] gap-2"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin text-white" />}
          <span className="font-semibold text-[14px] leading-[19px] text-center capitalize text-white">
            {isPending ? 'Setting Password...' : 'Set New Password'}
          </span>
        </Button>
      </fieldset>
        </form>

      {/* Success Dialog */}
      <Dialog 
        open={showSuccessDialog} 
        onOpenChange={(open) => {
          setShowSuccessDialog(open);
          if (!open) {
            router.push('/login');
          }
        }}
      >
        <DialogContent showCloseButton={false} className="w-[515px]! max-w-[515px]! h-[460px] bg-white rounded-[12px] flex flex-col items-center justify-center p-0 gap-[18px] border-none shadow-2xl">
          <div className="flex flex-col items-center gap-[22px] w-[428px]">
            <div className="flex flex-col items-center gap-[32px] w-full">
              {/* Circle with check */}
              <div className="w-[120px] h-[120px] rounded-full bg-[#083F92] flex items-center justify-center text-white relative">
                <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-[50px] h-[50px]">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              {/* Header texts */}
              <div className="flex flex-col items-center gap-[16px] w-full">
                <h2 className="text-[32px] leading-[43px] font-semibold text-[#181818] tracking-[-0.008em] capitalize text-center m-0">
                  Password Updated
                </h2>
                <p className="text-[18px] leading-[28px] font-normal text-[#565656] tracking-[-0.014em] text-center m-0">
                  Your Password has been updated successfully!
                </p>
              </div>
            </div>

            {/* Button */}
            <div className="w-[343px] h-[48px]">
              <Button
                onClick={() => {
                  setShowSuccessDialog(false);
                  router.push('/login');
                }}
                className="w-full h-full bg-[#083F92] hover:bg-[#083F92]/90 rounded-[24px] flex justify-center items-center shadow-[0px_4px_4px_rgba(61,55,117,0.25)] border-none"
              >
                <span className="font-semibold text-[14px] leading-[19px] text-center capitalize text-white">
                  Login
                </span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
