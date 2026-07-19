'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getReports, toggleLike, toggleSupport, addComment } from '@/services/firestore';
import { CivicReport, Comment, IssueCategory } from '@/types';
import { 
  Heart, 
  Users, 
  MessageSquare, 
  MapPin, 
  Search, 
  Filter, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  X,
  Send,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'All', 'Road Damage', 'Garbage', 'Water Leakage', 'Broken Streetlight', 
  'Traffic', 'Illegal Dumping', 'Drainage', 'Electricity', 
  'Public Safety', 'Trees', 'Construction', 'Noise', 'Other'
];

export default function CommunityPage() {
  const { user, updatePointsAndTrust } = useAuth();
  const { t, language } = useLanguage();

  const [reports, setReports] = useState<CivicReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<CivicReport[]>([]);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState<'recent' | 'trending'>('recent');

  // Detail Modal States
  const [selectedReport, setSelectedReport] = useState<CivicReport | null>(null);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    getReports().then((data) => {
      setReports(data);
      setFilteredReports(data);
    });
  };

  // Run filters
  useEffect(() => {
    let result = [...reports];

    // Search query match
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        r => r.title.toLowerCase().includes(q) || 
             r.description.toLowerCase().includes(q) || 
             r.address.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter(r => r.category === selectedCategory);
    }

    // Status filter
    if (selectedStatus !== 'All') {
      result = result.filter(r => r.status === selectedStatus);
    }

    // Sorting
    if (sortBy === 'recent') {
      result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } else {
      // Sort by likes + support count (Trending)
      result.sort((a, b) => {
        const trendA = a.likes.length + a.supports.length;
        const trendB = b.likes.length + b.supports.length;
        return trendB - trendA;
      });
    }

    setFilteredReports(result);
  }, [searchQuery, selectedCategory, selectedStatus, sortBy, reports]);

  const handleUpvote = async (reportId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    const updatedLikes = await toggleLike(reportId, user.uid);
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, likes: updatedLikes } : r));
    updatePointsAndTrust(2, 0); // +2 Points for voting
  };

  const handleSupport = async (reportId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    const updatedSupports = await toggleSupport(reportId, user.uid);
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, supports: updatedSupports } : r));
    updatePointsAndTrust(5, 0.5); // +5 Points for joining/backing complaints
    toast.success(language === 'hi' ? 'शिकायत में शामिल हो गए! आपने +5 अंक अर्जित किए।' : 'Joined complaint! You earned +5 points.');
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedReport || commentText.trim() === '') return;

    try {
      const newComment = await addComment(
        selectedReport.id,
        user.uid,
        user.name,
        user.photo,
        commentText
      );

      // Update state
      const updatedReport = {
        ...selectedReport,
        comments: [...(selectedReport.comments || []), newComment]
      };

      setSelectedReport(updatedReport);
      setReports(prev => prev.map(r => r.id === selectedReport.id ? updatedReport : r));
      setCommentText('');
      updatePointsAndTrust(3, 0); // +3 Points for commenting
    } catch (err) {
      console.error(err);
      toast.error('Failed to post comment.');
    }
  };

  // Get status color tokens
  const getStatusColor = (status: string) => {
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
      
      {/* HEADER & FILTERS BAR */}
      <div className="flex flex-col gap-4 border-b border-card-border pb-5">
        <div>
          <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-foreground">
            <span className="animate-motion-text">{language === 'hi' ? 'सामुदायिक गतिविधि फीड' : 'Community Civic Hub'}</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">{t('exploreFeedSub')}</p>
        </div>

        {/* Filters block */}
        <div className="grid md:grid-cols-4 gap-3">
          
          {/* Search Input */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input 
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 bg-input border border-card-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-10 px-2 bg-input border border-card-border rounded-xl text-xs focus:outline-none"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? t('allCategories') : t(cat === 'Road Damage' ? 'road_damage' : (cat === 'Garbage' ? 'garbage' : (cat === 'Water Leakage' ? 'water_leakage' : (cat === 'Broken Streetlight' ? 'broken_streetlight' : (cat === 'Electricity' ? 'electricity' : 'other')))))}
                </option>
              ))}
            </select>
          </div>

          {/* Sorting Toggles */}
          <div className="flex items-center border border-card-border rounded-xl h-10 p-1 bg-input/40">
            <button 
              onClick={() => setSortBy('recent')}
              className={`flex-1 h-full rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                sortBy === 'recent' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>{t('sortByRecent')}</span>
            </button>
            <button 
              onClick={() => setSortBy('trending')}
              className={`flex-1 h-full rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                sortBy === 'trending' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              <span>{t('sortByTrending')}</span>
            </button>
          </div>

        </div>
      </div>

      {/* FEED FEED GRID */}
      {filteredReports.length === 0 ? (
        <div className="py-20 text-center border border-card-border bg-card rounded-3xl space-y-3">
          <Filter className="h-10 w-10 text-muted mx-auto" />
          <h3 className="font-bold text-md text-foreground">{t('noReportsFound')}</h3>
          <p className="text-xs text-muted max-w-xs mx-auto">
            {language === 'hi' ? 'खोज या श्रेणी फ़िल्टर साफ़ करने का प्रयास करें।' : 'Try clearing your search query or choosing another category.'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <div 
              key={report.id}
              onClick={() => setSelectedReport(report)}
              className="border border-card-border bg-card hover:shadow-lg rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 cursor-pointer group"
            >
              
              {/* Card visual */}
              <div className="relative h-44 w-full bg-input overflow-hidden">
                <img 
                  src={report.images[0]} 
                  alt={report.title} 
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className={`absolute top-3 left-3 text-[9px] font-bold px-2 py-0.5 rounded border uppercase backdrop-blur-md ${getStatusColor(report.status)}`}>
                  {report.status === 'Resolved' ? t('resolved') : (report.status === 'Under Review' ? t('underReview') : (report.status === 'Assigned' ? t('assigned') : (report.status === 'In Progress' ? t('inProgress') : t('pending'))))}
                </span>
                <span className="absolute bottom-3 right-3 text-[9px] font-bold px-2 py-0.5 rounded bg-black/70 text-white uppercase backdrop-blur-md">
                  {t(report.category === 'Road Damage' ? 'road_damage' : (report.category === 'Garbage' ? 'garbage' : (report.category === 'Water Leakage' ? 'water_leakage' : (report.category === 'Broken Streetlight' ? 'broken_streetlight' : 'other'))))}
                </span>
              </div>

              {/* Card body */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                
                <div className="space-y-1.5">
                  <h3 className="font-bold text-sm text-foreground truncate leading-tight group-hover:text-primary transition-colors">
                    {report.title}
                  </h3>
                  <p className="text-xs text-muted leading-relaxed line-clamp-2">
                    {report.description}
                  </p>
                  
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground truncate pt-1">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{report.address}</span>
                  </div>
                </div>

                {/* Social statistics strip */}
                <div className="border-t border-card-border/50 pt-3 flex items-center justify-between mt-4">
                  <div className="flex items-center gap-1.5">
                    <img src={report.creatorPhoto} alt="" className="h-5 w-5 rounded-full object-cover" />
                    <span className="text-[10px] text-muted">{report.creatorName}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={(e) => handleUpvote(report.id, e)}
                      className={`flex items-center gap-1 text-xs cursor-pointer ${
                        report.likes.includes(user?.uid || '') ? 'text-red-500 font-bold' : 'text-muted hover:text-foreground'
                      }`}
                    >
                      <Heart className="h-4 w-4 fill-current" />
                      <span>{report.likes.length}</span>
                    </button>

                    <button 
                      onClick={(e) => handleSupport(report.id, e)}
                      className={`flex items-center gap-1 text-xs cursor-pointer ${
                        report.supports.includes(user?.uid || '') ? 'text-primary font-bold' : 'text-muted hover:text-foreground'
                      }`}
                    >
                      <Users className="h-4 w-4" />
                      <span>{report.supports.length}</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          ))}
        </div>
      )}

      {/* COMPLAINT DETAIL MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl border border-card-border bg-card rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-card-border bg-card/60 backdrop-blur-md">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${getStatusColor(selectedReport.status)}`}>
                    {selectedReport.status}
                  </span>
                  <span className="text-[9px] font-semibold text-muted font-mono">{language === 'hi' ? 'आईडी:' : 'ID:'} {selectedReport.id}</span>
                </div>
                <h2 className="font-heading font-extrabold text-base md:text-lg text-foreground truncate mt-1">{selectedReport.title}</h2>
              </div>
              <button 
                onClick={() => setSelectedReport(null)}
                className="p-1 rounded-lg hover:bg-input text-muted hover:text-foreground cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Scroll Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Image banner */}
              <div className="h-56 rounded-2xl overflow-hidden bg-input border border-card-border">
                <img 
                  src={selectedReport.images[0]} 
                  alt="" 
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Grid content info */}
              <div className="grid md:grid-cols-3 gap-6">
                
                <div className="md:col-span-2 space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-muted-foreground">{t('description')}</h4>
                    <p className="text-xs sm:text-sm text-foreground leading-relaxed">{selectedReport.description}</p>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    <span>{selectedReport.address}</span>
                  </div>

                  {selectedReport.aiSummary && (
                    <div className="p-3 border border-primary/20 bg-primary/5 rounded-2xl text-xs space-y-1">
                      <div className="font-bold text-primary">{t('aiAnalysis')}</div>
                      <p className="text-muted leading-relaxed">{selectedReport.aiSummary}</p>
                    </div>
                  )}
                </div>

                {/* Left side timeline / details */}
                <div className="space-y-4 border-l border-card-border/80 pl-4 md:pl-6">
                  <div className="space-y-1.5 text-xs">
                    <span className="text-muted-foreground block font-semibold uppercase tracking-wider text-[10px]">{language === 'hi' ? 'रिपोर्ट का विवरण' : 'Report Details'}</span>
                    <div><span className="text-muted">{t('issueCategory')}:</span> <span className="font-semibold">{t(selectedReport.category === 'Road Damage' ? 'road_damage' : (selectedReport.category === 'Garbage' ? 'garbage' : (selectedReport.category === 'Water Leakage' ? 'water_leakage' : (selectedReport.category === 'Broken Streetlight' ? 'broken_streetlight' : 'other'))))}</span></div>
                    <div><span className="text-muted">{t('severity')}:</span> <span className="font-semibold text-red-500">{selectedReport.severity === 'High' && language === 'hi' ? 'उच्च' : (selectedReport.severity === 'Medium' && language === 'hi' ? 'मध्यम' : (selectedReport.severity === 'Low' && language === 'hi' ? 'निम्न' : selectedReport.severity))}</span></div>
                    <div><span className="text-muted">{t('priority')}:</span> <span className="font-semibold text-amber-500">{selectedReport.priority === 'High' && language === 'hi' ? 'उच्च' : (selectedReport.priority === 'Medium' && language === 'hi' ? 'मध्यम' : (selectedReport.priority === 'Low' && language === 'hi' ? 'निम्न' : selectedReport.priority))}</span></div>
                    <div><span className="text-muted">{language === 'hi' ? 'आवंटित वार्ड:' : 'Department:'}</span> <span className="font-semibold">{selectedReport.department === 'Public Works' && language === 'hi' ? 'लोक निर्माण विभाग' : (selectedReport.department === 'Sanitation' && language === 'hi' ? 'स्वच्छता विभाग' : (selectedReport.department === 'Water & Power' && language === 'hi' ? 'जल और विद्युत विभाग' : selectedReport.department))}</span></div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground pt-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{new Date(selectedReport.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* COMMENTS SECTION */}
              <div className="border-t border-card-border pt-5 space-y-4">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <MessageSquare className="h-4.5 w-4.5 text-muted" />
                  <span>{t('comments')} ({selectedReport.comments?.length || 0})</span>
                </h3>

                {/* Comment list */}
                <div className="space-y-3">
                  {(!selectedReport.comments || selectedReport.comments.length === 0) ? (
                    <div className="text-center text-xs text-muted py-6">{language === 'hi' ? 'पहला कमेंट करने वाले बनें।' : 'Be the first to leave a comment.'}</div>
                  ) : (
                    selectedReport.comments.map(c => (
                      <div key={c.id} className="flex gap-3 text-xs leading-relaxed items-start">
                        <img src={c.userPhoto} alt="" className="h-6 w-6 rounded-full object-cover mt-0.5" />
                        <div className="flex-1 bg-input/10 border border-card-border/40 p-2.5 rounded-2xl">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-foreground">{c.userName}</span>
                            <span className="text-[9px] text-muted">{new Date(c.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-muted-foreground">{c.text}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Post comment form */}
                {user ? (
                  <form onSubmit={handlePostComment} className="flex gap-2.5 pt-2">
                    <input 
                      type="text" 
                      placeholder={t('addCommentPlaceholder')}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="flex-1 h-9 px-3 bg-input border border-card-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button 
                      type="submit"
                      className="h-9 w-9 bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl flex items-center justify-center cursor-pointer shadow-sm"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                ) : (
                  <div className="text-center text-xs text-muted py-3 bg-input/10 rounded-2xl">
                    {language === 'hi' ? 'चर्चा धागे में भाग लेने के लिए कृपया लॉग इन करें।' : 'Please log in to participate in discussion threads.'}
                  </div>
                )}

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
