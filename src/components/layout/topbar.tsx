'use client';

import { UserCircle, Menu } from 'lucide-react';

export function Topbar() {
  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-6 shrink-0">
      <button className="lg:hidden p-2 -ml-2 rounded-md hover:bg-muted">
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <UserCircle className="h-6 w-6" />
          <span className="text-sm font-medium">Admin User</span>
        </button>
      </div>
    </header>
  );
}
