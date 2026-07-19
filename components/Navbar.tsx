'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage, LANGUAGES } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getNotifications, markNotificationsAsRead } from '@/services/firestore';
import { Notification } from '@/types';
import { 
  Sun, 
  Moon, 
  Bell, 
  Globe, 
  LogOut, 
  User as UserIcon, 
  Settings as SettingsIcon, 
  LayoutDashboard, 
  PlusCircle, 
  Menu, 
  X,
  Award
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t, dir } = useLanguage();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [notifyMenuOpen, setNotifyMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const unreadCount = notifications.filter(n => !n.read).length;
  const [scrollProgress, setScrollProgress] = useState(0);

  const isLandingPage = pathname === '/';

  // Load user notifications
  useEffect(() => {
    if (user?.uid) {
      getNotifications(user.uid).then(setNotifications);
    }
  }, [user?.uid]);

  // Track page scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMarkAllRead = async () => {
    if (user?.uid) {
      await markNotificationsAsRead(user.uid);
      const updated = notifications.map(n => ({ ...n, read: true }));
      setNotifications(updated);
      setNotifyMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-card-border backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2.5 font-heading font-extrabold text-xl tracking-tight">
          <div className="relative flex h-9 w-9 overflow-hidden rounded-xl border border-card-border shadow-sm">
            <img 
              src="/logo.jpg" 
              alt="CityPulse AI Logo" 
              className="h-full w-full object-cover" 
            />
          </div>
          <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            CityPulse <span className="text-primary font-black">AI</span>
          </span>
        </Link>

        {/* DESKTOP NAV LINKS */}
        {isLandingPage ? (
          <nav className="hidden md:flex gap-6 text-sm font-semibold text-foreground/80">
            <a href="#features" className="hover:text-primary hover:scale-[1.02] transition-all">{t('appName') !== 'CityPulse AI' ? 'सुविधाएँ' : 'Features'}</a>
            <a href="#workflow" className="hover:text-primary hover:scale-[1.02] transition-all">{t('appName') !== 'CityPulse AI' ? 'कार्यप्रणाली' : 'How It Works'}</a>
            <a href="#rewards" className="hover:text-primary hover:scale-[1.02] transition-all">{t('appName') !== 'CityPulse AI' ? 'पुरस्कार' : 'Rewards'}</a>
            <a href="#faq" className="hover:text-primary hover:scale-[1.02] transition-all">{t('appName') !== 'CityPulse AI' ? 'प्रश्न' : 'FAQ'}</a>
          </nav>
        ) : (
          <nav className="hidden md:flex gap-6 text-sm font-semibold text-foreground/80">
            <Link href="/dashboard" className={`hover:text-primary hover:scale-[1.02] transition-all ${pathname === '/dashboard' ? 'text-primary font-bold' : ''}`}>
              {t('dashboard')}
            </Link>
            <Link href="/report" className={`hover:text-primary hover:scale-[1.02] transition-all ${pathname === '/report' ? 'text-primary font-bold' : ''}`}>
              {t('reportIssue')}
            </Link>
            <Link href="/community" className={`hover:text-primary hover:scale-[1.02] transition-all ${pathname === '/community' ? 'text-primary font-bold' : ''}`}>
              {t('community')}
            </Link>
            <Link href="/rewards" className={`hover:text-primary hover:scale-[1.02] transition-all ${pathname === '/rewards' ? 'text-primary font-bold' : ''}`}>
              {t('rewards')}
            </Link>
            <Link href="/about" className={`hover:text-primary hover:scale-[1.02] transition-all ${pathname === '/about' ? 'text-primary font-bold' : ''}`}>
              {t('about')}
            </Link>
          </nav>
        )}

        {/* ACTIONS */}
        <div className="flex items-center gap-4">
          
          {/* LANGUAGE PICKER */}
          <div className="relative">
            <button 
              onClick={() => {
                setLangMenuOpen(!langMenuOpen);
                setNotifyMenuOpen(false);
                setProfileMenuOpen(false);
              }}
              className="p-2 rounded-lg hover:bg-input text-muted hover:text-foreground transition-colors cursor-pointer"
              aria-label="Select language"
            >
              <Globe className="h-5 w-5" />
            </button>
            
            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-card-border popover-card p-2 z-50 grid grid-cols-2 gap-1 animate-in fade-in slide-in-from-top-2 duration-200">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setLangMenuOpen(false);
                    }}
                    className={`flex flex-col items-start px-3 py-1.5 rounded-lg text-left text-xs hover:bg-input transition-colors cursor-pointer ${
                      language === lang.code ? 'bg-primary/10 text-primary font-bold' : 'text-foreground'
                    }`}
                  >
                    <span className="font-semibold">{lang.nativeName}</span>
                    <span className="text-[10px] opacity-75">{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* THEME TOGGLE */}
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-input text-muted hover:text-foreground transition-colors cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* NOTIFICATIONS DROPDOWN */}
          {user && (
            <div className="relative">
              <button 
                onClick={() => {
                  setNotifyMenuOpen(!notifyMenuOpen);
                  setLangMenuOpen(false);
                  setProfileMenuOpen(false);
                }}
                className="relative p-2 rounded-lg hover:bg-input text-muted hover:text-foreground transition-colors cursor-pointer"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifyMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl border border-card-border popover-card z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between border-b border-card-border pb-2 mb-2">
                    <span className="font-semibold text-sm">{t('recentActivity')}</span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleMarkAllRead}
                        className="text-xs text-primary font-medium hover:underline cursor-pointer"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-muted">No new notifications</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`p-2 rounded-lg text-xs leading-relaxed ${n.read ? 'opacity-70 bg-transparent' : 'bg-primary/5 font-medium border-l-2 border-primary'}`}>
                          <div className="font-semibold text-foreground flex justify-between items-start">
                            <span>{n.title}</span>
                            <span className="text-[10px] text-muted font-normal">{new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                          <p className="text-muted mt-0.5">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* USER PROFILE DROPDOWN */}
          {user ? (
            <div className="relative">
              <button 
                onClick={() => {
                  setProfileMenuOpen(!profileMenuOpen);
                  setLangMenuOpen(false);
                  setNotifyMenuOpen(false);
                }}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-input transition-colors cursor-pointer border border-card-border"
              >
                <img 
                  src={user.photo} 
                  alt={user.name} 
                  className="h-7 w-7 rounded-full object-cover"
                />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-card-border popover-card p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-3 py-2 border-b border-card-border">
                    <div className="font-semibold text-sm truncate">{user.name}</div>
                    <div className="text-xs text-muted truncate">{user.email}</div>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-accent font-semibold bg-accent/10 px-2 py-0.5 rounded-full w-max">
                      <Award className="h-3 w-3" />
                      <span>Points: {user.rewardPoints}</span>
                    </div>
                  </div>
                  <div className="p-1 space-y-1">
                    <Link 
                      href="/dashboard" 
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-foreground hover:bg-input transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4 text-muted" />
                      <span>{t('dashboard')}</span>
                    </Link>
                    <Link 
                      href="/profile" 
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-foreground hover:bg-input transition-colors"
                    >
                      <UserIcon className="h-4 w-4 text-muted" />
                      <span>{t('profile')}</span>
                    </Link>
                    <Link 
                      href="/settings" 
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-foreground hover:bg-input transition-colors"
                    >
                      <SettingsIcon className="h-4 w-4 text-muted" />
                      <span>{t('settings')}</span>
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-500/10 transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>{t('logout')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link 
              href="/auth" 
              className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-all shadow-sm shadow-primary/20"
            >
              {t('login')}
            </Link>
          )}

          {/* MOBILE MENU TRIGGER */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-input text-muted hover:text-foreground md:hidden transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

        </div>
      </div>

      {/* MOBILE NAV MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-t border-card-border p-4 space-y-3 z-50">
          {isLandingPage ? (
            <div className="flex flex-col gap-2">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-input text-sm font-medium">Features</a>
              <a href="#workflow" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-input text-sm font-medium">How It Works</a>
              <a href="#rewards" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-input text-sm font-medium">Rewards</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-input text-sm font-medium">FAQ</a>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-input text-sm font-medium">
                {t('dashboard')}
              </Link>
              <Link href="/report" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-input text-sm font-medium">
                {t('reportIssue')}
              </Link>
              <Link href="/community" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-input text-sm font-medium">
                {t('community')}
              </Link>
              <Link href="/rewards" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-input text-sm font-medium">
                {t('rewards')}
              </Link>
              <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-input text-sm font-medium">
                {t('about')}
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Dynamic Scroll Progress Indicator */}
      <div 
        className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-primary via-indigo-500 to-accent transition-all duration-100 ease-out z-[60]"
        style={{ width: `${scrollProgress}%` }}
      />
    </header>
  );
}
