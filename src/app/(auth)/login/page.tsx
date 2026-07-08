import { LoginForm } from "@/features/auth/components/login-form";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="w-full flex flex-col items-center">
      {/* Logo */}
      <div className="mb-[32px] w-[255px] h-[130px] flex items-center justify-center relative">
        <Image
          src="/images/logo.webp"
          alt="WSCF Logo"
          width={255}
          height={130}
          className="w-full h-full object-contain object-center"
        />
        <div className="hidden font-bold text-2xl text-[#083F92] text-center">
          WSCF
          <div className="text-sm font-normal text-[#565656]">Growing Young Minds for the Future</div>
        </div>
      </div>

      <LoginForm />
    </div>
  );
}
