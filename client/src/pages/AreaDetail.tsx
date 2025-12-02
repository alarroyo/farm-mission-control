import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Area, Task, Note } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Calendar, CheckCircle2, Circle, Clock, FileText, Image as ImageIcon, MoreVertical, Plus, Share2, Users, Pencil, Save, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import aerialImage from "@/assets/farm_aerial.png";
import { areaAPI, taskAPI, noteAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function AreaDetail() {
  const [, params] = useRoute("/area/:id");
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const id = params?.id || "";
  
  const { data: area } = useQuery({ 
    queryKey: ["area", id], 
    queryFn: () => areaAPI.get(id),
    enabled: !!id,
  });
  
  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks", id],
    queryFn: () => taskAPI.list(id),
    enabled: !!id,
  });
  
  const { data: notes = [] } = useQuery({
    queryKey: ["notes", id],
    queryFn: () => noteAPI.list(id),
    enabled: !!id,
  });

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Area>>({});

  const updateAreaMutation = useMutation({
    mutationFn: (data: Partial<Area>) => areaAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["area", id] });
      toast({ title: "Area Updated", description: "Changes saved successfully." });
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: Omit<Task, "id" | "areaId" | "createdAt">) => taskAPI.create(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", id] });
      setNewTaskTitle("");
    },
  });

  const createNoteMutation = useMutation({
    mutationFn: (data: Omit<Note, "id" | "areaId" | "createdAt">) => noteAPI.create(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", id] });
      setNewNoteContent("");
    },
  });

  if (!area) return <div className="p-8 text-center">Loading...</div>;

  const startEditing = () => {
    setEditForm({
      name: area.name,
      description: area.description,
      cropType: area.cropType,
      hectares: area.hectares
    });
    setIsEditing(true);
  };

  const saveEdit = () => {
    updateAreaMutation.mutate(editForm);
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditForm({});
  };

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    createTaskMutation.mutate({
      title: newTaskTitle,
      status: "pending",
      assignee: "You",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
  };

  const addNote = () => {
    if (!newNoteContent.trim()) return;
    createNoteMutation.mutate({
      content: newNoteContent,
      author: "You",
      date: new Date().toLocaleDateString(),
    });
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="h-16 border-b bg-card flex items-center justify-between px-4 shrink-0 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-display font-bold text-lg leading-none">{area.name}</h1>
            <span className="text-xs text-muted-foreground">{area.hectares} Hectares • {area.cropType}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden md:flex gap-2">
            <Share2 className="w-4 h-4" /> Share
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {/* Sidebar info (Desktop only) */}
        <aside className="w-80 border-r bg-muted/10 p-6 hidden md:block overflow-y-auto">
          <div className="aspect-video bg-muted rounded-lg mb-6 flex items-center justify-center text-muted-foreground relative overflow-hidden border border-border shadow-sm">
             <img src={aerialImage} className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale-[0.2]" alt="Map background" />
             <div className="absolute inset-0 flex items-center justify-center">
                <MapPreview points={area.points} color={area.color} />
             </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                 <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Details</h3>
                 {!isEditing && (
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={startEditing}>
                       <Pencil className="w-3 h-3" />
                    </Button>
                 )}
              </div>
              
              {isEditing ? (
                 <div className="bg-card rounded-lg border p-4 space-y-3 animate-in fade-in slide-in-from-left-2">
                    <div className="space-y-1">
                       <Label className="text-xs">Name</Label>
                       <Input 
                          value={editForm.name} 
                          onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                          className="h-8"
                       />
                    </div>
                    <div className="space-y-1">
                       <Label className="text-xs">Crop Type</Label>
                       <Input 
                          value={editForm.cropType} 
                          onChange={(e) => setEditForm({...editForm, cropType: e.target.value})}
                          className="h-8"
                       />
                    </div>
                     <div className="space-y-1">
                       <Label className="text-xs">Hectares</Label>
                       <Input 
                          type="number"
                          value={editForm.hectares} 
                          onChange={(e) => setEditForm({...editForm, hectares: Number(e.target.value)})}
                          className="h-8"
                       />
                    </div>
                    <div className="space-y-1">
                       <Label className="text-xs">Description</Label>
                       <Textarea 
                          value={editForm.description} 
                          onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                          className="min-h-[60px] text-xs"
                       />
                    </div>
                    <div className="flex gap-2 pt-2">
                       <Button size="sm" className="flex-1" onClick={saveEdit}><Save className="w-3 h-3 mr-1" /> Save</Button>
                       <Button size="sm" variant="outline" className="flex-1" onClick={cancelEdit}><X className="w-3 h-3 mr-1" /> Cancel</Button>
                    </div>
                 </div>
              ) : (
                <div className="bg-card rounded-lg border p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Crop</span>
                    <span className="font-medium">{area.cropType}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Soil Status</span>
                    <span className="font-medium text-green-600">Healthy</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last Inspection</span>
                    <span className="font-medium">Feb 12, 2025</span>
                  </div>
                  {area.description && (
                     <div className="pt-2 mt-2 border-t text-sm text-muted-foreground">
                        {area.description}
                     </div>
                  )}
                </div>
              )}
            </div>
            
            <div>
               <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Team</h3>
               <div className="flex -space-x-2">
                  <Avatar className="border-2 border-background">
                    <AvatarImage src="https://github.com/shadcn.png" />
                  </Avatar>
                  <Avatar className="border-2 border-background">
                    <AvatarImage src="https://i.pravatar.cc/150?u=mike" />
                  </Avatar>
                  <Button variant="outline" size="icon" className="rounded-full ml-4 h-10 w-10 border-dashed">
                    <Plus className="w-4 h-4" />
                  </Button>
               </div>
            </div>
          </div>
        </aside>

        {/* Main Content Tabs */}
        <main className="flex-1 flex flex-col min-w-0">
          <Tabs defaultValue="tasks" className="flex-1 flex flex-col">
            <div className="border-b px-4 bg-card">
              <TabsList className="w-full justify-start h-12 bg-transparent p-0 space-x-6">
                <TabsTrigger value="tasks" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-0">
                  Tasks <Badge variant="secondary" className="ml-2">{tasks.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="notes" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-0">
                  Notes
                </TabsTrigger>
                <TabsTrigger value="photos" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-0">
                  Photos
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto bg-neutral-50/50 p-4 md:p-6">
              <div className="max-w-3xl mx-auto w-full">
                
                <TabsContent value="tasks" className="mt-0 space-y-4">
                  <Card>
                    <CardContent className="p-3 flex gap-2">
                      <Input 
                        placeholder="Add a new task..." 
                        className="border-0 shadow-none focus-visible:ring-0 px-2"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addTask()}
                      />
                      <Button size="sm" onClick={addTask}>Add</Button>
                    </CardContent>
                  </Card>

                  <div className="space-y-2">
                    {tasks.map((task) => (
                      <Card key={task.id} className="group hover:shadow-sm transition-all">
                        <CardContent className="p-4 flex items-center gap-4">
                          <button className={`mt-0.5 ${task.status === 'completed' ? 'text-green-600' : 'text-muted-foreground hover:text-primary'}`}>
                            {task.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                          </button>
                          <div className="flex-1">
                            <p className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                              {task.title}
                            </p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {task.dueDate}</span>
                              <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {task.assignee}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {tasks.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No tasks yet. Add one above!</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="notes" className="mt-0 space-y-4">
                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <Textarea 
                        placeholder="Write a note..." 
                        className="resize-none min-h-[100px]"
                        value={newNoteContent}
                        onChange={(e) => setNewNoteContent(e.target.value)}
                      />
                      <div className="flex justify-end">
                        <Button size="sm" onClick={addNote}>Post Note</Button>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-4">
                    {notes.map((note) => (
                      <div key={note.id} className="flex gap-4">
                        <Avatar className="mt-1">
                          <AvatarImage src="https://github.com/shadcn.png" />
                          <AvatarFallback>YO</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm">{note.author}</span>
                            <span className="text-xs text-muted-foreground">{note.date}</span>
                          </div>
                          <div className="text-sm text-foreground/90 bg-white p-3 rounded-lg border shadow-sm">
                            {note.content}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="photos" className="mt-0">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <button className="aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 hover:border-primary/50 transition-all">
                      <ImageIcon className="w-8 h-8 mb-2" />
                      <span className="text-sm font-medium">Add Photo</span>
                    </button>
                    {/* Mock photos */}
                    {[1, 2].map((i) => (
                       <div key={i} className="aspect-square rounded-xl bg-muted overflow-hidden relative group">
                          <img src={`https://picsum.photos/seed/${i + area.id}/400/400`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-end p-3">
                            <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100">
                              Field_View_{i}.jpg
                            </span>
                          </div>
                       </div>
                    ))}
                  </div>
                </TabsContent>

              </div>
            </div>
          </Tabs>
        </main>
      </div>
    </div>
  );
}

// Simple SVG preview for the sidebar mini-map
function MapPreview({ points, color }: { points: { x: number; y: number }[], color: string }) {
   if (points.length === 0) return null;
   const pointsStr = points.map((p) => `${p.x},${p.y}`).join(" ");
   return (
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
         <polygon points={pointsStr} fill={color} fillOpacity={0.8} stroke={color} strokeWidth={1} />
      </svg>
   )
}
