import { useState } from "react";
import Dashboard from "@/components/Dashboard";
import Navigation from "@/components/Navigation";
import RawMaterials from "@/components/RawMaterials";
import SareeInventory from "@/components/SareeInventory";
import Sales from "@/components/Sales";
import Workers from "@/components/Workers";
import Machines from "@/components/Machines";
import Reports from "@/components/Reports";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "materials":
        return <RawMaterials />;
      case "sarees":
        return <SareeInventory />;
      case "sales":
        return <Sales />;
      case "workers":
        return <Workers />;
      case "machines":
        return <Machines />;
      case "reports":
        return <Reports />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="lg:pl-64">
        <main className="p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Index;
