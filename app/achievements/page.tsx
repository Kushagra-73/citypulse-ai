'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Trophy, 
  Shield, 
  Hammer, 
  Trash2, 
  Lightbulb, 
  Heart, 
  Award, 
  Lock, 
  CheckCircle 
} from 'lucide-react';

const TRANSLATIONS = {
  en: {
    title: 'Civic Achievements',
    subtitle: 'Track your milestones, unlocked titles, and civic honors.',
    unlockedCount: 'Achievements Unlocked',
    pointsEarned: 'Total Reward Points',
    unlockedStatus: 'UNLOCKED',
    lockedStatus: 'LOCKED',
    progress: 'Overall Completion',
    descRoad: 'Report 3 pothole or road damage issues.',
    descGarbage: 'Report 3 garbage or dumping issues.',
    descLight: 'Report 3 broken streetlights.',
    descTrust: 'Achieve a profile Trust Score of 85% or higher.',
    descEndorse: 'Back or upvote neighbor complaints to earn reward credits.',
    descPoints: 'Accumulate more than 200 total civic reward points.'
  },
  hi: {
    title: 'नागरिक उपलब्धियां',
    subtitle: 'अपने मील के पत्थर, अनलॉक किए गए शीर्षकों और नागरिक सम्मानों को ट्रैक करें।',
    unlockedCount: 'सफलतापूर्वक अनलॉक',
    pointsEarned: 'कुल पुरस्कार अंक',
    unlockedStatus: 'अनलॉक किया गया',
    lockedStatus: 'लंबित',
    progress: 'कुल पूर्णता',
    descRoad: '3 सड़क क्षति या गड्ढों के मुद्दों की रिपोर्ट करें।',
    descGarbage: '3 कचरा या डंपिंग मुद्दों की रिपोर्ट करें।',
    descLight: '3 टूटी स्ट्रीटलाइट्स की रिपोर्ट करें।',
    descTrust: '85% या उससे अधिक का प्रोफ़ाइल विश्वास स्कोर प्राप्त करें।',
    descEndorse: 'पुरस्कार क्रेडिट अर्जित करने के लिए पड़ोसियों की शिकायतों का समर्थन या अपवोट करें।',
    descPoints: '200 से अधिक कुल नागरिक पुरस्कार अंक एकत्र करें।'
  }
};

