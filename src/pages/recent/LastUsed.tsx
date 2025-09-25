import { Layout } from "@/components/Layout";
import { OutfitCard } from "@/components/OutfitCard";
import { StatsCard } from "@/components/StatsCard";
import { Clock, Calendar, TrendingUp } from "lucide-react";

// Import outfit images
import outfit1 from "@/assets/office-outfit-1.jpg";
import outfit2 from "@/assets/office-outfit-2.jpg";
import outfit3 from "@/assets/office-outfit-3.jpg";

const recentOutfits = [
  {
    id: 1,
    image: outfit1,
    title: "Executive Navy Ensemble",
    description: "Recently worn to board meeting presentation",
    lastWorn: "Yesterday",
    color: "Navy Blue",
    category: "Executive",
    isFavorite: true
  },
  {
    id: 2,
    image: outfit2,
    title: "Classic Power Suit",
    description: "Worn for client consultation meeting",
    lastWorn: "2 days ago",
    color: "Charcoal Grey",
    category: "Formal",
    isFavorite: false
  },
  {
    id: 3,
    image: outfit3,
    title: "Burgundy Business Set",
    description: "Conference presentation outfit",
    lastWorn: "3 days ago",
    color: "Burgundy",
    category: "Business",
    isFavorite: true
  }
];

export default function LastUsed() {
  return (
    <Layout>
      <div className="p-6 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Clock className="w-8 h-8 text-primary" />
            Last Used Outfits
          </h1>
          <p className="text-muted-foreground">Your most recently worn professional outfits</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Outfits This Week"
            value={12}
            change="+3"
            icon={Calendar}
            trend="up"
          />
          <StatsCard
            title="Avg Uses Per Outfit"
            value="3.2"
            change="+0.4"
            icon={TrendingUp}
            trend="up"
          />
          <StatsCard
            title="Last Worn"
            value="Yesterday"
            icon={Clock}
            trend="neutral"
          />
        </div>

        {/* Recent Outfits Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Recent Activity</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6 gap-6">
            {recentOutfits.map((outfit) => (
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