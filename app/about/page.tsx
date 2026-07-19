'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Shield, Sparkles, MapPin, Award, Users, Heart } from 'lucide-react';

const TRANSLATIONS = {
  en: {
    title: 'About CityPulse AI',
    subtitle: 'Connecting citizen voices with machine intelligence to build smarter cities.',
    missionTitle: 'Our Civic Mission',
    missionDesc: 'Empowering residents and transforming neighborhoods. CityPulse AI links local community engagement with modern machine learning vision systems to resolve public infrastructure issues rapidly.',
    techTitle: 'Core Core Technology Pillars',
    techDesc1: 'Instant Report Capture: Take a photo of broken streetlights, trash pile-ups, or street potholes from any angle.',
    techDesc2: 'Gemini AI Vision Analysis: Our multi-modal models automatically categorize, describe, and prioritize hazards in seconds.',
    techDesc3: 'Duplicate Prevention: Geolocation audits automatically flag nearby issues, letting users endorse existing tickets.',
    techDesc4: 'Gamified Payouts: Verified reports earn civic points redeemable for transport passes and community green space sponsorships.',
    indiaFocusTitle: 'Empowering Indian Municipalities',
    indiaFocusDesc: 'Tailored specifically for cities like Bengaluru, Karnataka. We aim to help local municipal corporations (like the BBMP) dispatch repair crews dynamically by crowdsourcing verified visual ground-truth data directly from active citizens.',
    teamTitle: 'Building the Future of Open Governance',
    teamDesc: 'We believe that public infrastructure management should be transparent, automated, and community-driven. By giving every citizen an AI-assisted portal in their pocket, we create a self-healing city ecosystem.'
  },
  hi: {
    title: 'सिटीपल्स AI के बारे में',
    subtitle: 'नागरिकों की आवाज़ को मशीन इंटेलिजेंस से जोड़कर स्मार्ट शहरों का निर्माण करना।',
    missionTitle: 'हमारा नागरिक उद्देश्य',
    missionDesc: 'निवासियों को सशक्त बनाना और पड़ोस का कायाकल्प करना। सिटीपल्स AI सार्वजनिक बुनियादी ढांचे की समस्याओं को तेजी से हल करने के लिए स्थानीय सामुदायिक जुड़ाव को आधुनिक मशीन लर्निंग विज़न सिस्टम के साथ जोड़ता है।',
    techTitle: 'मुख्य तकनीकी स्तंभ',
    techDesc1: 'त्वरित रिपोर्ट कैप्चर: किसी भी कोण से टूटी हुई स्ट्रीटलाइट्स, कचरे के ढेर, या सड़क के गड्ढों की तस्वीर लें।',
    techDesc2: 'जेमिनी AI विज़न विश्लेषण: हमारे बहु-मोडल मॉडल सेकंड में खतरों को वर्गीकृत, वर्णित और प्राथमिकता देते हैं।',
    techDesc3: 'डुप्लिकेट रोकथाम: जियोलोकेशन ऑडिट स्वचालित रूप से आस-पास के मुद्दों को फ़्लैग करते हैं, जिससे उपयोगकर्ता मौजूदा टिकटों का समर्थन कर सकते हैं।',
    techDesc4: 'गेमीफाइड पुरस्कार: सत्यापित रिपोर्टें परिवहन पास और सामुदायिक वृक्ष प्रायोजन के लिए अंक अर्जित करती हैं।',
    indiaFocusTitle: 'भारतीय नगरपालिकाओं को सशक्त बनाना',
    indiaFocusDesc: 'विशेष रूप से बेंगलुरु, कर्नाटक जैसे शहरों के लिए तैयार किया गया है। हमारा लक्ष्य सक्रिय नागरिकों से सीधे सत्यापित जमीनी दृश्य डेटा एकत्र करके स्थानीय नगर निगमों (जैसे BBMP) को मरम्मत दलों को गतिशील रूप से भेजने में मदद करना है।',
    teamTitle: 'खुले शासन के भविष्य का निर्माण',
    teamDesc: 'हमारा मानना है कि सार्वजनिक बुनियादी ढांचा प्रबंधन पारदर्शी, स्वचालित और समुदाय-संचालित होना चाहिए। प्रत्येक नागरिक को उनकी जेब में एक AI-सहायता प्राप्त पोर्टल देकर, हम एक स्व-उपचार शहर पारिस्थितिकी तंत्र का निर्माण करते।'
  }
};

