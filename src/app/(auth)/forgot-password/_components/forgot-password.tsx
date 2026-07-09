import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export default function ForgotPassword() {
  return (
    <div className="w-full flex flex-col items-center">
      {/* Logo */}
      {/* <div className="mb-[32px] w-[255px] h-[130px] flex items-center justify-center relative">
        <Image
          src="/images/logo.webp"
          alt="WSCF Logo"
          width={255}
          height={130}
          className="w-full h-full object-contain object-center"
          priority
        />
      </div> */}

      <ForgotPasswordForm />
    </div>
  );
}
