'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Camera, 
  Sparkles, 
  MapPin, 
  CheckCircle2, 
  ShieldAlert, 
  Award, 
  Layers, 
  Users,
  ChevronDown,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

export default function LandingPage() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const stats = [
    { value: '14,820+', label: 'Issues Resolved' },
    { value: '4.8s', label: 'Avg AI Analysis' },
    { value: '42%', label: 'Duplicate Prevention' },
    { value: '88/100', label: 'Avg Trust Score' },
  ];

  const features = [
    {
      icon: Camera,
      title: 'AI Image Detection',
      desc: 'Simply snap a photo. Our Gemini Vision model analyzes the image to categorise and gauge severity in seconds.'
    },
    {
      icon: ShieldAlert,
      title: 'Smart Prioritization',
      desc: 'Critical hazards (like exposed wiring or burst water mains) are auto-flagged and prioritized instantly for dispatch.'
    },
    {
      icon: Layers,
      title: 'Duplicate Prevention',
      desc: 'Our system runs location audits in real-time, matching categories to warn you of nearby duplicates, letting you join complaints instead.'
    },
    {
      icon: Award,
      title: 'Gamified Rewards',
      desc: 'Earn civic reward points for reporting verified reports. Swap points for transport passes, utility discounts, or park donations.'
    },
    {
      icon: Users,
      title: 'Community Backing',
      desc: 'Rally neighbors to support your complaint. The more citizens backing an issue, the faster local departments dispatch crews.'
    },
    {
      icon: TrendingUp,
      title: 'Trust Score System',
      desc: 'Build your profile score with honest reports. High trust score users receive instant dispatch bypassing review queues.'
    }
  ];

  const workflow = [
    { step: '01', icon: Camera, title: 'Capture & Upload', desc: 'Snap a picture of the civic issue from your mobile or drag and drop a file.' },
    { step: '02', icon: Sparkles, title: 'AI Vision Audit', desc: 'Gemini instantly fills out category, priority, department, title, and descriptions.' },
    { step: '03', icon: MapPin, title: 'GPS Location Pin', desc: 'Select or adjust the exact GPS coordinates and review report details.' },
    { step: '04', icon: CheckCircle2, title: 'Dispatch & Track', desc: 'Watch your complaint travel from Submitted to In Progress to Resolved.' }
  ];

  const faqs = [
    {
      q: 'How does CityPulse AI analyze uploaded photos?',
      a: 'We leverage the Gemini Vision API. When you upload a picture, the model inspects pixels to extract the classification (e.g. pothole, broken streetlight), estimates damage severity, drafts a title, and maps it to the relevant city department.'
    },
    {
      q: 'What prevents citizens from spamming fake complaints?',
      a: 'Every user starts with a neutral Trust Score. Reports submitted by low-trust accounts undergo manual verification by civic moderators. Submitting verified reports boosts your Trust Score, whereas spamming fake alerts lowers it.'
    },
    {
      q: 'How does duplicate detection work?',
      a: 'Before finalizing your report, CityPulse queries active issues in a 200-meter radius. If an issue matching your category already exists, we prompt you to "Join Complaint" instead of cluttering municipal portals.'
    },
    {
      q: 'Are the rewards redeemable in real life?',
      a: 'Currently, the catalog is configured with mock vouchers (free weekly bus passes, park donation sponsorships) for the hackathon prototype. These represent partnerships with local transit authorities and city departments.'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="glow-effect glow-primary top-10 left-10"></div>
      <div className="glow-effect glow-accent top-[600px] right-10"></div>

      <Navbar />

      {/* HERO SECTION */}
      <section className="relative mx-auto max-w-7xl px-4 pt-20 pb-16 sm:px-6 lg:px-8 flex flex-col items-center text-center z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold mb-6 animate-pulse-glow">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{t('tagline')}</span>
        </div>

        <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight max-w-4xl leading-tight">
          <span className="animate-motion-text">
            {language === 'hi' ? 'नागरिकों को सशक्त बनाना -' : 'Empowering Citizens Through'} <br className="hidden md:inline" />
            {language === 'hi' ? 'AI-संचालित नागरिक रिपोर्टिंग' : 'AI-Powered Civic Reporting'}
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-muted max-w-2xl leading-relaxed">
          {t('heroSubtitle')}
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Link 
            href={user ? "/dashboard" : "/auth"}
            className="w-full sm:w-auto inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/20 cursor-pointer"
          >
            <span>{t('getStarted')}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link 
            href="/community"
            className="w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-xl border border-card-border bg-card/60 backdrop-blur-md px-6 text-sm font-semibold text-foreground hover:bg-input transition-all cursor-pointer"
          >
            {t('exploreFeed')}
          </Link>
        </div>

        {/* HERO VISUAL SIMULATION */}
        <div className="mt-16 w-full max-w-4xl rounded-2xl border border-card-border bg-card/30 backdrop-blur-md p-2 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-accent/5 opacity-50 pointer-events-none rounded-2xl"></div>
          <div className="rounded-xl border border-card-border/80 bg-card overflow-hidden shadow-inner">
            <img 
              src="/hero-bg.png" 
              alt="CityPulse AI Dashboard Preview" 
              className="w-full h-auto object-cover opacity-90 transition-transform duration-700 group-hover:scale-[1.02]"
            />
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="border-y border-card-border bg-card/30 backdrop-blur-sm py-10 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {stats.map((s, idx) => (
            <div key={idx} className="space-y-1">
              <div className="text-3xl font-extrabold text-primary tracking-tight font-heading">{s.value}</div>
              <div className="text-xs text-muted font-medium uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 z-10 scroll-mt-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-foreground">
            Smart Features Built for Modern Cities
          </h2>
          <p className="mt-4 text-sm sm:text-base text-muted leading-relaxed">
            Everything you need to report infrastructure concerns, gather community upvotes, and see them resolved efficiently.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div 
                key={idx} 
                className="border border-card-border bg-card/60 backdrop-blur-md rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-xs text-muted leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* WORKFLOW SECTION (HOW IT WORKS) */}
      <section id="workflow" className="bg-card/40 border-y border-card-border py-20 z-10 scroll-mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-foreground">
              Report in Four Simple Steps
            </h2>
            <p className="mt-4 text-sm sm:text-base text-muted leading-relaxed">
              We bridge the gap between citizens and local authorities through simple workflows.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {workflow.map((w, idx) => {
              const Icon = w.icon;
              return (
                <div key={idx} className="flex flex-col items-center text-center relative z-10 group">
                  <div className="absolute top-0 right-4 text-5xl font-black text-primary/5 select-none">{w.step}</div>
                  <div className="h-14 w-14 rounded-2xl border border-card-border bg-card shadow-md text-primary flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{w.title}</h3>
                  <p className="text-xs text-muted max-w-[240px] leading-relaxed">{w.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-foreground">
            What Our Community Says
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Card 1 */}
          <div className="border border-card-border bg-card/60 backdrop-blur-md p-6 rounded-2xl shadow-sm">
            <p className="text-sm text-muted italic leading-relaxed">
              "Reporting issues in my neighborhood used to take weeks of visiting local offices. With CityPulse, I took a photo of an overflowing dump pile, and Gemini categorized it immediately. It was cleared by the municipality sanitation crew within 24 hours."
            </p>
            <div className="flex items-center gap-3 mt-4">
              <img 
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100" 
                alt="Priya Patel" 
                className="h-10 w-10 rounded-full object-cover"
              />
              <div>
                <h4 className="font-bold text-sm">Priya Patel</h4>
                <div className="text-[10px] text-accent font-semibold uppercase">Community Volunteer</div>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="border border-card-border bg-card/60 backdrop-blur-md p-6 rounded-2xl shadow-sm">
            <p className="text-sm text-muted italic leading-relaxed">
              "CityPulse AI has drastically reduced duplicate complaint filings sent to our municipal wards. The system prompts citizens to join active nearby issues rather than submitting duplicates, saving our staff massive administrative time."
            </p>
            <div className="flex items-center gap-3 mt-4">
              <img 
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100" 
                alt="Inspector Verma" 
                className="h-10 w-10 rounded-full object-cover"
              />
              <div>
                <h4 className="font-bold text-sm">Inspector Verma</h4>
                <div className="text-[10px] text-primary font-semibold uppercase">Municipal Supervisor</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="mx-auto max-w-3xl px-4 py-16 z-10 scroll-mt-16">
        <h2 className="font-heading font-bold text-3xl text-center mb-12 text-foreground">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className="border border-card-border bg-card/60 backdrop-blur-md rounded-xl overflow-hidden transition-all duration-300"
            >
              <button 
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="flex items-center justify-between w-full p-5 text-left font-semibold text-sm sm:text-base hover:bg-input/50 transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`h-5 w-5 text-muted transition-transform duration-300 ${activeFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              {activeFaq === idx && (
                <div className="p-5 border-t border-card-border text-xs sm:text-sm text-muted leading-relaxed bg-input/10">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-card-border bg-card/60 backdrop-blur-md py-12 z-10 mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5 font-heading font-bold text-lg">
            <div className="relative flex h-7 w-7 overflow-hidden rounded bg-card border border-card-border">
              <img 
                src="/logo.jpg" 
                alt="CityPulse AI Logo" 
                className="h-full w-full object-cover" 
              />
            </div>
            <span>CityPulse AI</span>
          </div>
          <div className="flex gap-6 text-xs text-muted">
            <a href="#" className="hover:text-foreground">Privacy Policy</a>
            <a href="#" className="hover:text-foreground">Terms of Service</a>
            <a href="#" className="hover:text-foreground">Contact Admin</a>
          </div>
          <div className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} CityPulse AI. Built for smarter, safer civic spaces.
          </div>
        </div>
      </footer>
    </div>
  );
}
