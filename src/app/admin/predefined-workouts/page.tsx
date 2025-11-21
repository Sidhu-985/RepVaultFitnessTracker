"use client";

import { Headeradmin } from '@/components/Headeradmin';
import React, { useEffect, useState } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuth';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { Trash2, ArrowLeft } from 'lucide-react';

interface Exercise {
  name: string;
  sets?: number;
  reps?: number;
}

interface PredefinedWorkout {
  id: string;
  name?: string;
  description?: string;
  exercises?: Exercise[];
  createdAt?: any;
  admin_Id?: string;
}

export default function PredefinedWorkoutsPage() {
  const { user, adminData, loading } = useAdminAuth();
  const router = useRouter();
  const [workouts, setWorkouts] = useState<PredefinedWorkout[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string; name: string }>({
    open: false,
    id: '',
    name: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login');
    } else if (!loading && user && adminData) {
      fetchWorkouts();
    }
  }, [user, adminData, loading, router]);

  async function fetchWorkouts() {
    setLoadingData(true);
    try {
      const snap = await getDocs(collection(db, 'predefinedWorkouts'));
      const workoutsData: PredefinedWorkout[] = [];
      snap.forEach((d) => {
        workoutsData.push({ id: d.id, ...d.data() } as PredefinedWorkout);
      });
      setWorkouts(workoutsData);
    } catch (err) {
      console.error('Error loading predefined workouts', err);
      toast.error('Failed to load predefined workouts');
    } finally {
      setLoadingData(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteDoc(doc(db, 'predefinedWorkouts', id));
      toast.success('Predefined workout deleted');
      setWorkouts(workouts.filter((w) => w.id !== id));
      setDeleteConfirm({ open: false, id: '', name: '' });
    } catch (err) {
      console.error('Error deleting workout', err);
      toast.error('Failed to delete workout');
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !adminData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-app-gradient">
      <Headeradmin />
      <div className="container my-8 mx-20">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/admin')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold">Predefined Workouts</h1>
          </div>
          <Button onClick={fetchWorkouts} variant="outline">
            Refresh
          </Button>
        </div>

        {loadingData ? (
          <div className="flex justify-center py-12">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
          </div>
        ) : workouts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No predefined workouts found</p>
              <Button onClick={() => router.push('/admin')} variant="outline">
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workouts.map((workout) => (
              <Card key={workout.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow card-tinted">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-2">{workout.name || 'Untitled Workout'}</CardTitle>
                      {workout.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {workout.description}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col gap-4">
                  {/* Exercise Count */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Exercises ({workout.exercises?.length || 0})
                    </p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {workout.exercises && workout.exercises.length > 0 ? (
                        workout.exercises.map((ex, idx) => (
                          <div key={idx} className="text-sm bg-muted/50 p-2 rounded">
                            <p className="font-medium">{ex.name}</p>
                            {(ex.sets || ex.reps) && (
                              <p className="text-xs text-muted-foreground">
                                {ex.sets && `${ex.sets} sets`}
                                {ex.sets && ex.reps && ' × '}
                                {ex.reps && `${ex.reps} reps`}
                              </p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground italic">No exercises</p>
                      )}
                    </div>
                  </div>

                  {/* Created Date */}
                  {workout.createdAt && (
                    <div className="text-xs text-muted-foreground">
                      Created: {new Date(workout.createdAt.toDate?.()).toLocaleDateString() || 'N/A'}
                    </div>
                  )}

                  {/* Delete Button */}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="mt-auto gap-2"
                    onClick={() =>
                      setDeleteConfirm({
                        open: true,
                        id: workout.id,
                        name: workout.name || 'Untitled Workout',
                      })
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirm.open} onOpenChange={(open) => !open && setDeleteConfirm({ ...deleteConfirm, open: false })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Predefined Workout?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold">{deleteConfirm.name}</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(deleteConfirm.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster position="top-right" richColors />
    </div>
  );
}
