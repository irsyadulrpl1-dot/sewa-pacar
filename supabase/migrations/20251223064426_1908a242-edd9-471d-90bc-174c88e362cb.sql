-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('user', 'talent', 'admin');

-- Create enum for friend request status
CREATE TYPE public.friend_status AS ENUM ('pending', 'accepted', 'rejected');

-- Create enum for gender
CREATE TYPE public.gender_type AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  gender public.gender_type DEFAULT 'prefer_not_to_say',
  city TEXT,
  bio TEXT,
  avatar_url TEXT,
  date_of_birth DATE,
  interests TEXT[],
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

-- Create friend_requests table
CREATE TABLE public.friend_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  status public.friend_status DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (sender_id, receiver_id),
  CHECK (sender_id != receiver_id)
);

-- Create friends table (for accepted friendships)
CREATE TABLE public.friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  friend_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create blocked_users table
CREATE TABLE public.blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  blocked_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (blocker_id, blocked_id),
  CHECK (blocker_id != blocked_id)
);

-- Create reports table for admin moderation
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  reported_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Profile policies
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own role" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Friend requests policies
CREATE POLICY "Users can view own friend requests" ON public.friend_requests
  FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send friend requests" ON public.friend_requests
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update received friend requests" ON public.friend_requests
  FOR UPDATE TO authenticated
  USING (auth.uid() = receiver_id);

CREATE POLICY "Users can delete own sent requests" ON public.friend_requests
  FOR DELETE TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Friends policies
CREATE POLICY "Users can view own friends" ON public.friends
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can add friends" ON public.friends
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove friends" ON public.friends
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Messages policies
CREATE POLICY "Users can view own messages" ON public.messages
  FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update own received messages" ON public.messages
  FOR UPDATE TO authenticated
  USING (auth.uid() = receiver_id);

-- Blocked users policies
CREATE POLICY "Users can view own blocks" ON public.blocked_users
  FOR SELECT TO authenticated
  USING (auth.uid() = blocker_id);

CREATE POLICY "Users can block others" ON public.blocked_users
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can unblock others" ON public.blocked_users
  FOR DELETE TO authenticated
  USING (auth.uid() = blocker_id);

-- Reports policies
CREATE POLICY "Users can create reports" ON public.reports
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports" ON public.reports
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update reports" ON public.reports
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_friend_requests_updated_at
  BEFORE UPDATE ON public.friend_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, username, email, date_of_birth, gender, city, bio)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'username', NEW.id::text),
    NEW.email,
    (NEW.raw_user_meta_data ->> 'date_of_birth')::date,
    (NEW.raw_user_meta_data ->> 'gender')::public.gender_type,
    NEW.raw_user_meta_data ->> 'city',
    NEW.raw_user_meta_data ->> 'bio'
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.friend_requests;