// src/features/nutrition/NutritionService.ts
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  Timestamp,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { NutritionLog } from "@/types/NutritionLog";

export class NutritionService {
  private static _instance: NutritionService | null = null;

  static get instance() {
    if (!this._instance) this._instance = new NutritionService();
    return this._instance!;
  }

  // Simple in-memory suggestions — you can later fetch from remote endpoint
  getFoodSuggestions() {
    return [
      { name: "Greek Yogurt", calories: 120, carbs: 6 },
      { name: "Banana", calories: 100, carbs: 27 },
      { name: "Grilled Chicken", calories: 220, carbs: 0 },
      { name: "Oatmeal", calories: 150, carbs: 27 },
      { name: "Almonds (28g)", calories: 160, carbs: 6 },
    ];
  }

  async addNutritionLog(log: Omit<NutritionLog, "id" | "createdAt" | "updatedAt">) {
    const payload = {
      ...log,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    const ref = await addDoc(collection(db, "nutritionLogs"), payload);
    return ref.id;
  }

  async deleteNutritionLog(logId: string) {
    await deleteDoc(doc(db, "nutritionLogs", logId));
  }

  // utility to fetch initial snapshot (non-subscribed)
  async fetchUserLogs(userId: string) {
    const q = query(
      collection(db, "nutritionLogs"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as NutritionLog[];
  }
}
