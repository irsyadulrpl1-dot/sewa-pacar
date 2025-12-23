import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Camera, Edit2, MapPin, Calendar, User, Save, X, LogOut, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MobileLayout } from "@/components/MobileLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { user, signOut } = useAuth();
  const { profile, loading, updateProfile } = useProfile();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    city: "",
    bio: "",
    interests: [] as string[],
  });
  const [newInterest, setNewInterest] = useState("");

  useEffect(() => {
    if (!user && !loading) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        username: profile.username || "",
        city: profile.city || "",
        bio: profile.bio || "",
        interests: profile.interests || [],
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

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateProfile(formData);
    
    if (error) {
      toast({
        title: "Gagal menyimpan",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profil diperbarui! ✨",
        description: "Perubahan sudah tersimpan",
      });
      setIsEditing(false);
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
    toast({
      title: "Sampai jumpa! 👋",
      description: "Kamu sudah keluar dari akun",
    });
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
      <MobileLayout showFooter={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Sparkles className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MobileLayout>
    );
  }

  if (!profile) return null;

  return (
    <MobileLayout showFooter={false}>
      <div className="px-4 py-6 pb-24 md:py-24 max-w-2xl mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          {/* Avatar */}
          <div className="relative inline-block mb-4">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-lavender to-pink p-1">
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                {profile.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={profile.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-muted-foreground" />
                )}
              </div>
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-primary rounded-full text-primary-foreground shadow-lg">
              <Camera className="w-4 h-4" />
            </button>
            
            {/* Online indicator */}
            <div className="absolute top-2 right-2 w-4 h-4 bg-mint rounded-full border-2 border-background" />
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <Input
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="text-center text-xl font-bold rounded-xl"
              />
              <Input
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="text-center text-sm rounded-xl"
                placeholder="@username"
              />
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-display font-bold text-foreground mb-1">
                {profile.full_name}
              </h1>
              <p className="text-muted-foreground">@{profile.username}</p>
            </>
          )}

          {/* Stats */}
          <div className="flex items-center justify-center gap-4 mt-4 text-sm">
            {profile.date_of_birth && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {calculateAge(profile.date_of_birth)} tahun
              </span>
            )}
            {profile.city && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                {profile.city}
              </span>
            )}
          </div>

          {profile.is_verified && (
            <Badge className="mt-3 bg-mint/20 text-mint border-mint/30">
              ✓ Terverifikasi
            </Badge>
          )}
        </motion.div>

        {/* Edit/Save Buttons */}
        <div className="flex gap-3 justify-center mb-6">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="rounded-xl"
              >
                <X className="w-4 h-4 mr-2" />
                Batal
              </Button>
              <Button
                variant="gradient"
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Menyimpan..." : "Simpan"}
              </Button>
            </>
          ) : (
            <Button
              variant="soft"
              onClick={() => setIsEditing(true)}
              className="rounded-xl"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profil
            </Button>
          )}
        </div>

        {/* Profile Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-3xl p-6 space-y-6"
        >
          {/* Bio */}
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">Bio</Label>
            {isEditing ? (
              <Textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Ceritakan tentang dirimu..."
                className="rounded-xl"
              />
            ) : (
              <p className="text-foreground">
                {profile.bio || "Belum ada bio"}
              </p>
            )}
          </div>

          {/* City */}
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">Kota</Label>
            {isEditing ? (
              <Input
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Jakarta, Bandung, dll"
                className="rounded-xl"
              />
            ) : (
              <p className="text-foreground">
                {profile.city || "Belum diatur"}
              </p>
            )}
          </div>

          {/* Interests */}
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">Minat & Hobi</Label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.interests.map((interest) => (
                <Badge
                  key={interest}
                  variant="secondary"
                  className="rounded-full px-3 py-1"
                >
                  {interest}
                  {isEditing && (
                    <button
                      onClick={() => removeInterest(interest)}
                      className="ml-2 hover:text-destructive"
                    >
                      ×
                    </button>
                  )}
                </Badge>
              ))}
              {formData.interests.length === 0 && !isEditing && (
                <span className="text-muted-foreground">Belum ada minat</span>
              )}
            </div>
            {isEditing && (
              <div className="flex gap-2">
                <Input
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  placeholder="Tambah minat..."
                  className="rounded-xl"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addInterest())}
                />
                <Button
                  type="button"
                  variant="soft"
                  onClick={addInterest}
                  className="rounded-xl"
                >
                  Tambah
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Account Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Keluar
          </Button>
        </motion.div>
      </div>
    </MobileLayout>
  );
}
