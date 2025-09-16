import { UseFormReturn } from "react-hook-form";
import { RegistrationFormData } from "../RegistrationStepper";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form, FormDescription } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Droplets } from "lucide-react";

interface WaterReminderStepProps {
  form: UseFormReturn<RegistrationFormData>;
}

export function WaterReminderStep({ form }: WaterReminderStepProps) {
  const enableWaterReminders = form.watch("enableWaterReminders");

  return (
    <Form {...form}>
      <div className="space-y-6">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Droplets className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Stay Hydrated
          </h3>
          <p className="text-muted-foreground">
            Would you like us to remind you to drink water throughout the day?
          </p>
        </div>

        <FormField
          control={form.control}
          name="enableWaterReminders"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Enable Water Reminders
                </FormLabel>
                <FormDescription>
                  Get notifications to help you stay hydrated
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {enableWaterReminders && (
          <FormField
            control={form.control}
            name="reminderFrequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reminder Interval</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(parseInt(value))} 
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="How often should we remind you?" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="60">Every 1 hour</SelectItem>
                    <SelectItem value="120">Every 2 hours</SelectItem>
                    <SelectItem value="180">Every 3 hours</SelectItem>
                    <SelectItem value="240">Every 4 hours</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Choose how frequently you'd like to receive water reminders (in minutes)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {!enableWaterReminders && (
          <div className="text-center p-6 bg-muted/50 rounded-lg">
            <p className="text-muted-foreground">
              No worries! You can always enable water reminders later in your profile settings.
            </p>
          </div>
        )}
      </div>
    </Form>
  );
}