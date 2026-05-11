import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building2,
  Plus,
  Search,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useProductionType } from "@/contexts/ProductionTypeContext";

interface Customer {
  id: string;
  name: string;
  businessName?: string;
  businessType: "retail" | "wholesale" | "boutique" | "distributor" | "exporter" | "other" | "";
  productionType: "powerloom" | "handloom" | "both" | "";
  phone: string;
  email: string;
  address: string;
  city: string;
  gstin: string;
  status: "active" | "inactive" | "ended";
  startedDate: string;
  endedDate: string;
  endReason: string;
  notes: string;
}

interface CustomerSummary extends Customer {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  orderCount: number;
  totalQuantity: number;
  lastOrderDate: string | null;
}

const BUSINESS_TYPES = [
  { value: "retail", label: "Retail" },
  { value: "wholesale", label: "Wholesale" },
  { value: "boutique", label: "Boutique" },
  { value: "distributor", label: "Distributor" },
  { value: "exporter", label: "Exporter" },
  { value: "other", label: "Other" },
];

const emptyForm: Omit<Customer, "id"> = {
  name: "",
  businessName: "",
  businessType: "retail",
  productionType: "both",
  phone: "",
  email: "",
  address: "",
  city: "",
  gstin: "",
  status: "active",
  startedDate: new Date().toISOString().split("T")[0],
  endedDate: "",
  endReason: "",
  notes: "",
};

