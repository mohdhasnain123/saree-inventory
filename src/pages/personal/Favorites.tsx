import { Layout } from "@/components/Layout";
import { OutfitCard } from "@/components/OutfitCard";
import { StatsCard } from "@/components/StatsCard";
import { Heart, Sparkles, TrendingUp } from "lucide-react";

// Import outfit images
import outfit1 from "@/assets/office-outfit-1.jpg";
import outfit3 from "@/assets/office-outfit-3.jpg";
import outfit5 from "@/assets/office-outfit-5.jpg";

const favoriteOutfits = [
  {
    id: 1,
    image: outfit1,
    title: "Executive Navy Ensemble",
    description: "Most loved navy blazer combination for important meetings",
    lastWorn: "Yesterday",
    color: "Navy Blue",
    category: "Executive",
    isFavorite: true
  },
  {
    id: 2,
    image: outfit3,
    title: "Burgundy Business Set",
    description: "Favorite burgundy dress for confidence boost",
    lastWorn: "3 days ago",
    color: "Burgundy",
    category: "Business",
    isFavorite: true
  },
  {
    id: 3,
    image: outfit5,
    title: "Emerald Professional",
    description: "Beloved emerald green blazer for special occasions",
    lastWorn: "1 day ago",
    color: "Emerald Green",
    category: "Modern",
    isFavorite: true
  }
];

export default function Favorites() {
  return (
    <Layout>
    <div className="p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Heart className="w-8 h-8 text-red-500" />
          Favorite Outfits
        </h1>
        <p className="text-muted-foreground">Your most loved and frequently chosen outfits</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Favorite Items"
          value={14}
          change="+3"
          icon={Heart}
          trend="up"
        />
        <StatsCard
          title="Avg Weekly Use"
          value="4.2"
          change="+0.8"
          icon={Sparkles}
          trend="up"
        />
        <StatsCard
          title="Satisfaction Rate"
          value="98%"
          change="+2%"
          icon={TrendingUp}
          trend="up"
        />
      </div>

      {/* Favorite Outfits Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Your Top Picks</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6 gap-6">
          {favoriteOutfits.map((outfit) => (
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