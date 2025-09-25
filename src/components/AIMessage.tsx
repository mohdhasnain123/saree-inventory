import { Bot, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface AIMessageProps {
  message: string;
  type?: "info" | "warning" | "error";
}

export function AIMessage({ message, type = "info" }: AIMessageProps) {
  const getIcon = () => {
    switch (type) {
      case "warning":
      case "error":
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Bot className="w-5 h-5" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case "warning":
        return "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";
      case "error":
        return "border-red-500/30 bg-red-500/10 text-red-400";
      default:
        return "border-primary/30 bg-primary/10 text-primary";
    }
  };

  return (
    <Card className={`${getColors()} border-2 shadow-ai`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium leading-relaxed">
              {message}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}