const Customers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { canWrite } = useAuth();
  const { formatMoney } = useSettings();
  const { typeParam, typeQuery, label: typeLabel } = useProductionType();

  const { data: customers = [], isLoading } = useQuery<CustomerSummary[]>({
    queryKey: ["customers", "summary", typeParam],
    queryFn: () => api.get<CustomerSummary[]>(`/customers/summary${typeQuery}`),
  });

  const createMutation = useMutation({
    mutationFn: (body: Partial<Customer>) => api.post<Customer>("/customers", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast({ title: "Customer Added" });
    },
    onError: (err: Error) =>
      toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Customer> }) =>
      api.put<Customer>(`/customers/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast({ title: "Customer Updated" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.del(`/customers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast({ title: "Customer Removed", variant: "destructive" });
    },
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Customer["status"]>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CustomerSummary | null>(null);
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);

  const totals = useMemo(() => {
    const active = customers.filter((c) => c.status === "active");
    const totalRev = customers.reduce((s, c) => s + (c.totalRevenue || 0), 0);
    return { count: customers.length, active: active.length, revenue: totalRev };
  }, [customers]);

  const filtered = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.businessName || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.city || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (c: CustomerSummary) => {
    setEditing(c);
    setForm({
      name: c.name,
      businessName: c.businessName || "",
      businessType: c.businessType || "retail",
      productionType: c.productionType || "both",
      phone: c.phone || "",
      email: c.email || "",
      address: c.address || "",
      city: c.city || "",
      gstin: c.gstin || "",
      status: c.status || "active",
      startedDate: c.startedDate || "",
      endedDate: c.endedDate || "",
      endReason: c.endReason || "",
      notes: c.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    const payload: Partial<Customer> = {
      ...form,
      endedDate: form.status === "ended" ? form.endedDate || new Date().toISOString().split("T")[0] : "",
      endReason: form.status === "ended" ? form.endReason : "",
    };
    if (editing) {
      updateMutation.mutate({ id: editing.id, body: payload });
    } else {
      createMutation.mutate(payload);
    }
    setIsDialogOpen(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const statusBadge = (s: Customer["status"]) => {
    if (s === "active")
      return <Badge className="bg-success/20 text-success border-success/30">Active</Badge>;
    if (s === "ended")
      return <Badge variant="destructive">Ended</Badge>;
    return <Badge variant="secondary">Inactive</Badge>;
  };

  const fmtDate = (s?: string | null) => (s ? new Date(s).toLocaleDateString() : "—");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="pl-12 lg:pl-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Customers
            {typeParam && (
              <span className="ml-2 align-middle text-xs sm:text-sm font-medium bg-primary/15 text-primary px-2 py-1 rounded-md">
                {typeLabel} only
              </span>
            )}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Manage business relationships and track sales per customer
          </p>
        </div>
        {canWrite && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary shadow-manufacturing" onClick={handleAdd}>
                <Plus className="w-4 h-4 mr-2" /> Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editing ? "Edit Customer" : "Add New Customer"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Contact Name *</Label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Person name"
                      required
                    />
                  </div>
                  <div>
                    <Label>Business Name</Label>
                    <Input
                      value={form.businessName}
                      onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                      placeholder="Company / shop"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Business Type</Label>
                    <Select
                      value={form.businessType}
                      onValueChange={(v) =>
                        setForm({ ...form, businessType: v as Customer["businessType"] })
                      }
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {BUSINESS_TYPES.map((b) => (
                          <SelectItem key={b.value} value={b.value}>
                            {b.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Production Preference</Label>
                    <Select
                      value={form.productionType}
                      onValueChange={(v) =>
                        setForm({ ...form, productionType: v as Customer["productionType"] })
                      }
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="both">Both</SelectItem>
                        <SelectItem value="powerloom">Powerloom</SelectItem>
                        <SelectItem value="handloom">Handloom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>City</Label>
                    <Input
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>GSTIN</Label>
                    <Input
                      value={form.gstin}
                      onChange={(e) => setForm({ ...form, gstin: e.target.value })}
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div>
                  <Label>Address</Label>
                  <Input
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>Status</Label>
                    <Select
                      value={form.status}
                      onValueChange={(v) => setForm({ ...form, status: v as Customer["status"] })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="ended">Ended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Started</Label>
                    <Input
                      type="date"
                      value={form.startedDate}
                      onChange={(e) => setForm({ ...form, startedDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Ended</Label>
                    <Input
                      type="date"
                      value={form.endedDate}
                      onChange={(e) => setForm({ ...form, endedDate: e.target.value })}
                      disabled={form.status !== "ended"}
                    />
                  </div>
                </div>

                {form.status === "ended" && (
                  <div>
                    <Label>End Reason</Label>
                    <Textarea
                      value={form.endReason}
                      onChange={(e) => setForm({ ...form, endReason: e.target.value })}
                      placeholder="Why did this relationship end?"
                    />
                  </div>
                )}

                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Preferences, payment habits, etc."
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-gradient-primary">
                    {editing ? "Update Customer" : "Add Customer"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold mt-1">{totals.count}</p>
              </div>
              <Building2 className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold mt-1 text-success">{totals.active}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lifetime Revenue</p>
                <p className="text-2xl font-bold mt-1">{formatMoney(totals.revenue)}</p>
              </div>
              <Building2 className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, business or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
          <SelectTrigger className="w-full sm:w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="ended">Ended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-gradient-card shadow-card border-0">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Started</TableHead>
                <TableHead className="hidden md:table-cell">Last Order</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Profit</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                    Loading customers...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                    No customers match your filters.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{c.businessName || c.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {c.name} {c.city && `• ${c.city}`}
                      </span>
                      {(c.phone || c.email) && (
                        <span className="text-xs text-muted-foreground flex flex-wrap gap-3 mt-0.5">
                          {c.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {c.phone}
                            </span>
                          )}
                          {c.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {c.email}
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge variant="outline" className="capitalize w-fit">
                        {c.businessType || "—"}
                      </Badge>
                      <span className="text-xs text-muted-foreground capitalize">
                        {c.productionType || "—"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{statusBadge(c.status)}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {fmtDate(c.startedDate)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {fmtDate(c.lastOrderDate)}
                  </TableCell>
                  <TableCell className="text-right">{c.orderCount}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatMoney(c.totalRevenue)}
                  </TableCell>
                  <TableCell className="text-right text-success">
                    {formatMoney(c.totalProfit)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {canWrite && (
                        <>
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(c)} title="Edit">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              if (window.confirm(`Remove ${c.name}?`)) deleteMutation.mutate(c.id);
                            }}
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Ended customers reasons summary */}
      {customers.some((c) => c.status === "ended") && (
        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-destructive" />
              Ended relationships
            </h3>
            <div className="space-y-2">
              {customers
                .filter((c) => c.status === "ended")
                .map((c) => (
                  <div key={c.id} className="flex items-start justify-between text-sm border-b border-border last:border-0 pb-2">
                    <div>
                      <p className="font-medium">{c.businessName || c.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {fmtDate(c.startedDate)} – {fmtDate(c.endedDate)}
                      </p>
                      {c.endReason && (
                        <p className="text-muted-foreground text-xs mt-1">
                          Reason: {c.endReason}
                        </p>
                      )}
                    </div>
                    <span className="text-right text-muted-foreground">
                      {formatMoney(c.totalRevenue)} • {c.orderCount} orders
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Customers;
