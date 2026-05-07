import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import {
  LayoutDashboard,
  Package,
  Shirt,
  Users,
  Settings,
  ShoppingCart,
  TrendingUp,
  Factory,
  Scissors,
  Menu,
  X,
  LogOut,
  UserCircle2,
} from "lucide-react";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast({ title: "Signed out", description: "See you again soon." });
    navigate("/login", { replace: true });
  };

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "materials", label: "Raw Materials", icon: Package },
    { id: "sarees", label: "Sarees", icon: Shirt },
    { id: "workers", label: "Workers", icon: Users },
    { id: "machines", label: "Machines", icon: Settings },
    { id: "finishing", label: "Finishing", icon: Scissors },
    { id: "sales", label: "Sales", icon: ShoppingCart },
    { id: "reports", label: "Reports", icon: TrendingUp },
  ];

  return (
    <>
      {/* Mobile Menu Button — only visible when sidebar is CLOSED so it never overlaps the logo */}
      {!isMobileMenuOpen && (
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMobileMenuOpen(true)}
            className="bg-card shadow-card"
            aria-label="Open menu"
          >
            <Menu className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40" 
             onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-gradient-card border-r border-border shadow-elevated transform transition-transform duration-300 ease-in-out",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border relative">
            <div className="flex items-center gap-3 pr-10">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <Factory className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">SareeFlow</h2>
                <p className="text-sm text-muted-foreground">Manufacturing System</p>
              </div>
            </div>
            {/* Close button rendered INSIDE the sidebar header on mobile */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden absolute top-3 right-3 h-8 w-8"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-11",
                  activeTab === item.id 
                    ? "bg-gradient-primary shadow-manufacturing text-primary-foreground" 
                    : "hover:bg-secondary/80"
                )}
                onClick={() => {
                  onTabChange(item.id);
                  setIsMobileMenuOpen(false);
                }}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Button>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border space-y-3">
            {user && (
              <div className="flex items-center gap-2 px-1">
                <UserCircle2 className="w-5 h-5 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user.name || user.username}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize truncate">
                    {user.role}
                  </p>
                </div>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Version 1.0.0</p>
              <p className="text-xs text-muted-foreground mt-1">© 2026 SareeFlow</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navigation;