"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { Trash2, Plus, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
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
} from '@/components/ui/alert-dialog';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number;
  notes?: string;
}

interface Workout {
  id: string;
  name: string;
  type: string;
  intensity: string;
  duration: number;
  calories: number;
  exercises: Exercise[];
  notes?: string;
}

export default function EditWorkoutPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const workoutId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [newExercise, setNewExercise] = useState<Omit<Exercise, 'id'>>({
    name: '',
    sets: 3,
    reps: 10,
    weight: 0,
    duration: 0,
    notes: '',
  });

  useEffect(() => {
    if (user && workoutId) {
      fetchWorkout();
    }
  }, [user, workoutId]);

  const fetchWorkout = async () => {
    try {
      const docRef = doc(db, 'workouts', workoutId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const workoutData = { id: docSnap.id, ...docSnap.data() } as Workout;
        setWorkout(workoutData);
        setExercises(workoutData.exercises || []);
      } else {
        toast.error('Workout not found');
        router.push('/workouts');
      }
    } catch (error) {
      console.error('Error fetching workout:', error);
      toast.error('Failed to load workout');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExercise = () => {
    const errors: string[] = [];

    // Validate exercise name
    if (!newExercise.name || !newExercise.name.trim()) {
      errors.push('Exercise name is required');
    }

    // Validate sets
    // (temporarily disabled) if (!newExercise.sets || newExercise.sets < 1) {
    //   errors.push('Sets must be at least 1');
    // }

    // Validate reps
    // (temporarily disabled) if (!newExercise.reps || newExercise.reps < 1) {
    //   errors.push('Reps must be at least 1');
    // }

    if (errors.length > 0) {
      setValidationErrors(errors);
      toast.error(errors.join(' • '));
      return;
    }

    setValidationErrors([]);

    const exercise: Exercise = {
      id: `${Date.now()}`,
      name: newExercise.name,
      sets: newExercise.sets,
      reps: newExercise.reps,
      weight: newExercise.weight || 0,
      duration: newExercise.duration || 0,
      notes: newExercise.notes || '',
    };

    setExercises([...exercises, exercise]);
    setNewExercise({ name: '', sets: 3, reps: 10, weight: 0, duration: 0, notes: '' });
    toast.success('Exercise added successfully');
    console.log('Exercise added:', exercise);
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setExercises(exercises.filter((ex) => ex.id !== exerciseId));
    toast.success('Exercise removed');
  };

  const handleSave = async () => {
    if (!workout || !user) return;

    const saveErrors: string[] = [];

    if (exercises.length === 0) {
      saveErrors.push('Add at least one exercise before saving');
    }

    // Validate all exercises have required fields
    exercises.forEach((ex, index) => {
      if (!ex.name || !ex.name.trim()) {
        saveErrors.push(`Exercise ${index + 1}: Name is required`);
      }
      // temporarily disable sets/reps validation
      // if (!ex.sets || ex.sets < 1) {
      //   saveErrors.push(`Exercise ${index + 1}: Sets must be at least 1`);
      // }
      // if (!ex.reps || ex.reps < 1) {
      //   saveErrors.push(`Exercise ${index + 1}: Reps must be at least 1`);
      // }
    });

    if (saveErrors.length > 0) {
      setValidationErrors(saveErrors);
      toast.error(`Cannot save: ${saveErrors.join(' • ')}`);
      return;
    }

    setValidationErrors([]);
    setSaving(true);

    try {
      const workoutRef = doc(db, 'workouts', workoutId);
      
      // Calculate totals safely - ensure values are numbers, default to 0 if NaN
      const totalDuration = exercises.reduce((sum, ex) => {
        const duration = Number(ex.duration) || 0;
        const sets = Number(ex.sets) || 1;
        const reps = Number(ex.reps) || 1;
        const exerciseDuration = duration > 0 ? duration : (sets * reps * 0.5);
        return sum + (isNaN(exerciseDuration) ? 0 : exerciseDuration);
      }, 0);
      
      const totalCalories = exercises.reduce((sum, ex) => {
        const sets = Number(ex.sets) || 1;
        const reps = Number(ex.reps) || 1;
        const calories = sets * reps * 2;
        return sum + (isNaN(calories) ? 0 : calories);
      }, 0);

      const updateData = {
        exercises: exercises,
        duration: Math.round(totalDuration),
        calories: Math.round(totalCalories),
      };

      console.log('📝 Saving workout to Firestore:', {
        workoutId,
        exercisesCount: exercises.length,
        exercisesData: exercises,
        totalDuration: Math.round(totalDuration),
        totalCalories: Math.round(totalCalories),
        timestamp: new Date().toISOString(),
      });

      await updateDoc(workoutRef, updateData);

      console.log('✅ Workout saved successfully to Firestore');
      console.log('📊 Updated document path: workouts/' + workoutId);
      console.log('💾 Exercises array updated with', exercises.length, 'exercises');

      toast.success('Workout updated successfully!');
      router.push('/workouts');
    } catch (error) {
      console.error('❌ Error saving workout:', error);
      toast.error('Failed to save workout');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto p-6">
          <p className="text-muted-foreground">Workout not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Edit Workout</h1>
          <p className="text-muted-foreground mt-2">{workout.name}</p>
        </div>

        {/* Validation Errors Alert */}
        {validationErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Validation Errors</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1">
                {validationErrors.map((error, idx) => (
                  <li key={idx} className="text-sm">{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Workout Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Workout Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Workout Type</Label>
                <p className="text-base capitalize">{workout.type}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Intensity</Label>
                <Badge className="mt-2">{workout.intensity}</Badge>
              </div>
            </div>
            {workout.notes && (
              <div>
                <Label className="text-sm font-medium">Notes</Label>
                <p className="text-base text-muted-foreground">{workout.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Exercises */}
        <Card>
          <CardHeader>
            <CardTitle>Exercises ({exercises.length})</CardTitle>
            <CardDescription>Manage exercises for this workout</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {exercises.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No exercises added yet</p>
            ) : (
              <div className="space-y-3">
                {exercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="flex items-center justify-between border rounded-lg p-4 hover:bg-accent transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{exercise.name}</h3>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-1">
                        <span>{exercise.sets} sets</span>
                        <span>{exercise.reps} reps</span>
                        {(exercise.weight ?? 0) > 0 && <span>{exercise.weight} kg</span>}
                        {(exercise.duration ?? 0) > 0 && <span>{exercise.duration} min</span>}
                      </div>
                      {exercise.notes && (
                        <p className="text-sm text-muted-foreground mt-2">{exercise.notes}</p>
                      )}
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Exercise</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove "{exercise.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRemoveExercise(exercise.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add New Exercise */}
        <Card>
          <CardHeader>
            <CardTitle>Add Exercise</CardTitle>
            <CardDescription>Add a new exercise to this workout</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="exercise-name">Exercise Name:</Label>
              <Input
                id="exercise-name"
                placeholder="e.g., Bench Press, Squats, Running"
                value={newExercise.name}
                onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                className='m-4'
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sets">Sets:</Label>
                <Input
                  id="sets"
                  min="1"
                  type='number'
                  className='m-4'
                  placeholder=''
                  value={newExercise.sets}
                  onChange={(e) => setNewExercise({ ...newExercise, sets: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="reps">Reps:</Label>
                <Input
                  id="reps"
                  min="1"
                  className='m-4'
                  type='number'
                  value={newExercise.reps}
                  placeholder='23'
                  onChange={(e) => setNewExercise({ ...newExercise, reps: parseInt(e.target.value)})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weight">Weight (kg):</Label>
                <Input
                  id="weight"
                  min="0"
                  type='number'
                  step="0.5"
                  placeholder="0"
                  className='m-4'
                  value={newExercise.weight}
                  onChange={(e) => setNewExercise({ ...newExercise, weight: parseFloat(e.target.value)})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration (min):</Label>
                <Input
                  id="duration"
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="60"
                  className='m-4'
                  value={newExercise.duration}
                  onChange={(e) => setNewExercise({ ...newExercise, duration: parseFloat(e.target.value)})}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="e.g., Felt strong, good form"
                value={newExercise.notes}
                className='m-4'
                onChange={(e) => setNewExercise({ ...newExercise, notes: e.target.value })}
                required
              />
            </div>

            <Button onClick={handleAddExercise} className="w-full">
              <Plus className="mr-2 h-4 w-4 " />
              Add Exercise
            </Button>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button onClick={handleSave} disabled={saving || exercises.length === 0} className="flex-1">
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/workouts')}
            disabled={saving}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </main>
    </div>
  );
}