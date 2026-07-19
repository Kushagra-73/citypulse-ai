'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getReports, toggleLike } from '@/services/firestore';
import { CivicReport } from '@/types';
import StatisticsCard from '@/components/dashboard/StatisticsCard';

import { 
  FileText, 
  CheckCircle, 
  Clock, 
  Shield, 
  Award,
  PlusCircle, 
  ArrowRight,
  TrendingUp,
  MapPin,
  Heart
} from 'lucide-react';

import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

// Dynamically load Map component to prevent Next.js SSR crashes
const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), { 
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-input rounded-2xl animate-pulse flex items-center justify-center text-xs text-muted">
      Loading interactive map canvas...
    </div>
  )
});

export default function DashboardPage() {
  const { user, updatePointsAndTrust } = useAuth();
  const { t } = useLanguage();
  const [reports, setReports] = useState<CivicReport[]>([]);
  const [mapCenter, setMapCenter] = useState({ lat: 12.9716, lng: 77.5946 });

  // Weekly reports mock data
  const activityData = [
    { day: 'Mon', reports: 4 },
    { day: 'Tue', reports: 7 },
    { day: 'Wed', reports: 5 },
    { day: 'Thu', reports: 12 },
    { day: 'Fri', reports: 9 },
    { day: 'Sat', reports: 15 },
    { day: 'Sun', reports: 8 },
  ];

  // Pie chart categories distribution mock
  const categoryData = [
    { name: 'Road Damage', value: 35, color: '#6366f1' },
    { name: 'Garbage', value: 25, color: '#10b981' },
    { name: 'Water Leakage', value: 20, color: '#3b82f6' },
    { name: 'Broken Streetlight', value: 15, color: '#f59e0b' },
    { name: 'Other', value: 5, color: '#ec4899' },
  ];

  // Leaderboard mock data
  const leaderboard = [
    { name: 'Priya Patel', points: 340, trust: 92, photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150' },
    { name: 'Arjun Sharma', points: 240, trust: 85, photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150' },
    { name: 'Rohan Gupta', points: 195, trust: 88, photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150' },
  ];

  useEffect(() => {
    getReports().then(data => {
      setReports(data);
      // Center map on the first issue location if available
      if (data.length > 0) {
        setMapCenter({ lat: data[0].latitude, lng: data[0].longitude });
      }
    });
  }, []);

  const handleUpvote = async (reportId: string) => {
    if (!user) return;
    const updatedLikes = await toggleLike(reportId, user.uid);
    
    // Update local state to trigger rerender
    const updatedReports = reports.map(r => {
      if (r.id === reportId) {
        const isUpvoted = r.likes.includes(user.uid);
        // Add point bonus to reporter if newly upvoted
        if (!isUpvoted) {
          updatePointsAndTrust(5, 0.5); // Upvoting awards minor engagement points
        }
        return {
          ...r,
          likes: updatedLikes
        };
      }
      return r;
    });
    setReports(updatedReports);
  };

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return t('goodMorning');
    if (hr < 17) return t('goodAfternoon');
    return t('goodEvening');
  };

  // Compute statistics
  const totalCount = reports.length;
  const resolvedCount = reports.filter(r => r.status === 'Resolved').length;
  const pendingCount = reports.filter(r => r.status !== 'Resolved' && r.status !== 'Rejected' && r.status !== 'Closed').length;

  return (
    <div className="space-y-6">
      
      {/* GREETING HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-card-border pb-5">
        <div>
          <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-foreground flex items-center gap-2">
            <span className="animate-motion-text">{getGreeting()}, {user?.name.split(' ')[0]}</span>
            <span>👋</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">{t('quickLook')}</p>
        </div>
        <Link 
          href="/report" 
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/20 cursor-pointer"
        >
          <PlusCircle className="h-4.5 w-4.5" />
          <span>{t('reportIssue')}</span>
        </Link>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatisticsCard
          label={t('totalReports')}
          value={totalCount}
          icon={FileText}
          variant="primary"
          trendText={t('totalReportsSub')}
        />
        <StatisticsCard
          label={t('resolved')}
          value={resolvedCount}
          icon={CheckCircle}
          variant="accent"
          trendText={t('resolvedSub')}
        />
        <StatisticsCard
          label={t('pending')}
          value={pendingCount}
          icon={Clock}
          variant="warning"
          trendText={t('pendingSub')}
        />
        <StatisticsCard
          label={t('rewardPoints')}
          value={user?.rewardPoints || 0}
          icon={Award}
          variant="primary"
          trendText={t('rewardsSub')}
        />
        <StatisticsCard
          label={t('trustScore')}
          value={`${user?.trustScore || 0}%`}
          icon={Shield}
          variant="accent"
          trendText={t('trustSub')}
        />
      </div>

      {/* MAP & SIDEBAR SPLIT */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Interactive Map Panel */}
        <div className="lg:col-span-2 border border-card-border bg-card rounded-3xl p-4 flex flex-col space-y-3 shadow-sm min-h-[350px]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm">{t('nearbyMap')}</h3>
              <p className="text-[10px] text-muted-foreground">{t('nearbyMapSub')}</p>
            </div>
            <Link href="/community" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
              <span>{t('fullscreenFeed')}</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="flex-1 relative rounded-2xl overflow-hidden min-h-[300px]">
            <InteractiveMap 
              latitude={mapCenter.lat} 
              longitude={mapCenter.lng} 
              issues={reports} 
              readOnly={true}
              onIssueClick={(issue) => {
                setMapCenter({ lat: issue.latitude, lng: issue.longitude });
              }}
            />
          </div>
        </div>

        {/* Leaderboard & Stats */}
        <div className="space-y-6">
          
          {/* Top Contributors */}
          <div className="border border-card-border bg-card rounded-3xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-accent" />
              <h3 className="font-bold text-sm">{t('topContributors')}</h3>
            </div>
            <div className="space-y-3">
              {leaderboard.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-card-border/40 pb-2 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="font-extrabold text-xs text-muted w-4">#{idx + 1}</div>
                    <img src={item.photo} alt={item.name} className="h-8 w-8 rounded-full object-cover" />
                    <div>
                      <div className="font-bold text-xs">{item.name}</div>
                      <div className="text-[9px] text-muted">{t('trustScore')}: {item.trust}%</div>
                    </div>
                  </div>
                  <div className="text-xs font-black text-primary">{item.points} pts</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="border border-card-border bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl p-5 space-y-3">
            <h4 className="font-bold text-xs text-foreground uppercase tracking-wide">{t('quickTips')}</h4>
            <ul className="text-[11px] text-muted space-y-1.5 list-disc pl-4 leading-relaxed">
              <li>{t('tip1')}</li>
              <li>{t('tip2')}</li>
              <li>{t('tip3')}</li>
            </ul>
          </div>

        </div>

      </div>

      {/* CHARTS CONTAINER */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Weekly Activity Line Chart */}
        <div className="border border-card-border bg-card rounded-3xl p-5 space-y-4">
          <div>
            <h3 className="font-bold text-sm">{t('weeklyActivity')}</h3>
            <p className="text-[10px] text-muted-foreground">{t('weeklyActivitySub')}</p>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: 'var(--card)', borderColor: 'var(--card-border)', borderRadius: '0.5rem', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="reports" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorReports)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category distribution Pie Chart */}
        <div className="border border-card-border bg-card rounded-3xl p-5 space-y-4">
          <div>
            <h3 className="font-bold text-sm">{t('issueCategories')}</h3>
            <p className="text-[10px] text-muted-foreground">{t('categoriesSub')}</p>
          </div>
          <div className="h-60 w-full flex items-center justify-center">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: 'var(--card)', borderColor: 'var(--card-border)', borderRadius: '0.5rem', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-2 pl-4">
              {categoryData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                  <span className="text-[10px] font-medium text-foreground">{t(entry.name === 'Road Damage' ? 'road_damage' : (entry.name === 'Garbage' ? 'garbage' : (entry.name === 'Water Leakage' ? 'water_leakage' : (entry.name === 'Broken Streetlight' ? 'broken_streetlight' : 'other'))))}</span>
                  <span className="text-[10px] text-muted">({entry.value}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* RECENT ACTIVITY TIMELINE */}
      <div className="border border-card-border bg-card rounded-3xl p-5 space-y-5">
        <div>
          <h3 className="font-bold text-sm">{t('communityFeed')}</h3>
          <p className="text-[10px] text-muted-foreground">{t('communityFeedSub')}</p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {reports.slice(0, 4).map((report) => (
            <div 
              key={report.id} 
              className="border border-card-border/80 bg-input/10 hover:bg-input/20 transition-all rounded-2xl p-4 flex gap-4"
            >
              <img 
                src={report.images[0]} 
                alt={report.title} 
                className="h-16 w-16 rounded-xl object-cover border border-card-border"
              />
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-primary/10 text-primary uppercase">
                      {t(report.category === 'Road Damage' ? 'road_damage' : (report.category === 'Garbage' ? 'garbage' : (report.category === 'Water Leakage' ? 'water_leakage' : (report.category === 'Broken Streetlight' ? 'broken_streetlight' : 'other'))))}
                    </span>
                    <span className={`text-[9px] font-semibold ${report.status === 'Resolved' ? 'text-accent' : 'text-amber-500'}`}>
                      {report.status === 'Resolved' ? t('resolved') : (report.status === 'Under Review' ? t('underReview') : (report.status === 'Assigned' ? t('assigned') : (report.status === 'In Progress' ? t('inProgress') : t('pending'))))}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs truncate mt-1 text-foreground">{report.title}</h4>
                  <div className="flex items-center gap-1 text-[9px] text-muted mt-0.5 truncate">
                    <MapPin className="h-3 w-3" />
                    <span>{report.address}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-card-border/30 pt-2 mt-2">
                  <div className="flex items-center gap-1.5">
                    <img src={report.creatorPhoto} alt="" className="h-4 w-4 rounded-full" />
                    <span className="text-[9px] text-muted">{report.creatorName}</span>
                  </div>
                  <button 
                    onClick={() => handleUpvote(report.id)}
                    className={`flex items-center gap-1 text-[10px] font-bold cursor-pointer ${
                      report.likes.includes(user?.uid || '') ? 'text-red-500' : 'text-muted hover:text-foreground'
                    }`}
                  >
                    <Heart className="h-3.5 w-3.5 fill-current" />
                    <span>{report.likes.length}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
