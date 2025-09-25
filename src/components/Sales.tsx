import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Plus, Search, Edit, Trash2, TrendingUp, IndianRupee, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Sale {
  id: string;
  sareeId: string;
  sareeType: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  totalRevenue: number;
  profit: number;
  profitMargin: number;
  customerName: string;
  saleDate: string;
  status: "completed" | "pending" | "cancelled";
}

const Sales = () => {
  const { toast } = useToast();
  const [sales, setSales] = useState<Sale[]>([
    {
      id: "SAL001",
      sareeId: "SAR001",
      sareeType: "Silk",
      quantity: 3,
      costPrice: 4000,
      sellingPrice: 5000,
      totalRevenue: 15000,
      profit: 3000,
      profitMargin: 20,
      customerName: "Priya Textiles",
      saleDate: "2024-01-15",
      status: "completed"
    },
    {
      id: "SAL002",
      sareeId: "SAR002", 
      sareeType: "Cotton",
      quantity: 5,
      costPrice: 1200,
      sellingPrice: 1700,
      totalRevenue: 8500,
      profit: 2500,
      profitMargin: 29.4,
      customerName: "Meera Boutique",
      saleDate: "2024-01-14",
      status: "completed"
    },
    {
      id: "SAL003",
      sareeId: "SAR003",
      sareeType: "Georgette", 
      quantity: 2,
      costPrice: 3500,
      sellingPrice: 6000,
      totalRevenue: 12000,
      profit: 5000,
      profitMargin: 41.7,
      customerName: "Lakshmi Stores",
      saleDate: "2024-01-13",
      status: "completed"
    },
    {
      id: "SAL004",
      sareeId: "SAR004",
      sareeType: "Chiffon",
      quantity: 4,
      costPrice: 1800,
      sellingPrice: 2400,
      totalRevenue: 9600,
      profit: 2400,
      profitMargin: 25,
      customerName: "Radha Fashion",
      saleDate: "2024-01-12",
      status: "pending"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [formData, setFormData] = useState({
    sareeId: "",
    sareeType: "",
    quantity: "",
    costPrice: "",
    sellingPrice: "",
    customerName: "",
    saleDate: ""
  });

  const calculateProfit = (quantity: number, costPrice: number, sellingPrice: number) => {
    const totalCost = quantity * costPrice;
    const totalRevenue = quantity * sellingPrice;
    const profit = totalRevenue - totalCost;
    const profitMargin = totalCost > 0 ? (profit / totalRevenue) * 100 : 0;
    return { totalRevenue, profit, profitMargin };
  };

  const getStatusColor = (status: Sale["status"]) => {
    switch (status) {
      case "completed": return "bg-success/20 text-success-foreground border-success/30";
      case "pending": return "bg-warning/20 text-warning-foreground border-warning/30";
      case "cancelled": return "bg-destructive/20 text-destructive-foreground border-destructive/30";
    }
  };

  const getProfitColor = (profitMargin: number) => {
    if (profitMargin >= 30) return "text-success";
    if (profitMargin >= 15) return "text-warning";
    return "text-destructive";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const quantity = parseInt(formData.quantity);
    const costPrice = parseFloat(formData.costPrice);
    const sellingPrice = parseFloat(formData.sellingPrice);
    const { totalRevenue, profit, profitMargin } = calculateProfit(quantity, costPrice, sellingPrice);

    if (editingSale) {
      setSales(sales.map(sale =>
        sale.id === editingSale.id
          ? {
              ...sale,
              sareeId: formData.sareeId,
              sareeType: formData.sareeType,
              quantity,
              costPrice,
              sellingPrice,
              totalRevenue,
              profit,
              profitMargin,
              customerName: formData.customerName,
              saleDate: formData.saleDate
            }
          : sale
      ));
      toast({
        title: "Sale Updated",
        description: "Sale record has been successfully updated.",
      });
    } else {
      const newSale: Sale = {
        id: `SAL${String(sales.length + 1).padStart(3, '0')}`,
        sareeId: formData.sareeId,
        sareeType: formData.sareeType,
        quantity,
        costPrice,
        sellingPrice,
        totalRevenue,
        profit,
        profitMargin,
        customerName: formData.customerName,
        saleDate: formData.saleDate,
        status: "completed"
      };
      setSales([newSale, ...sales]);
      toast({
        title: "Sale Recorded",
        description: "New sale has been added to the system.",
      });
    }

    setFormData({ sareeId: "", sareeType: "", quantity: "", costPrice: "", sellingPrice: "", customerName: "", saleDate: "" });
    setEditingSale(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (sale: Sale) => {
    setEditingSale(sale);
    setFormData({
      sareeId: sale.sareeId,
      sareeType: sale.sareeType,
      quantity: sale.quantity.toString(),
      costPrice: sale.costPrice.toString(),
      sellingPrice: sale.sellingPrice.toString(),
      customerName: sale.customerName,
      saleDate: sale.saleDate
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setSales(sales.filter(sale => sale.id !== id));
    toast({
      title: "Sale Deleted",
      description: "Sale record has been removed from the system.",
      variant: "destructive"
    });
  };

  const filteredSales = sales.filter(sale =>
    sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.sareeType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.sareeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalRevenue, 0);
  const totalProfit = sales.reduce((sum, sale) => sum + sale.profit, 0);
  const avgProfitMargin = sales.length > 0 ? sales.reduce((sum, sale) => sum + sale.profitMargin, 0) / sales.length : 0;

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-primary" />
            Sales Management
          </h2>
          <p className="text-muted-foreground mt-1">Track sales performance and profit margins</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary shadow-manufacturing">
                <Plus className="w-4 h-4 mr-2" />
                Record Sale
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingSale ? "Edit Sale" : "Record New Sale"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="sareeId">Saree ID</Label>
                    <Input
                      id="sareeId"
                      value={formData.sareeId}
                      onChange={(e) => setFormData({...formData, sareeId: e.target.value})}
                      placeholder="SAR001"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="sareeType">Type</Label>
                    <Select value={formData.sareeType} onValueChange={(value) => setFormData({...formData, sareeType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cotton">Cotton</SelectItem>
                        <SelectItem value="Silk">Silk</SelectItem>
                        <SelectItem value="Georgette">Georgette</SelectItem>
                        <SelectItem value="Chiffon">Chiffon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                    placeholder="e.g., Priya Textiles"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="saleDate">Sale Date</Label>
                  <Input
                    id="saleDate"
                    type="date"
                    value={formData.saleDate}
                    onChange={(e) => setFormData({...formData, saleDate: e.target.value})}
                    required
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingSale ? "Update" : "Record"} Sale
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsDialogOpen(false);
                      setEditingSale(null);
                      setFormData({ sareeId: "", sareeType: "", quantity: "", costPrice: "", sellingPrice: "", customerName: "", saleDate: "" });
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-foreground">₹{totalRevenue.toLocaleString()}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Total Profit</p>
                <p className="text-2xl font-bold text-success">₹{totalProfit.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-success/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Profit Margin</p>
                <p className="text-2xl font-bold text-foreground">{avgProfitMargin.toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-accent/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search sales by customer, type, or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Sales List */}
      <div className="space-y-4">
        {filteredSales.map((sale) => (
          <Card key={sale.id} className="bg-gradient-card shadow-card border-0 hover:shadow-elevated transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-foreground">{sale.id}</h3>
                    <Badge className={getStatusColor(sale.status)}>
                      {sale.status}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {new Date(sale.saleDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Customer</p>
                      <p className="font-medium text-foreground">{sale.customerName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Saree</p>
                      <p className="font-medium text-foreground">{sale.sareeId} - {sale.sareeType}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Quantity</p>
                      <p className="font-medium text-foreground">{sale.quantity} pieces</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Price/Unit</p>
                      <p className="font-medium text-foreground">₹{sale.sellingPrice}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Revenue</p>
                    <p className="text-xl font-bold text-foreground">₹{sale.totalRevenue.toLocaleString()}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-muted-foreground">Profit:</span>
                      <span className={`text-sm font-medium ${getProfitColor(sale.profitMargin)}`}>
                        ₹{sale.profit.toLocaleString()} ({sale.profitMargin.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEdit(sale)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDelete(sale.id)}
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

      {filteredSales.length === 0 && (
        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="text-center py-12">
            <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No sales found</h3>
            <p className="text-muted-foreground">Try adjusting your search or record new sales to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Sales;