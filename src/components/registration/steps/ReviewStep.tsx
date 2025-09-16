import { RegistrationFormData } from "../RegistrationStepper";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Heart, Droplets, Mail, Calendar, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ReviewStepProps {
  formData: RegistrationFormData;
}

// ReviewStep expects readable values, so we show raw selections

export function ReviewStep({ formData }: ReviewStepProps) {
  const fullName = [formData.firstName as any, formData.middleName as any, formData.lastName as any]
    .filter(Boolean)
    .join(" ");

  const [dietaryMap, setDietaryMap] = useState<Record<number, string>>({});
  const [allergyMap, setAllergyMap] = useState<Record<number, string>>({});
  const [cuisineMap, setCuisineMap] = useState<Record<number, string>>({});

  useEffect(() => {
    const load = async () => {
      const [dietaryRes, allergyRes, cuisineRes] = await Promise.all([
        supabase.from("dietary_preferences").select("id,name"),
        supabase.from("allergies").select("id,name"),
        supabase.from("cuisines").select("id,name"),
      ]);
      const d: Record<number, string> = {};
      (dietaryRes.data ?? []).forEach((row: any) => { d[row.id] = row.name; });
      const a: Record<number, string> = {};
      (allergyRes.data ?? []).forEach((row: any) => { a[row.id] = row.name; });
      const c: Record<number, string> = {};
      (cuisineRes.data ?? []).forEach((row: any) => { c[row.id] = row.name; });
      setDietaryMap(d);
      setAllergyMap(a);
      setCuisineMap(c);
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Review Your Information
        </h3>
        <p className="text-muted-foreground">
          Please review all the information below before submitting your registration.
        </p>
      </div>

      {/* Account Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <User className="w-5 h-5 text-primary" />
          <h4 className="font-semibold text-foreground">Account Information</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
          <div>
            <div className="text-sm text-muted-foreground">Full Name</div>
            <div className="font-medium">{fullName || "-"}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Email</div>
            <div className="font-medium flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {formData.email}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Date of Birth</div>
            <div className="font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formData.dateOfBirth || "-"}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Gender</div>
            <div className="font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              {formData.gender || "-"}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Height</div>
            <div className="font-medium">{formData.height ?? "-"} {formData.height ? "cm" : ""}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Current Weight</div>
            <div className="font-medium">{formData.weight ?? "-"} {formData.weight ? "kg" : ""}</div>
          </div>
          {formData.targetWeight !== undefined && formData.targetWeight !== null && (
            <div>
              <div className="text-sm text-muted-foreground">Target Weight</div>
              <div className="font-medium">{formData.targetWeight} kg</div>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Health & Dietary Preferences */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <Heart className="w-5 h-5 text-primary" />
          <h4 className="font-semibold text-foreground">Health & Dietary Preferences</h4>
        </div>
        
        <div className="space-y-4 pl-7">
          <div>
            <div className="text-sm text-muted-foreground mb-2">Dietary Preferences</div>
            <div className="flex flex-wrap gap-2">
              {(formData.dietaryPreferences ?? []).map((id) => (
                <Badge key={id} variant="secondary">{dietaryMap[id] ?? `#${id}`}</Badge>
              ))}
            </div>
          </div>

          {(formData.allergies && formData.allergies.length > 0) && (
            <div>
              <div className="text-sm text-muted-foreground mb-2">Allergies</div>
              <div className="flex flex-wrap gap-2">
                {formData.allergies.map((id) => (
                  <Badge key={id} variant="destructive">{allergyMap[id] ?? `#${id}`}</Badge>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="text-sm text-muted-foreground mb-2">Fitness Goals</div>
            <div className="flex flex-wrap gap-2">
              {(formData.healthGoals ?? []).map((g) => (
                <Badge key={g} variant="outline">{g}</Badge>
              ))}
            </div>
          </div>

          {(formData.cuisinePreferences && formData.cuisinePreferences.length > 0) && (
            <div>
              <div className="text-sm text-muted-foreground mb-2">Favorite Cuisines</div>
              <div className="flex flex-wrap gap-2">
                {formData.cuisinePreferences.map((id) => (
                  <Badge key={id} variant="secondary">{cuisineMap[id] ?? `#${id}`}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Water Reminders */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <Droplets className="w-5 h-5 text-primary" />
          <h4 className="font-semibold text-foreground">Water Reminders</h4>
        </div>
        
        <div className="pl-7">
          {formData.enableWaterReminders ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Enabled</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Reminder frequency: {formData.reminderFrequency ? `Every ${formData.reminderFrequency} hour${formData.reminderFrequency > 1 ? 's' : ''}` : 'Default'}
              </div>
            </div>
          ) : (
            <Badge variant="outline">Disabled</Badge>
          )}
        </div>
      </div>

      <div className="bg-muted/50 p-4 rounded-lg mt-6">
        <p className="text-sm text-muted-foreground text-center">
          By clicking "Confirm & Submit", you agree to create your account with the information above.
          You'll receive an email verification link to complete your registration.
        </p>
      </div>
    </div>
  );
}