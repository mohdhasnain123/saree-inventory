import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Layout } from "@/components/Layout";
import uppersFormal from "@/assets/uppers-formal.jpg";
import dressShirt from "@/assets/dressShirt.jpeg";
import businessSuit from "@/assets/businessSuit.jpeg";
import formalVest from "@/assets/formalVest.jpeg";

import formalSkirt from "@/assets/formalSkirt.jpeg";
import dressTrouser from "@/assets/dressTrouser.jpeg";
import dressPant from "@/assets/dressPant.png";
import suitPant from "@/assets/suitPant.png";

import briefcase from "@/assets/briefcase.png";
import totebag from "@/assets/totebag.png";
import clutch from "@/assets/clutch.png";
import laptopBag from "@/assets/laptopBag.png";

import necklace from "@/assets/necklace.png";
import watch from "@/assets/watch.jpeg";
import cuffling from "@/assets/cuffling.png";
import earing from "@/assets/earing.png";


interface CategoryItem {
  id: string;
  name: string;
  image: string;
  description: string;
  items: number;
}

const categories = {
  uppers: [
    { id: "1", name: "Executive Blazers", image: uppersFormal, description: "Professional navy and charcoal blazers", items: 12 },
    { id: "2", name: "Dress Shirts", image: dressShirt, description: "Crisp white and light blue shirts", items: 18 },
    { id: "3", name: "Business Suits", image: businessSuit, description: "Complete formal suit sets", items: 8 },
    { id: "4", name: "Formal Vests", image: formalVest, description: "Matching waistcoats and vests", items: 6 },
  ],
  lowers: [
    { id: "5", name: "Dress Trousers", image: dressTrouser, description: "Tailored formal pants", items: 15 },
    { id: "6", name: "Suit Pants", image: suitPant, description: "Matching suit bottoms", items: 10 },
    { id: "7", name: "Formal Skirts", image: formalSkirt, description: "Professional pencil skirts", items: 8 },
    { id: "8", name: "Dress Pants", image: dressPant, description: "Office-appropriate slacks", items: 12 },
  ],
  bags: [
    { id: "9", name: "Briefcases", image: briefcase, description: "Leather business briefcases", items: 6 },
    { id: "10", name: "Handbags", image: totebag, description: "Professional tote bags", items: 9 },
    { id: "11", name: "Laptop Bags", image: laptopBag, description: "Stylish computer cases", items: 7 },
    { id: "12", name: "Clutches", image: clutch, description: "Evening formal clutches", items: 4 },
  ],
  jewelry: [
    { id: "13", name: "Watches", image: watch, description: "Luxury timepieces", items: 8 },
    { id: "14", name: "Necklaces", image: necklace, description: "Pearl and diamond pieces", items: 12 },
    { id: "15", name: "Earrings", image: earing, description: "Elegant formal earrings", items: 15 },
    { id: "16", name: "Cufflinks", image: cuffling, description: "Professional accessories", items: 10 },
  ],
};

export default function CategoryLanding() {
  const [activeTab, setActiveTab] = useState("uppers");

  const renderCategoryGrid = (items: CategoryItem[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {items.map((item) => (
        <Card 
          key={item.id} 
          className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-card border-border"
        >
          <CardContent className="p-0">
            <div className="aspect-[4/3] overflow-hidden rounded-t-lg">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-card-foreground mb-2">{item.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{item.items} items</span>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  View Collection
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <Layout>
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">
          Wardrobe Categories
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore your professional wardrobe organized by category. Each collection features 
          carefully curated formal pieces for the modern professional.
        </p>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px] mx-auto bg-muted">
          <TabsTrigger 
            value="uppers" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Uppers
          </TabsTrigger>
          <TabsTrigger 
            value="lowers"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Lowers
          </TabsTrigger>
          <TabsTrigger 
            value="bags"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Bags
          </TabsTrigger>
          <TabsTrigger 
            value="jewelry"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Jewelry
          </TabsTrigger>
        </TabsList>

        <div className="mt-8">
          <TabsContent value="uppers" className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-foreground mb-2">Upper Body Formal Wear</h2>
              <p className="text-muted-foreground">Blazers, shirts, and suits for professional excellence</p>
            </div>
            {renderCategoryGrid(categories.uppers)}
          </TabsContent>

          <TabsContent value="lowers" className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-foreground mb-2">Lower Body Formal Wear</h2>
              <p className="text-muted-foreground">Trousers, skirts, and formal bottoms</p>
            </div>
            {renderCategoryGrid(categories.lowers)}
          </TabsContent>

          <TabsContent value="bags" className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-foreground mb-2">Professional Bags</h2>
              <p className="text-muted-foreground">Briefcases, handbags, and business accessories</p>
            </div>
            {renderCategoryGrid(categories.bags)}
          </TabsContent>

          <TabsContent value="jewelry" className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-foreground mb-2">Formal Jewelry</h2>
              <p className="text-muted-foreground">Watches, necklaces, and professional accessories</p>
            </div>
            {renderCategoryGrid(categories.jewelry)}
          </TabsContent>
        </div>
      </Tabs>
    </div>
    </Layout>
  );
}