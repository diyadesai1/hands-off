// ElevenLabs integration via Replit connector
import { ElevenLabsClient } from "elevenlabs";
import { Readable } from "stream";

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? "depl " + process.env.WEB_REPL_RENEWAL
    : null;

  if (!xReplitToken) {
    throw new Error("X_REPLIT_TOKEN not found for repl/depl");
  }

  connectionSettings = await fetch(
    "https://" + hostname + "/api/v2/connection?include_secrets=true&connector_names=elevenlabs",
    {
      headers: {
        Accept: "application/json",
        X_REPLIT_TOKEN: xReplitToken,
      },
    }
  )
    .then((res) => res.json())
    .then((data) => data.items?.[0]);

  if (!connectionSettings || !connectionSettings.settings.api_key) {
    throw new Error("ElevenLabs not connected");
  }
  return connectionSettings.settings.api_key;
}

export async function getElevenLabsClient() {
  const apiKey = await getCredentials();
  return new ElevenLabsClient({ apiKey });
}

const VOICE_ID = "Xb7hH8MSUJpSbSDYk0k2";

export async function generateSpeechAudio(text: string): Promise<Buffer> {
  const client = await getElevenLabsClient();

  const audioStream = await client.textToSpeech.convert(VOICE_ID, {
    text,
    model_id: "eleven_flash_v2_5",
    output_format: "mp3_44100_128",
  });

  const chunks: Buffer[] = [];

  if (audioStream instanceof Readable) {
    for await (const chunk of audioStream) {
      chunks.push(Buffer.from(chunk));
    }
  } else if (audioStream && typeof (audioStream as any)[Symbol.asyncIterator] === "function") {
    for await (const chunk of audioStream as any) {
      chunks.push(Buffer.from(chunk));
    }
  } else {
    chunks.push(Buffer.from(audioStream as any));
  }

  return Buffer.concat(chunks);
}
