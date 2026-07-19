'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage, LANGUAGES } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  Settings, 
  Sun, 
  Moon, 
  Globe, 
  Bell, 
  ShieldAlert, 
  LogOut, 
  Trash2,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  // Notification states
  const [notifyStatus, setNotifyStatus] = useState(true);
  const [notifyLikes, setNotifyLikes] = useState(true);
  const [notifySafety, setNotifySafety] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(false);

  const handleSaveSettings = () => {
    toast.success(language === 'hi' ? 'प्राथमिकताएं सफलतापूर्वक सहेजी गईं!' : 'Preferences saved successfully!');
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleDeleteAccount = () => {
    const confirm = window.confirm(language === 'hi' ? 'क्या आप वाकई अपना सिटीपल्स AI खाता स्थायी रूप से हटाना चाहते हैं? यह कार्रवाई अपरिवर्तनीय है।' : 'Are you sure you want to permanently delete your CityPulse AI account? This action is irreversible.');
    if (confirm) {
      toast.success(language === 'hi' ? 'मॉक खाता हटा दिया गया। लैंडिंग पृष्ठ पर पुनर्निर्देशित किया जा रहा है।' : 'Mock Account Deleted. Routing back to landing page.');
      logout().then(() => router.push('/'));
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* HEADER */}
      <div className="border-b border-card-border pb-5">
        <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-foreground flex items-center gap-2">
          <span className="animate-motion-text">{t('settings')}</span>
          <Settings className="h-6 w-6 text-muted" />
        </h1>
        <p className="text-xs text-muted-foreground mt-1">{t('settingsSubtitle')}</p>
      </div>

      <div className="space-y-6">
        
        {/* THEME & DESIGN */}
        <div className="border border-card-border bg-card rounded-3xl p-5 space-y-4 shadow-sm">
          <div>
            <h3 className="font-bold text-sm flex items-center gap-2">
              {theme === 'dark' ? <Moon className="h-4.5 w-4.5 text-primary" /> : <Sun className="h-4.5 w-4.5 text-amber-500" />}
              <span>{t('themeTitle')}</span>
            </h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">{t('themeSubtitle')}</p>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-input/10 border border-card-border/40">
            <span className="text-xs font-medium">{t('darkModeEnabled')}</span>
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                theme === 'dark' ? 'bg-primary' : 'bg-input border border-card-border'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* REGIONAL LANGUAGE */}
        <div className="border border-card-border bg-card rounded-3xl p-5 space-y-4 shadow-sm">
          <div>
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Globe className="h-4.5 w-4.5 text-primary" />
              <span>{t('langTitle')}</span>
            </h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">{t('langSubtitle')}</p>
          </div>

          <div className="space-y-1.5 p-3 rounded-2xl bg-input/10 border border-card-border/40">
            <label className="text-xs font-semibold text-muted-foreground block">{t('selectLanguageLabel')}</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="w-full h-10 px-2 bg-card border border-card-border rounded-xl text-xs focus:outline-none"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.nativeName} ({lang.name})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* NOTIFICATION CONTROLS */}
        <div className="border border-card-border bg-card rounded-3xl p-5 space-y-4 shadow-sm">
          <div>
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Bell className="h-4.5 w-4.5 text-primary" />
              <span>{t('notificationTitle')}</span>
            </h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">{t('notificationSubtitle')}</p>
          </div>

          <div className="space-y-3">
            
            {/* Status updates */}
            <label className="flex items-center justify-between p-3 rounded-2xl bg-input/10 border border-card-border/40 cursor-pointer select-none">
              <div className="space-y-0.5 pr-4">
                <span className="text-xs font-medium text-foreground block">{t('statusUpdates')}</span>
                <span className="text-[10px] text-muted leading-none">{t('statusUpdatesSub')}</span>
              </div>
              <input 
                type="checkbox" 
                checked={notifyStatus}
                onChange={() => setNotifyStatus(!notifyStatus)}
                className="h-4 w-4 rounded border-card-border text-primary focus:ring-primary shrink-0 cursor-pointer"
              />
            </label>

            {/* Support endorsements */}
            <label className="flex items-center justify-between p-3 rounded-2xl bg-input/10 border border-card-border/40 cursor-pointer select-none">
              <div className="space-y-0.5 pr-4">
                <span className="text-xs font-medium text-foreground block">{t('endorsements')}</span>
                <span className="text-[10px] text-muted leading-none">{t('endorsementsSub')}</span>
              </div>
              <input 
                type="checkbox" 
                checked={notifyLikes}
                onChange={() => setNotifyLikes(!notifyLikes)}
                className="h-4 w-4 rounded border-card-border text-primary focus:ring-primary shrink-0 cursor-pointer"
              />
            </label>

            {/* Critical hazards */}
            <label className="flex items-center justify-between p-3 rounded-2xl bg-input/10 border border-card-border/40 cursor-pointer select-none">
              <div className="space-y-0.5 pr-4 flex items-start gap-2">
                <ShieldAlert className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-medium text-foreground block">{t('safetyAlerts')}</span>
                  <span className="text-[10px] text-muted leading-none">{t('safetyAlertsSub')}</span>
                </div>
              </div>
              <input 
                type="checkbox" 
                checked={notifySafety}
                onChange={() => setNotifySafety(!notifySafety)}
                className="h-4 w-4 rounded border-card-border text-primary focus:ring-primary shrink-0 cursor-pointer"
              />
            </label>

          </div>
        </div>

        {/* ACCOUNT CONTROLS */}
        <div className="border border-card-border bg-card rounded-3xl p-5 space-y-4 shadow-sm">
          <div>
            <h3 className="font-bold text-sm text-red-500">{t('dangerZone')}</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {language === 'hi' ? 'अपरिवर्तनीय प्रशासनिक संचालन।' : 'Irreversible administrative operations.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleLogout}
              className="inline-flex h-10 items-center justify-center gap-1.5 border border-card-border hover:bg-input rounded-xl text-xs font-semibold text-foreground cursor-pointer px-4 flex-1"
            >
              <LogOut className="h-4 w-4 text-muted" />
              <span>{language === 'hi' ? 'सत्र से साइन आउट करें' : 'Sign Out Session'}</span>
            </button>
            
            <button
              onClick={handleDeleteAccount}
              className="inline-flex h-10 items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold cursor-pointer px-4 flex-1 shadow-sm"
            >
              <Trash2 className="h-4 w-4" />
              <span>{t('deleteAccount')}</span>
            </button>
          </div>
        </div>

        {/* SAVE BAR */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSaveSettings}
            className="inline-flex h-10 items-center justify-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/95 px-6 rounded-xl text-xs font-semibold cursor-pointer shadow-md shadow-primary/20"
          >
            <CheckCircle2 className="h-4.5 w-4.5" />
            <span>{language === 'hi' ? 'प्राथमिकताएं सहेजें' : 'Save Preferences'}</span>
          </button>
        </div>

      </div>

    </div>
  );
}
