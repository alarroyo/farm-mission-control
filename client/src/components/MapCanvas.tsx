import { useState, useRef, useEffect } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Area } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { X, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface MapCanvasProps {
  imageSrc: string;
  areas: Area[];
  hoveredAreaId?: string | null;
  isCreating: boolean;
  onCancelCreate: () => void;
  onAreaCreated: (points: { x: number; y: number }[]) => void;
  onAreaClick: (areaId: string) => void;
  onHover?: (id: string | null) => void;
}

export function MapCanvas({
  imageSrc,
  areas,
  hoveredAreaId,
  isCreating,
  onCancelCreate,
  onAreaCreated,
  onAreaClick,
  onHover,
}: MapCanvasProps) {
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Reset points when entering/exiting create mode
  useEffect(() => {
    if (!isCreating) {
      setPoints([]);
    }
  }, [isCreating]);

  const handleImageClick = (e: React.MouseEvent) => {
    if (!isCreating) return;
    if (points.length >= 4) return;

    if (!containerRef.current) return;
    
    // Get coordinates relative to the image container
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100; // Percentage
    const y = ((e.clientY - rect.top) / rect.height) * 100; // Percentage

    const newPoints = [...points, { x, y }];
    setPoints(newPoints);

    if (newPoints.length === 4) {
      toast({
        title: "Area Defined",
        description: "Confirm to create this area.",
      });
    }
  };

  const handleConfirm = () => {
    if (points.length === 4) {
      onAreaCreated(points);
    }
  };

  return (
    <div className="relative w-full h-full bg-neutral-100 overflow-hidden rounded-xl border border-border shadow-inner">
      {/* Creation Controls Overlay */}
      {isCreating && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex gap-2 bg-background/90 backdrop-blur-sm p-2 rounded-lg shadow-lg border border-border animate-in slide-in-from-top-4">
          <div className="px-3 py-1.5 text-sm font-medium text-foreground flex items-center">
            {points.length}/4 Pins Placed
          </div>
          {points.length === 4 ? (
            <Button size="sm" onClick={handleConfirm} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Check className="w-4 h-4 mr-1" /> Save
            </Button>
          ) : (
            <Button size="sm" variant="secondary" disabled>
              Place Pins
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={onCancelCreate}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      <TransformWrapper
        disabled={isCreating} // Disable zoom/pan when placing pins
        initialScale={1}
        minScale={0.5}
        maxScale={4}
        limitToBounds={false}
      >
        <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full">
          <div 
            ref={containerRef}
            className={cn(
              "relative w-[800px] h-[600px] md:w-[1200px] md:h-[900px]", // Fixed aspect ratio canvas for simplicity
              isCreating ? "cursor-crosshair" : "cursor-grab active:cursor-grabbing"
            )}
            onClick={handleImageClick}
          >
            <img
              src={imageSrc}
              alt="Farm Aerial View"
              className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
            />

            {/* SVG Layer for Polygons */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none" 
              viewBox="0 0 100 100" 
              preserveAspectRatio="none"
            >
              {/* Existing Areas */}
              {areas.map((area) => {
                // Points are stored as 0-100 values, so we can use them directly in the 0-100 viewBox
                const pointsStr = area.points.map((p) => `${p.x},${p.y}`).join(" ");
                const isHovered = hoveredAreaId === area.id;
                const isAnyHovered = !!hoveredAreaId;
                
                // Focus effect: Dim others when one is hovered
                const fillOpacity = isHovered ? 0.65 : (isAnyHovered ? 0.1 : 0.3);
                const strokeWidth = isHovered ? 0.5 : (isAnyHovered ? 0.1 : 0.2); // Adjusted for 0-100 coordinate space
                
                // Calculate bounding box for text sizing
                const xs = area.points.map(p => p.x);
                const ys = area.points.map(p => p.y);
                const minX = Math.min(...xs);
                const maxX = Math.max(...xs);
                const minY = Math.min(...ys);
                const maxY = Math.max(...ys);
                const width = maxX - minX;
                const height = maxY - minY;
                
                // Heuristic for font size: try to fit width, but cap by height
                // Assuming average char width is ~0.6 of height for uppercase bold font
                const estimatedCharWidthFactor = 0.7;
                const maxTextWidth = width * 0.8; // use 80% of width
                const fontSizeByWidth = maxTextWidth / (area.name.length * estimatedCharWidthFactor);
                const fontSizeByHeight = height * 0.3; // max 30% of height
                const fontSize = Math.min(fontSizeByWidth, fontSizeByHeight, 3); // Cap at 3% relative to viewbox
                
                return (
                  <g 
                    key={area.id} 
                    onClick={() => !isCreating && onAreaClick(area.id)} 
                    className="pointer-events-auto cursor-pointer group"
                    onMouseEnter={() => !isCreating && onHover?.(area.id)}
                    onMouseLeave={() => !isCreating && onHover?.(null)}
                  >
                    {/* Double stroke effect for better visibility on map */}
                    <polygon
                      points={pointsStr}
                      fill="none"
                      stroke="white"
                      strokeWidth={isHovered ? 0.8 : 0}
                      strokeOpacity={0.7}
                      vectorEffect="non-scaling-stroke"
                      className="transition-all duration-300"
                    />
                    
                    <polygon
                      points={pointsStr}
                      fill={area.color}
                      fillOpacity={fillOpacity}
                      stroke={area.color}
                      strokeWidth={strokeWidth}
                      vectorEffect="non-scaling-stroke"
                      className="transition-all duration-300 ease-out"
                    />
                    {/* Center Label */}
                    {area.points.length > 0 && (
                      <g
                        className={`transition-all duration-300 ${isHovered ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-2'}`}
                        style={{ transformOrigin: 'center' }}
                      >
                        <text
                            x={minX + width / 2}
                            y={minY + height / 2}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="white"
                            fontSize={fontSize}
                            className="font-bold uppercase tracking-wider"
                            style={{ pointerEvents: 'none', textShadow: `0px ${fontSize * 0.1}px ${fontSize * 0.2}px rgba(0,0,0,0.8)` }}
                        >
                            {area.name}
                        </text>
                        <text
                            x={minX + width / 2}
                            y={minY + height / 2}
                            dy={fontSize * 1.2}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="white"
                            fillOpacity={0.9}
                            fontSize={fontSize * 0.6}
                            className="font-medium"
                            style={{ pointerEvents: 'none', textShadow: `0px ${fontSize * 0.05}px ${fontSize * 0.1}px rgba(0,0,0,0.8)` }}
                        >
                            {area.hectares} ha
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Draft Area (Being Created) */}
              {isCreating && points.length > 0 && (
                <g>
                  {/* Lines connecting points */}
                  <polyline
                    points={points.map((p) => `${p.x},${p.y}`).join(" ")}
                    fill="none"
                    stroke="hsl(var(--accent))"
                    strokeWidth={0.3}
                    strokeDasharray="1"
                    vectorEffect="non-scaling-stroke"
                  />
                  {/* Closing line if 4 points */}
                  {points.length === 4 && (
                    <line
                      x1={points[3].x}
                      y1={points[3].y}
                      x2={points[0].x}
                      y2={points[0].y}
                      stroke="hsl(var(--accent))"
                      strokeWidth={0.3}
                      strokeDasharray="1"
                      vectorEffect="non-scaling-stroke"
                    />
                  )}
                  {/* Fill preview if 4 points */}
                  {points.length === 4 && (
                     <polygon
                     points={points.map((p) => `${p.x},${p.y}`).join(" ")}
                     fill="hsl(var(--accent))"
                     fillOpacity={0.2}
                     stroke="none"
                   />
                  )}
                </g>
              )}
            </svg>

            {/* Pins (HTML Overlay for better interaction/visibility) */}
            {isCreating && points.map((p, i) => (
              <div
                key={i}
                className="absolute w-6 h-6 -ml-3 -mt-6 text-accent drop-shadow-md animate-in zoom-in duration-200"
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
              >
                <MapPinIcon />
              </div>
            ))}
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}

function MapPinIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" fill="white" stroke="none" />
    </svg>
  );
}
