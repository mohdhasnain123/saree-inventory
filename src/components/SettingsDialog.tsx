import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, Bell, Shield, Database, Palette, Save, Upload, Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api, authStorage } from "@/lib/api";
import { AppSettings, defaultSettings } from "@/contexts/SettingsContext";
import { useAuth } from "@/contexts/AuthContext";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const API_BASE_URL =
  (import.meta.env?.VITE_API_URL as string | undefined) || "/api";

const CURRENCY_CHOICES = [
  { value: "INR", label: "INR — Indian Rupee (₹)" },
  { value: "USD", label: "USD — US Dollar ($)" },
  { value: "EUR", label: "EUR — Euro (€)" },
  { value: "GBP", label: "GBP — Pound (£)" },
  { value: "AED", label: "AED — UAE Dirham" },
  { value: "SGD", label: "SGD — Singapore Dollar" },
];

const TIMEZONE_CHOICES = [
  "Asia/Kolkata",
  "Asia/Dubai",
  "Asia/Singapore",
  "Europe/London",
  "America/New_York",
  "UTC",
];

const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAdmin } = useAuth();
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [restoring, setRestoring] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data } = useQuery<AppSettings>({
    queryKey: ["settings"],
    queryFn: () => api.get<AppSettings>("/settings"),
    enabled: open,
  });

  useEffect(() => {
    if (data) setSettings({ ...defaultSettings, ...data });
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: (body: AppSettings) => api.put<AppSettings>("/settings", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast({ title: "Settings Saved", description: "Your settings have been updated." });
      onOpenChange(false);
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const updateSetting = (path: string, value: unknown) => {
    setSettings((prev) => {
      const keys = path.split(".");
      const next: Record<string, unknown> = { ...prev } as unknown as Record<string, unknown>;
      let cur: Record<string, unknown> = next;
      for (let i = 0; i < keys.length - 1; i++) {
        cur[keys[i]] = { ...(cur[keys[i]] as Record<string, unknown>) };
        cur = cur[keys[i]] as Record<string, unknown>;
      }
      cur[keys[keys.length - 1]] = value;
      return next as unknown as AppSettings;
    });
  };

  const handleBackup = async () => {
    try {
      setDownloading(true);
      const token = authStorage.getToken();
      const res = await fetch(`${API_BASE_URL}/backup`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`Backup failed (${res.status})`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `saree-inventory-backup-${new Date()
        .toISOString()
        .replace(/[:.]/g, "-")}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast({ title: "Backup downloaded", description: "All collections exported as JSON." });
    } catch (err) {
      toast({
        title: "Backup failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleImportClick = () => {
    if (user?.role !== "admin") {
      toast({
        title: "Permission denied",
        description: "Only admin users can import data.",
        variant: "destructive",
      });
      return;
    }
    fileInputRef.current?.click();
  };

  const handleImportFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (
      !window.confirm(
        "Restoring will REPLACE all existing data with the contents of this backup file. Continue?"
      )
    )
      return;
    try {
      setRestoring(true);
      const text = await file.text();
      const dump = JSON.parse(text);
      const result = await api.post<{ ok: boolean; restored: Record<string, number> }>(
        "/backup/restore",
        dump
      );
      const summary = Object.entries(result.restored || {})
        .map(([k, n]) => `${k}: ${n}`)
        .join(", ");
      toast({ title: "Restore complete", description: summary || "Data restored." });
      queryClient.invalidateQueries();
    } catch (err) {
      toast({
        title: "Restore failed",
        description: err instanceof Error ? err.message : "Invalid file",
        variant: "destructive",
      });
    } finally {
      setRestoring(false);
    }
  };

  const notificationLabels: Record<keyof AppSettings["notifications"], { label: string; desc: string }> = {
    lowStock: { label: "Low Stock Alerts", desc: "Show a banner when materials/sarees fall below threshold." },
    newOrders: { label: "New Sales", desc: "Toast notification when a new sale is recorded." },
    production: { label: "Production Updates", desc: "Toast when a new production batch is created." },
    reports: { label: "Report Notifications", desc: "Notify on report generation events." },
  };

  const appearanceLabels: Record<keyof AppSettings["appearance"], { label: string; desc: string }> = {
    darkMode: { label: "Dark Mode", desc: "Use dark color scheme across the app." },
    compactMode: { label: "Compact Mode", desc: "Reduce padding/spacing to fit more on screen." },
    animations: { label: "Animations", desc: "Enable transitions and animation effects." },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-hidden p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" /> System Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="company" className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 h-auto">
            <TabsTrigger value="company" className="text-xs sm:text-sm"><Building className="w-4 h-4 sm:mr-2" /><span className="hidden sm:inline">Company</span></TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs sm:text-sm"><Bell className="w-4 h-4 sm:mr-2" /><span className="hidden sm:inline">Notifications</span></TabsTrigger>
            <TabsTrigger value="security" className="text-xs sm:text-sm"><Shield className="w-4 h-4 sm:mr-2" /><span className="hidden sm:inline">Security</span></TabsTrigger>
            <TabsTrigger value="data" className="text-xs sm:text-sm"><Database className="w-4 h-4 sm:mr-2" /><span className="hidden sm:inline">Data</span></TabsTrigger>
            <TabsTrigger value="appearance" className="text-xs sm:text-sm"><Palette className="w-4 h-4 sm:mr-2" /><span className="hidden sm:inline">Appearance</span></TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto max-h-96 mt-4">
            <TabsContent value="company" className="space-y-4">
              <Card>
                <CardHeader><CardTitle>Company Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Company Name</Label>
                      <Input value={settings.companyName} onChange={(e) => updateSetting("companyName", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Currency</Label>
                      <Select value={settings.currency} onValueChange={(v) => updateSetting("currency", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {CURRENCY_CHOICES.map((c) => (
                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Input value={settings.companyAddress} onChange={(e) => updateSetting("companyAddress", e.target.value)} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Contact Email</Label>
                      <Input type="email" value={settings.contactEmail} onChange={(e) => updateSetting("contactEmail", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Contact Phone</Label>
                      <Input value={settings.contactPhone} onChange={(e) => updateSetting("contactPhone", e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select value={settings.timezone} onValueChange={(v) => updateSetting("timezone", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TIMEZONE_CHOICES.map((tz) => (
                          <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Company info appears on tax invoices. Currency symbol is used throughout the app.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader><CardTitle>Notification Preferences</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {(Object.keys(settings.notifications) as Array<keyof AppSettings["notifications"]>).map((key) => (
                    <div key={key} className="flex items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <div className="text-sm font-medium">{notificationLabels[key].label}</div>
                        <div className="text-xs text-muted-foreground">{notificationLabels[key].desc}</div>
                      </div>
                      <Switch
                        checked={settings.notifications[key]}
                        onCheckedChange={(c) => updateSetting(`notifications.${key}`, c)}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader><CardTitle>Security Settings</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between gap-4 opacity-60">
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium">Two-Factor Authentication
                        <span className="ml-2 text-[10px] uppercase tracking-wide bg-muted px-1.5 py-0.5 rounded">Coming soon</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Add an extra layer of security to your account.</div>
                    </div>
                    <Switch checked={false} disabled />
                  </div>
                  <Separator />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Session Timeout (minutes)</Label>
                      <Input
                        type="number"
                        min={1}
                        max={1440}
                        value={settings.security.sessionTimeout}
                        onChange={(e) => updateSetting("security.sessionTimeout", Math.max(1, parseInt(e.target.value) || 1))}
                      />
                      <p className="text-xs text-muted-foreground">Auto-logout after this many minutes of inactivity.</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Password Expiry (days)</Label>
                      <Input
                        type="number"
                        min={0}
                        max={3650}
                        value={settings.security.passwordExpiry}
                        onChange={(e) => updateSetting("security.passwordExpiry", Math.max(0, parseInt(e.target.value) || 0))}
                      />
                      <p className="text-xs text-muted-foreground">Users see a warning after their password is older than this. Set 0 to disable.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="data" className="space-y-4">
              <Card>
                <CardHeader><CardTitle>Data Management</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      className="h-20 flex flex-col items-center gap-2"
                      onClick={handleBackup}
                      disabled={downloading}
                    >
                      {downloading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Download className="w-6 h-6" />}
                      <div className="text-center">
                        <div className="font-medium">Backup Data</div>
                        <div className="text-xs text-muted-foreground">Export all collections as JSON</div>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex flex-col items-center gap-2"
                      onClick={handleImportClick}
                      disabled={restoring}
                    >
                      {restoring ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
                      <div className="text-center">
                        <div className="font-medium">Import Data</div>
                        <div className="text-xs text-muted-foreground">Restore from backup file</div>
                      </div>
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/json,.json"
                      className="hidden"
                      onChange={handleImportFile}
                    />
                  </div>
                  <Separator />
                  <div className="text-sm text-muted-foreground">
                    <strong>Note:</strong> Restoring REPLACES all existing data. Take a backup first. Import is restricted to admin users.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-4">
              <Card>
                <CardHeader><CardTitle>Appearance Settings</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {(Object.keys(settings.appearance) as Array<keyof AppSettings["appearance"]>).map((key) => (
                    <div key={key} className="flex items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <div className="text-sm font-medium">{appearanceLabels[key].label}</div>
                        <div className="text-xs text-muted-foreground">{appearanceLabels[key].desc}</div>
                      </div>
                      <Switch
                        checked={settings.appearance[key]}
                        onCheckedChange={(c) => updateSetting(`appearance.${key}`, c)}
                      />
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground">
                    Appearance changes apply immediately when you save.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>

        {!isAdmin && (
          <div className="text-xs text-muted-foreground bg-muted/40 border rounded-md p-3 mt-2">
            Settings can only be modified by an <strong>admin</strong> user. You are viewing them in read-only mode.
          </div>
        )}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          {isAdmin && (
            <Button
              onClick={() => saveMutation.mutate(settings)}
              className="bg-gradient-primary"
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Settings
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
