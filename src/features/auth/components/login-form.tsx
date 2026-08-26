'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '../schema/login.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useLogin } from '../hooks/use-login';

import Link from 'next/link';

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: login, isPending, error: loginError } = useLogin();
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormData) => {
    login(data);
  };

  return (
    <div className="w-[421px] flex flex-col items-center gap-[32px]">

      {/* Header */}
      <div className="flex flex-col justify-center items-center gap-[12px] w-[421px]">
        <h1 className="w-[210px] h-[49px] font-semibold text-[36px] leading-[49px] text-center tracking-[-0.008em] capitalize text-nowrap text-[#083F92] m-0">
          Admin Login
        </h1>
        <p className="w-[459px] h-[44px] font-normal text-[16px] leading-[22px] text-center tracking-[-0.014em] text-[#565656] m-0 max-w-[100vw] px-4">
          Sign in to access the admin dashboard and manage system settings, users, and activities securely.
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

          {/* Email Input */}
          <div className="flex flex-col items-start gap-[8px] w-full">
            <label htmlFor="email" className="font-medium text-[14px] leading-[19px] capitalize text-[#181818]">
              Email address
            </label>
            <div className="relative w-full h-[44px]">
              <Input
                id="email"
                placeholder="joe@example.com"
                type="email"
                maxLength={254}
                className="w-full h-full bg-white border border-[#3D3775] rounded-[24px] px-[16px] font-normal text-[14px] text-[#181818] placeholder:text-[#b7b2b2]"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-[0.8rem] font-medium text-destructive mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div className="flex flex-col items-start gap-[8px] w-full relative">
            <label htmlFor="password" className="font-medium text-[14px] leading-[19px] capitalize text-[#181818]">
              Password
            </label>
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
              {errors.password && (
                <p className="text-[0.8rem] font-medium text-destructive mt-1">
                  {errors.password.message}
                </p>
              )}

              <div className="w-full flex justify-end mt-[4px]">
                <Link href="/forgot-password" className="font-semibold text-[12px] leading-[16px] text-right capitalize text-[#083F92] hover:underline">
                  forgot password?
                </Link>
              </div>
            </div>
          </div>

          {/* Login Button */}
          <div className="flex flex-col gap-2 w-full max-w-[343px] mt-[12px]">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-[48px] bg-[#083F92] hover:bg-[#083F92]/90 rounded-[100px] flex justify-center items-center disabled:opacity-50 gap-2"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin text-white" />}
              <span className="font-semibold text-[14px] leading-[19px] text-center capitalize text-white">
                {isPending ? 'Logging In...' : 'Login'}
              </span>
            </Button>
          </div>
        </div>
      </fieldset>
        </form>
    </div>
  );
}
