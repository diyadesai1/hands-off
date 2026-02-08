import {
  type TrustedContact,
  type InsertTrustedContact,
  type AlertHistory,
  type InsertAlertHistory,
  type AppSettings,
  type InsertAppSettings,
} from "@shared/schema";
import { TrustedContactModel, AlertHistoryModel, AppSettingsModel } from "./db";

export interface IStorage {
  getContacts(): Promise<TrustedContact[]>;
  getContact(id: string): Promise<TrustedContact | undefined>;
  createContact(contact: InsertTrustedContact): Promise<TrustedContact>;
  updateContact(id: string, data: Partial<InsertTrustedContact>): Promise<TrustedContact | undefined>;
  deleteContact(id: string): Promise<boolean>;

  getAlerts(): Promise<AlertHistory[]>;
  createAlert(alert: InsertAlertHistory): Promise<AlertHistory>;

  getSettings(): Promise<AppSettings>;
  updateSettings(settings: InsertAppSettings): Promise<AppSettings>;
}

export class MongoStorage implements IStorage {
  async getContacts(): Promise<TrustedContact[]> {
    const docs = await TrustedContactModel.find().lean();
    return docs.map((d: any) => ({
      id: d._id.toString(),
      name: d.name,
      phone: d.phone,
      relationship: d.relationship,
      isEmergency: d.isEmergency ?? false,
    }));
  }

  async getContact(id: string): Promise<TrustedContact | undefined> {
    const doc = await TrustedContactModel.findById(id).lean();
    if (!doc) return undefined;
    return {
      id: (doc as any)._id.toString(),
      name: (doc as any).name,
      phone: (doc as any).phone,
      relationship: (doc as any).relationship,
      isEmergency: (doc as any).isEmergency ?? false,
    };
  }

  async createContact(contact: InsertTrustedContact): Promise<TrustedContact> {
    const doc = await TrustedContactModel.create(contact);
    return doc.toJSON() as unknown as TrustedContact;
  }

  async updateContact(id: string, data: Partial<InsertTrustedContact>): Promise<TrustedContact | undefined> {
    const doc = await TrustedContactModel.findByIdAndUpdate(id, data, { new: true });
    if (!doc) return undefined;
    return doc.toJSON() as unknown as TrustedContact;
  }

  async deleteContact(id: string): Promise<boolean> {
    const result = await TrustedContactModel.findByIdAndDelete(id);
    return result !== null;
  }

  async getAlerts(): Promise<AlertHistory[]> {
    const docs = await AlertHistoryModel.find().sort({ timestamp: -1 }).lean();
    return docs.map((d: any) => ({
      id: d._id.toString(),
      type: d.type,
      contactId: d.contactId ?? null,
      latitude: d.latitude ?? null,
      longitude: d.longitude ?? null,
      timestamp: d.timestamp ?? null,
    }));
  }

  async createAlert(alert: InsertAlertHistory): Promise<AlertHistory> {
    const doc = await AlertHistoryModel.create(alert);
    return doc.toJSON() as unknown as AlertHistory;
  }

  async getSettings(): Promise<AppSettings> {
    const existing = await AppSettingsModel.findOne({ id: 1 });
    if (existing) return existing.toJSON() as unknown as AppSettings;

    const created = await AppSettingsModel.create({
      id: 1,
      gestureHoldDuration: 3,
      fakeCallDelay: 1,
      callerName: "Gabriella",
      autoSendLocation: true,
    });
    return created.toJSON() as unknown as AppSettings;
  }

  async updateSettings(settings: InsertAppSettings): Promise<AppSettings> {
    const doc = await AppSettingsModel.findOneAndUpdate(
      { id: 1 },
      settings,
      { new: true, upsert: true }
    );
    return doc.toJSON() as unknown as AppSettings;
  }
}

export const storage = new MongoStorage();
