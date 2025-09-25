import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon, User, Bell, Palette, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export default function Settings() {
  return (
    <Layout>
    <div className="p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-primary" />
          Settings
        </h1>
        <p className="text-muted-foreground">Customize your AI wardrobe assistant experience</p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <Card className="bg-gradient-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Profile Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Display Name</label>
              <p className="text-muted-foreground">Alex Johnson</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Style Preference</label>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">Professional</Badge>
                <Badge variant="outline">Minimalist</Badge>
                <Badge variant="outline">Classic</Badge>
              </div>
            </div>
            <Button variant="outline" size="sm">Edit Profile</Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="bg-gradient-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">AI Recommendations</p>
                <p className="text-sm text-muted-foreground">Daily outfit suggestions</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Weather Alerts</p>
                <p className="text-sm text-muted-foreground">Weather-based outfit changes</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Style Trends</p>
                <p className="text-sm text-muted-foreground">New fashion trends</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="bg-gradient-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Dark Mode</p>
                <p className="text-sm text-muted-foreground">Use dark theme</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Compact View</p>
                <p className="text-sm text-muted-foreground">Show more items per row</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Animations</p>
                <p className="text-sm text-muted-foreground">Enable smooth transitions</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card className="bg-gradient-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Privacy & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">AI Learning</p>
                <p className="text-sm text-muted-foreground">Allow AI to learn from your choices</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Usage Analytics</p>
                <p className="text-sm text-muted-foreground">Help improve the app</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="space-y-2">
              <Button variant="outline" size="sm">Export Data</Button>
              <Button variant="outline" size="sm" className="ml-2">Clear Cache</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Assistant Settings */}
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle>AI Assistant Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <h4 className="font-semibold text-primary mb-2">Recommendation Frequency</h4>
              <div className="space-y-2">
                <Badge variant="outline" className="mr-2">Daily</Badge>
                <Badge variant="secondary">Weekly</Badge>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
              <h4 className="font-semibold text-accent mb-2">Style Confidence</h4>
              <div className="space-y-2">
                <Badge variant="outline" className="mr-2">Conservative</Badge>
                <Badge variant="secondary">Adventurous</Badge>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-muted/20 border border-muted">
              <h4 className="font-semibold text-foreground mb-2">Weather Integration</h4>
              <div className="space-y-2">
                <Badge variant="secondary" className="mr-2">Enabled</Badge>
                <Badge variant="outline">Disabled</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </Layout>
  );
}