import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Calendar,
  Sparkles,
  Shirt,
  Clock,
  Heart,
  Archive,
  TrendingUp,
  Settings,
  Briefcase,
  Crown,
  Gem,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const recentItems = [
  { title: "Last Used", url: "/recent/last-used", icon: Clock },
  { title: "Last Month", url: "/recent/last-month", icon: Calendar },
  { title: "Last Purchased", url: "/recent/last-purchased", icon: Briefcase },
];

const seasonalItems = [
  { title: "Spring 2024", url: "/seasonal/spring-2024", icon: Sparkles },
  { title: "Winter 2024", url: "/seasonal/winter-2024", icon: Gem },
];

const categoryItems = [
  { title: "Office Wear", url: "/", icon: Briefcase },
  { title: "Formal Wear", url: "/category/formal", icon: Crown },
  { title: "Accessories", url: "/category/accessories", icon: Gem },
];

const personalItems = [
  { title: "Favorites", url: "/personal/favorites", icon: Heart },
  { title: "Archived", url: "/personal/archived", icon: Archive },
];

const aiItems = [
  { title: "Smart Picks", url: "/ai/recommendations", icon: Sparkles },
  { title: "Trend Analysis", url: "/ai/trends", icon: TrendingUp },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isCollapsed = state === "collapsed";
  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-sidebar-accent text-sidebar-primary font-medium" 
      : "hover:bg-sidebar-accent/50 text-sidebar-foreground";

  return (
    <Sidebar
      collapsible="icon"
    >
      <SidebarContent className="bg-sidebar border-r border-sidebar-border">
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <NavLink to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-ai rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-lg font-bold text-sidebar-primary">Wardrobe.AI</h1>
              </div>
            )}
          </NavLink>
        </div>

        {/* Recent Activity */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/80 text-xs uppercase tracking-wider">
            Recent Activity
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {recentItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="w-4 h-4" />
                      {!isCollapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Seasonal */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/80 text-xs uppercase tracking-wider">
            Seasonal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {seasonalItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="w-4 h-4" />
                      {!isCollapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Categories */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/80 text-xs uppercase tracking-wider">
            Categories
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {categoryItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="w-4 h-4" />
                      {!isCollapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Personal */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/80 text-xs uppercase tracking-wider">
            Personal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {personalItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="w-4 h-4" />
                      {!isCollapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* AI Features */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/80 text-xs uppercase tracking-wider">
            AI Features
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {aiItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="w-4 h-4" />
                      {!isCollapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <div className="mt-auto p-4 border-t border-sidebar-border">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink to="/settings" className={getNavCls}>
                  <Settings className="w-4 h-4" />
                  {!isCollapsed && <span className="text-sm">Settings</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}