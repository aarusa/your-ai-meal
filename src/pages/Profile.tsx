import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Target, Utensils, Activity, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [backendUserId, setBackendUserId] = useState<string | null>(null);

  const computeAgeFromDob = (dobString?: string | null): string => {
    if (!dobString) return "";
    const dob = new Date(dobString);
    if (Number.isNaN(dob.getTime())) return "";
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return String(Math.max(age, 0));
  };

  const computeDailyWaterGoalLitersFromKg = (weightKgString?: string): string => {
    if (!weightKgString) return "";
    const kg = Number(weightKgString);
    if (!Number.isFinite(kg) || kg <= 0) return "";
    const pounds = kg * 2.20462;
    const ouncesPerDay = 0.5 * pounds; // rule of thumb
    const litersPerDay = ouncesPerDay * 0.0295735;
    return litersPerDay.toFixed(1);
  };
  
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    targetWeight: "",
    activityLevel: "",
    goal: "",
    dietaryRestrictions: [] as string[],
    allergies: "",
    favoriteFood: "",
    waterGoal: "",
    enableWaterReminders: false,
    reminderInterval: "120",
  });

  type Option = { id: number; name: string };
  const [dietaryOptions, setDietaryOptions] = useState<Option[]>([]);
  const [allergyOptions, setAllergyOptions] = useState<Option[]>([]);
  const [cuisineOptions, setCuisineOptions] = useState<Option[]>([]);
  const [selectedDietary, setSelectedDietary] = useState<number[]>([]);
  const [selectedAllergies, setSelectedAllergies] = useState<number[]>([]);
  const [selectedCuisines, setSelectedCuisines] = useState<number[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        const authUser = auth.user;
        if (!authUser) {
          navigate("/auth");
          return;
        }
        setUserId(authUser.id);
        setProfile((prev) => ({
          ...prev,
          email: authUser.email ?? prev.email,
          name: prev.name || (authUser.email ? authUser.email.split("@")[0] : ""),
        }));

        const { data: profileRow, error } = await (supabase as any)
          .from("user_profiles")
          .select("gender,height_cm,current_weight,target_weight,activity_level,health_goals,date_of_birth,water_reminder_enabled,water_reminder_interval")
          .eq("user_id", authUser.id)
          .maybeSingle();
        if (error) throw error;
        if (profileRow) {
          setProfile((prev) => ({
            ...prev,
            gender: profileRow.gender ?? prev.gender,
            height: profileRow.height_cm?.toString() ?? prev.height,
            weight: profileRow.current_weight?.toString() ?? prev.weight,
            targetWeight: profileRow.target_weight?.toString() ?? prev.targetWeight,
            activityLevel: profileRow.activity_level ?? prev.activityLevel,
            goal: Array.isArray(profileRow.health_goals) && profileRow.health_goals.length > 0 ? String(profileRow.health_goals[0]) : prev.goal,
            age: computeAgeFromDob(profileRow.date_of_birth) || prev.age,
            waterGoal: computeDailyWaterGoalLitersFromKg(profileRow.current_weight != null ? String(profileRow.current_weight) : prev.weight) || prev.waterGoal,
            enableWaterReminders: !!profileRow.water_reminder_enabled,
            reminderInterval: profileRow.water_reminder_interval != null ? String(profileRow.water_reminder_interval) : prev.reminderInterval,
          }));
        }

        // Also attempt to hydrate from backend aggregate API
        try {
          const API_BASE = (import.meta as any).env?.VITE_API_URL || "https://your-ai-meal-api.onrender.com";
          const res = await fetch(`${API_BASE}/api/users`, { headers: { "Content-Type": "application/json" } });
          if (res.ok) {
            const users = await res.json();
            const u = users?.find((x: any) => x.email === authUser.email || x.id === authUser.id);
            if (u) {
              setBackendUserId(u.id);
              const up = Array.isArray(u.user_profiles) ? u.user_profiles[0] : null;
              setProfile((prev) => ({
                ...prev,
                name: [u.first_name, u.middle_name, u.last_name].filter(Boolean).join(" ") || prev.name,
                email: u.email || prev.email,
                gender: up?.gender ?? prev.gender,
                height: up?.height_cm != null ? String(up.height_cm) : prev.height,
                weight: up?.current_weight != null ? String(up.current_weight) : prev.weight,
                targetWeight: up?.target_weight != null ? String(up.target_weight) : prev.targetWeight,
                activityLevel: up?.activity_level ?? prev.activityLevel,
                goal: Array.isArray(up?.health_goals) && up.health_goals.length ? String(up.health_goals[0]) : prev.goal,
                age: computeAgeFromDob(up?.date_of_birth) || prev.age,
                waterGoal: computeDailyWaterGoalLitersFromKg(up?.current_weight != null ? String(up.current_weight) : prev.weight) || prev.waterGoal,
                enableWaterReminders: !!up?.water_reminder_enabled || prev.enableWaterReminders,
                reminderInterval: up?.water_reminder_interval != null ? String(up.water_reminder_interval) : prev.reminderInterval,
              }));

              // Preselect preferences (IDs)
              const aIds = Array.isArray(u.user_allergies) ? u.user_allergies.map((r: any) => r.allergy_id) : [];
              const cIds = Array.isArray(u.user_cuisine_preferences) ? u.user_cuisine_preferences.map((r: any) => r.cuisine_id) : [];
              const dIds = Array.isArray(u.user_dietary_preferences) ? u.user_dietary_preferences.map((r: any) => r.preference_id) : [];
              setSelectedAllergies(aIds);
              setSelectedCuisines(cIds);
              setSelectedDietary(dIds);
            }
          }
        } catch (_) {
          // ignore backend fetch errors for hydration
        }

        // Load options dynamically from Supabase
        try {
          const [dietaryRes, allergyRes, cuisineRes] = await Promise.all([
            supabase.from("dietary_preferences").select("id,name"),
            supabase.from("allergies").select("id,name"),
            supabase.from("cuisines").select("id,name"),
          ]);
          if (dietaryRes.data) setDietaryOptions(dietaryRes.data as any);
          if (allergyRes.data) setAllergyOptions(allergyRes.data as any);
          if (cuisineRes.data) setCuisineOptions(cuisineRes.data as any);
        } catch (_) {
          // ignore
        }
      } catch (e: any) {
        toast({ title: "Error loading profile", description: e.message ?? String(e), variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [navigate, toast]);

  const handleSave = async () => {
    if (!userId) return;
    try {
      // Save via backend to bypass RLS and update joins
      const API_BASE = (import.meta as any).env?.VITE_API_URL || "https://your-ai-meal-api.onrender.com";
      // Prefer unified edit endpoint if backend user id is known
      const fullName = (profile.name || "").trim();
      const parts = fullName.split(/\s+/);
      const first_name = parts[0] || null;
      const last_name = parts.length > 1 ? parts[parts.length - 1] : null;
      const middle_name = parts.length > 2 ? parts.slice(1, -1).join(" ") : null;

      const payload = {
        email: profile.email || null,
        first_name,
        middle_name,
        last_name,
        gender: profile.gender || null,
        height_cm: profile.height ? Number(profile.height) : null,
        current_weight: profile.weight ? Number(profile.weight) : null,
        target_weight: profile.targetWeight ? Number(profile.targetWeight) : null,
        activity_level: profile.activityLevel || null,
        health_goals: profile.goal ? [profile.goal] : [],
        water_reminder_enabled: profile.enableWaterReminders,
        water_reminder_interval: profile.reminderInterval ? Number(profile.reminderInterval) : null,
        allergies: selectedAllergies,
        cuisine_preferences: selectedCuisines,
        dietary_preferences: selectedDietary,
      } as any;

      const res = await fetch(
        backendUserId ? `${API_BASE}/api/users/${backendUserId}` : `${API_BASE}/api/users/profile`,
        {
          method: backendUserId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(backendUserId ? payload : { user_id: userId, ...payload }),
        }
      );
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to save profile");
      }
      toast({
        title: "Profile Updated",
        description: "Your information has been saved.",
      });
    } catch (e: any) {
      toast({ title: "Error", description: e.message ?? String(e), variant: "destructive" });
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
      navigate("/auth");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDietaryRestrictionChange = (restriction: string, checked: boolean) => {
    setProfile(prev => ({
      ...prev,
      dietaryRestrictions: checked 
        ? [...prev.dietaryRestrictions, restriction]
        : prev.dietaryRestrictions.filter(r => r !== restriction)
    }));
  };

  const toggleIdInArray = (arr: number[], id: number, checked: boolean) => {
    if (checked) return Array.from(new Set([...(arr || []), id]));
    return (arr || []).filter((x) => x !== id);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="lg"
              className="px-8"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button
              variant="destructive"
              size="lg"
              className="px-8"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">Loading profile...</div>
        ) : (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">User Profile</h1>
            <p className="text-muted-foreground">Manage your personal information and dietary preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input 
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input 
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                    disabled
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input 
                      id="age"
                      type="number"
                      value={profile.age}
                      onChange={(e) => setProfile(prev => ({ ...prev, age: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select 
                      value={profile.gender} 
                      onValueChange={(value) => setProfile(prev => ({ ...prev, gender: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input 
                      id="height"
                      type="number"
                      value={profile.height}
                      onChange={(e) => setProfile(prev => ({ ...prev, height: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="weight">Current weight (kg)</Label>
                    <Input 
                      id="weight"
                      type="number"
                      value={profile.weight}
                      onChange={(e) => setProfile(prev => ({ ...prev, weight: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Goals & Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Goals & Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="targetWeight">Target weight (kg)</Label>
                  <Input 
                    id="targetWeight"
                    type="number"
                    value={profile.targetWeight}
                    onChange={(e) => setProfile(prev => ({ ...prev, targetWeight: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goal">Primary goal</Label>
                  <Select 
                    value={profile.goal} 
                    onValueChange={(value) => setProfile(prev => ({ ...prev, goal: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weight-loss">Weight Loss</SelectItem>
                      <SelectItem value="weight-gain">Weight Gain</SelectItem>
                      <SelectItem value="muscle-gain">Muscle Gain</SelectItem>
                      <SelectItem value="maintenance">Weight Maintenance</SelectItem>
                      <SelectItem value="general-health">General Health</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activityLevel">Activity level</Label>
                  <Select 
                    value={profile.activityLevel} 
                    onValueChange={(value) => setProfile(prev => ({ ...prev, activityLevel: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">Sedentary (little/no exercise)</SelectItem>
                      <SelectItem value="light">Light (1-3 days/week)</SelectItem>
                      <SelectItem value="moderate">Moderate (3-5 days/week)</SelectItem>
                      <SelectItem value="active">Active (6-7 days/week)</SelectItem>
                      <SelectItem value="very-active">Very Active (2x/day, intense)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Water controls moved to a separate card below */}
              </CardContent>
            </Card>
          </div>

          {/* Dietary Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="h-5 w-5" />
                Dietary Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Dietary preferences</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {dietaryOptions.map((opt) => (
                    <div key={opt.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`diet-${opt.id}`}
                        checked={selectedDietary.includes(opt.id)}
                        onCheckedChange={(checked) =>
                          setSelectedDietary((prev) => toggleIdInArray(prev, opt.id, checked as boolean))
                        }
                      />
                      <Label htmlFor={`diet-${opt.id}`} className="text-sm font-normal cursor-pointer">
                        {opt.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Allergies</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {allergyOptions.map((opt) => (
                    <div key={opt.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`alg-${opt.id}`}
                        checked={selectedAllergies.includes(opt.id)}
                        onCheckedChange={(checked) =>
                          setSelectedAllergies((prev) => toggleIdInArray(prev, opt.id, checked as boolean))
                        }
                      />
                      <Label htmlFor={`alg-${opt.id}`} className="text-sm font-normal cursor-pointer">
                        {opt.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Favorite cuisines</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {cuisineOptions.map((opt) => (
                    <div key={opt.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cui-${opt.id}`}
                        checked={selectedCuisines.includes(opt.id)}
                        onCheckedChange={(checked) =>
                          setSelectedCuisines((prev) => toggleIdInArray(prev, opt.id, checked as boolean))
                        }
                      />
                      <Label htmlFor={`cui-${opt.id}`} className="text-sm font-normal cursor-pointer">
                        {opt.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Water & Hydration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Hydration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="waterGoal">Daily water goal (L)</Label>
                <Input 
                  id="waterGoal"
                  type="number"
                  step="0.1"
                  value={profile.waterGoal}
                  onChange={(e) => setProfile(prev => ({ ...prev, waterGoal: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Water reminders</Label>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Enable reminders</div>
                    <div className="text-xs text-muted-foreground">Receive gentle hydration reminders</div>
                  </div>
                  <Switch
                    checked={profile.enableWaterReminders}
                    onCheckedChange={(checked) => setProfile((p) => ({ ...p, enableWaterReminders: checked }))}
                  />
                </div>
              </div>

              {profile.enableWaterReminders && (
                <div className="space-y-2">
                  <Label>Reminder interval</Label>
                  <Select
                    value={profile.reminderInterval}
                    onValueChange={(value) => setProfile((p) => ({ ...p, reminderInterval: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="60">Every 1 hour</SelectItem>
                      <SelectItem value="120">Every 2 hours</SelectItem>
                      <SelectItem value="180">Every 3 hours</SelectItem>
                      <SelectItem value="240">Every 4 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-center">
            <Button onClick={handleSave} size="lg" className="px-8">
              Save changes
            </Button>
          </div>
        </div>
        )}
      </main>
    </div>
  );
}