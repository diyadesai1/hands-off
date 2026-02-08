import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Shield, Trash2, Star, Phone, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { TrustedContact } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertTrustedContactSchema } from "@shared/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const contactFormSchema = insertTrustedContactSchema.extend({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone number is required"),
  relationship: z.string().min(1, "Please select a relationship"),
  isEmergency: z.boolean().default(false),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function Contacts() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: contacts, isLoading } = useQuery<TrustedContact[]>({
    queryKey: ["/api/contacts"],
  });

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      relationship: "",
      isEmergency: false,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ContactFormValues) => {
      const res = await apiRequest("POST", "/api/contacts", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      setIsDialogOpen(false);
      form.reset();
      toast({ title: "Contact added", description: "Your trusted contact has been saved." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add contact.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/contacts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      toast({ title: "Contact removed" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to remove contact.", variant: "destructive" });
    },
  });

  const toggleEmergencyMutation = useMutation({
    mutationFn: async ({ id, isEmergency }: { id: string; isEmergency: boolean }) => {
      const res = await apiRequest("PATCH", `/api/contacts/${id}`, { isEmergency });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
    },
  });

  const onSubmit = (data: ContactFormValues) => {
    createMutation.mutate(data);
  };

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
              <span className="font-semibold text-foreground">Trusted Contacts</span>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" data-testid="button-add-contact">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Contact</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Trusted Contact</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Full name" {...field} data-testid="input-contact-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4567" {...field} data-testid="input-contact-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="relationship"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relationship</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-relationship">
                              <SelectValue placeholder="Select relationship" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="friend">Friend</SelectItem>
                            <SelectItem value="family">Family</SelectItem>
                            <SelectItem value="partner">Partner</SelectItem>
                            <SelectItem value="roommate">Roommate</SelectItem>
                            <SelectItem value="counselor">Counselor</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isEmergency"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-md border p-3">
                        <div>
                          <FormLabel className="text-sm font-medium">Primary Emergency Contact</FormLabel>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            First to be notified when help is triggered
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-emergency"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full gap-2"
                    disabled={createMutation.isPending}
                    data-testid="button-save-contact"
                  >
                    <UserPlus className="w-4 h-4" />
                    {createMutation.isPending ? "Saving..." : "Save Contact"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/3" />
                      <div className="h-3 bg-muted rounded w-1/4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : contacts && contacts.length > 0 ? (
          <div className="space-y-3">
            <AnimatePresence>
              {contacts.map((contact, i) => (
                <motion.div
                  key={contact.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="hover-elevate">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-sm font-semibold text-primary">
                              {contact.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-foreground" data-testid={`text-contact-name-${contact.id}`}>
                                {contact.name}
                              </p>
                              {contact.isEmergency && (
                                <Badge variant="default" className="text-[10px] gap-1">
                                  <Star className="w-2.5 h-2.5" />
                                  Primary
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className="text-xs text-muted-foreground capitalize">{contact.relationship}</span>
                              <span className="text-xs text-muted-foreground">
                                <Phone className="w-3 h-3 inline mr-1" />
                                {contact.phone}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() =>
                              toggleEmergencyMutation.mutate({
                                id: contact.id,
                                isEmergency: !contact.isEmergency,
                              })
                            }
                            data-testid={`button-toggle-emergency-${contact.id}`}
                          >
                            <Star className={`w-4 h-4 ${contact.isEmergency ? "text-primary fill-primary" : "text-muted-foreground"}`} />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteMutation.mutate(contact.id)}
                            disabled={deleteMutation.isPending}
                            data-testid={`button-delete-contact-${contact.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
              <UserPlus className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">No trusted contacts yet</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              Add people you trust who will be notified when you use the distress gesture.
            </p>
            <Button
              className="mt-6 gap-2"
              onClick={() => setIsDialogOpen(true)}
              data-testid="button-add-first-contact"
            >
              <Plus className="w-4 h-4" />
              Add Your First Contact
            </Button>
          </motion.div>
        )}
      </main>
    </div>
  );
}
