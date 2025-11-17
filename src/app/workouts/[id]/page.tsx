"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar, Clock, Flame, Trash2, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";

export default function WorkoutDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workoutId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [workout, setWorkout] = useState<any>(null);

  useEffect(() => {
    fetchWorkout();
  }, []);

  const fetchWorkout = async () => {
    try {
      const ref = doc(db, "workouts", workoutId);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        toast.error("Workout not found");
        router.push("/workouts");
        return;
      }

      setWorkout({ id: snap.id, ...snap.data() });
    } catch (e) {
      console.error(e);
      toast.error("Failed to load workout");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    await updateDoc(doc(db, "workouts", workoutId), {
      isCompleted: true,
    });
    toast.success("Workout marked as completed");
    fetchWorkout();
  };

  const handleDelete = async () => {
    await deleteDoc(doc(db, "workouts", workoutId));
    toast.success("Workout deleted");
    router.push("/workouts");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading workout...
      </div>
    );
  }

  if (!workout) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{workout.name}</h1>

          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Workout Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground">
              Type: <strong>{workout.type}</strong>
            </p>

            <div className="flex items-center gap-2">
              <Calendar size={18} />
              {format(
                workout.date.toDate ? workout.date.toDate() : new Date(workout.date),
                "PPpp"
              )}
            </div>

            <div className="flex items-center gap-2">
              <Clock size={18} /> Duration: {workout.duration} min
            </div>

            <div className="flex items-center gap-2">
              <Flame size={18} /> Calories: {workout.calories} cal
            </div>

            {workout.isCompleted ? (
              <span className="text-green-600 font-semibold flex items-center gap-2">
                <CheckCircle2 size={18} /> Completed
              </span>
            ) : (
              <Button onClick={handleComplete}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Mark Completed
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Exercises</CardTitle>
          </CardHeader>
          <CardContent>
            {(!workout.exercises || workout.exercises.length === 0) ? (
              <p className="text-muted-foreground">No exercises recorded</p>
            ) : (
              <ul className="space-y-3">
                {workout.exercises.map((ex: any, i: number) => (
                  <li key={i} className="border rounded p-3">
                    <strong>{ex.name}</strong>
                    {ex.sets && ex.reps ? (
                      <p>{ex.sets} × {ex.reps}</p>
                    ) : (
                      <p>{ex.duration} sec</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <Button className="mt-8" variant="default">
              <Link href={`/workouts/${workoutId}/edit`}>Add Exercises</Link>
            </Button>
          </CardContent>
        </Card>

        <Button asChild variant="outline">
          <Link href="/workouts">Back to Workouts</Link>
        </Button>
      </main>
    </div>
  );
}
