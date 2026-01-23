import { Sidebar } from "./Sidebar";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "admin" | "lead" | "employee";
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar role={role} />
      <main className="min-h-screen p-4 pt-16 md:ml-64 md:p-8 md:pt-8">
        {children}
      </main>
    </div>
  );
}
