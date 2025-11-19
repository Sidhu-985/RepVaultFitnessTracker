// src/components/NutritionCard.tsx
"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { NutritionLog } from "@/types/NutritionLog";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NutritionCard({
  log,
  onDelete,
}: {
  log: NutritionLog;
  onDelete: (id: string) => void;
}) {
  const created = log.createdAt && (log.createdAt as any).toDate ? (log.createdAt as any).toDate() : new Date(log.createdAt as any);

  return (
    <Card className="mb-3">
      <CardContent className="flex items-center justify-between gap-4">
        <div>
          <h4 className="font-semibold">{log.foodItem}</h4>
          <div className="text-sm text-muted-foreground">
            {log.calories} kcal • {log.carbs} g carbs
          </div>
          <div className="text-xs text-muted-foreground mt-1">{format(created, "PPP p")}</div>
        </div>

        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(log.id)}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
