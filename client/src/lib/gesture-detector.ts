export type GestureState = "idle" | "detecting" | "confirmed" | "cooldown";

export interface GestureDetectorConfig {
  holdDuration: number;
  cooldownDuration: number;
}

export class GestureStateMachine {
  private state: GestureState = "idle";
  private gestureStartTime: number | null = null;
  private cooldownStartTime: number | null = null;
  private holdDuration: number;
  private cooldownDuration: number;
  private onStateChange: (state: GestureState, progress: number) => void;
  private onConfirmed: () => void;

  constructor(
    config: GestureDetectorConfig,
    onStateChange: (state: GestureState, progress: number) => void,
    onConfirmed: () => void
  ) {
    this.holdDuration = config.holdDuration * 1000;
    this.cooldownDuration = config.cooldownDuration * 1000;
    this.onStateChange = onStateChange;
    this.onConfirmed = onConfirmed;
  }

  update(gestureDetected: boolean): void {
    const now = Date.now();

    switch (this.state) {
      case "idle":
        if (gestureDetected) {
          this.state = "detecting";
          this.gestureStartTime = now;
          this.onStateChange("detecting", 0);
        }
        break;

      case "detecting":
        if (!gestureDetected) {
          this.state = "idle";
          this.gestureStartTime = null;
          this.onStateChange("idle", 0);
        } else {
          const elapsed = now - (this.gestureStartTime || now);
          const progress = Math.min(elapsed / this.holdDuration, 1);
          this.onStateChange("detecting", progress);

          if (progress >= 1) {
            this.state = "confirmed";
            this.onStateChange("confirmed", 1);
            this.onConfirmed();
            setTimeout(() => {
              this.state = "cooldown";
              this.cooldownStartTime = Date.now();
              this.onStateChange("cooldown", 0);
            }, 2000);
          }
        }
        break;

      case "confirmed":
        break;

      case "cooldown":
        const cooldownElapsed = now - (this.cooldownStartTime || now);
        if (cooldownElapsed >= this.cooldownDuration) {
          this.state = "idle";
          this.cooldownStartTime = null;
          this.onStateChange("idle", 0);
        }
        break;
    }
  }

  reset(): void {
    this.state = "idle";
    this.gestureStartTime = null;
    this.cooldownStartTime = null;
    this.onStateChange("idle", 0);
  }

  getState(): GestureState {
    return this.state;
  }
}

export function isSignalForHelp(landmarks: any[]): boolean {
  if (!landmarks || landmarks.length < 21) return false;

  const thumb_tip = landmarks[4];
  const thumb_ip = landmarks[3];
  const thumb_mcp = landmarks[2];
  const index_tip = landmarks[8];
  const index_pip = landmarks[6];
  const middle_tip = landmarks[12];
  const middle_pip = landmarks[10];
  const ring_tip = landmarks[16];
  const ring_pip = landmarks[14];
  const pinky_tip = landmarks[20];
  const pinky_pip = landmarks[18];
  const wrist = landmarks[0];
  const index_mcp = landmarks[5];

  const fingersCurled =
    index_tip.y > index_pip.y &&
    middle_tip.y > middle_pip.y &&
    ring_tip.y > ring_pip.y &&
    pinky_tip.y > pinky_pip.y;

  const thumbTucked = thumb_tip.y > thumb_mcp.y &&
    thumb_tip.x > Math.min(index_mcp.x, pinky_tip.x) - 0.05 &&
    thumb_tip.x < Math.max(index_mcp.x, pinky_tip.x) + 0.05;

  const palmFacing = wrist.z > index_mcp.z;

  return fingersCurled && thumbTucked;
}

export function isOpenPalm(landmarks: any[]): boolean {
  if (!landmarks || landmarks.length < 21) return false;

  const thumb_tip = landmarks[4];
  const thumb_mcp = landmarks[2];
  const index_tip = landmarks[8];
  const index_pip = landmarks[6];
  const middle_tip = landmarks[12];
  const middle_pip = landmarks[10];
  const ring_tip = landmarks[16];
  const ring_pip = landmarks[14];
  const pinky_tip = landmarks[20];
  const pinky_pip = landmarks[18];

  const fingersExtended =
    index_tip.y < index_pip.y &&
    middle_tip.y < middle_pip.y &&
    ring_tip.y < ring_pip.y &&
    pinky_tip.y < pinky_pip.y;

  const thumbOut = Math.abs(thumb_tip.x - thumb_mcp.x) > 0.04;

  return fingersExtended && thumbOut;
}
