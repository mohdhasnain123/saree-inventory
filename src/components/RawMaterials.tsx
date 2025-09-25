import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Plus, Search, Edit, Trash2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Material {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  supplier: string;
  costPerUnit: number;
  totalValue: number;
  status: "in-stock" | "low-stock" | "out-of-stock";
}

const RawMaterials = () => {
  const { toast } = useToast();
  const [materials, setMaterials] = useState<Material[]>([
    {
      id: "RM001",
      name: "Cotton Yarn",
      quantity: 500,
      unit: "kg",
      supplier: "Gujarat Cotton Mills",
      costPerUnit: 120,
      totalValue: 60000,
      status: "in-stock"
    },
    {
      id: "RM002", 
      name: "Silk Thread",
      quantity: 15,
      unit: "kg",
      supplier: "Mysore Silk Co.",
      costPerUnit: 800,
      totalValue: 12000,
      status: "low-stock"
    },
    {
      id: "RM003",
      name: "Gold Zari",
      quantity: 200,
      unit: "meters",
      supplier: "Varanasi Zari House",
      costPerUnit: 50,
      totalValue: 10000,
      status: "in-stock"
    },
    {
      id: "RM004",
      name: "Synthetic Dye - Red",
      quantity: 0,
      unit: "kg",
      supplier: "Chemical Industries Ltd",
      costPerUnit: 300,
      totalValue: 0,
      status: "out-of-stock"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    quantity: "",
    unit: "",
    supplier: "",
    costPerUnit: ""
  });

  const getStatusColor = (status: Material["status"]) => {
    switch (status) {
      case "in-stock": return "bg-success/20 text-success-foreground border-success/30";
      case "low-stock": return "bg-warning/20 text-warning-foreground border-warning/30";
      case "out-of-stock": return "bg-destructive/20 text-destructive-foreground border-destructive/30";
    }
  };

  const getStatus = (quantity: number): Material["status"] => {
    if (quantity === 0) return "out-of-stock";
    if (quantity < 50) return "low-stock";
    return "in-stock";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const quantity = parseFloat(formData.quantity);
    const costPerUnit = parseFloat(formData.costPerUnit);
    const totalValue = quantity * costPerUnit;
    const status = getStatus(quantity);

    if (editingMaterial) {
      setMaterials(materials.map(material =>
        material.id === editingMaterial.id
          ? {
              ...material,
              name: formData.name,
              quantity,
              unit: formData.unit,
              supplier: formData.supplier,
              costPerUnit,
              totalValue,
              status
            }
          : material
      ));
      toast({
        title: "Material Updated",
        description: "Raw material has been successfully updated.",
      });
    } else {
      const newMaterial: Material = {
        id: `RM${String(materials.length + 1).padStart(3, '0')}`,
        name: formData.name,
        quantity,
        unit: formData.unit,
        supplier: formData.supplier,
        costPerUnit,
        totalValue,
        status
      };
      setMaterials([...materials, newMaterial]);
      toast({
        title: "Material Added",
        description: "New raw material has been added to inventory.",
      });
    }

    setFormData({ name: "", quantity: "", unit: "", supplier: "", costPerUnit: "" });
    setEditingMaterial(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    setFormData({
      name: material.name,
      quantity: material.quantity.toString(),
      unit: material.unit,
      supplier: material.supplier,
      costPerUnit: material.costPerUnit.toString()
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setMaterials(materials.filter(material => material.id !== id));
    toast({
      title: "Material Deleted",
      description: "Raw material has been removed from inventory.",
      variant: "destructive"
    });
  };

  const filteredMaterials = materials.filter(material =>
    material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockCount = materials.filter(m => m.status === "low-stock" || m.status === "out-of-stock").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" />
            Raw Materials Inventory
          </h2>
          <p className="text-muted-foreground mt-1">Manage your raw materials stock and suppliers</p>
        </div>
        <div className="flex items-center gap-3">
          {lowStockCount > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {lowStockCount} Low Stock Alert
            </Badge>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary shadow-manufacturing">
                <Plus className="w-4 h-4 mr-2" />
                Add Material
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingMaterial ? "Edit Material" : "Add New Material"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Material Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Cotton Yarn"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                      placeholder="0"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit">Unit</Label>
                    <Select value={formData.unit} onValueChange={(value) => setFormData({...formData, unit: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="meters">meters</SelectItem>
                        <SelectItem value="pieces">pieces</SelectItem>
                        <SelectItem value="liters">liters</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="supplier">Supplier</Label>
                  <Input
                    id="supplier"
                    value={formData.supplier}
                    onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                    placeholder="e.g., Gujarat Cotton Mills"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="costPerUnit">Cost per Unit (₹)</Label>
                  <Input
                    id="costPerUnit"
                    type="number"
                    value={formData.costPerUnit}
                    onChange={(e) => setFormData({...formData, costPerUnit: e.target.value})}
                    placeholder="0"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingMaterial ? "Update" : "Add"} Material
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsDialogOpen(false);
                      setEditingMaterial(null);
                      setFormData({ name: "", quantity: "", unit: "", supplier: "", costPerUnit: "" });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search materials or suppliers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map((material) => (
          <Card key={material.id} className="bg-gradient-card shadow-card border-0 hover:shadow-elevated transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg text-foreground">{material.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">ID: {material.id}</p>
                </div>
                <Badge className={getStatusColor(material.status)}>
                  {material.status.replace("-", " ")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Quantity</p>
                  <p className="font-medium text-foreground">{material.quantity} {material.unit}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Cost/Unit</p>
                  <p className="font-medium text-foreground">₹{material.costPerUnit}</p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Supplier</p>
                <p className="font-medium text-foreground">{material.supplier}</p>
              </div>
              <div className="pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Total Value</p>
                    <p className="font-bold text-lg text-foreground">₹{material.totalValue.toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEdit(material)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDelete(material.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMaterials.length === 0 && (
        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="text-center py-12">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No materials found</h3>
            <p className="text-muted-foreground">Try adjusting your search or add new materials to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RawMaterials;