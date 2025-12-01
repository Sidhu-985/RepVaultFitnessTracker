"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNutrition } from "@/hooks/useNutrition";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AddNutritionPage() {
  return (
    <ProtectedRoute>
      <AddNutritionContent />
    </ProtectedRoute>
  );
}

function AddNutritionContent() {
  const { user } = useAuth();
  const router = useRouter();
  const { addLog, suggestions } = useNutrition(user?.uid ?? null);
  const [food, setFood] = useState("");
  const [calories, setCalories] = useState<string>("200");
  const [carbs, setCarbs] = useState<string>("0");
  const [loading, setLoading] = useState(false);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!user) {
      toast.error("Not signed in");
      return;
    }
    if (!food.trim()) {
      toast.error("Please enter a food name");
      return;
    }
    const cal = parseInt(calories, 10);
    const carb = parseFloat(carbs);

    if (isNaN(cal) || cal <= 0) {
      toast.error("Calories must be a positive number");
      return;
    }

    setLoading(true);
    try {
      const res = await addLog({
        userId: user.uid,
        foodItem: food.trim(),
        calories: cal,
        carbs: carb,
      });

      if (!res.success && res.reason === "duplicate"){
        toast.error("This food entry already exists");
        return;
      }
      toast.success(`${food} logged`);
      router.push("/nutrition");
    } catch (err) {
      console.error(err);
      toast.error("Failed to log food");
    } finally {
      setLoading(false);
    }
  };

  const pickSuggestion = (s: any) => {
    setFood(s.name);
    setCalories(String(s.calories));
    setCarbs(String(s.carbs ?? 0));
  };

  return (
    <div className="min-h-screen bg-app-gradient">
      <Header />
      <main className="container mx-auto p-6 max-w-2xl">
        <Card className="card-tinted shadow-xl">
          <CardHeader>
            <CardTitle>Log Your Meal</CardTitle>
            <CardDescription>Track your nutrition intake for better insights</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label>Food Item</Label>
                <Input value={food} onChange={(e) => setFood(e.target.value)} placeholder="e.g., Grilled Chicken Breast" className="border-color-black"/>
              </div>

              <div>
                <Label>Quick Add</Label>
                <div className="flex gap-3 overflow-x-auto py-2">
                  {suggestions.map((s: any, i: number) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => pickSuggestion(s)}
                      className="px-3 py-2 rounded border hover:shadow"
                    >
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-muted-foreground">{s.calories} kcal</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="my-2">Calories (kcal)</Label>
                  <Input value={calories} onChange={(e) => setCalories(e.target.value)} type="number" className="border-color-black"/>
                </div>
                <div>
                  <Label className="my-2">Carbs (g)</Label>
                  <Input value={carbs} onChange={(e) => setCarbs(e.target.value)} type="number" className="border-color-black"/>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={submit} disabled={loading}>{loading ? "Logging..." : "Log Food"}</Button>
                <Button type="button" variant="outline" onClick={() => router.push("/nutrition")}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
