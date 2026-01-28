import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, Calendar, ArrowRight, User, MapPin, Github, Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface LoginFormProps {
  isLogin: boolean;
  setIsLogin: (isLogin: boolean) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  loading: boolean;
  formData: any;
  errors: Record<string, string>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  setRole: (role: "renter" | "companion") => void;
  setFormData: any;
  setErrors: any;
  showResendButton?: boolean;
  resending?: boolean;
  onResendEmail?: () => Promise<void>;
  onGoogleLogin?: () => void;
  onGithubLogin?: () => void;
}

export function LoginForm({
  isLogin,
  setIsLogin,
  showPassword,
  setShowPassword,
  loading,
  formData,
  errors,
  handleChange,
  handleSubmit,
  setRole,
  setFormData,
  setErrors,
  showResendButton,
  resending,
  onResendEmail,
  onGoogleLogin,
  onGithubLogin
}: LoginFormProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2 font-display text-foreground">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="text-muted-foreground">
          {isLogin 
            ? "Enter your credentials to access your account" 
            : "Sign up to start your journey with us"}
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex p-1 bg-muted/50 rounded-xl mb-8">
        <button
          type="button"
          onClick={() => setIsLogin(true)}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
            isLogin 
              ? "bg-background text-foreground shadow-sm" 
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => setIsLogin(false)}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
            !isLogin 
              ? "bg-background text-foreground shadow-sm" 
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Sign Up
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AnimatePresence mode="wait">
          {!isLogin && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 overflow-hidden"
            >
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="full_name"
                    name="full_name"
                    placeholder="John Doe"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="pl-10 h-12 bg-muted/30"
                  />
                </div>
                {errors.full_name && (
                  <p className="text-sm text-destructive">{errors.full_name}</p>
                )}
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <Label>I want to join as</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("renter")}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      formData.role === "renter"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <span className="block font-semibold">Renter</span>
                    <span className="text-xs text-muted-foreground">Find companions</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("companion")}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      formData.role === "companion"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <span className="block font-semibold">Companion</span>
                    <span className="text-xs text-muted-foreground">Offer services</span>
                  </button>
                </div>
                {errors.role && <p className="text-sm text-destructive">{errors.role}</p>}
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  placeholder="@username"
                  value={formData.username}
                  onChange={handleChange}
                  className="h-12 bg-muted/30"
                />
                {errors.username && (
                  <p className="text-sm text-destructive">{errors.username}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth (18+)</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="date_of_birth"
                    name="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className="pl-10 h-12 bg-muted/30"
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
                  className="w-full h-12 px-3 rounded-md border border-input bg-muted/30 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="prefer_not_to_say">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* City (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="city">City (Optional)</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="city"
                    name="city"
                    placeholder="Jakarta"
                    value={formData.city}
                    onChange={handleChange}
                    className="pl-10 h-12 bg-muted/30"
                  />
                </div>
              </div>

              {/* Bio (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio (Optional)</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  placeholder="Tell us about yourself..."
                  value={formData.bio}
                  onChange={handleChange}
                  className="min-h-[80px] bg-muted/30"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              className="pl-10 h-12 bg-muted/30"
            />
          </div>
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            {isLogin && (
              <a href="#" className="text-xs text-primary hover:underline">
                Forgot password?
              </a>
            )}
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="pl-10 pr-10 h-12 bg-muted/30"
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
              className="space-y-4 overflow-hidden"
            >
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-10 h-12 bg-muted/30"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Terms */}
              <div className="flex items-start gap-3">
                <Checkbox
                  id="agreeTerms"
                  checked={formData.agreeTerms}
                  onCheckedChange={(checked) => {
                    setFormData((prev: any) => ({ ...prev, agreeTerms: checked === true }));
                    if (errors.agreeTerms) {
                      setErrors((prev: any) => ({ ...prev, agreeTerms: "" }));
                    }
                  }}
                  className="mt-1"
                />
                <Label htmlFor="agreeTerms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer font-normal">
                  I agree to the <a href="/rules" className="text-primary hover:underline font-medium">Terms of Service</a> and confirm I am 18+ years old
                </Label>
              </div>
              {errors.agreeTerms && (
                <p className="text-sm text-destructive">{errors.agreeTerms}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Remember Me (Login only) */}
        {isLogin && (
          <div className="flex items-center gap-2">
            <Checkbox id="remember" />
            <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground cursor-pointer">
              Remember me
            </Label>
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full h-12 text-base font-medium rounded-xl mt-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-indigo-500/25" 
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              {isLogin ? "Sign In" : "Create Account"}
              <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </Button>

        {/* Resend Verification Button */}
        {isLogin && showResendButton && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-muted/50 rounded-xl border border-border"
          >
            <p className="text-sm text-muted-foreground mb-3 text-center">
              Belum menerima email verifikasi?
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full rounded-xl"
              disabled={resending}
              onClick={onResendEmail}
            >
              {resending ? "Mengirim..." : "Kirim Ulang Email Verifikasi"}
            </Button>
          </motion.div>
        )}

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-muted" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        {/* Social Login */}
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" type="button" onClick={onGoogleLogin} className="h-12 rounded-xl">
            <Chrome className="mr-2 h-4 w-4" />
            Google
          </Button>
          <Button variant="outline" type="button" onClick={onGithubLogin} className="h-12 rounded-xl">
            <Github className="mr-2 h-4 w-4" />
            GitHub
          </Button>
        </div>
      </form>
    </div>
  );
}
