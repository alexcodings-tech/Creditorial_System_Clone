import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import EmployeeProjects from "./pages/EmployeeProjects";
import EmployeeProfile from "./pages/EmployeeProfile";
import Leaderboard from "./pages/Leaderboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminEmployees from "./pages/admin/AdminEmployees";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminApprovals from "./pages/admin/AdminApprovals";
import AdminSettings from "./pages/admin/AdminSettings";
import LeadDashboard from "./pages/lead/LeadDashboard";
import LeadProjects from "./pages/lead/LeadProjects";
import LeadTeam from "./pages/lead/LeadTeam";
import LeadSettings from "./pages/lead/LeadSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            
            {/* Employee Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["employee", "lead", "admin"]}>
                  <EmployeeDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects"
              element={
                <ProtectedRoute allowedRoles={["employee", "lead", "admin"]}>
                  <EmployeeProjects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={["employee", "lead", "admin"]}>
                  <EmployeeProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute allowedRoles={["employee", "lead", "admin"]}>
                  <Leaderboard />
                </ProtectedRoute>
              }
            />

            {/* Lead Routes */}
            <Route
              path="/lead"
              element={
                <ProtectedRoute allowedRoles={["lead", "admin"]}>
                  <LeadDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lead/projects"
              element={
                <ProtectedRoute allowedRoles={["lead", "admin"]}>
                  <LeadProjects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lead/team"
              element={
                <ProtectedRoute allowedRoles={["lead", "admin"]}>
                  <LeadTeam />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lead/settings"
              element={
                <ProtectedRoute allowedRoles={["lead", "admin"]}>
                  <LeadSettings />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/employees"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminEmployees />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/projects"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminProjects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/approvals"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminApprovals />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminSettings />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
