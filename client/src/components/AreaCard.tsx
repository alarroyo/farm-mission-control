import { Area } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, MapPin } from "lucide-react";
import { useLocation } from "wouter";
import aerialImage from "@/assets/farm_aerial.png";

interface AreaCardProps {
  area: Area;
  isHovered?: boolean;
}

export function AreaCard({ area, isHovered }: AreaCardProps) {
  const [, setLocation] = useLocation();
  const pointsStr = area.points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <Card 
      className={`cursor-pointer transition-all duration-300 group overflow-hidden ${isHovered ? 'border-primary shadow-md ring-1 ring-primary' : 'hover:border-primary/50'}`}
      onClick={() => setLocation(`/area/${area.id}`)}
    >
      <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0 gap-2">
        <div className="space-y-1.5">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: area.color }} />
            {area.name}
          </CardTitle>
          <Badge variant="secondary" className="font-normal text-xs w-fit">
            {area.hectares} ha
          </Badge>
        </div>
        
        <div className="relative w-20 h-16 rounded-md overflow-hidden border border-border shrink-0 shadow-sm bg-muted">
            <img src={aerialImage} alt="Area preview" className="w-full h-full object-cover opacity-60 grayscale-[0.2]" />
            <div className="absolute inset-0">
                <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                    <polygon points={pointsStr} fill={area.color} fillOpacity={0.8} stroke={area.color} strokeWidth={1} />
                </svg>
            </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {area.description || "No description provided."}
        </p>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {area.cropType || "Mixed"}
          </span>
          <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 group-hover:translate-x-1 transition-transform">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
