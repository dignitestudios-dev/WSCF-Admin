'use client';

import { ReactNode, useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export function OfflineProvider({ children }: { children: ReactNode }) {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Initial check
    setIsOffline(!navigator.onLine);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <>
      {isOffline && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md transition-all duration-300">
          <div className="flex flex-col items-center justify-center p-8 bg-card rounded-2xl border border-border shadow-2xl max-w-sm w-full mx-4 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-destructive/10 text-destructive mb-6">
              <WifiOff className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground mb-2">
              You are disconnected
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              It looks like you've lost your internet connection. Please check your network and try again.
            </p>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-destructive animate-pulse w-full" />
            </div>
          </div>
        </div>
      )}
      <div className={isOffline ? 'pointer-events-none select-none opacity-50 blur-[2px] transition-all duration-300' : 'transition-all duration-300'}>
        {children}
      </div>
    </>
  );
}
