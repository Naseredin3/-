import React from 'react';
import {
  Sparkles,
  Layers,
  Cloud,
  ShieldCheck,
  Cpu,
  Wifi,
  WifiOff,
  Lock,
  Globe,
  Radio,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'studio' | 'library' | 'sync' | 'security' | 'offline';
  setActiveTab: (tab: 'studio' | 'library' | 'sync' | 'security' | 'offline') => void;
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: number | null;
  e2eeEnabled: boolean;
  libraryCount: number;
  lang: 'fa' | 'en';
  setLang: (lang: 'fa' | 'en') => void;
  onOpenHelp: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isOnline,
  isSyncing,
  lastSyncTime,
  e2eeEnabled,
  libraryCount,
  lang,
  setLang,
  onOpenHelp,
}) => {
  const isFa = lang === 'fa';

  const navItems = [
    {
      id: 'studio' as const,
      label: isFa ? 'استودیو هوش مصنوعی' : 'AI Studio',
      icon: Sparkles,
      badge: isFa ? 'همه مدل‌ها' : 'All Models',
    },
    {
      id: 'library' as const,
      label: isFa ? 'گالری و خروجی‌ها' : 'Outputs & Library',
      icon: Layers,
      count: libraryCount,
    },
    {
      id: 'sync' as const,
      label: isFa ? 'همگام‌سازی ابری' : 'Cloud Sync',
      icon: Cloud,
      pulse: isSyncing,
    },
    {
      id: 'security' as const,
      label: isFa ? 'امنیت و والت' : 'Security & Vault',
      icon: ShieldCheck,
      secure: e2eeEnabled,
    },
    {
      id: 'offline' as const,
      label: isFa ? 'ابزارهای آفلاین' : 'Offline Lab',
      icon: Cpu,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 shadow-lg shadow-indigo-500/25">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  OmniAI
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Studio 2.5
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                {isFa ? 'تولید نامحدود متن، تصویر، ویدیو و صدا' : 'Ultimate Multimodal Generation Studio'}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800/80">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>

                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-white/20 text-white font-medium">
                      {item.badge}
                    </span>
                  )}

                  {typeof item.count === 'number' && item.count > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-bold border border-slate-700">
                      {item.count}
                    </span>
                  )}

                  {item.pulse && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute -top-1 -right-1" />
                  )}
                  {item.secure && (
                    <Lock className="w-3 h-3 text-emerald-400" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Status & Options Right Bar */}
          <div className="flex items-center gap-2.5">
            {/* Online / Offline status badge */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                isOnline
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              }`}
              title={isOnline ? 'متصل به شبکه' : 'حالت آفلاین فعال'}
            >
              {isOnline ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="hidden sm:inline">{isFa ? 'آنلاین' : 'Online'}</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-amber-400" />
                  <span className="hidden sm:inline">{isFa ? 'آفلاین' : 'Offline'}</span>
                </>
              )}
            </div>

            {/* Cloud Sync Status */}
            <button
              onClick={() => setActiveTab('sync')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700 transition"
              title={isFa ? 'مدیریت همگام‌سازی ابری' : 'Manage Cloud Sync'}
            >
              <Cloud className={`w-3.5 h-3.5 ${isSyncing ? 'text-amber-400 animate-spin' : 'text-indigo-400'}`} />
              <span className="hidden lg:inline text-[10px]">
                {isSyncing
                  ? isFa ? 'در حال همگام‌سازی...' : 'Syncing...'
                  : isFa ? 'همگام‌سازی ابری' : 'Cloud Sync'}
              </span>
            </button>

            {/* Language toggle */}
            <button
              onClick={() => setLang(isFa ? 'en' : 'fa')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition"
            >
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>{isFa ? 'EN' : 'فا'}</span>
            </button>

            {/* Help / Tour Guide button */}
            <button
              onClick={onOpenHelp}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition"
              title={isFa ? 'راهنمای استفاده' : 'Quick Guide'}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isFa ? 'راهنما' : 'Help'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1 border-t border-slate-800/80 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 bg-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {typeof item.count === 'number' && item.count > 0 && (
                  <span className="text-[10px] px-1.5 rounded-full bg-slate-800 text-slate-200">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
