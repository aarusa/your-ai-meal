export type ActivityLevel = "sedentary" | "light" | "moderate" | "very" | "super" | "lightly_active" | "moderately_active" | "very_active" | "super_active";

export function calculateAgeFromDob(dobIso?: string | null) {
  if (!dobIso) return undefined;
  const dob = new Date(dobIso);
  if (isNaN(dob.getTime())) return undefined;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

export function activityFactor(level?: ActivityLevel | string | null) {
  const key = String(level || "sedentary").toLowerCase();
  if (key.includes("super")) return 1.9; // super active
  if (key.includes("very")) return 1.725; // very active
  if (key.includes("moderate")) return 1.55; // moderately active
  if (key.includes("light")) return 1.375; // lightly active
  if (key.includes("sedentary")) return 1.2; // sedentary
  return 1.2;
}

// Mifflin-St Jeor BMR and TDEE
export function calculateBmrMifflin({ gender, weightKg, heightCm, ageYears }: { gender?: string | null; weightKg?: number | null; heightCm?: number | null; ageYears?: number | null; }) {
  if (!weightKg || !heightCm || !ageYears) return undefined;
  const g = String(gender || "male").toLowerCase();
  const s = g.startsWith("f") ? -161 : 5; // female vs male
  return Math.round(10 * weightKg + 6.25 * heightCm - 5 * ageYears + s);
}

export function calculateTdee(params: { gender?: string | null; weightKg?: number | null; heightCm?: number | null; ageYears?: number | null; activity?: ActivityLevel | string | null; }) {
  const bmr = calculateBmrMifflin(params);
  if (!bmr) return undefined;
  const factor = activityFactor(params.activity);
  return Math.round(bmr * factor);
}


