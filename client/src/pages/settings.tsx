import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { AppSettings } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertAppSettingsSchema } from "@shared/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
} from "@/components/ui/form";

const settingsSchema = insertAppSettingsSchema.extend({
  gestureHoldDuration: z.number().min(1).max(10),
  fakeCallDelay: z.number().min(0).max(5),
  callerName: z.string().min(1),
  autoSendLocation: z.boolean(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function Settings() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: settings, isLoading } = useQuery<AppSettings>({
    queryKey: ["/api/settings"],
  });

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      gestureHoldDuration: 3,
      fakeCallDelay: 1,
      callerName: "Alex",
      autoSendLocation: true,
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        gestureHoldDuration: settings.gestureHoldDuration ?? 3,
        fakeCallDelay: settings.fakeCallDelay ?? 1,
        callerName: settings.callerName ?? "Alex",
        autoSendLocation: settings.autoSendLocation ?? true,
      });
    }
  }, [settings, form]);

  const saveMutation = useMutation({
    mutationFn: async (data: SettingsFormValues) => {
      const res = await apiRequest("PUT", "/api/settings", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Settings saved", description: "Your preferences have been updated." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
    },
  });

  const onSubmit = (data: SettingsFormValues) => {
    saveMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-3xl px-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-40 bg-muted rounded" />
          <div className="h-40 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between gap-4 h-14">
          <div className="flex items-center gap-3">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => navigate("/")}
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">Settings</span>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardContent className="p-5 space-y-6">
                  <h3 className="font-semibold text-foreground">Gesture Detection</h3>

                  <FormField
                    control={form.control}
                    name="gestureHoldDuration"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between gap-2">
                          <FormLabel>Hold Duration</FormLabel>
                          <span className="text-sm font-medium text-primary" data-testid="text-hold-duration">
                            {field.value}s
                          </span>
                        </div>
                        <FormControl>
                          <Slider
                            min={1}
                            max={10}
                            step={1}
                            value={[field.value]}
                            onValueChange={(vals) => field.onChange(vals[0])}
                            data-testid="slider-hold-duration"
                          />
                        </FormControl>
                        <FormDescription>
                          How long the gesture must be held to confirm. Longer = fewer false positives.
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardContent className="p-5 space-y-6">
                  <h3 className="font-semibold text-foreground">Fake Call</h3>

                  <FormField
                    control={form.control}
                    name="callerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Caller Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Name that appears on the fake call"
                            {...field}
                            data-testid="input-caller-name"
                          />
                        </FormControl>
                        <FormDescription>
                          The name shown during the fake incoming call.
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fakeCallDelay"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between gap-2">
                          <FormLabel>Ring Delay</FormLabel>
                          <span className="text-sm font-medium text-primary" data-testid="text-call-delay">
                            {field.value}s
                          </span>
                        </div>
                        <FormControl>
                          <Slider
                            min={0}
                            max={5}
                            step={1}
                            value={[field.value]}
                            onValueChange={(vals) => field.onChange(vals[0])}
                            data-testid="slider-call-delay"
                          />
                        </FormControl>
                        <FormDescription>
                          Delay before the fake phone call starts ringing after gesture is confirmed.
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardContent className="p-5 space-y-6">
                  <h3 className="font-semibold text-foreground">Location Sharing</h3>

                  <FormField
                    control={form.control}
                    name="autoSendLocation"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between gap-4">
                        <div>
                          <FormLabel>Auto-send Location</FormLabel>
                          <FormDescription>
                            Automatically send your location to your primary emergency contact when the gesture is detected.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-auto-location"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </motion.div>

            <Button
              type="submit"
              className="w-full gap-2"
              disabled={saveMutation.isPending}
              data-testid="button-save-settings"
            >
              <Save className="w-4 h-4" />
              {saveMutation.isPending ? "Saving..." : "Save Settings"}
            </Button>
          </form>
        </Form>
      </main>
    </div>
  );
}
