const RING_FREQUENCY = 440;
const RING_DURATION = 1.0;
const RING_PAUSE = 2.0;
const RING_CYCLES = 3;

export class FakeCallManager {
  private audioContext: AudioContext | null = null;
  private isRinging = false;
  private isCalling = false;
  private ringTimeout: NodeJS.Timeout | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private messageQueue: string[] = [];
  private isPlayingMessage = false;

  async startRinging(onRingComplete: () => void): Promise<void> {
    if (this.isRinging) return;
    this.isRinging = true;

    this.audioContext = new AudioContext();
    let ringCount = 0;

    const ring = async () => {
      if (!this.isRinging || ringCount >= RING_CYCLES) {
        this.isRinging = false;
        onRingComplete();
        return;
      }

      await this.playRingTone();
      ringCount++;

      this.ringTimeout = setTimeout(() => ring(), (RING_DURATION + RING_PAUSE) * 1000);
    };

    ring();
  }

  private async playRingTone(): Promise<void> {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(RING_FREQUENCY, this.audioContext.currentTime);

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.05);

    const pulseCount = 6;
    const pulseDuration = RING_DURATION / pulseCount;

    for (let i = 0; i < pulseCount; i++) {
      const start = this.audioContext.currentTime + i * pulseDuration;
      gainNode.gain.setValueAtTime(0.3, start);
      gainNode.gain.linearRampToValueAtTime(0.05, start + pulseDuration * 0.5);
      gainNode.gain.linearRampToValueAtTime(0.3, start + pulseDuration);
    }

    gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + RING_DURATION);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + RING_DURATION);
  }

  async startFakeCall(_callerName: string): Promise<void> {
    this.isCalling = true;

    this.messageQueue = [
      `Hey! Where are you? I'm outside waiting.`,
      `I've been trying to call you. Are you coming? I'm right at the front.`,
      `Okay, I can see the building. I'll wait by the entrance. Just hurry up!`,
      `Alright, I'm gonna come in and find you. Stay where you are.`,
    ];

    this.playNextMessage();
  }

  private async playNextMessage(): Promise<void> {
    if (!this.isCalling || this.messageQueue.length === 0 || this.isPlayingMessage) return;

    this.isPlayingMessage = true;
    const text = this.messageQueue.shift()!;

    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error("TTS request failed");

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      await this.playAudioBlob(audioUrl);
      URL.revokeObjectURL(audioUrl);
    } catch (err) {
      console.log("ElevenLabs TTS failed, falling back to browser speech:", err);
      await this.speakFallback(text);
    }

    this.isPlayingMessage = false;

    if (this.isCalling) {
      await this.delay(1500);
      this.playNextMessage();
    }
  }

  private playAudioBlob(url: string): Promise<void> {
    return new Promise((resolve) => {
      const audio = new Audio(url);
      this.currentAudio = audio;
      audio.onended = () => {
        this.currentAudio = null;
        resolve();
      };
      audio.onerror = () => {
        this.currentAudio = null;
        resolve();
      };
      audio.play().catch(() => resolve());
    });
  }

  private speakFallback(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (!window.speechSynthesis) {
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.1;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) => v.name.includes("Google") || v.name.includes("Daniel") || v.name.includes("Alex")
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  stopAll(): void {
    this.isRinging = false;
    this.isCalling = false;
    this.isPlayingMessage = false;
    this.messageQueue = [];
    if (this.ringTimeout) {
      clearTimeout(this.ringTimeout);
      this.ringTimeout = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  getIsRinging(): boolean {
    return this.isRinging;
  }

  getIsCalling(): boolean {
    return this.isCalling;
  }
}
