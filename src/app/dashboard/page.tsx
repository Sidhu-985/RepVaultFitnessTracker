"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Activity, Flame, Heart, TrendingUp, Plus } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { Goal, Workout } from "@/types";
import { format,isSameDay,subDays } from "date-fns";
import Link from "next/link";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { ca } from "date-fns/locale";


export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

// ✅ DASHBOARD CONTENT COMPONENT
function DashboardContent() {
  const { user, userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);

  const [totalSteps,setTotalSteps] = useState(0);
  const [totalCalories,setTotalCalories] = useState(0);
  const [avgHeartRate,setAvgHeartRate] = useState(0);
  const [totalDistance,setTotalDistance] = useState(0);

  const [weeklyData,setWeeklyData] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchActivityData();
    }
  }, [user]);

  const fetchActivityData = async () => {
    try{
      const q = query(
        collection(db, "workouts"),
        where("userId", "==", user!.uid),
      );

      const snap = await getDocs(q);
      const workouts = snap.docs.map((doc) => doc.data());

      let steps = 0;
      let calories = 0;
      let hRSum = 0;
      let hRCount = 0;
      let distance = 0;

      workouts.forEach((workout) => {
        steps += workout.steps || 0;
        calories += workout.calories || 0;
        distance += workout.distance || 0;

        if (workout.heartRate) {
          hRSum += workout.heartRate;
          hRCount += 1;
        }
      });

      setTotalSteps(steps);
      setTotalCalories(calories);
      setTotalDistance(distance);
      setAvgHeartRate(hRCount > 0 ? Math.round(hRSum / hRCount) : 0);

      const last7days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), i);

        const todaysWorkouts = workouts.filter((w) =>
          w.date?.toDate && isSameDay(w.date.toDate(), date)
        );

        return {
          day: format(date, "EEE"),
          steps: todaysWorkouts.reduce((sum, w) => sum + (w.steps || 0), 0),
          calories: todaysWorkouts.reduce((sum, w) => sum + (w.calories || 0), 0),
        };
      }).reverse();

      setWeeklyData(last7days);
    }catch (err) {
      console.error("Error loading stats:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;
    try {
      const goalsQuery = query(
        collection(db, "goals"),
        where("userId", "==", user.uid),
        where("isCompleted", "==", false),
        limit(5)
      );
      const goalsSnapshot = await getDocs(goalsQuery);
      const goalsData = goalsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Goal[];
      setGoals(goalsData);

      const workoutsQuery = query(
        collection(db, "workouts"),
        where("userId", "==", user.uid),
        limit(5)
      );
      const workoutsSnapshot = await getDocs(workoutsQuery);
      const workoutsData = workoutsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Workout[];
      setRecentWorkouts(workoutsData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-1 items-center justify-center py-20">
          <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const todayActivity = {
    steps: totalSteps,
    calories: totalCalories,
    heartRate: avgHeartRate,
    distance: totalDistance,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-6 space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Track your fitness progress</p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/workouts/new">
                <Plus className="mr-2 h-4 w-4" />
                Log Workout
              </Link>
            </Button>
          </div>
        </div>

        {/* Activity Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <ActivityCard title="Steps" icon={<Activity />} value={todayActivity.steps} target={10000} unit="steps" />
          <ActivityCard title="Calories" icon={<Flame />} value={todayActivity.calories} target={500} unit="kcal" />
          <ActivityCard title="Heart Rate" icon={<Heart />} value={todayActivity.heartRate} unit="BPM" />
          <ActivityCard title="Distance" icon={<TrendingUp />} value={todayActivity.distance} unit="km" />
        </div>

        {/* Weekly Progress Chart */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Weekly Progress</CardTitle>
            <CardDescription>Your activity over the past week</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ChartContainer
              config={{
                steps: { label: "Steps", color: "hsl(var(--primary))" },
                calories: { label: "Calories", color: "hsl(var(--chart-2))" },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line yAxisId="left" type="monotone" dataKey="steps" stroke="var(--color-steps)" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="calories" stroke="var(--color-calories)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Recommended Workouts Section */}
        <RecommendedWorkouts clientType={userData?.clientType} />

        {/* Goals and Workouts */}
        <div className="grid gap-6 md:grid-cols-2">
          <GoalSection goals={goals} />
          <RecentWorkoutsSection workouts={recentWorkouts} />
        </div>
      </main>
    </div>
  );
}

/* -------------------------- Subcomponents -------------------------- */

function ActivityCard({ title, icon, value, target, unit }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value.toLocaleString()} {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
        </div>
        {target && (
          <>
            <p className="text-xs text-muted-foreground">Target: {target}</p>
            <Progress value={(value / target) * 100} className="mt-2" />
          </>
        )}
      </CardContent>
    </Card>
  );
}

function GoalSection({ goals }: { goals: Goal[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Active Goals</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/goals">View All</Link>
          </Button>
        </div>
        <CardDescription>Track your fitness objectives</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No active goals yet</p>
            <Button variant="outline" size="sm" className="mt-4" asChild>
              <Link href="/goals/new">Create Your First Goal</Link>
            </Button>
          </div>
        ) : (
          goals.map((goal) => (
            <div key={goal.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{goal.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {goal.currentValue} / {goal.targetValue} {goal.unit}
                  </p>
                </div>
                <span className="text-sm font-medium">
                  {Math.round((goal.currentValue / goal.targetValue) * 100)}%
                </span>
              </div>
              <Progress value={(goal.currentValue / goal.targetValue) * 100} />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function RecentWorkoutsSection({ workouts }: { workouts: Workout[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Workouts</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/workouts">View All</Link>
          </Button>
        </div>
        <CardDescription>Your latest training sessions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {workouts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No workouts logged yet</p>
            <Button variant="outline" size="sm" className="mt-4" asChild>
              <Link href="/workouts/new">Log Your First Workout</Link>
            </Button>
          </div>
        ) : (
          workouts.map((workout) => (
            <div key={workout.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
              <div>
                <p className="font-medium">{workout.name}</p>
                <p className="text-sm text-muted-foreground">
                  {workout.duration} min • {workout.calories} cal
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  {workout.date && format(workout.date.toDate(), "MMM dd")}
                </p>
                <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-primary/10 text-primary">
                  {workout.type}
                </span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

/* -------------------------- NEW: Recommended Workouts -------------------------- */

function RecommendedWorkouts({ clientType }: { clientType?: string }) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      if (!clientType) return;
      const q = query(
        collection(db, "predefinedWorkouts"),
        where("targetClientType", "in", [clientType, "General"])
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTemplates(data);
      setLoading(false);
    };
    fetchTemplates();
  }, [clientType]);

  if (loading) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended Workouts</CardTitle>
        <CardDescription>Workouts matched to your fitness type</CardDescription>
      </CardHeader>
      <CardContent>
        {templates.length === 0 ? (
          <p className="text-muted-foreground text-sm">No recommended workouts available.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((t) => (
              <div key={t.id} className="border rounded-lg p-4 hover:shadow-md transition">
                <h3 className="font-semibold text-lg">{t.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">Difficulty: {t.difficulty}</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {t.exercises.map((ex: any, i: number) => (
                    <li key={i}>
                      {ex.name} —{" "}
                      {ex.sets ? `${ex.sets}×${ex.reps}` : ex.duration || ""}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
