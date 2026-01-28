import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { BrandingSection } from "@/components/auth/BrandingSection";
import { LoginForm } from "@/components/auth/LoginForm";
import MultiStepRegister from "@/components/register/MultiStepRegister";

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
  role: z.enum(["renter", "companion"], { message: "Pilih peran terlebih dahulu" }),
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
  
  const { signIn, signUp, user, loading: authLoading, resendVerificationEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [showResendButton, setShowResendButton] = useState(false);
  const [resending, setResending] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "" as "" | "renter" | "companion",
    date_of_birth: "",
    gender: "prefer_not_to_say" as const,
    city: "",
    bio: "",
    agreeTerms: false,
    phone: "",
    avatar_url: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const redirectTarget = params.get("redirect") || "/";
    if (!authLoading && user) {
      navigate(redirectTarget, { replace: true });
    }
  }, [user, authLoading, navigate, location.search]);

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

  const setRole = (role: "renter" | "companion") => {
    setFormData(prev => ({ ...prev, role }));
    if (errors.role) {
      setErrors(prev => ({ ...prev, role: "" }));
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
          setLoading(false);
          
          let errorTitle = "Gagal masuk";
          let errorDescription = error.message;
          
          if (error.message.includes("Invalid login credentials") || error.message.includes("salah")) {
            errorTitle = "Email atau password salah";
            errorDescription = "Pastikan email dan password yang Anda masukkan benar. Jika baru mendaftar, pastikan email sudah diverifikasi.";
          } else if (error.message.includes("Email not confirmed") || error.message.includes("belum terverifikasi")) {
            errorTitle = "Email belum terverifikasi";
            errorDescription = "Silakan cek email Anda dan klik link verifikasi sebelum login.";
            setShowResendButton(true);
          } else if (error.message.includes("User not found") || error.message.includes("tidak terdaftar")) {
            errorTitle = "Email tidak terdaftar";
            errorDescription = "Email ini belum terdaftar. Silakan daftar terlebih dahulu.";
          } else if (error.message.includes("Too many requests")) {
            errorTitle = "Terlalu banyak percobaan";
            errorDescription = "Silakan tunggu beberapa saat sebelum mencoba lagi.";
          }
          
          toast({
            title: errorTitle,
            description: errorDescription,
            variant: "destructive",
          });
        } else {
          setShowResendButton(false);
          toast({
            title: "Berhasil masuk! 🎉",
            description: "Selamat datang kembali!",
          });
          setLoading(false);
          const params = new URLSearchParams(location.search);
          const redirectTarget = params.get("redirect") || "/";
          navigate(redirectTarget, { replace: true });
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

        const { error, data } = await signUp(formData.email, formData.password, {
          full_name: formData.full_name,
          username: formData.username,
          role: formData.role as any,
          date_of_birth: formData.date_of_birth,
          gender: formData.gender,
          city: formData.city || undefined,
          bio: formData.bio || undefined,
        });

        if (error) {
          let errorTitle = "Gagal mendaftar";
          let errorDescription = error.message;
          
          if (error.message.includes("Signups not allowed")) {
            errorTitle = "Registrasi dinonaktifkan";
            errorDescription = "Registrasi saat ini dinonaktifkan.";
          } else if (error.message.includes("already registered") || error.message.includes("already exists")) {
            errorTitle = "Email sudah terdaftar";
            errorDescription = "Email ini sudah digunakan. Silakan login atau gunakan email lain.";
          } else if (error.message.includes("username")) {
            errorTitle = "Username sudah digunakan";
            errorDescription = "Username ini sudah dipakai. Silakan pilih username lain.";
          }
          
          toast({
            title: errorTitle,
            description: errorDescription,
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        if (data?.user && !data?.session) {
          toast({
            title: "Pendaftaran berhasil! 📧",
            description: "Silakan cek email Anda untuk verifikasi akun sebelum login.",
          });
          setTimeout(() => {
            setIsLogin(true);
          }, 2000);
        } else {
          toast({
            title: "Pendaftaran berhasil! 🎉",
            description: "Selamat datang!",
          });
          await new Promise(resolve => setTimeout(resolve, 300));
          const params = new URLSearchParams(location.search);
          const redirectTarget = params.get("redirect") || "/";
          navigate(redirectTarget, { replace: true });
        }
      }
    } catch (err) {
      console.error('Unexpected error in handleSubmit:', err);
      setLoading(false);
      toast({
        title: "Terjadi kesalahan",
        description: "Silakan coba lagi",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  const handleResendEmail = async () => {
    setResending(true);
    try {
      const { error } = await resendVerificationEmail(formData.email);
      if (error) {
        toast({
          title: "Gagal mengirim email",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Email terkirim! 📧",
          description: "Silakan cek inbox email Anda untuk link verifikasi.",
        });
        setShowResendButton(false);
      }
    } catch (error) {
      toast({
        title: "Terjadi kesalahan",
        description: "Gagal mengirim ulang email.",
        variant: "destructive",
      });
    } finally {
      setResending(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Login Gagal",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleGithubLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Login Gagal",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const handleRegisterFinalSubmit = async () => {
    setLoading(true);
    setErrors({});
    try {
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
      const { error, data } = await signUp(formData.email, formData.password, {
        full_name: formData.full_name,
        username: formData.username,
        role: formData.role as any,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        city: formData.city || undefined,
        bio: formData.bio || undefined,
      });
      if (error) {
        let errorTitle = "Gagal mendaftar";
        let errorDescription = error.message;
        if (error.message.includes("Signups not allowed")) {
          errorTitle = "Registrasi dinonaktifkan";
          errorDescription = "Registrasi saat ini dinonaktifkan.";
        } else if (error.message.includes("already registered") || error.message.includes("already exists")) {
          errorTitle = "Email sudah terdaftar";
          errorDescription = "Email ini sudah digunakan. Silakan login atau gunakan email lain.";
        } else if (error.message.includes("username")) {
          errorTitle = "Username sudah digunakan";
          errorDescription = "Username ini sudah dipakai. Silakan pilih username lain.";
        }
        toast({
          title: errorTitle,
          description: errorDescription,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      if (data?.user && !data?.session) {
        toast({
          title: "Pendaftaran berhasil! 📧",
          description: "Silakan cek email Anda untuk verifikasi akun sebelum login.",
        });
        setTimeout(() => {
          setIsLogin(true);
        }, 2000);
      } else {
        toast({
          title: "Pendaftaran berhasil! 🎉",
          description: "Selamat datang!",
        });
        await new Promise(resolve => setTimeout(resolve, 300));
        const params = new URLSearchParams(location.search);
        const redirectTarget = params.get("redirect") || "/";
        navigate(redirectTarget, { replace: true });
      }
    } catch (err) {
      setLoading(false);
      toast({
        title: "Terjadi kesalahan",
        description: "Silakan coba lagi",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <AuthLayout branding={<BrandingSection />}>
      {isLogin ? (
        <LoginForm
          isLogin={isLogin}
          setIsLogin={setIsLogin}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          loading={loading}
          formData={formData}
          errors={errors}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          setRole={setRole}
          setFormData={setFormData}
          setErrors={setErrors}
          showResendButton={showResendButton}
          resending={resending}
          onResendEmail={handleResendEmail}
          onGoogleLogin={handleGoogleLogin}
          onGithubLogin={handleGithubLogin}
        />
      ) : (
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 font-display text-foreground">Create Account</h2>
            <p className="text-muted-foreground">Sign up to start your journey with us</p>
          </div>
          <div className="flex p-1 bg-muted/50 rounded-xl mb-8">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all text-muted-foreground hover:text-foreground"
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all bg-background text-foreground shadow-sm"
            >
              Sign Up
            </button>
          </div>
          <MultiStepRegister
            data={formData}
            setData={setFormData}
            loading={loading}
            onFinalSubmit={handleRegisterFinalSubmit}
          />
        </div>
      )}
    </AuthLayout>
  );
}
