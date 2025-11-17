"use client";

import { useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function SeedPredefinedWorkouts() {
  useEffect(() => {
    const seedWorkouts = async () => {
      const templates = [
  // ===================== GENERAL (4 PROGRAMS) ===================== //
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
  {
    name: "Morning Starter",
    targetClientType: "General",
    difficulty: "Easy",
    exercises: [
      { name: "Light Jogging", duration: "5 min" },
      { name: "Bodyweight Squats", sets: 3, reps: 15 },
      { name: "Plank Hold", duration: "45 sec" },
      { name: "Stretching", duration: "3 min" },
    ],
  },
  {
    name: "Full Body Mobility",
    targetClientType: "General",
    difficulty: "Easy",
    exercises: [
      { name: "Hip Mobility Flow", duration: "3 min" },
      { name: "Cat-Cow Stretch", duration: "2 min" },
      { name: "Shoulder Rotations", duration: "2 min" },
      { name: "Child Pose", duration: "2 min" },
    ],
  },
  {
    name: "Balanced Fitness Circuit",
    targetClientType: "General",
    difficulty: "Medium",
    exercises: [
      { name: "Jump Rope", duration: "2 min" },
      { name: "Pushups", sets: 3, reps: 12 },
      { name: "Lunges", sets: 3, reps: 12 },
      { name: "Mountain Climbers", duration: "30 sec" },
    ],
  },

  // ===================== FAT LOSS (4 PROGRAMS) ===================== //
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
    name: "Cardio Torch",
    targetClientType: "FatLoss",
    difficulty: "Medium",
    exercises: [
      { name: "Treadmill Running", duration: "10 min" },
      { name: "Jump Rope", duration: "5 min" },
      { name: "Box Steps", duration: "3 min" },
    ],
  },
  {
    name: "HIIT Fat Burner",
    targetClientType: "FatLoss",
    difficulty: "Hard",
    exercises: [
      { name: "High Knees", duration: "45 sec" },
      { name: "Burpees", duration: "30 sec" },
      { name: "Jump Squats", duration: "30 sec" },
      { name: "Rest", duration: "20 sec" },
    ],
  },
  {
    name: "Core Shred Routine",
    targetClientType: "FatLoss",
    difficulty: "Medium",
    exercises: [
      { name: "Plank Hold", duration: "60 sec" },
      { name: "Russian Twists", sets: 3, reps: 25 },
      { name: "Bicycle Crunches", sets: 3, reps: 20 },
      { name: "Jump Rope", duration: "3 min" },
    ],
  },

  // ===================== STRENGTH TRAINING (4 PROGRAMS) ===================== //
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
    name: "Upper Body Power",
    targetClientType: "StrengthTraining",
    difficulty: "Hard",
    exercises: [
      { name: "Overhead Press", sets: 4, reps: 8 },
      { name: "Bent Over Row", sets: 4, reps: 10 },
      { name: "Weighted Dips", sets: 3, reps: 8 },
    ],
  },
  {
    name: "Leg Day Max",
    targetClientType: "StrengthTraining",
    difficulty: "Medium",
    exercises: [
      { name: "Back Squat", sets: 4, reps: 8 },
      { name: "Leg Press", sets: 4, reps: 12 },
      { name: "Hamstring Curls", sets: 3, reps: 15 },
      { name: "Calf Raises", sets: 4, reps: 20 },
    ],
  },
  {
    name: "Strength Endurance Combo",
    targetClientType: "StrengthTraining",
    difficulty: "Medium",
    exercises: [
      { name: "Kettlebell Swings", sets: 4, reps: 15 },
      { name: "Pushups", sets: 4, reps: 20 },
      { name: "Goblet Squats", sets: 4, reps: 12 },
      { name: "Farmer's Walk", duration: "45 sec" },
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
