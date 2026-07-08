import { VerifyOtpForm } from "@/features/auth/components/verify-otp-form";
import { Suspense } from "react";

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="text-[#083F92] font-semibold text-center py-4">Loading...</div>}>
      <VerifyOtpForm />
    </Suspense>
  );
}
