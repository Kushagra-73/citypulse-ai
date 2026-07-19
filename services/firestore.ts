import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  query, 
  orderBy, 
  limit, 
  where,
  addDoc
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/firebase/config';
import { CivicReport, Comment, Notification, RewardItem, UserProfile } from '@/types';
import toast from 'react-hot-toast';

// Storage Keys for Mock Mode
const REPORTS_KEY = 'citypulse_mock_reports_v2';
const NOTIFICATIONS_KEY = 'citypulse_mock_notifications_v2';
const REWARDS_KEY = 'citypulse_mock_rewards_v2';

// Mock Rewards Catalog
export const MOCK_REWARDS: RewardItem[] = [
  {
    id: 'rew_1',
    title: 'Free Namma Metro Smart Card Top-up',
    description: 'Complimentary weekly pass or ₹100 credit for BMTC buses and metro lines.',
    pointsCost: 100,
    icon: 'Bus',
    code: 'METRO-NAMA-BMTC-501',
    partner: 'Namma Metro (BMRCL) & BMTC'
  },
  {
    id: 'rew_2',
    title: 'Lalbagh Green Nursery Seed Coupon',
    description: 'Get ₹150 off high-quality organic seeds and saplings at Lalbagh botanical nurseries.',
    pointsCost: 75,
    icon: 'Leaf',
    code: 'LALBAGH-SEEDS-GROW',
    partner: 'Horticulture Department, Karnataka'
  },
  {
    id: 'rew_3',
    title: 'Free Science Gallery Entrance',
    description: 'Complimentary general admission ticket to the Visvesvaraya Industrial & Technological Museum.',
    pointsCost: 150,
    icon: 'Museum',
    code: 'VITM-SCIENCE-TICKET',
    partner: 'National Council of Science Museums'
  },
  {
    id: 'rew_4',
    title: 'Adopt-a-Sapling BBMP Sponsorship',
    description: 'Sponsor a tree planted in your name along city roads. Earns +50 Trust Score.',
    pointsCost: 200,
    icon: 'Tree',
    code: 'BBMP-TREE-SPONSOR-4',
    partner: 'BBMP Forest Department'
  }
];

// Mock Seed Civic Reports
const MOCK_SEED_REPORTS: CivicReport[] = [
  {
    id: 'rep_101',
    title: 'Overflowing Waste Bin near MG Road Metro Station',
    description: 'The green waste container is completely overflowing. Plastic bottles and litter are blowing onto the main road, creating bad odor and unhygienic conditions.',
    category: 'Garbage',
    severity: 'Medium',
    priority: 'Medium',
    status: 'Submitted',
    images: ['https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=600'],
    latitude: 12.9756,
    longitude: 77.6068,
    address: 'MG Road Metro Station Exit, Bengaluru, Karnataka, 560001',
    createdBy: 'user_arjun',
    creatorName: 'Arjun Sharma',
    creatorPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(), // 3 hrs ago
    updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    likes: ['user_priya'],
    supports: [],
    comments: [],
    department: 'Sanitation',
    aiSummary: 'Public waste bin overflowing near transit hub entrance.',
    confidence: 0.96,
    duplicateCheck: false
  },
  {
    id: 'rep_102',
    title: 'Dangerous Pothole on Indiranagar 100 Feet Road',
    description: 'Deep, hazardous pothole near the central traffic signal. Multiple two-wheelers are swerving suddenly to avoid it, creating severe risk of skid accidents.',
    category: 'Road Damage',
    severity: 'High',
    priority: 'High',
    status: 'In Progress',
    images: ['https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=600'],
    latitude: 12.9718,
    longitude: 77.6412,
    address: '100 Feet Rd, near Doopanahalli, Indiranagar, Bengaluru, Karnataka, 560008',
    createdBy: 'user_priya',
    creatorName: 'Priya Patel',
    creatorPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    likes: ['user_arjun', 'user_rohan'],
    supports: ['user_arjun'],
    comments: [
      {
        id: 'com_1',
        reportId: 'rep_102',
        userId: 'admin_officer',
        userName: 'Inspector Verma',
        userPhoto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150',
        text: 'Repair team has been assigned. Pothole filling scheduled for Monday morning.',
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
      }
    ],
    department: 'Public Works',
    aiSummary: 'Large pothole on high-speed lane.',
    confidence: 0.98,
    duplicateCheck: false
  },
  {
    id: 'rep_103',
    title: 'Unlit Streetlight Poles at Cubbon Park Jogging Path',
    description: 'Three consecutive lampposts are completely dark. Visibility is extremely low, raising security and safety concerns for evening joggers.',
    category: 'Broken Streetlight',
    severity: 'Medium',
    priority: 'High',
    status: 'Assigned',
    images: ['https://images.unsplash.com/photo-1509024644558-2f56ce76c490?auto=format&fit=crop&q=80&w=600'],
    latitude: 12.9722,
    longitude: 77.5925,
    address: 'Cubbon Park Walking Track, Bengaluru, Karnataka, 560001',
    createdBy: 'user_rohan',
    creatorName: 'Rohan Gupta',
    creatorPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(), // 5 days ago
    updatedAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    likes: ['user_priya'],
    supports: ['user_priya'],
    comments: [],
    department: 'Water & Power',
    aiSummary: 'Broken park lampposts leaving track completely unlit.',
    confidence: 0.94,
    duplicateCheck: false
  },
  {
    id: 'rep_104',
    title: 'Water Hydrant Pipe Burst Flooding Koramangala Road',
    description: 'Clean water is leaking heavily from a cracked joint on the water supply line. Hundreds of liters wasted, local street flooding is starting.',
    category: 'Water Leakage',
    severity: 'Critical',
    priority: 'Critical',
    status: 'Resolved',
    images: ['https://images.unsplash.com/photo-1542044896530-05d85be9b11a?auto=format&fit=crop&q=80&w=600'],
    latitude: 12.9332,
    longitude: 77.6238,
    address: '80 Feet Road, Koramangala 4th Block, Bengaluru, Karnataka, 560034',
    createdBy: 'user_arjun',
    creatorName: 'Arjun Sharma',
    creatorPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    createdAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 9).toISOString(),
    likes: ['user_rohan', 'user_priya'],
    supports: ['user_rohan', 'user_priya'],
    comments: [
      {
        id: 'com_2',
        reportId: 'rep_104',
        userId: 'admin_officer',
        userName: 'Inspector Verma',
        userPhoto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150',
        text: 'BWSSB repair valve isolated. Leak patched successfully.',
        createdAt: new Date(Date.now() - 3600000 * 24 * 9).toISOString()
      }
    ],
    department: 'Water & Power',
    aiSummary: 'Water pipe joint rupture resolved by BWSSB team.',
    confidence: 0.97,
    duplicateCheck: false
  }
];


