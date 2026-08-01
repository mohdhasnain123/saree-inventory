import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingBag, Plus, Edit, Trash2, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useProductionType } from "@/contexts/ProductionTypeContext";

interface Supplier {
  id: string;
  name: string;
}

interface Purchase {
  id: string;
  supplierId: string;
  supplierName: string;
  itemType: "saree" | "suit";
  itemName: string;
  design: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  purchaseDate: string;
  notes: string;
  productionType?: "powerloom" | "handloom";
}

const emptyForm = {
  supplierId: "",
  itemType: "saree" as "saree" | "suit",
  itemName: "",
  design: "",
  quantity: "",
  unitCost: "",
  purchaseDate: new Date().toISOString().slice(0, 10),
  notes: "",
  productionType: "powerloom" as "powerloom" | "handloom",
};

const Purchases = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { canWrite } = useAuth();
  const { typeParam, typeQuery } = useProductionType();

  const { data: suppliers = [] } = useQuery<Supplier[]>({
    queryKey: ["suppliers", typeParam ?? "all"],
    queryFn: () => api.get<Supplier[]>(`/suppliers${typeQuery}`),
  });

  const { data: purchases = [], isLoading } = useQuery<Purchase[]>({
    queryKey: ["purchases", typeParam ?? "all"],
    queryFn: () => api.get<Purchase[]>(`/purchases${typeQuery}`),
  });

  const createMutation = useMutation({
    mutationFn: (body: Partial<Purchase>) => api.post<Purchase>("/purchases", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast({ title: "Purchase Added", description: "Supplier balance updated successfully." });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Purchase> }) => api.put<Purchase>(`/purchases/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast({ title: "Purchase Updated" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.del(`/purchases/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast({ title: "Purchase Deleted", variant: "destructive" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const [formData, setFormData] = useState(() => ({ ...emptyForm, productionType: (typeParam || "powerloom") as "powerloom" | "handloom" }));
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);

  useEffect(() => {
    if (!editingPurchase) {
      setFormData((prev) => ({ ...prev, productionType: (typeParam || "powerloom") as "powerloom" | "handloom" }));
    }
  }, [editingPurchase, typeParam]);

  const totalPurchaseValue = useMemo(() => purchases.reduce((sum, purchase) => sum + purchase.totalCost, 0), [purchases]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.supplierId) {
      toast({ title: "Select a supplier", description: "Register a supplier first before recording a purchase.", variant: "destructive" });
      return;
    }
    const payload = {
      supplierId: formData.supplierId,
      productionType: editingPurchase?.productionType || formData.productionType || typeParam || "powerloom",
      itemType: formData.itemType,
      itemName: formData.itemName.trim(),
      design: formData.design.trim(),
      quantity: Number(formData.quantity || 0),
      unitCost: Number(formData.unitCost || 0),
      totalCost: Number(formData.quantity || 0) * Number(formData.unitCost || 0),
      purchaseDate: formData.purchaseDate,
      notes: formData.notes.trim(),
    };

    if (editingPurchase) {
      updateMutation.mutate({ id: editingPurchase.id, body: payload });
    } else {
      createMutation.mutate(payload);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({ ...emptyForm, productionType: (typeParam || "powerloom") as "powerloom" | "handloom" });
    setEditingPurchase(null);
  };

  const handleEdit = (purchase: Purchase) => {
    setEditingPurchase(purchase);
    setFormData({
      supplierId: purchase.supplierId,
      itemType: purchase.itemType,
      itemName: purchase.itemName,
      design: purchase.design,
      quantity: purchase.quantity.toString(),
      unitCost: purchase.unitCost.toString(),
      purchaseDate: purchase.purchaseDate.slice(0, 10),
      notes: purchase.notes,
      productionType: purchase.productionType || (typeParam || "powerloom"),
    });
  };

  const selectedSupplierName = suppliers.find((supplier) => supplier.id === formData.supplierId)?.name || "";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Purchase</h2>
          <p className="text-muted-foreground">Record purchases from registered suppliers for sarees and suits.</p>
        </div>
        <Badge className="bg-primary/10 text-primary border-0">Total: ₹{totalPurchaseValue.toLocaleString()}</Badge>
      </div>

      <Card className="bg-gradient-card shadow-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            {editingPurchase ? "Edit Purchase" : "Add Purchase"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!suppliers.length ? (
            <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
              Register at least one supplier before recording a purchase.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Supplier</Label>
                <Select value={formData.supplierId} onValueChange={(value) => setFormData({ ...formData, supplierId: value })}>
                  <SelectTrigger><SelectValue placeholder="Choose supplier" /></SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>{supplier.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Item Type</Label>
                <Select value={formData.itemType} onValueChange={(value) => setFormData({ ...formData, itemType: value as "saree" | "suit" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="saree">Saree</SelectItem>
                    <SelectItem value="suit">Suit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Item Name</Label>
                <Input value={formData.itemName} onChange={(e) => setFormData({ ...formData, itemName: e.target.value })} placeholder="e.g. Kanchipuram saree" required />
              </div>
              <div>
                <Label>Design</Label>
                <Input value={formData.design} onChange={(e) => setFormData({ ...formData, design: e.target.value })} placeholder="Design or pattern" />
              </div>
              <div>
                <Label>Quantity</Label>
                <Input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} placeholder="0" required />
              </div>
              <div>
                <Label>Unit Cost (₹)</Label>
                <Input type="number" value={formData.unitCost} onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })} placeholder="0" required />
              </div>
              <div>
                <Label>Purchase Date</Label>
                <Input type="date" value={formData.purchaseDate} onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })} />
              </div>
              <div>
                <Label>Supplier Summary</Label>
                <Input value={selectedSupplierName} readOnly className="bg-background" />
              </div>
              <div className="md:col-span-2">
                <Label>Notes</Label>
                <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Additional purchase notes" />
              </div>
              <div className="md:col-span-2 flex gap-3">
                <Button type="submit" className="flex-1" disabled={!canWrite || createMutation.isPending || updateMutation.isPending}>
                  {editingPurchase ? "Update Purchase" : "Save Purchase"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {isLoading ? (
        <Card className="bg-gradient-card shadow-card border-0"><CardContent className="py-8 text-center text-muted-foreground">Loading purchases...</CardContent></Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {purchases.map((purchase) => (
            <Card key={purchase.id} className="bg-gradient-card shadow-card border-0">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">{purchase.itemName}</CardTitle>
                    <p className="text-sm text-muted-foreground">{purchase.supplierName}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className="bg-primary/10 text-primary border-0 capitalize">{purchase.itemType}</Badge>
                    <Badge variant="outline" className="capitalize">{purchase.productionType || "powerloom"}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-success/10 text-success border-0">Qty: {purchase.quantity}</Badge>
                  <Badge className="bg-accent/10 text-accent border-0">₹{purchase.totalCost.toLocaleString()}</Badge>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Design: {purchase.design || "—"}</p>
                  <p>Unit cost: ₹{purchase.unitCost}</p>
                  <p>Purchase date: {new Date(purchase.purchaseDate).toLocaleDateString()}</p>
                  <p>Notes: {purchase.notes || "—"}</p>
                </div>
                {canWrite && (
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(purchase)}><Edit className="w-3 h-3 mr-1" /> Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(purchase.id)} disabled={deleteMutation.isPending}><Trash2 className="w-3 h-3 mr-1" /> Delete</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Purchases;
