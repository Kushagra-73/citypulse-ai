'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getReports } from '@/services/firestore';
import { CivicReport } from '@/types';
import { 
  User, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  Award, 
  FileText,
  CheckCircle,
  Clock,
  Heart,
  Grid,
  List,
  ChevronRight
} from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  
  const [userReports, setUserReports] = useState<CivicReport[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (user?.uid) {
      getReports().then(data => {
        // Filter reports submitted by this user
        const mine = data.filter(r => r.createdBy === user.uid);
        setUserReports(mine);
      });
    }
  }, [user?.uid]);

  // Compute status counts
  const totalCount = userReports.length;
  const resolvedCount = userReports.filter(r => r.status === 'Resolved').length;
  const pendingCount = userReports.filter(r => r.status !== 'Resolved' && r.status !== 'Rejected' && r.status !== 'Closed').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Submitted': return 'text-primary bg-primary/10 border-primary/20';
      case 'Under Review': return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
      case 'Assigned': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'In Progress': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'Resolved': return 'text-accent bg-accent/10 border-accent/20';
      default: return 'text-muted bg-input border-card-border';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* PROFILE COVER & HEADER CARD */}
      <div className="border border-card-border bg-card rounded-3xl overflow-hidden shadow-sm relative">
        {/* Cover Glow Background */}
        <div className="h-32 w-full bg-gradient-to-r from-primary/30 via-indigo-600/10 to-accent/20"></div>

        {/* Profile Info Row */}
        <div className="p-6 pt-0 relative flex flex-col md:flex-row items-center md:items-end justify-between gap-4 -mt-10">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-4 text-center md:text-left">
            <img 
              src={user?.photo} 
              alt={user?.name} 
              className="h-20 w-20 rounded-full border-4 border-card object-cover shadow-md bg-card"
            />
            <div className="pb-1">
              <h2 className="font-heading font-extrabold text-xl text-foreground leading-none">
                <span className="animate-motion-text">{user?.name}</span>
              </h2>
              <div className="text-xs text-muted mt-1">{user?.email}</div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-[10px] text-muted-foreground mt-2">
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {t('profileSub')}</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> 
                  {t('joinedDateText')} {user?.joinedDate ? new Date(user.joinedDate).toLocaleDateString(language === 'hi' ? 'hi-IN' : undefined, {month: 'long', year: 'numeric'}) : 'Recently'}
                </span>
              </div>
            </div>
          </div>

          {/* Badges strip */}
          <div className="flex gap-2 pb-1">
            {user?.badges.map((badge, idx) => (
              <span 
                key={idx} 
                className="text-[9px] font-bold px-2 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent uppercase tracking-wider flex items-center gap-1"
              >
                <Award className="h-3 w-3" />
                <span>
                  {badge === 'First Step' 
                    ? (language === 'hi' ? 'पहला कदम' : 'First Step') 
                    : (badge === 'Sanitation Ally' 
                      ? (language === 'hi' ? 'स्वच्छता सहयोगी' : 'Sanitation Ally') 
                      : (badge === 'Community Hero' 
                        ? (language === 'hi' ? 'सामुदायिक नायक' : 'Community Hero') 
                        : (badge === 'City Guardian' 
                          ? (language === 'hi' ? 'नगर संरक्षक' : 'City Guardian') 
                          : badge)))}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* METRICS COUNT RIBBON */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Reports */}
        <div className="border border-card-border bg-card p-4 rounded-2xl flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] text-muted uppercase font-bold">{t('mySubmissions')}</div>
            <div className="text-xl font-bold font-heading">{totalCount}</div>
          </div>
        </div>

        {/* Resolved */}
        <div className="border border-card-border bg-card p-4 rounded-2xl flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] text-muted uppercase font-bold">{t('resolvedTickets')}</div>
            <div className="text-xl font-bold font-heading text-accent">{resolvedCount}</div>
          </div>
        </div>

        {/* Pending */}
        <div className="border border-card-border bg-card p-4 rounded-2xl flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] text-muted uppercase font-bold">{t('pendingReview')}</div>
            <div className="text-xl font-bold font-heading">{pendingCount}</div>
          </div>
        </div>

        {/* Trust Rating */}
        <div className="border border-card-border bg-card p-4 rounded-2xl flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] text-muted uppercase font-bold">{t('trustScore')}</div>
            <div className="text-xl font-bold font-heading text-accent">{user?.trustScore}%</div>
          </div>
        </div>

      </div>

      {/* MY SUBMISSIONS SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm">{t('submissionFeed')}</h3>
          
          {/* View Toggles */}
          <div className="flex items-center border border-card-border rounded-lg p-1 bg-input/40 h-8">
            <button 
              onClick={() => setViewMode('grid')}
              className={`h-full px-2.5 rounded-md flex items-center justify-center cursor-pointer transition-all ${
                viewMode === 'grid' ? 'bg-card text-foreground shadow-sm' : 'text-muted hover:text-foreground'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`h-full px-2.5 rounded-md flex items-center justify-center cursor-pointer transition-all ${
                viewMode === 'list' ? 'bg-card text-foreground shadow-sm' : 'text-muted hover:text-foreground'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* REPORTS FEED */}
        {userReports.length === 0 ? (
          <div className="py-16 text-center border border-card-border bg-card rounded-3xl space-y-2">
            <FileText className="h-8 w-8 text-muted mx-auto" />
            <h4 className="font-bold text-xs">{t('noSubmissions')}</h4>
            <p className="text-[10px] text-muted-foreground">
              {language === 'hi' ? 'पुरस्कार अंक अर्जित करने और विश्वास बढ़ाने के लिए अपनी पहली रिपोर्ट सबमिट करें।' : 'Submit your first report to earn +15 points and increase trust.'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userReports.map((report) => (
              <div 
                key={report.id}
                className="border border-card-border bg-card rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div className="h-36 relative bg-input">
                  <img src={report.images[0]} alt="" className="h-full w-full object-cover" />
                  <span className={`absolute top-2 left-2 text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase backdrop-blur-md ${getStatusBadge(report.status)}`}>
                    {report.status === 'Resolved' ? t('resolved') : (report.status === 'Under Review' ? t('underReview') : (report.status === 'Assigned' ? t('assigned') : (report.status === 'In Progress' ? t('inProgress') : t('pending'))))}
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  <h4 className="font-bold text-xs truncate text-foreground">{report.title}</h4>
                  <p className="text-[11px] text-muted leading-relaxed line-clamp-2">{report.description}</p>
                  
                  <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground pt-1 border-t border-card-border/40 justify-between">
                    <span className="truncate max-w-[150px]">{report.address}</span>
                    <span className="flex items-center gap-1 shrink-0"><Heart className="h-3 w-3 text-red-500 fill-current" /> {report.likes.length}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="border border-card-border bg-card rounded-2xl overflow-hidden divide-y divide-card-border">
            {userReports.map((report) => (
              <div 
                key={report.id}
                className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 hover:bg-input/5 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img src={report.images[0]} alt="" className="h-10 w-10 rounded-lg object-cover shrink-0" />
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-foreground truncate">{report.title}</h4>
                    <p className="text-[10px] text-muted truncate mt-0.5">{report.address}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span className={`text-[8px] font-bold px-2 py-0.5 rounded border uppercase ${getStatusBadge(report.status)}`}>
                    {report.status === 'Resolved' ? t('resolved') : (report.status === 'Under Review' ? t('underReview') : (report.status === 'Assigned' ? t('assigned') : (report.status === 'In Progress' ? t('inProgress') : t('pending'))))}
                  </span>
                  <div className="text-[10px] text-muted-foreground">{new Date(report.createdAt).toLocaleDateString()}</div>
                  <ChevronRight className="h-4 w-4 text-muted hidden sm:block" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
