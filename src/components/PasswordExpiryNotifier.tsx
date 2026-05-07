import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { toast } from "@/components/ui/use-toast";

const PasswordExpiryNotifier = () => {
  const { user } = useAuth();
  const { settings } = useSettings();
  const warned = useRef<string | null>(null);

  useEffect(() => {
    if (!user || warned.current === user._id) return;
    const days = Number(settings.security.passwordExpiry) || 0;
    if (days <= 0) return;
    if (!user.passwordChangedAt) return;
    const changed = new Date(user.passwordChangedAt).getTime();
    if (Number.isNaN(changed)) return;
    const ageDays = Math.floor((Date.now() - changed) / (1000 * 60 * 60 * 24));
    if (ageDays >= days) {
      toast({
        title: "Password expired",
        description: `Your password is ${ageDays} days old (limit ${days}). Please change it soon.`,
        variant: "destructive",
      });
      warned.current = user._id;
    } else if (days - ageDays <= 7) {
      toast({
        title: "Password expires soon",
        description: `Your password will expire in ${days - ageDays} day(s).`,
      });
      warned.current = user._id;
    }
  }, [user, settings.security.passwordExpiry]);

  return null;
};

export default PasswordExpiryNotifier;
