import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
    const navigate = useNavigate();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <main className="flex-1 overflow-auto max-w-[7150px]">
          {/* Header */}
          <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm flex justify-between items-center px-6 py-4">
            <div>
              <SidebarTrigger className="text-foreground hover:bg-muted rounded-lg p-2" />
            </div>
            <Button
              onClick={() => navigate("/ai-recommendations")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI Recommendations
            </Button>
          </header>

          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}