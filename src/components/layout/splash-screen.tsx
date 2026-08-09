'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';

interface SplashScreenProps {
  show: boolean;
}

export function SplashScreen({ show }: SplashScreenProps) {
  if (!show) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#001233] transition-opacity duration-500',
        show ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      <div className="relative flex flex-col items-center animate-in fade-in zoom-in duration-700">
        <div className="relative mb-6">
          {/* Subtle pulse ring */}
          <div className="absolute inset-0 rounded-full bg-[#0057FF]/30 blur-2xl animate-pulse" />

          <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0057FF] to-[#00D4FF] shadow-2xl">
            <span className="text-5xl font-extrabold text-white">V</span>
          </div>
        </div>

        <h1 className="text-3xl font-black tracking-widest text-white mb-2">
          {APP_NAME || 'VESSEL'}
        </h1>

        <div className="flex items-center gap-2 mt-4 text-[#00D4FF] text-sm font-medium">
          <span>Carregando sistema</span>
          <span className="flex gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms' }} />
          </span>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0057FF]/10 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] translate-x-1/2 translate-y-1/2 rounded-full bg-[#00D4FF]/10 blur-[100px]" />
      </div>
    </div>
  );
}
