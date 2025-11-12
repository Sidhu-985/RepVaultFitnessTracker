"use client";

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Plus, Target, TrendingUp, Calendar, Trash2, Bell } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { Goal } from '@/types';
import { format } from 'date-fns';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
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
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function GoalsPage() {
  return (
    <ProtectedRoute>
      <GoalsContent />
    </ProtectedRoute>
  );
}

function GoalsContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [activeGoals, setActiveGoals] = useState<Goal[]>([]);
  const [completedGoals, setCompletedGoals] = useState<Goal[]>([]);

  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user]);

  const fetchGoals = async () => {
    if (!user) return;

    try {
      const goalsQuery = query(
        collection(db, 'goals'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const goalsSnapshot = await getDocs(goalsQuery);
      const goalsData = goalsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as Goal[];
      
      setGoals(goalsData);
      setActiveGoals(goalsData.filter(g => !g.isCompleted));
      setCompletedGoals(goalsData.filter(g => g.isCompleted));
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await deleteDoc(doc(db, 'goals', goalId));
      setGoals(goals.filter(g => g.id !== goalId));
      setActiveGoals(activeGoals.filter(g => g.id !== goalId));
      setCompletedGoals(completedGoals.filter(g => g.id !== goalId));
      toast.success('Goal deleted successfully');
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'steps':
        return 'bg-blue-500/10 text-blue-500';
      case 'calories':
        return 'bg-orange-500/10 text-orange-500';
      case 'workouts':
        return 'bg-purple-500/10 text-purple-500';
      case 'weight':
        return 'bg-green-500/10 text-green-500';
      default:
        return 'bg-primary/10 text-primary';
    }
  };

  const getPeriodColor = (period: string) => {
    switch (period) {
      case 'daily':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'weekly':
        return 'bg-blue-500/10 text-blue-500';
      case 'monthly':
        return 'bg-purple-500/10 text-purple-500';
      default:
        return 'bg-primary/10 text-primary';
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

  // Calculate stats
  const totalGoals = goals.length;
  const completedCount = completedGoals.length;
  const activeCount = activeGoals.length;
  const completionRate = totalGoals > 0 ? Math.round((completedCount / totalGoals) * 100) : 0;

  const GoalCard = ({ goal }: { goal: Goal }) => {
    const progressPercentage = Math.min((goal.currentValue / goal.targetValue) * 100, 100);

    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 mb-2">
                {goal.title}
                {goal.reminderEnabled && <Bell className="h-4 w-4 text-muted-foreground" />}
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge className={getTypeColor(goal.type)}>{goal.type}</Badge>
                <Badge className={getPeriodColor(goal.period)}>{goal.period}</Badge>
              </div>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Goal</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this goal? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDeleteGoal(goal.id)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold">
                {goal.currentValue} / {goal.targetValue} {goal.unit}
              </span>
            </div>
            <Progress value={progressPercentage} />
            <p className="text-sm text-muted-foreground text-right">
              {Math.round(progressPercentage)}% complete
            </p>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {goal.startDate && format(goal.startDate.toDate(), 'MMM dd')} - {goal.endDate && format(goal.endDate.toDate(), 'MMM dd')}
            </div>
            {goal.isCompleted && (
              <Badge variant="outline" className="bg-green-500/10 text-green-500">
                Completed
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Toaster />
      
      <main className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Goals</h1>
            <p className="text-muted-foreground">Set and track your fitness objectives</p>
          </div>
          <Button asChild>
            <Link href="/goals/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Goal
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalGoals}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completionRate}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Goals Tabs */}
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active">Active ({activeCount})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedCount})</TabsTrigger>
            <TabsTrigger value="all">All ({totalGoals})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeGoals.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No active goals</h3>
                  <p className="text-muted-foreground mb-4">Create your first goal to start tracking your progress</p>
                  <Button asChild>
                    <Link href="/goals/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Goal
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {activeGoals.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedGoals.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No completed goals yet</h3>
                  <p className="text-muted-foreground">Keep working towards your active goals!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {completedGoals.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            {goals.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No goals yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first goal to start tracking your progress</p>
                  <Button asChild>
                    <Link href="/goals/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Goal
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {goals.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
