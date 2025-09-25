import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  UserCheck,
  UserX,
  IndianRupee,
  Clock,
  Award
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Worker {
  id: string;
  name: string;
  role: string;
  dailyWage: number;
  status: 'active' | 'inactive' | 'on-leave';
  phone: string;
  experience: number;
  attendance: number;
  joinDate: string;
}

const Workers = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);

  const [workers, setWorkers] = useState<Worker[]>([
    {
      id: "WKR001",
      name: "Rajesh Kumar",
      role: "Master Weaver",
      dailyWage: 800,
      status: "active",
      phone: "+91 98765 43210",
      experience: 15,
      attendance: 95,
      joinDate: "2020-01-15"
    },
    {
      id: "WKR002", 
      name: "Priya Sharma",
      role: "Dyer",
      dailyWage: 650,
      status: "active",
      phone: "+91 98765 43211",
      experience: 8,
      attendance: 92,
      joinDate: "2021-03-20"
    },
    {
      id: "WKR003",
      name: "Amit Singh",
      role: "Finisher",
      dailyWage: 600,
      status: "on-leave",
      phone: "+91 98765 43212",
      experience: 6,
      attendance: 88,
      joinDate: "2022-06-10"
    },
    {
      id: "WKR004",
      name: "Lakshmi Devi",
      role: "Quality Inspector",
      dailyWage: 700,
      status: "active",
      phone: "+91 98765 43213",
      experience: 12,
      attendance: 96,
      joinDate: "2019-08-05"
    }
  ]);

  const [newWorker, setNewWorker] = useState({
    name: "",
    role: "",
    dailyWage: "",
    phone: "",
    experience: "",
    status: "active" as const
  });

  const roles = ["Master Weaver", "Weaver", "Dyer", "Finisher", "Quality Inspector", "Helper", "Supervisor"];

  const filteredWorkers = workers.filter(worker =>
    worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddWorker = () => {
    if (!newWorker.name || !newWorker.role || !newWorker.dailyWage) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const worker: Worker = {
      id: `WKR${String(workers.length + 1).padStart(3, '0')}`,
      name: newWorker.name,
      role: newWorker.role,
      dailyWage: parseInt(newWorker.dailyWage),
      status: newWorker.status,
      phone: newWorker.phone,
      experience: parseInt(newWorker.experience) || 0,
      attendance: 100,
      joinDate: new Date().toISOString().split('T')[0],
    };

    setWorkers([...workers, worker]);
    setNewWorker({ name: "", role: "", dailyWage: "", phone: "", experience: "", status: "active" });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Worker added successfully",
    });
  };

  const handleDeleteWorker = (id: string) => {
    setWorkers(workers.filter(worker => worker.id !== id));
    toast({
      title: "Success",
      description: "Worker removed successfully",
    });
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active':
        return <Badge className="bg-success text-success-foreground">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'on-leave':
        return <Badge className="bg-warning text-warning-foreground">On Leave</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalWorkers = workers.length;
  const activeWorkers = workers.filter(w => w.status === 'active').length;
  const avgWage = Math.round(workers.reduce((sum, w) => sum + w.dailyWage, 0) / workers.length);
  const avgAttendance = Math.round(workers.reduce((sum, w) => sum + w.attendance, 0) / workers.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Workers Management</h1>
          <p className="text-muted-foreground mt-1">Manage your workforce and track performance</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary shadow-manufacturing">
              <Plus className="w-4 h-4 mr-2" />
              Add Worker
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Worker</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={newWorker.name}
                  onChange={(e) => setNewWorker({...newWorker, name: e.target.value})}
                  placeholder="Enter worker's full name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role *</Label>
                <Select value={newWorker.role} onValueChange={(value) => setNewWorker({...newWorker, role: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(role => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="wage">Daily Wage (₹) *</Label>
                <Input
                  id="wage"
                  type="number"
                  value={newWorker.dailyWage}
                  onChange={(e) => setNewWorker({...newWorker, dailyWage: e.target.value})}
                  placeholder="Enter daily wage"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newWorker.phone}
                  onChange={(e) => setNewWorker({...newWorker, phone: e.target.value})}
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="experience">Experience (Years)</Label>
                <Input
                  id="experience"
                  type="number"
                  value={newWorker.experience}
                  onChange={(e) => setNewWorker({...newWorker, experience: e.target.value})}
                  placeholder="Years of experience"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddWorker}>Add Worker</Button>
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
                <p className="text-sm font-medium text-muted-foreground">Total Workers</p>
                <p className="text-2xl font-bold text-foreground mt-1">{totalWorkers}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Workers</p>
                <p className="text-2xl font-bold text-foreground mt-1">{activeWorkers}</p>
              </div>
              <div className="p-3 bg-success/10 rounded-lg">
                <UserCheck className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Daily Wage</p>
                <p className="text-2xl font-bold text-foreground mt-1">₹{avgWage}</p>
              </div>
              <div className="p-3 bg-accent/10 rounded-lg">
                <IndianRupee className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Attendance</p>
                <p className="text-2xl font-bold text-foreground mt-1">{avgAttendance}%</p>
              </div>
              <div className="p-3 bg-warning/10 rounded-lg">
                <Award className="w-6 h-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="bg-gradient-card shadow-card border-0">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search workers by name, role, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workers List */}
      <div className="grid gap-4">
        {filteredWorkers.map((worker) => (
          <Card key={worker.id} className="bg-gradient-card shadow-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-foreground">{worker.name}</h3>
                      <Badge variant="outline">{worker.id}</Badge>
                      {getStatusBadge(worker.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{worker.role}</p>
                    <p className="text-sm text-muted-foreground">{worker.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <IndianRupee className="w-4 h-4" />
                      <span>Daily Wage</span>
                    </div>
                    <p className="font-semibold text-foreground">₹{worker.dailyWage}</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>Experience</span>
                    </div>
                    <p className="font-semibold text-foreground">{worker.experience} years</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Award className="w-4 h-4" />
                      <span>Attendance</span>
                    </div>
                    <p className="font-semibold text-foreground">{worker.attendance}%</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDeleteWorker(worker.id)}
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

      {filteredWorkers.length === 0 && (
        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="p-12 text-center">
            <UserX className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Workers Found</h3>
            <p className="text-muted-foreground">No workers match your search criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Workers;