// src/types/NutritionLog.ts
import { Timestamp } from "firebase/firestore";

export interface NutritionLog {
  id: string; // firestore doc id
  userId: string;
  foodItem: string;
  calories: number;
  carbs: number;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}
