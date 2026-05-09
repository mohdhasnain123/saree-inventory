import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useChangePassword } from "@/contexts/ChangePasswordContext";
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
  KeyRound,
  ChevronUp,
} from "lucide-react";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { open: openChangePassword } = useChangePassword();
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
        <div className="flex flex-col h-full min-h-0">
          {/* Logo */}
          <div className="p-4 border-b border-border relative shrink-0">
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
          <nav className="flex-1 min-h-0 overflow-y-auto p-3 space-y-1">
            {navigationItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-10",
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

          {/* Footer (always pinned at bottom) */}
          <div className="p-3 border-t border-border space-y-2 shrink-0 bg-gradient-card">
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full h-auto justify-start gap-2 px-2 py-2 hover:bg-secondary/80"
                  >
                    <UserCircle2 className="w-5 h-5 text-muted-foreground shrink-0" />
                    <div className="min-w-0 flex-1 text-left">
                      <p className="text-sm font-medium text-foreground truncate">
                        {user.name || user.username}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize truncate">
                        {user.role}
                      </p>
                    </div>
                    <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="top" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium leading-none">
                        {user.name || user.username}
                      </span>
                      <span className="text-xs leading-none text-muted-foreground capitalize">
                        Signed in as {user.role}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => openChangePassword()}>
                    <KeyRound className="w-4 h-4 mr-2" />
                    Change Password
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <p className="text-[10px] text-muted-foreground text-center leading-tight">
              v1.0.0 &middot; &copy; 2026 SareeFlow
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navigation;