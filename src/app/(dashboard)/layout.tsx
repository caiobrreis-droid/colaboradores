'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { MobileNav } from '@/components/layout/mobile-nav';
import { SplashScreen } from '@/components/layout/splash-screen';
import { useAuth } from '@/hooks/use-auth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading: isLoading } = useAuth();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Check auth
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (!mounted || isLoading || !user) {
    return <SplashScreen show={true} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <MobileNav
          open={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
        />

        <div className="flex flex-1 flex-col overflow-hidden relative">
          <Header onMenuToggle={() => setMobileNavOpen(true)} />

          <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
    </div>
  );
}