// Helper to seed localStorage
function getLocalReports(): CivicReport[] {
  if (typeof window === 'undefined') return [];
  const reports = localStorage.getItem(REPORTS_KEY);
  if (!reports) {
    localStorage.setItem(REPORTS_KEY, JSON.stringify(MOCK_SEED_REPORTS));
    return MOCK_SEED_REPORTS;
  }
  return JSON.parse(reports);
}

function saveLocalReports(reports: CivicReport[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
}

// 1. REPORT CRUDS
export async function getReports(): Promise<CivicReport[]> {
  if (!isFirebaseConfigured || !db) {
    return getLocalReports().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  try {
    const q = query(collection(db!, 'reports'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CivicReport));
  } catch (error) {
    console.error('Firestore getReports failed, fallback to local database:', error);
    return getLocalReports().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

export async function submitReport(
  reportData: Omit<CivicReport, 'id' | 'likes' | 'supports' | 'comments' | 'createdAt' | 'updatedAt'>
): Promise<CivicReport> {
  const now = new Date().toISOString();
  const newReport: CivicReport = {
    ...reportData,
    id: 'rep_' + Math.random().toString(36).substr(2, 9),
    likes: [],
    supports: [],
    comments: [],
    createdAt: now,
    updatedAt: now,
  };

  if (!isFirebaseConfigured || !db) {
    const local = getLocalReports();
    local.push(newReport);
    saveLocalReports(local);
    
    // Add a status notification for the user
    await createNotification(
      reportData.createdBy,
      'Report Submitted',
      `Your report for "${reportData.title}" was submitted successfully. AI analysis has assigned priority: ${reportData.priority}.`,
      'ai_completed'
    );
    return newReport;
  }

  try {
    const reportRef = collection(db!, 'reports');
    const docRef = await addDoc(reportRef, newReport);
    newReport.id = docRef.id;

    // Create real-time notification
    await createNotification(
      reportData.createdBy,
      'Report Submitted',
      `Your report for "${reportData.title}" was submitted successfully.`,
      'ai_completed'
    );

    return newReport;
  } catch (error) {
    console.error('Firestore submitReport failed, saving locally:', error);
    const local = getLocalReports();
    local.push(newReport);
    saveLocalReports(local);
    return newReport;
  }
}

// 2. SOCIAL ACTIONS (UPVOTE / LIKE)
export async function toggleLike(reportId: string, userId: string): Promise<string[]> {
  if (!isFirebaseConfigured || !db) {
    const reports = getLocalReports();
    const repIndex = reports.findIndex(r => r.id === reportId);
    let likes: string[] = [];
    if (repIndex > -1) {
      likes = reports[repIndex].likes || [];
      if (likes.includes(userId)) {
        likes = likes.filter(id => id !== userId);
      } else {
        likes.push(userId);
      }
      reports[repIndex].likes = likes;
      saveLocalReports(reports);
    }
    return likes;
  }

  try {
    const ref = doc(db!, 'reports', reportId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return [];

    const likes = snap.data().likes || [];
    if (likes.includes(userId)) {
      await updateDoc(ref, { likes: arrayRemove(userId) });
      return likes.filter((id: string) => id !== userId);
    } else {
      await updateDoc(ref, { likes: arrayUnion(userId) });
      return [...likes, userId];
    }
  } catch (error) {
    console.error('Firestore toggleLike failed:', error);
    return [];
  }
}

// 3. JOINING COMPLAINT (SUPPORT)
export async function toggleSupport(reportId: string, userId: string): Promise<string[]> {
  if (!isFirebaseConfigured || !db) {
    const reports = getLocalReports();
    const repIndex = reports.findIndex(r => r.id === reportId);
    let supports: string[] = [];
    if (repIndex > -1) {
      supports = reports[repIndex].supports || [];
      if (supports.includes(userId)) {
        supports = supports.filter(id => id !== userId);
      } else {
        supports.push(userId);
        // Alert the complaint owner of new support
        if (reports[repIndex].createdBy !== userId) {
          await createNotification(
            reports[repIndex].createdBy,
            'New Supporter!',
            `Another citizen backed your complaint: "${reports[repIndex].title}".`,
            'support_received'
          );
        }
      }
      reports[repIndex].supports = supports;
      saveLocalReports(reports);
    }
    return supports;
  }

  try {
    const ref = doc(db!, 'reports', reportId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return [];

    const supports = snap.data().supports || [];
    const createdBy = snap.data().createdBy;

    if (supports.includes(userId)) {
      await updateDoc(ref, { supports: arrayRemove(userId) });
      return supports.filter((id: string) => id !== userId);
    } else {
      await updateDoc(ref, { supports: arrayUnion(userId) });
      if (createdBy !== userId) {
        await createNotification(
          createdBy,
          'New Supporter!',
          `Another citizen joined your complaint: "${snap.data().title}".`,
          'support_received'
        );
      }
      return [...supports, userId];
    }
  } catch (error) {
    console.error('Firestore toggleSupport failed:', error);
    return [];
  }
}

// 4. COMMENTS ACCESSIBILITY
export async function addComment(
  reportId: string, 
  userId: string, 
  userName: string, 
  userPhoto: string, 
  text: string
): Promise<Comment> {
  const newComment: Comment = {
    id: 'com_' + Math.random().toString(36).substr(2, 9),
    reportId,
    userId,
    userName,
    userPhoto,
    text,
    createdAt: new Date().toISOString()
  };

  if (!isFirebaseConfigured || !db) {
    const reports = getLocalReports();
    const index = reports.findIndex(r => r.id === reportId);
    if (index > -1) {
      reports[index].comments = reports[index].comments || [];
      reports[index].comments.push(newComment);
      saveLocalReports(reports);

      if (reports[index].createdBy !== userId) {
        await createNotification(
          reports[index].createdBy,
          'New Comment',
          `${userName} commented on your report "${reports[index].title}".`,
          'status_update'
        );
      }
    }
    return newComment;
  }

  try {
    const ref = doc(db!, 'reports', reportId);
    await updateDoc(ref, {
      comments: arrayUnion(newComment)
    });

    const snap = await getDoc(ref);
    if (snap.exists() && snap.data().createdBy !== userId) {
      await createNotification(
        snap.data().createdBy,
        'New Comment',
        `${userName} commented on your report: "${snap.data().title}".`,
        'status_update'
      );
    }

    return newComment;
  } catch (error) {
    console.error('Firestore addComment failed:', error);
    return newComment;
  }
}

// 5. NOTIFICATIONS
export async function getNotifications(userId: string): Promise<Notification[]> {
  if (!isFirebaseConfigured || !db) {
    const notificationsStr = localStorage.getItem(NOTIFICATIONS_KEY);
    if (!notificationsStr) {
      const initNote: Notification[] = [
        {
          id: 'note_init_1',
          userId,
          title: 'Welcome to CityPulse AI',
          message: 'Thank you for downloading the platform! Earn rewards by reporting public infrastructure flaws.',
          type: 'reward_earned',
          read: false,
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(initNote));
      return initNote;
    }
    const notes: Notification[] = JSON.parse(notificationsStr);
    return notes.filter(n => n.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  try {
    const q = query(
      collection(db!, 'notifications'), 
      where('userId', '==', userId), 
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
  } catch (error) {
    console.error('Firestore getNotifications failed:', error);
    return [];
  }
}

export async function createNotification(
  userId: string, 
  title: string, 
  message: string, 
  type: Notification['type']
): Promise<void> {
  const newNote: Notification = {
    id: 'note_' + Math.random().toString(36).substr(2, 9),
    userId,
    title,
    message,
    type,
    read: false,
    createdAt: new Date().toISOString()
  };

  if (!isFirebaseConfigured || !db) {
    const notesStr = localStorage.getItem(NOTIFICATIONS_KEY);
    const notes = notesStr ? JSON.parse(notesStr) : [];
    notes.push(newNote);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notes));
    return;
  }

  try {
    await addDoc(collection(db!, 'notifications'), newNote);
  } catch (error) {
    console.error('Firestore createNotification failed:', error);
  }
}

export async function markNotificationsAsRead(userId: string): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    const notesStr = localStorage.getItem(NOTIFICATIONS_KEY);
    if (notesStr) {
      const notes: Notification[] = JSON.parse(notesStr);
      const updated = notes.map(n => n.userId === userId ? { ...n, read: true } : n);
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    }
    return;
  }

  try {
    const q = query(collection(db!, 'notifications'), where('userId', '==', userId), where('read', '==', false));
    const snap = await getDocs(q);
    snap.docs.forEach(async (d) => {
      await updateDoc(doc(db!, 'notifications', d.id), { read: true });
    });
  } catch (error) {
    console.error('Firestore markNotificationsAsRead failed:', error);
  }
}

// 6. REWARDS REDEMPTION
export async function redeemReward(userId: string, rewardId: string): Promise<string | null> {
  const reward = MOCK_REWARDS.find(r => r.id === rewardId);
  if (!reward) return null;

  // Real or Mock - auth state is fetched on client, so we do validation there.
  // Generate a redeemed item record in local mock database.
  const redeemedCode = reward.code + '-' + Math.floor(1000 + Math.random() * 9000);
  
  await createNotification(
    userId,
    'Reward Unlocked!',
    `Redeemed: "${reward.title}" for ${reward.pointsCost} points. Code: ${redeemedCode}`,
    'reward_earned'
  );

  return redeemedCode;
}

// 7. USER ACCESS (LEADERBOARD)
export async function getUsers(): Promise<UserProfile[]> {
  const mockContributors: UserProfile[] = [
    { uid: 'user_priya', name: 'Priya Patel', rewardPoints: 340, trustScore: 92, photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', email: 'priya@citypulse.ai', joinedDate: new Date().toISOString(), reportsCount: 5, badges: ['First Step'] },
    { uid: 'user_arjun', name: 'Arjun Sharma', rewardPoints: 240, trustScore: 85, photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150', email: 'arjun@citypulse.ai', joinedDate: new Date().toISOString(), reportsCount: 4, badges: ['First Step'] },
    { uid: 'user_rohan', name: 'Rohan Gupta', rewardPoints: 195, trustScore: 88, photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150', email: 'rohan@citypulse.ai', joinedDate: new Date().toISOString(), reportsCount: 3, badges: ['First Step'] },
  ];

  if (!isFirebaseConfigured || !db) {
    return mockContributors;
  }

  try {
    const q = query(collection(db!, 'users'), orderBy('rewardPoints', 'desc'), limit(10));
    const snap = await getDocs(q);
    if (snap.empty) return mockContributors;
    const users = snap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
    
    // Merge mock contributors if there are very few registered users for presentation
    if (users.length < 3) {
      const merged = [...users];
      mockContributors.forEach(c => {
        if (!merged.find(u => u.uid === c.uid || u.email === c.email)) {
          merged.push(c);
        }
      });
      return merged.sort((a, b) => b.rewardPoints - a.rewardPoints);
    }

    return users;
  } catch (error) {
    console.error('Firestore getUsers failed:', error);
    return mockContributors;
  }
}
