import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import MobileBottomNav from './MobileBottomNav';
import QuickSearchModal from './QuickSearchModal';
import PWAInstallPrompt from '../common/PWAInstallPrompt';

export default function Layout({ currentPage, onNavigate, children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Sidebar Navigation (Desktop & Mobile Drawer) */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        isCollapsed={isCollapsed}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
      />

      {/* Main Content Shell */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        {/* Top Navbar */}
        <Navbar
          onToggleSidebar={() => {
            if (window.innerWidth >= 1024) {
              setIsCollapsed(!isCollapsed);
            } else {
              setIsOpenMobile(true);
            }
          }}
          onOpenSearch={() => setIsSearchOpen(true)}
          onNavigate={onNavigate}
        />

        {/* Dynamic Page Container with Aurora Background */}
        <main className="flex-1 overflow-y-auto aurora-bg p-3.5 sm:p-6 lg:p-8 pb-24 sm:pb-8">
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation (Phone Only) */}
      <MobileBottomNav currentPage={currentPage} onNavigate={onNavigate} />

      {/* Global Quick Search Modal (Ctrl+K) */}
      <QuickSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={onNavigate}
      />

      {/* PWA Mobile Installation Prompt */}
      <PWAInstallPrompt />
    </div>
  );
}
