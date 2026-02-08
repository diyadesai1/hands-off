import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTrustedContactSchema, insertAlertHistorySchema, insertAppSettingsSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { generateSpeechAudio } from "./elevenlabs";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get("/api/contacts", async (_req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  app.post("/api/contacts", async (req, res) => {
    try {
      const data = insertTrustedContactSchema.parse(req.body);
      const contact = await storage.createContact(data);
      res.status(201).json(contact);
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({ message: fromZodError(err).message });
        return;
      }
      res.status(500).json({ message: "Failed to create contact" });
    }
  });

  app.patch("/api/contacts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateContact(id, req.body);
      if (!updated) {
        res.status(404).json({ message: "Contact not found" });
        return;
      }
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Failed to update contact" });
    }
  });

  app.delete("/api/contacts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteContact(id);
      if (!deleted) {
        res.status(404).json({ message: "Contact not found" });
        return;
      }
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Failed to delete contact" });
    }
  });

  app.get("/api/alerts", async (_req, res) => {
    try {
      const alerts = await storage.getAlerts();
      res.json(alerts);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  app.post("/api/alerts", async (req, res) => {
    try {
      const data = insertAlertHistorySchema.parse(req.body);
      const alert = await storage.createAlert(data);
      res.status(201).json(alert);
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({ message: fromZodError(err).message });
        return;
      }
      res.status(500).json({ message: "Failed to create alert" });
    }
  });

  app.get("/api/settings", async (_req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.put("/api/settings", async (req, res) => {
    try {
      const data = insertAppSettingsSchema.parse(req.body);
      const settings = await storage.updateSettings(data);
      res.json(settings);
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({ message: fromZodError(err).message });
        return;
      }
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  app.post("/api/tts", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== "string") {
        res.status(400).json({ message: "Text is required" });
        return;
      }

      const audioBuffer = await generateSpeechAudio(text);
      res.set({
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.length.toString(),
      });
      res.send(audioBuffer);
    } catch (err: any) {
      console.error("TTS error:", err.message);
      res.status(500).json({ message: "Failed to generate speech" });
    }
  });

  return httpServer;
}
