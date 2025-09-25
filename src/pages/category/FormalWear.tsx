import { Layout } from "@/components/Layout";
import { OutfitCard } from "@/components/OutfitCard";
import { StatsCard } from "@/components/StatsCard";
import { Crown, Sparkles, TrendingUp } from "lucide-react";
import formalCollection from "@/assets/formal-collection.jpg";

// Import outfit images
import outfit1 from "@/assets/office-outfit-1.jpg";
import outfit4 from "@/assets/office-outfit-4.jpg";
import outfit6 from "@/assets/office-outfit-6.jpg";

const formalOutfits = [
  {
    id: 1,
    image: outfit1,
    title: "Executive Navy Collection",
    description: "Premium navy blazer ensemble for executive meetings",
    lastWorn: "1 week ago",
    color: "Navy Blue",
    category: "Executive",
    isFavorite: true
  },
  {
    id: 2,
    image: outfit4,
    title: "Luxury Cream Formal",
    description: "High-end cream pantsuit for special occasions",
    lastWorn: "2 weeks ago",
    color: "Cream",
    category: "Luxury",
    isFavorite: true
  },
  {
    id: 3,
    image: outfit6,
    title: "Executive Charcoal",
    description: "Sophisticated charcoal dress for leadership events",
    lastWorn: "1 week ago",
    color: "Charcoal",
    category: "Executive",
    isFavorite: false
  }
];

export default function FormalWear() {
  return (
    <Layout>
    <div className="p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Crown className="w-8 h-8 text-primary" />
          Formal Wear Collection
        </h1>
        <p className="text-muted-foreground">Premium formal outfits for special occasions and executive meetings</p>
      </div>

      {/* Hero Image */}
      <div className="relative h-64 rounded-lg overflow-hidden">
        <img 
          src={formalCollection} 
          alt="Formal wear collection"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
          <div className="p-8">
            <h2 className="text-3xl font-bold text-white mb-2">Premium Formal Collection</h2>
            <p className="text-white/80">Curated selection of executive and luxury formal wear</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Formal Outfits"
          value={15}
          change="+2"
          icon={Crown}
          trend="up"
        />
        <StatsCard
          title="Premium Items"
          value={8}
          change="+1"
          icon={Sparkles}
          trend="up"
        />
        <StatsCard
          title="Usage Rate"
          value="67%"
          change="+5%"
          icon={TrendingUp}
          trend="up"
        />
      </div>

      {/* Formal Outfits Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Formal Collection</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6 gap-6">
          {formalOutfits.map((outfit) => (
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
    </Layout>
  );
}