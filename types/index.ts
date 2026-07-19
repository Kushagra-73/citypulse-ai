import { z } from 'zod';

// Issue Status Types
export type IssueStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'Closed'
  | 'Rejected';

// Issue Metadata Types
export type IssueSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type IssuePriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type IssueCategory =
  | 'Road Damage'
  | 'Garbage'
  | 'Water Leakage'
  | 'Broken Streetlight'
  | 'Traffic'
  | 'Illegal Dumping'
  | 'Drainage'
  | 'Electricity'
  | 'Public Safety'
  | 'Trees'
  | 'Construction'
  | 'Noise'
  | 'Other';

// Geolocation coordinate structures
export interface GeolocationData {
  latitude: number;
  longitude: number;
  address: string;
}

// User Profile Schema
export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photo: string;
  trustScore: number; // 0 - 100
  rewardPoints: number;
  badges: string[]; // Badge IDs
  joinedDate: string;
  reportsCount: number;
  isGuest?: boolean;
}

// Comment Schema
export interface Comment {
  id: string;
  reportId: string;
  userId: string;
  userName: string;
  userPhoto: string;
  text: string;
  createdAt: string;
}

// Main Civic Report Schema
export interface CivicReport {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  severity: IssueSeverity;
  priority: IssuePriority;
  status: IssueStatus;
  images: string[]; // URLs or base64 images
  latitude: number;
  longitude: number;
  address: string;
  createdBy: string; // User UID
  creatorName: string;
  creatorPhoto: string;
  createdAt: string;
  updatedAt: string;
  likes: string[]; // Array of User UIDs
  supports: string[]; // Array of User UIDs who join/verify this report
  comments: Comment[];
  department: string;
  aiSummary: string;
  confidence: number;
  duplicateCheck: boolean;
}

// Notification Schema
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'status_update' | 'reward_earned' | 'nearby_report' | 'support_received' | 'ai_completed';
  read: boolean;
  createdAt: string;
}

// Redeemable Reward Item Schema
export interface RewardItem {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  icon: string; // Lucide icon name
  code: string;
  partner: string;
}

// Zod validation for report submission form
export const reportFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters long'),
  category: z.custom<IssueCategory>((val) => typeof val === 'string', 'Please select a valid category'),
  severity: z.custom<IssueSeverity>((val) => typeof val === 'string', 'Please select severity level'),
  priority: z.custom<IssuePriority>((val) => typeof val === 'string', 'Please select priority level'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().min(3, 'Address is required'),
  images: z.array(z.string()).min(1, 'Please upload at least one issue image'),
  department: z.string().min(1, 'Department is required'),
  aiSummary: z.string().optional(),
  confidence: z.number().optional(),
});

export type ReportFormValues = z.infer<typeof reportFormSchema>;
