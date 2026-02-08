import { motion } from "framer-motion";
import { Shield, ShieldAlert, ShieldCheck, Camera, CameraOff } from "lucide-react";
import type { GestureState } from "@/lib/gesture-detector";

interface StatusIndicatorProps {
  gestureState: GestureState;
  isCameraActive: boolean;
  isMonitoring: boolean;
}

export function StatusIndicator({ gestureState, isCameraActive, isMonitoring }: StatusIndicatorProps) {
  const getStatusConfig = () => {
    if (!isCameraActive) {
      return {
        icon: CameraOff,
        label: "Camera off",
        color: "text-muted-foreground",
        bg: "bg-muted/50",
        pulse: false,
      };
    }
    if (!isMonitoring) {
      return {
        icon: Camera,
        label: "Camera ready",
        color: "text-muted-foreground",
        bg: "bg-muted/50",
        pulse: false,
      };
    }

    switch (gestureState) {
      case "idle":
        return {
          icon: Shield,
          label: "Monitoring",
          color: "text-foreground",
          bg: "bg-card",
          pulse: true,
        };
      case "detecting":
        return {
          icon: ShieldAlert,
          label: "Gesture detected",
          color: "text-amber-500 dark:text-amber-400",
          bg: "bg-amber-500/10",
          pulse: true,
        };
      case "confirmed":
        return {
          icon: ShieldCheck,
          label: "Help activated",
          color: "text-green-500 dark:text-green-400",
          bg: "bg-green-500/10",
          pulse: false,
        };
      case "cooldown":
        return {
          icon: Shield,
          label: "Cooling down",
          color: "text-muted-foreground",
          bg: "bg-muted/50",
          pulse: false,
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <motion.div
      layout
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bg}`}
    >
      {config.pulse && (
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            gestureState === "detecting" ? "bg-amber-400" : "bg-primary"
          }`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${
            gestureState === "detecting" ? "bg-amber-500" : "bg-primary"
          }`} />
        </span>
      )}
      <Icon className={`w-4 h-4 ${config.color}`} />
      <span className={`text-xs font-medium ${config.color}`} data-testid="text-status-label">
        {config.label}
      </span>
    </motion.div>
  );
}
