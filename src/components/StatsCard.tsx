import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
}

export function StatsCard({ title, value, change, icon: Icon, trend = "neutral" }: StatsCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-green-400";
      case "down":
        return "text-red-400";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card className="bg-gradient-card border-border hover:bg-gradient-hover transition-all duration-300 hover:shadow-elegant">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-foreground">{value}</p>
              {change && (
                <span className={`text-sm font-medium ${getTrendColor()}`}>
                  {change}
                </span>
              )}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}