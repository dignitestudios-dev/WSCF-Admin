'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || 'leo@admin.com';
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '']);
  const [isPending, setIsPending] = useState(false);
  const inputRefs = useRef<HTMLInputElement[]>([]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only accept numeric inputs
    if (value !== '' && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    // Keep only the last character entered
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // If a digit was entered, move to the next input
    if (value !== '' && index < 4 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Move to previous input on Backspace if current is empty
    if (e.key === 'Backspace') {
      if (otp[index] === '' && index > 0 && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (!/^\d{5}$/.test(pastedData)) {
      toast.error('Please paste a valid 5-digit code.');
      return;
    }

    const newOtp = pastedData.split('');
    setOtp(newOtp);

    // Focus last input
    if (inputRefs.current[4]) {
      inputRefs.current[4].focus();
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    
    if (code.length < 5) {
      toast.error('Please enter all 5 digits of the verification code.');
      return;
    }

    setIsPending(true);
    // Simulate API verification
    setTimeout(() => {
      setIsPending(false);
      if (code === '52000') { // Mock success code based on the Figma sample values
        toast.success('OTP verified successfully!');
        router.push('/reset-password');
      } else {
        toast.error('Invalid verification code. Please try again.');
      }
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

      {/* Header Password Icon */}
      <div className=" rounded-full  flex items-center justify-center overflow-hidden">
        <Image 
          src="/images/verify-otp.webp"
          alt="Verify OTP Icon"
          width={150}
          height={150}
          className="object-contain"
        />
      </div>

      {/* Title Header */}
      <div className="flex flex-col justify-center items-center gap-[12px] w-[421px]">
        <h1 className="w-full h-[49px] font-semibold text-[36px] leading-[49px] text-center tracking-[-0.008em] capitalize text-[#083F92] m-0">
          Verify OTP
        </h1>
        <p className="w-full h-[22px] font-normal text-[16px] leading-[22px] text-center tracking-[-0.014em] text-[#565656] m-0">
          Code has been sent to <span className="font-medium text-[#181818]">{email}</span>
        </p>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="flex flex-col items-center gap-[26px] w-full max-w-[421px]">
        <div className="flex flex-col items-center gap-[26px] w-full">
          
          {/* OTP inputs container */}
          <div className="flex justify-center gap-[11px] w-full max-w-[284px] h-[49px]">
            {otp.map((val, idx) => (
              <div key={idx} className="relative w-[48px] h-[49px]">
                {/* Mask layer to show input or grey dot */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center font-medium text-[16px] text-[#181818]">
                  {val ? val : <div className="w-[12px] h-[12px] rounded-full bg-[#D3D3D3]" />}
                </div>
                <input
                  ref={(el) => { inputRefs.current[idx] = el!; }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={val}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={idx === 0 ? handlePaste : undefined}
                  maxLength={1}
                  className="w-full h-full bg-white border border-[#3D3775] rounded-[24px] text-center text-transparent caret-transparent focus:outline-none focus:border-[#083F92] transition-colors focus:ring-1 focus:ring-[#083F92] selection:bg-transparent"
                />
              </div>
            ))}
          </div>

          {/* Action buttons & links */}
          <div className="flex flex-col items-center gap-[12px] w-full max-w-[343px] mt-[12px]">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-[48px] bg-[#083F92] hover:bg-[#083F92]/90 rounded-[24px] flex justify-center items-center disabled:opacity-50 shadow-[0px_4px_4px_rgba(61,55,117,0.25)]"
            >
              <span className="font-semibold text-[14px] leading-[19px] text-center capitalize text-white">
                {isPending ? 'Verifying...' : 'Verify'}
              </span>
            </Button>

            <p className="w-full h-[22px] font-normal text-[16px] leading-[22px] text-center tracking-[0.01em] text-[#565656] m-0">
              Didn't receive the code yet? <span className="font-semibold text-[#083F92] cursor-pointer hover:underline">Resend</span>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
