import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Scissors, IndianRupee, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FinishingCosts {
  cuttingCost: number;
  waxingCost: number;
}

const STORAGE_KEY = "sareeflow_finishing_costs";

export const getFinishingCosts = (): FinishingCosts => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { cuttingCost: 50, waxingCost: 30 };
};

const Finishing = () => {
  const { toast } = useToast();
  const [costs, setCosts] = useState<FinishingCosts>(getFinishingCosts());

  useEffect(() => {
    setCosts(getFinishingCosts());
  }, []);

  const totalFinishing = (Number(costs.cuttingCost) || 0) + (Number(costs.waxingCost) || 0);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      cuttingCost: Number(costs.cuttingCost) || 0,
      waxingCost: Number(costs.waxingCost) || 0,
    }));
    toast({
      title: "Finishing Costs Saved",
      description: "Per-saree finishing cost will be added to cost price of new sarees.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Scissors className="w-6 h-6 text-primary" />
          Finishing
        </h2>
        <p className="text-muted-foreground mt-1">
          Post-manufacturing costs (cutting & waxing/rolling) added per saree to the cost price.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cutting Cost / Saree</p>
                <p className="text-2xl font-bold text-foreground">₹{costs.cuttingCost || 0}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <Scissors className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Waxing/Rolling / Saree</p>
                <p className="text-2xl font-bold text-foreground">₹{costs.waxingCost || 0}</p>
              </div>
              <div className="p-3 bg-accent/10 rounded-lg">
                <IndianRupee className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Finishing / Saree</p>
                <p className="text-2xl font-bold text-success">₹{totalFinishing}</p>
              </div>
              <div className="p-3 bg-success/10 rounded-lg">
                <IndianRupee className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-card shadow-card border-0">
        <CardHeader>
          <CardTitle>Configure Finishing Costs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cutting">Cutting Cost per Saree (₹)</Label>
              <Input
                id="cutting"
                type="number"
                value={costs.cuttingCost}
                onChange={(e) => setCosts({ ...costs, cuttingCost: parseFloat(e.target.value) || 0 })}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground mt-1">Cost of cutting each saree from the warp.</p>
            </div>
            <div>
              <Label htmlFor="waxing">Waxing / Rolling Cost per Saree (₹)</Label>
              <Input
                id="waxing"
                type="number"
                value={costs.waxingCost}
                onChange={(e) => setCosts({ ...costs, waxingCost: parseFloat(e.target.value) || 0 })}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground mt-1">Cost of waxing/rolling each finished saree.</p>
            </div>
          </div>
          <Button onClick={handleSave} className="bg-gradient-primary shadow-manufacturing">
            <Save className="w-4 h-4 mr-2" />
            Save Finishing Costs
          </Button>
          <div className="text-sm text-muted-foreground bg-muted/40 p-3 rounded-md">
            These costs are automatically added to the <span className="font-medium text-foreground">Cost Price</span> of each new saree added in the Sarees tab.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Finishing;