# HandsOff - Hands-Free Safety Tool

## Overview
A hands-free safety application that uses computer vision (MediaPipe) to detect the international "Signal for Help" hand gesture through the user's camera. When detected, it triggers protective actions like a fake phone call or sending the user's location to trusted contacts.

## Architecture
- **Frontend**: React + Vite + TypeScript with Tailwind CSS and shadcn/ui components
- **Backend**: Express.js API with MongoDB Atlas (Mongoose ODM)
- **Computer Vision**: MediaPipe Hands (runs in-browser, no server processing)
- **Voice AI**: ElevenLabs TTS via Replit connector integration (with browser Speech Synthesis fallback)

## Key Features
1. **Gesture Detection**: Camera-based hand tracking with the "Signal for Help" gesture recognition
2. **State Machine**: Configurable hold duration (1-10 seconds) to prevent false positives
3. **Fake Phone Call**: Web Audio API ring tone + ElevenLabs AI voice for realistic fake call audio
4. **Location Sharing**: Browser geolocation sent to trusted emergency contact via API
5. **Trusted Contacts**: CRUD management with emergency contact designation
6. **Alert History**: Log of all triggered alerts (calls and location shares)
7. **Settings**: Configurable hold duration, call delay, caller name, auto-location toggle
8. **Dark Mode**: ThemeProvider with light/dark toggle

## Routes
- `/` - Landing page with features overview
- `/detect` - Camera detection view with MediaPipe hand tracking
- `/contacts` - Trusted contacts management
- `/settings` - App configuration
- `/history` - Alert history log

## API Endpoints
- `GET/POST /api/contacts` - List/create trusted contacts
- `PATCH/DELETE /api/contacts/:id` - Update/delete contact
- `GET/POST /api/alerts` - List/create alert history entries
- `GET/PUT /api/settings` - Get/update app settings
- `POST /api/tts` - ElevenLabs text-to-speech generation (returns audio/mpeg)

## Database (MongoDB Atlas)
- `trustedcontacts` collection - Name, phone, relationship, isEmergency flag
- `alerthistories` collection - Type (call/location), contactId, lat/lng, timestamp
- `appsettings` collection - Gesture hold duration, call delay, caller name, auto-send location

## Schema
- Types defined in `shared/schema.ts` using Zod (no Drizzle)
- Mongoose models defined in `server/db.ts`
- Storage interface in `server/storage.ts` using MongoStorage class

## Environment Variables
- `MONGODB_URI` - MongoDB Atlas connection string (secret)
- ElevenLabs API key managed via Replit connector integration

## Recent Changes
- 2026-02-08: Migrated database from PostgreSQL/Drizzle to MongoDB Atlas/Mongoose
- 2026-02-08: Integrated ElevenLabs TTS for AI voice in fake call system (with browser Speech Synthesis fallback)
- 2026-02-07: Initial MVP implementation with full gesture detection, fake call system, contact management, settings, and alert history
