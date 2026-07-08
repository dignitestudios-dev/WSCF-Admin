'use client';

import { ReactNode } from 'react';
import { Sidebar } from './sidebar';

export function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-screen h-screen bg-white p-4 gap-4 overflow-hidden font-sans select-none">
      <Sidebar />
      <main 
        className="flex-grow flex-1 overflow-auto no-scrollbar rounded-[24px] relative shadow-md"
        style={{
          background: 'linear-gradient(0deg, rgba(61, 55, 117, 0.2) 0%, rgba(61, 55, 117, 0) 100%), #F7F6FF'
        }}
      >
        <div className="flex flex-col gap-6 p-8 min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
