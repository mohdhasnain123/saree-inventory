import { Heart, Calendar, Palette } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface OutfitCardProps {
  image: string;
  title: string;
  description: string;
  lastWorn?: string;
  color: string;
  category: string;
  isFavorite?: boolean;
}

export function OutfitCard({ 
  image, 
  title, 
  description, 
  lastWorn, 
  color, 
  category,
  isFavorite = false 
}: OutfitCardProps) {
  return (
    <Card className="group bg-gradient-card border-border hover:bg-gradient-hover transition-all duration-300 hover:shadow-card hover:scale-[1.02] overflow-hidden">
      <CardContent className="p-0">
        <div className="relative aspect-video overflow-hidden">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-3 right-3 flex gap-2">
            <Button
              size="icon"
              variant="secondary"
              className="w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm border-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          </div>
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 backdrop-blur-sm">
              {category}
            </Badge>
          </div>
        </div>
        
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-foreground text-lg">{title}</h3>
            <p className="text-muted-foreground text-sm mt-1">{description}</p>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            {lastWorn && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>{lastWorn}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-muted-foreground">
              <Palette className="w-3 h-3" />
              <span>{color}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}