import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string;
  helper?: string;
  icon?: ReactNode;
  progress?: number; // 0-100
  accent?: "primary" | "accent" | "muted";
}

export function MetricCard({ title, value, helper, icon, progress, accent = "muted" }: MetricCardProps) {
  const accentClasses =
    accent === "primary"
      ? "bg-secondary"
      : accent === "accent"
      ? "bg-secondary"
      : "bg-card";

  return (
    <Card className={cn("soft-shadow border border-border", accentClasses)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
          {icon}
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {progress !== undefined && (
          <div>
            <Progress value={progress} className="h-2" />
            {helper && <p className="text-xs text-muted-foreground mt-1">{helper}</p>}
          </div>
        )}
        {!progress && helper && <p className="text-xs text-muted-foreground">{helper}</p>}
      </CardContent>
    </Card>
  );
}
