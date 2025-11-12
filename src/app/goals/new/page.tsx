"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { CalendarIcon, ArrowLeft } from "lucide-react";
import { format, addDays, addWeeks, addMonths } from "date-fns";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  Timestamp,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function NewGoalPage() {
  return (
    <ProtectedRoute>
      <NewGoalContent />
    </ProtectedRoute>
  );
}

function NewGoalContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(addDays(new Date(), 7));
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    targetValue: "",
    unit: "",
    period: "",
    reminderTime: "09:00",
  });

  const handlePeriodChange = (period: string) => {
    setFormData({ ...formData, period });
    const start = new Date();
    switch (period) {
      case "daily":
        setEndDate(addDays(start, 1));
        break;
      case "weekly":
        setEndDate(addWeeks(start, 1));
        break;
      case "monthly":
        setEndDate(addMonths(start, 1));
        break;
    }
  };

  const handleTypeChange = (type: string) => {
    let unit = "";
    switch (type) {
      case "steps":
        unit = "steps";
        break;
      case "calories":
        unit = "calories";
        break;
      case "workouts":
        unit = "workouts";
        break;
      case "weight":
        unit = "kg";
        break;
      default:
        unit = "";
    }
    setFormData((prev) => ({ ...prev, type, unit }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (endDate <= startDate) {
      toast.error("End date must be after start date");
      return;
    }

    setLoading(true);

    try {
      // ✅ 1. Add goal to Firestore (goals collection)
      const goalRef = await addDoc(collection(db, "goals"), {
        userId: user.uid,
        title: formData.title,
        type: formData.type,
        targetValue: parseInt(formData.targetValue),
        currentValue: 0,
        unit: formData.unit,
        period: formData.period,
        startDate: Timestamp.fromDate(startDate),
        endDate: Timestamp.fromDate(endDate),
        reminderEnabled,
        reminderTime: reminderEnabled ? formData.reminderTime : null,
        isCompleted: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // ✅ 2. Link goal to the user’s document
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        goalIds: arrayUnion(goalRef.id),
        updatedAt: Timestamp.now(),
      });

      toast.success("🎯 Goal created and linked successfully!");
      router.push("/goals");
    } catch (error) {
      console.error("Error creating goal:", error);
      toast.error("Failed to create goal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Toaster />

      <main className="container mx-auto p-6 max-w-2xl">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/goals">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Goals
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create New Goal</CardTitle>
            <CardDescription>
              Set a new fitness objective to track your progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Goal Title</Label>
                <Input
                  id="title"
                  placeholder="Walk 10,000 steps daily"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Goal Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={handleTypeChange}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select goal type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="steps">Steps</SelectItem>
                      <SelectItem value="calories">Calories</SelectItem>
                      <SelectItem value="workouts">Workouts</SelectItem>
                      <SelectItem value="weight">Weight</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="period">Period</Label>
                  <Select
                    value={formData.period}
                    onValueChange={handlePeriodChange}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetValue">Target Value</Label>
                  <Input
                    id="targetValue"
                    type="number"
                    placeholder="10000"
                    value={formData.targetValue}
                    onChange={(e) =>
                      setFormData({ ...formData, targetValue: e.target.value })
                    }
                    required
                    min="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    placeholder="steps"
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              {/* Date Pickers */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate
                          ? format(startDate, "PPP")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(newDate) => newDate && setStartDate(newDate)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(newDate) => newDate && setEndDate(newDate)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Reminders */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="reminder">Enable Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Get daily notifications to stay on track
                    </p>
                  </div>
                  <Switch
                    id="reminder"
                    checked={reminderEnabled}
                    onCheckedChange={setReminderEnabled}
                  />
                </div>

                {reminderEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor="reminderTime">Reminder Time</Label>
                    <Input
                      id="reminderTime"
                      type="time"
                      value={formData.reminderTime}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          reminderTime: e.target.value,
                        })
                      }
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? "Creating..." : "Create Goal"}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/goals">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
