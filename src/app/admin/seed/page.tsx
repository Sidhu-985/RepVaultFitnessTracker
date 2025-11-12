"use client";

import { useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function SeedPredefinedWorkouts() {
  useEffect(() => {
    const seedWorkouts = async () => {
      const templates = [
        {
          name: "Strength Builder",
          targetClientType: "StrengthTraining",
          difficulty: "Medium",
          exercises: [
            { name: "Bench Press", sets: 4, reps: 10 },
            { name: "Deadlift", sets: 4, reps: 8 },
            { name: "Squats", sets: 4, reps: 12 },
          ],
        },
        {
          name: "Fat Burn Express",
          targetClientType: "FatLoss",
          difficulty: "Easy",
          exercises: [
            { name: "Jumping Jacks", sets: 3, reps: 25 },
            { name: "Mountain Climbers", sets: 3, reps: 20 },
            { name: "Burpees", sets: 3, reps: 10 },
          ],
        },
        {
          name: "General Fitness Routine",
          targetClientType: "General",
          difficulty: "Easy",
          exercises: [
            { name: "Pushups", sets: 3, reps: 15 },
            { name: "Situps", sets: 3, reps: 20 },
            { name: "Jogging", duration: "15 min" },
          ],
        },
      ];

      for (const template of templates) {
        await addDoc(collection(db, "predefinedWorkouts"), template);
      }

      console.log("✅ Predefined workouts seeded successfully!");
    };

    seedWorkouts();
  }, []);

  return <p className="text-center mt-10">Seeding predefined workouts...</p>;
}
