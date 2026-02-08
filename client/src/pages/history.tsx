import { motion } from "framer-motion";
import { ArrowLeft, Shield, MapPin, Phone, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { AlertHistory } from "@shared/schema";

export default function History() {
  const [, navigate] = useLocation();

  const { data: alerts, isLoading } = useQuery<AlertHistory[]>({
    queryKey: ["/api/alerts"],
  });

  const formatDate = (date: string | Date | null) => {
    if (!date) return "Unknown";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 flex items-center gap-3 h-14">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => navigate("/")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">Call Logs</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="animate-pulse flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/3" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : alerts && alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map((alert, i) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          alert.type === "location" ? "bg-blue-500/10" : "bg-green-500/10"
                        }`}>
                          {alert.type === "location" ? (
                            <MapPin className="w-5 h-5 text-blue-500" />
                          ) : (
                            <Phone className="w-5 h-5 text-green-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground capitalize">
                            {alert.type === "location" ? "Location Shared" : "Fake Call Triggered"}
                          </p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(alert.timestamp)}
                            </span>
                          </div>
                          {alert.latitude && alert.longitude && (
                            <a
                              href={`https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary mt-2"
                              data-testid={`link-map-${alert.id}`}
                            >
                              <ExternalLink className="w-3 h-3" />
                              View on map
                            </a>
                          )}
                        </div>
                      </div>
                      <Badge variant="secondary" className="shrink-0 capitalize text-[10px]">
                        {alert.type}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
              <Clock className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">No call logs yet</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              Your call logs will appear here when fake calls or location shares are triggered.
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
