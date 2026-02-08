import { motion, AnimatePresence } from "framer-motion";
import { Phone, PhoneOff, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FakeCallOverlayProps {
  isVisible: boolean;
  isRinging: boolean;
  isOnCall: boolean;
  callerName: string;
  onAnswer: () => void;
  onDecline: () => void;
}

export function FakeCallOverlay({
  isVisible,
  isRinging,
  isOnCall,
  callerName,
  onAnswer,
  onDecline,
}: FakeCallOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, hsl(240 5% 6%), hsl(240 8% 12%))" }}
        >
          <div className="flex flex-col items-center gap-8 p-8">
            <motion.div
              animate={isRinging ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-24 h-24 rounded-full bg-muted/30 flex items-center justify-center"
            >
              <div className="w-20 h-20 rounded-full bg-muted/40 flex items-center justify-center">
                <User className="w-10 h-10 text-muted-foreground" />
              </div>
            </motion.div>

            <div className="text-center">
              <h2 className="text-2xl font-semibold text-foreground">{callerName}</h2>
              <p className="text-muted-foreground mt-1">
                {isRinging ? "Incoming call..." : isOnCall ? "Connected" : "Calling..."}
              </p>
            </div>

            {isOnCall && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm text-muted-foreground">On speaker</span>
              </motion.div>
            )}

            <div className="flex items-center gap-8 mt-8">
              {isRinging && (
                <>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <Button
                      variant="destructive"
                      className="rounded-full px-6"
                      onClick={onDecline}
                      data-testid="button-decline-call"
                    >
                      <PhoneOff className="w-5 h-5 mr-2" />
                      Decline
                    </Button>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <Button
                      className="rounded-full px-6"
                      style={{ background: "hsl(142 72% 42%)", borderColor: "hsl(142 72% 42%)" }}
                      onClick={onAnswer}
                      data-testid="button-answer-call"
                    >
                      <Phone className="w-5 h-5 mr-2 text-white" />
                      <span className="text-white">Answer</span>
                    </Button>
                  </motion.div>
                </>
              )}
              {isOnCall && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Button
                    variant="destructive"
                    className="rounded-full px-6"
                    onClick={onDecline}
                    data-testid="button-end-call"
                  >
                    <PhoneOff className="w-5 h-5 mr-2" />
                    End Call
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
