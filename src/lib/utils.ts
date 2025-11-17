import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc, Timestamp } from "firebase/firestore";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Update user's goals based on workout calories
 * - For "calories" goals: add workout calories to currentValue
 * - For "workouts" goals: increment count by 1
 * - Auto-complete goals when target is reached
 */
export async function updateGoalsProgress(userId: string, workoutCalories: number) {
  try {
    // Fetch all active goals for this user
    const goalsQuery = query(
      collection(db, "goals"),
      where("userId", "==", userId),
      where("isCompleted", "==", false)
    );

    const goalsSnapshot = await getDocs(goalsQuery);

    for (const goalDoc of goalsSnapshot.docs) {
      const goal = goalDoc.data();
      let newCurrentValue = goal.currentValue || 0;
      let isCompleted = false;

      // Update based on goal type
      if (goal.type === "calories") {
        // Add workout calories to goal progress
        newCurrentValue += workoutCalories;
      } else if (goal.type === "workouts") {
        // Increment workout count
        newCurrentValue += 1;
      }
      // Note: "steps", "weight", "custom" goals would need different update logic
      // For now, we only auto-update calories and workouts

      // Check if goal is now completed
      if (newCurrentValue >= goal.targetValue) {
        isCompleted = true;
      }

      // Update goal in Firestore
      await updateDoc(doc(db, "goals", goalDoc.id), {
        currentValue: newCurrentValue,
        isCompleted: isCompleted,
        updatedAt: Timestamp.now(),
      });

      console.log(`📊 Goal updated: ${goal.title}`, {
        oldValue: goal.currentValue,
        newValue: newCurrentValue,
        completed: isCompleted,
      });
    }
  } catch (error) {
    console.error("❌ Error updating goals:", error);
    // Don't throw - goal updates shouldn't block workout saves
  }
}
