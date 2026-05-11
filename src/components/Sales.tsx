import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Plus, Search, Edit, Trash2, TrendingUp, IndianRupee, Calendar, FileDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useProductionType } from "@/contexts/ProductionTypeContext";

const CURRENCY_WORDS: Record<string, { major: string; minor: string }> = {
  INR: { major: "Indian Rupees", minor: "Paise" },
  USD: { major: "US Dollars", minor: "Cents" },
  EUR: { major: "Euros", minor: "Cents" },
  GBP: { major: "Pounds", minor: "Pence" },
  AED: { major: "UAE Dirhams", minor: "Fils" },
  SGD: { major: "Singapore Dollars", minor: "Cents" },
};

const numberToWordsIndian = (num: number, currency: string = "INR"): string => {
  const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const inWords = (n: number): string => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
    if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + inWords(n % 100) : "");
    return "";
  };
  const convert = (n: number): string => {
    if (n === 0) return "Zero";
    let str = "";
    const crore = Math.floor(n / 10000000); n %= 10000000;
    const lakh = Math.floor(n / 100000); n %= 100000;
    const thousand = Math.floor(n / 1000); n %= 1000;
    const hundred = n;
    if (crore) str += inWords(crore) + " Crore ";
    if (lakh) str += inWords(lakh) + " Lakh ";
    if (thousand) str += inWords(thousand) + " Thousand ";
    if (hundred) str += inWords(hundred);
    return str.trim();
  };
  const words = CURRENCY_WORDS[currency.toUpperCase()] || CURRENCY_WORDS.INR;
  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);
  let result = `${words.major} ` + convert(rupees);
  if (paise > 0) result += ` and ` + convert(paise) + ` ${words.minor}`;
  return result + " Only";
};

