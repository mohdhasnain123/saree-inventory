import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, Sparkles, Target } from "lucide-react";

export default function AIRecommendations() {
  return (
    <Layout>
    <div className="p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Brain className="w-8 h-8 text-primary" />
          AI Smart Picks
        </h1>
        <p className="text-muted-foreground">Personalized outfit recommendations powered by AI</p>
      </div>

      {/* AI Status Card */}
      <Card className="bg-gradient-ai text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">AI Learning Status</h3>
              <p className="text-white/80">Your AI assistant is actively learning your preferences</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">87%</div>
              <div className="text-sm text-white/80">Learning Progress</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <Card className="bg-gradient-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Weather-Based
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Based on today's weather forecast</p>
            <div className="space-y-2">
              <Badge variant="outline" className="mr-2">Light Layers</Badge>
              <Badge variant="outline" className="mr-2">Breathable Fabrics</Badge>
              <Badge variant="outline">Professional</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Style Trending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Popular combinations this season</p>
            <div className="space-y-2">
              <Badge variant="outline" className="mr-2">Earth Tones</Badge>
              <Badge variant="outline" className="mr-2">Structured Blazers</Badge>
              <Badge variant="outline">Statement Accessories</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Personal Fit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Tailored to your preferences</p>
            <div className="space-y-2">
              <Badge variant="outline" className="mr-2">Navy Blues</Badge>
              <Badge variant="outline" className="mr-2">Classic Cuts</Badge>
              <Badge variant="outline">Minimal Jewelry</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle>Today's AI Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <h4 className="font-semibold text-primary mb-2">🎯 Perfect Match Found</h4>
            <p className="text-sm text-muted-foreground">Your navy blazer pairs exceptionally well with today's meeting schedule and weather conditions.</p>
          </div>
          <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <h4 className="font-semibold text-yellow-400 mb-2">💡 Style Suggestion</h4>
            <p className="text-sm text-muted-foreground">Consider adding a statement necklace to elevate your burgundy dress for tomorrow's presentation.</p>
          </div>
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <h4 className="font-semibold text-green-400 mb-2">✨ Wardrobe Optimization</h4>
            <p className="text-sm text-muted-foreground">You've maximized your wardrobe efficiency this week with smart outfit rotation.</p>
          </div>
        </CardContent>
      </Card>
    </div>
    </Layout>
  );
}