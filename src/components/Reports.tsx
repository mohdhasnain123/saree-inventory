import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  TrendingUp,
  Download,
  IndianRupee,
  Package,
  Shirt,
  Users,
  BarChart3,
  PieChart,
  FileText,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { api } from "@/lib/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useToast } from "@/hooks/use-toast";

interface ReportData {
  period: string;
  year: number;
  availableYears: number[];
  monthlyData: { month: string; sales: number; cost: number; profit: number; production: number }[];
  quarterlyData: { quarter: string; sales: number; cost: number; profit: number; production: number }[];
  yearlyData: { year: string; sales: number; cost: number; profit: number; production: number }[];
  productionByType: { name: string; value: number; color: string; percentage: number }[];
  machineUtilization: { name: string; utilization: number; efficiency: number }[];
  workerProductivity: { month: string; productivity: number; efficiency: number }[];
  kpi: {
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
    profitMargin: number;
    totalProduction: number;
    totalSubmitted: number;
    averageEfficiency: number;
    workerProductivity: number;
  };
}

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<"monthly" | "quarterly" | "yearly">(
    "monthly"
  );
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedReport] = useState("overview");
  const { toast } = useToast();

  const { data, isLoading } = useQuery<ReportData>({
    queryKey: ["reports", selectedPeriod, selectedYear],
    queryFn: () =>
      api.get<ReportData>(
        `/reports?period=${selectedPeriod}&year=${selectedYear}`
      ),
  });

  const [quickReportDialog, setQuickReportDialog] = useState(false);
  const [selectedQuickReport, setSelectedQuickReport] = useState("");

  const downloadFile = (filename: string, content: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toCSV = (rows: (string | number)[][]) =>
    rows
      .map((r) =>
        r
          .map((v) => {
            const s = String(v ?? "");
            return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
          })
          .join(","),
      )
      .join("\n");

  const getReportRows = (reportType: string): { title: string; rows: (string | number)[][] } => {
    if (!data) return { title: reportType, rows: [] };
    switch (reportType) {
      case "Financial Report":
        return {
          title: "Financial Report",
          rows: [
            [periodLabel, "Sales", "Cost", "Profit"],
            ...currentData.map((d: any) => [d[xKey], d.sales, d.cost, d.profit]),
            ["Total", data.kpi.totalRevenue, data.kpi.totalCost, data.kpi.totalProfit],
          ],
        };
      case "Production Report":
        return {
          title: "Production Report",
          rows: [
            [periodLabel, "Production"],
            ...currentData.map((d: any) => [d[xKey], d.production]),
            ["Total", "", data.kpi.totalProduction],
          ],
        };
      case "HR Report":
        return {
          title: "HR Report",
          rows: [
            ["Month", "Productivity", "Efficiency"],
            ...data.workerProductivity.map((w) => [w.month, w.productivity, w.efficiency]),
          ],
        };
      case "Inventory Report":
        return {
          title: "Inventory Report",
          rows: [
            ["Saree Type", "Quantity", "Percentage"],
            ...data.productionByType.map((p) => [p.name, p.value, `${p.percentage}%`]),
          ],
        };
      default:
        return {
          title: "Overview Report",
          rows: [
            ["Metric", "Value"],
            ["Total Revenue", data.kpi.totalRevenue],
            ["Total Cost", data.kpi.totalCost],
            ["Total Profit", data.kpi.totalProfit],
            ["Profit Margin %", data.kpi.profitMargin],
            ["Total Production", data.kpi.totalProduction],
            ["Total Submitted", data.kpi.totalSubmitted],
            ["Average Efficiency %", data.kpi.averageEfficiency],
            ["Worker Productivity", data.kpi.workerProductivity],
          ],
        };
    }
  };

  const exportReport = (format: string, reportType?: string) => {
    if (!data) return;
    const { title, rows } = getReportRows(reportType || "Overview Report");
    const safeName = title.replace(/\s+/g, "_");
    const fileSuffix =
      selectedPeriod === "yearly"
        ? "yearly"
        : `${selectedPeriod}_${selectedYear}`;
    if (format === "csv") {
      downloadFile(`${safeName}_${fileSuffix}.csv`, toCSV(rows), "text/csv;charset=utf-8;");
    } else {
      const doc = new jsPDF();
      doc.setFillColor(37, 99, 235);
      doc.rect(0, 0, 210, 25, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.text("Saree Manufacturing Co.", 14, 12);
      doc.setFontSize(11);
      doc.text(title, 14, 20);
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      const periodText =
        selectedPeriod === "yearly"
          ? "Period: Yearly (last 5 years)"
          : `Period: ${selectedPeriod} (${selectedYear})`;
      doc.text(periodText, 14, 33);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 39);
      autoTable(doc, {
        startY: 45,
        head: [rows[0].map(String)],
        body: rows.slice(1).map((r) => r.map(String)),
        headStyles: { fillColor: [37, 99, 235] },
        styles: { fontSize: 9 },
      });
      doc.save(`${safeName}_${fileSuffix}.pdf`);
    }
    toast({ title: "Downloaded", description: `${title} (${format.toUpperCase()})` });
  };

  const handleQuickReportClick = (reportType: string) => {
    setSelectedQuickReport(reportType);
    setQuickReportDialog(true);
  };

  if (isLoading || !data) {
    return (
      <Card className="bg-gradient-card shadow-card border-0">
        <CardContent className="text-center py-12 text-muted-foreground">Loading reports...</CardContent>
      </Card>
    );
  }

  const currentData =
    selectedPeriod === "quarterly"
      ? data.quarterlyData
      : selectedPeriod === "yearly"
      ? data.yearlyData
      : data.monthlyData;
  const xKey =
    selectedPeriod === "quarterly"
      ? "quarter"
      : selectedPeriod === "yearly"
      ? "year"
      : "month";
  const periodLabel =
    selectedPeriod === "quarterly"
      ? "Quarter"
      : selectedPeriod === "yearly"
      ? "Year"
      : "Month";

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from(
    new Set([
      ...(data.availableYears || []),
      currentYear,
      currentYear - 1,
      currentYear - 2,
      currentYear - 3,
      currentYear - 4,
    ])
  ).sort((a, b) => b - a);

  const kpiData = {
    totalRevenue: `₹${data.kpi.totalRevenue.toLocaleString()}`,
    totalProfit: `₹${data.kpi.totalProfit.toLocaleString()}`,
    profitMargin: `${data.kpi.profitMargin}%`,
    totalProduction: `${data.kpi.totalProduction} pieces`,
    averageEfficiency: `${data.kpi.averageEfficiency}%`,
    workerProductivity: `${data.kpi.workerProductivity} pieces/worker`,
  };

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 pl-12 lg:pl-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground break-words">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Comprehensive business insights and performance metrics</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Select
            value={selectedPeriod}
            onValueChange={(v) =>
              setSelectedPeriod(v as "monthly" | "quarterly" | "yearly")
            }
          >
            <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          {selectedPeriod !== "yearly" && (
            <Select
              value={String(selectedYear)}
              onValueChange={(v) => setSelectedYear(parseInt(v, 10))}
            >
              <SelectTrigger className="w-[110px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button variant="outline" size="sm" onClick={() => exportReport("pdf")}><Download className="w-4 h-4 mr-2" />Export PDF</Button>
          <Button variant="outline" size="sm" onClick={() => exportReport("csv")}><Download className="w-4 h-4 mr-2" />Export CSV</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Total Revenue", value: kpiData.totalRevenue, icon: IndianRupee, color: "text-primary" },
          { label: "Total Profit", value: kpiData.totalProfit, icon: TrendingUp, color: "text-success" },
          { label: "Profit Margin", value: kpiData.profitMargin, icon: BarChart3, color: "text-accent" },
          { label: "Production", value: kpiData.totalProduction, icon: Shirt, color: "text-primary" },
          { label: "Avg Efficiency", value: kpiData.averageEfficiency, icon: Package, color: "text-warning" },
          { label: "Productivity", value: kpiData.workerProductivity, icon: Users, color: "text-accent" },
        ].map((k, i) => (
          <Card key={i} className="bg-gradient-card shadow-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{k.label}</p>
                  <p className="text-lg font-bold text-foreground mt-1">{k.value}</p>
                </div>
                <k.icon className={`w-4 h-4 ${k.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-card shadow-elevated border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <TrendingUp className="w-5 h-5 text-success" /> Profit & Sales Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={currentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis dataKey={xKey} stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                <Area type="monotone" dataKey="sales" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                <Area type="monotone" dataKey="profit" stackId="2" stroke="hsl(var(--success))" fill="hsl(var(--success))" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-elevated border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <PieChart className="w-5 h-5 text-primary" /> Production by Saree Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie data={data.productionByType} cx="50%" cy="50%" innerRadius={60} outerRadius={120} paddingAngle={5} dataKey="value">
                  {data.productionByType.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {data.productionByType.map((type, index) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-card shadow-elevated border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground"><Users className="w-5 h-5 text-accent" /> Worker Productivity Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.workerProductivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                <Line type="monotone" dataKey="productivity" stroke="hsl(var(--accent))" strokeWidth={3} dot={{ fill: "hsl(var(--accent))", strokeWidth: 2, r: 4 }} />
                <Line type="monotone" dataKey="efficiency" stroke="hsl(var(--success))" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: "hsl(var(--success))", strokeWidth: 2, r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-elevated border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground"><BarChart3 className="w-5 h-5 text-warning" /> Machine Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.machineUtilization.map((machine, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-foreground">{machine.name}</span>
                    <div className="flex gap-4 text-sm">
                      <span className="text-muted-foreground">Util: {machine.utilization}%</span>
                      <span className="text-muted-foreground">Eff: {machine.efficiency}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-secondary/30 rounded-full h-2">
                    <div className="bg-gradient-primary h-2 rounded-full transition-all duration-300" style={{ width: `${machine.utilization}%` }}></div>
                  </div>
                </div>
              ))}
              {data.machineUtilization.length === 0 && (
                <p className="text-center text-muted-foreground py-6">No machine data available.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-card shadow-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground"><FileText className="w-5 h-5 text-primary" /> Quick Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { type: "Financial Report", icon: IndianRupee, color: "text-success", desc: "Revenue, costs, profit" },
              { type: "Production Report", icon: Shirt, color: "text-primary", desc: "Output, efficiency" },
              { type: "HR Report", icon: Users, color: "text-accent", desc: "Worker performance" },
              { type: "Inventory Report", icon: Package, color: "text-warning", desc: "Stock levels, usage" },
            ].map((q) => (
              <Button key={q.type} variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" onClick={() => handleQuickReportClick(q.type)}>
                <q.icon className={`w-6 h-6 ${q.color}`} />
                <div className="text-center">
                  <div className="font-medium">{q.type}</div>
                  <div className="text-xs text-muted-foreground">{q.desc}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={quickReportDialog} onOpenChange={setQuickReportDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><FileText className="w-5 h-5 text-primary" />{selectedQuickReport}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              {selectedQuickReport === "Financial Report" && "Detailed financial analysis including revenue, costs, and profit margins for the selected period."}
              {selectedQuickReport === "Production Report" && "Comprehensive production metrics including output, efficiency, and quality control data."}
              {selectedQuickReport === "HR Report" && "Worker performance analysis including productivity, attendance, and efficiency metrics."}
              {selectedQuickReport === "Inventory Report" && "Complete inventory overview including stock levels, material usage, and reorder requirements."}
            </p>
            <div className="flex gap-3">
              <Button className="flex-1" onClick={() => exportReport("pdf", selectedQuickReport)}><Download className="w-4 h-4 mr-2" />Generate PDF</Button>
              <Button variant="outline" className="flex-1" onClick={() => exportReport("csv", selectedQuickReport)}><Download className="w-4 h-4 mr-2" />Export CSV</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reports;
