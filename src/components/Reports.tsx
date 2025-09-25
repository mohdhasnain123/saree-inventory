import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Calendar,
  IndianRupee,
  Package,
  Shirt,
  Users,
  BarChart3,
  PieChart,
  FileText
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell, AreaChart, Area } from "recharts";

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [selectedReport, setSelectedReport] = useState("overview");

  // Mock data for reports
  const monthlyData = [
    { month: "Jan", profit: 45000, sales: 120000, cost: 75000, production: 85 },
    { month: "Feb", profit: 52000, sales: 135000, cost: 83000, production: 92 },
    { month: "Mar", profit: 38000, sales: 110000, cost: 72000, production: 78 },
    { month: "Apr", profit: 61000, sales: 155000, cost: 94000, production: 105 },
    { month: "May", profit: 49000, sales: 128000, cost: 79000, production: 88 },
    { month: "Jun", profit: 67000, sales: 172000, cost: 105000, production: 112 }
  ];

  const quarterlyData = [
    { quarter: "Q1", profit: 135000, sales: 365000, cost: 230000, production: 255 },
    { quarter: "Q2", profit: 177000, sales: 455000, cost: 278000, production: 305 },
    { quarter: "Q3", profit: 198000, sales: 520000, cost: 322000, production: 340 },
    { quarter: "Q4", profit: 156000, sales: 398000, cost: 242000, production: 285 }
  ];

  const productionByType = [
    { name: "Cotton", value: 145, color: "hsl(210 100% 45%)", percentage: 43.4 },
    { name: "Silk", value: 89, color: "hsl(35 90% 55%)", percentage: 26.6 },
    { name: "Georgette", value: 67, color: "hsl(142 70% 45%)", percentage: 20.1 },
    { name: "Chiffon", value: 34, color: "hsl(45 90% 55%)", percentage: 10.2 }
  ];

  const workerProductivity = [
    { month: "Jan", productivity: 85, efficiency: 88 },
    { month: "Feb", productivity: 92, efficiency: 91 },
    { month: "Mar", productivity: 78, efficiency: 82 },
    { month: "Apr", productivity: 105, efficiency: 96 },
    { month: "May", productivity: 88, efficiency: 89 },
    { month: "Jun", productivity: 112, efficiency: 98 }
  ];

  const machineUtilization = [
    { name: "Power Looms", utilization: 95, efficiency: 92 },
    { name: "Dyeing Machines", utilization: 88, efficiency: 85 },
    { name: "Finishing Units", utilization: 75, efficiency: 78 },
    { name: "Quality Control", utilization: 98, efficiency: 96 },
    { name: "Hand Looms", utilization: 70, efficiency: 68 }
  ];

  const getCurrentData = () => {
    return selectedPeriod === "quarterly" ? quarterlyData : monthlyData;
  };

  const kpiData = {
    totalRevenue: "₹8,20,000",
    totalProfit: "₹2,86,000",
    profitMargin: "34.9%",
    totalProduction: "335 pieces",
    averageEfficiency: "91%",
    workerProductivity: "93 pieces/worker"
  };

  const [quickReportDialog, setQuickReportDialog] = useState(false);
  const [selectedQuickReport, setSelectedQuickReport] = useState("");

  const exportReport = (format: string) => {
    // Mock export functionality
    alert(`Exporting ${selectedReport} report as ${format.toUpperCase()}`);
  };

  const handleQuickReportClick = (reportType: string) => {
    setSelectedQuickReport(reportType);
    setQuickReportDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">Comprehensive business insights and performance metrics</p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => exportReport("pdf")}>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => exportReport("csv")}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-lg font-bold text-foreground mt-1">{kpiData.totalRevenue}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-success" />
                  <span className="text-xs text-success">+18%</span>
                </div>
              </div>
              <IndianRupee className="w-4 h-4 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Profit</p>
                <p className="text-lg font-bold text-foreground mt-1">{kpiData.totalProfit}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-success" />
                  <span className="text-xs text-success">+24%</span>
                </div>
              </div>
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Profit Margin</p>
                <p className="text-lg font-bold text-foreground mt-1">{kpiData.profitMargin}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-success" />
                  <span className="text-xs text-success">+3.2%</span>
                </div>
              </div>
              <BarChart3 className="w-4 h-4 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Production</p>
                <p className="text-lg font-bold text-foreground mt-1">{kpiData.totalProduction}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-success" />
                  <span className="text-xs text-success">+8%</span>
                </div>
              </div>
              <Shirt className="w-4 h-4 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Avg Efficiency</p>
                <p className="text-lg font-bold text-foreground mt-1">{kpiData.averageEfficiency}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-success" />
                  <span className="text-xs text-success">+5%</span>
                </div>
              </div>
              <Package className="w-4 h-4 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Productivity</p>
                <p className="text-lg font-bold text-foreground mt-1">{kpiData.workerProductivity}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-success" />
                  <span className="text-xs text-success">+12%</span>
                </div>
              </div>
              <Users className="w-4 h-4 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profit & Sales Trend */}
        <Card className="bg-gradient-card shadow-elevated border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <TrendingUp className="w-5 h-5 text-success" />
              Profit & Sales Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={getCurrentData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis dataKey={selectedPeriod === "quarterly" ? "quarter" : "month"} stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stackId="1"
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary))" 
                  fillOpacity={0.3}
                />
                <Area 
                  type="monotone" 
                  dataKey="profit" 
                  stackId="2"
                  stroke="hsl(var(--success))" 
                  fill="hsl(var(--success))" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Production by Type */}
        <Card className="bg-gradient-card shadow-elevated border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <PieChart className="w-5 h-5 text-primary" />
              Production by Saree Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={productionByType}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {productionByType.map((entry, index) => (
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
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {productionByType.map((type, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }}></div>
                    <span className="text-sm text-foreground">{type.name}</span>
                  </div>
                  <Badge variant="outline">{type.percentage}%</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Worker Productivity & Machine Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Worker Productivity */}
        <Card className="bg-gradient-card shadow-elevated border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Users className="w-5 h-5 text-accent" />
              Worker Productivity Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={workerProductivity}>
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
                <Line 
                  type="monotone" 
                  dataKey="productivity" 
                  stroke="hsl(var(--accent))" 
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--accent))", strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="efficiency" 
                  stroke="hsl(var(--success))" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: "hsl(var(--success))", strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Machine Utilization */}
        <Card className="bg-gradient-card shadow-elevated border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <BarChart3 className="w-5 h-5 text-warning" />
              Machine Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {machineUtilization.map((machine, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-foreground">{machine.name}</span>
                    <div className="flex gap-4 text-sm">
                      <span className="text-muted-foreground">Util: {machine.utilization}%</span>
                      <span className="text-muted-foreground">Eff: {machine.efficiency}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-secondary/30 rounded-full h-2">
                    <div 
                      className="bg-gradient-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${machine.utilization}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Reports */}
      <Card className="bg-gradient-card shadow-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <FileText className="w-5 h-5 text-primary" />
            Quick Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => handleQuickReportClick("Financial Report")}
            >
              <IndianRupee className="w-6 h-6 text-success" />
              <div className="text-center">
                <div className="font-medium">Financial Report</div>
                <div className="text-xs text-muted-foreground">Revenue, costs, profit</div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => handleQuickReportClick("Production Report")}
            >
              <Shirt className="w-6 h-6 text-primary" />
              <div className="text-center">
                <div className="font-medium">Production Report</div>
                <div className="text-xs text-muted-foreground">Output, efficiency</div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => handleQuickReportClick("HR Report")}
            >
              <Users className="w-6 h-6 text-accent" />
              <div className="text-center">
                <div className="font-medium">HR Report</div>
                <div className="text-xs text-muted-foreground">Worker performance</div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => handleQuickReportClick("Inventory Report")}
            >
              <Package className="w-6 h-6 text-warning" />
              <div className="text-center">
                <div className="font-medium">Inventory Report</div>
                <div className="text-xs text-muted-foreground">Stock levels, usage</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Report Dialog */}
      <Dialog open={quickReportDialog} onOpenChange={setQuickReportDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              {selectedQuickReport}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              {selectedQuickReport === "Financial Report" && "Detailed financial analysis including revenue, costs, and profit margins for the selected period."}
              {selectedQuickReport === "Production Report" && "Comprehensive production metrics including output, efficiency, and quality control data."}
              {selectedQuickReport === "HR Report" && "Worker performance analysis including productivity, attendance, and efficiency metrics."}
              {selectedQuickReport === "Inventory Report" && "Complete inventory overview including stock levels, material usage, and reorder requirements."}
            </p>
            <div className="flex gap-3">
              <Button className="flex-1" onClick={() => exportReport("pdf")}>
                <Download className="w-4 h-4 mr-2" />
                Generate PDF
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => exportReport("csv")}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reports;