import { z } from "zod";

export const insertTrustedContactSchema = z.object({
  name: z.string(),
  phone: z.string(),
  relationship: z.string(),
  isEmergency: z.boolean().default(false),
});

export const insertAlertHistorySchema = z.object({
  type: z.string(),
  contactId: z.string().optional().nullable(),
  latitude: z.string().optional().nullable(),
  longitude: z.string().optional().nullable(),
});

export const insertAppSettingsSchema = z.object({
  gestureHoldDuration: z.number().default(3),
  fakeCallDelay: z.number().default(1),
  callerName: z.string().default("Alex"),
  autoSendLocation: z.boolean().default(true),
});

export type InsertTrustedContact = z.infer<typeof insertTrustedContactSchema>;
export type TrustedContact = InsertTrustedContact & { id: string };
export type InsertAlertHistory = z.infer<typeof insertAlertHistorySchema>;
export type AlertHistory = InsertAlertHistory & { id: string; timestamp: Date | null };
export type InsertAppSettings = z.infer<typeof insertAppSettingsSchema>;
export type AppSettings = InsertAppSettings & { id: number };
