import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, CameraOff, Shield, Settings, ArrowLeft, MapPin, Phone, Hand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GestureProgress } from "@/components/gesture-progress";
import { FakeCallOverlay } from "@/components/fake-call-overlay";
import { StatusIndicator } from "@/components/status-indicator";
import { GestureStateMachine, isSignalForHelp, type GestureState } from "@/lib/gesture-detector";
import { FakeCallManager } from "@/lib/fake-call";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { TrustedContact, AppSettings } from "@shared/schema";

export default function Detect() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const handsRef = useRef<any>(null);
  const animFrameRef = useRef<number>(0);
  const stateMachineRef = useRef<GestureStateMachine | null>(null);
  const fakeCallRef = useRef<FakeCallManager>(new FakeCallManager());

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [gestureState, setGestureState] = useState<GestureState>("idle");
  const [gestureProgress, setGestureProgress] = useState(0);
  const [showFakeCall, setShowFakeCall] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  const [isOnCall, setIsOnCall] = useState(false);
  const [handDetected, setHandDetected] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [locationSent, setLocationSent] = useState(false);

  const [, navigate] = useLocation();

  const { data: contacts } = useQuery<TrustedContact[]>({
    queryKey: ["/api/contacts"],
  });

  const { data: settings } = useQuery<AppSettings>({
    queryKey: ["/api/settings"],
  });

  const callerName = settings?.callerName || "Gabriella";
  const holdDuration = settings?.gestureHoldDuration || 3;

  const handleGestureConfirmed = useCallback(async () => {
    const delay = (settings?.fakeCallDelay ?? 1) * 1000;

    await apiRequest("POST", "/api/alerts", { type: "call" }).catch(() => {});

    setTimeout(() => {
      setShowFakeCall(true);
      setIsRinging(true);

      fakeCallRef.current.startRinging(() => {
        setIsRinging(false);
      });
    }, delay);

    if (settings?.autoSendLocation && contacts && contacts.length > 0) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });

        const emergencyContact = contacts.find(c => c.isEmergency) || contacts[0];

        await apiRequest("POST", "/api/alerts", {
          type: "location",
          contactId: emergencyContact.id,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString(),
        });

        setLocationSent(true);
      } catch (err) {
        console.log("Location sharing failed:", err);
      }
    }
  }, [contacts, settings]);

  useEffect(() => {
    stateMachineRef.current = new GestureStateMachine(
      { holdDuration, cooldownDuration: 10 },
      (state, progress) => {
        setGestureState(state);
        setGestureProgress(progress);
      },
      handleGestureConfirmed
    );

    return () => {
      stateMachineRef.current?.reset();
    };
  }, [holdDuration, handleGestureConfirmed]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsCameraActive(true);
    } catch (err: any) {
      setCameraError(
        err.name === "NotAllowedError"
          ? "Camera access was denied. Please allow camera access in your browser settings."
          : "Could not access camera. Please make sure a camera is connected."
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setIsMonitoring(false);
    setHandDetected(false);
    stateMachineRef.current?.reset();
  };

  const startMonitoring = async () => {
    if (!isCameraActive || !videoRef.current) return;

    setIsMonitoring(true);

    const { Hands } = await import("@mediapipe/hands");

    const hands = new Hands({
      locateFile: (file: string) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.5,
    });

    hands.onResults((results: any) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx || !videoRef.current) return;

      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        setHandDetected(true);
        const landmarks = results.multiHandLandmarks[0];

        ctx.strokeStyle = "hsl(0 72% 48%)";
        ctx.lineWidth = 2;
        ctx.fillStyle = "hsl(0 72% 48% / 0.6)";

        for (const point of landmarks) {
          const x = point.x * canvas.width;
          const y = point.y * canvas.height;
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, 2 * Math.PI);
          ctx.fill();
        }

        const connections = [
          [0, 1], [1, 2], [2, 3], [3, 4],
          [0, 5], [5, 6], [6, 7], [7, 8],
          [5, 9], [9, 10], [10, 11], [11, 12],
          [9, 13], [13, 14], [14, 15], [15, 16],
          [13, 17], [17, 18], [18, 19], [19, 20],
          [0, 17],
        ];

        for (const [a, b] of connections) {
          const ax = landmarks[a].x * canvas.width;
          const ay = landmarks[a].y * canvas.height;
          const bx = landmarks[b].x * canvas.width;
          const by = landmarks[b].y * canvas.height;
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.stroke();
        }

        const gestureDetected = isSignalForHelp(landmarks);
        stateMachineRef.current?.update(gestureDetected);
      } else {
        setHandDetected(false);
        stateMachineRef.current?.update(false);
      }
    });

    handsRef.current = hands;

    const processFrame = async () => {
      if (!videoRef.current || !handsRef.current || videoRef.current.readyState < 2) {
        animFrameRef.current = requestAnimationFrame(processFrame);
        return;
      }

      await handsRef.current.send({ image: videoRef.current });
      animFrameRef.current = requestAnimationFrame(processFrame);
    };

    processFrame();
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    setHandDetected(false);
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    if (handsRef.current) {
      handsRef.current.close();
      handsRef.current = null;
    }
    stateMachineRef.current?.reset();
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && canvasRef.current) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const handleAnswerCall = () => {
    setIsRinging(false);
    setIsOnCall(true);
    fakeCallRef.current.stopAll();
    fakeCallRef.current.startFakeCall(callerName);
  };

  const handleDeclineCall = () => {
    fakeCallRef.current.stopAll();
    setShowFakeCall(false);
    setIsRinging(false);
    setIsOnCall(false);
    setLocationSent(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
      stopMonitoring();
      fakeCallRef.current.stopAll();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between gap-4 h-14">
          <div className="flex items-center gap-3">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => navigate("/")}
              data-testid="button-back-home"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">Detector</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StatusIndicator
              gestureState={gestureState}
              isCameraActive={isCameraActive}
              isMonitoring={isMonitoring}
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={() => navigate("/settings")}
              data-testid="button-settings"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="overflow-visible">
              <CardContent className="p-0">
                <div className="relative aspect-video bg-muted/30 rounded-md overflow-hidden">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                    style={{ transform: "scaleX(-1)" }}
                    data-testid="video-camera-feed"
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    style={{ transform: "scaleX(-1)" }}
                  />

                  {!isCameraActive && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center">
                        <Camera className="w-10 h-10 text-muted-foreground" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-foreground">Camera not active</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Enable your camera to start gesture detection
                        </p>
                      </div>
                      {cameraError && (
                        <p className="text-xs text-destructive max-w-xs text-center" data-testid="text-camera-error">
                          {cameraError}
                        </p>
                      )}
                    </div>
                  )}

                  <GestureProgress state={gestureState} progress={gestureProgress} />

                  {isMonitoring && handDetected && gestureState === "idle" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute bottom-4 left-4 z-10"
                    >
                      <Badge variant="secondary" className="gap-1.5">
                        <Hand className="w-3 h-3" />
                        Hand tracked
                      </Badge>
                    </motion.div>
                  )}

                  {locationSent && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute bottom-4 right-4 z-10"
                    >
                      <Badge variant="default" className="gap-1.5">
                        <MapPin className="w-3 h-3" />
                        Location sent
                      </Badge>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-wrap items-center gap-3 mt-4">
              {!isCameraActive ? (
                <Button onClick={startCamera} className="gap-2" data-testid="button-start-camera">
                  <Camera className="w-4 h-4" />
                  Enable Camera
                </Button>
              ) : (
                <Button variant="outline" onClick={stopCamera} className="gap-2" data-testid="button-stop-camera">
                  <CameraOff className="w-4 h-4" />
                  Stop Camera
                </Button>
              )}

              {isCameraActive && !isMonitoring && (
                <Button onClick={startMonitoring} className="gap-2" data-testid="button-start-monitoring">
                  <Shield className="w-4 h-4" />
                  Start Monitoring
                </Button>
              )}

              {isMonitoring && (
                <Button variant="outline" onClick={stopMonitoring} className="gap-2" data-testid="button-stop-monitoring">
                  <Shield className="w-4 h-4" />
                  Stop Monitoring
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => {
                  handleGestureConfirmed();
                }}
                className="gap-2 ml-auto"
                data-testid="button-test-alert"
              >
                <Phone className="w-4 h-4" />
                Test Alert
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold text-foreground mb-3">Signal for Help</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">1</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Show your open palm to the camera</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">2</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Tuck your thumb into your palm</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">3</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Close fingers over thumb into fist</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">4</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Hold for {holdDuration} seconds</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold text-foreground mb-3">Trusted Contacts</h3>
                {contacts && contacts.length > 0 ? (
                  <div className="space-y-2">
                    {contacts.slice(0, 3).map((contact) => (
                      <div key={contact.id} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-xs font-medium text-primary">
                              {contact.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{contact.name}</p>
                            <p className="text-xs text-muted-foreground">{contact.relationship}</p>
                          </div>
                        </div>
                        {contact.isEmergency && (
                          <Badge variant="secondary" className="text-[10px] shrink-0">Primary</Badge>
                        )}
                      </div>
                    ))}
                    {contacts.length > 3 && (
                      <p className="text-xs text-muted-foreground">+{contacts.length - 3} more</p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-3">
                    <p className="text-sm text-muted-foreground">No contacts added yet</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => navigate("/contacts")}
                      data-testid="button-add-contacts"
                    >
                      Add Contact
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold text-foreground mb-2">Privacy</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  All gesture detection runs locally in your browser using MediaPipe.
                  No video data is ever sent to any server. Your camera feed stays on your device.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <FakeCallOverlay
        isVisible={showFakeCall}
        isRinging={isRinging}
        isOnCall={isOnCall}
        callerName={callerName}
        onAnswer={handleAnswerCall}
        onDecline={handleDeclineCall}
      />
    </div>
  );
}
