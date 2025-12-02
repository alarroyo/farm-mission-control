import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MapCanvas } from "@/components/MapCanvas";
import { AreaCard } from "@/components/AreaCard";
import type { Area } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Plus, Map, Layers, Menu, Search, Users, Edit2, LogOut, User as UserIcon, Settings } from "lucide-react";
import aerialImage from "@/assets/farm_aerial.png";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { areaAPI, farmSettingsAPI, userAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [isCreating, setIsCreating] = useState(false);
  const [newAreaPoints, setNewAreaPoints] = useState<{ x: number; y: number }[] | null>(null);
  const [showNewAreaDialog, setShowNewAreaDialog] = useState(false);
  const [newAreaName, setNewAreaName] = useState("");
  const [hoveredAreaId, setHoveredAreaId] = useState<string | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  
  // Fetch data
  const { data: user } = useQuery({ queryKey: ["user"], queryFn: userAPI.get });
  const { data: areas = [] } = useQuery({ queryKey: ["areas"], queryFn: areaAPI.list });
  const { data: farmSettings } = useQuery({ queryKey: ["farmSettings"], queryFn: farmSettingsAPI.get });
  
  const [farmName, setFarmName] = useState(farmSettings?.name || "FarmArea");
  
  // Mutations
  const updateFarmNameMutation = useMutation({
    mutationFn: (name: string) => farmSettingsAPI.update(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farmSettings"] });
    },
  });
  
  const createAreaMutation = useMutation({
    mutationFn: (data: Omit<Area, "id" | "userId" | "createdAt">) => areaAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["areas"] });
      toast({ title: "Area Created", description: "Your new area has been added to the map." });
    },
  });

  const handleAreaCreated = (points: { x: number; y: number }[]) => {
    setNewAreaPoints(points);
    setShowNewAreaDialog(true);
    setIsCreating(false);
  };

  const saveNewArea = () => {
    if (!newAreaPoints) return;
    
    createAreaMutation.mutate({
      name: newAreaName || "New Area",
      description: "",
      hectares: 0,
      cropType: "Unassigned",
      color: "#3b82f6",
      points: newAreaPoints,
    });

    setShowNewAreaDialog(false);
    setNewAreaName("");
    setNewAreaPoints(null);
  };
  
  const handleFarmNameBlur = () => {
    setIsEditingTitle(false);
    if (farmName !== farmSettings?.name) {
      updateFarmNameMutation.mutate(farmName);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b bg-card flex items-center justify-between px-4 shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-primary text-primary-foreground p-2 rounded-lg">
            <Map className="w-5 h-5" />
          </div>
          {isEditingTitle ? (
             <Input 
                value={farmName} 
                onChange={(e) => setFarmName(e.target.value)} 
                onBlur={handleFarmNameBlur}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleFarmNameBlur();
                  }
                }}
                autoFocus
                className="h-8 w-48 font-bold text-lg"
             />
          ) : (
             <div className="group flex items-center gap-2 cursor-pointer" onClick={() => setIsEditingTitle(true)}>
                <h1 className="font-display font-bold text-xl tracking-tight">{farmSettings?.name || "FarmArea"}</h1>
                <Edit2 className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
             </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
           <div className="hidden md:flex items-center -space-x-2 mr-4">
              <Avatar className="border-2 border-background w-8 h-8">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>{user?.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <Avatar className="border-2 border-background w-8 h-8">
                <AvatarImage src="https://i.pravatar.cc/150?u=mike" />
                <AvatarFallback>MI</AvatarFallback>
              </Avatar>
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-background text-muted-foreground">
                +2
              </div>
           </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
               <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="w-8 h-8 border border-border">
                     <AvatarImage src={user?.avatar} />
                     <AvatarFallback>{user?.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
               </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
               <DropdownMenuLabel>My Account</DropdownMenuLabel>
               <DropdownMenuSeparator />
               <DropdownMenuItem onClick={() => setLocation("/profile")}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Profile</span>
               </DropdownMenuItem>
               <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
               </DropdownMenuItem>
               <DropdownMenuSeparator />
               <DropdownMenuItem className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
               </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              {/* Mobile Menu Content */}
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (Desktop) */}
        <aside className="w-80 border-r bg-card hidden md:flex flex-col">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search areas..." className="pl-8" />
            </div>
          </div>
          
          <div className="p-4 flex-1 overflow-y-auto space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Your Areas</h2>
              <Badge variant="outline" className="text-xs">{areas.length}</Badge>
            </div>
            {areas.map((area) => (
              <div 
                key={area.id}
                onMouseEnter={() => setHoveredAreaId(area.id)}
                onMouseLeave={() => setHoveredAreaId(null)}
              >
                <AreaCard area={area} isHovered={hoveredAreaId === area.id} />
              </div>
            ))}
          </div>

          <div className="p-4 border-t bg-muted/20">
            <Button 
              className="w-full gap-2" 
              onClick={() => setIsCreating(!isCreating)} 
              variant={isCreating ? "destructive" : "default"}
            >
              {isCreating ? "Cancel" : "New Area"}
              {isCreating ? <Layers className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </Button>
          </div>
        </aside>

        {/* Map Area */}
        <main className="flex-1 relative bg-neutral-100 flex flex-col">
          <div className="flex-1 p-4 overflow-hidden">
             <MapCanvas
              imageSrc={aerialImage}
              areas={areas}
              hoveredAreaId={hoveredAreaId}
              isCreating={isCreating}
              onCancelCreate={() => setIsCreating(false)}
              onAreaCreated={handleAreaCreated}
              onAreaClick={(id) => setLocation(`/area/${id}`)}
              onHover={setHoveredAreaId}
            />
          </div>

          {/* Mobile FAB for creating area */}
          <Button
            className="md:hidden absolute bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
            size="icon"
            onClick={() => setIsCreating(!isCreating)}
          >
            {isCreating ? <Layers className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
          </Button>
        </main>
      </div>

      {/* New Area Dialog */}
      <Dialog open={showNewAreaDialog} onOpenChange={setShowNewAreaDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Name New Area</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="area-name">Area Name</Label>
            <Input 
              id="area-name" 
              value={newAreaName} 
              onChange={(e) => setNewAreaName(e.target.value)} 
              placeholder="e.g., South Pasture"
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewAreaDialog(false)}>Cancel</Button>
            <Button onClick={saveNewArea}>Create Area</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
