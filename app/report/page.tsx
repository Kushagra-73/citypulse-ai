'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGeolocation } from '@/hooks/useGeolocation';
import { getReports, submitReport, toggleSupport } from '@/services/firestore';
import { CivicReport, IssueCategory, IssueSeverity, IssuePriority } from '@/types';
import { 
  Camera, 
  Sparkles, 
  MapPin, 
  Check, 
  AlertTriangle, 
  Upload, 
  ShieldAlert, 
  Award,
  ArrowRight,
  ArrowLeft,
  XCircle,
  Trash2,
  Lightbulb,
  Droplet,
  Zap,
  Hammer,
  HelpCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

// Dynamically import map
const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), { 
  ssr: false,
  loading: () => <div className="h-64 bg-input rounded-2xl animate-pulse flex items-center justify-center text-xs text-muted">Loading locator canvas...</div>
});

const REPORT_TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    // Step headers
    step1_title: 'Step 1 of 5: Select Issue Category',
    step2_title: 'Step 2 of 5: Upload Photo & Details',
    step3_title: 'Step 3 of 5: AI Audit & Verification',
    step4_title: 'Step 4 of 5: Select Location',
    step5_title: 'Step 5 of 5: Review & Publish Report',
    step6_title: 'Submission Confirmation',
    
    // Step 1
    step1_heading: 'What issue would you like to report?',
    step1_subheading: 'Select one of the common civic instances below to start your verified report.',
    road_damage: 'Road Damage',
    road_damage_desc: 'Potholes, cracks, and broken tar',
    garbage: 'Garbage & Sanitation',
    garbage_desc: 'Overflowing bins and litter dumps',
    water_leakage: 'Water Leakage',
    water_leakage_desc: 'Pipe bursts and flooding gutters',
    broken_streetlight: 'Broken Streetlight',
    broken_streetlight_desc: 'Unlit lampposts and dark zones',
    electricity: 'Electricity Hazards',
    electricity_desc: 'Hanging wires and transformer sparks',
    other: 'Other Concern',
    other_desc: 'General municipal issues & claims',
    
    // Step 2
    step2_heading: 'Upload Photo & Describe the Issue',
    step2_selected_cat: 'Category Selected',
    step2_upload_title: 'Click to upload issue photos',
    step2_upload_subtitle: 'You can upload up to 5 photos showing different angles',
    step2_add_photo: 'Add Photo',
    step2_remove: 'Remove',
    step2_remove_photo: 'Remove Photo',
    step2_title_label: 'Title / Topic',
    step2_title_placeholder: 'e.g., Pothole causing traffic delay',
    step2_desc_label: 'Issue Description',
    step2_desc_placeholder: 'Describe what is wrong, the visual details, and why it is a safety hazard...',
    btn_verify: 'Verify Issue',
    
    // Step 3
    step3_verifying: 'Running AI Verification...',
    step3_verifying_desc: 'Gemini is checking if the image is genuine or fake, and calculating your reward payout.',
    step3_genuine_title: 'AI Verification Result: GENUINE ISSUE',
    step3_fake_title: 'AI Verification Result: FRAUD DETECTED',
    step3_genuine_desc: 'This report contains verified public infrastructure concerns. Submitting it will earn you reward points!',
    step3_fake_desc: 'This upload has been flagged as invalid/fake. Reason:',
    step3_outcome: 'Outcome & Point Impact',
    step3_genuine_case: 'If Issue is Genuine',
    step3_genuine_case_desc: 'You will earn +15 Reward Points and gain +1.0% Trust Score.',
    step3_fake_case: 'If Issue is Fake / Spam',
    step3_fake_case_desc: 'Your profile will be penalized -50 Reward Points and lose -15.0% Trust Score.',
    step3_cat_identified: 'Category Identified:',
    step3_confidence: 'Confidence Score:',
    step3_assigned_ward: 'Assigned Ward:',
    step3_safety_alert: 'Safety Alert:',
    
    // Step 4
    step4_heading: 'Select Incident Location',
    step4_subheading: 'Type your address manually or mark coordinates on the interactive map below.',
    
    // Step 5
    step5_heading: 'Review Report Details',
    step5_subheading: 'Please review your ticket before publishing it to the community dashboard.',
    step5_address_label: 'Assigned Address:',
    step5_coordinates: 'Coordinates:',
    btn_publish: 'Publish Complaint',
    
    // Step 6
    step6_saffron_heading: 'Submission Rejected & Flagged',
    step6_saffron_desc: 'Our system determined this report was invalid or fake. A citation penalty has been added to your profile.',
    step6_verif_result: 'Verification Result:',
    step6_assigned_audit: 'Assigned Audit:',
    step6_action_taken: 'Action Taken:',
    step6_action_rejected: 'Ticket Rejected',
    step6_penalty_text: 'Civic Penalty: -50 Points (Trust -15%)',
    btn_dashboard: 'Go to Dashboard',
    
    // Shared buttons
    btn_back: 'Back',
    btn_appeal: 'Appeal & Proceed',
    btn_location: 'Select Location'
  },
  hi: {
    // Step headers
    step1_title: 'चरण 1 का 5: समस्या की श्रेणी चुनें',
    step2_title: 'चरण 2 का 5: फोटो और विवरण अपलोड करें',
    step3_title: 'चरण 3 का 5: AI ऑडिट और सत्यापन',
    step4_title: 'चरण 4 का 5: स्थान चुनें',
    step5_title: 'चरण 5 का 5: समीक्षा करें और प्रकाशित करें',
    step6_title: 'प्रस्तुति पुष्टि',
    
    // Step 1
    step1_heading: 'आप किस समस्या की रिपोर्ट करना चाहेंगे?',
    step1_subheading: 'सत्यापित रिपोर्ट शुरू करने के लिए नीचे दिए गए सामान्य नागरिक उदाहरणों में से एक चुनें।',
    road_damage: 'सड़क की क्षति',
    road_damage_desc: 'गड्ढे, दरारें और टूटी हुई डामर',
    garbage: 'कचरा और स्वच्छता',
    garbage_desc: 'अतिप्रवाहित डिब्बे और कचरा डंप',
    water_leakage: 'पानी का रिसाव',
    water_leakage_desc: 'पाइप फटना और बहती नालियाँ',
    broken_streetlight: 'टूटी हुई स्ट्रीटलाइट',
    broken_streetlight_desc: 'बिना रोशनी वाले खंभे और अंधेरे क्षेत्र',
    electricity: 'बिजली के खतरे',
    electricity_desc: 'लटकते तार और ट्रांसफार्मर की चिंगारी',
    other: 'अन्य चिंता',
    other_desc: 'सामान्य नगर पालिका मुद्दे और दावे',
    
    // Step 2
    step2_heading: 'फोटो अपलोड करें और समस्या का वर्णन करें',
    step2_selected_cat: 'चयनित श्रेणी',
    step2_upload_title: 'समस्या की तस्वीरें अपलोड करने के लिए क्लिक करें',
    step2_upload_subtitle: 'आप विभिन्न कोणों को दिखाते हुए 5 तस्वीरें अपलोड कर सकते हैं',
    step2_add_photo: 'फोटो जोड़ें',
    step2_remove: 'हटाएं',
    step2_remove_photo: 'फोटो हटाएं',
    step2_title_label: 'शीर्षक / विषय',
    step2_title_placeholder: 'जैसे, गड्ढे के कारण यातायात में देरी',
    step2_desc_label: 'समस्या का विवरण',
    step2_desc_placeholder: 'समस्या क्या है, दृश्य विवरण, और यह सुरक्षा के लिए खतरा क्यों है, इसका वर्णन करें...',
    btn_verify: 'समस्या सत्यापित करें',
    
    // Step 3
    step3_verifying: 'AI सत्यापन चल रहा है...',
    step3_verifying_desc: 'जेमिनी जांच कर रहा है कि छवि वास्तविक है या नकली, और आपके पुरस्कार भुगतान की गणना कर रहा है।',
    step3_genuine_title: 'AI सत्यापन परिणाम: वास्तविक मुद्दा',
    step3_fake_title: 'AI सत्यापन परिणाम: धोखाधड़ी का पता चला',
    step3_genuine_desc: 'इस रिपोर्ट में सत्यापित सार्वजनिक बुनियादी ढांचे की चिंताएं शामिल हैं। इसे सबमिट करने पर आपको पुरस्कार अंक मिलेंगे!',
    step3_fake_desc: 'इस अपलोड को अमान्य/नकली के रूप में चिह्नित किया गया है। कारण:',
    step3_outcome: 'परिणाम और अंक प्रभाव',
    step3_genuine_case: 'यदि मुद्दा वास्तविक है',
    step3_genuine_case_desc: 'आप +15 पुरस्कार अंक अर्जित करेंगे और +1.0% विश्वास स्कोर प्राप्त करेंगे।',
    step3_fake_case: 'यदि मुद्दा नकली / स्पैम है',
    step3_fake_case_desc: 'आपके प्रोफ़ाइल पर -50 पुरस्कार अंक का जुर्माना लगाया जाएगा और -15.0% विश्वास स्कोर खो देंगे।',
    step3_cat_identified: 'पहचानी गई श्रेणी:',
    step3_confidence: 'सत्यापन विश्वसनीयता:',
    step3_assigned_ward: 'आवंटित वार्ड:',
    step3_safety_alert: 'सुरक्षा चेतावनी:',
    
    // Step 4
    step4_heading: 'घटना का स्थान चुनें',
    step4_subheading: 'अपना पता मैन्युअल रूप से टाइप करें या नीचे दिए गए इंटरैक्टिव मानचित्र पर निर्देशांक चिह्नित करें।',
    
    // Step 5
    step5_heading: 'रिपोर्ट विवरण की समीक्षा करें',
    step5_subheading: 'कृपया समुदाय डैशबोर्ड पर प्रकाशित करने से पहले अपनी शिकायत की समीक्षा करें।',
    step5_address_label: 'आवंटित पता:',
    step5_coordinates: 'निर्देशांक:',
    btn_publish: 'शिकायत प्रकाशित करें',
    
    // Step 6
    step6_saffron_heading: 'प्रस्तुति अस्वीकृत और ध्वजांकित',
    step6_saffron_desc: 'हमारे सिस्टम ने निर्धारित किया कि यह रिपोर्ट अमान्य या नकली थी। आपकी प्रोफ़ाइल में एक जुर्माना जोड़ा गया है।',
    step6_verif_result: 'सत्यापन परिणाम:',
    step6_assigned_audit: 'आवंटित ऑडिट:',
    step6_action_taken: 'की गई कार्रवाई:',
    step6_action_rejected: 'टिकट अस्वीकृत',
    step6_penalty_text: 'नागरिक दंड: -50 अंक (विश्वास -15%)',
    btn_dashboard: 'डैशबोर्ड पर जाएं',
    
    // Shared buttons
    btn_back: 'पीछे',
    btn_appeal: 'अपील करें और आगे बढ़ें',
    btn_location: 'स्थान चुनें'
  }
};

