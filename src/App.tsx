import React, { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { BlurSkeleton } from "@/components/ui/blur-skeleton";
import { LazyPageWrapper } from "@/components/ui/page-transition";

// Lazy load pages with wrapper for blur transition
const Index = lazy(() => import("./pages/Index").then(module => ({ 
  default: () => <LazyPageWrapper><module.default /></LazyPageWrapper> 
})));
const Companions = lazy(() => import("./pages/Companions").then(module => ({ 
  default: () => <LazyPageWrapper><module.default /></LazyPageWrapper> 
})));
const CompanionProfile = lazy(() => import("./pages/CompanionProfile").then(module => ({ 
  default: () => <LazyPageWrapper><module.default /></LazyPageWrapper> 
})));
const CompanionChat = lazy(() => import("./pages/CompanionChat").then(module => ({ 
  default: () => <LazyPageWrapper><module.default /></LazyPageWrapper> 
})));
const Rules = lazy(() => import("./pages/Rules").then(module => ({ 
  default: () => <LazyPageWrapper><module.default /></LazyPageWrapper> 
})));
const Contact = lazy(() => import("./pages/Contact").then(module => ({ 
  default: () => <LazyPageWrapper><module.default /></LazyPageWrapper> 
})));
const Auth = lazy(() => import("./pages/Auth").then(module => ({ 
  default: () => <LazyPageWrapper><module.default /></LazyPageWrapper> 
})));
const Profile = lazy(() => import("./pages/Profile").then(module => ({ 
  default: () => <LazyPageWrapper><module.default /></LazyPageWrapper> 
})));
const FindFriends = lazy(() => import("./pages/FindFriends").then(module => ({ 
  default: () => <LazyPageWrapper><module.default /></LazyPageWrapper> 
})));
const Friends = lazy(() => import("./pages/Friends").then(module => ({ 
  default: () => <LazyPageWrapper><module.default /></LazyPageWrapper> 
})));
const Messages = lazy(() => import("./pages/Messages").then(module => ({ 
  default: () => <LazyPageWrapper><module.default /></LazyPageWrapper> 
})));
const Chat = lazy(() => import("./pages/Chat").then(module => ({ 
  default: () => <LazyPageWrapper><module.default /></LazyPageWrapper> 
})));
const Settings = lazy(() => import("./pages/Settings").then(module => ({ 
  default: () => <LazyPageWrapper><module.default /></LazyPageWrapper> 
})));
const NotFound = lazy(() => import("./pages/NotFound").then(module => ({ 
  default: () => <LazyPageWrapper><module.default /></LazyPageWrapper> 
})));

// Configure QueryClient with better defaults for error handling and caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        if (error instanceof Error && error.message.includes("4")) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Blur skeleton fallback for lazy loading
function LazyFallback() {
  return <BlurSkeleton variant="feed" className="min-h-screen" />;
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-center" richColors closeButton />
          <BrowserRouter>
            <Suspense fallback={<LazyFallback />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/companions" element={<Companions />} />
                <Route path="/companion/:id" element={<CompanionProfile />} />
                <Route path="/companion-chat/:companionId" element={<CompanionChat />} />
                <Route path="/rules" element={<Rules />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/find-friends" element={<FindFriends />} />
                <Route path="/friends" element={<Friends />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/chat/:partnerId" element={<Chat />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
