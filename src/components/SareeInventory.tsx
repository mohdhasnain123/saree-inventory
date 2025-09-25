import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shirt, Plus, Search, Edit, Trash2, Calendar, IndianRupee } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Saree {
  id: string;
  type: string;
  design: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  totalValue: number;
  profitMargin: number;
  dateManufactured: string;
  status: "available" | "low-stock" | "out-of-stock";
  image?: string;
}

const getSareeImage = (type: string) => {
  switch (type.toLowerCase()) {
    case "silk": return "/src/assets/saree-silk.jpg";
    case "cotton": return "/src/assets/saree-cotton.jpg";
    case "georgette": return "/src/assets/saree-georgette.jpg";
    case "chiffon": return "/src/assets/saree-chiffon.jpg";
    default: return "/src/assets/saree-cotton.jpg";
  }
};

const SareeInventory = () => {
  const { toast } = useToast();
  const [sarees, setSarees] = useState<Saree[]>([
    {
      id: "SAR001",
      type: "Silk",
      design: "Traditional Kanjivaram",
      quantity: 25,
      costPrice: 4000,
      sellingPrice: 5000,
      totalValue: 125000,
      profitMargin: 20,
      dateManufactured: "2024-01-10",
      status: "available"
    },
    {
      id: "SAR002",
      type: "Cotton",
      design: "Handloom Pure Cotton",
      quantity: 45,
      costPrice: 1200,
      sellingPrice: 1700,
      totalValue: 76500,
      profitMargin: 29.4,
      dateManufactured: "2024-01-08",
      status: "available"
    },
    {
      id: "SAR003",
      type: "Georgette",
      design: "Floral Print Georgette",
      quantity: 8,
      costPrice: 3500,
      sellingPrice: 6000,
      totalValue: 48000,
      profitMargin: 41.7,
      dateManufactured: "2024-01-05",
      status: "low-stock"
    },
    {
      id: "SAR004",
      type: "Chiffon",
      design: "Embroidered Chiffon",
      quantity: 0,
      costPrice: 1800,
      sellingPrice: 2400,
      totalValue: 0,
      profitMargin: 25,
      dateManufactured: "2024-01-03",
      status: "out-of-stock"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSaree, setEditingSaree] = useState<Saree | null>(null);
  const [formData, setFormData] = useState({
    type: "",
    design: "",
    quantity: "",
    costPrice: "",
    sellingPrice: "",
    dateManufactured: ""
  });

  const getStatusColor = (status: Saree["status"]) => {
    switch (status) {
      case "available": return "bg-success/20 text-success-foreground border-success/30";
      case "low-stock": return "bg-warning/20 text-warning-foreground border-warning/30";
      case "out-of-stock": return "bg-destructive/20 text-destructive-foreground border-destructive/30";
    }
  };

  const getStatus = (quantity: number): Saree["status"] => {
    if (quantity === 0) return "out-of-stock";
    if (quantity < 10) return "low-stock";
    return "available";
  };

  const calculateValues = (quantity: number, costPrice: number, sellingPrice: number) => {
    const totalValue = quantity * sellingPrice;
    const profitMargin = costPrice > 0 ? ((sellingPrice - costPrice) / sellingPrice) * 100 : 0;
    return { totalValue, profitMargin };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const quantity = parseInt(formData.quantity);
    const costPrice = parseFloat(formData.costPrice);
    const sellingPrice = parseFloat(formData.sellingPrice);
    const status = getStatus(quantity);
    const { totalValue, profitMargin } = calculateValues(quantity, costPrice, sellingPrice);

    if (editingSaree) {
      setSarees(sarees.map(saree =>
        saree.id === editingSaree.id
          ? {
              ...saree,
              type: formData.type,
              design: formData.design,
              quantity,
              costPrice,
              sellingPrice,
              totalValue,
              profitMargin,
              dateManufactured: formData.dateManufactured,
              status
            }
          : saree
      ));
      toast({
        title: "Saree Updated",
        description: "Saree inventory has been successfully updated.",
      });
    } else {
      const newSaree: Saree = {
        id: `SAR${String(sarees.length + 1).padStart(3, '0')}`,
        type: formData.type,
        design: formData.design,
        quantity,
        costPrice,
        sellingPrice,
        totalValue,
        profitMargin,
        dateManufactured: formData.dateManufactured,
        status
      };
      setSarees([...sarees, newSaree]);
      toast({
        title: "Saree Added",
        description: "New saree has been added to inventory.",
      });
    }

    setFormData({ type: "", design: "", quantity: "", costPrice: "", sellingPrice: "", dateManufactured: "" });
    setEditingSaree(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (saree: Saree) => {
    setEditingSaree(saree);
    setFormData({
      type: saree.type,
      design: saree.design,
      quantity: saree.quantity.toString(),
      costPrice: saree.costPrice.toString(),
      sellingPrice: saree.sellingPrice.toString(),
      dateManufactured: saree.dateManufactured
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setSarees(sarees.filter(saree => saree.id !== id));
    toast({
      title: "Saree Deleted",
      description: "Saree has been removed from inventory.",
      variant: "destructive"
    });
  };

  const filteredSarees = sarees.filter(saree => {
    const matchesSearch = saree.design.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         saree.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         saree.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === "all" || saree.type.toLowerCase() === filterType.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  const totalInventoryValue = sarees.reduce((sum, saree) => sum + saree.totalValue, 0);
  const totalQuantity = sarees.reduce((sum, saree) => sum + saree.quantity, 0);
  const lowStockCount = sarees.filter(s => s.status === "low-stock" || s.status === "out-of-stock").length;

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shirt className="w-6 h-6 text-primary" />
            Saree Inventory
          </h2>
          <p className="text-muted-foreground mt-1">Manage finished saree stock and pricing</p>
        </div>
        <div className="flex items-center gap-3">
          {lowStockCount > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <Shirt className="w-3 h-3" />
              {lowStockCount} Low Stock
            </Badge>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary shadow-manufacturing">
                <Plus className="w-4 h-4 mr-2" />
                Add Saree
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingSaree ? "Edit Saree" : "Add New Saree"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="type">Saree Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
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
                <div>
                  <Label htmlFor="design">Design/Pattern</Label>
                  <Input
                    id="design"
                    value={formData.design}
                    onChange={(e) => setFormData({...formData, design: e.target.value})}
                    placeholder="e.g., Traditional Kanjivaram"
                    required
                  />
                </div>
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
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="costPrice">Cost Price (₹)</Label>
                    <Input
                      id="costPrice"
                      type="number"
                      value={formData.costPrice}
                      onChange={(e) => setFormData({...formData, costPrice: e.target.value})}
                      placeholder="0"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="sellingPrice">Selling Price (₹)</Label>
                    <Input
                      id="sellingPrice"
                      type="number"
                      value={formData.sellingPrice}
                      onChange={(e) => setFormData({...formData, sellingPrice: e.target.value})}
                      placeholder="0"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="dateManufactured">Date Manufactured</Label>
                  <Input
                    id="dateManufactured"
                    type="date"
                    value={formData.dateManufactured}
                    onChange={(e) => setFormData({...formData, dateManufactured: e.target.value})}
                    required
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingSaree ? "Update" : "Add"} Saree
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsDialogOpen(false);
                      setEditingSaree(null);
                      setFormData({ type: "", design: "", quantity: "", costPrice: "", sellingPrice: "", dateManufactured: "" });
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Inventory Value</p>
                <p className="text-2xl font-bold text-foreground">₹{totalInventoryValue.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <IndianRupee className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sarees</p>
                <p className="text-2xl font-bold text-foreground">{totalQuantity}</p>
              </div>
              <div className="p-3 bg-success/10 rounded-lg">
                <Shirt className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unique Designs</p>
                <p className="text-2xl font-bold text-foreground">{sarees.length}</p>
              </div>
              <div className="p-3 bg-accent/10 rounded-lg">
                <Calendar className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search sarees by design, type, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="cotton">Cotton</SelectItem>
            <SelectItem value="silk">Silk</SelectItem>
            <SelectItem value="georgette">Georgette</SelectItem>
            <SelectItem value="chiffon">Chiffon</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Saree Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSarees.map((saree) => (
          <Card key={saree.id} className="bg-gradient-card shadow-card border-0 hover:shadow-elevated transition-shadow">
            {/* Saree Image */}
            <div className="relative h-32 overflow-hidden rounded-t-lg">
              <img 
                src={getSareeImage(saree.type)} 
                alt={`${saree.type} saree - ${saree.design}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/src/assets/saree-cotton.jpg";
                }}
              />
              <div className="absolute top-2 right-2">
                <Badge className={getStatusColor(saree.status)}>
                  {saree.status.replace("-", " ")}
                </Badge>
              </div>
            </div>

            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg text-foreground flex items-center gap-2">
                    <Shirt className="w-4 h-4" />
                    {saree.id}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{saree.type}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium text-foreground">{saree.design}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Calendar className="w-3 h-3" />
                  Manufactured: {new Date(saree.dateManufactured).toLocaleDateString()}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Quantity</p>
                  <p className="font-medium text-foreground">{saree.quantity} pieces</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Selling Price</p>
                  <p className="font-medium text-foreground">₹{saree.sellingPrice}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Profit Margin</p>
                  <p className="font-medium text-success">{saree.profitMargin.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Value</p>
                  <p className="font-medium text-foreground">₹{saree.totalValue.toLocaleString()}</p>
                </div>
              </div>
              <div className="pt-2 border-t border-border">
                <div className="flex justify-between items-center">
                  <div className="text-xs text-muted-foreground">
                    Cost: ₹{saree.costPrice} | Selling: ₹{saree.sellingPrice}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEdit(saree)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDelete(saree.id)}
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

      {filteredSarees.length === 0 && (
        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="text-center py-12">
            <Shirt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No sarees found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters, or add new sarees to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SareeInventory;