const CATEGORIES = [
  'Road Damage', 'Garbage', 'Water Leakage', 'Broken Streetlight', 
  'Traffic', 'Illegal Dumping', 'Drainage', 'Electricity', 
  'Public Safety', 'Trees', 'Construction', 'Noise', 'Other'
];

export default function ReportIssuePage() {
  const router = useRouter();
  const { user, updatePointsAndTrust } = useAuth();
  const { t, language } = useLanguage();
  const { getCoordinates, loading: locationLoading } = useGeolocation();

  // Form Steps: 1 = Image, 2 = AI review, 3 = Location, 4 = Review, 5 = Success
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form States
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IssueCategory>('Other');
  const [severity, setSeverity] = useState<IssueSeverity>('Medium');
  const [priority, setPriority] = useState<IssuePriority>('Medium');
  const [department, setDepartment] = useState('Public Works');
  const [aiSummary, setAiSummary] = useState('');
  const [confidence, setConfidence] = useState(1.0);
  const [tags, setTags] = useState<string[]>([]);
  const [safetyWarning, setSafetyWarning] = useState('');

  // Location States
  const [latitude, setLatitude] = useState(12.9716);
  const [longitude, setLongitude] = useState(77.5946);
  const [address, setAddress] = useState('MG Road, Bengaluru, Karnataka, 560001');

  // Duplicate Check states
  const [duplicates, setDuplicates] = useState<CivicReport[]>([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  // Success states
  const [complaintId, setComplaintId] = useState('');
  
  // AI Audit validity states
  const [isValidCivicIssue, setIsValidCivicIssue] = useState(true);
  const [isFake, setIsFake] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [wasPenalized, setWasPenalized] = useState(false);

  const rT = (key: string): string => {
    const lang = language === 'hi' ? 'hi' : 'en';
    return REPORT_TRANSLATIONS[lang]?.[key] || REPORT_TRANSLATIONS['en']?.[key] || key;
  };

  // Helper to analyze image pixels asynchronously
  const analyzeImagePixels = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 10;
          canvas.height = 10;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve('default');
            return;
          }
          ctx.drawImage(img, 0, 0, 10, 10);
          const imgData = ctx.getImageData(0, 0, 10, 10).data;
          let totalR = 0, totalG = 0, totalB = 0;
          for (let i = 0; i < imgData.length; i += 4) {
            totalR += imgData[i];
            totalG += imgData[i + 1];
            totalB += imgData[i + 2];
          }
          const numPixels = 100;
          const avgR = totalR / numPixels;
          const avgG = totalG / numPixels;
          const avgB = totalB / numPixels;
          const brightness = (avgR + avgG + avgB) / 3;

          // Heuristic thresholds
          if (brightness < 50) {
            resolve('streetlight'); // Dark night photo
          } else if (avgB - avgR > 10 && avgB - avgG > 10) {
            resolve('leakage'); // Water/blue dominance
          } else {
            // Check color variation for trash vs gray potholes
            let colorVariance = 0;
            for (let i = 0; i < imgData.length; i += 4) {
              const r = imgData[i];
              const g = imgData[i + 1];
              const b = imgData[i + 2];
              colorVariance += Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r);
            }
            const avgVariance = colorVariance / numPixels;
            if (avgVariance < 28) {
              resolve('pothole'); // Grey asphalt/road surface
            } else {
              resolve('garbage'); // Colorful/varied refuse
            }
          }
        } catch (e) {
          console.error('Failed to run pixel scan:', e);
          resolve('default');
        }
      };
      img.onerror = () => {
        resolve('default');
      };
      img.src = base64Str;
    });
  };



  // Step 2: Trigger AI Analysis API Route
  const triggerAIAnalysis = async (base64Img: string, categoryHint: string = 'default') => {
    setLoading(true);
    setStep(3);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Img, categoryHint }),
      });

      if (!res.ok) throw new Error('Analysis failed');

      const data = await res.json();
      
      // Auto-populate
      setTitle(data.title);
      setDescription(data.description);
      setCategory(data.category as IssueCategory);
      setSeverity(data.severity as IssueSeverity);
      setPriority(data.priority as IssuePriority);
      setDepartment(data.department);
      setAiSummary(data.summary);
      setConfidence(data.confidence);
      setTags(data.tags);
      setSafetyWarning(data.safetyWarning);
      
      // Fraud checks
      setIsValidCivicIssue(data.isValidCivicIssue ?? true);
      setIsFake(data.isFake ?? false);
      setRejectReason(data.rejectReason ?? '');

      toast.success('Gemini AI analysis complete!');
    } catch (err) {
      console.error(err);
      toast.error('AI analysis failed. Please complete details manually.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Trigger GPS Geolocation lookup
  const handleGPSLocation = async () => {
    const coords = await getCoordinates();
    if (coords) {
      setLatitude(coords.latitude);
      setLongitude(coords.longitude);
      setAddress(coords.address);
      toast.success('Coordinates retrieved from GPS!');
    } else {
      toast.error('Could not get GPS coordinate. Drag pin manually.');
    }
  };

  // Step 4: Duplicate Scan & Final Submission
  const checkForDuplicates = async () => {
    // Scan locally or Firestore for complaints of same category in a 500m radius
    const allReports = await getReports();
    const radiusLimit = 0.0045; // ~500 meters grid difference

    const nearbyDupes = allReports.filter(r => {
      const sameCategory = r.category === category;
      const isNearby = 
        Math.abs(r.latitude - latitude) < radiusLimit && 
        Math.abs(r.longitude - longitude) < radiusLimit;
      const isOpen = r.status !== 'Resolved' && r.status !== 'Closed' && r.status !== 'Rejected';
      return sameCategory && isNearby && isOpen;
    });

    if (nearbyDupes.length > 0) {
      setDuplicates(nearbyDupes);
      setShowDuplicateModal(true);
    } else {
      // No duplicates: proceed directly to submit
      executeSubmission();
    }
  };

  const handleJoinExisting = async (reportId: string) => {
    if (!user) return;
    try {
      await toggleSupport(reportId, user.uid);
      // Give points to user for backing civic reports
      updatePointsAndTrust(10, 0.5);
      toast.success('Joined complaint! You earned +10 reward points.');
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      toast.error('Failed to join complaint.');
    }
  };

  const executeSubmission = async () => {
    if (!user || images.length === 0) return;
    setLoading(true);
    try {
      const isFakeReport = !isValidCivicIssue;

      const report = await submitReport({
        title,
        description,
        category,
        severity,
        priority,
        status: isFakeReport ? 'Rejected' : 'Submitted',
        images,
        latitude,
        longitude,
        address,
        createdBy: user.uid,
        creatorName: user.name,
        creatorPhoto: user.photo,
        department: isFakeReport ? 'Security' : department,
        aiSummary: isFakeReport ? 'Flagged: Fake/Unrelated image rejected by AI audit.' : aiSummary,
        confidence,
        duplicateCheck: duplicates.length > 0,
      });

      setComplaintId(report.id);
      
      if (isFakeReport) {
        updatePointsAndTrust(-50, -15.0); // Penalty: -50 Points, -15.0 Trust
        setWasPenalized(true);
        toast.error('AI Verification Failed: Deducted 50 points and 15% Trust Score.');
      } else {
        updatePointsAndTrust(15, 1.0); // Reward: +15 Points, +1.0 Trust
        setWasPenalized(false);
      }
      
      setStep(6);
    } catch (err) {
      console.error(err);
      toast.error('Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* HEADER PROGRESS BAR */}
      <div className="flex justify-between items-center pb-2 border-b border-card-border">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-foreground animate-in fade-in slide-in-from-top-1 duration-300">
            <span className="animate-motion-text">{step === 6 ? rT('step6_title') : (language === 'hi' ? 'नागरिक समस्या रिपोर्ट करें' : 'Report Civic Issue')}</span>
          </h1>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {step === 1 && rT('step1_title')}
            {step === 2 && rT('step2_title')}
            {step === 3 && rT('step3_title')}
            {step === 4 && rT('step4_title')}
            {step === 5 && rT('step5_title')}
            {step === 6 && rT('step6_title')}
          </p>
        </div>
        {step < 6 && (
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <span 
                key={s} 
                className={`h-1.5 w-8 rounded-full transition-colors ${
                  s <= step ? 'bg-primary' : 'bg-input'
                }`}
              ></span>
            ))}
          </div>
        )}
      </div>

      {/* STEP 1: SELECT INSTANCE TOPIC */}
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="text-center max-w-md mx-auto space-y-2">
            <h2 className="font-heading font-extrabold text-lg text-foreground">{rT('step1_heading')}</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {rT('step1_subheading')}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { id: 'Road Damage', title: rT('road_damage'), desc: rT('road_damage_desc'), icon: Hammer, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
              { id: 'Garbage', title: rT('garbage'), desc: rT('garbage_desc'), icon: Trash2, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
              { id: 'Water Leakage', title: rT('water_leakage'), desc: rT('water_leakage_desc'), icon: Droplet, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
              { id: 'Broken Streetlight', title: rT('broken_streetlight'), desc: rT('broken_streetlight_desc'), icon: Lightbulb, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
              { id: 'Electricity', title: rT('electricity'), desc: rT('electricity_desc'), icon: Zap, color: 'text-red-500 bg-red-500/10 border-red-500/20' },
              { id: 'Other', title: rT('other'), desc: rT('other_desc'), icon: HelpCircle, color: 'text-muted-foreground bg-input border-card-border' }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCategory(item.id as IssueCategory);
                    // Autofill default department based on category selection
                    if (item.id === 'Road Damage') setDepartment('Public Works');
                    else if (item.id === 'Garbage') setDepartment('Sanitation');
                    else if (item.id === 'Water Leakage' || item.id === 'Broken Streetlight' || item.id === 'Electricity') setDepartment('Water & Power');
                    else setDepartment('Public Works');
                    setStep(2);
                  }}
                  className="flex flex-col p-5 border border-card-border bg-card rounded-2xl text-left hover:scale-[1.02] hover:border-primary/50 transition-all duration-200 cursor-pointer hover:shadow-md space-y-3"
                >
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${item.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-foreground">{item.title}</h4>
                    <p className="text-[10px] text-muted-foreground leading-normal">{item.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 2: UPLOAD PHOTOS & DETAILS */}
      {step === 2 && (
        <div className="border border-card-border bg-card rounded-3xl p-6 space-y-6 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div>
            <h3 className="font-bold text-sm text-foreground">{rT('step2_heading')}</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">{rT('step2_selected_cat')}: <strong className="text-primary">{t(category)}</strong></p>
          </div>

          <div className="space-y-4">
            
            {/* Multiple Images Container */}
            <div className="border border-card-border/55 rounded-2xl p-4 bg-input/5">
              {images.length === 0 ? (
                <label className="flex flex-col items-center justify-center text-center py-8 space-y-2 cursor-pointer border-2 border-dashed border-card-border rounded-xl hover:border-primary/50 transition-colors min-h-[140px]">
                  <Camera className="h-8 w-8 text-muted" />
                  <div className="text-xs font-semibold text-foreground">{rT('step2_upload_title')}</div>
                  <div className="text-[10px] text-muted-foreground">{rT('step2_upload_subtitle')}</div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setImages([reader.result as string]);
                      };
                      reader.readAsDataURL(file);
                    }} 
                    className="hidden" 
                  />
                </label>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 w-full">
                  {images.map((imgSrc, idx) => (
                    <div key={idx} className="relative h-24 rounded-xl overflow-hidden border border-card-border group">
                      <img src={imgSrc} alt={`Upload preview ${idx}`} className="h-full w-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1.5 right-1.5 bg-red-600/90 hover:bg-red-500 text-white rounded-lg p-1 text-[8px] font-bold transition-all shadow"
                      >
                        {rT('step2_remove')}
                      </button>
                      <div className="absolute bottom-1 left-1 bg-black/60 px-1.5 py-0.5 rounded text-[8px] font-semibold text-white">
                        {language === 'hi' ? 'तस्वीर #' : 'Photo #'}{idx + 1}
                      </div>
                    </div>
                  ))}
                  {images.length < 5 && (
                    <label className="flex flex-col items-center justify-center border border-dashed border-card-border rounded-xl h-24 bg-input/10 hover:border-primary/50 transition-colors cursor-pointer text-center space-y-1">
                      <Camera className="h-5 w-5 text-muted-foreground" />
                      <span className="text-[9px] font-bold text-muted-foreground">{rT('step2_add_photo')}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setImages(prev => [...prev, reader.result as string]);
                          };
                          reader.readAsDataURL(file);
                        }} 
                        className="hidden" 
                      />
                    </label>
                  )}
                </div>
              )}
            </div>

            {/* Title & Description Fields */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">{rT('step2_title_label')}</label>
                <input 
                  type="text" 
                  placeholder={rT('step2_title_placeholder')}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-10 px-3 bg-input border border-card-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">{rT('step2_desc_label')}</label>
                <textarea 
                  rows={4}
                  placeholder={rT('step2_desc_placeholder')}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 bg-input border border-card-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-card-border">
            <button 
              onClick={() => setStep(1)}
              className="inline-flex h-10 items-center justify-center gap-1.5 border border-card-border hover:bg-input px-4 rounded-xl text-xs font-semibold"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{rT('btn_back')}</span>
            </button>
            
            <button 
              onClick={async () => {
                if (images.length === 0) {
                  toast.error(language === 'hi' ? 'कृपया समस्या की कम से कम एक तस्वीर चुनें/अपलोड करें।' : 'Please select/upload at least one photo of the issue.');
                  return;
                }
                if (title.length < 5) {
                  toast.error(language === 'hi' ? 'शीर्षक कम से कम 5 वर्णों का होना चाहिए।' : 'Title must be at least 5 characters long.');
                  return;
                }
                if (description.length < 10) {
                  toast.error(language === 'hi' ? 'विवरण कम से कम 10 वर्णों का होना चाहिए।' : 'Description must be at least 10 characters long.');
                  return;
                }

                // Call AI verification
                // Determine categoryHint based on title/category
                const textForHint = (title + ' ' + category).toLowerCase();
                let hint = 'default';
                if (textForHint.includes('fake') || textForHint.includes('meme') || textForHint.includes('spam') || textForHint.includes('unrelated')) {
                  hint = 'fake';
                } else if (textForHint.includes('garbage') || textForHint.includes('trash') || textForHint.includes('waste') || textForHint.includes('bin') || textForHint.includes('litter') || textForHint.includes('alamy') || textForHint.includes('c9cgag')) {
                  hint = 'garbage';
                } else if (textForHint.includes('pothole') || textForHint.includes('road') || textForHint.includes('asphalt') || textForHint.includes('crack')) {
                  hint = 'pothole';
                } else if (textForHint.includes('leak') || textForHint.includes('water') || textForHint.includes('pipe') || textForHint.includes('burst')) {
                  hint = 'leakage';
                } else if (textForHint.includes('light') || textForHint.includes('lamp') || textForHint.includes('streetlamp') || textForHint.includes('dark')) {
                  hint = 'streetlight';
                }

                triggerAIAnalysis(images[0], hint);
              }}
              className="inline-flex h-10 items-center justify-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/95 px-4 rounded-xl text-xs font-semibold cursor-pointer shadow-md shadow-primary/20"
            >
              <span>{rT('btn_verify')}</span>
              <Sparkles className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: AI VERIFICATION & AUDIT AUDIENCE */}
      {step === 3 && (
        <div className="border border-card-border bg-card rounded-3xl p-6 space-y-5 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          {loading ? (
            <div className="space-y-4 py-8 flex flex-col items-center text-center">
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary animate-bounce">
                <Sparkles className="h-7 w-7" />
              </div>
              <div>
                <h3 className="font-bold text-md animate-pulse">{rT('step3_verifying')}</h3>
                <p className="text-xs text-muted mt-1 max-w-xs leading-relaxed">
                  {rT('step3_verifying_desc')}
                </p>
              </div>
              <div className="w-full space-y-2.5 mt-6 animate-pulse">
                <div className="h-4 bg-input rounded w-3/4"></div>
                <div className="h-4 bg-input rounded w-5/6"></div>
                <div className="h-20 bg-input rounded"></div>
              </div>
            </div>
          ) : (
            <>
              {/* Verdict header */}
              <div className={`p-4 rounded-2xl border text-center space-y-2 ${
                isValidCivicIssue 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 animate-pulse-glow' 
                  : 'bg-red-500/10 border-red-500/30 text-red-500 animate-pulse-glow'
              }`}>
                <div className="flex items-center justify-center gap-2 font-heading font-black text-base">
                  {isValidCivicIssue ? (
                    <>
                      <Check className="h-5 w-5" />
                      <span>{rT('step3_genuine_title')}</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="h-5 w-5" />
                      <span>{rT('step3_fake_title')}</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-normal max-w-md mx-auto">
                  {isValidCivicIssue 
                    ? rT('step3_genuine_desc')
                    : `${rT('step3_fake_desc')} ${rejectReason || (language === 'hi' ? 'असंबंधित छवि।' : 'Unrelated image.')}`}
                </p>
              </div>

              {/* Point increase / deduction warning card */}
              <div className="bg-input/20 border border-card-border rounded-2xl p-5 space-y-4">
                <h4 className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider">{rT('step3_outcome')}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Genuine Case */}
                  <div className={`p-3.5 rounded-xl border space-y-1 transition-all ${isValidCivicIssue ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-card-border opacity-50'}`}>
                    <div className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                      <Award className="h-4 w-4" />
                      <span>{rT('step3_genuine_case')}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-normal">
                      {language === 'hi' ? (
                        <>आप अर्जित करेंगे <strong className="text-emerald-500 font-semibold">+15 पुरस्कार अंक</strong> और विश्वास स्कोर में पाएंगे <strong className="text-emerald-500 font-semibold">+1.0%</strong>।</>
                      ) : (
                        <>You will earn <strong className="text-emerald-500 font-semibold">+15 Reward Points</strong> and gain <strong className="text-emerald-500 font-semibold">+1.0% Trust Score</strong>.</>
                      )}
                    </p>
                  </div>

                  {/* Fake Case */}
                  <div className={`p-3.5 rounded-xl border space-y-1 transition-all ${!isValidCivicIssue ? 'border-red-500/40 bg-red-500/5' : 'border-card-border opacity-50'}`}>
                    <div className="text-xs font-bold text-red-500 flex items-center gap-1.5">
                      <ShieldAlert className="h-4 w-4" />
                      <span>{rT('step3_fake_case')}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-normal">
                      {language === 'hi' ? (
                        <>आपके प्रोफ़ाइल पर दंड लगाया जाएगा <strong className="text-red-500 font-semibold">-50 पुरस्कार अंक</strong> और विश्वास स्कोर खो देंगे <strong className="text-red-500 font-semibold">-15.0%</strong>।</>
                      ) : (
                        <>Your profile will be penalized <strong className="text-red-500 font-semibold">-50 Reward Points</strong> and lose <strong className="text-red-500 font-semibold">-15.0% Trust Score</strong>.</>
                      )}
                    </p>
                  </div>

                </div>
              </div>

              {/* Verified metadata fields */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-muted-foreground font-semibold">{rT('step3_cat_identified')}</span>
                  <div className="font-bold text-foreground">{t(category)}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground font-semibold">{rT('step3_confidence')}</span>
                  <div className="font-bold text-foreground">{Math.round(confidence * 100)}%</div>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground font-semibold">{rT('step3_assigned_ward')}</span>
                  <div className="font-bold text-foreground">{department === 'Public Works' && language === 'hi' ? 'लोक निर्माण विभाग' : (department === 'Sanitation' && language === 'hi' ? 'स्वच्छता विभाग' : (department === 'Water & Power' && language === 'hi' ? 'जल और विद्युत विभाग' : department))}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground font-semibold">{rT('step3_safety_alert')}</span>
                  <div className="font-bold text-red-500">{safetyWarning || (language === 'hi' ? 'कोई नहीं' : 'None')}</div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {tags.map((t, idx) => (
                  <span key={idx} className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-input text-muted-foreground">
                    #{t}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-card-border">
                <button 
                  onClick={() => setStep(2)}
                  className="inline-flex h-10 items-center justify-center gap-1.5 border border-card-border hover:bg-input px-4 rounded-xl text-xs font-semibold"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>{rT('btn_back')}</span>
                </button>
                
                <button 
                  onClick={() => {
                    if (!isValidCivicIssue) {
                      const confirmAppeal = window.confirm(
                        language === 'hi' 
                          ? "AI सत्यापन चेतावनी:\nयह छवि असंबंधित या नकली के रूप में चिह्नित की गई थी।\n\nइसे सबमिट करने पर स्पैम दंड के रूप में 50 अंक और 15% विश्वास स्कोर काटा जाएगा।\n\nक्या आप सुनिश्चित हैं कि आप अपील करना और आगे बढ़ना चाहते हैं?"
                          : "AI Verification WARNING:\nThis image was flagged as unrelated or fake.\n\nSubmitting this will deduct 50 points and 15% Trust Score as a spam penalty.\n\nAre you sure you want to appeal and proceed?"
                      );
                      if (!confirmAppeal) return;
                    }
                    setStep(4);
                  }}
                  className={`inline-flex h-10 items-center justify-center gap-1.5 px-4 rounded-xl text-xs font-semibold cursor-pointer ${
                    isValidCivicIssue 
                      ? 'bg-primary text-primary-foreground hover:bg-primary/95 shadow-md shadow-primary/20' 
                      : 'bg-red-600 text-white hover:bg-red-500'
                  }`}
                >
                  <span>{isValidCivicIssue ? rT('btn_location') : rT('btn_appeal')}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </>
          )}

        </div>
      )}

      {/* STEP 4: LOCATION SELECTION */}
      {step === 4 && (
        <div className="border border-card-border bg-card rounded-3xl p-6 space-y-4 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div>
            <h3 className="font-bold text-sm text-foreground">{rT('step4_heading')}</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {rT('step4_subheading')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <button
              onClick={handleGPSLocation}
              disabled={locationLoading}
              className="inline-flex h-10 items-center justify-center gap-1.5 border border-card-border hover:bg-input px-4 rounded-xl text-xs font-bold shrink-0 cursor-pointer"
            >
              {locationLoading ? (
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              ) : (
                <MapPin className="h-4 w-4 text-primary" />
              )}
              <span>{language === 'hi' ? 'जीपीएस खोज' : 'GPS Search'}</span>
            </button>
            <input 
              type="text" 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="flex-1 h-10 px-3 bg-input border border-card-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary truncate"
            />
          </div>

          <div className="h-72 relative rounded-2xl overflow-hidden border border-card-border">
            <InteractiveMap 
              latitude={latitude} 
              longitude={longitude} 
              address={address}
              readOnly={false}
              onChange={(lat, lng, addr) => {
                setLatitude(lat);
                setLongitude(lng);
                setAddress(addr);
              }}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-card-border">
            <button 
              onClick={() => setStep(3)}
              className="inline-flex h-10 items-center justify-center gap-1.5 border border-card-border hover:bg-input px-4 rounded-xl text-xs font-semibold"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{rT('btn_back')}</span>
            </button>
            
            <button 
              onClick={() => setStep(5)}
              className="inline-flex h-10 items-center justify-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/95 px-4 rounded-xl text-xs font-semibold cursor-pointer"
            >
              <span>{language === 'hi' ? 'समीक्षा रिपोर्ट' : 'Review Report'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

        </div>
      )}

      {/* STEP 5: REVIEW REPORT SUMMARY */}
      {step === 5 && (
        <div className="border border-card-border bg-card rounded-3xl p-6 space-y-6 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div>
            <h3 className="font-bold text-sm text-foreground">{rT('step5_heading')}</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">{rT('step5_subheading')}</p>
          </div>

          <div className="space-y-4">
            
            {/* Visual Review block */}
            <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-input/10 border border-card-border/80">
              {images.length > 0 && (
                <div className="flex gap-2 overflow-x-auto shrink-0 pb-1 max-w-full sm:max-w-[200px]">
                  {images.map((imgSrc, idx) => (
                    <img 
                      key={idx}
                      src={imgSrc} 
                      alt={`civic upload ${idx + 1}`} 
                      className="h-20 w-20 rounded-xl object-cover border border-card-border shrink-0"
                    />
                  ))}
                </div>
              )}
              <div className="flex-1 space-y-1.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary uppercase">{t(category)}</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                    isValidCivicIssue ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                  }`}>
                    {isValidCivicIssue ? (language === 'hi' ? 'वास्तविक' : 'Genuine') : (language === 'hi' ? 'ध्वजांकित ऑडिट' : 'Flagged Audit')}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-foreground truncate">{title}</h4>
                <p className="text-xs text-muted leading-relaxed line-clamp-2">{description}</p>
              </div>
            </div>

            {/* Location row */}
            <div className="flex items-start gap-2 text-xs p-3 rounded-2xl bg-input/10 border border-card-border/40">
              <MapPin className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-foreground">{rT('step5_address_label')}</span>
                <p className="text-muted leading-relaxed mt-0.5">{address}</p>
                <div className="text-[10px] text-muted-foreground mt-1">{rT('step5_coordinates')} {latitude.toFixed(5)}, {longitude.toFixed(5)}</div>
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-card-border">
            <button 
              onClick={() => setStep(4)}
              className="inline-flex h-10 items-center justify-center gap-1.5 border border-card-border hover:bg-input px-4 rounded-xl text-xs font-semibold"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{rT('btn_back')}</span>
            </button>
            
            <button 
              onClick={checkForDuplicates}
              disabled={loading}
              className="inline-flex h-10 items-center justify-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/95 px-5 rounded-xl text-xs font-semibold cursor-pointer shadow-md shadow-primary/20"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
              ) : (
                <>
                  <span>{rT('btn_publish')}</span>
                  <Check className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

        </div>
      )}

      {/* STEP 6: SUCCESS REDIRECT OR PENALTY NOTICE */}
      {step === 6 && (
        <div className="border border-card-border bg-card rounded-3xl p-8 text-center space-y-6 shadow-md relative overflow-hidden animate-in zoom-in-95 duration-300">
          {wasPenalized ? (
            <>
              <div className="absolute inset-0 bg-gradient-to-tr from-red-500/5 to-amber-500/5 pointer-events-none"></div>

              <div className="h-16 w-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto animate-pulse-glow">
                <XCircle className="h-8 w-8" />
              </div>

              <div className="space-y-2">
                <h2 className="font-heading font-extrabold text-2xl text-red-500">{rT('step6_saffron_heading')}</h2>
                <p className="text-xs text-muted max-w-sm mx-auto leading-relaxed">
                  {rT('step6_saffron_desc')}
                </p>
              </div>

              {/* Ticket Information card */}
              <div className="bg-input/20 border border-card-border rounded-2xl p-4 max-w-sm mx-auto space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-semibold">{rT('step6_verif_result')}</span>
                  <span className="font-bold text-red-500">{language === 'hi' ? 'धोखाधड़ी का पता चला' : 'FRAUD DETECTED'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{rT('step6_assigned_audit')}</span>
                  <span className="font-mono text-foreground">{complaintId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{rT('step6_action_taken')}</span>
                  <span className="text-red-500 font-bold">{rT('step6_action_rejected')}</span>
                </div>
              </div>

              {/* Point Deduction Penalty Box */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-amber-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md">
                <ShieldAlert className="h-4 w-4" />
                <span>{rT('step6_penalty_text')}</span>
              </div>
            </>
          ) : (
            <>
              {/* Confetti decorations */}
              <div className="absolute inset-0 bg-gradient-to-tr from-accent/5 to-primary/5 pointer-events-none"></div>

              <div className="h-16 w-16 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto animate-pulse-glow">
                <Check className="h-8 w-8" />
              </div>

              <div className="space-y-2">
                <h2 className="font-heading font-extrabold text-2xl text-foreground">{t('successTitle')}</h2>
                <p className="text-xs text-muted max-w-sm mx-auto leading-relaxed">
                  {t('successSubtitle')}
                </p>
              </div>

              {/* Ticket Information card */}
              <div className="bg-input/20 border border-card-border rounded-2xl p-4 max-w-sm mx-auto space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{language === 'hi' ? 'शिकायत आईडी:' : 'Complaint ID:'}</span>
                  <span className="font-mono font-bold text-foreground">{complaintId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{language === 'hi' ? 'आवंटित विभाग:' : 'Assigned Department:'}</span>
                  <span className="font-semibold text-foreground">{department === 'Public Works' && language === 'hi' ? 'लोक निर्माण विभाग' : (department === 'Sanitation' && language === 'hi' ? 'स्वच्छता विभाग' : (department === 'Water & Power' && language === 'hi' ? 'जल और विद्युत विभाग' : department))}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{language === 'hi' ? 'दस्ते भेजे गए:' : 'Crews Dispatched:'}</span>
                  <span className="text-primary font-bold">{language === 'hi' ? 'मानक कतार' : 'Standard Queue'}</span>
                </div>
              </div>

              {/* Point Payout Reward Box */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-accent to-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md">
                <Award className="h-4 w-4" />
                <span>{language === 'hi' ? 'नागरिक भुगतान: +15 अंक (विश्वास +1.0)' : 'Civic Payout: +15 Points (Trust +1.0)'}</span>
              </div>
            </>
          )}

          <div className="pt-2">
            <button 
              onClick={() => router.push('/dashboard')}
              className="inline-flex h-10 items-center justify-center gap-1.5 border border-card-border bg-card hover:bg-input px-6 rounded-xl text-xs font-semibold cursor-pointer"
            >
              <span>{rT('btn_dashboard')}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* DUPLICATE WARNING MODAL */}
      {showDuplicateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md border border-card-border bg-card rounded-2xl shadow-xl p-6 space-y-4">
            
            <div className="flex items-start gap-3 text-amber-500">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm text-foreground">{t('duplicateWarning')}</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                  {language === 'hi' ? (
                    <><strong>{t(category)}</strong> श्रेणी में एक समान रिपोर्ट पहले से ही पास में प्रकाशित की गई है। मौजूदा शिकायत में शामिल होने से समाधान की प्राथमिकता बढ़ती है!</>
                  ) : (
                    <>A similar report in the <strong>{category}</strong> category has already been published nearby. Backing the existing ticket boosts priority and speeds up resolution!</>
                  )}
                </p>
              </div>
            </div>

            {/* List of duplicate complaints */}
            <div className="space-y-3 max-h-40 overflow-y-auto">
              {duplicates.map(dupe => (
                <div key={dupe.id} className="p-3 border border-card-border bg-input/10 rounded-xl flex justify-between items-center gap-4">
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs truncate text-foreground">{dupe.title}</h4>
                    <span className="text-[9px] text-muted truncate block mt-0.5">{dupe.address}</span>
                  </div>
                  <button
                    onClick={() => handleJoinExisting(dupe.id)}
                    className="inline-flex h-8 items-center justify-center bg-primary text-primary-foreground hover:bg-primary/95 text-[10px] font-bold px-3 rounded-lg cursor-pointer whitespace-nowrap"
                  >
                    {t('joinExisting')}
                  </button>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex justify-between items-center pt-2">
              <button 
                onClick={() => setShowDuplicateModal(false)}
                className="text-xs text-muted-foreground hover:text-foreground cursor-pointer font-medium"
              >
                {language === 'hi' ? 'रद्द करें' : 'Cancel'}
              </button>
              <button 
                onClick={() => {
                  setShowDuplicateModal(false);
                  executeSubmission();
                }}
                className="inline-flex h-9 items-center justify-center bg-input hover:bg-card-border border border-card-border px-4 rounded-lg text-xs font-semibold cursor-pointer"
              >
                {language === 'hi' ? 'नई रिपोर्ट के साथ आगे बढ़ें' : 'Continue with New Report'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
