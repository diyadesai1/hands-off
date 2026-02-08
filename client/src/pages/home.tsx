import { motion } from "framer-motion";
import { Shield, Hand, Phone, MapPin, ArrowRight, Eye, EyeOff, Clock, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";

const features = [
  {
    icon: Hand,
    title: "Gesture Detection",
    description: "Uses your camera to detect the international 'Signal for Help' hand gesture silently.",
  },
  {
    icon: Phone,
    title: "Fake Phone Call",
    description: "Triggers a realistic fake incoming call giving you a natural excuse to leave a dangerous situation.",
  },
  {
    icon: MapPin,
    title: "Location Sharing",
    description: "Sends your exact location to a trusted contact so someone always knows where you are.",
  },
  {
    icon: EyeOff,
    title: "Completely Silent",
    description: "No tapping, no unlocking, no obvious actions. Just a subtle hand gesture and help arrives.",
  },
];

const steps = [
  { number: "01", text: "Open the detector and allow camera access" },
  { number: "02", text: "Show the 'Signal for Help' gesture to your camera" },
  { number: "03", text: "Hold the gesture for 3 seconds to confirm" },
  { number: "04", text: "A fake phone call plays or your location is sent" },
];

export default function Home() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/3" />
        <div className="relative max-w-5xl mx-auto px-4 py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 mb-6">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-primary">Hands-Free Safety Tool</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              <span className="text-white dark:text-white">Hands</span><span className="text-primary">Off</span>
            </h1>

            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              A hands-free safety tool that detects distress gestures through your camera
              and silently summons help when you need it most.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
              <Button
                onClick={() => navigate("/detect")}
                className="gap-2"
                data-testid="button-start-detector"
              >
                <Eye className="w-4 h-4" />
                Start Detector
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/contacts")}
                data-testid="button-manage-contacts"
              >
                Manage Contacts
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/history")}
                className="gap-2"
                data-testid="button-call-logs"
              >
                <Clock className="w-4 h-4" />
                Call Logs
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/settings")}
                className="gap-2"
                data-testid="button-settings"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            How It Protects You
          </h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
            HandsOff uses computer vision to detect your hand gesture and respond instantly.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Card className="h-full hover-elevate">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <feature.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            Simple Steps
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-primary/20 mb-2">{step.number}</div>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.text}</p>
              {i < steps.length - 1 && (
                <ArrowRight className="w-4 h-4 text-muted-foreground/30 mx-auto mt-4 hidden lg:block" />
              )}
            </motion.div>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-16">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold text-foreground">The Signal for Help</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
              Tuck your thumb into your palm, then close your fingers over it to make a fist.
              This internationally recognized gesture was created specifically for silent distress signaling.
            </p>
            <div className="flex items-center justify-center gap-6 mt-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Hand className="w-8 h-8 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">Open palm</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground/50" />
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-2xl">
                  <span className="text-primary font-bold text-xl">
                    <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v0M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8" />
                      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
                    </svg>
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Thumb tucked</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground/50" />
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-2xl">
                  <span className="text-primary font-bold text-xl">
                    <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16" />
                      <rect x="6" y="6" width="12" height="12" rx="2" />
                    </svg>
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Close fist</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <footer className="max-w-5xl mx-auto px-4 py-8 border-t border-border">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">HandsOff</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Built for safety. All processing happens locally in your browser.
          </p>
        </div>
      </footer>
    </div>
  );
}