const formatINDate = (iso: string): string => {
  if (!iso) return "";
  const d = new Date(iso);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${String(d.getDate()).padStart(2,"0")}-${months[d.getMonth()]}-${String(d.getFullYear()).slice(-2)}`;
};

const formatINR = (n: number): string => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const COMPANY_DEFAULTS = {
  name: "SAREE MANUFACTURING CO.",
  addr1: "SHOP 12, TEXTILE MARKET",
  addr2: "RING ROAD, SURAT",
  addr3: "DISTT. SURAT - 395002 GUJARAT",
  mob: "9876543210",
  msme: "MSME-UDYAM-GJ-24-0098765",
  branch: "ADD : 45, SILK BAZAR, KATARGAM, SURAT - 395004",
  gstin: "24ABCDE1234F1Z5",
  state: "Gujarat",
  stateCode: "24",
  email: "info@sareemfg.com",
  pan: "ABCDE1234F",
  bank: "HDFC BANK C.C. A/C, SURAT",
  acNo: "50200012345678",
  ifsc: "HDFC0000123",
  branchIfsc: "RING ROAD BRANCH & HDFC0000123",
  hsn: "54071000",
  jurisdiction: "SURAT",
};

const generateTaxInvoice = (
  sale: Sale,
  copyType: string,
  companyOverride?: Partial<typeof COMPANY_DEFAULTS>,
  currency: string = "INR"
) => {
  const COMPANY = { ...COMPANY_DEFAULTS, ...(companyOverride || {}) };
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const mL = 8, mR = 8;
  const innerW = pageW - mL - mR;

  doc.setLineWidth(0.4);
  doc.rect(mL, 8, innerW, pageH - 16);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("TAX INVOICE", pageW / 2, 14, { align: "center" });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`(${copyType})`, pageW / 2, 18, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.text("e-Invoice", pageW - mR - 2, 14, { align: "right" });

  let y = 22;
  doc.line(mL, y, pageW - mR, y);

  y += 4;
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(`IRN       : ${sale.id.toLowerCase()}${"a".repeat(20)}-placeholder${"b".repeat(20)}`, mL + 2, y);
  y += 3.5;
  doc.text(`Ack No.   : 1${Date.now().toString().slice(-14)}`, mL + 2, y);
  y += 3.5;
  doc.text(`Ack Date  : ${formatINDate(sale.saleDate)}`, mL + 2, y);

  y += 4;
  doc.line(mL, y, pageW - mR, y);

  const sellerY = y + 2;
  const midX = mL + innerW * 0.55;
  doc.line(midX, y, midX, y + 50);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(COMPANY.name, mL + 2, sellerY + 4);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  let sy = sellerY + 9;
  [COMPANY.addr1, COMPANY.addr2, COMPANY.addr3,
   `MOB.No.: ${COMPANY.mob}`, COMPANY.msme, COMPANY.branch,
   `GSTIN/UIN: ${COMPANY.gstin}`,
   `State Name : ${COMPANY.state}, Code : ${COMPANY.stateCode}`,
   `E-Mail : ${COMPANY.email}`].forEach(line => {
    doc.text(line, mL + 2, sy);
    sy += 3.5;
  });

  const rX = midX + 2;
  const rW = pageW - mR - midX - 2;
  let ry = y;
  const half = rW / 2;
  const drawDoubleCell = (l1: string, v1: string, l2: string, v2: string, h: number) => {
    doc.rect(midX, ry, half, h);
    doc.rect(midX + half, ry, half, h);
    doc.setFontSize(7); doc.setFont("helvetica", "normal");
    doc.text(l1, midX + 2, ry + 3);
    doc.text(l2, midX + half + 2, ry + 3);
    doc.setFontSize(9); doc.setFont("helvetica", "bold");
    doc.text(v1, midX + 2, ry + 7);
    doc.text(v2, midX + half + 2, ry + 7);
    ry += h;
  };
  drawDoubleCell("Invoice No.", sale.id, "Dated", formatINDate(sale.saleDate), 10);
  drawDoubleCell("Delivery Note", "", "Mode/Terms of Payment", `${sale.paymentMethod.toUpperCase()} / ${sale.paymentTermMonths} Month(s)`, 10);
  drawDoubleCell("Reference No. & Date.", "", "Other References", "", 10);
  drawDoubleCell("Buyer's Order No.", "", "Dated", "", 10);
  drawDoubleCell("Dispatch Doc No.", "", "Delivery Note Date", "", 10);

  y = Math.max(sy + 1, ry);
  doc.line(mL, y, pageW - mR, y);

  const cbY = y;
  const cbH = 32;
  doc.line(mL + innerW / 2, cbY, mL + innerW / 2, cbY + cbH);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Consignee (Ship to)", mL + 2, cbY + 4);
  doc.text("Buyer (Bill to)", mL + innerW / 2 + 2, cbY + 4);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(sale.customerName.toUpperCase(), mL + 2, cbY + 10);
  doc.text(sale.customerName.toUpperCase(), mL + innerW / 2 + 2, cbY + 10);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  ["Customer Address Line 1", "Customer City",
   "GSTIN/UIN : 24XXXXX0000X1Z0",
   "State Name : Gujarat, Code : 24"].forEach((line, i) => {
    doc.text(line, mL + 2, cbY + 15 + i * 3.5);
    doc.text(line, mL + innerW / 2 + 2, cbY + 15 + i * 3.5);
  });

  y = cbY + cbH;
  doc.line(mL, y, pageW - mR, y);

  const taxableAmount = sale.totalRevenue - sale.returnAmount;
  const cgst = +(taxableAmount * 0.025).toFixed(2);
  const sgst = +(taxableAmount * 0.025).toFixed(2);
  const subtotal = taxableAmount + cgst + sgst;
  const grandTotal = Math.round(subtotal);
  const roundOff = +(grandTotal - subtotal).toFixed(2);

  const itemBody: import("jspdf-autotable").RowInput[] = [
    [
      { content: "1", styles: { halign: "center" } },
      { content: sale.sareeType + " Saree", styles: { fontStyle: "bold" } },
      { content: COMPANY.hsn, styles: { halign: "center" } },
      { content: `${sale.quantity} Pcs`, styles: { halign: "right", fontStyle: "bold" } },
      { content: formatINR(sale.sellingPrice), styles: { halign: "right" } },
      { content: "Pcs", styles: { halign: "center" } },
      { content: formatINR(sale.totalRevenue), styles: { halign: "right", fontStyle: "bold" } },
    ],
  ];
  if (sale.returnedQuantity > 0) {
    itemBody.push([
      "", { content: "Less: Sales Return", styles: { fontStyle: "italic" } },
      "", { content: `-${sale.returnedQuantity} Pcs`, styles: { halign: "right" } },
      { content: formatINR(sale.sellingPrice), styles: { halign: "right" } },
      { content: "Pcs", styles: { halign: "center" } },
      { content: `(-)${formatINR(sale.returnAmount)}`, styles: { halign: "right" } },
    ]);
  }
  itemBody.push(
    ["", { content: "CGST ON SALE @ 2.5%", styles: { fontStyle: "italic" } },
      "", "", { content: "2.50 %", styles: { halign: "right" } }, "",
      { content: formatINR(cgst), styles: { halign: "right", fontStyle: "bold" } }],
    ["", { content: "SGST ON SALE @ 2.5%", styles: { fontStyle: "italic" } },
      "", "", { content: "2.50 %", styles: { halign: "right" } }, "",
      { content: formatINR(sgst), styles: { halign: "right", fontStyle: "bold" } }],
    ["", { content: "Less : Round Off", styles: { fontStyle: "italic" } },
      "", "", "", "",
      { content: (roundOff < 0 ? `(-)${formatINR(Math.abs(roundOff))}` : formatINR(roundOff)), styles: { halign: "right" } }],
  );

  autoTable(doc, {
    startY: y,
    margin: { left: mL, right: mR },
    head: [[
      { content: "Sl\nNo.", styles: { halign: "center" } },
      { content: "Description of Goods", styles: { halign: "center" } },
      { content: "HSN/SAC", styles: { halign: "center" } },
      { content: "Quantity", styles: { halign: "center" } },
      { content: "Rate", styles: { halign: "center" } },
      { content: "per", styles: { halign: "center" } },
      { content: "Amount", styles: { halign: "center" } },
    ]],
    body: itemBody,
    foot: [[
      "", { content: "Total", styles: { fontStyle: "bold", halign: "right" } }, "",
      { content: `${sale.quantity - sale.returnedQuantity} Pcs`, styles: { fontStyle: "bold", halign: "right" } },
      "", "",
      { content: `Rs. ${formatINR(grandTotal)}`, styles: { fontStyle: "bold", halign: "right" } },
    ]],
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 1.5, textColor: 0, lineColor: 0, lineWidth: 0.1 },
    headStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: "bold", lineColor: 0 },
    footStyles: { fillColor: [240, 240, 240], textColor: 0, lineColor: 0 },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 60 },
      2: { cellWidth: 20 },
      3: { cellWidth: 25 },
      4: { cellWidth: 22 },
      5: { cellWidth: 14 },
      6: { cellWidth: "auto" },
    },
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.rect(mL, y, innerW, 10);
  doc.text("Amount Chargeable (in words)", mL + 2, y + 4);
  doc.text("E. & O.E", pageW - mR - 2, y + 4, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.text(numberToWordsIndian(grandTotal, currency), mL + 2, y + 8);
  y += 10;

  autoTable(doc, {
    startY: y,
    margin: { left: mL, right: mR },
    head: [
      [
        { content: "HSN/SAC", rowSpan: 2, styles: { valign: "middle", halign: "center" } },
        { content: "Taxable\nValue", rowSpan: 2, styles: { valign: "middle", halign: "center" } },
        { content: "CGST", colSpan: 2, styles: { halign: "center" } },
        { content: "SGST/UTGST", colSpan: 2, styles: { halign: "center" } },
        { content: "Total\nTax Amount", rowSpan: 2, styles: { valign: "middle", halign: "center" } },
      ],
      [
        { content: "Rate", styles: { halign: "center" } },
        { content: "Amount", styles: { halign: "center" } },
        { content: "Rate", styles: { halign: "center" } },
        { content: "Amount", styles: { halign: "center" } },
      ],
    ],
    body: [[
      { content: COMPANY.hsn, styles: { halign: "center" } },
      { content: formatINR(taxableAmount), styles: { halign: "right" } },
      { content: "2.50%", styles: { halign: "center" } },
      { content: formatINR(cgst), styles: { halign: "right" } },
      { content: "2.50%", styles: { halign: "center" } },
      { content: formatINR(sgst), styles: { halign: "right" } },
      { content: formatINR(cgst + sgst), styles: { halign: "right" } },
    ]],
    foot: [[
      { content: "Total", styles: { halign: "right", fontStyle: "bold" } },
      { content: formatINR(taxableAmount), styles: { halign: "right", fontStyle: "bold" } },
      "", { content: formatINR(cgst), styles: { halign: "right", fontStyle: "bold" } },
      "", { content: formatINR(sgst), styles: { halign: "right", fontStyle: "bold" } },
      { content: formatINR(cgst + sgst), styles: { halign: "right", fontStyle: "bold" } },
    ]],
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 1.5, textColor: 0, lineColor: 0, lineWidth: 0.1 },
    headStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: "bold" },
    footStyles: { fillColor: [240, 240, 240], textColor: 0 },
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

  doc.rect(mL, y, innerW, 8);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Tax Amount (in words) :", mL + 2, y + 4);
  doc.setFont("helvetica", "bold");
  doc.text(numberToWordsIndian(cgst + sgst, currency), mL + 40, y + 4);
  y += 8;

  doc.rect(mL, y, innerW, 6);
  doc.setFont("helvetica", "normal");
  doc.text("Company's PAN :", mL + 2, y + 4);
  doc.setFont("helvetica", "bold");
  doc.text(COMPANY.pan, mL + 32, y + 4);
  y += 6;

  const decH = 30;
  doc.rect(mL, y, innerW / 2, decH);
  doc.rect(mL + innerW / 2, y, innerW / 2, decH);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("Declaration", mL + 2, y + 4);
  doc.text("Company's Bank Details", mL + innerW / 2 + 2, y + 4);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text("1. We declare that this invoice shows the actual price of", mL + 2, y + 9);
  doc.text("    the goods described and that all particulars are true and correct.", mL + 2, y + 12.5);
  doc.text(`2. Payment within ${sale.paymentTermMonths * 30} days from bill date.`, mL + 2, y + 16);

  doc.setFontSize(8);
  doc.text(`Bank Name      : `, mL + innerW / 2 + 2, y + 9);
  doc.setFont("helvetica", "bold");
  doc.text(COMPANY.bank, mL + innerW / 2 + 25, y + 9);
  doc.setFont("helvetica", "normal");
  doc.text(`A/c No.            : `, mL + innerW / 2 + 2, y + 13);
  doc.setFont("helvetica", "bold");
  doc.text(COMPANY.acNo, mL + innerW / 2 + 25, y + 13);
  doc.setFont("helvetica", "normal");
  doc.text(`Branch & IFS Code : `, mL + innerW / 2 + 2, y + 17);
  doc.setFont("helvetica", "bold");
  doc.text(COMPANY.branchIfsc, mL + innerW / 2 + 30, y + 17);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`for ${COMPANY.name}`, pageW - mR - 2, y + decH - 8, { align: "right" });
  doc.text("Authorised Signatory", pageW - mR - 2, y + decH - 2, { align: "right" });

  y += decH;

  doc.setFontSize(7);
  doc.setFont("helvetica", "italic");
  doc.text(`SUBJECT TO ${COMPANY.jurisdiction} JURISDICTION`, pageW / 2, y + 4, { align: "center" });
  doc.text("This is a Computer Generated Invoice", pageW / 2, y + 8, { align: "center" });

  doc.save(`Invoice-${sale.id}-${sale.customerName.replace(/\s+/g, "_")}.pdf`);
};

interface Sale {
  id: string;
  sareeId: string;
  sareeType: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  totalRevenue: number;
  profit: number;
  profitMargin: number;
  customerName: string;
  saleDate: string;
  status: "completed" | "pending" | "cancelled";
  paymentTermMonths: number;
  paymentMethod: "cash" | "cheque";
  returnedQuantity: number;
  returnAmount: number;
  netRevenue: number;
}

const Sales = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { canWrite } = useAuth();
  const { settings, formatMoney, notifyEnabled } = useSettings();
  const { typeParam, typeQuery } = useProductionType();

  const { data: sales = [], isLoading } = useQuery<Sale[]>({
    queryKey: ["sales", typeParam],
    queryFn: () => api.get<Sale[]>(`/sales${typeQuery}`),
  });

  const createMutation = useMutation({
    mutationFn: (body: Partial<Sale>) => api.post<Sale>("/sales", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      if (notifyEnabled("newOrders")) {
        toast({ title: "Sale Recorded", description: "New sale has been added." });
      }
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Sale> }) => api.put<Sale>(`/sales/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      toast({ title: "Sale Updated" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.del(`/sales/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      toast({ title: "Sale Deleted", variant: "destructive" });
    },
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [formData, setFormData] = useState({
    sareeId: "",
    sareeType: "",
    quantity: "",
    costPrice: "",
    sellingPrice: "",
    customerName: "",
    saleDate: "",
    paymentTermMonths: "1",
    paymentMethod: "cash" as "cash" | "cheque",
    returnedQuantity: "0",
  });

  const calculateProfit = (quantity: number, costPrice: number, sellingPrice: number) => {
    const totalCost = quantity * costPrice;
    const totalRevenue = quantity * sellingPrice;
    const profit = totalRevenue - totalCost;
    const profitMargin = totalCost > 0 ? (profit / totalRevenue) * 100 : 0;
    return { totalRevenue, profit, profitMargin };
  };

  const getStatusColor = (status: Sale["status"]) => {
    switch (status) {
      case "completed": return "bg-success/20 text-success-foreground border-success/30";
      case "pending": return "bg-warning/20 text-warning-foreground border-warning/30";
      case "cancelled": return "bg-destructive/20 text-destructive-foreground border-destructive/30";
    }
  };

  const getProfitColor = (profitMargin: number) => {
    if (profitMargin >= 30) return "text-success";
    if (profitMargin >= 15) return "text-warning";
    return "text-destructive";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const quantity = parseInt(formData.quantity);
    const costPrice = parseFloat(formData.costPrice);
    const sellingPrice = parseFloat(formData.sellingPrice);
    const returnedQuantity = parseInt(formData.returnedQuantity || "0");
    const paymentTermMonths = parseInt(formData.paymentTermMonths || "0");
    const { totalRevenue, profit, profitMargin } = calculateProfit(quantity, costPrice, sellingPrice);
    const returnAmount = returnedQuantity * sellingPrice;
    const netRevenue = totalRevenue - returnAmount;

    const payload: Partial<Sale> = {
      sareeId: formData.sareeId,
      sareeType: formData.sareeType,
      quantity,
      costPrice,
      sellingPrice,
      totalRevenue,
      profit,
      profitMargin,
      customerName: formData.customerName,
      saleDate: formData.saleDate,
      paymentTermMonths,
      paymentMethod: formData.paymentMethod,
      returnedQuantity,
      returnAmount,
      netRevenue,
      status: editingSale?.status || "completed",
    };

    if (editingSale) {
      updateMutation.mutate({ id: editingSale.id, body: payload });
    } else {
      createMutation.mutate(payload);
    }

    setFormData({ sareeId: "", sareeType: "", quantity: "", costPrice: "", sellingPrice: "", customerName: "", saleDate: "", paymentTermMonths: "1", paymentMethod: "cash", returnedQuantity: "0" });
    setEditingSale(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (sale: Sale) => {
    setEditingSale(sale);
    setFormData({
      sareeId: sale.sareeId,
      sareeType: sale.sareeType,
      quantity: sale.quantity.toString(),
      costPrice: sale.costPrice.toString(),
      sellingPrice: sale.sellingPrice.toString(),
      customerName: sale.customerName,
      saleDate: sale.saleDate,
      paymentTermMonths: sale.paymentTermMonths.toString(),
      paymentMethod: sale.paymentMethod,
      returnedQuantity: sale.returnedQuantity.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => deleteMutation.mutate(id);

  const handleDownloadBill = (sale: Sale) => {
    const override: Partial<typeof COMPANY_DEFAULTS> = {
      name: settings.companyName?.toUpperCase() || COMPANY_DEFAULTS.name,
      addr1: settings.companyAddress || COMPANY_DEFAULTS.addr1,
      addr2: "",
      addr3: "",
      mob: settings.contactPhone || COMPANY_DEFAULTS.mob,
      email: settings.contactEmail || COMPANY_DEFAULTS.email,
    };
    generateTaxInvoice(sale, "ORIGINAL FOR RECIPIENT", override, settings.currency);
    toast({ title: "Bill Downloaded", description: `Invoice for ${sale.customerName} has been generated.` });
  };

  const filteredSales = sales.filter(sale =>
    sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.sareeType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.sareeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.netRevenue ?? sale.totalRevenue), 0);
  const totalProfit = sales.reduce((sum, sale) => sum + (sale.profit - (sale.returnAmount ?? 0)), 0);
  const avgProfitMargin = sales.length > 0 ? sales.reduce((sum, sale) => sum + sale.profitMargin, 0) / sales.length : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="pl-12 lg:pl-0">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-primary" />
            Sales Management
          </h2>
          <p className="text-muted-foreground mt-1">Track sales performance and profit margins</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={canWrite && isDialogOpen} onOpenChange={(open) => canWrite && setIsDialogOpen(open)}>
            {canWrite && (
              <DialogTrigger asChild>
                <Button className="bg-gradient-primary shadow-manufacturing">
                  <Plus className="w-4 h-4 mr-2" />
                  Record Sale
                </Button>
              </DialogTrigger>
            )}
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingSale ? "Edit Sale" : "Record New Sale"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="sareeId">Saree ID</Label>
                    <Input id="sareeId" value={formData.sareeId} onChange={(e) => setFormData({ ...formData, sareeId: e.target.value })} placeholder="SAR001" required />
                  </div>
                  <div>
                    <Label htmlFor="sareeType">Type</Label>
                    <Select value={formData.sareeType} onValueChange={(value) => setFormData({ ...formData, sareeType: value })}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cotton">Cotton</SelectItem>
                        <SelectItem value="Silk">Silk</SelectItem>
                        <SelectItem value="Georgette">Georgette</SelectItem>
                        <SelectItem value="Chiffon">Chiffon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input id="quantity" type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} placeholder="0" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="costPrice">Cost Price (₹)</Label>
                    <Input id="costPrice" type="number" value={formData.costPrice} onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })} placeholder="0" required />
                  </div>
                  <div>
                    <Label htmlFor="sellingPrice">Selling Price (₹)</Label>
                    <Input id="sellingPrice" type="number" value={formData.sellingPrice} onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })} placeholder="0" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input id="customerName" value={formData.customerName} onChange={(e) => setFormData({ ...formData, customerName: e.target.value })} placeholder="e.g., Priya Textiles" required />
                </div>
                <div>
                  <Label htmlFor="saleDate">Sale Date</Label>
                  <Input id="saleDate" type="date" value={formData.saleDate} onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="paymentTermMonths">Payment Term (months)</Label>
                    <Input id="paymentTermMonths" type="number" min="0" value={formData.paymentTermMonths} onChange={(e) => setFormData({ ...formData, paymentTermMonths: e.target.value })} placeholder="0" required />
                  </div>
                  <div>
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select value={formData.paymentMethod} onValueChange={(value: "cash" | "cheque") => setFormData({ ...formData, paymentMethod: value })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="cheque">Cheque</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="returnedQuantity">Returned Sarees (qty)</Label>
                  <Input id="returnedQuantity" type="number" min="0" value={formData.returnedQuantity} onChange={(e) => setFormData({ ...formData, returnedQuantity: e.target.value })} placeholder="0" />
                  {formData.returnedQuantity && formData.sellingPrice && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Return amount adjusted: ₹{(parseInt(formData.returnedQuantity || "0") * parseFloat(formData.sellingPrice || "0")).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">{editingSale ? "Update" : "Record"} Sale</Button>
                  <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); setEditingSale(null); setFormData({ sareeId: "", sareeType: "", quantity: "", costPrice: "", sellingPrice: "", customerName: "", saleDate: "", paymentTermMonths: "1", paymentMethod: "cash", returnedQuantity: "0" }); }}>Cancel</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-foreground">₹{totalRevenue.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg"><IndianRupee className="w-6 h-6 text-primary" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Profit</p>
                <p className="text-2xl font-bold text-success">₹{totalProfit.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-success/10 rounded-lg"><TrendingUp className="w-6 h-6 text-success" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Profit Margin</p>
                <p className="text-2xl font-bold text-foreground">{avgProfitMargin.toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-accent/10 rounded-lg"><TrendingUp className="w-6 h-6 text-accent" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input placeholder="Search sales by customer, type, or ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
      </div>

      {isLoading ? (
        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="text-center py-12 text-muted-foreground">Loading sales...</CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSales.map((sale) => (
            <Card key={sale.id} className="bg-gradient-card shadow-card border-0 hover:shadow-elevated transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-foreground">{sale.id}</h3>
                      <Badge className={getStatusColor(sale.status)}>{sale.status}</Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {sale.saleDate ? new Date(sale.saleDate).toLocaleDateString() : "-"}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Customer</p>
                        <p className="font-medium text-foreground">{sale.customerName}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Saree</p>
                        <p className="font-medium text-foreground">{sale.sareeId} - {sale.sareeType}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Quantity</p>
                        <p className="font-medium text-foreground">
                          {sale.quantity} pieces
                          {sale.returnedQuantity > 0 && (
                            <span className="text-destructive"> (-{sale.returnedQuantity} returned)</span>
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Price/Unit</p>
                        <p className="font-medium text-foreground">₹{sale.sellingPrice}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Payment Term</p>
                        <p className="font-medium text-foreground">{sale.paymentTermMonths} month{sale.paymentTermMonths === 1 ? "" : "s"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Payment Method</p>
                        <p className="font-medium text-foreground capitalize">{sale.paymentMethod}</p>
                      </div>
                      {sale.returnedQuantity > 0 && (
                        <div>
                          <p className="text-muted-foreground">Return Adjusted</p>
                          <p className="font-medium text-destructive">-₹{sale.returnAmount.toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Net Revenue</p>
                      <p className="text-xl font-bold text-foreground">₹{(sale.netRevenue ?? sale.totalRevenue).toLocaleString()}</p>
                      {sale.returnedQuantity > 0 && (
                        <p className="text-xs text-muted-foreground">Gross: ₹{sale.totalRevenue.toLocaleString()}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground">Profit:</span>
                        <span className={`text-sm font-medium ${getProfitColor(sale.profitMargin)}`}>
                          ₹{(sale.profit - (sale.returnAmount ?? 0)).toLocaleString()} ({sale.profitMargin.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {canWrite && (
                        <Button size="sm" variant="outline" onClick={() => handleEdit(sale)}><Edit className="w-3 h-3" /></Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => handleDownloadBill(sale)} title="Download Bill"><FileDown className="w-3 h-3" /></Button>
                      {canWrite && (
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(sale.id)}><Trash2 className="w-3 h-3" /></Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && filteredSales.length === 0 && (
        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="text-center py-12">
            <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No sales found</h3>
            <p className="text-muted-foreground">Try adjusting your search or record new sales to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Sales;
