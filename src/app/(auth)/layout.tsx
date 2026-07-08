import { PageTransition } from "@/components/animations/page-transition";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageTransition>
      <div className="flex min-h-screen w-full font-general-sans relative" style={{
        background: 'linear-gradient(0deg, rgba(61, 55, 117, 0.2) 0%, rgba(61, 55, 117, 0) 100%), #F7F6FF'
      }}>
        <div className="flex w-full max-w-screen-2xl mx-auto min-h-screen items-center justify-between p-8">
          
          {/* Left Side: Image (Shared) */}
          <div className="hidden lg:flex w-1/2 justify-center items-center h-full xl:justify-start">
            <div className="relative w-[682px] h-full rounded-[20px] overflow-hidden bg-[#EAEAEA] shadow-xl">
              <Image 
                src="/images/admin.webp"
                alt="Admin Background"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Right Side: Form Content */}
          <div className="w-full lg:w-1/2 flex justify-center items-center relative">
            {children}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
