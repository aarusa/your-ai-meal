import { CheckCircle, Mail, ArrowRight, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export function SuccessStep() {
  const handleContinue = () => {
    window.location.href = "/auth";
  };

  const handleResend = async () => {
    try {
      const email = localStorage.getItem("pendingVerificationEmail");
      if (!email) return;
      await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth` },
      });
    } catch (_) {
      // no-op
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md soft-shadow">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {/* Success Icon */}
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-primary" />
            </div>

            {/* Success Message */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                Welcome to Your AI Meals!
              </h2>
              <p className="text-muted-foreground">
                Your account has been created successfully
              </p>
            </div>

            {/* Email Verification Info */}
            <div className="bg-secondary/50 p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">Check Your Email</span>
              </div>
              <p className="text-sm text-muted-foreground">
                We've sent you a verification link to complete your registration.
                Please check your inbox and click the link to verify your account.
              </p>
              <div className="flex justify-center">
                <Button variant="outline" size="sm" onClick={handleResend} className="mt-2">
                  <Repeat className="w-4 h-4 mr-2" /> Resend verification email
                </Button>
              </div>
            </div>

            {/* What's Next */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">What's Next?</h3>
              <ul className="text-sm text-muted-foreground space-y-2 text-left">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  Verify your email address
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  Complete your profile setup
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  Start getting personalized meal recommendations
                </li>
              </ul>
            </div>

            {/* Continue Button */}
            <Button 
              onClick={handleContinue}
              className="w-full flex items-center gap-2"
              size="lg"
            >
              Proceed to Login
              <ArrowRight className="w-4 h-4" />
            </Button>

            <p className="text-xs text-muted-foreground">
              After verifying your email, sign in from the login page to continue.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}