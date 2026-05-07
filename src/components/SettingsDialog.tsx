import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Building, Bell, Shield, Database, Palette, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Settings {
  companyName: string;
  companyAddress: string;
  contactEmail: string;
  contactPhone: string;
  currency: string;
  timezone: string;
  notifications: { lowStock: boolean; newOrders: boolean; production: boolean; reports: boolean };
  security: { twoFactor: boolean; sessionTimeout: number; passwordExpiry: number };
  appearance: { darkMode: boolean; compactMode: boolean; animations: boolean };
}

const defaultSettings: Settings = {
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

const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  const { data } = useQuery<Settings>({
    queryKey: ["settings"],
    queryFn: () => api.get<Settings>("/settings"),
    enabled: open,
  });

  useEffect(() => {
    if (data) setSettings({ ...defaultSettings, ...data });
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: (body: Settings) => api.put<Settings>("/settings", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast({ title: "Settings Saved", description: "Your settings have been updated successfully." });
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
      return next as unknown as Settings;
    });
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
                    <div className="space-y-2"><Label>Company Name</Label><Input value={settings.companyName} onChange={(e) => updateSetting("companyName", e.target.value)} /></div>
                    <div className="space-y-2"><Label>Currency</Label><Input value={settings.currency} onChange={(e) => updateSetting("currency", e.target.value)} /></div>
                  </div>
                  <div className="space-y-2"><Label>Address</Label><Input value={settings.companyAddress} onChange={(e) => updateSetting("companyAddress", e.target.value)} /></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Contact Email</Label><Input type="email" value={settings.contactEmail} onChange={(e) => updateSetting("contactEmail", e.target.value)} /></div>
                    <div className="space-y-2"><Label>Contact Phone</Label><Input value={settings.contactPhone} onChange={(e) => updateSetting("contactPhone", e.target.value)} /></div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader><CardTitle>Notification Preferences</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(settings.notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-sm font-medium">{key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}</div>
                        <div className="text-xs text-muted-foreground">Receive notifications for {key.toLowerCase()} events</div>
                      </div>
                      <Switch checked={value} onCheckedChange={(c) => updateSetting(`notifications.${key}`, c)} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader><CardTitle>Security Settings</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium">Two-Factor Authentication</div>
                      <div className="text-xs text-muted-foreground">Add an extra layer of security to your account</div>
                    </div>
                    <Switch checked={settings.security.twoFactor} onCheckedChange={(c) => updateSetting("security.twoFactor", c)} />
                  </div>
                  <Separator />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Session Timeout (minutes)</Label><Input type="number" value={settings.security.sessionTimeout} onChange={(e) => updateSetting("security.sessionTimeout", parseInt(e.target.value))} /></div>
                    <div className="space-y-2"><Label>Password Expiry (days)</Label><Input type="number" value={settings.security.passwordExpiry} onChange={(e) => updateSetting("security.passwordExpiry", parseInt(e.target.value))} /></div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="data" className="space-y-4">
              <Card>
                <CardHeader><CardTitle>Data Management</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button variant="outline" className="h-20 flex flex-col items-center gap-2"><Database className="w-6 h-6" /><div className="text-center"><div className="font-medium">Backup Data</div><div className="text-xs text-muted-foreground">Export all data</div></div></Button>
                    <Button variant="outline" className="h-20 flex flex-col items-center gap-2"><Database className="w-6 h-6" /><div className="text-center"><div className="font-medium">Import Data</div><div className="text-xs text-muted-foreground">Import from file</div></div></Button>
                  </div>
                  <Separator />
                  <div className="text-sm text-muted-foreground"><strong>Note:</strong> Data operations may take some time to complete. Make sure to backup your data regularly.</div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-4">
              <Card>
                <CardHeader><CardTitle>Appearance Settings</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(settings.appearance).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-sm font-medium">{key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}</div>
                        <div className="text-xs text-muted-foreground">
                          {key === "darkMode" && "Switch between light and dark theme"}
                          {key === "compactMode" && "Use a more compact interface layout"}
                          {key === "animations" && "Enable interface animations and transitions"}
                        </div>
                      </div>
                      <Switch checked={value} onCheckedChange={(c) => updateSetting(`appearance.${key}`, c)} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => saveMutation.mutate(settings)} className="bg-gradient-primary"><Save className="w-4 h-4 mr-2" />Save Settings</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
