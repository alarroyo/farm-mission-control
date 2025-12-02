import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Save, Upload, User as UserIcon, Mail, Briefcase } from "lucide-react";
import type { User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { userAPI } from "@/lib/api";

export default function Profile() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: user } = useQuery({ queryKey: ["user"], queryFn: userAPI.get });
  const [formData, setFormData] = useState<Partial<User>>({});
  
  useEffect(() => {
    if (user) {
      setFormData(user);
    }
  }, [user]);

  const updateUserMutation = useMutation({
    mutationFn: (data: Partial<User>) => userAPI.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast({
        title: "Profile Updated",
        description: "Your changes have been saved successfully.",
      });
    },
  });

  const handleSave = () => {
    updateUserMutation.mutate(formData);
  };
  
  if (!user) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-neutral-50/50 flex flex-col">
      <header className="h-16 border-b bg-card flex items-center justify-between px-4 shrink-0 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-display font-bold text-lg">Edit Profile</h1>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-2xl mx-auto w-full">
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-start gap-6">
             <div className="relative group">
                <Avatar className="w-24 h-24 border-4 border-background shadow-sm">
                  <AvatarImage src={formData.avatar} />
                  <AvatarFallback>{formData.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                   <Upload className="w-6 h-6 text-white" />
                </div>
             </div>
             <div className="pt-2">
                <h2 className="text-2xl font-bold">{formData.name}</h2>
                <p className="text-muted-foreground">{formData.role}</p>
             </div>
          </div>

          <Card>
             <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details and role within the farm.</CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
                <div className="grid gap-2">
                   <Label htmlFor="name">Full Name</Label>
                   <div className="relative">
                      <UserIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="name" 
                        value={formData.name || ""} 
                        onChange={(e) => setFormData({...formData, name: e.target.value})} 
                        className="pl-9"
                      />
                   </div>
                </div>

                <div className="grid gap-2">
                   <Label htmlFor="role">Role / Title</Label>
                   <div className="relative">
                      <Briefcase className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="role" 
                        value={formData.role || ""} 
                        onChange={(e) => setFormData({...formData, role: e.target.value})} 
                        className="pl-9"
                      />
                   </div>
                </div>

                <div className="grid gap-2">
                   <Label htmlFor="email">Email Address</Label>
                   <div className="relative">
                      <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="email" 
                        type="email"
                        value={formData.email || ""} 
                        onChange={(e) => setFormData({...formData, email: e.target.value})} 
                        className="pl-9"
                      />
                   </div>
                </div>

                <div className="grid gap-2">
                   <Label htmlFor="bio">Bio</Label>
                   <Textarea 
                      id="bio"
                      value={formData.bio || ""}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      className="min-h-[100px]"
                      placeholder="Tell us a bit about yourself..."
                   />
                </div>

                <div className="pt-4 flex justify-end">
                   <Button onClick={handleSave} disabled={updateUserMutation.isPending} className="min-w-[120px]">
                      {updateUserMutation.isPending ? "Saving..." : (
                         <>
                            <Save className="w-4 h-4 mr-2" /> Save Changes
                         </>
                      )}
                   </Button>
                </div>
             </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}