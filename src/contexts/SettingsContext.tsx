import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export interface AppSettings {
  companyName: string;
  companyAddress: string;
  contactEmail: string;
  contactPhone: string;
  currency: string;
  timezone: string;
  notifications: {
    lowStock: boolean;
    newOrders: boolean;
    production: boolean;
    reports: boolean;
  };
  security: {
    twoFactor: boolean;
    sessionTimeout: number;
    passwordExpiry: number;
  };
  appearance: {
    darkMode: boolean;
    compactMode: boolean;
    animations: boolean;
  };
}

export const defaultSettings: AppSettings = {
  companyName: "SareeFlow Manufacturing",
  companyAddress: "123 Textile Street, Mumbai, Maharashtra",
  contactEmail: "admin@sareeflow.com",
  contactPhone: "+91 98765 43210",
  currency: "INR",
  timezone: "Asia/Kolkata",
  notifications: { lowStock: true, newOrders: true, production: false, reports: true },
  security: { twoFactor: false, sessionTimeout: 30, passwordExpiry: 90 },
  appearance: { darkMode: false, compactMode: false, animations: true },
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  AED: "AED ",
  SGD: "S$",
};

interface SettingsContextValue {
  settings: AppSettings;
  isLoading: boolean;
  currencySymbol: string;
  formatMoney: (n: number, opts?: { decimals?: boolean }) => string;
  notifyEnabled: (channel: keyof AppSettings["notifications"]) => boolean;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();

  const { data, isLoading } = useQuery<AppSettings>({
    queryKey: ["settings"],
    queryFn: () => api.get<AppSettings>("/settings"),
    enabled: isAuthenticated,
    staleTime: 60_000,
  });

  const settings: AppSettings = useMemo(
    () => ({ ...defaultSettings, ...(data || {}) }),
    [data]
  );

  useEffect(() => {
    const root = document.documentElement;
    if (settings.appearance.darkMode) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [settings.appearance.darkMode]);

  useEffect(() => {
    const body = document.body;
    if (settings.appearance.compactMode) body.classList.add("compact-mode");
    else body.classList.remove("compact-mode");
  }, [settings.appearance.compactMode]);

  useEffect(() => {
    const body = document.body;
    if (!settings.appearance.animations) body.classList.add("no-animations");
    else body.classList.remove("no-animations");
  }, [settings.appearance.animations]);

  const currencySymbol =
    CURRENCY_SYMBOLS[settings.currency.toUpperCase()] || settings.currency + " ";

  const formatMoney = useCallback(
    (n: number, opts?: { decimals?: boolean }) => {
      const value = Number.isFinite(n) ? n : 0;
      const formatted = value.toLocaleString("en-IN", {
        minimumFractionDigits: opts?.decimals ? 2 : 0,
        maximumFractionDigits: opts?.decimals ? 2 : 0,
      });
      return `${currencySymbol}${formatted}`;
    },
    [currencySymbol]
  );

  const notifyEnabled = useCallback(
    (channel: keyof AppSettings["notifications"]) =>
      !!settings.notifications[channel],
    [settings.notifications]
  );

  const value: SettingsContextValue = {
    settings,
    isLoading,
    currencySymbol,
    formatMoney,
    notifyEnabled,
  };

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
};
