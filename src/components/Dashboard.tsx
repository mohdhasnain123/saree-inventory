import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  ShoppingCart
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { useState } from "react";
import SettingsDialog from "./SettingsDialog";
import NewProductionDialog from "./NewProductionDialog";

const Dashboard = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProductionOpen, setIsProductionOpen] = useState(false);

  // Mock data for demonstration
  const monthlyData = [
    { month: "Jan", profit: 45000, sales: 120000, cost: 75000 },
    { month: "Feb", profit: 52000, sales: 135000, cost: 83000 },
    { month: "Mar", profit: 38000, sales: 110000, cost: 72000 },
    { month: "Apr", profit: 61000, sales: 155000, cost: 94000 },
    { month: "May", profit: 49000, sales: 128000, cost: 79000 },
    { month: "Jun", profit: 67000, sales: 172000, cost: 105000 }
  ];

  const sareeTypes = [
    { name: "Cotton", value: 145, color: "hsl(210 100% 45%)" },
    { name: "Silk", value: 89, color: "hsl(35 90% 55%)" },
    { name: "Georgette", value: 67, color: "hsl(142 70% 45%)" },
    { name: "Chiffon", value: 34, color: "hsl(45 90% 55%)" }
  ];

  const stats = [
    {
      title: "Total Raw Materials",
      value: "2,847",
      unit: "kg",
      icon: Package,
      trend: "+12%",
      trending: "up"
    },
    {
      title: "Sarees in Stock", 
      value: "335",
      unit: "pieces",
      icon: Shirt,
      trend: "+8%",
      trending: "up"
    },
    {
      title: "Active Workers",
      value: "47",
      unit: "people",
      icon: Users,
      trend: "+2%",
      trending: "up"
    },
    {
      title: "Monthly Revenue",
      value: "₹1,72,000",
      unit: "",
      icon: IndianRupee,
      trend: "+18%", 
      trending: "up"
    }
  ];

  const recentSales = [
    { id: "SAR001", type: "Silk", quantity: 3, amount: 15000, customer: "Priya Textiles" },
    { id: "SAR002", type: "Cotton", quantity: 5, amount: 8500, customer: "Meera Boutique" },
    { id: "SAR003", type: "Georgette", quantity: 2, amount: 12000, customer: "Lakshmi Stores" },
    { id: "SAR004", type: "Chiffon", quantity: 4, amount: 9600, customer: "Radha Fashion" }
  ];

  return (
    <div className="min-h-screen bg-gradient-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Saree Manufacturing Dashboard</h1>
          <p className="text-muted-foreground mt-1">Monitor your production, inventory, and sales performance</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="shadow-card" onClick={() => setIsSettingsOpen(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button className="bg-gradient-primary shadow-manufacturing" onClick={() => setIsProductionOpen(true)}>
            <Factory className="w-4 h-4 mr-2" />
            New Production
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
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
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profit Chart */}
        <Card className="bg-gradient-card shadow-elevated border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <TrendingUp className="w-5 h-5 text-success" />
              Monthly Profit Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }} 
                />
                <Bar dataKey="profit" fill="hsl(var(--success))" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Saree Types Distribution */}
        <Card className="bg-gradient-card shadow-elevated border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Shirt className="w-5 h-5 text-primary" />
              Saree Types in Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sareeTypes}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sareeTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-4">
              {sareeTypes.map((type, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }}></div>
                  <span className="text-sm text-muted-foreground">{type.name} ({type.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sales */}
      <Card className="bg-gradient-card shadow-elevated border-0">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <ShoppingCart className="w-5 h-5 text-accent" />
            Recent Sales
          </CardTitle>
          <Button variant="outline" size="sm">View All</Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentSales.map((sale, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Shirt className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{sale.id} - {sale.type}</p>
                    <p className="text-sm text-muted-foreground">{sale.customer}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">₹{sale.amount.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">{sale.quantity} pieces</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
      <NewProductionDialog open={isProductionOpen} onOpenChange={setIsProductionOpen} />
    </div>
  );
};

export default Dashboard;