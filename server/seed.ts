import { storage } from "./storage";
import { TrustedContactModel } from "./db";

export async function seedDatabase() {
  const count = await TrustedContactModel.countDocuments();
  if (count > 0) return;

  await storage.createContact({
    name: "Jordan Rivera",
    phone: "+1 (555) 234-5678",
    relationship: "friend",
    isEmergency: true,
  });

  await storage.createContact({
    name: "Sam Chen",
    phone: "+1 (555) 876-5432",
    relationship: "family",
    isEmergency: false,
  });

  await storage.createContact({
    name: "Casey Williams",
    phone: "+1 (555) 345-6789",
    relationship: "roommate",
    isEmergency: false,
  });

  await storage.getSettings();

  console.log("Database seeded with sample contacts");
}