export default function AboutPage() {
  const { language } = useLanguage();
  const lang = language === 'hi' ? 'hi' : 'en';
  const tLocal = TRANSLATIONS[lang];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* HEADER */}
      <div className="border-b border-card-border pb-5">
        <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-foreground flex items-center gap-2">
          <span className="animate-motion-text">{tLocal.title}</span>
          <Heart className="h-6 w-6 text-red-500 fill-current animate-pulse" />
        </h1>
        <p className="text-xs text-muted-foreground mt-1">{tLocal.subtitle}</p>
      </div>

      {/* CORE VISION & MISSION */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Mission Card */}
        <div className="border border-card-border bg-card rounded-3xl p-5 space-y-3 shadow-sm flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="font-bold text-sm flex items-center gap-2 text-primary">
              <Shield className="h-4.5 w-4.5" />
              <span>{tLocal.missionTitle}</span>
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              {tLocal.missionDesc}
            </p>
          </div>
          <div className="text-[10px] text-muted-foreground font-semibold pt-4">
            🌿 Bengaluru Municipal Initiative
          </div>
        </div>

        {/* BBMP / India Focus Card */}
        <div className="border border-card-border bg-card rounded-3xl p-5 space-y-3 shadow-sm flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="font-bold text-sm flex items-center gap-2 text-accent">
              <MapPin className="h-4.5 w-4.5" />
              <span>{tLocal.indiaFocusTitle}</span>
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              {tLocal.indiaFocusDesc}
            </p>
          </div>
          <div className="text-[10px] text-muted-foreground font-semibold pt-4">
            🏢 Ward Level Dispatch Integration
          </div>
        </div>

      </div>

      {/* CORE PILLARS FLOW */}
      <div className="border border-card-border bg-card rounded-3xl p-6 space-y-4 shadow-sm">
        <h3 className="font-bold text-sm flex items-center gap-2">
          <Sparkles className="h-4.5 w-4.5 text-primary" />
          <span>{tLocal.techTitle}</span>
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-input/10 border border-card-border/40 space-y-1">
            <span className="text-[10px] font-bold text-primary block uppercase">01. Image Upload</span>
            <p className="text-xs text-muted-foreground leading-relaxed">{tLocal.techDesc1}</p>
          </div>
          <div className="p-4 rounded-2xl bg-input/10 border border-card-border/40 space-y-1">
            <span className="text-[10px] font-bold text-accent block uppercase">02. Gemini Vision</span>
            <p className="text-xs text-muted-foreground leading-relaxed">{tLocal.techDesc2}</p>
          </div>
          <div className="p-4 rounded-2xl bg-input/10 border border-card-border/40 space-y-1">
            <span className="text-[10px] font-bold text-indigo-400 block uppercase">03. Geofenced Auditing</span>
            <p className="text-xs text-muted-foreground leading-relaxed">{tLocal.techDesc3}</p>
          </div>
          <div className="p-4 rounded-2xl bg-input/10 border border-card-border/40 space-y-1">
            <span className="text-[10px] font-bold text-emerald-500 block uppercase">04. Redeem Rewards</span>
            <p className="text-xs text-muted-foreground leading-relaxed">{tLocal.techDesc4}</p>
          </div>
        </div>
      </div>

      {/* TEAM SECTION */}
      <div className="border border-card-border bg-gradient-to-br from-primary/5 via-accent/5 to-indigo-500/5 rounded-3xl p-6 space-y-3 shadow-sm">
        <h3 className="font-bold text-sm text-foreground">{tLocal.teamTitle}</h3>
        <p className="text-xs text-muted leading-relaxed">
          {tLocal.teamDesc}
        </p>
      </div>

    </div>
  );
}
