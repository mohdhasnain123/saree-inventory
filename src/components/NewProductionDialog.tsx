import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Factory, Shirt, Users, Settings, Package, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useSettings } from "@/contexts/SettingsContext";
import { useProductionType } from "@/contexts/ProductionTypeContext";

interface NewProductionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface WorkerLite { id: string; name: string; role: string; }
interface MachineLite { id: string; name: string; location: string; }
interface MaterialLite { id: string; name: string; unit: string; }

const NewProductionDialog = ({ open, onOpenChange }: NewProductionDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { notifyEnabled } = useSettings();
  const { typeParam, typeQuery } = useProductionType();

  const { data: workers = [] } = useQuery<WorkerLite[]>({
    queryKey: ["workers", typeParam],
    queryFn: () => api.get<WorkerLite[]>(`/workers${typeQuery}`),
    enabled: open,
  });

  const { data: machines = [] } = useQuery<MachineLite[]>({
    queryKey: ["machines", typeParam],
    queryFn: () => api.get<MachineLite[]>(`/machines${typeQuery}`),
    enabled: open,
  });

  const { data: materialsList = [] } = useQuery<MaterialLite[]>({
    queryKey: ["materials"],
    queryFn: () => api.get<MaterialLite[]>("/materials"),
    enabled: open,
  });

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api.post("/productions", { ...body, productionType: typeParam || "powerloom" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productions"] });
      if (notifyEnabled("production")) {
        toast({ title: "Production Order Created", description: "Production order saved successfully." });
      }
      reset();
      onOpenChange(false);
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const [productionData, setProductionData] = useState({
    sareeType: "",
    design: "",
    quantity: "",
    priority: "medium",
    estimatedDays: "",
    assignedWorkers: [] as string[],
    machines: [] as string[],
    materials: [] as { material: string; quantity: string; unit: string }[],
    notes: "",
  });

  const sareeTypes = ["Cotton", "Silk", "Georgette", "Chiffon"];
  const priorities = [
    { value: "low", label: "Low Priority", color: "bg-muted" },
    { value: "medium", label: "Medium Priority", color: "bg-warning" },
    { value: "high", label: "High Priority", color: "bg-destructive" },
    { value: "urgent", label: "Urgent", color: "bg-destructive" },
  ];

  const commonMaterials = materialsList.map((m) => ({ name: m.name, unit: m.unit }));

  const reset = () => setProductionData({ sareeType: "", design: "", quantity: "", priority: "medium", estimatedDays: "", assignedWorkers: [], machines: [], materials: [], notes: "" });

  const handleSubmit = () => {
    if (!productionData.sareeType || !productionData.design || !productionData.quantity) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    createMutation.mutate({
      sareeType: productionData.sareeType,
      design: productionData.design,
      quantity: parseInt(productionData.quantity) || 0,
      priority: productionData.priority,
      estimatedDays: parseInt(productionData.estimatedDays) || 0,
      assignedWorkers: productionData.assignedWorkers,
      machines: productionData.machines,
      materials: productionData.materials,
      notes: productionData.notes,
      status: "pending",
    });
  };

  const toggleWorker = (id: string) =>
    setProductionData((p) => ({
      ...p,
      assignedWorkers: p.assignedWorkers.includes(id) ? p.assignedWorkers.filter((w) => w !== id) : [...p.assignedWorkers, id],
    }));
  const toggleMachine = (id: string) =>
    setProductionData((p) => ({
      ...p,
      machines: p.machines.includes(id) ? p.machines.filter((m) => m !== id) : [...p.machines, id],
    }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-hidden p-4 sm:p-6">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Factory className="w-5 h-5" />New Production Order</DialogTitle></DialogHeader>

        <div className="overflow-y-auto max-h-[70vh] space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Shirt className="w-4 h-4" />Basic Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Saree Type *</Label>
                  <Select value={productionData.sareeType} onValueChange={(v) => setProductionData({ ...productionData, sareeType: v })}>
                    <SelectTrigger><SelectValue placeholder="Select saree type" /></SelectTrigger>
                    <SelectContent>{sareeTypes.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Design Name *</Label>
                  <Input value={productionData.design} onChange={(e) => setProductionData({ ...productionData, design: e.target.value })} placeholder="Enter design name" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Quantity *</Label><Input type="number" value={productionData.quantity} onChange={(e) => setProductionData({ ...productionData, quantity: e.target.value })} placeholder="Number of sarees" /></div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={productionData.priority} onValueChange={(v) => setProductionData({ ...productionData, priority: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{priorities.map((p) => (<SelectItem key={p.value} value={p.value}><div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${p.color}`}></div>{p.label}</div></SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Estimated Days</Label><Input type="number" value={productionData.estimatedDays} onChange={(e) => setProductionData({ ...productionData, estimatedDays: e.target.value })} placeholder="Days to complete" /></div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Users className="w-4 h-4" />Assign Workers</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {workers.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No workers available.</p>}
                  {workers.map((w) => (
                    <div key={w.id} className={`p-3 rounded-lg border cursor-pointer transition-colors ${productionData.assignedWorkers.includes(w.id) ? "bg-primary/10 border-primary" : "bg-secondary/30 border-border hover:bg-secondary/50"}`} onClick={() => toggleWorker(w.id)}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{w.name} ({w.role})</span>
                        {productionData.assignedWorkers.includes(w.id) && <Badge variant="secondary" className="text-xs">Selected</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Settings className="w-4 h-4" />Assign Machines</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {machines.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No machines available.</p>}
                  {machines.map((m) => (
                    <div key={m.id} className={`p-3 rounded-lg border cursor-pointer transition-colors ${productionData.machines.includes(m.id) ? "bg-primary/10 border-primary" : "bg-secondary/30 border-border hover:bg-secondary/50"}`} onClick={() => toggleMachine(m.id)}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{m.name} ({m.location})</span>
                        {productionData.machines.includes(m.id) && <Badge variant="secondary" className="text-xs">Selected</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Package className="w-4 h-4" />Materials Required</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {productionData.materials.map((material, index) => (
                <div key={index} className="flex items-end gap-2">
                  <div className="flex-1 space-y-2">
                    <Label>Material</Label>
                    <Select value={material.material} onValueChange={(v) => setProductionData((p) => ({ ...p, materials: p.materials.map((m, i) => i === index ? { ...m, material: v } : m) }))}>
                      <SelectTrigger><SelectValue placeholder="Select material" /></SelectTrigger>
                      <SelectContent>{commonMaterials.map((m) => (<SelectItem key={m.name} value={m.name}>{m.name}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div className="w-24 space-y-2">
                    <Label>Quantity</Label>
                    <Input type="number" value={material.quantity} onChange={(e) => setProductionData((p) => ({ ...p, materials: p.materials.map((m, i) => i === index ? { ...m, quantity: e.target.value } : m) }))} placeholder="0" />
                  </div>
                  <div className="w-20 space-y-2">
                    <Label>Unit</Label>
                    <Select value={material.unit} onValueChange={(v) => setProductionData((p) => ({ ...p, materials: p.materials.map((m, i) => i === index ? { ...m, unit: v } : m) }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="meters">meters</SelectItem>
                        <SelectItem value="liters">liters</SelectItem>
                        <SelectItem value="pieces">pieces</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline" size="icon" onClick={() => setProductionData((p) => ({ ...p, materials: p.materials.filter((_, i) => i !== index) }))} className="text-destructive"><X className="w-4 h-4" /></Button>
                </div>
              ))}
              <Button variant="outline" onClick={() => setProductionData((p) => ({ ...p, materials: [...p.materials, { material: "", quantity: "", unit: "kg" }] }))} className="w-full">
                <Plus className="w-4 h-4 mr-2" /> Add Material
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Additional Notes</CardTitle></CardHeader>
            <CardContent>
              <Textarea value={productionData.notes} onChange={(e) => setProductionData({ ...productionData, notes: e.target.value })} placeholder="Add any special instructions or notes for this production order..." rows={4} />
            </CardContent>
          </Card>
        </div>

        <Separator />

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} className="bg-gradient-primary"><Factory className="w-4 h-4 mr-2" />Create Production Order</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewProductionDialog;
