import { UseFormReturn } from "react-hook-form";
import { RegistrationFormData } from "../RegistrationStepper";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface HealthPreferencesStepProps {
  form: UseFormReturn<RegistrationFormData>;
}

type Option = { id: number; label: string };

const fitnessGoals = [
  { id: "weight-loss", label: "Weight Loss" },
  { id: "muscle-gain", label: "Muscle Gain" },
  { id: "maintain-health", label: "Maintain Health" },
  { id: "balanced-diet", label: "Balanced Diet" },
  { id: "increase-energy", label: "Increase Energy" },
  { id: "athletic-performance", label: "Athletic Performance" },
];

export function HealthPreferencesStep({ form }: HealthPreferencesStepProps) {
  const watchedDietary = form.watch("dietaryPreferences");
  const watchedAllergies = form.watch("allergies");
  const watchedCuisines = form.watch("cuisinePreferences");
  const watchedGoals = form.watch("healthGoals");

  const [dietaryOptions, setDietaryOptions] = useState<Option[]>([]);
  const [allergyOptions, setAllergyOptions] = useState<Option[]>([]);
  const [cuisineOptions, setCuisineOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [{ data: dietary }, { data: allergies }, { data: cuisines }] = await Promise.all([
          supabase.from("dietary_preferences").select("id,name"),
          supabase.from("allergies").select("id,name"),
          supabase.from("cuisines").select("id,name"),
        ]);
        setDietaryOptions((dietary ?? []).map((d) => ({ id: d.id as number, label: d.name as string })));
        setAllergyOptions((allergies ?? []).map((a) => ({ id: a.id as number, label: a.name as string })));
        setCuisineOptions((cuisines ?? []).map((c) => ({ id: c.id as number, label: c.name as string })));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <Form {...form}>
      <div className="space-y-6">
        {/* Activity Level */}
        <FormField
          control={form.control}
          name="activityLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Activity Level</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select activity level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary (little/no exercise)</SelectItem>
                  <SelectItem value="light">Light (1-3 days/week)</SelectItem>
                  <SelectItem value="moderate">Moderate (3-5 days/week)</SelectItem>
                  <SelectItem value="active">Active (6-7 days/week)</SelectItem>
                  <SelectItem value="very-active">Very Active (2x/day, intense)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Dietary Preferences (DB-driven) */}
        <FormField
          control={form.control}
          name="dietaryPreferences"
          render={() => (
            <FormItem>
              <FormLabel className="text-base font-semibold">
                Dietary Preferences
              </FormLabel>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                {dietaryOptions.map((option) => (
                  <FormField
                    key={option.id}
                    control={form.control}
                    name="dietaryPreferences"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={option.id}
                          className="flex flex-row items-center space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(option.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...(field.value ?? []), option.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== option.id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal cursor-pointer">
                            {option.label}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              {watchedDietary && watchedDietary.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {watchedDietary.map((item) => (
                    <Badge key={item} variant="secondary">
                      {dietaryOptions.find(opt => opt.id === item)?.label}
                    </Badge>
                  ))}
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Allergies (DB-driven) */}
        <FormField
          control={form.control}
          name="allergies"
          render={() => (
            <FormItem>
              <FormLabel className="text-base font-semibold">
                Allergies (Optional)
              </FormLabel>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                {allergyOptions.map((option) => (
                  <FormField
                    key={option.id}
                    control={form.control}
                    name="allergies"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={option.id}
                          className="flex flex-row items-center space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(option.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...(field.value ?? []), option.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== option.id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal cursor-pointer">
                            {option.label}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              {watchedAllergies && watchedAllergies.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {watchedAllergies.map((item) => (
                    <Badge key={item} variant="destructive">
                      {allergyOptions.find(opt => opt.id === item)?.label}
                    </Badge>
                  ))}
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Cuisine Preferences (DB-driven) */}
        <FormField
          control={form.control}
          name="cuisinePreferences"
          render={() => (
            <FormItem>
              <FormLabel className="text-base font-semibold">
                Favorite Cuisines (Optional)
              </FormLabel>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                {cuisineOptions.map((option) => (
                  <FormField
                    key={option.id}
                    control={form.control}
                    name="cuisinePreferences"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={option.id}
                          className="flex flex-row items-center space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(option.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...(field.value ?? []), option.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== option.id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal cursor-pointer">
                            {option.label}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              {watchedCuisines && watchedCuisines.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {watchedCuisines.map((item) => (
                    <Badge key={item} variant="secondary">
                      {cuisineOptions.find(opt => opt.id === item)?.label}
                    </Badge>
                  ))}
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Health Goals (static strings) */}
        <FormField
          control={form.control}
          name="healthGoals"
          render={() => (
            <FormItem>
              <FormLabel className="text-base font-semibold">
                Fitness/Nutrition Goals
              </FormLabel>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                {fitnessGoals.map((option) => (
                  <FormField
                    key={option.id}
                    control={form.control}
                    name="healthGoals"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={option.id}
                          className="flex flex-row items-center space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(option.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...(field.value ?? []), option.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== option.id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal cursor-pointer">
                            {option.label}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              {watchedGoals && watchedGoals.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {watchedGoals.map((item) => (
                    <Badge key={item} variant="secondary">
                      {fitnessGoals.find(opt => opt.id === item)?.label}
                    </Badge>
                  ))}
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Form>
  );
}