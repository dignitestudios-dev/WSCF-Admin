'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLogout } from '@/features/auth/hooks/use-logout';
import {
  LayoutDashboard,
  Users,
  Trophy,
  CreditCard,
  Upload,
  Bell,
  FolderLock,
  UserPlus,
  LogOut,
  Loader2,
  X,
  School,
  TicketPercent
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const featuresNav = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Schools', href: '/schools', icon: School },
    { name: 'Tournaments', href: '/tournaments', icon: Trophy },
    { name: 'Teams', href: '/teams', icon: UserPlus },
    // Current Enrolled Users is hidden from navigation but the route and its
    // component are intentionally kept — reachable directly at
    // /current-enrolled-users if it is ever needed again.
    { name: 'Membership', href: '/membership', icon: CreditCard },
    { name: 'Coupons', href: '/coupons', icon: TicketPercent },
    { name: 'Result Uploader', href: '/result-uploader', icon: Upload },
  ];

  const generalNav = [
    { name: 'Push Notifications', href: '/notifications', icon: Bell },
    { name: 'Form Management', href: '/forms', icon: FolderLock },
    { name: 'Logout', href: '/logout', icon: LogOut },
  ];

  const { mutate: logout, isPending } = useLogout();

  const handleLogout = () => {
    logout();
  };

  return (
    <aside className="w-[360px] bg-[#083F92] h-screen rounded-r-[24px] rounded-l-none lg:h-full lg:rounded-[24px] flex flex-col shrink-0 relative overflow-hidden shadow-xl text-white select-none">

      {/* Mobile Close Button */}
      {onClose && (
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 lg:hidden text-white cursor-pointer transition-colors outline-none"
          aria-label="Close sidebar"
        >
          <X className="w-6 h-6" />
        </button>
      )}

      {/* Logo Container at Top Center */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[177px] h-[100px] bg-white rounded-b-[24px] flex items-center justify-center p-2 z-10 shadow-sm">
        <div className="relative w-[157px] h-[80px]">
          <Image
            src="/images/logo.webp"
            alt="WSCF Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Navigation Links Container */}
      <div className="flex-1 mt-[140px] mb-6 px-8 z-10 flex flex-col gap-8 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">

        {/* Features Section */}
        <div className="flex flex-col gap-4">
          <span className="font-poppins font-medium text-[16px] leading-[24px] tracking-[-0.019em] text-white/70">
            Features
          </span>
          <nav className="flex flex-col gap-5">
            {featuresNav.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => onClose?.()}
                  className={`flex items-center gap-3 w-full h-[27px] transition-all duration-200 group relative ${isActive
                      ? 'font-semibold text-white'
                      : 'font-light text-white/80 hover:text-white'
                    }`}
                >
                  {/* Left edge active indicator */}
                  {isActive && (
                    <div className="absolute left-[-52px] w-7 h-7 bg-white rounded-r-full" />
                  )}
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="font-poppins text-[18px] leading-[27px] tracking-[-0.019em]">
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* General Section */}
        <div className="flex flex-col gap-4">
          <span className="font-poppins font-medium text-[16px] leading-[24px] tracking-[-0.019em] text-white/70">
            General
          </span>
          <nav className="flex flex-col gap-5">
            {generalNav.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              if (item.name === 'Logout') {
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      setIsLogoutOpen(true);
                    }}
                    className="flex items-center gap-3 w-full h-[27px] text-left transition-all duration-200 group relative font-light text-white/80 hover:text-white bg-transparent border-0 p-0 cursor-pointer outline-none"
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="font-poppins text-[18px] leading-[27px] tracking-[-0.019em]">
                      {item.name}
                    </span>
                  </button>
                );
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => onClose?.()}
                  className={`flex items-center gap-3 w-full h-[27px] transition-all duration-200 group relative ${isActive
                      ? 'font-semibold text-white'
                      : 'font-light text-white/80 hover:text-white'
                    }`}
                >
                  {isActive && (
                    <div className="absolute left-[-52px] w-7 h-7 bg-white rounded-r-full" />
                  )}
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="font-poppins text-[18px] leading-[27px] tracking-[-0.019em]">
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Chess Illustration at the Bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[373px] h-[394px] pointer-events-none mix-blend-screen select-none">
        <Image
          src="/images/sidebar.webp"
          alt="Chess Pieces Background"
          fill
          className="object-contain object-bottom"
        />
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={isLogoutOpen} onOpenChange={(open) => { if (!isPending) setIsLogoutOpen(open); }}>
        <DialogContent 
          showCloseButton={false} 
          className="max-w-[515px]! w-full min-h-[422px] p-0 rounded-[12px] bg-white border-none flex flex-col justify-center items-center select-none ring-0 shadow-2xl"
        >
          <div className="flex flex-col items-center justify-center p-0 gap-[32px] w-[428px] h-[303px]">
            
            {/* Blue circle icon */}
            <div className="w-[120px] h-[120px] bg-[#083F92] rounded-full flex items-center justify-center relative select-none shadow-sm hover:scale-105 transition-transform duration-300">
              <LogOut className="h-[48px] w-[48px] text-white" />
            </div>

            {/* Logout texts */}
            <div className="flex flex-col items-center p-0 gap-2 w-[428px]">
              <DialogTitle className="font-general-sans font-semibold text-[32px] leading-[43px] text-center tracking-[-0.008em] capitalize text-[#181818] m-0">
                Logout!
              </DialogTitle>
              <DialogDescription className="font-general-sans font-normal text-[18px] leading-[28px] text-center tracking-[-0.014em] text-[#565656] m-0">
                Are you sure you want to logout?
              </DialogDescription>
            </div>

            {/* Button row */}
            <div className="flex flex-row items-center justify-center p-0 gap-[24px] w-[428px] h-[48px]">
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                disabled={isPending}
                className="w-[202px] h-[48px] bg-[#083F92] text-white rounded-[24px] font-general-sans font-semibold text-[14px] leading-[19px] text-center capitalize border-0 shadow-[0px_4px_4px_rgba(61,55,117,0.25)] hover:bg-[#083F92]/90 hover:shadow-[0px_6px_8px_rgba(61,55,117,0.35)] transition-all cursor-pointer outline-none disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isPending && <Loader2 className="h-4 w-4 animate-spin text-white" />}
                <span>{isPending ? 'Logging out...' : 'Logout'}</span>
              </button>

              {/* Cancel Button */}
              <button
                onClick={() => setIsLogoutOpen(false)}
                disabled={isPending}
                className="w-[202px] h-[48px] bg-white text-black border border-black rounded-[24px] font-general-sans font-semibold text-[14px] leading-[19px] text-center capitalize shadow-[0px_4px_4px_rgba(61,55,117,0.25)] hover:bg-neutral-50 hover:shadow-[0px_6px_8px_rgba(61,55,117,0.3)] transition-all cursor-pointer outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>

          </div>
        </DialogContent>
      </Dialog>
    </aside>
  );
}

