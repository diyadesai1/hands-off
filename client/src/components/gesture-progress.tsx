import { motion } from "framer-motion";
import type { GestureState } from "@/lib/gesture-detector";

interface GestureProgressProps {
  state: GestureState;
  progress: number;
}

export function GestureProgress({ state, progress }: GestureProgressProps) {
  if (state === "idle") return null;

  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
    >
      <div className="relative flex items-center justify-center">
        <svg width="128" height="128" className="transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="54"
            fill="none"
            stroke="hsl(var(--muted) / 0.3)"
            strokeWidth="6"
          />
          <motion.circle
            cx="64"
            cy="64"
            r="54"
            fill="none"
            stroke={state === "confirmed" ? "hsl(142 72% 48%)" : "hsl(var(--primary))"}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transition={{ duration: 0.1 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {state === "detecting" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <p className="text-sm font-semibold text-primary-foreground dark:text-foreground drop-shadow-md">
                Hold steady
              </p>
              <p className="text-2xl font-bold text-primary-foreground dark:text-foreground drop-shadow-md">
                {Math.round(progress * 100)}%
              </p>
            </motion.div>
          )}
          {state === "confirmed" && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <svg className="w-10 h-10 mx-auto" viewBox="0 0 24 24" fill="none">
                <motion.path
                  d="M5 13l4 4L19 7"
                  stroke="hsl(142 72% 48%)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.4 }}
                />
              </svg>
              <p className="text-xs font-semibold mt-1 drop-shadow-md" style={{ color: "hsl(142 72% 48%)" }}>
                Activated
              </p>
            </motion.div>
          )}
          {state === "cooldown" && (
            <p className="text-xs text-muted-foreground drop-shadow-md">
              Cooldown...
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
