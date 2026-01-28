import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Camera, Edit2, MapPin, Calendar, User, Save, X, Sparkles, BadgeCheck, Clock, Star, Check, ChevronLeft, DollarSign, MessageCircle, Heart, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MobileLayout } from "@/components/MobileLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { formatCount, calculateAge } from "@/lib/formatters";
import { AvatarUpload } from "@/components/profile/AvatarUpload";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Profile() {
  const { user, signOut } = useAuth();
  const { profile, loading, updateProfile, refetch } = useProfile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isCompanion = (profile?.role as any) === "companion";
  
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    city: "",
    bio: "",
    interests: [] as string[],
    availability: "",
    hourlyRate: 0 as number,
    personality: [] as string[],
    activities: [] as string[],
    packages: [] as { name: string; duration: string; price: number }[],
  });
  const [newInterest, setNewInterest] = useState("");
  const [newPersonality, setNewPersonality] = useState("");
  const [newActivity, setNewActivity] = useState("");
  const [newPackage, setNewPackage] = useState<{ name: string; duration: string; price: string }>({
    name: "",
    duration: "",
    price: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleLogout = async () => {
    await signOut();
    setShowLogoutDialog(false);
    navigate("/");
    toast({
      title: "Sampai jumpa! 👋",
      description: "Kamu sudah keluar dari akun",
    });
  };

  useEffect(() => {
    if (!user && !loading) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile) {
      const interests = Array.isArray(profile.interests) ? profile.interests : (profile.interests ? [profile.interests] : []);
      const personality = Array.isArray(profile.personality) ? profile.personality : (profile.personality ? [profile.personality] : []);
      const activities = Array.isArray(profile.activities) ? profile.activities : (profile.activities ? [profile.activities] : []);
      const packages = Array.isArray(profile.packages) ? profile.packages : (profile.packages ? [profile.packages] : []);
      
      setFormData({
        full_name: profile.full_name || "",
        username: profile.username || "",
        city: profile.city || "",
        bio: profile.bio || "",
        interests,
        availability: profile.availability || "",
        hourlyRate: profile.hourly_rate || 0,
        personality,
        activities,
        packages,
      });
      
      console.log('Profile data loaded:', {
        interests,
        personality,
        activities,
        packages,
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()],
      }));
      setNewInterest("");
    }
  };

  const removeInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest),
    }));
  };

  const addPersonality = () => {
    if (newPersonality.trim() && !formData.personality.includes(newPersonality.trim())) {
      setFormData(prev => ({
        ...prev,
        personality: [...prev.personality, newPersonality.trim()],
      }));
      setNewPersonality("");
    }
  };

  const removePersonality = (trait: string) => {
    setFormData(prev => ({
      ...prev,
      personality: prev.personality.filter(t => t !== trait),
    }));
  };

  const addActivity = () => {
    if (newActivity.trim() && !formData.activities.includes(newActivity.trim())) {
      setFormData(prev => ({
        ...prev,
        activities: [...prev.activities, newActivity.trim()],
      }));
      setNewActivity("");
    }
  };

  const removeActivity = (activity: string) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.filter(a => a !== activity),
    }));
  };

  const addPackage = () => {
    if (!newPackage.name.trim() || !newPackage.duration.trim() || !newPackage.price.trim()) return;
    const priceNum = Number(newPackage.price);
    if (Number.isNaN(priceNum) || priceNum <= 0) {
      setErrors(prev => ({ ...prev, packages: "Harga paket harus angka dan > 0" }));
      return;
    }
    setFormData(prev => ({
      ...prev,
      packages: [...prev.packages, { name: newPackage.name.trim(), duration: newPackage.duration.trim(), price: priceNum }],
    }));
    setNewPackage({ name: "", duration: "", price: "" });
    setErrors(prev => {
      const { packages, ...rest } = prev;
      return rest;
    });
  };

  const removePackage = (name: string) => {
    setFormData(prev => ({
      ...prev,
      packages: prev.packages.filter(p => p.name !== name),
    }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!formData.full_name.trim()) nextErrors.full_name = "Nama wajib diisi";
    if (!formData.username.trim()) nextErrors.username = "Username wajib diisi";
    if (formData.bio && formData.bio.length > 300) nextErrors.bio = "Bio maksimal 300 karakter";

    // Companion-specific validation
    if (isCompanion) {
      if (!formData.city.trim()) nextErrors.city = "Kota wajib diisi";
      if (!formData.bio.trim()) nextErrors.bio = "About Me wajib diisi";
      if (!formData.availability.trim()) nextErrors.availability = "Ketersediaan wajib diisi";
      if (!formData.hourlyRate || Number(formData.hourlyRate) <= 0) nextErrors.hourlyRate = "Harga per jam harus > 0";
      if (formData.personality.length === 0) nextErrors.personality = "Minimal 1 kepribadian";
      if (formData.activities.length === 0) nextErrors.activities = "Minimal 1 aktivitas";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      toast({
        title: "Validasi gagal",
        description: "Periksa kembali data yang wajib diisi",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    
    const baseUpdates: any = {
      full_name: formData.full_name.trim(),
      username: formData.username.trim(),
      city: formData.city.trim() || null,
      bio: formData.bio.trim() || null,
      interests: formData.interests.length > 0 ? formData.interests : null,
    };

    // Only companions can edit companion-specific fields (keeps renter profiles clean)
    if (isCompanion) {
      baseUpdates.availability = formData.availability.trim() || null;
      baseUpdates.hourly_rate = formData.hourlyRate || 0;
      baseUpdates.personality = formData.personality.length > 0 ? formData.personality : null;
      baseUpdates.activities = formData.activities.length > 0 ? formData.activities : null;
      baseUpdates.packages = formData.packages.length > 0 ? formData.packages : null;
    }

    const cleanUpdates: any = {};
    for (const [key, value] of Object.entries(baseUpdates)) {
      if (value !== null && value !== undefined && value !== '') {
        cleanUpdates[key] = value;
      }
    }

    try {
      const { error } = await updateProfile(cleanUpdates);
      
      if (error) {
        toast({
          title: "Gagal menyimpan",
          description: error.message || "Terjadi kesalahan saat menyimpan profil. Silakan coba lagi.",
          variant: "destructive",
        });
        setSaving(false);
        return;
      }
      
      await refetch();
      await new Promise(resolve => setTimeout(resolve, 200));
      
      toast({
        title: "Profil diperbarui! ✨",
        description: "Perubahan sudah tersimpan",
      });
      
      setIsEditing(false);
    } catch (err: any) {
      toast({
        title: "Terjadi kesalahan",
        description: err?.message || "Terjadi kesalahan tidak terduga. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Sparkles className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MobileLayout>
    );
  }

  if (!profile) return null;

  return (
    <MobileLayout showFooter={false}>
      <div className="min-h-screen bg-background pb-32">
        {/* Hero Section */}
        <div className="relative">
          {/* Header Actions (Absolute) */}
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full bg-background/20 backdrop-blur-md hover:bg-background/40 text-foreground"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <div />
          </div>

          {/* Gradient Background */}
          <div className="h-48 bg-gradient-to-br from-primary/20 via-pink-500/10 to-background rounded-b-[2.5rem]" />
          
          <div className="px-4 -mt-20 flex flex-col items-center">
            {/* Avatar & Edit Button */}
            <div className="relative">
              <AvatarUpload
                currentAvatarUrl={profile.avatar_url}
                onUploadSuccess={async () => {
                  await refetch();
                }}
              />
            </div>

            {/* Name & Badge */}
            <div className="mt-4 text-center space-y-1 w-full max-w-xs">
              <div className="flex items-center justify-center gap-2">
                {isEditing ? (
                  <Input 
                    name="full_name" 
                    value={formData.full_name} 
                    onChange={handleChange} 
                    className="text-center font-bold text-xl h-10 w-full"
                    placeholder="Nama Lengkap"
                  />
                ) : (
                  <h1 className="text-2xl font-display font-bold text-foreground">
                    {profile.full_name}
                  </h1>
                )}
                {profile.is_verified && <BadgeCheck className="w-6 h-6 text-primary flex-shrink-0" />}
              </div>
              
              {isEditing ? (
                <Input 
                  name="username" 
                  value={formData.username} 
                  onChange={handleChange} 
                  className="text-center text-sm h-8 w-full max-w-[150px] mx-auto mt-2"
                  placeholder="username"
                />
              ) : (
                <p className="text-muted-foreground">@{profile.username}</p>
              )}

              {/* Status Badges */}
              <div className="flex gap-2 justify-center mt-3 flex-wrap">
                <Badge variant="secondary" className="rounded-full bg-green-500/10 text-green-600 hover:bg-green-500/20 border-none px-3 py-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                  Online
                </Badge>
                {isEditing ? (
                  <Input 
                    name="city" 
                    value={formData.city} 
                    onChange={handleChange} 
                    className="h-8 w-32 text-center text-xs" 
                    placeholder="Kota"
                  />
                ) : (
                  profile.city && (
                    <Badge variant="outline" className="rounded-full border-border/50 bg-background/50 px-3 py-1">
                      <MapPin className="w-3 h-3 mr-1.5 text-muted-foreground" />
                      {profile.city}
                    </Badge>
                  )
                )}
              </div>
            </div>

            {/* Hourly Rate Card (Floating) */}
            {isCompanion && (
              <Card className="mt-6 border-none shadow-soft bg-gradient-to-r from-primary/5 to-pink-500/5 w-full max-w-xs overflow-hidden relative">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full" />
                <CardContent className="p-4 flex items-center gap-4 relative z-10">
                  <div className="p-3 bg-background rounded-2xl shadow-sm ring-1 ring-border/50">
                    <DollarSign className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-0.5">Mulai dari</p>
                    {isEditing ? (
                      <Input 
                        name="hourlyRate" 
                        type="number" 
                        value={formData.hourlyRate} 
                        onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: Number(e.target.value) }))}
                        className="h-8 w-32"
                      />
                    ) : (
                      <p className="text-xl font-bold text-primary tracking-tight">
                        {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(formData.hourlyRate)}
                        <span className="text-sm font-normal text-muted-foreground ml-1">/jam</span>
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>



        {/* Content Sections */}
        <div className="px-4 mt-8 space-y-8 max-w-md mx-auto">
          {/* About Me */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
              Tentang Aku <span className="text-xl animate-wave">👋</span>
            </h3>
            <Card className="border-border/40 shadow-sm bg-card/50">
              <CardContent className="p-5">
                {isEditing ? (
                  <Textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Ceritakan sedikit tentang dirimu yang menarik..."
                    rows={5}
                    className="bg-background/50 resize-none border-border/50 focus:border-primary/50"
                  />
                ) : (
                  <p className="leading-relaxed text-muted-foreground text-sm">
                    {profile.bio || "Belum ada deskripsi diri. Yuk isi biar orang lain lebih kenal kamu!"}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Service Details (Grid) */}
          {isCompanion && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-foreground">Detail Layanan ✨</h3>
              <div className="grid grid-cols-2 gap-3">
                <Card className="border-border/40 shadow-sm bg-card/50 hover:border-primary/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center mb-3">
                      <Clock className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">Jam Aktif</p>
                    {isEditing ? (
                      <Input 
                        name="availability" 
                        value={formData.availability} 
                        onChange={handleChange} 
                        className="h-8 text-xs" 
                        placeholder="Cth: 09:00 - 21:00"
                      />
                    ) : (
                      <p className="font-semibold text-sm text-foreground">{formData.availability || "-"}</p>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="border-border/40 shadow-sm bg-card/50 hover:border-primary/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center mb-3">
                      <MapPin className="w-4 h-4 text-purple-500" />
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">Lokasi</p>
                    <p className="font-semibold text-sm text-foreground">{profile.city || "-"}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

           {/* Interests */}
           <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              Minat & Hobi <Sparkles className="w-4 h-4 text-yellow-500" />
            </h3>
            <div className="flex flex-wrap gap-2">
              {formData.interests.map((interest) => (
                <Badge 
                  key={interest} 
                  variant="secondary" 
                  className="rounded-full px-4 py-1.5 bg-background border border-border/50 text-foreground hover:bg-muted transition-all text-sm font-normal"
                >
                  {interest}
                  {isEditing && (
                    <button 
                      onClick={() => removeInterest(interest)} 
                      className="ml-2 hover:text-destructive transition-colors"
                    >
                      ×
                    </button>
                  )}
                </Badge>
              ))}
              {isEditing && (
                <div className="flex items-center gap-2">
                  <Input
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    placeholder="Tambah..."
                    className="h-8 w-24 text-sm rounded-full"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addInterest())}
                  />
                  <Button size="icon" variant="outline" className="h-8 w-8 rounded-full" onClick={addInterest}>+</Button>
                </div>
              )}
            </div>
          </div>
          
          {/* Personality & Activities for Companion */}
          {isCompanion && (
            <>
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-foreground">Kepribadian</h3>
                <div className="flex flex-wrap gap-2">
                  {formData.personality.map((trait) => (
                    <Badge 
                      key={trait} 
                      variant="outline" 
                      className="rounded-full px-4 py-1.5 border-primary/20 bg-primary/5 text-primary text-sm"
                    >
                      {trait}
                      {isEditing && (
                        <button onClick={() => removePersonality(trait)} className="ml-2 hover:text-destructive">×</button>
                      )}
                    </Badge>
                  ))}
                  {isEditing && (
                    <div className="flex items-center gap-2">
                      <Input
                        value={newPersonality}
                        onChange={(e) => setNewPersonality(e.target.value)}
                        placeholder="Tambah..."
                        className="h-8 w-24 text-sm rounded-full"
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addPersonality())}
                      />
                      <Button size="icon" variant="outline" className="h-8 w-8 rounded-full" onClick={addPersonality}>+</Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-foreground">Bisa Nemenin Untuk</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {formData.activities.map((activity) => (
                    <div key={activity} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-sm font-medium">{activity}</span>
                      {isEditing && (
                        <button onClick={() => removeActivity(activity)} className="ml-auto text-muted-foreground hover:text-destructive">×</button>
                      )}
                    </div>
                  ))}
                  {isEditing && (
                    <div className="flex items-center gap-2">
                      <Input
                        value={newActivity}
                        onChange={(e) => setNewActivity(e.target.value)}
                        placeholder="Tambah aktivitas..."
                        className="h-9 text-sm rounded-xl"
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addActivity())}
                      />
                      <Button size="icon" variant="outline" className="h-9 w-9 rounded-xl" onClick={addActivity}>+</Button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

        </div>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border/50 z-50">
        <div className="container max-w-md mx-auto flex gap-3">
          {isEditing ? (
            <>
              <Button 
                variant="outline" 
                className="flex-1 rounded-2xl h-12 border-2" 
                onClick={() => setIsEditing(false)}
                disabled={saving}
              >
                Batal
              </Button>
              <Button 
                variant="gradient" 
                className="flex-1 rounded-2xl h-12 shadow-lg shadow-primary/20" 
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                className="rounded-2xl h-12 px-4 text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={() => setShowLogoutDialog(true)}
              >
                <LogOut className="w-5 h-5 mr-2" />
                Keluar
              </Button>
              <Button 
                variant="gradient" 
                className="flex-1 rounded-2xl h-12 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all" 
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="w-5 h-5 mr-2" />
                Edit Profil
              </Button>
            </>
          )}
        </div>
      </div>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Keluar dari akun?</AlertDialogTitle>
            <AlertDialogDescription>
              Kamu akan keluar dari akun ini. Kamu bisa login kembali kapan saja.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Ya, Keluar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MobileLayout>
  );
}
