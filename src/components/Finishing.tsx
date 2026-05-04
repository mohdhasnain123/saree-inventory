import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Scissors,
  IndianRupee,
  Save,
  Plus,
  CheckCircle2,
  Trash2,
  Calendar,
  User,
  Droplets,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FinishingCosts {
  cuttingCost: number;
  waxingCost: number;
}

type JobType = "cutting" | "waxing";
type JobStatus = "in-progress" | "returned";

interface FinishingJob {
  id: string;
  type: JobType;
  sareeType: string;
  quantity: number;
  agentName: string;
  ratePerSaree: number;
  takenDate: string;
  expectedReturnDate: string;
  returnedDate?: string;
  status: JobStatus;
}

const COSTS_KEY = "sareeflow_finishing_costs";
const JOBS_KEY = "sareeflow_finishing_jobs";

export const getFinishingCosts = (): FinishingCosts => {
  try {
    const raw = localStorage.getItem(COSTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { cuttingCost: 50, waxingCost: 30 };
};

const loadJobs = (): FinishingJob[] => {
  try {
    const raw = localStorage.getItem(JOBS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [
    {
      id: "FJ001",
      type: "cutting",
      sareeType: "Silk",
      quantity: 20,
      agentName: "Ramesh Kumar",
      ratePerSaree: 50,
      takenDate: "2026-05-01",
      expectedReturnDate: "2026-05-05",
      status: "in-progress",
    },
    {
      id: "FJ002",
      type: "waxing",
      sareeType: "Cotton",
      quantity: 15,
      agentName: "Suresh Patel",
      ratePerSaree: 30,
      takenDate: "2026-05-02",
      expectedReturnDate: "2026-05-04",
      status: "in-progress",
    },
  ];
};

const Finishing = () => {
  const { toast } = useToast();
  const [costs, setCosts] = useState<FinishingCosts>(getFinishingCosts());
  const [jobs, setJobs] = useState<FinishingJob[]>(loadJobs());
  const [dialogType, setDialogType] = useState<JobType | null>(null);
  const [form, setForm] = useState({
    sareeType: "",
    quantity: "",
    agentName: "",
    ratePerSaree: "",
    takenDate: "",
    expectedReturnDate: "",
  });

  useEffect(() => {
    localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
  }, [jobs]);

  const totalFinishing =
    (Number(costs.cuttingCost) || 0) + (Number(costs.waxingCost) || 0);

  const handleSaveCosts = () => {
    localStorage.setItem(
      COSTS_KEY,
      JSON.stringify({
        cuttingCost: Number(costs.cuttingCost) || 0,
        waxingCost: Number(costs.waxingCost) || 0,
      })
    );
    toast({
      title: "Finishing Costs Saved",
      description: "Per-saree finishing cost will be added to cost price of new sarees.",
    });
  };

  const openDialog = (type: JobType) => {
    setForm({
      sareeType: "",
      quantity: "",
      agentName: "",
      ratePerSaree: String(type === "cutting" ? costs.cuttingCost : costs.waxingCost),
      takenDate: new Date().toISOString().split("T")[0],
      expectedReturnDate: "",
    });
    setDialogType(type);
  };

  const handleAddJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dialogType) return;
    const newJob: FinishingJob = {
      id: `FJ${String(jobs.length + 1).padStart(3, "0")}`,
      type: dialogType,
      sareeType: form.sareeType,
      quantity: parseInt(form.quantity) || 0,
      agentName: form.agentName,
      ratePerSaree: parseFloat(form.ratePerSaree) || 0,
      takenDate: form.takenDate,
      expectedReturnDate: form.expectedReturnDate,
      status: "in-progress",
    };
    setJobs([newJob, ...jobs]);
    setDialogType(null);
    toast({
      title: `${dialogType === "cutting" ? "Cutting" : "Waxing/Rolling"} Job Added`,
      description: `${newJob.quantity} ${newJob.sareeType} sarees handed to ${newJob.agentName}.`,
    });
  };

  const markReturned = (id: string) => {
    setJobs(
      jobs.map((j) =>
        j.id === id
          ? {
              ...j,
              status: "returned",
              returnedDate: new Date().toISOString().split("T")[0],
            }
          : j
      )
    );
    toast({ title: "Marked Returned", description: "Saree batch returned from agent." });
  };

  const deleteJob = (id: string) => {
    setJobs(jobs.filter((j) => j.id !== id));
  };

  const renderJobs = (type: JobType) => {
    const list = jobs.filter((j) => j.type === type);
    if (list.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-8">
          No {type === "cutting" ? "cutting" : "waxing/rolling"} jobs yet.
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {list.map((job) => {
          const total = job.quantity * job.ratePerSaree;
          return (
            <Card key={job.id} className="bg-gradient-card shadow-card border-0">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {type === "cutting" ? (
                        <Scissors className="w-4 h-4 text-primary" />
                      ) : (
                        <Droplets className="w-4 h-4 text-accent" />
                      )}
                      {job.id} · {job.sareeType}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                      <User className="w-3 h-3" /> {job.agentName}
                    </p>
                  </div>
                  <Badge
                    className={
                      job.status === "in-progress"
                        ? "bg-warning/20 text-warning-foreground border-warning/30"
                        : "bg-success/20 text-success-foreground border-success/30"
                    }
                  >
                    {job.status === "in-progress" ? "In Progress" : "Returned"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-muted-foreground">Quantity</p>
                    <p className="font-medium">{job.quantity} sarees</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Rate / Saree</p>
                    <p className="font-medium">₹{job.ratePerSaree}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Taken
                    </p>
                    <p className="font-medium">
                      {new Date(job.takenDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />{" "}
                      {job.status === "returned" ? "Returned" : "Expected Return"}
                    </p>
                    <p className="font-medium">
                      {new Date(
                        job.returnedDate || job.expectedReturnDate
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Total Payable</p>
                  <p className="font-bold text-success">₹{total.toLocaleString()}</p>
                </div>
                <div className="flex gap-2 pt-2">
                  {job.status === "in-progress" && (
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => markReturned(job.id)}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Mark Returned
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteJob(job.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Scissors className="w-6 h-6 text-primary" />
          Finishing
        </h2>
        <p className="text-muted-foreground mt-1">
          Track sarees sent for cutting and waxing/rolling, agents handling them, and per-saree costs added to cost price.
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
                <Droplets className="w-6 h-6 text-accent" />
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

      <Tabs defaultValue="cutting" className="w-full">
        <TabsList>
          <TabsTrigger value="cutting">
            <Scissors className="w-4 h-4 mr-2" /> Cutting
          </TabsTrigger>
          <TabsTrigger value="waxing">
            <Droplets className="w-4 h-4 mr-2" /> Waxing / Rolling
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cutting" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => openDialog("cutting")} className="bg-gradient-primary shadow-manufacturing">
              <Plus className="w-4 h-4 mr-2" /> Send for Cutting
            </Button>
          </div>
          {renderJobs("cutting")}
        </TabsContent>

        <TabsContent value="waxing" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => openDialog("waxing")} className="bg-gradient-primary shadow-manufacturing">
              <Plus className="w-4 h-4 mr-2" /> Send for Waxing/Rolling
            </Button>
          </div>
          {renderJobs("waxing")}
        </TabsContent>
      </Tabs>

      <Card className="bg-gradient-card shadow-card border-0">
        <CardHeader>
          <CardTitle>Configure Default Finishing Costs</CardTitle>
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
            </div>
          </div>
          <Button onClick={handleSaveCosts} className="bg-gradient-primary shadow-manufacturing">
            <Save className="w-4 h-4 mr-2" />
            Save Finishing Costs
          </Button>
          <div className="text-sm text-muted-foreground bg-muted/40 p-3 rounded-md">
            These default costs are auto-added to the <span className="font-medium text-foreground">Cost Price</span> of new sarees added in the Sarees tab.
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogType !== null} onOpenChange={(o) => !o && setDialogType(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialogType === "cutting" ? "Send Sarees for Cutting" : "Send Sarees for Waxing/Rolling"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddJob} className="space-y-4">
            <div>
              <Label>Saree Type</Label>
              <Select
                value={form.sareeType}
                onValueChange={(v) => setForm({ ...form, sareeType: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cotton">Cotton</SelectItem>
                  <SelectItem value="Silk">Silk</SelectItem>
                  <SelectItem value="Georgette">Georgette</SelectItem>
                  <SelectItem value="Chiffon">Chiffon</SelectItem>
                  <SelectItem value="Net">Net</SelectItem>
                  <SelectItem value="Crepe">Crepe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  required
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label>Rate / Saree (₹)</Label>
                <Input
                  type="number"
                  required
                  value={form.ratePerSaree}
                  onChange={(e) => setForm({ ...form, ratePerSaree: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <Label>Agent / Person Name</Label>
              <Input
                required
                value={form.agentName}
                onChange={(e) => setForm({ ...form, agentName: e.target.value })}
                placeholder="e.g., Ramesh Kumar"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Date Taken</Label>
                <Input
                  type="date"
                  required
                  value={form.takenDate}
                  onChange={(e) => setForm({ ...form, takenDate: e.target.value })}
                />
              </div>
              <div>
                <Label>Expected Return</Label>
                <Input
                  type="date"
                  required
                  value={form.expectedReturnDate}
                  onChange={(e) => setForm({ ...form, expectedReturnDate: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1">Add Job</Button>
              <Button type="button" variant="outline" onClick={() => setDialogType(null)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Finishing;