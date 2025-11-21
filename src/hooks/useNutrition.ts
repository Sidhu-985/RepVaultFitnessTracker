  // src/hooks/useNutrition.ts
  import { useEffect, useMemo, useState, useCallback } from "react";
  import { onSnapshot, collection, query, where, orderBy } from "firebase/firestore";
  import { db } from "@/lib/firebase";
  import { NutritionLog } from "@/types/NutritionLog";
  import { NutritionService } from "@/features/nutrition/NutritionService";
  import { Timestamp } from "firebase/firestore";

  export function useNutrition(userId?: string | null) {
    const [logs, setLogs] = useState<NutritionLog[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      if (!userId) {
        setLogs([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const q = query(
        collection(db, "nutritionLogs"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );

      const unsub = onSnapshot(
        q,
        (snapshot) => {
          const data = snapshot.docs.map((d) => {
            const raw = d.data();
            return {
              id: d.id,
              userId: raw.userId,
              foodItem: raw.foodItem,
              calories: raw.calories,
              carbs: raw.carbs,
              createdAt: raw.createdAt ?? raw.createdAt,
              updatedAt: raw.updatedAt ?? raw.updatedAt,
            } as NutritionLog;
          });
          setLogs(data);
          setLoading(false);
        },
        (err) => {
          console.error("nutrition onSnapshot error:", err);
          setError(err.message || "Failed to load nutrition logs");
          setLoading(false);
        }
      );

      return () => unsub();
    }, [userId]);

    const addLog = useCallback(async (payload: Omit<NutritionLog, "id" | "createdAt" | "updatedAt">) => {
      return NutritionService.instance.addNutritionLog(payload);
    }, []);

    const deleteLog = useCallback(async (id: string) => {
      return NutritionService.instance.deleteNutritionLog(id);
    }, []);

    const todayLogs = useMemo(() => {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      return logs.filter((l) => {
        const created = l.createdAt && (l.createdAt as any).toDate ? (l.createdAt as any).toDate() : new Date(l.createdAt as any);
        return created >= start;
      });
    }, [logs]);

    const totalCaloriesToday = useMemo(() => {
      return todayLogs.reduce((s, l) => s + (l.calories || 0), 0);
    }, [todayLogs]);

    const totalCarbsToday = useMemo(() => {
      return todayLogs.reduce((s, l) => s + (l.carbs || 0), 0);
    }, [todayLogs]);

    return {
      logs,
      loading,
      error,
      todayLogs,
      totalCaloriesToday,
      totalCarbsToday,
      addLog,
      deleteLog,
      suggestions: NutritionService.instance.getFoodSuggestions(),
    };
  }
