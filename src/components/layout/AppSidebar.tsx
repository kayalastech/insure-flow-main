import { LayoutDashboard, Users, GitBranch, FileCheck, Building2, LogOut, Shield, Settings } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const navItems = [
  { title: "Dashboard", path: "/", icon: LayoutDashboard },
  { title: "Leads", path: "/leads", icon: Users },
  { title: "Sales Pipeline", path: "/sales-pipeline", icon: GitBranch },
  { title: "Application Pipeline", path: "/application-pipeline", icon: FileCheck },
  { title: "Insurers", path: "/insurers", icon: Building2 },
];

const adminNavItems = [
  { title: "Admin Settings", path: "/admin-settings", icon: Settings },
];

export default function AppSidebar() {
  const location = useLocation();
  const { signOut } = useAuth();
  const { isAdmin } = useUserRole();
  const [collapsed, setCollapsed] = useState(false);


  const allNavItems = isAdmin ? [...navItems, ...adminNavItems] : navItems;

  return (
    <aside className={cn("fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground", collapsed && "w-16")}>
      {/* Logo */}
      <div className={cn("flex items-center p-6 border-b border-sidebar-border", collapsed ? "justify-center" : "gap-3")}>
        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary flex-shrink-0">
          <Shield className="h-5 w-5 text-accent-foreground" />
        </div>

  {!collapsed && (
    <div className="animate-fade-in">
      <h1 className="font-bold text-lg text-sidebar-foreground">Insure CRM</h1>
      <p className="text-xs text-sidebar-foreground/60">Lead Tracker</p>
    </div>
  )}
  </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {allNavItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium">{item.title}</span>}
            </NavLink>
          );
        })}
      </nav>

      
      {/* Collapse button */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-center text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </Button>
      </div>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3">
        <button
            onClick={signOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
