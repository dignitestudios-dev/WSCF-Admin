'use client';

import { ReactNode, useState } from 'react';
import { Sidebar } from './sidebar';
import { Menu } from 'lucide-react';
import { NotificationBell } from './notification-bell';
import Image from 'next/image';

export function AdminLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex w-screen h-screen bg-white p-2 sm:p-3 lg:p-4 gap-2 sm:gap-3 lg:gap-4 overflow-hidden font-sans select-none">
      
      {/* Sidebar - Desktop static, Mobile slide-over drawer */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-50 lg:static lg:z-auto lg:translate-x-0
          transition-transform duration-300 ease-in-out flex shrink-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Sidebar Backdrop Overlay on Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 lg:hidden cursor-pointer"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main 
        className="flex-grow flex-1 flex flex-col overflow-hidden rounded-t-[20px] rounded-b-[12px] sm:rounded-[24px] relative shadow-md"
        style={{
          background: 'linear-gradient(0deg, rgba(61, 55, 117, 0.2) 0%, rgba(61, 55, 117, 0) 100%), #F7F6FF'
        }}
      >
        {/* Mobile top navigation header (hidden on desktop) */}
        <div className="lg:hidden flex items-center justify-between px-4 sm:px-6 py-3 bg-white border-b border-[#083F92]/10 shrink-0">
          <button 
            type="button"
            onClick={() => setIsSidebarOpen(true)} 
            className="p-2 -ml-2 rounded-md hover:bg-[#083F92]/10 transition-colors cursor-pointer outline-none"
            aria-label="Open sidebar"
          >
            <Menu className="h-6 w-6 text-[#083F92]" />
          </button>
          
          <div className="relative w-[110px] h-[44px]">
            <Image 
              src="/images/logo.webp" 
              alt="WSCF Logo" 
              fill 
              className="object-contain" 
            />
          </div>
          
          <NotificationBell />
        </div>

        {/* Desktop header strip — the bell sits at the top right */}
        <div className="hidden lg:flex items-center justify-end px-8 pt-6 shrink-0">
          <NotificationBell />
        </div>

        {/* Dynamic page contents scrollable area */}
        <div className="flex-grow overflow-auto no-scrollbar p-4 sm:p-6 lg:px-8 lg:pt-4 lg:pb-8">
          <div className="flex flex-col gap-6 min-h-full">
            {children}
          </div>
        </div>

      </main>
    </div>
  );
}
