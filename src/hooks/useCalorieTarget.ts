import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { calculateAgeFromDob, calculateTdee } from "@/lib/calories";

type Profile = {
  gender?: string | null;
  current_weight?: number | null; // kg
  height_cm?: number | null;
  date_of_birth?: string | null; // ISO
  activity_level?: string | null; // e.g., sedentary, lightly_active, etc.
};

export function useCalorieTarget() {
  const [target, setTarget] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setLoading(false); return; }
      const { data, error } = await supabase
        .from("user_profiles")
        .select("gender, current_weight, height_cm, date_of_birth, activity_level")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (error) { setLoading(false); return; }
      const p = (data || {}) as Profile;
      const age = calculateAgeFromDob(p.date_of_birth);
      const tdee = calculateTdee({
        gender: p.gender,
        weightKg: p.current_weight ?? undefined,
        heightCm: p.height_cm ?? undefined,
        ageYears: age ?? undefined,
        activity: p.activity_level ?? undefined,
      });
      if (mounted) {
        setTarget(tdee);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return { target, loading };
}


