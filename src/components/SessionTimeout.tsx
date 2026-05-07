import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { toast } from "@/components/ui/use-toast";

const ACTIVITY_EVENTS = ["mousedown", "keydown", "touchstart", "scroll"];

const SessionTimeout = () => {
  const { isAuthenticated, logout } = useAuth();
  const { settings } = useSettings();
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    const minutes = Math.max(1, Number(settings.security.sessionTimeout) || 30);
    const ms = minutes * 60 * 1000;

    const trigger = async () => {
      await logout();
      toast({
        title: "Session expired",
        description: `You were logged out after ${minutes} minutes of inactivity.`,
      });
    };

    const reset = () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(trigger, ms);
    };

    reset();
    ACTIVITY_EVENTS.forEach((ev) =>
      window.addEventListener(ev, reset, { passive: true })
    );

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach((ev) => window.removeEventListener(ev, reset));
    };
  }, [isAuthenticated, settings.security.sessionTimeout, logout]);

  return null;
};

export default SessionTimeout;
