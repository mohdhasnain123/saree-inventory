import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Settings, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  CheckCircle,
  AlertTriangle,
  XCircle,
  Wrench,
  Calendar,
  User
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Machine {
  id: string;
  name: string;
  type: string;
  status: 'working' | 'maintenance' | 'broken' | 'idle';
  assignedWorker?: string;
  location: string;
  purchaseDate: string;
  lastMaintenance: string;
  nextMaintenance: string;
  efficiency: number;
  notes?: string;
}

const Machines = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);

  const [machines, setMachines] = useState<Machine[]>([
    {
      id: "MCH001",
      name: "Power Loom Alpha",
      type: "Power Loom",
      status: "working",
      assignedWorker: "Rajesh Kumar",
      location: "Section A",
      purchaseDate: "2022-01-15",
      lastMaintenance: "2024-01-15",
      nextMaintenance: "2024-04-15",
      efficiency: 95,
      notes: "Primary silk weaving loom"
    },
    {
      id: "MCH002",
      name: "Dye Machine Beta",
      type: "Dyeing Machine",
      status: "working",
      assignedWorker: "Priya Sharma",
      location: "Section B", 
      purchaseDate: "2021-08-10",
      lastMaintenance: "2024-02-01",
      nextMaintenance: "2024-05-01",
      efficiency: 88,
      notes: "For cotton and silk dyeing"
    },
    {
      id: "MCH003",
      name: "Finishing Unit Gamma",
      type: "Finishing Machine",
      status: "maintenance",
      assignedWorker: "Amit Singh",
      location: "Section C",
      purchaseDate: "2023-03-20",
      lastMaintenance: "2024-02-20",
      nextMaintenance: "2024-03-20",
      efficiency: 75,
      notes: "Under scheduled maintenance"
    },
    {
      id: "MCH004",
      name: "Quality Check Delta",
      type: "Quality Control",
      status: "working",
      assignedWorker: "Lakshmi Devi",
      location: "QC Section",
      purchaseDate: "2022-11-05",
      lastMaintenance: "2024-01-10",
      nextMaintenance: "2024-04-10",
      efficiency: 98,
      notes: "Automated quality inspection"
    },
    {
      id: "MCH005",
      name: "Hand Loom Classic",
      type: "Hand Loom",
      status: "idle",
      location: "Section D",
      purchaseDate: "2020-05-12",
      lastMaintenance: "2023-12-15",
      nextMaintenance: "2024-03-15",
      efficiency: 70,
      notes: "Traditional hand weaving"
    }
  ]);

  const [newMachine, setNewMachine] = useState({
    name: "",
    type: "",
    location: "",
    status: "working" as const,
    notes: ""
  });

  const machineTypes = ["Power Loom", "Hand Loom", "Dyeing Machine", "Finishing Machine", "Quality Control", "Spinning Machine"];

  const filteredMachines = machines.filter(machine =>
    machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    machine.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    machine.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    machine.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddMachine = () => {
    if (!newMachine.name || !newMachine.type || !newMachine.location) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const machine: Machine = {
      id: `MCH${String(machines.length + 1).padStart(3, '0')}`,
      name: newMachine.name,
      type: newMachine.type,
      status: newMachine.status,
      location: newMachine.location,
      purchaseDate: new Date().toISOString().split('T')[0],
      lastMaintenance: new Date().toISOString().split('T')[0],
      nextMaintenance: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      efficiency: 100,
      notes: newMachine.notes,
    };

    setMachines([...machines, machine]);
    setNewMachine({ name: "", type: "", location: "", status: "working", notes: "" });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Machine added successfully",
    });
  };

  const handleDeleteMachine = (id: string) => {
    setMachines(machines.filter(machine => machine.id !== id));
    toast({
      title: "Success",
      description: "Machine removed successfully",
    });
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'working':
        return <Badge className="bg-success text-success-foreground flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Working
        </Badge>;
      case 'maintenance':
        return <Badge className="bg-warning text-warning-foreground flex items-center gap-1">
          <Wrench className="w-3 h-3" />
          Maintenance
        </Badge>;
      case 'broken':
        return <Badge className="bg-destructive text-destructive-foreground flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          Broken
        </Badge>;
      case 'idle':
        return <Badge variant="secondary" className="flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Idle
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalMachines = machines.length;
  const workingMachines = machines.filter(m => m.status === 'working').length;
  const maintenanceMachines = machines.filter(m => m.status === 'maintenance').length;
  const avgEfficiency = Math.round(machines.reduce((sum, m) => sum + m.efficiency, 0) / machines.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Machine Management</h1>
          <p className="text-muted-foreground mt-1">Monitor and maintain your manufacturing equipment</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary shadow-manufacturing">
              <Plus className="w-4 h-4 mr-2" />
              Add Machine
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Machine</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Machine Name *</Label>
                <Input
                  id="name"
                  value={newMachine.name}
                  onChange={(e) => setNewMachine({...newMachine, name: e.target.value})}
                  placeholder="Enter machine name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Machine Type *</Label>
                <Select value={newMachine.type} onValueChange={(value) => setNewMachine({...newMachine, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select machine type" />
                  </SelectTrigger>
                  <SelectContent>
                    {machineTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={newMachine.location}
                  onChange={(e) => setNewMachine({...newMachine, location: e.target.value})}
                  placeholder="e.g., Section A, Floor 2"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Initial Status</Label>
                <Select value={newMachine.status} onValueChange={(value: any) => setNewMachine({...newMachine, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="working">Working</SelectItem>
                    <SelectItem value="idle">Idle</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newMachine.notes}
                  onChange={(e) => setNewMachine({...newMachine, notes: e.target.value})}
                  placeholder="Additional notes about the machine"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddMachine}>Add Machine</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Machines</p>
                <p className="text-2xl font-bold text-foreground mt-1">{totalMachines}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <Settings className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Working</p>
                <p className="text-2xl font-bold text-foreground mt-1">{workingMachines}</p>
              </div>
              <div className="p-3 bg-success/10 rounded-lg">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Maintenance</p>
                <p className="text-2xl font-bold text-foreground mt-1">{maintenanceMachines}</p>
              </div>
              <div className="p-3 bg-warning/10 rounded-lg">
                <Wrench className="w-6 h-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Efficiency</p>
                <p className="text-2xl font-bold text-foreground mt-1">{avgEfficiency}%</p>
              </div>
              <div className="p-3 bg-accent/10 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="bg-gradient-card shadow-card border-0">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search machines by name, type, ID, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Machines List */}
      <div className="grid gap-4">
        {filteredMachines.map((machine) => (
          <Card key={machine.id} className="bg-gradient-card shadow-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Settings className="w-6 h-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-foreground">{machine.name}</h3>
                      <Badge variant="outline">{machine.id}</Badge>
                      {getStatusBadge(machine.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{machine.type} • {machine.location}</p>
                    {machine.assignedWorker && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <User className="w-3 h-3" />
                        <span>Assigned to: {machine.assignedWorker}</span>
                      </div>
                    )}
                    {machine.notes && (
                      <p className="text-sm text-muted-foreground italic">{machine.notes}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Efficiency</div>
                    <p className="font-semibold text-foreground">{machine.efficiency}%</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>Next Service</span>
                    </div>
                    <p className="font-semibold text-foreground">{new Date(machine.nextMaintenance).toLocaleDateString()}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDeleteMachine(machine.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMachines.length === 0 && (
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