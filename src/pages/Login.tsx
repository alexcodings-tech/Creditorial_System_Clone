import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, user, profile, loading } = useAuth();
  const { toast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user && profile) {
      const roleRedirects: Record<string, string> = {
        admin: "/admin",
        lead: "/lead",
        employee: "/dashboard",
      };
      navigate(roleRedirects[profile.role] || "/dashboard");
    }
  }, [user, profile, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
      setIsLoading(false);
    }
    // Navigation will happen via useEffect when profile loads
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        
        <div className="relative z-10 flex flex-col justify-center p-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <span className="font-display text-3xl font-bold text-white">
              Zhar
            </span>
          </div>
          
          <h1 className="text-4xl font-display font-bold text-white mb-4">
            Credit & Performance
            <br />
            <span className="text-white/80">Gamified Platform</span>
          </h1>
          
          <p className="text-lg text-white/70 max-w-md mb-8">
            Track your contributions, earn credits, and climb the leaderboard. 
            Your consistent effort leads to recognition.
          </p>

          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold font-display text-white">100+</div>
              <div className="text-sm text-white/60">Monthly Credits</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold font-display text-white">7</div>
              <div className="text-sm text-white/60">Role Types</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold font-display text-white">∞</div>
              <div className="text-sm text-white/60">Recognition</div>
            </div>
          </div>
        </div>

        {/* Decorative circles */}
        <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-white/10" />
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10" />
      </div>

      {/* Right side - Login form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8 animate-slide-up">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary shadow-glow">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <span className="font-display text-2xl font-bold text-foreground">
              Zhar
            </span>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-display font-bold text-foreground">
              Welcome back
            </h2>
            <p className="text-muted-foreground mt-2">
              Sign in to access your dashboard
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@zhar.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 gradient-primary text-primary-foreground shadow-glow font-semibold text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Contact your admin if you need access
          </div>

          {/* Demo credentials hint */}
          <div className="pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center mb-3">
              Default Admin Credentials
            </p>
            <div className="text-center text-sm text-muted-foreground space-y-1">
              <p>Email: <span className="font-mono text-foreground">admin@gmail.com</span></p>
              <p>Password: <span className="font-mono text-foreground">admin12</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
