import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, ArrowLeft, ArrowRight, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { AccountInfoStep } from "./steps/AccountInfoStep";
import { HealthPreferencesStep } from "./steps/HealthPreferencesStep";
import { WaterReminderStep } from "./steps/WaterReminderStep";
import { ReviewStep } from "./steps/ReviewStep";
import { SuccessStep } from "./steps/SuccessStep";
import { supabase } from "@/integrations/supabase/client";

// Complete form schema aligned with DB
const registrationSchema = z.object({
  // Step 1 - Account Info
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  middleName: z.string().optional(),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["male", "female", "non-binary", "prefer-not-to-say"]).optional(),
  activityLevel: z.string().optional(),
  height: z.number().min(100, "Height must be at least 100cm").max(250, "Please enter a valid height").optional(),
  weight: z.number().min(30, "Weight must be at least 30kg").max(300, "Please enter a valid weight").optional(),
  targetWeight: z.number().min(30, "Target weight must be at least 30kg").max(300, "Please enter a valid target weight").optional(),

  // Step 2 - Preferences (IDs from DB where applicable)
  dietaryPreferences: z.array(z.number()).default([]),
  allergies: z.array(z.number()).default([]),
  cuisinePreferences: z.array(z.number()).default([]),
  healthGoals: z.array(z.string()).default([]),

  // Step 3 - Water Reminder
  enableWaterReminders: z.boolean().default(false),
  reminderFrequency: z.number().optional(),
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;

const steps = [
  { id: 1, title: "Account Info", description: "Basic information" },
  { id: 2, title: "Health & Diet", description: "Preferences" },
  { id: 3, title: "Water Reminders", description: "Daily reminders" },
  { id: 4, title: "Review", description: "Confirm details" },
];

interface RegistrationStepperProps {
  onSuccess?: () => void;
}

export function RegistrationStepper({ onSuccess }: RegistrationStepperProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const { toast } = useToast();

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      password: "",
      dateOfBirth: "",
      gender: undefined,
      activityLevel: "",
      height: undefined,
      weight: undefined,
      targetWeight: undefined,
      dietaryPreferences: [],
      allergies: [],
      cuisinePreferences: [],
      healthGoals: [],
      enableWaterReminders: false,
      reminderFrequency: 2,
    },
    mode: "onChange",
  });

  const { trigger, getValues } = form;

  const validateCurrentStep = async () => {
    let fieldsToValidate: (keyof RegistrationFormData)[] = [];
    
    switch (currentStep) {
      case 1:
        fieldsToValidate = ["firstName", "lastName", "email", "password"];
        break;
      case 2:
        fieldsToValidate = [];
        break;
      case 3:
        fieldsToValidate = ["enableWaterReminders"];
        if (getValues("enableWaterReminders")) {
          fieldsToValidate.push("reminderFrequency");
        }
        break;
      default:
        return true;
    }

    return await trigger(fieldsToValidate);
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    const isValid = await trigger();
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      const formData = getValues();
      
      // Register user with Supabase
      const { data: signUpData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
            data: {
              first_name: (formData as any).firstName ?? undefined,
              middle_name: (formData as any).middleName ?? undefined,
              last_name: (formData as any).lastName ?? undefined,
              role: "member",
            },
          },
      });

      if (authError) {
        toast({
          title: "Registration Failed",
          description: authError.message,
          variant: "destructive",
        });
        return;
      }

      // Helper: persist full registration payload via backend API
      const sendToBackend = async () => {
        const API_BASE = (import.meta as any).env?.VITE_API_URL || "http://localhost:3000";
        const fd: any = formData;
        try {
          const res = await fetch(`${API_BASE}/api/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: fd.email,
              password: fd.password,
              first_name: fd.firstName,
              middle_name: fd.middleName,
              last_name: fd.lastName,
              date_of_birth: fd.dateOfBirth || null,
              gender: fd.gender || null,
              activity_level: fd.activityLevel || null,
              height_cm: fd.height ?? null,
              current_weight: fd.weight ?? null,
              target_weight: fd.targetWeight ?? null,
              health_goals: fd.healthGoals ?? [],
              water_reminder_enabled: fd.enableWaterReminders ?? false,
              water_reminder_interval: fd.reminderFrequency ?? null,
              allergies: fd.allergies ?? [],
              cuisine_preferences: fd.cuisinePreferences ?? [],
              dietary_preferences: fd.dietaryPreferences ?? [],
            }),
          });
          return res;
        } catch (_) {
          // ignore, we still proceed with frontend inserts
        }
      };

      // Always persist via backend immediately (bypasses email confirmation)
      try {
        const res = await sendToBackend();
        if (res && !res.ok) {
          const txt = await res.text().catch(() => "");
          console.error("[Registration] Backend failed:", res.status, txt);
          toast({ title: "Backend save failed", description: `${res.status} ${txt || ''}`.trim(), variant: "destructive" });
        }
      } catch (_) {}

      // If we got back a user, upsert profile and preferences
      const newUserId = signUpData?.user?.id;
      // If email confirmations are disabled in dev, Supabase returns a session here.
      // In that case, upsert immediately and route to app.
      if (signUpData?.session?.user) {
        const userId = signUpData.session.user.id;

        // Upsert profile now
        await supabase.from("user_profiles").upsert({
          user_id: userId,
          date_of_birth: (formData as any).dateOfBirth || null,
          gender: (formData as any).gender || null,
          activity_level: (formData as any).activityLevel || null,
          height_cm: (formData as any).height ?? null,
          current_weight: (formData as any).weight ?? null,
          target_weight: (formData as any).targetWeight ?? null,
          health_goals: (formData as any).healthGoals ?? [],
          water_reminder_enabled: (formData as any).enableWaterReminders ?? false,
        }, { onConflict: "user_id" });

        const allergies = (formData as any).allergies as number[];
        if (Array.isArray(allergies) && allergies.length) {
          const rows = allergies.map((allergy_id) => ({ allergy_id, user_id: userId }));
          await supabase.from("user_allergies").upsert(rows);
        }

        const cuisines = (formData as any).cuisinePreferences as number[];
        if (Array.isArray(cuisines) && cuisines.length) {
          const rows = cuisines.map((cuisine_id) => ({ cuisine_id, user_id: userId }));
          await supabase.from("user_cuisine_preferences").upsert(rows);
        }

        const dietary = (formData as any).dietaryPreferences as number[];
        if (Array.isArray(dietary) && dietary.length) {
          const rows = dietary.map((preference_id) => ({ preference_id, user_id: userId }));
          await supabase.from("user_dietary_preferences").upsert(rows);
        }

        try {
          const res = await sendToBackend();
          if (res && !res.ok) {
            const txt = await res.text().catch(() => "");
            console.error("[Registration] Backend failed:", res.status, txt);
            toast({ title: "Backend save failed", description: `${res.status} ${txt || ''}`.trim(), variant: "destructive" });
          }
        } catch (_) {}

        // Go straight to the app in local/dev
        window.location.href = "/";
      } else if (newUserId) {
        // Defer DB upserts until user verifies and signs in
        localStorage.setItem("pendingProfile", JSON.stringify({ user_id: newUserId, formData }));
        localStorage.setItem("pendingVerificationEmail", formData.email);
        // Local dev bypass: attempt immediate sign-in to proceed without email verification
        try {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          });
          if (!signInError && signInData.session?.user) {
            const userId = signInData.session.user.id;
            await supabase.from("user_profiles").upsert({
              user_id: userId,
              date_of_birth: (formData as any).dateOfBirth || null,
              gender: (formData as any).gender || null,
              activity_level: (formData as any).activityLevel || null,
              height_cm: (formData as any).height ?? null,
              current_weight: (formData as any).weight ?? null,
              target_weight: (formData as any).targetWeight ?? null,
              health_goals: (formData as any).healthGoals ?? [],
              water_reminder_enabled: (formData as any).enableWaterReminders ?? false,
            }, { onConflict: "user_id" });

            const allergies = (formData as any).allergies as number[];
            if (Array.isArray(allergies) && allergies.length) {
              const rows = allergies.map((allergy_id) => ({ allergy_id, user_id: userId }));
              await supabase.from("user_allergies").upsert(rows);
            }

            const cuisines = (formData as any).cuisinePreferences as number[];
            if (Array.isArray(cuisines) && cuisines.length) {
              const rows = cuisines.map((cuisine_id) => ({ cuisine_id, user_id: userId }));
              await supabase.from("user_cuisine_preferences").upsert(rows);
            }

            const dietary = (formData as any).dietaryPreferences as number[];
            if (Array.isArray(dietary) && dietary.length) {
              const rows = dietary.map((preference_id) => ({ preference_id, user_id: userId }));
              await supabase.from("user_dietary_preferences").upsert(rows);
            }

            try { await sendToBackend(); } catch (_) {}

            window.location.href = "/";
          }
        } catch (_) {
          // ignore; will require email verification
        }
      }

      // Persist email for resend on Success step
      try { localStorage.setItem("pendingVerificationEmail", formData.email); } catch (_) {}
      setIsCompleted(true);
      toast({
        title: "Registration Successful!",
        description: "Welcome to Your AI Meals. Check your email for verification.",
      });
      
      // Stay on success screen; user will verify via email
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCompleted) {
    return <SuccessStep />;
  }

  const progressPercentage = (currentStep / 4) * 100;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <AccountInfoStep form={form} />;
      case 2:
        return <HealthPreferencesStep form={form} />;
      case 3:
        return <WaterReminderStep form={form} />;
      case 4:
        return <ReviewStep formData={getValues()} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-foreground">Join Your AI Meals</h1>
            <span className="text-sm text-muted-foreground">
              Step {currentStep} of 4
            </span>
          </div>
          
          <Progress value={progressPercentage} className="mb-4" />
          
          {/* Step indicators */}
          <div className="flex justify-between">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex flex-col items-center space-y-1 flex-1 ${
                  step.id <= currentStep ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.id < currentStep
                      ? "bg-primary text-primary-foreground"
                      : step.id === currentStep
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.id < currentStep ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    step.id
                  )}
                </div>
                <div className="text-center hidden sm:block">
                  <div className="text-xs font-medium">{step.title}</div>
                  <div className="text-xs">{step.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="soft-shadow">
          <CardHeader>
            <CardTitle className="text-xl">
              {steps[currentStep - 1]?.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>

              {currentStep < 4 ? (
                <Button
                  onClick={handleNext}
                  className="flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                  {isSubmitting ? "Creating Account..." : "Confirm & Submit"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}