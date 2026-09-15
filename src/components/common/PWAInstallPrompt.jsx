import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Download,
  X,
  Sparkles,
  Share,
  PlusSquare,
  CheckCircle2,
  ShieldCheck,
  Zap,
  HardDrive
} from 'lucide-react';
import Modal from './Modal';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBottomBanner, setShowBottomBanner] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect Standalone mode (already installed)
    const isRunningStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    setIsStandalone(isRunningStandalone);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Capture native PWA install prompt
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isDismissed && !isRunningStandalone) {
        setShowBottomBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Listen to custom event from Navbar/Sidebar/Settings "Download App" buttons
    const handleOpenModal = () => {
      setIsModalOpen(true);
    };
    window.addEventListener('open-pwa-install', handleOpenModal);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('open-pwa-install', handleOpenModal);
    };
  }, [isDismissed]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBottomBanner(false);
        setIsModalOpen(false);
      }
      setDeferredPrompt(null);
    } else {
      // If native prompt is not yet ready or iOS, open instructions modal
      setIsModalOpen(true);
    }
  };

  return (
    <>
      {/* 1. Subtle Floating Bottom Banner (for first-time mobile visitors) */}
      {showBottomBanner && !isDismissed && !isStandalone && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in slide-in-from-bottom duration-300">
          <div className="p-4 rounded-3xl bg-slate-900/95 text-white border border-indigo-500/40 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-bold text-base shadow-md shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white flex items-center gap-1">
                  Install AttendX App <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                </h4>
                <p className="text-[11px] text-slate-400 truncate">
                  1-Tap install to home screen & offline routine
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleInstallClick}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all active:scale-95"
              >
                Install
              </button>
              <button
                onClick={() => {
                  setShowBottomBanner(false);
                  setIsDismissed(true);
                }}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Detailed Install Instructions Modal (When user clicks "Download App") */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Install AttendX Mobile App"
        description="Install directly onto your Android, iPhone, or PC with 0 storage consumption"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          
          {/* App Preview Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-950 border border-slate-800 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-600/30 shrink-0">
              A
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>AttendX Student App</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                  PWA Ready
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Fast, offline routine, safe bunk tracker & zero ads.
              </p>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <Zap className="w-4 h-4 mx-auto text-amber-400 mb-1" />
              <p className="text-[11px] font-bold text-white">Instant Launch</p>
              <p className="text-[9px] text-slate-400">No PlayStore delay</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <HardDrive className="w-4 h-4 mx-auto text-emerald-400 mb-1" />
              <p className="text-[11px] font-bold text-white">100% Offline</p>
              <p className="text-[9px] text-slate-400">Works without net</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <ShieldCheck className="w-4 h-4 mx-auto text-indigo-400 mb-1" />
              <p className="text-[11px] font-bold text-white">Private</p>
              <p className="text-[9px] text-slate-400">Browser saved</p>
            </div>
          </div>

          {/* Already Installed Notice */}
          {isStandalone ? (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-emerald-300">
                  App is Already Installed!
                </h4>
                <p className="text-[11px] text-emerald-200/80">
                  You are currently using AttendX as a standalone installed application.
                </p>
              </div>
            </div>
          ) : deferredPrompt ? (
            /* 1-Click Native Install Button (Chrome / Edge / Android) */
            <div className="space-y-2 pt-2">
              <button
                onClick={handleInstallClick}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-102 active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Install AttendX Now (1-Tap)</span>
              </button>
              <p className="text-center text-[11px] text-slate-400">
                Will add AttendX directly to your home screen or desktop.
              </p>
            </div>
          ) : isIOS ? (
            /* iOS Safari Step-by-Step Instructions */
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-2.5">
              <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4" />
                How to install on iPhone / iPad (Safari):
              </h4>
              <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside">
                <li className="leading-relaxed">
                  Open this link in <strong className="text-white">Safari</strong>.
                </li>
                <li className="leading-relaxed flex items-center gap-1.5">
                  Tap the <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800 text-white font-mono text-[11px] border border-slate-700"><Share className="w-3.5 h-3.5 text-indigo-400" /> Share</span> button at the bottom of the screen.
                </li>
                <li className="leading-relaxed flex items-center gap-1.5">
                  Scroll down and tap <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800 text-white font-mono text-[11px] border border-slate-700"><PlusSquare className="w-3.5 h-3.5 text-indigo-400" /> Add to Home Screen</span>.
                </li>
              </ol>
            </div>
          ) : (
            /* General Browser / Android Instructions */
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-2.5">
              <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Download className="w-4 h-4 text-indigo-400" />
                How to install on Android / Chrome:
              </h4>
              <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside">
                <li>Tap the <strong>three dots (⋮)</strong> menu in Chrome browser.</li>
                <li>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                <li>AttendX icon will appear on your phone apps list!</li>
              </ol>
            </div>
          )}

        </div>
      </Modal>
    </>
  );
}
