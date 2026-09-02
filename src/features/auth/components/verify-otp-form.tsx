'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { toast } from '@/lib/toast';
import { useResendOtp } from '../hooks/use-resend-otp';
import { useVerifyOtp } from '../hooks/use-verify-otp';

export function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || 'leo@admin.com';
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [hasError, setHasError] = useState(false);
  // Kept set once a code is accepted. The redirect is not instant, and the
  // fieldset would otherwise unlock the moment the request finished — letting
  // a second code be submitted against one the server has already spent.
  const [isVerified, setIsVerified] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [timer, setTimer] = useState(0);
  const inputRefs = useRef<HTMLInputElement[]>([]);

  const { mutate: resendOtp, isPending: isResending } = useResendOtp();
  const { mutate: verifyOtp, isPending } = useVerifyOtp();

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Sync timer from localStorage on mount to prevent reset on refresh
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const expiresAt = window.localStorage.getItem('otp-timer-expires');
      if (expiresAt) {
        const remaining = Math.max(0, Math.ceil((Number(expiresAt) - Date.now()) / 1000));
        setTimer(remaining);
      } else {
        setTimer(0);
      }
    }
  }, []);

  // Timer countdown effect
  useEffect(() => {
    if (timer === 0) {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('otp-timer-expires');
      }
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleResend = () => {
    if (timer > 0 || isResending) return;
    resendOtp(
      { email, purpose: 'reset' },
      {
        onSuccess: () => {
          setTimer(60);
          setOtp(['', '', '', '', '', '']);
          setHasError(false);
          // A fresh code makes the form usable again after a successful verify.
          setIsVerified(false);
          if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
          }
        },
      }
    );
  };

  const handleChange = (index: number, value: string) => {
    setHasError(false);
    // Only accept numeric inputs
    if (value !== '' && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    // Keep only the last character entered
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // If a digit was entered, move to the next input
    if (value !== '' && index < 5 && inputRefs.current[index + 1]) {
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
    setHasError(false);
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().replace(/\D/g, '');
    if (pastedData.length < 6) {
      toast.error('Please paste a valid 6-digit code.');
      return;
    }

    const digits = pastedData.slice(0, 6).split('');
    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = digits[i] || '';
    }
    setOtp(newOtp);

    // Focus last input
    if (inputRefs.current[5]) {
      inputRefs.current[5].focus();
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');

    if (code.length < 6) {
      setHasError(true);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 400);
      return;
    }

    if (isPending || isVerified) return;

    verifyOtp(
      { email, otp: code },
      {
        onSuccess: () => setIsVerified(true),
        onError: () => {
          // Only a rejected code unlocks the form, so the user can correct it.

          setHasError(true);
          setIsShaking(true);
          setTimeout(() => setIsShaking(false), 400);
        },
      }
    );
  };

  return (
    <div className="w-[421px] flex flex-col items-center gap-[32px] relative">
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15%, 45%, 75% { transform: translateX(-6px); }
          30%, 60%, 90% { transform: translateX(6px); }
        }
        .shake-animation {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>

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
        {/* Locked while the request is in flight: disabling only the
            submit button leaves every field editable after the values
            have already been sent. `contents` keeps the fieldset out
            of the layout. */}
        <fieldset disabled={isPending || isVerified} className="contents">
        <div className="flex flex-col items-center gap-[26px] w-full">

          {/* OTP inputs container */}
          <div className={`flex justify-center gap-[11px] w-full max-w-[343px] h-[49px] ${isShaking ? 'shake-animation' : ''}`}>
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
                  onPaste={handlePaste}
                  maxLength={1}
                  className={`w-full h-full bg-white border rounded-[24px] text-center text-transparent caret-transparent focus:outline-none transition-colors selection:bg-transparent ${hasError
                      ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                      : 'border-[#3D3775] focus:border-[#083F92] focus:ring-1 focus:ring-[#083F92]'
                    }`}
                />
              </div>
            ))}
          </div>

          {/* Action buttons & links */}
          <div className="flex flex-col items-center gap-[12px] w-full max-w-[343px] mt-[12px]">
            <Button
              type="submit"
              disabled={isPending || isVerified}
              className="w-full h-[48px] bg-[#083F92] hover:bg-[#083F92]/90 rounded-[24px] flex justify-center items-center disabled:opacity-50 shadow-[0px_4px_4px_rgba(61,55,117,0.25)]"
            >
              <span className="font-semibold text-[14px] leading-[19px] text-center capitalize text-white">
                {isPending ? 'Verifying...' : isVerified ? 'Verified' : 'Verify'}
              </span>
            </Button>

            <p className="w-full h-[22px] text-nowrap font-normal text-[16px] leading-[22px] text-center tracking-[0.01em] text-[#565656] m-0">
              Didn't receive the code yet?{' '}
              {timer > 0 ? (
                <span className="font-semibold text-neutral-400 cursor-not-allowed">
                  Resend in {timer}s
                </span>
              ) : (
                <span
                  onClick={handleResend}
                  className={`font-semibold text-[#083F92] cursor-pointer hover:underline ${isResending ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  {isResending ? 'Resending...' : 'Resend'}
                </span>
              )}
            </p>
          </div>
        </div>
      </fieldset>
        </form>
    </div>
  );
}
