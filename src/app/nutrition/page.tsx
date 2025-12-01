"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { Toaster, toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import NutritionCard from "@/components/NutritionCard";
import { useNutrition } from "@/hooks/useNutrition";
import Link from "next/link";
import { Menu,BicepsFlexed,CookingPot, ClipboardMinus } from "lucide-react";

export default function NutritionPage() {
  return (
    <ProtectedRoute>
      <NutritionContent />
    </ProtectedRoute>
  );
}

function NutritionContent() {
  const { user, userData } = useAuth();
  const { logs, loading, error, todayLogs, totalCaloriesToday, totalCarbsToday, deleteLog } = useNutrition(user?.uid);
  const [activeTab, setActiveTab] = useState<"today" | "history">("today");

  const handleDelete = async (id: string) => {
    try {
      await deleteLog(id);
      toast.success("Entry deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete entry");
    }
  };

  if (loading){
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex flex-1 items-center justify-center py-20">
          <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-app-gradient">
      <Header />
      <Toaster />
      <main className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Nutrition</h1>
            <p className="text-muted-foreground">Log meals and track daily calories & carbs</p>
          </div>
          <div className="flex gap-2">
            <Link href="/nutrition/add">
              <Button>
                Add Food
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card className="card-tinted shadow-md">
            <CardContent>
              <div className="text-sm text-color-black font-medium flex flex-row items-center justify-between space-y-0 pb-2">Today's Meals
                <CookingPot className="inline-block text-orange-500"/>
              </div>
              <div className="text-2xl font-bold">{todayLogs.length}</div>
            </CardContent>
          </Card>

          <Card className="card-tinted shadow-md">
            <CardContent>
              <div className="text-sm text-color-black font-medium flex flex-row items-center justify-between space-y-0 pb-2">Calories Today
                <ClipboardMinus className="inline-block text-red-500"/>
              </div>
              <div className="text-2xl font-bold">{totalCaloriesToday} kcal</div>
            </CardContent>
          </Card>

          <Card className="card-tinted shadow-md">
            <CardContent>
              <div className="text-sm text-color-black font-medium flex flex-row items-center justify-between space-y-0 pb-2">Carbs Today
                <BicepsFlexed className="inline-block text-blue-600"/>
              </div>
              <div className="text-2xl font-bold">{totalCarbsToday} g</div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-4">
          <div className="inline-flex rounded-md bg-muted p-1">
            <button
              onClick={() => setActiveTab("today")}
              className={`px-4 py-2 rounded ${activeTab === "today" ? "bg-background shadow" : "text-muted-foreground"}`}
            >
              Today
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2 rounded ${activeTab === "history" ? "bg-background shadow" : "text-muted-foreground"}`}
            >
              History
            </button>
          </div>
        </div>

        {error && (
          <Card className="mb-4">
            <CardContent className="text-destructive">{error}</CardContent>
          </Card>
        )}

        {loading ? (
          <div className="py-12 text-center">Loading…</div>
        ) : (
          <>
            {activeTab === "today" && (
              <>
                {todayLogs.length === 0 ? (
                  <Card className="card-tinted shadow-xl"><CardContent className="py-12 text-center">No meals logged today</CardContent></Card>
                ) : (
                  todayLogs.map((l) => <NutritionCard key={l.id} log={l} onDelete={handleDelete} />)
                )}
              </>
            )}

            {activeTab === "history" && (
              <>
                {logs.length === 0 ? (
                  <Card className="card-tinted shadow-xl"><CardContent className="py-12 text-center">No nutrition history</CardContent></Card>
                ) : (
                  logs.map((l) => <NutritionCard key={l.id} log={l} onDelete={handleDelete} />)
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