export default function AchievementsPage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const lang = language === 'hi' ? 'hi' : 'en';
  const tLocal = TRANSLATIONS[lang];

  // Dynamically compile achievements status based on active mock user credentials
  const achievementsList = [
    {
      id: 'road_ranger',
      title: lang === 'hi' ? 'सड़क रक्षक (Road Ranger)' : 'Road Ranger',
      desc: tLocal.descRoad,
      icon: Hammer,
      isUnlocked: (user?.reportsCount || 0) >= 3,
      reqText: lang === 'hi' ? '3 रिपोर्ट आवश्यक' : '3 Reports Required',
      color: 'text-indigo-400 bg-indigo-500/10'
    },
    {
      id: 'spotless',
      title: lang === 'hi' ? 'स्वच्छता प्रहरी (Sanitation Star)' : 'Sanitation Star',
      desc: tLocal.descGarbage,
      icon: Trash2,
      isUnlocked: (user?.reportsCount || 0) >= 2,
      reqText: lang === 'hi' ? '2 रिपोर्ट आवश्यक' : '2 Reports Required',
      color: 'text-emerald-500 bg-emerald-500/10'
    },
    {
      id: 'illuminator',
      title: lang === 'hi' ? 'प्रकाश दूत (Illuminator)' : 'Illuminator',
      desc: tLocal.descLight,
      icon: Lightbulb,
      isUnlocked: (user?.reportsCount || 0) >= 1,
      reqText: lang === 'hi' ? '1 रिपोर्ट आवश्यक' : '1 Report Required',
      color: 'text-amber-500 bg-amber-500/10'
    },
    {
      id: 'trustee',
      title: lang === 'hi' ? 'विश्वास स्तंभ (Trust Pillar)' : 'Trust Pillar',
      desc: tLocal.descTrust,
      icon: Shield,
      isUnlocked: (user?.trustScore || 0) >= 80,
      reqText: lang === 'hi' ? '80% विश्वास स्कोर आवश्यक' : '80% Trust Required',
      color: 'text-blue-500 bg-blue-500/10'
    },
    {
      id: 'endorser',
      title: lang === 'hi' ? 'सामुदायिक सहायक (Community Backer)' : 'Community Backer',
      desc: tLocal.descEndorse,
      icon: Heart,
      isUnlocked: (user?.rewardPoints || 0) >= 90,
      reqText: lang === 'hi' ? '90 अंक या अधिक' : '90 Points or More',
      color: 'text-red-500 bg-red-500/10'
    },
    {
      id: 'champion',
      title: lang === 'hi' ? 'नागरिक चैंपियन (Civic Champion)' : 'Civic Champion',
      desc: tLocal.descPoints,
      icon: Trophy,
      isUnlocked: (user?.rewardPoints || 0) >= 200,
      reqText: lang === 'hi' ? '200 अंक आवश्यक' : '200 Points Required',
      color: 'text-yellow-500 bg-yellow-500/10'
    }
  ];

  const unlockedCount = achievementsList.filter(a => a.isUnlocked).length;
  const progressPercent = Math.round((unlockedCount / achievementsList.length) * 100);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* HEADER */}
      <div className="border-b border-card-border pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-foreground flex items-center gap-2">
            <span className="animate-motion-text">{tLocal.title}</span>
            <Trophy className="h-6 w-6 text-yellow-500" />
          </h1>
          <p className="text-xs text-muted-foreground mt-1">{tLocal.subtitle}</p>
        </div>

        {/* Global Progress Indicator */}
        <div className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-2xl p-4 flex items-center gap-4 shadow-md shrink-0">
          <Award className="h-10 w-10 shrink-0" />
          <div>
            <div className="text-[10px] text-yellow-100 font-bold uppercase tracking-wider">{tLocal.progress}</div>
            <div className="text-xl font-black font-heading leading-none mt-0.5">{progressPercent}% <span className="text-xs font-semibold">({unlockedCount} / {achievementsList.length})</span></div>
          </div>
        </div>
      </div>

      {/* METRICS SPLIT */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="border border-card-border bg-card rounded-2xl p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center shrink-0">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[9px] text-muted uppercase font-bold">{tLocal.unlockedCount}</div>
            <div className="text-sm font-bold font-heading">{unlockedCount} / {achievementsList.length}</div>
          </div>
        </div>

        <div className="border border-card-border bg-card rounded-2xl p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[9px] text-muted uppercase font-bold">{tLocal.pointsEarned}</div>
            <div className="text-sm font-bold font-heading">{user?.rewardPoints || 0} pts</div>
          </div>
        </div>

        <div className="border border-card-border bg-card rounded-2xl p-4 flex items-center gap-3 col-span-2 md:col-span-1">
          <div className="h-9 w-9 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[9px] text-muted uppercase font-bold">Reputation Trust</div>
            <div className="text-sm font-bold font-heading text-accent">{user?.trustScore || 0}%</div>
          </div>
        </div>
      </div>

      {/* ACHIEVEMENTS GRID */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievementsList.map((item) => {
          const Icon = item.icon;

          return (
            <div 
              key={item.id}
              className={`border rounded-3xl p-5 flex flex-col justify-between transition-all duration-300 ${
                item.isUnlocked 
                  ? 'border-yellow-500/30 bg-yellow-500/5 shadow-sm' 
                  : 'border-card-border bg-input/10 opacity-60'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${
                    item.isUnlocked ? item.color : 'bg-card-border text-muted'
                  }`}>
                    {item.isUnlocked ? <Icon className="h-6 w-6" /> : <Lock className="h-5 w-5" />}
                  </div>

                  <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                    item.isUnlocked 
                      ? 'border-yellow-500/20 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' 
                      : 'border-card-border bg-input text-muted-foreground'
                  }`}>
                    {item.isUnlocked ? tLocal.unlockedStatus : tLocal.lockedStatus}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-foreground">{item.title}</h4>
                  <p className="text-[10px] text-muted leading-relaxed">{item.desc}</p>
                </div>
              </div>

              <div className="border-t border-card-border/40 pt-3 mt-4 flex items-center justify-between text-[8px] font-bold uppercase tracking-wider text-muted-foreground">
                <span>Requirement</span>
                <span>{item.reqText}</span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
