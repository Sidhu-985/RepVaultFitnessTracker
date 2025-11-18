import { Timestamp } from 'firebase/firestore';

export interface User {
  id: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  photoURL?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  clientType?: 'General' | 'StrengthTraining' | 'FatLoss' 
  age?: number;
  gender?: 'Male' | 'Female' | 'Other';
  height?: number; // in cm
  weight?: number; // in kg
}

export interface Activity {
  id: string;
  userId: string;
  date: Timestamp;
  steps: number;
  calories: number;
  distance: number; // in km
  heartRate?: number;
  activeMinutes?: number;
  createdAt: Timestamp;
}

export interface Workout {
  id: string;
  userId: string;
  name: string;
  type: 'cardio' | 'strength' | 'flexibility' | 'sports' | 'other';
  duration: number; // in minutes
  calories: number;
  intensity: 'low' | 'moderate' | 'high';
  notes?: string;
  date: Timestamp;
  createdAt: Timestamp;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  type: 'steps' | 'calories' | 'workouts' | 'weight' | 'custom';
  targetValue: number;
  currentValue: number;
  unit: string;
  period: 'daily' | 'weekly' | 'monthly';
  startDate: Timestamp;
  endDate: Timestamp;
  reminderEnabled: boolean;
  reminderTime?: string;
  isCompleted: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface DailyStats {
  steps: number;
  calories: number;
  heartRate: number;
  distance: number;
  activeMinutes: number;
}
