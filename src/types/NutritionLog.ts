import { Timestamp } from "firebase/firestore";

export interface NutritionLog {
  id: string; 
  userId: string;
  foodItem: string;
  calories: number;
  carbs: number;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}
