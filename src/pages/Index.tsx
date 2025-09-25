import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { OutfitCard } from "@/components/OutfitCard";
import { AIMessage } from "@/components/AIMessage";
import { StatsCard } from "@/components/StatsCard";
import { Sparkles, Calendar, TrendingUp, Heart } from "lucide-react";
import { Link } from "react-router-dom";

// Import outfit images
import outfit1 from "@/assets/office-outfit-1.jpg";
import outfit2 from "@/assets/office-outfit-2.jpg";
import outfit3 from "@/assets/office-outfit-3.jpg";
import outfit4 from "@/assets/office-outfit-4.jpg";
import outfit5 from "@/assets/office-outfit-5.jpg";
import outfit6 from "@/assets/office-outfit-6.jpg";

const outfits = [
  {
    id: 1,
    image: outfit1,
    title: "Executive Navy Ensemble",
    description: "Professional navy blazer with crisp white blouse, perfect for board meetings and executive presentations",
    lastWorn: "2 days ago",
    color: "Navy Blue",
    category: "Executive",
    isFavorite: true
  },
  {
    id: 2,
    image: outfit2,
    title: "Classic Power Suit",
    description: "Elegant black pencil skirt with grey blazer and pearl accessories for sophisticated business style",
    lastWorn: "1 week ago",
    color: "Charcoal Grey",
    category: "Formal",
    isFavorite: false
  },
  {
    id: 3,
    image: outfit3,
    title: "Burgundy Business Set",
    description: "Rich burgundy dress with matching blazer and gold accessories for confident professional appeal",
    lastWorn: "3 days ago",
    color: "Burgundy",
    category: "Business",
    isFavorite: true
  },
  {
    id: 4,
    image: outfit4,
    title: "Luxury Cream Pantsuit",
    description: "Sophisticated cream pantsuit with silk scarf and designer handbag for high-level client meetings",
    lastWorn: "5 days ago",
    color: "Cream",
    category: "Luxury",
    isFavorite: false
  },
  {
    id: 5,
    image: outfit5,
    title: "Emerald Professional",
    description: "Modern emerald green blazer with black trousers and silver accessories for contemporary office style",
    lastWorn: "1 day ago",
    color: "Emerald Green",
    category: "Modern",
    isFavorite: true
  },
  {
    id: 6,
    image: outfit6,
    title: "Executive Charcoal",
    description: "Power dressing with charcoal grey dress, statement necklace and briefcase for leadership presence",
    lastWorn: "4 days ago",
    color: "Charcoal",
    category: "Executive",
    isFavorite: false
  }
];

const Index = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <main className="flex-1 overflow-auto max-w-[7150px]">
          {/* Header */}
          <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
            <div className="flex items-center gap-4 px-6 py-4">
              <SidebarTrigger className="text-foreground hover:bg-muted rounded-lg p-2" />
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-foreground">Welcome back, Alex!</h1>
                <p className="text-muted-foreground">Your AI wardrobe assistant has curated today's recommendations</p>
              </div>
            </div>
          </header>

          <div className="p-6 space-y-8">
            {/* AI Warning Message */}
            <AIMessage 
              message="No matching outfit found for the coming party. Your current wardrobe focuses on professional office wear. Consider adding some evening or cocktail attire for social events."
              type="warning"
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Items Worn This Month"
                value={47}
                change="+12%"
                icon={Calendar}
                trend="up"
              />
              <StatsCard
                title="Wardrobe Efficiency"
                value="89%"
                change="+5%"
                icon={TrendingUp}
                trend="up"
              />
              <StatsCard
                title="AI Recommendations"
                value={23}
                change="New"
                icon={Sparkles}
                trend="neutral"
              />
              <StatsCard
                title="Favorite Outfits"
                value={14}
                change="+3"
                icon={Heart}
                trend="up"
              />
            </div>

            {/* Recently Worn Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Recently Worn
                </h2>
                <Link to="/recent/last-used" className="text-primary hover:text-primary-glow text-sm font-medium transition-colors">
                  View All →
                </Link>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6 gap-6">
                {outfits.map((outfit) => (
                  <OutfitCard
                    key={outfit.id}
                    image={outfit.image}
                    title={outfit.title}
                    description={outfit.description}
                    lastWorn={outfit.lastWorn}
                    color={outfit.color}
                    category={outfit.category}
                    isFavorite={outfit.isFavorite}
                  />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
