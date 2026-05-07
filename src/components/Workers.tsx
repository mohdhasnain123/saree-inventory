import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Users, Plus, Search, Trash2, UserCheck, UserX, IndianRupee, Package, Scissors, Wallet, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface SareeSubmission { id: string; date: string; quantity: number; note?: string; }
interface Advance { id: string; date: string; amount: number; note?: string; }
interface Worker {
  id: string;
  name: string;
  role: string;
  phone: string;
  status: "active" | "inactive" | "on-leave";
  joinDate: string;
  machine: string;
  perSareeWage: number;
  warpSize: number;
  warpCompleted: number;
  submissions: SareeSubmission[];
  advances: Advance[];
}

const Workers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { canWrite } = useAuth();

  const { data: workers = [], isLoading } = useQuery<Worker[]>({
    queryKey: ["workers"],
    queryFn: () => api.get<Worker[]>("/workers"),
  });

  const createMutation = useMutation({
    mutationFn: (body: Partial<Worker>) => api.post<Worker>("/workers", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workers"] });
      toast({ title: "Success", description: "Worker added successfully" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.del(`/workers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workers"] });
      toast({ title: "Removed", description: "Worker removed" });
    },
  });

  const submitMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: { quantity: number; note?: string } }) =>
      api.post(`/workers/${id}/submissions`, body),
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: ["workers"] });
      toast({ title: "Submitted", description: `${vars.body.quantity} sarees added to stock` });
    },
  });

  const advanceMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: { amount: number; note?: string } }) =>
      api.post(`/workers/${id}/advances`, body),
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: ["workers"] });
      toast({ title: "Recorded", description: `Advance of ₹${vars.body.amount} recorded` });
    },
  });

  const cutWarpMutation = useMutation({
    mutationFn: (id: string) => api.post(`/workers/${id}/cut-warp`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workers"] });
      toast({ title: "Warp Cut", description: "New warp started, counter reset" });
    },
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [submitFor, setSubmitFor] = useState<Worker | null>(null);
  const [advanceFor, setAdvanceFor] = useState<Worker | null>(null);
  const [ledgerFor, setLedgerFor] = useState<Worker | null>(null);

  const [newWorker, setNewWorker] = useState({
    name: "",
    role: "",
    phone: "",
    machine: "",
    perSareeWage: "",
    warpSize: "",
    status: "active" as const,
  });

  const [submission, setSubmission] = useState({ quantity: "", note: "" });
  const [advance, setAdvance] = useState({ amount: "", note: "" });

  const roles = ["Master Weaver", "Weaver", "Dyer", "Finisher", "Quality Inspector", "Helper", "Supervisor"];

  const totals = (w: Worker) => {
    const sareesSubmitted = w.submissions.reduce((s, x) => s + x.quantity, 0);
    const earned = sareesSubmitted * w.perSareeWage;
    const advanceTaken = w.advances.reduce((s, x) => s + x.amount, 0);
    const balance = earned - advanceTaken;
    const warpProgress = w.warpSize ? Math.min(100, Math.round((w.warpCompleted / w.warpSize) * 100)) : 0;
    return { sareesSubmitted, earned, advanceTaken, balance, warpProgress };
  };

  const filteredWorkers = workers.filter((w) =>
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.machine.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleAddWorker = () => {
    if (!newWorker.name || !newWorker.role || !newWorker.perSareeWage) {
      toast({ title: "Error", description: "Please fill in name, role and per-saree wage", variant: "destructive" });
      return;
    }
    createMutation.mutate({
      name: newWorker.name,
      role: newWorker.role,
      phone: newWorker.phone,
      status: newWorker.status,
      joinDate: new Date().toISOString().split("T")[0],
      machine: newWorker.machine || "—",
      perSareeWage: parseInt(newWorker.perSareeWage) || 0,
      warpSize: parseInt(newWorker.warpSize) || 0,
      warpCompleted: 0,
      submissions: [],
      advances: [],
    });
    setNewWorker({ name: "", role: "", phone: "", machine: "", perSareeWage: "", warpSize: "", status: "active" });
    setIsAddDialogOpen(false);
  };

  const handleAddSubmission = () => {
    if (!submitFor) return;
    const qty = parseInt(submission.quantity);
    if (!qty || qty <= 0) { toast({ title: "Error", description: "Enter a valid quantity", variant: "destructive" }); return; }
    submitMutation.mutate({ id: submitFor.id, body: { quantity: qty, note: submission.note } });
    setSubmission({ quantity: "", note: "" });
    setSubmitFor(null);
  };

  const handleAddAdvance = () => {
    if (!advanceFor) return;
    const amt = parseInt(advance.amount);
    if (!amt || amt <= 0) { toast({ title: "Error", description: "Enter a valid amount", variant: "destructive" }); return; }
    advanceMutation.mutate({ id: advanceFor.id, body: { amount: amt, note: advance.note } });
    setAdvance({ amount: "", note: "" });
    setAdvanceFor(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <Badge className="bg-success text-success-foreground">Active</Badge>;
      case "inactive": return <Badge variant="secondary">Inactive</Badge>;
      case "on-leave": return <Badge className="bg-warning text-warning-foreground">On Leave</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalWorkers = workers.length;
  const activeWorkers = workers.filter((w) => w.status === "active").length;
  const totalSareesWoven = workers.reduce((s, w) => s + w.submissions.reduce((a, b) => a + b.quantity, 0), 0);
  const totalAdvances = workers.reduce((s, w) => s + w.advances.reduce((a, b) => a + b.amount, 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="pl-12 lg:pl-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Workers Management</h1>
          <p className="text-muted-foreground mt-1">Track saree submissions, warp progress, wages and advances</p>
        </div>
        <Dialog open={canWrite && isAddDialogOpen} onOpenChange={(open) => canWrite && setIsAddDialogOpen(open)}>
          {canWrite && (
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary shadow-manufacturing">
                <Plus className="w-4 h-4 mr-2" /> Add Worker
              </Button>
            </DialogTrigger>
          )}
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader><DialogTitle>Add New Worker</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Full Name *</Label>
                <Input value={newWorker.name} onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })} placeholder="Enter worker's name" />
              </div>
              <div className="grid gap-2">
                <Label>Role *</Label>
                <Select value={newWorker.role} onValueChange={(v) => setNewWorker({ ...newWorker, role: v })}>
                  <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                  <SelectContent>{roles.map((r) => (<SelectItem key={r} value={r}>{r}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Machine</Label>
                  <Input value={newWorker.machine} onChange={(e) => setNewWorker({ ...newWorker, machine: e.target.value })} placeholder="Loom-01" />
                </div>
                <div className="grid gap-2">
                  <Label>Per Saree Wage (₹) *</Label>
                  <Input type="number" value={newWorker.perSareeWage} onChange={(e) => setNewWorker({ ...newWorker, perSareeWage: e.target.value })} placeholder="300" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Warp Size (sarees)</Label>
                  <Input type="number" value={newWorker.warpSize} onChange={(e) => setNewWorker({ ...newWorker, warpSize: e.target.value })} placeholder="50" />
                </div>
                <div className="grid gap-2">
                  <Label>Phone</Label>
                  <Input value={newWorker.phone} onChange={(e) => setNewWorker({ ...newWorker, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddWorker}>Add Worker</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium text-muted-foreground">Total Workers</p><p className="text-2xl font-bold mt-1">{totalWorkers}</p></div>
              <div className="p-3 bg-primary/10 rounded-lg"><Users className="w-6 h-6 text-primary" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium text-muted-foreground">Active</p><p className="text-2xl font-bold mt-1">{activeWorkers}</p></div>
              <div className="p-3 bg-success/10 rounded-lg"><UserCheck className="w-6 h-6 text-success" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium text-muted-foreground">Sarees Woven</p><p className="text-2xl font-bold mt-1">{totalSareesWoven}</p></div>
              <div className="p-3 bg-accent/10 rounded-lg"><Package className="w-6 h-6 text-accent" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium text-muted-foreground">Advances Out</p><p className="text-2xl font-bold mt-1">₹{totalAdvances.toLocaleString()}</p></div>
              <div className="p-3 bg-warning/10 rounded-lg"><Wallet className="w-6 h-6 text-warning" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-card shadow-card border-0">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input placeholder="Search by name, role, machine or ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card className="bg-gradient-card shadow-card border-0"><CardContent className="text-center py-12 text-muted-foreground">Loading workers...</CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {filteredWorkers.map((w) => {
            const t = totals(w);
            return (
              <Card key={w.id} className="bg-gradient-card shadow-card border-0">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg"><Users className="w-6 h-6 text-primary" /></div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">{w.name}</h3>
                          <Badge variant="outline">{w.id}</Badge>
                          {getStatusBadge(w.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{w.role} · {w.machine} · {w.phone}</p>
                        <p className="text-sm"><span className="text-muted-foreground">Per saree wage: </span><span className="font-medium">₹{w.perSareeWage}</span></p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                      <div className="text-center"><p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Package className="w-3 h-3" /> Submitted</p><p className="font-semibold">{t.sareesSubmitted}</p></div>
                      <div className="text-center"><p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><IndianRupee className="w-3 h-3" /> Earned</p><p className="font-semibold">₹{t.earned.toLocaleString()}</p></div>
                      <div className="text-center"><p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Wallet className="w-3 h-3" /> Advance</p><p className="font-semibold text-warning">₹{t.advanceTaken.toLocaleString()}</p></div>
                      <div className="text-center"><p className="text-xs text-muted-foreground">Balance</p><p className={`font-semibold ${t.balance >= 0 ? "text-success" : "text-destructive"}`}>₹{t.balance.toLocaleString()}</p></div>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Scissors className="w-4 h-4" /> Warp progress: {w.warpCompleted}/{w.warpSize || "—"} sarees
                      </span>
                      <span className="text-xs text-muted-foreground">{t.warpProgress}%</span>
                    </div>
                    <Progress value={t.warpProgress} className="h-2" />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {canWrite && (
                      <>
                        <Button size="sm" onClick={() => setSubmitFor(w)}><Plus className="w-4 h-4 mr-1" /> Submit Sarees</Button>
                        <Button size="sm" variant="outline" onClick={() => setAdvanceFor(w)}><Wallet className="w-4 h-4 mr-1" /> Record Advance</Button>
                      </>
                    )}
                    <Button size="sm" variant="outline" onClick={() => setLedgerFor(w)}><BookOpen className="w-4 h-4 mr-1" /> View Ledger</Button>
                    {canWrite && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => cutWarpMutation.mutate(w.id)}><Scissors className="w-4 h-4 mr-1" /> Cut Warp</Button>
                        <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(w.id)} className="text-destructive hover:text-destructive ml-auto"><Trash2 className="w-4 h-4" /></Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!isLoading && filteredWorkers.length === 0 && (
        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="p-12 text-center">
            <UserX className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Workers Found</h3>
            <p className="text-muted-foreground">No workers match your search criteria.</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!submitFor} onOpenChange={(o) => !o && setSubmitFor(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader><DialogTitle>Submit Sarees — {submitFor?.name}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Quantity (bundle)</Label>
              <Input type="number" value={submission.quantity} onChange={(e) => setSubmission({ ...submission, quantity: e.target.value })} placeholder="e.g. 10" />
            </div>
            <div className="grid gap-2">
              <Label>Note</Label>
              <Input value={submission.note} onChange={(e) => setSubmission({ ...submission, note: e.target.value })} placeholder="Optional note" />
            </div>
            <p className="text-xs text-muted-foreground">Sarees will be added to stock and to the worker's earnings ledger.</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSubmitFor(null)}>Cancel</Button>
            <Button onClick={handleAddSubmission}>Submit</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!advanceFor} onOpenChange={(o) => !o && setAdvanceFor(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader><DialogTitle>Record Advance — {advanceFor?.name}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Amount (₹)</Label>
              <Input type="number" value={advance.amount} onChange={(e) => setAdvance({ ...advance, amount: e.target.value })} placeholder="e.g. 1500" />
            </div>
            <div className="grid gap-2">
              <Label>Reason / Note</Label>
              <Input value={advance.note} onChange={(e) => setAdvance({ ...advance, note: e.target.value })} placeholder="Optional" />
            </div>
            <p className="text-xs text-muted-foreground">Advance will be deducted from the worker's wage balance once warp completes.</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAdvanceFor(null)}>Cancel</Button>
            <Button onClick={handleAddAdvance}>Record</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!ledgerFor} onOpenChange={(o) => !o && setLedgerFor(null)}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader><DialogTitle>Ledger — {ledgerFor?.name}</DialogTitle></DialogHeader>
          {ledgerFor && (
            <Tabs defaultValue="submissions" className="w-full">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="submissions">Saree Submissions</TabsTrigger>
                <TabsTrigger value="advances">Advances</TabsTrigger>
              </TabsList>
              <TabsContent value="submissions" className="mt-4">
                {ledgerFor.submissions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No submissions yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Wage</TableHead>
                        <TableHead>Note</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ledgerFor.submissions.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell>{s.date}</TableCell>
                          <TableCell>{s.quantity}</TableCell>
                          <TableCell>₹{(s.quantity * ledgerFor.perSareeWage).toLocaleString()}</TableCell>
                          <TableCell className="text-muted-foreground">{s.note || "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
              <TabsContent value="advances" className="mt-4">
                {ledgerFor.advances.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No advances taken.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Note</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ledgerFor.advances.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell>{a.date}</TableCell>
                          <TableCell className="text-warning">₹{a.amount.toLocaleString()}</TableCell>
                          <TableCell className="text-muted-foreground">{a.note || "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Workers;
