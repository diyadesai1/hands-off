import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not set");
}

export async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI as string, {
      serverSelectionTimeoutMS: 10000,
      authSource: "admin",
    });
    console.log("Connected to MongoDB Atlas");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

const trustedContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  relationship: { type: String, required: true },
  isEmergency: { type: Boolean, default: false },
});

trustedContactSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc: any, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const alertHistorySchema = new mongoose.Schema({
  type: { type: String, required: true },
  contactId: { type: String, default: null },
  latitude: { type: String, default: null },
  longitude: { type: String, default: null },
  timestamp: { type: Date, default: Date.now },
});

alertHistorySchema.set("toJSON", {
  virtuals: true,
  transform: (_doc: any, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const appSettingsSchema = new mongoose.Schema({
  id: { type: Number, default: 1 },
  gestureHoldDuration: { type: Number, default: 3 },
  fakeCallDelay: { type: Number, default: 1 },
  callerName: { type: String, default: "Alex" },
  autoSendLocation: { type: Boolean, default: true },
});

appSettingsSchema.set("toJSON", {
  virtuals: false,
  transform: (_doc: any, ret: any) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const TrustedContactModel = mongoose.model("TrustedContact", trustedContactSchema);
export const AlertHistoryModel = mongoose.model("AlertHistory", alertHistorySchema);
export const AppSettingsModel = mongoose.model("AppSettings", appSettingsSchema);
