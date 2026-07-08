'use client';

import {
  LayoutDashboard,
  Users,
  Trophy,
  UserCheck,
  CreditCard,
  Upload,
  Bell,
  FolderLock,
  UserPlus,
  LogOut
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export function Sidebar() {
  const pathname = usePathname();

  const featuresNav = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Tournaments', href: '/tournaments', icon: Trophy },
    { name: 'Current Enrolled Users', href: '/current-enrolled-users', icon: UserCheck },
    { name: 'Membership', href: '/membership', icon: CreditCard },
    { name: 'Result Uploader', href: '/result-uploader', icon: Upload },
  ];

  const generalNav = [
    { name: 'Push Notifications', href: '/notifications', icon: Bell },
    { name: 'Form Management', href: '/forms', icon: FolderLock },
    { name: 'Create Team', href: '/create-team', icon: UserPlus },
    { name: 'Logout', href: '/logout', icon: LogOut },
  ];

  return (
    <aside className="w-[360px]  bg-[#083F92] rounded-[24px] flex flex-col shrink-0 relative overflow-hidden shadow-xl text-white select-none">

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
      <div className="flex-1 mt-[140px] px-8 z-10 flex flex-col gap-8">

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
              return (
                <Link
                  key={item.name}
                  href={item.href}
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
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[373px] h-[394px] pointer-events-none  mix-blend-screen select-none">
        <Image
          src="/images/sidebar.webp"
          alt="Chess Pieces Background"
          fill
          className="object-contain object-bottom"
        />
      </div>
    </aside>
  );
}
