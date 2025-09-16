import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// Removed tabs for a simpler Sign In + Register CTA flow
import { useToast } from "@/components/ui/use-toast";
import { Loader2, UserPlus, LogIn, Eye, EyeOff } from "lucide-react";
import { YamLogo } from "@/components/yam/Logo";

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showResetForm, setShowResetForm] = useState(false);
  const [showSigninPassword, setShowSigninPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        if (String(error.message).toLowerCase().includes("confirm")) {
          setShowResendVerification(true);
        }
      } else {
        toast({
          title: "Success",
          description: "Welcome back!",
        });
        window.location.href = "/";
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Enter your email above, then click Forgot password.",
      });
      return;
    }
    setIsLoading(true);
    try {
      const redirectTo = `${window.location.origin}/auth`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({
          title: "Password reset email sent",
          description: "Check your inbox for the reset link.",
        });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to send reset email.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast({ title: "Password too short", description: "Use at least 6 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords do not match", description: "Please confirm your new password.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Password updated", description: "You can now continue." });
        window.location.href = "/";
      }
    } catch (error) {
      toast({ title: "Error", description: "Could not update password.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Supabase sends recovery tokens with # access_token and type=recovery
    const hash = window.location.hash;
    if (hash && hash.includes("type=recovery")) {
      setShowResetForm(true);
    }

    // After email verification and redirect, finalize pending profile upsert
    const finalizeProfile = async () => {
      try {
        const pending = localStorage.getItem("pendingProfile");
        if (!pending) return;
        const parsed = JSON.parse(pending);
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) return; // user not signed in yet

        const userId = session.session.user.id;
        const fd = parsed.formData || {};

        // Upsert user_profiles
        await supabase.from("user_profiles").upsert({
          user_id: userId,
          date_of_birth: fd.dateOfBirth || null,
          gender: fd.gender || null,
          activity_level: fd.activityLevel || null,
          height_cm: fd.height ?? null,
          current_weight: fd.weight ?? null,
          target_weight: fd.targetWeight ?? null,
          health_goals: fd.healthGoals ?? [],
          water_reminder_enabled: fd.enableWaterReminders ?? false,
        }, { onConflict: "user_id" });

        // Upsert join tables
        if (Array.isArray(fd.allergies) && fd.allergies.length) {
          const rows = fd.allergies.map((allergy_id: number) => ({ allergy_id, user_id: userId }));
          await supabase.from("user_allergies").upsert(rows);
        }
        if (Array.isArray(fd.cuisinePreferences) && fd.cuisinePreferences.length) {
          const rows = fd.cuisinePreferences.map((cuisine_id: number) => ({ cuisine_id, user_id: userId }));
          await supabase.from("user_cuisine_preferences").upsert(rows);
        }
        if (Array.isArray(fd.dietaryPreferences) && fd.dietaryPreferences.length) {
          const rows = fd.dietaryPreferences.map((preference_id: number) => ({ preference_id, user_id: userId }));
          await supabase.from("user_dietary_preferences").upsert(rows);
        }

        localStorage.removeItem("pendingProfile");
      } catch (_) {
        // no-op on failure; user can retry from Profile page
      }
    };
    finalizeProfile();

    // Also listen for auth state changes (e.g., after email verification) and finalize then
    const { data: sub } = supabase.auth.onAuthStateChange((_event, _session) => {
      finalizeProfile();
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <div className="flex justify-center">
            <YamLogo />
          </div>
          <p className="text-center text-muted-foreground mt-2">
            Sign in to get your personalized, AI-powered meal plan
          </p>
        </div>

        <Card className="soft-shadow">
          <CardHeader className="text-center">
            <CardTitle>Get Started</CardTitle>
          </CardHeader>
          <CardContent>
            {showResetForm ? (
              <div className="space-y-4">
                <div className="text-center mb-2">
                  <CardTitle>Reset Password</CardTitle>
                </div>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Update Password
                  </Button>
                </form>
              </div>
            ) : (
            <div className="w-full">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      type={showSigninPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowSigninPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showSigninPassword ? "Hide password" : "Show password"}
                    >
                      {showSigninPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-end -mt-2">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                {showResendVerification && (
                  <div className="flex justify-end mt-1">
                    <button
                      type="button"
                      onClick={async () => {
                        if (!email) {
                          toast({ title: "Email required", description: "Enter your email above first." });
                          return;
                        }
                        setIsLoading(true);
                        try {
                          const { error } = await supabase.auth.resend({
                            type: "signup",
                            email,
                            options: { emailRedirectTo: `${window.location.origin}/` },
                          });
                          if (error) {
                            toast({ title: "Error", description: error.message, variant: "destructive" });
                          } else {
                            toast({ title: "Verification email sent", description: "Check your inbox." });
                            setShowResendVerification(false);
                          }
                        } catch (e) {
                          toast({ title: "Error", description: "Could not resend verification.", variant: "destructive" });
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      className="text-xs text-muted-foreground hover:underline"
                    >
                      Resend verification email
                    </button>
                  </div>
                )}
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <LogIn className="h-4 w-4 mr-2" />
                  )}
                  Sign In
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">New to YAM?</span>
                </div>
              </div>

              <Link to="/register">
                <Button variant="outline" className="w-full" size="lg">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create account
                </Button>
              </Link>
            </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}