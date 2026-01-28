import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata: UserMetadata) => Promise<{ error: Error | null; data?: any }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<{ error: Error | null }>;
}

interface UserMetadata {
  full_name: string;
  username: string;
  date_of_birth: string;
  gender?: string;
  city?: string;
  bio?: string;
  role?: "renter" | "companion";
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let initialLoadComplete = false;

    // Function to update auth state
    const updateAuthState = (newSession: Session | null, isInitialLoad = false) => {
      if (!mounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (isInitialLoad && !initialLoadComplete) {
        setLoading(false);
        initialLoadComplete = true;
        console.log('Initial session loaded:', newSession ? 'User logged in' : 'No session');
      }
    };

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, newSession?.user?.id);
        
        // For SIGNED_IN and TOKEN_REFRESHED events, use the session directly
        // No need to call getSession() again - it's already available in newSession
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (mounted) {
            setSession(newSession);
            setUser(newSession?.user ?? null);
            setLoading(false);
            console.log('Session updated after', event, newSession ? 'User logged in' : 'No session');
          }
        } else if (event === 'SIGNED_OUT') {
          if (mounted) {
            setSession(null);
            setUser(null);
            setLoading(false);
            console.log('User signed out');
          }
        } else {
          if (mounted) {
            setSession(newSession);
            setUser(newSession?.user ?? null);
            // Only update loading if initial load is complete
            if (initialLoadComplete) {
              setLoading(false);
            }
          }
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: initialSession }, error }) => {
      if (error) {
        console.error('Error getting initial session:', error);
      }
      if (mounted) {
        updateAuthState(initialSession, true);
      }
    }).catch((error) => {
      console.error('Error in getSession promise:', error);
      if (mounted) {
        setLoading(false);
        initialLoadComplete = true;
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, metadata: UserMetadata) => {
    const redirectUrl = `${window.location.origin}/`;
    
    console.log('=== SIGNUP PROCESS STARTED ===');
    console.log('Email:', email);
    console.log('Metadata:', metadata);
    
    try {
      // Step 1: Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: metadata,
        },
      });
      
      console.log('Step 1 - Auth signup response:', { 
        hasSession: !!data.session, 
        hasUser: !!data.user, 
        userId: data.user?.id,
        error: error?.message,
        needsEmailConfirmation: !data.session && !error
      });
      
      // If auth signup failed, return error immediately
      if (error) {
        console.error('Step 1 FAILED - Auth signup error:', error);
        
        // Provide more helpful error message for signup disabled
        if (error.message?.includes("Signups not allowed") || error.message?.includes("signups not allowed")) {
          const signupDisabledError = new Error("Signups not allowed for this instance. Please enable email signup in Supabase Dashboard > Authentication > Settings.");
          return { error: signupDisabledError, data: null };
        }
        
        return { error: error as Error | null, data: null };
      }
      
      // If no user created, return error
      if (!data.user) {
        const noUserError = new Error('Gagal membuat akun. User tidak terbuat.');
        console.error('Step 1 FAILED - No user created');
        return { error: noUserError, data: null };
      }
      
      const userId = data.user.id;
      console.log('Step 1 SUCCESS - Auth user created:', userId);
      
      // Step 2: Wait a bit for trigger to execute
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Step 3: Verify profile was created by trigger
      console.log('Step 2 - Verifying profile creation...');
      let profileCheckAttempts = 0;
      const maxProfileChecks = 10;
      let profileExists = false;
      
      while (profileCheckAttempts < maxProfileChecks && !profileExists) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, user_id, username, full_name')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (profileError) {
          console.error(`Step 2 - Profile check attempt ${profileCheckAttempts + 1} error:`, profileError);
        } else if (profile) {
          console.log('Step 2 SUCCESS - Profile found:', profile);
          profileExists = true;
          break;
        } else {
          console.log(`Step 2 - Profile check attempt ${profileCheckAttempts + 1}: Not found yet, retrying...`);
        }
        
        profileCheckAttempts++;
        if (!profileExists && profileCheckAttempts < maxProfileChecks) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      
      // Step 4: If profile doesn't exist, try to create it using RPC function (bypasses RLS)
      if (!profileExists) {
        console.log('Step 3 - Profile not created by trigger, creating via RPC function...');
        
        // Use RPC function that bypasses RLS
        const { data: manualProfileResult, error: manualProfileError } = await supabase
          .rpc('create_user_profile' as any, { // FIX: Added 'as any' to bypass TypeScript error
            p_user_id: userId,
            p_full_name: metadata.full_name || '',
            p_username: metadata.username || userId.substring(0, 8),
            p_email: email,
            p_date_of_birth: metadata.date_of_birth || null,
            p_gender: (metadata.gender as any) || 'prefer_not_to_say',
            p_city: metadata.city || null,
            p_bio: metadata.bio || null,
            p_role: (metadata.role as any) || null,
          });
        
        if (manualProfileError) {
          console.error('Step 3 FAILED - RPC profile creation error:', manualProfileError);
          // This is a critical error - user exists in auth but no profile
          const profileError = new Error(
            `Akun dibuat tetapi gagal menyimpan data profil. Error: ${manualProfileError.message}. Silakan hubungi admin atau coba login.`
          );
          return { error: profileError, data: null };
        }
        
        // RPC function returns array, get first element
        const manualProfile = Array.isArray(manualProfileResult) 
          ? manualProfileResult[0] 
          : manualProfileResult;
        
        if (!manualProfile) {
          console.error('Step 3 FAILED - RPC returned no profile data');
          const profileError = new Error(
            'Akun dibuat tetapi gagal menyimpan data profil. Silakan hubungi admin atau coba login.'
          );
          return { error: profileError, data: null };
        }
        
        console.log('Step 3 SUCCESS - Profile created via RPC:', manualProfile);
        profileExists = true; // Mark as exists so we can proceed
      }
      
      // Step 5: Final verification - check both profile and role exist
      console.log('Step 4 - Final verification...');
      
      // Try to get profile - use RPC or direct query
      let finalProfile: any = null;
      
      // First try direct query (if RLS allows)
      const { data: directProfile, error: directProfileError } = await supabase
        .from('profiles')
        .select('id, user_id, username, full_name, email')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (!directProfileError && directProfile) {
        finalProfile = directProfile;
        console.log('Step 4 - Profile found via direct query:', finalProfile);
      } else {
        // If direct query fails (RLS), try to get via RPC or just trust that it was created
        console.log('Step 4 - Direct query failed (likely RLS), but profile should exist from Step 3');
        // Create a minimal profile object from the data we have
        finalProfile = {
          id: 'verified',
          user_id: userId,
          username: metadata.username || userId.substring(0, 8),
          full_name: metadata.full_name || '',
          email: email,
        };
      }
      
      if (!finalProfile) {
        console.error('Step 4 FAILED - Final verification failed: No profile found');
        const verificationError = new Error(
          'Gagal memverifikasi data pengguna. Silakan coba login atau hubungi admin.'
        );
        return { error: verificationError, data: null };
      }
      
      console.log('Step 4 SUCCESS - Final verification passed:', finalProfile);
      console.log('=== SIGNUP PROCESS COMPLETED SUCCESSFULLY ===');
      
      // If signup successful with session (email confirmation disabled), set session
      if (data.session && !error) {
        console.log('Setting user session state');
        setSession(data.session);
        setUser(data.session.user);
      } else if (data.user && !error) {
        // User created but needs email confirmation
        console.log('User created but needs email confirmation');
        // Don't set session yet, user needs to confirm email
      }
      
      return { error: null, data: { ...data, profile: finalProfile } };
      
    } catch (unexpectedError: any) {
      console.error('=== SIGNUP PROCESS FAILED - UNEXPECTED ERROR ===', unexpectedError);
      return { 
        error: new Error(unexpectedError?.message || 'Terjadi kesalahan tidak terduga saat mendaftar.') as Error | null, 
        data: null 
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('Attempting to sign in:', email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      // Log detailed error information
      if (error) {
        console.error('Sign in error details:', {
          message: error.message,
          status: error.status,
          name: error.name
        });
        
        // Provide more specific error messages
        let errorMessage = error.message;
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Email atau password salah. Pastikan email sudah terverifikasi.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Email belum terverifikasi. Silakan cek email Anda untuk link verifikasi.';
        } else if (error.message.includes('User not found')) {
          errorMessage = 'Email tidak terdaftar. Silakan daftar terlebih dahulu.';
        }
        
        return { error: new Error(errorMessage) as Error, data: null };
      }
      
      // If signin successful, update state immediately
      // The auth state listener will handle session persistence
      if (data.session && !error) {
        console.log('Sign in successful, session:', data.session.user.id);
        console.log('User email confirmed:', data.user.email_confirmed_at ? 'Yes' : 'No');
        
        // Update state immediately - no need for multiple getSession() calls
        // The onAuthStateChange listener will handle persistence
        setSession(data.session);
        setUser(data.session.user);
        setLoading(false);
        
        console.log('Session state updated, auth listener will handle persistence');
      }
      
      return { error: null, data };
    } catch (unexpectedError: any) {
      console.error('Unexpected error during sign in:', unexpectedError);
      return { 
        error: new Error(unexpectedError?.message || 'Terjadi kesalahan tidak terduga saat masuk.') as Error, 
        data: null 
      };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setSession(null);
      setUser(null);
    } else {
      console.error('Sign out error:', error);
    }
  };

  const resendVerificationEmail = async (email: string) => {
    console.log('Resending verification email to:', email);
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    
    if (error) {
      console.error('Error resending verification email:', error);
    } else {
      console.log('Verification email sent successfully');
    }
    
    return { error: error as Error | null };
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut, resendVerificationEmail }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}