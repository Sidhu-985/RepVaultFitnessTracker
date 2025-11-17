"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Clock, Flame, TrendingUp, Trash2 } from "lucide-react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  deleteDoc,
  doc,
  addDoc,
  updateDoc,
  arrayUnion,
  Timestamp,
} from "firebase/firestore";
import { Workout } from "@/types";
import { format } from "date-fns";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export default function WorkoutsPage() {
  return (
    <ProtectedRoute>
      <WorkoutsContent />
    </ProtectedRoute>
  );
}

function WorkoutsContent() {
  const { user, userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [recommendedPlans, setRecommendedPlans] = useState<any[]>([]);

  useEffect(() => {
    if (user && userData) {
      fetchWorkouts();
      fetchRecommendedPlans();
    }
  }, [user, userData]);

  const fetchWorkouts = async () => {
  if (!user) return;

  setLoading(true);

  try {
    const workoutsQuery = query(
      collection(db, "workouts"),
      where("userId", "==", user.uid)
    );

    const workoutsSnapshot = await getDocs(workoutsQuery);

    const cleanedWorkouts: Workout[] = [];

    for (const docSnap of workoutsSnapshot.docs) {
      const data = docSnap.data();
      let updated = false;

      // 1️⃣ If date is missing → auto-fix
      if (!data.date) {
        data.date = Timestamp.now();
        updated = true;
      }

      // 2️⃣ If date is a string → convert to Timestamp
      if (typeof data.date === "string") {
        const parsed = new Date(data.date);
        if (!isNaN(parsed.getTime())) {
          data.date = Timestamp.fromDate(parsed);
          updated = true;
        } else {
          // fallback
          data.date = Timestamp.now();
          updated = true;
        }
      }

      // 3️⃣ If date is a JS Date object → convert to Timestamp
      if (data.date instanceof Date) {
        data.date = Timestamp.fromDate(data.date);
        updated = true;
      }

      // 4️⃣ Persist fixes back to Firestore
      if (updated) {
        await updateDoc(doc(db, "workouts", docSnap.id), {
          date: data.date,
        });
      }

      cleanedWorkouts.push({
        id: docSnap.id,
        ...data,
      } as Workout);
    }

    // 5️⃣ Sort safely in frontend (no Firestore ordering needed)
    cleanedWorkouts.sort((a, b) => {
      const dateA = a.date?.toDate ? a.date.toDate() : new Date();
      const dateB = b.date?.toDate ? b.date.toDate() : new Date();
      return dateB.getTime() - dateA.getTime();
    });

    setWorkouts(cleanedWorkouts);

  } catch (error) {
    console.error("Error fetching workouts:", error);
    toast.error("Failed to load workouts");
  } finally {
    setLoading(false);
  }
};


  // ✅ Fetch predefined workout templates (with full debug + fallback UI)
  const fetchRecommendedPlans = async () => {
    if (!userData?.clientType) {
      console.warn("⚠️ No userData.clientType found, skipping plan fetch");
      return;
    }

    try {
      const q = query(
        collection(db, "predefinedWorkouts"),
        where("targetClientType", "in", [
          userData.clientType
        ])
      );

      const snapshot = await getDocs(q);
      console.log(`📦 Fetched ${snapshot.docs.length} predefined workouts from Firestore`);
      snapshot.docs.forEach((doc) =>
        console.log(`➡️ Plan: ${doc.id}`, doc.data())
      );

      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setRecommendedPlans(data);
    } catch (error) {
      console.error("❌ Error fetching plans:", error);
      toast.error("Failed to load recommended plans");
    }
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    try {
      await deleteDoc(doc(db, "workouts", workoutId));
      setWorkouts(workouts.filter((w) => w.id !== workoutId));
      toast.success("Workout deleted successfully");
    } catch (error) {
      console.error("Error deleting workout:", error);
      toast.error("Failed to delete workout");
    }
  };

  // ✅ Add predefined workout to user's workouts
  const handleStartPlan = async (plan: any) => {
    if (!user) return;
    try {
      const newWorkout = {
        userId: user.uid,
        planTemplateId: plan.id,             // 🔥 Save the plan reference
        name: plan.name,
        type: plan.targetClientType,
        intensity: plan.difficulty?.toLowerCase() || "moderate",
        exercises: plan.exercises || [],      // 🔥 SAVE EXERCISES
        duration: (plan.exercises?.length || 0) * 10,
        calories: (plan.exercises?.length || 0) * 50,
        date: new Date(),
        notes: "Started predefined plan",
      };


      const workoutRef = await addDoc(collection(db, "workouts"), newWorkout);

      // Optional: store active plan
      // const userRef = doc(db, "users", user.uid);
      // await updateDoc(userRef, {
      //   activeWorkoutTemplateId: plan.id,
      //   goalIds: arrayUnion(workoutRef.id),
      // });

      toast.success(`Started plan: ${plan.name}`);
      fetchWorkouts();
    } catch (error) {
      console.error("Error starting plan:", error);
      toast.error("Failed to start plan");
    }
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case "low":
        return "bg-green-500/10 text-green-500";
      case "moderate":
        return "bg-yellow-500/10 text-yellow-500";
      case "high":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-primary/10 text-primary"; 
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Stats
  const totalWorkouts = workouts.length;
  const totalDuration = workouts.reduce((sum, w) => sum + (Number(w.duration) || 0), 0);
  const totalCalories = workouts.reduce((sum, w) => sum + (Number(w.calories) || 0), 0);
  const avgDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Toaster />

      <main className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Workouts</h1>
            <p className="text-muted-foreground">Track and manage your training sessions</p>
          </div>
          <Button asChild>
            <Link href="/workouts/new">
              <Plus className="mr-2 h-4 w-4" />
              Log Workout
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard title="Total Workouts" icon={<TrendingUp />} value={totalWorkouts} />
          <StatCard title="Total Duration" icon={<Clock />} value={`${totalDuration} min`} />
          <StatCard title="Total Calories" icon={<Flame />} value={`${totalCalories} cal`} />
          <StatCard title="Avg Duration" icon={<Clock />} value={`${avgDuration} min`} />
        </div>

        {/* ✅ Recommended Plans Section */}
        <Card>
          <CardHeader>
            <CardTitle>Recommended Workout Plans</CardTitle>
            <CardDescription>
              {recommendedPlans.length > 0
                ? "Personalized plans based on your fitness type"
                : "No predefined workouts found yet — check Firestore collection `predefinedWorkouts`."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recommendedPlans.length === 0 ? (
              <p className="text-muted-foreground">No plans available.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recommendedPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="border rounded-lg p-4 hover:shadow-md transition"
                  >
                    <h3 className="font-semibold text-lg">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Difficulty: {plan.difficulty}
                    </p>
                    <ul className="list-disc list-inside text-sm space-y-1 mb-4">
                      {plan.exercises?.map((ex: any, i: number) => (
                        <li key={i}>
                          {ex.name} — {ex.sets ? `${ex.sets}×${ex.reps}` : ex.duration || ""}
                        </li>
                      ))}
                    </ul>
                    <Button size="sm" onClick={() => handleStartPlan(plan)}>
                      Start Plan
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Workout History */}
        <Card>
          <CardHeader>
            <CardTitle>Workout History</CardTitle>
            <CardDescription>View all your logged workouts</CardDescription>
          </CardHeader>
          <CardContent>
            {workouts.length === 0 ? (
              <EmptyWorkouts />
            ) : (
              <WorkoutList
                workouts={workouts}
                getIntensityColor={getIntensityColor}
                handleDeleteWorkout={handleDeleteWorkout}
              />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

/* ----------------- Subcomponents ----------------- */

function StatCard({ title, icon, value }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function EmptyWorkouts() {
  return (
    <div className="text-center py-12">
      <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">No workouts yet</h3>
      <p className="text-muted-foreground mb-4">
        Start logging your workouts to track your progress
      </p>
      <Button asChild>
        <Link href="/workouts/new">
          <Plus className="mr-2 h-4 w-4" />
          Log Your First Workout
        </Link>
      </Button>
    </div>
  );
}

function WorkoutList({ workouts, getIntensityColor, handleDeleteWorkout }: any) {
  return (
    <div className="space-y-4">
      {workouts.map((workout: any) => (
        <div
          key={workout.id}
          className="flex items-center justify-between border rounded-lg p-4 hover:bg-accent transition-colors"
        >
          <Link href={`/workouts/${workout.id}`} className="flex-1 block">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-lg">{workout.name}</h3>
              <Badge variant="outline" className="capitalize">
                {workout.type}
              </Badge>
              <Badge className={getIntensityColor(workout.intensity)}>
                {workout.intensity}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {workout.date &&
                  (workout.date.toDate
                    ? format(workout.date.toDate(), "MMM dd, yyyy")
                    : format(new Date(workout.date), "MMM dd, yyyy"))}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {workout.duration} min
              </span>
              <span className="flex items-center gap-1">
                <Flame className="h-4 w-4" />
                {workout.calories} cal
              </span>
            </div>
            {workout.notes && (
              <p className="text-sm text-muted-foreground mt-2">{workout.notes}</p>
            )}
          </Link>

          <div className="ml-4 flex items-center justify-end">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Workout</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this workout? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDeleteWorkout(workout.id)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      ))}
    </div>
  );
}
