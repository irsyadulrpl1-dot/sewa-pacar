import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, User, Mail, Lock, MapPin, Calendar, Sparkles, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

const registerSchema = z.object({
  full_name: z.string().min(2, "Nama minimal 2 karakter").max(100),
  username: z.string().min(3, "Username minimal 3 karakter").max(30).regex(/^[a-zA-Z0-9_]+$/, "Username hanya boleh huruf, angka, dan underscore"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  confirmPassword: z.string(),
  date_of_birth: z.string().refine((val) => {
    const birthDate = new Date(val);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 18;
  }, "Kamu harus berusia 18+ untuk mendaftar"),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional(),
  city: z.string().optional(),
  bio: z.string().max(500).optional(),
  agreeTerms: z.boolean().refine((val) => val === true, "Kamu harus menyetujui syarat & ketentuan"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
});

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    date_of_birth: "",
    gender: "prefer_not_to_say" as const,
    city: "",
    bio: "",
    agreeTerms: false,
  });

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      if (isLogin) {
        const result = loginSchema.safeParse({
          email: formData.email,
          password: formData.password,
        });

        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach(err => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          setLoading(false);
          return;
        }

        const { error } = await signIn(formData.email, formData.password);
        
        if (error) {
          toast({
            title: "Gagal masuk",
            description: error.message === "Invalid login credentials" 
              ? "Email atau password salah" 
              : error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Berhasil masuk! 🎉",
            description: "Selamat datang kembali!",
          });
          navigate("/");
        }
      } else {
        const result = registerSchema.safeParse(formData);

        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach(err => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          setLoading(false);
          return;
        }

        const { error } = await signUp(formData.email, formData.password, {
          full_name: formData.full_name,
          username: formData.username,
          date_of_birth: formData.date_of_birth,
          gender: formData.gender,
          city: formData.city || undefined,
          bio: formData.bio || undefined,
        });

        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              title: "Email sudah terdaftar",
              description: "Coba login atau gunakan email lain",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Gagal mendaftar",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Pendaftaran berhasil! 🎉",
            description: "Akun kamu sudah aktif. Selamat datang!",
          });
          navigate("/");
        }
      }
    } catch (err) {
      toast({
        title: "Terjadi kesalahan",
        description: "Silakan coba lagi",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-lavender/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="inline-flex items-center gap-2 mb-4"
          >
            <Heart className="w-8 h-8 text-primary" fill="currentColor" />
            <span className="text-3xl font-display font-bold text-gradient">Temani</span>
          </motion.div>
          <p className="text-muted-foreground">
            {isLogin ? "Masuk ke akunmu" : "Buat akun baru"}
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-card rounded-3xl p-6 md:p-8 shadow-soft">
          {/* Tab Switcher */}
          <div className="flex p-1 bg-muted/50 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                isLogin 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                !isLogin 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Daftar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Nama Lengkap *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="full_name"
                        name="full_name"
                        placeholder="Masukkan nama lengkap"
                        value={formData.full_name}
                        onChange={handleChange}
                        className="pl-10 rounded-xl h-12"
                      />
                    </div>
                    {errors.full_name && (
                      <p className="text-sm text-destructive">{errors.full_name}</p>
                    )}
                  </div>

                  {/* Username */}
                  <div className="space-y-2">
                    <Label htmlFor="username">Username *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                      <Input
                        id="username"
                        name="username"
                        placeholder="username_kamu"
                        value={formData.username}
                        onChange={handleChange}
                        className="pl-10 rounded-xl h-12"
                      />
                    </div>
                    {errors.username && (
                      <p className="text-sm text-destructive">{errors.username}</p>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Tanggal Lahir * (18+)</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="date_of_birth"
                        name="date_of_birth"
                        type="date"
                        value={formData.date_of_birth}
                        onChange={handleChange}
                        className="pl-10 rounded-xl h-12"
                      />
                    </div>
                    {errors.date_of_birth && (
                      <p className="text-sm text-destructive">{errors.date_of_birth}</p>
                    )}
                  </div>

                  {/* Gender */}
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full h-12 px-3 rounded-xl bg-background border border-input text-foreground"
                    >
                      <option value="prefer_not_to_say">Pilih gender</option>
                      <option value="male">Laki-laki</option>
                      <option value="female">Perempuan</option>
                      <option value="other">Lainnya</option>
                    </select>
                  </div>

                  {/* City */}
                  <div className="space-y-2">
                    <Label htmlFor="city">Kota</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="city"
                        name="city"
                        placeholder="Jakarta, Bandung, dll"
                        value={formData.city}
                        onChange={handleChange}
                        className="pl-10 rounded-xl h-12"
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio singkat</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      placeholder="Ceritakan sedikit tentang dirimu..."
                      value={formData.bio}
                      onChange={handleChange}
                      className="rounded-xl min-h-[80px]"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 rounded-xl h-12"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-10 rounded-xl h-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password (Register only) */}
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <Label htmlFor="confirmPassword">Konfirmasi Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="pl-10 rounded-xl h-12"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                  )}

                  {/* Terms */}
                  <div className="flex items-start gap-3 pt-2">
                    <input
                      id="agreeTerms"
                      name="agreeTerms"
                      type="checkbox"
                      checked={formData.agreeTerms}
                      onChange={handleChange}
                      className="mt-1 w-4 h-4 rounded border-input"
                    />
                    <Label htmlFor="agreeTerms" className="text-sm text-muted-foreground leading-relaxed">
                      Saya menyetujui <a href="/rules" className="text-primary hover:underline">Syarat & Ketentuan</a> serta berusia 18 tahun ke atas
                    </Label>
                  </div>
                  {errors.agreeTerms && (
                    <p className="text-sm text-destructive">{errors.agreeTerms}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full rounded-xl h-12 mt-6"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 animate-spin" />
                  {isLogin ? "Masuk..." : "Mendaftar..."}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  {isLogin ? "Masuk" : "Daftar Sekarang"}
                </span>
              )}
            </Button>
          </form>
        </div>

        {/* Back to home */}
        <p className="text-center mt-6 text-sm text-muted-foreground">
          <a href="/" className="hover:text-primary transition-colors">
            ← Kembali ke beranda
          </a>
        </p>
      </motion.div>
    </div>
  );
}
