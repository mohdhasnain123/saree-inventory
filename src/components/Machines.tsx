import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Plus, Search, Edit, Trash2, CheckCircle, AlertTriangle, XCircle, Wrench, Calendar, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface Machine {
  id: string;
  name: string;
  type: string;
  status: "working" | "maintenance" | "broken" | "idle";
  assignedWorker?: string;
  workerId?: string;
  location: string;
  purchaseDate: string;
  lastMaintenance: string;
  nextMaintenance: string;
  notes?: string;
  sareeType?: string;
  dailyProductionMeters: number;
  weeklyProductionMeters: number;
  ratePerMeter: number;
  metersPerSaree: number;
}

const Machines = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { canWrite } = useAuth();

  const { data: machines = [], isLoading } = useQuery<Machine[]>({
    queryKey: ["machines"],
    queryFn: () => api.get<Machine[]>("/machines"),
  });

  const { data: workersList = [] } = useQuery<{ id: string; name: string }[]>({
    queryKey: ["workers"],
    queryFn: () => api.get<{ id: string; name: string }[]>("/workers"),
  });

  const createMutation = useMutation({
    mutationFn: (body: Partial<Machine>) => api.post<Machine>("/machines", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["machines"] });
      toast({ title: "Success", description: "Machine added successfully" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Machine> }) =>
      api.put<Machine>(`/machines/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["machines"] });
      toast({ title: "Success", description: "Machine updated successfully" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.del(`/machines/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["machines"] });
      toast({ title: "Success", description: "Machine removed successfully" });
    },
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const sareeTypes = ["Silk Saree", "Cotton Saree", "Georgette Saree", "Chiffon Saree", "Banarasi Saree", "Kanjivaram Saree"];

  const [newMachine, setNewMachine] = useState<{
    name: string;
    type: string;
    location: string;
    status: Machine["status"];
    notes: string;
    sareeType: string;
    assignedWorker: string;
    dailyProductionMeters: number;
    ratePerMeter: number;
    metersPerSaree: number;
  }>({
    name: "",
    type: "",
    location: "",
    status: "working",
    notes: "",
    sareeType: "",
    assignedWorker: "",
    dailyProductionMeters: 0,
    ratePerMeter: 35,
    metersPerSaree: 6.5,
  });

  const machineTypes = ["Power Loom", "Hand Loom", "Dyeing Machine", "Finishing Machine", "Quality Control", "Spinning Machine"];
  const workerNames = workersList.map((w) => w.name);

  useEffect(() => {
    if (editingMachine) {
      setNewMachine({
        name: editingMachine.name,
        type: editingMachine.type,
        location: editingMachine.location,
        status: editingMachine.status,
        notes: editingMachine.notes || "",
        sareeType: editingMachine.sareeType || "",
        assignedWorker: editingMachine.assignedWorker || "",
        dailyProductionMeters: editingMachine.dailyProductionMeters,
        ratePerMeter: editingMachine.ratePerMeter,
        metersPerSaree: editingMachine.metersPerSaree,
      });
      setIsAddDialogOpen(true);
    }
  }, [editingMachine]);

  const resetForm = () => {
    setNewMachine({ name: "", type: "", location: "", status: "working", notes: "", sareeType: "", assignedWorker: "", dailyProductionMeters: 0, ratePerMeter: 35, metersPerSaree: 6.5 });
    setEditingMachine(null);
  };

  const filteredMachines = machines.filter((machine) =>
    machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    machine.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    machine.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    machine.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveMachine = () => {
    if (!newMachine.name || !newMachine.type || !newMachine.location) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    const payload: Partial<Machine> = {
      name: newMachine.name,
      type: newMachine.type,
      status: newMachine.status,
      location: newMachine.location,
      notes: newMachine.notes,
      sareeType: newMachine.sareeType,
      assignedWorker: newMachine.assignedWorker,
      dailyProductionMeters: newMachine.dailyProductionMeters,
      weeklyProductionMeters: newMachine.dailyProductionMeters * 6,
      ratePerMeter: newMachine.ratePerMeter,
      metersPerSaree: newMachine.metersPerSaree,
    };
    if (editingMachine) {
      updateMutation.mutate({ id: editingMachine.id, body: payload });
    } else {
      createMutation.mutate({
        ...payload,
        purchaseDate: new Date().toISOString().split("T")[0],
        lastMaintenance: new Date().toISOString().split("T")[0],
        nextMaintenance: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      });
    }
    resetForm();
    setIsAddDialogOpen(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "working": return <Badge className="bg-success text-success-foreground flex items-center gap-1"><CheckCircle className="w-3 h-3" />Working</Badge>;
      case "maintenance": return <Badge className="bg-warning text-warning-foreground flex items-center gap-1"><Wrench className="w-3 h-3" />Maintenance</Badge>;
      case "broken": return <Badge className="bg-destructive text-destructive-foreground flex items-center gap-1"><XCircle className="w-3 h-3" />Broken</Badge>;
      case "idle": return <Badge variant="secondary" className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Idle</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalMachines = machines.length;
  const workingMachines = machines.filter((m) => m.status === "working").length;
  const maintenanceMachines = machines.filter((m) => m.status === "maintenance").length;
  const totalDailyProduction = machines.reduce((sum, m) => sum + m.dailyProductionMeters, 0);
  const totalDailySarees = machines.reduce((sum, m) => sum + (m.metersPerSaree > 0 ? m.dailyProductionMeters / m.metersPerSaree : 0), 0);
  const totalWeeklyWages = machines.reduce((sum, m) => sum + m.weeklyProductionMeters * m.ratePerMeter, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Machine Management</h1>
          <p className="text-muted-foreground mt-1">Monitor and maintain your manufacturing equipment</p>
        </div>
        <Dialog open={canWrite && isAddDialogOpen} onOpenChange={(o) => { if (!canWrite) return; setIsAddDialogOpen(o); if (!o) resetForm(); }}>
          {canWrite && (
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary shadow-manufacturing" onClick={() => resetForm()}><Plus className="w-4 h-4 mr-2" />Add Machine</Button>
            </DialogTrigger>
          )}
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader><DialogTitle>{editingMachine ? "Edit Machine" : "Add New Machine"}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Machine Name *</Label>
                <Input id="name" value={newMachine.name} onChange={(e) => setNewMachine({ ...newMachine, name: e.target.value })} placeholder="Enter machine name" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Machine Type *</Label>
                <Select value={newMachine.type} onValueChange={(value) => setNewMachine({ ...newMachine, type: value })}>
                  <SelectTrigger><SelectValue placeholder="Select machine type" /></SelectTrigger>
                  <SelectContent>{machineTypes.map((type) => (<SelectItem key={type} value={type}>{type}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location *</Label>
                <Input id="location" value={newMachine.location} onChange={(e) => setNewMachine({ ...newMachine, location: e.target.value })} placeholder="e.g., Section A, Floor 2" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Initial Status</Label>
                <Select value={newMachine.status} onValueChange={(value) => setNewMachine({ ...newMachine, status: value as Machine["status"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="working">Working</SelectItem>
                    <SelectItem value="idle">Idle</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sareeType">Saree Type</Label>
                <Select value={newMachine.sareeType} onValueChange={(value) => setNewMachine({ ...newMachine, sareeType: value })}>
                  <SelectTrigger><SelectValue placeholder="Select saree type" /></SelectTrigger>
                  <SelectContent>{sareeTypes.map((type) => (<SelectItem key={type} value={type}>{type}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="worker">Assigned Worker</Label>
                <Select value={newMachine.assignedWorker} onValueChange={(value) => setNewMachine({ ...newMachine, assignedWorker: value })}>
                  <SelectTrigger><SelectValue placeholder="Select worker" /></SelectTrigger>
                  <SelectContent>{workerNames.map((w) => (<SelectItem key={w} value={w}>{w}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="dailyProduction">Daily Production (meters)</Label>
                  <Input id="dailyProduction" type="number" value={newMachine.dailyProductionMeters} onChange={(e) => setNewMachine({ ...newMachine, dailyProductionMeters: Number(e.target.value) })} placeholder="0" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ratePerMeter">Rate per Meter (₹)</Label>
                  <Input id="ratePerMeter" type="number" value={newMachine.ratePerMeter} onChange={(e) => setNewMachine({ ...newMachine, ratePerMeter: Number(e.target.value) })} placeholder="35" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="metersPerSaree">Meters per Saree</Label>
                <Input id="metersPerSaree" type="number" step="0.1" value={newMachine.metersPerSaree} onChange={(e) => setNewMachine({ ...newMachine, metersPerSaree: Number(e.target.value) })} placeholder="6.5" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" value={newMachine.notes} onChange={(e) => setNewMachine({ ...newMachine, notes: e.target.value })} placeholder="Additional notes about the machine" rows={2} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>Cancel</Button>
              <Button onClick={handleSaveMachine}>{editingMachine ? "Update Machine" : "Add Machine"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-card shadow-card border-0"><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-xs font-medium text-muted-foreground">Total Machines</p><p className="text-xl font-bold text-foreground mt-1">{totalMachines}</p></div><div className="p-2 bg-primary/10 rounded-lg"><Settings className="w-5 h-5 text-primary" /></div></div></CardContent></Card>
        <Card className="bg-gradient-card shadow-card border-0"><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-xs font-medium text-muted-foreground">Working</p><p className="text-xl font-bold text-foreground mt-1">{workingMachines}</p></div><div className="p-2 bg-success/10 rounded-lg"><CheckCircle className="w-5 h-5 text-success" /></div></div></CardContent></Card>
        <Card className="bg-gradient-card shadow-card border-0"><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-xs font-medium text-muted-foreground">Maintenance</p><p className="text-xl font-bold text-foreground mt-1">{maintenanceMachines}</p></div><div className="p-2 bg-warning/10 rounded-lg"><Wrench className="w-5 h-5 text-warning" /></div></div></CardContent></Card>
        <Card className="bg-gradient-card shadow-card border-0"><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-xs font-medium text-muted-foreground">Daily Sarees</p><p className="text-xl font-bold text-foreground mt-1">{totalDailySarees.toFixed(1)}</p></div><div className="p-2 bg-accent/10 rounded-lg"><Calendar className="w-5 h-5 text-accent" /></div></div></CardContent></Card>
        <Card className="bg-gradient-card shadow-card border-0"><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-xs font-medium text-muted-foreground">Daily Output</p><p className="text-xl font-bold text-foreground mt-1">{totalDailyProduction}m</p></div><div className="p-2 bg-primary/10 rounded-lg"><Calendar className="w-5 h-5 text-primary" /></div></div></CardContent></Card>
        <Card className="bg-gradient-card shadow-card border-0"><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-xs font-medium text-muted-foreground">Weekly Wages</p><p className="text-xl font-bold text-foreground mt-1">₹{totalWeeklyWages.toLocaleString()}</p></div><div className="p-2 bg-success/10 rounded-lg"><User className="w-5 h-5 text-success" /></div></div></CardContent></Card>
      </div>

      <Card className="bg-gradient-card shadow-card border-0">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input placeholder="Search machines by name, type, ID, or location..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card className="bg-gradient-card shadow-card border-0"><CardContent className="text-center py-12 text-muted-foreground">Loading machines...</CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {filteredMachines.map((machine) => (
            <Card key={machine.id} className="bg-gradient-card shadow-card border-0">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg"><Settings className="w-6 h-6 text-primary" /></div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">{machine.name}</h3>
                        <Badge variant="outline">{machine.id}</Badge>
                        {getStatusBadge(machine.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{machine.type} • {machine.location}</p>
                      {machine.sareeType && (<Badge className="bg-primary/20 text-primary border-0">{machine.sareeType}</Badge>)}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                    {machine.assignedWorker && (
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground"><User className="w-3 h-3" /><span>Worker</span></div>
                        <p className="font-medium text-foreground text-sm">{machine.assignedWorker}</p>
                      </div>
                    )}
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">Daily Output</div>
                      <p className="font-semibold text-foreground">{machine.dailyProductionMeters}m</p>
                      <p className="text-xs text-muted-foreground">{machine.metersPerSaree > 0 ? (machine.dailyProductionMeters / machine.metersPerSaree).toFixed(1) : 0} sarees</p>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">Weekly Output</div>
                      <p className="font-semibold text-foreground">{machine.weeklyProductionMeters}m</p>
                      <p className="text-xs text-muted-foreground">{machine.metersPerSaree > 0 ? (machine.weeklyProductionMeters / machine.metersPerSaree).toFixed(1) : 0} sarees</p>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">Weekly Wage</div>
                      <p className="font-semibold text-success">₹{(machine.weeklyProductionMeters * machine.ratePerMeter).toLocaleString()}</p>
                    </div>
                  </div>
                  {canWrite && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingMachine(machine)}><Edit className="w-4 h-4" /></Button>
                      <Button variant="outline" size="sm" onClick={() => deleteMutation.mutate(machine.id)} className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  )}
                </div>
                {machine.notes && (<p className="text-sm text-muted-foreground italic mt-3 pt-3 border-t border-border">{machine.notes}</p>)}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && filteredMachines.length === 0 && (
        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="p-12 text-center">
            <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Machines Found</h3>
            <p className="text-muted-foreground">No machines match your search criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Machines;
