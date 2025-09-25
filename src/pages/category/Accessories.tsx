import { Layout } from "@/components/Layout";
import { OutfitCard } from "@/components/OutfitCard";
import { StatsCard } from "@/components/StatsCard";
import { Gem, Sparkles, TrendingUp } from "lucide-react";
import accessoriesCollection from "@/assets/accessories-collection.jpg";

// Import outfit images
import outfit2 from "@/assets/office-outfit-2.jpg";
import outfit3 from "@/assets/office-outfit-3.jpg";
import outfit5 from "@/assets/office-outfit-5.jpg";

const accessoryOutfits = [
  {
    id: 1,
    image: outfit2,
    title: "Pearl Accessory Set",
    description: "Classic power suit enhanced with elegant pearl accessories",
    lastWorn: "3 days ago",
    color: "Charcoal Grey",
    category: "Pearls",
    isFavorite: true
  },
  {
    id: 2,
    image: outfit3,
    title: "Gold Statement Collection",
    description: "Burgundy ensemble with sophisticated gold accessories",
    lastWorn: "1 week ago",
    color: "Gold",
    category: "Statement",
    isFavorite: false
  },
  {
    id: 3,
    image: outfit5,
    title: "Silver Modern Set",
    description: "Contemporary emerald look with sleek silver accessories",
    lastWorn: "2 days ago",
    color: "Silver",
    category: "Modern",
    isFavorite: true
  }
];

export default function Accessories() {
  return (
    <Layout>
    <div className="p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Gem className="w-8 h-8 text-primary" />
          Accessories Collection
        </h1>
        <p className="text-muted-foreground">Premium accessories to elevate your professional wardrobe</p>
      </div>

      {/* Hero Image */}
      <div className="relative h-64 rounded-lg overflow-hidden">
        <img 
          src={accessoriesCollection} 
          alt="Accessories collection"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
          <div className="p-8">
            <h2 className="text-3xl font-bold text-white mb-2">Luxury Accessories</h2>
            <p className="text-white/80">Curated collection of jewelry, bags, and statement pieces</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Accessories"
          value={34}
          change="+5"
          icon={Gem}
          trend="up"
        />
        <StatsCard
          title="Statement Pieces"
          value={12}
          change="+2"
          icon={Sparkles}
          trend="up"
        />
        <StatsCard
          title="Match Rate"
          value="94%"
          change="+8%"
          icon={TrendingUp}
          trend="up"
        />
      </div>

      {/* Accessory Outfits Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Styled with Accessories</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6 gap-6">
          {accessoryOutfits.map((outfit) => (
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