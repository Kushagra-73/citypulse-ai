'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { MOCK_REWARDS, redeemReward } from '@/services/firestore';
import { RewardItem } from '@/types';
import { 
  Award, 
  Check, 
  Lock, 
  Gift, 
  Zap, 
  MapPin, 
  ShieldCheck,
  Trophy,
  Ticket
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Badge {
  id: string;
  name: string;
  desc: string;
  icon: string;
  pointsRequired: number;
}

const BADGES: Badge[] = [
  { id: 'first_step', name: 'First Step', desc: 'Reported your first civic issue.', icon: 'Zap', pointsRequired: 10 },
  { id: 'cleanup_crew', name: 'Sanitation Ally', desc: 'Reported 3 garbage or dumping issues.', icon: 'ShieldCheck', pointsRequired: 50 },
  { id: 'civic_hero', name: 'Community Hero', desc: 'Earned over 150 total civic points.', icon: 'Award', pointsRequired: 150 },
  { id: 'guardian', name: 'City Guardian', desc: 'Maintain a Trust Score over 90%.', icon: 'Trophy', pointsRequired: 300 },
];

export default function RewardsPage() {
  const { user, updatePointsAndTrust } = useAuth();
  const { t, language } = useLanguage();
  const [unlockedCode, setUnlockedCode] = useState<string | null>(null);
  const [selectedReward, setSelectedReward] = useState<RewardItem | null>(null);

  const handleRedeem = async (reward: RewardItem) => {
    if (!user) return;
    if (user.rewardPoints < reward.pointsCost) {
      toast.error(language === 'hi' ? 'अपर्याप्त अंक। अंक अर्जित करने के लिए और अधिक समस्याओं की रिपोर्ट करें!' : 'Insufficient points. Report more issues to earn points!');
      return;
    }

    try {
      const code = await redeemReward(user.uid, reward.id);
      if (code) {
        // Deduct points
        updatePointsAndTrust(-reward.pointsCost, 0.5); // Deduct points, award tiny trust boost for engagement!
        setSelectedReward(reward);
        setUnlockedCode(code);
        toast.success(language === 'hi' ? `सफलतापूर्वक भुनाया गया: ${reward.title}` : `Redeemed: ${reward.title}`);
      }
    } catch (err) {
      console.error(err);
      toast.error(language === 'hi' ? 'पुरस्कार भुनाने में विफल।' : 'Failed to redeem reward.');
    }
  };

  const getPointsProgress = () => {
    if (!user) return 0;
    const nextTarget = 500;
    return Math.min(100, Math.round((user.rewardPoints / nextTarget) * 100));
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER BANNER */}
      <div className="border-b border-card-border pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-foreground flex items-center gap-2">
            <span className="animate-motion-text">{language === 'hi' ? 'पुरस्कार' : 'Gamified Rewards'}</span>
            <Award className="h-6 w-6 text-primary" />
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {t('rewardsSubtitle')}
          </p>
        </div>

        {/* Available Points Badge */}
        <div className="bg-gradient-to-r from-primary to-indigo-600 text-white rounded-2xl p-4 flex items-center gap-4 shadow-md">
          <Award className="h-10 w-10 shrink-0" />
          <div>
            <div className="text-[10px] text-primary-foreground/80 font-bold uppercase tracking-wider">{t('availableBalance')}</div>
            <div className="text-2xl font-black font-heading leading-none mt-0.5">{user?.rewardPoints} <span className="text-xs font-semibold">{language === 'hi' ? 'अंक' : 'pts'}</span></div>
          </div>
        </div>
      </div>

      {/* METRICS SPLIT */}
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* PROGRESS TO NEXT LEVEL */}
        <div className="border border-card-border bg-card rounded-3xl p-5 space-y-4 shadow-sm md:col-span-2">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm">{t('levelProgress')}</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">{t('levelProgressSub')}</p>
            </div>
            <span className="text-xs font-bold text-primary">{user?.rewardPoints} / 500 {language === 'hi' ? 'अंक' : 'pts'}</span>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="w-full bg-input rounded-full h-3 overflow-hidden">
              <div 
                className="bg-primary h-full rounded-full transition-all duration-500" 
                style={{ width: `${getPointsProgress()}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[9px] text-muted-foreground font-semibold">
              <span>{t('noviceReporter')}</span>
              <span>{t('urbanGuardian')}</span>
            </div>
          </div>
        </div>

        {/* TRUST SCORE STATUS */}
        <div className="border border-card-border bg-card rounded-3xl p-5 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="font-bold text-sm">{t('reputationTitle')}</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">{t('reputationSubtitle')}</p>
          </div>
          
          <div className="flex items-baseline gap-1 mt-4">
            <span className="text-3xl font-black font-heading text-accent">{user?.trustScore}%</span>
            <span className="text-xs text-muted">{language === 'hi' ? 'विश्वास स्कोर' : 'Trust Score'}</span>
          </div>

          <div className="text-[10px] text-muted leading-relaxed mt-2">
            {user && user.trustScore >= 80 
              ? t('highTrustText')
              : t('lowTrustText')}
          </div>
        </div>

      </div>

      {/* BADGES DISPLAY */}
      <div className="border border-card-border bg-card rounded-3xl p-6 space-y-4">
        <div>
          <h3 className="font-bold text-sm">{t('badgesTitle')}</h3>
          <p className="text-[10px] text-muted-foreground">{t('badgesSubtitle')}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {BADGES.map((badge) => {
            // Check if earned based on points or trust
            const isEarned = (user?.rewardPoints || 0) >= badge.pointsRequired;

            return (
              <div 
                key={badge.id}
                className={`border rounded-2xl p-4 flex flex-col items-center text-center space-y-2 transition-all ${
                  isEarned 
                    ? 'border-accent/30 bg-accent/5' 
                    : 'border-card-border bg-input/10 opacity-60'
                }`}
              >
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${
                  isEarned ? 'bg-accent/20 text-accent' : 'bg-card-border text-muted'
                }`}>
                  {isEarned ? <Award className="h-6 w-6" /> : <Lock className="h-5 w-5" />}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-foreground">
                    {badge.name === 'First Step' 
                      ? (language === 'hi' ? 'पहला कदम' : 'First Step') 
                      : (badge.name === 'Sanitation Ally' 
                        ? (language === 'hi' ? 'स्वच्छता सहयोगी' : 'Sanitation Ally') 
                        : (badge.name === 'Community Hero' 
                          ? (language === 'hi' ? 'सामुदायिक नायक' : 'Community Hero') 
                          : (language === 'hi' ? 'नगर संरक्षक' : 'City Guardian')))}
                  </h4>
                  <p className="text-[9px] text-muted-foreground leading-relaxed mt-0.5">
                    {badge.desc === 'Reported your first civic issue.' 
                      ? (language === 'hi' ? 'अपनी पहली नागरिक समस्या की रिपोर्ट की।' : 'Reported your first civic issue.') 
                      : (badge.desc === 'Reported 3 garbage or dumping issues.' 
                        ? (language === 'hi' ? '3 कचरा या डंपिंग मुद्दों की रिपोर्ट की।' : 'Reported 3 garbage or dumping issues.') 
                        : (badge.desc === 'Earned over 150 total civic points.' 
                          ? (language === 'hi' ? '150 से अधिक कुल नागरिक अंक अर्जित किए।' : 'Earned over 150 total civic points.') 
                          : (language === 'hi' ? '90% से अधिक विश्वास स्कोर बनाए रखें।' : 'Maintain a Trust Score over 90%.')))}
                  </p>
                </div>
                <div className="text-[8px] font-bold uppercase tracking-wider text-muted">
                  {isEarned ? t('unlocked') : `${badge.pointsRequired} ${language === 'hi' ? 'अंक आवश्यक' : 'Points Required'}`}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* REWARDS CATALOG */}
      <div className="border border-card-border bg-card rounded-3xl p-6 space-y-4">
        <div>
          <h3 className="font-bold text-sm">{language === 'hi' ? 'भुनाने योग्य पुरस्कार' : 'Redeemable Rewards'}</h3>
          <p className="text-[10px] text-muted-foreground">
            {language === 'hi' ? 'बस पास, उपयोगिता छूट और बागवानी प्रायोजन के लिए अंकों का आदान-प्रदान करें।' : 'Exchange points for bus passes, Utility discounts, and garden sponsorships.'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {MOCK_REWARDS.map((reward) => {
            const canAfford = (user?.rewardPoints || 0) >= reward.pointsCost;

            return (
              <div 
                key={reward.id}
                className="border border-card-border bg-input/10 p-4 rounded-2xl flex gap-4 hover:bg-input/20 transition-all"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Gift className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-xs text-foreground truncate">{reward.title}</h4>
                      <span className="text-[10px] font-black text-primary shrink-0">{reward.pointsCost} {language === 'hi' ? 'अंक' : 'pts'}</span>
                    </div>
                    <p className="text-[10px] text-muted mt-1 leading-relaxed">{reward.description}</p>
                    <span className="text-[8px] font-semibold text-muted-foreground block mt-1.5 uppercase">
                      {language === 'hi' ? 'साझेदार:' : 'Partner:'} {reward.partner}
                    </span>
                  </div>

                  <div className="pt-3 flex justify-end">
                    <button
                      onClick={() => handleRedeem(reward)}
                      disabled={!canAfford}
                      className={`inline-flex h-8 items-center justify-center text-[10px] font-bold px-4 rounded-lg cursor-pointer transition-all ${
                        canAfford 
                          ? 'bg-primary text-primary-foreground hover:bg-primary/95 shadow-sm shadow-primary/15'
                          : 'bg-input text-muted-foreground border border-card-border cursor-not-allowed'
                      }`}
                    >
                      {language === 'hi' ? 'पुरस्कार भुनाएं' : 'Redeem Reward'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* REDEEMED CODE SUCCESS MODAL */}
      {unlockedCode && selectedReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md border border-card-border bg-card rounded-2xl shadow-xl p-6 text-center space-y-4">
            
            <div className="h-12 w-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto">
              <Check className="h-6 w-6" />
            </div>

            <div>
              <h3 className="font-bold text-md text-foreground">{language === 'hi' ? 'पुरस्कार भुनाया गया!' : 'Reward Redeemed!'}</h3>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                {language === 'hi' ? (
                  <>आपने सफलतापूर्वक <strong>{selectedReward.title}</strong> भुना लिया है। इस कोड को साझेदार विभाग को दिखाएं या चेकआउट के समय दर्ज करें।</>
                ) : (
                  <>You have successfully redeemed <strong>{selectedReward.title}</strong>. Show this code to the partner division or enter it at checkout.</>
                )}
              </p>
            </div>

            {/* Code Box */}
            <div className="bg-input/20 border border-card-border rounded-xl p-4 max-w-xs mx-auto space-y-1.5 text-xs">
              <div className="text-muted-foreground font-semibold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5">
                <Ticket className="h-3.5 w-3.5 text-primary" />
                <span>{language === 'hi' ? 'वाउचर कोड' : 'Voucher Code'}</span>
              </div>
              <div className="font-mono font-bold text-base text-primary select-all tracking-wide py-1 bg-card rounded border border-card-border/80">
                {unlockedCode}
              </div>
              <span className="text-[8px] text-muted-foreground">
                {language === 'hi' ? 'अनलॉक तिथि से 30 दिनों में समाप्त।' : 'Expires 30 days from unlock date.'}
              </span>
            </div>

            <button 
              onClick={() => {
                setUnlockedCode(null);
                setSelectedReward(null);
              }}
              className="inline-flex h-9 items-center justify-center border border-card-border bg-card hover:bg-input px-5 rounded-lg text-xs font-semibold cursor-pointer"
            >
              {language === 'hi' ? 'बंद करें' : 'Close'}
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
