import { cn } from "@/lib/utils";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  Trophy,
  Users,
  Settings,
  LogOut,
  Zap,
  ChevronLeft,
  ChevronRight,
  Shield,
  UserCog,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  role: "admin" | "lead" | "employee";
}

const menuItems = {
  admin: [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
    { icon: Users, label: "Customers", path: "/admin/employees" },
    // { icon: FolderKanban, label: "visits", path: "/admin/projects" },
    { icon: Trophy, label: "Leaderboard", path: "/leaderboard" },
    { icon: Shield, label: "Approvals", path: "/admin/approvals" },
    { icon: Settings, label: "Settings", path: "/admin/settings" },
  ],
  lead: [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: FolderKanban, label: "Projects", path: "/lead/projects" },
    { icon: Users, label: "Team", path: "/lead/team" },
    { icon: Trophy, label: "Leaderboard", path: "/leaderboard" },
    { icon: Settings, label: "Settings", path: "/lead/settings" },
  ],
  employee: [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    // { icon: FolderKanban, label: "My visits", path: "/projects" },
    { icon: Trophy, label: "Leaderboard", path: "/leaderboard" },
    { icon: UserCog, label: "Profile", path: "/profile" },
  ],
};

export function Sidebar({ role }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { toast } = useToast();
  const items = menuItems[role];
  const isMobile = useIsMobile();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Close mobile menu when switching to desktop
  useEffect(() => {
    if (!isMobile) {
      setMobileOpen(false);
    }
  }, [isMobile]);

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    navigate("/login");
  };

  // Mobile hamburger button
  const MobileMenuButton = () => (
    <Button
      variant="ghost"
      size="icon"
      className="fixed left-4 top-4 z-50 h-10 w-10 md:hidden"
      onClick={() => setMobileOpen(!mobileOpen)}
    >
      {mobileOpen ? (
        <X className="h-5 w-5" />
      ) : (
        <Menu className="h-5 w-5" />
      )}
    </Button>
  );

  // Mobile overlay
  const MobileOverlay = () => (
    <div
      className={cn(
        "fixed inset-0 z-30 bg-background/80 backdrop-blur-sm transition-opacity md:hidden",
        mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
      )}
      onClick={() => setMobileOpen(false)}
    />
  );

  return (
    <>
      <MobileMenuButton />
      <MobileOverlay />
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-card transition-all duration-300",
          // Desktop: normal behavior
          "md:translate-x-0",
          collapsed ? "md:w-20" : "md:w-64",
          // Mobile: slide in/out
          "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-glow">
              <Zap className="h-5 w-5 text-white" />
            </div>
            {!collapsed && (
              <span className="font-display text-xl font-bold text-foreground">
                Zhar
              </span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="hidden h-8 w-8 md:flex"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {items.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium transition-all duration-200",
                  isActive
                    ? "gradient-primary text-primary-foreground shadow-glow"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5 flex-shrink-0")} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-border p-4">
          <button
            onClick={handleLogout}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 font-medium text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive"
            )}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
