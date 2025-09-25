import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Factory,
  Shirt,
  Users,
  Settings,
  Calendar,
  Package,
  Plus,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NewProductionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewProductionDialog = ({ open, onOpenChange }: NewProductionDialogProps) => {
  const { toast } = useToast();
  const [productionData, setProductionData] = useState({
    sareeType: "",
    design: "",
    quantity: "",
    priority: "medium",
    estimatedDays: "",
    assignedWorkers: [] as string[],
    machines: [] as string[],
    materials: [] as { material: string; quantity: string; unit: string }[],
    notes: ""
  });

  const sareeTypes = ["Cotton", "Silk", "Georgette", "Chiffon"];
  const priorities = [
    { value: "low", label: "Low Priority", color: "bg-muted" },
    { value: "medium", label: "Medium Priority", color: "bg-warning" },
    { value: "high", label: "High Priority", color: "bg-destructive" },
    { value: "urgent", label: "Urgent", color: "bg-destructive" }
  ];

  const availableWorkers = [
    "Rajesh Kumar (Master Weaver)",
    "Priya Sharma (Dyer)",
    "Amit Singh (Finisher)",
    "Lakshmi Devi (Quality Inspector)",
    "Ravi Patel (Weaver)",
    "Sunita Rao (Helper)"
  ];

  const availableMachines = [
    "Power Loom Alpha (Section A)",
    "Dye Machine Beta (Section B)",
    "Finishing Unit Gamma (Section C)",
    "Quality Check Delta (QC Section)",
    "Hand Loom Classic (Section D)"
  ];

  const commonMaterials = [
    { name: "Cotton Thread", unit: "kg" },
    { name: "Silk Thread", unit: "kg" },
    { name: "Dye", unit: "liters" },
    { name: "Zari", unit: "meters" },
    { name: "Border Thread", unit: "kg" }
  ];

  const handleAddMaterial = () => {
    setProductionData(prev => ({
      ...prev,
      materials: [...prev.materials, { material: "", quantity: "", unit: "kg" }]
    }));
  };

  const handleRemoveMaterial = (index: number) => {
    setProductionData(prev => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index)
    }));
  };

  const handleMaterialChange = (index: number, field: string, value: string) => {
    setProductionData(prev => ({
      ...prev,
      materials: prev.materials.map((material, i) => 
        i === index ? { ...material, [field]: value } : material
      )
    }));
  };

  const handleWorkerToggle = (worker: string) => {
    setProductionData(prev => ({
      ...prev,
      assignedWorkers: prev.assignedWorkers.includes(worker)
        ? prev.assignedWorkers.filter(w => w !== worker)
        : [...prev.assignedWorkers, worker]
    }));
  };

  const handleMachineToggle = (machine: string) => {
    setProductionData(prev => ({
      ...prev,
      machines: prev.machines.includes(machine)
        ? prev.machines.filter(m => m !== machine)
        : [...prev.machines, machine]
    }));
  };

  const handleSubmit = () => {
    if (!productionData.sareeType || !productionData.design || !productionData.quantity) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Mock production creation
    const productionId = `PROD${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    
    toast({
      title: "Production Order Created",
      description: `Production order ${productionId} has been created successfully`,
    });

    // Reset form
    setProductionData({
      sareeType: "",
      design: "",
      quantity: "",
      priority: "medium",
      estimatedDays: "",
      assignedWorkers: [],
      machines: [],
      materials: [],
      notes: ""
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Factory className="w-5 h-5" />
            New Production Order
          </DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[70vh] space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shirt className="w-4 h-4" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sareeType">Saree Type *</Label>
                  <Select 
                    value={productionData.sareeType} 
                    onValueChange={(value) => setProductionData(prev => ({...prev, sareeType: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select saree type" />
                    </SelectTrigger>
                    <SelectContent>
                      {sareeTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="design">Design Name *</Label>
                  <Input
                    id="design"
                    value={productionData.design}
                    onChange={(e) => setProductionData(prev => ({...prev, design: e.target.value}))}
                    placeholder="Enter design name"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={productionData.quantity}
                    onChange={(e) => setProductionData(prev => ({...prev, quantity: e.target.value}))}
                    placeholder="Number of sarees"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={productionData.priority} 
                    onValueChange={(value) => setProductionData(prev => ({...prev, priority: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map(priority => (
                        <SelectItem key={priority.value} value={priority.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${priority.color}`}></div>
                            {priority.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimatedDays">Estimated Days</Label>
                  <Input
                    id="estimatedDays"
                    type="number"
                    value={productionData.estimatedDays}
                    onChange={(e) => setProductionData(prev => ({...prev, estimatedDays: e.target.value}))}
                    placeholder="Days to complete"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resource Assignment */}
          <div className="grid grid-cols-2 gap-6">
            {/* Workers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Assign Workers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {availableWorkers.map((worker) => (
                    <div 
                      key={worker}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        productionData.assignedWorkers.includes(worker)
                          ? 'bg-primary/10 border-primary'
                          : 'bg-secondary/30 border-border hover:bg-secondary/50'
                      }`}
                      onClick={() => handleWorkerToggle(worker)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{worker}</span>
                        {productionData.assignedWorkers.includes(worker) && (
                          <Badge variant="secondary" className="text-xs">Selected</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Machines */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Assign Machines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {availableMachines.map((machine) => (
                    <div 
                      key={machine}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        productionData.machines.includes(machine)
                          ? 'bg-primary/10 border-primary'
                          : 'bg-secondary/30 border-border hover:bg-secondary/50'
                      }`}
                      onClick={() => handleMachineToggle(machine)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{machine}</span>
                        {productionData.machines.includes(machine) && (
                          <Badge variant="secondary" className="text-xs">Selected</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Materials Required */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Materials Required
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {productionData.materials.map((material, index) => (
                <div key={index} className="flex items-end gap-2">
                  <div className="flex-1 space-y-2">
                    <Label>Material</Label>
                    <Select
                      value={material.material}
                      onValueChange={(value) => handleMaterialChange(index, 'material', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select material" />
                      </SelectTrigger>
                      <SelectContent>
                        {commonMaterials.map(mat => (
                          <SelectItem key={mat.name} value={mat.name}>{mat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-24 space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      value={material.quantity}
                      onChange={(e) => handleMaterialChange(index, 'quantity', e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div className="w-20 space-y-2">
                    <Label>Unit</Label>
                    <Select
                      value={material.unit}
                      onValueChange={(value) => handleMaterialChange(index, 'unit', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="meters">meters</SelectItem>
                        <SelectItem value="liters">liters</SelectItem>
                        <SelectItem value="pieces">pieces</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemoveMaterial(index)}
                    className="text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={handleAddMaterial}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Material
              </Button>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={productionData.notes}
                onChange={(e) => setProductionData(prev => ({...prev, notes: e.target.value}))}
                placeholder="Add any special instructions or notes for this production order..."
                rows={4}
              />
            </CardContent>
          </Card>
        </div>

        <Separator />

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-gradient-primary">
            <Factory className="w-4 h-4 mr-2" />
            Create Production Order
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewProductionDialog;