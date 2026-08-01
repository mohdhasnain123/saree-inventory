import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Plus, Edit, Trash2, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  paymentTerms: string;
  totalPurchases: number;
  purchaseCount: number;
  lastPurchaseDate?: string | null;
  notes: string;
  status: "active" | "inactive";
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
}

const emptyForm = {
  name: "",
  contactPerson: "",
  phone: "",
  email: "",
  address: "",
  paymentTerms: "",
  notes: "",
  status: "active" as "active" | "inactive",
};

const Suppliers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { canWrite } = useAuth();

  const { data: suppliers = [], isLoading: isSuppliersLoading } = useQuery<Supplier[]>({
    queryKey: ["suppliers"],
    queryFn: () => api.get<Supplier[]>("/suppliers"),
  });

  const { data: purchases = [] } = useQuery<Purchase[]>({
    queryKey: ["purchases"],
    queryFn: () => api.get<Purchase[]>("/purchases"),
  });

  const createMutation = useMutation({
    mutationFn: (body: Partial<Supplier>) => api.post<Supplier>("/suppliers", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast({ title: "Supplier Added", description: "Supplier registered successfully." });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Supplier> }) => api.put<Supplier>(`/suppliers/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast({ title: "Supplier Updated" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.del(`/suppliers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast({ title: "Supplier Deleted", variant: "destructive" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const [formData, setFormData] = useState(emptyForm);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      name: formData.name.trim(),
      contactPerson: formData.contactPerson.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      address: formData.address.trim(),
      paymentTerms: formData.paymentTerms.trim(),
      notes: formData.notes.trim(),
    };
    if (editingSupplier) {
      updateMutation.mutate({ id: editingSupplier.id, body: payload });
    } else {
      createMutation.mutate(payload);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingSupplier(null);
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      contactPerson: supplier.contactPerson,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address,
      paymentTerms: supplier.paymentTerms,
      notes: supplier.notes,
      status: supplier.status,
    });
  };

  const formatDate = (value?: string | null) => {
    if (!value) return "—";
    return new Date(value).toLocaleDateString();
  };

  const selectedSupplierPurchases = useMemo(
    () => purchases.filter((purchase) => purchase.supplierId === selectedSupplierId),
    [purchases, selectedSupplierId]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Suppliers</h2>
          <p className="text-muted-foreground">Register vendors and keep purchase history in sync.</p>
        </div>
      </div>

      <Card className="bg-gradient-card shadow-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            {editingSupplier ? "Edit Supplier" : "Add Supplier"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label>Supplier Name</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Vendor name" required />
            </div>
            <div>
              <Label>Contact Person</Label>
              <Input value={formData.contactPerson} onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })} placeholder="Person name" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="Phone number" />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="Email" />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as "active" | "inactive" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>Address</Label>
              <Textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Vendor address" />
            </div>
            <div>
              <Label>Payment Terms</Label>
              <Input value={formData.paymentTerms} onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })} placeholder="e.g. 30 days" />
            </div>
            <div>
              <Label>Notes</Label>
              <Input value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Additional notes" />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <Button type="submit" className="flex-1" disabled={!canWrite || createMutation.isPending || updateMutation.isPending}>
                {editingSupplier ? "Update Supplier" : "Save Supplier"}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {isSuppliersLoading ? (
        <Card className="bg-gradient-card shadow-card border-0"><CardContent className="py-8 text-center text-muted-foreground">Loading suppliers...</CardContent></Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {suppliers.map((supplier) => {
            const isSelected = selectedSupplierId === supplier.id;
            return (
              <Card
                key={supplier.id}
                className={`bg-gradient-card shadow-card border-0 transition-all ${isSelected ? "ring-2 ring-primary/40" : ""}`}
                onClick={() => setSelectedSupplierId(supplier.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedSupplierId(supplier.id);
                  }
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg">{supplier.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{supplier.contactPerson || "No contact person"}</p>
                    </div>
                    <Badge variant={supplier.status === "active" ? "default" : "secondary"}>{supplier.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-primary/10 text-primary border-0">{supplier.purchaseCount} purchases</Badge>
                    <Badge className="bg-success/10 text-success border-0">₹{supplier.totalPurchases.toLocaleString()}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Phone: {supplier.phone || "—"}</p>
                    <p>Email: {supplier.email || "—"}</p>
                    <p>Last purchase: {formatDate(supplier.lastPurchaseDate)}</p>
                    <p>Payment terms: {supplier.paymentTerms || "—"}</p>
                  </div>

                  {isSelected && (
                    <div className="rounded-lg border border-border/60 bg-background/60 p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-sm font-medium">Supply history</p>
                        <Badge variant="outline">{selectedSupplierPurchases.length}</Badge>
                      </div>
                      {selectedSupplierPurchases.length ? (
                        <div className="space-y-2">
                          {selectedSupplierPurchases.map((purchase) => (
                            <div key={purchase.id} className="rounded-md border border-border/50 bg-background/80 p-2 text-sm">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-medium">{purchase.itemName}</span>
                                <span className="text-muted-foreground">{new Date(purchase.purchaseDate).toLocaleDateString()}</span>
                              </div>
                              <p className="text-muted-foreground">{purchase.design || "No design provided"}</p>
                              <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                <span>Qty: {purchase.quantity}</span>
                                <span>₹{purchase.totalCost.toLocaleString()}</span>
                                <span className="capitalize">{purchase.itemType}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No supply history recorded yet.</p>
                      )}
                    </div>
                  )}

                  {canWrite && (
                    <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(supplier)}><Edit className="w-3 h-3 mr-1" /> Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(supplier.id)} disabled={deleteMutation.isPending}><Trash2 className="w-3 h-3 mr-1" /> Delete</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Suppliers;
