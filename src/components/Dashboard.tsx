import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Package,
  Users,
  Settings,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Factory,
  Shirt,
  ShoppingCart,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useState } from "react";
import SettingsDialog from "./SettingsDialog";
import NewProductionDialog from "./NewProductionDialog";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { AlertTriangle } from "lucide-react";

interface DashboardData {
  stats: {
    totalMaterialsKg: number;
    totalYarnMeters: number;
    totalSareesInStock: number;
    activeWorkers: number;
    monthlyRevenue: number;
    totalMachines: number;
  };
  monthlyData: { month: string; sales: number; cost: number; profit: number }[];
  sareeTypes: { name: string; value: number; color: string }[];
  recentSales: {
    id: string;
    type: string;
    quantity: number;
    amount: number;
    customer: string;
  }[];
}

interface MaterialLite { id: string; name: string; status: string; }
interface SareeLite { id: string; design: string; status: string; }

const Dashboard = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProductionOpen, setIsProductionOpen] = useState(false);
  const { canWrite, isAdmin } = useAuth();
  const { formatMoney, notifyEnabled } = useSettings();

  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: () => api.get<DashboardData>("/dashboard"),
  });

  const { data: materialsLite = [] } = useQuery<MaterialLite[]>({
    queryKey: ["materials"],
    queryFn: () => api.get<MaterialLite[]>("/materials"),
    enabled: notifyEnabled("lowStock"),
  });
  const { data: sareesLite = [] } = useQuery<SareeLite[]>({
    queryKey: ["sarees"],
    queryFn: () => api.get<SareeLite[]>("/sarees"),
    enabled: notifyEnabled("lowStock"),
  });

  const lowStockMaterials = materialsLite.filter(
    (m) => m.status === "low-stock" || m.status === "out-of-stock"
  );
  const lowStockSarees = sareesLite.filter(
    (s) => s.status === "low-stock" || s.status === "out-of-stock"
  );
  const showLowStockBanner =
    notifyEnabled("lowStock") && (lowStockMaterials.length > 0 || lowStockSarees.length > 0);

  const stats = data
    ? [
        { title: "Total Raw Materials", value: data.stats.totalMaterialsKg.toLocaleString(), unit: "kg", icon: Package, trend: "", trending: "up" },
        { title: "Yarn Length (Warp + Weft)", value: data.stats.totalYarnMeters.toLocaleString(), unit: "meters", icon: Package, trend: "", trending: "up" },
        { title: "Sarees in Stock", value: String(data.stats.totalSareesInStock), unit: "pieces", icon: Shirt, trend: "", trending: "up" },
        { title: "Active Workers", value: String(data.stats.activeWorkers), unit: "people", icon: Users, trend: "", trending: "up" },
        { title: "Monthly Revenue", value: formatMoney(data.stats.monthlyRevenue), unit: "", icon: IndianRupee, trend: "", trending: "up" },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gradient-background p-4 sm:p-6 space-y-6 min-w-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 pl-12 lg:pl-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground break-words">Saree Manufacturing Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Monitor your production, inventory, and sales performance
          </p>
        </div>
        {canWrite && (
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {isAdmin && (
              <Button variant="outline" size="sm" className="shadow-card" onClick={() => setIsSettingsOpen(true)}>
                <Settings className="w-4 h-4 mr-2" /> Settings
              </Button>
            )}
            <Button size="sm" className="bg-gradient-primary shadow-manufacturing" onClick={() => setIsProductionOpen(true)}>
              <Factory className="w-4 h-4 mr-2" /> New Production
            </Button>
          </div>
        )}
      </div>

      {showLowStockBanner && (
        <Card className="border-warning/40 bg-warning/10">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-foreground">Low stock alert</p>
              <p className="text-muted-foreground mt-1">
                {lowStockMaterials.length} raw material{lowStockMaterials.length === 1 ? "" : "s"} and{" "}
                {lowStockSarees.length} saree design{lowStockSarees.length === 1 ? "" : "s"} are at or below threshold.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading || !data ? (
        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="text-center py-12 text-muted-foreground">Loading dashboard...</CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-gradient-card shadow-card border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <div className="flex items-baseline gap-2 mt-2">
                        <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
                        {stat.unit && <span className="text-sm text-muted-foreground">{stat.unit}</span>}
                      </div>
                      {stat.trend && (
                        <div className="flex items-center gap-1 mt-2">
                          {stat.trending === "up" ? (
                            <TrendingUp className="w-4 h-4 text-success" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-destructive" />
                          )}
                          <span className={`text-sm font-medium ${stat.trending === "up" ? "text-success" : "text-destructive"}`}>
                            {stat.trend}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <stat.icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-card shadow-elevated border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <TrendingUp className="w-5 h-5 text-success" />
                  Monthly Profit Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                    <Bar dataKey="profit" fill="hsl(var(--success))" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-elevated border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Shirt className="w-5 h-5 text-primary" /> Saree Types in Stock
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={data.sareeTypes} cx="50%" cy="50%" innerRadius={60} outerRadius={120} paddingAngle={5} dataKey="value">
                      {data.sareeTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 mt-4">
                  {data.sareeTypes.map((type, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }}></div>
                      <span className="text-sm text-muted-foreground">{type.name} ({type.value})</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-card shadow-elevated border-0">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <ShoppingCart className="w-5 h-5 text-accent" /> Recent Sales
              </CardTitle>
              <Button variant="outline" size="sm">View All</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.recentSales.map((sale, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg"><Shirt className="w-4 h-4 text-primary" /></div>
                      <div>
                        <p className="font-medium text-foreground">{sale.id} - {sale.type}</p>
                        <p className="text-sm text-muted-foreground">{sale.customer}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">{formatMoney(sale.amount)}</p>
                      <p className="text-sm text-muted-foreground">{sale.quantity} pieces</p>
                    </div>
                  </div>
                ))}
                {data.recentSales.length === 0 && (
                  <p className="text-center text-muted-foreground py-6">No sales yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
      <NewProductionDialog open={isProductionOpen} onOpenChange={setIsProductionOpen} />
    </div>
  );
};

export default Dashboard;
