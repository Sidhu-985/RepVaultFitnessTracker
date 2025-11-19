"use client";

import { Headeradmin } from '@/components/Headeradmin';
import React, { useEffect, useState } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuth';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ta } from 'date-fns/locale';

export default function AdminPage() {
  const { user, adminData, loading, signOut } = useAdminAuth();
  const router = useRouter();
  const [counts, setCounts] = useState({ users: 0, workouts: 0, predefinedWorkouts: 0, goals: 0 });
  const [admins, setAdmins] = useState<Array<any>>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [newWorkout, setNewWorkout] = useState<any>({
    name: '',
    description: '',
    targetClientType: '',
    exercises: [{ name: '', sets: '', reps: '' }],
    difficulty: '',
  });

  function addExerciseField() {
    setNewWorkout((s: any) => ({ ...s, exercises: [...s.exercises, { name: '', sets: '', reps: '' }] }));
  }

  function removeExerciseField(index: number) {
    setNewWorkout((s: any) => ({ ...s, exercises: s.exercises.filter((_: any, i: number) => i !== index) }));
  }

  function updateExerciseField(index: number, field: string, value: string) {
    setNewWorkout((s: any) => {
      const copy = { ...s };
      copy.exercises = copy.exercises.map((e: any, i: number) => (i === index ? { ...e, [field]: value } : e));
      return copy;
    });
  }

  async function handleAddPredefined(e: React.FormEvent) {
    e.preventDefault();

    if (!newWorkout.name.trim()) {
      toast.error('Please provide a name for the predefined workout');
      return;
    }

    // Basic validation: at least one exercise with a name
    const validExercises = (newWorkout.exercises || []).filter((ex: any) => ex.name && ex.name.trim());
    const payload: any = {
      name: newWorkout.name.trim(),
      description: newWorkout.description?.trim() || '',
      exercises: validExercises.map((ex: any) => ({
        name: ex.name.trim(),
        sets: ex.sets ? Number(ex.sets) : undefined,
        reps: ex.reps ? Number(ex.reps) : undefined,
      })),
      createdAt: new Date(),
      targetClientType: newWorkout.targetClientType?.trim() || '',
      difficulty: newWorkout.difficulty?.trim() || '',
    };

    try {
      // write full payload so fields match the rest of the app
      const docRef = await addDoc(collection(db, 'predefinedWorkouts'), {
        name: payload.name,
        description: payload.description,
        exercises: payload.exercises,
        createdAt: Timestamp.now(),
        admin_Id: adminData?.admin_Id ?? user?.uid ?? '',
        workout_type: payload.workout_type || '',
        template_Id: '',
        targetClientType: payload.targetClientType,
        difficulty: payload.difficulty,
      });

      // set template_Id to the document id
      await updateDoc(doc(db, 'predefinedWorkouts', docRef.id), { template_Id: docRef.id });

      toast.success('Predefined workout added');
      setNewWorkout({ name: '', description: '', exercises: [{ name: '', sets: '', reps: '' }] });
      fetchCountsAndAdmins();
    } catch (err) {
      console.error('Failed to add predefined workout', err);
      toast.error('Failed to add predefined workout');
    }
  }

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login');
    } else if (!loading && user && adminData) {
      fetchCountsAndAdmins();
    }
  }, [user, adminData, loading, router]);

  async function fetchCountsAndAdmins() {
    setLoadingData(true);
    try {
      const adminsSnap = await getDocs(collection(db, 'admin'));
      const usersSnap = await getDocs(collection(db, 'users'));
      const workoutsSnap = await getDocs(collection(db, 'workouts'));
      const predefinedSnap = await getDocs(collection(db, 'predefinedWorkouts'));
      const goalsSnap = await getDocs(collection(db, 'goals'));

      setCounts({
        users: usersSnap.size,
        workouts: workoutsSnap.size,
        predefinedWorkouts: predefinedSnap.size,
        goals: goalsSnap.size,
      });

      const adminsData: Array<any> = [];
      adminsSnap.forEach((d) => adminsData.push({ id: d.id, ...d.data() }));
      setAdmins(adminsData);
    } catch (err) {
      console.error('Error loading admin data', err);
      toast.error('Failed to load admin data');
    } finally {
      setLoadingData(false);
    }
  }

  async function handleSeedWorkouts() {
    if (!confirm('Seed sample predefined workouts? This will add documents to Firestore.')) return;
    try {
      const samples = [
        {
          name: 'Full Body Beginner',
          description: 'Simple full body routine for beginners',
          exercises: [
            { name: 'Squat', sets: 3, reps: 10 },
            { name: 'Push Up', sets: 3, reps: 8 },
          ],
          createdAt: new Date(),
          difficulty: 'Easy',
          targetClientType: 'General',
        },
        {
          name: 'Upper Body Strength',
          description: 'Focus on chest, back and shoulders',
          exercises: [
            { name: 'Bench Press', sets: 4, reps: 6 },
            { name: 'Bent Over Row', sets: 4, reps: 8 },
          ],
          createdAt: new Date(),
          difficulty: 'Medium',
          targetClientType: 'StrengthTraining',
        },
        {
          name: 'Lower Body Power',
          description: 'Focus on legs and glutes',
          exercises: [
            { name: 'Deadlift', sets: 3, reps: 5 },
            { name: 'Leg Press', sets: 4, reps: 8 },
          ],
          createdAt: new Date(),
          difficulty: 'Hard',
          targetClientType: 'FatLoss',
        },
      ];

      for (const s of samples) {
        await addDoc(collection(db, 'predefinedWorkouts'), s);
      }

      toast.success('Sample workouts seeded');
      fetchCountsAndAdmins();
    } catch (err) {
      console.error(err);
      toast.error('Seeding failed');
    }
  }

  async function handleClearPredefined() {
    if (!confirm('Delete all predefined workouts? This cannot be undone.')) return;
    try {
      const snap = await getDocs(collection(db, 'predefinedWorkouts'));
      const batchDeletes = [] as Promise<any>[];
      snap.forEach((d) => batchDeletes.push(deleteDoc(doc(db, 'predefinedWorkouts', d.id))));
      await Promise.all(batchDeletes);
      toast.success('Cleared predefined workouts');
      fetchCountsAndAdmins();
    } catch (err) {
      console.error(err);
      toast.error('Clear failed');
    }
  }

  async function deleteAdmin(adminId: string, email: string) {
    if (!confirm(`Remove ${email} as admin?`)) return;
    try {
      await deleteDoc(doc(db, 'admin', adminId));
      toast.success(`${email} removed as admin`);
      fetchCountsAndAdmins();
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove admin');
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
      <Headeradmin   />
      <div className="container my-8 mx-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button variant="outline" onClick={async () => {
            await signOut();
            router.push('/admin/login');
          }}>Sign Out</Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className='card-tinted shadow-xl'>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.users}</div>
            </CardContent>
          </Card>
          <Card className='card-tinted shadow-xl'>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Workouts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.workouts}</div>
            </CardContent>
          </Card>
          <Card className='card-tinted shadow-xl'>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Predefined</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.predefinedWorkouts}</div>
            </CardContent>
          </Card>
          <Card className='card-tinted shadow-xl'>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.goals}</div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <Button onClick={handleSeedWorkouts} className="bg-green-600 hover:bg-green-700">Seed Workouts</Button>
          <Button variant="destructive" onClick={handleClearPredefined}>Clear Predefined</Button>
          <Button variant="outline" onClick={() => router.push('/admin/predefined-workouts')}>Manage Workouts</Button>
        </div>

        {/* Admins Table */}
        {/* Add Predefined Workout Form */}
        <Card className="mb-6 card-tinted shadow-lg">
          <CardHeader>
            <CardTitle>Add Predefined Workout</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddPredefined} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="workout-name">Workout Name</Label>
                <Input
                  id="workout-name"
                  value={newWorkout.name}
                  onChange={(e) => setNewWorkout((s: any) => ({ ...s, name: e.target.value }))}
                  placeholder="e.g., Full Body Beginner"
                  required
                  className='border-color-black'
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workout-desc">Description</Label>
                <Textarea
                  id="workout-desc"
                  value={newWorkout.description}
                  onChange={(e) => setNewWorkout((s: any) => ({ ...s, description: e.target.value }))}
                  placeholder="Brief description of the workout"
                  className="min-h-20 border-color-000"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor='workout-name'>Client Type:</Label>
                <Select onValueChange={(value) => setNewWorkout((s: any) => ({ ...s, targetClientType: value }))}>
                  <SelectTrigger className="w-full border-color-000">
                    <SelectValue placeholder="Select client type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="StrengthTraining">Strength Training</SelectItem>
                    <SelectItem value="FatLoss">FatLoss</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor='workout-name'>Difficulty:</Label>
                <Select onValueChange={(value) => setNewWorkout((s: any) => ({ ...s, difficulty: value }))}>
                  <SelectTrigger className="w-full border-color-black">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Exercises</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addExerciseField}
                  >
                    + Add Exercise
                  </Button>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {newWorkout.exercises.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">No exercises added yet</p>
                  ) : (
                    newWorkout.exercises.map((ex: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex gap-2 items-end p-3 bg-muted/50 rounded-lg border"
                      >
                        <div className="flex-1 space-y-1">
                          <Label className="text-xs">Exercise Name</Label>
                          <Input
                            placeholder="e.g., Squats"
                            value={ex.name}
                            onChange={(ev) => updateExerciseField(idx, 'name', ev.target.value)}
                            size={undefined}
                            className='border-color-black'
                          />
                        </div>
                        <div className="w-24 space-y-1">
                          <Label className="text-xs">Sets</Label>
                          <Input
                            placeholder="3"
                            value={ex.sets}
                            onChange={(ev) => updateExerciseField(idx, 'sets', ev.target.value)}
                            type="number"
                            min="1"
                            className='border-color-black'
                          />
                        </div>
                        <div className="w-24 space-y-1">
                          <Label className="text-xs">Reps</Label>
                          <Input
                            placeholder="10"
                            value={ex.reps}
                            onChange={(ev) => updateExerciseField(idx, 'reps', ev.target.value)}
                            type="number"
                            min="1"
                            className='border-color-black'
                          />
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => removeExerciseField(idx)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Create Workout
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        <Card className='card-tinted shadow-xl'>
          <CardHeader>
            <CardTitle>Admin Accounts ({admins.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingData ? (
              <p className="text-muted-foreground">Loading admins...</p>
            ) : admins.length === 0 ? (
              <p className="text-muted-foreground">No admins found</p>
            ) : (
              <div className="space-y-2">
                {admins.map((a: any) => (
                  <div key={a.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition">
                    <div>
                      <div className="font-semibold">{a.name || a.displayName || a.admin_Name || '—'}</div>
                      <div className="text-sm text-muted-foreground">{a.email}</div>
                    </div>
                    {a.id !== user?.uid && (
                      <Button size="sm" variant="destructive" onClick={() => deleteAdmin(a.id, a.email)}>Remove</Button>
                    )}
                    {a.id === user?.uid && (
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">You</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
}
