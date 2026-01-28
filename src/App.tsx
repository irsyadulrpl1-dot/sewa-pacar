import React, { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { BlurSkeleton } from "@/components/ui/blur-skeleton";
import { LazyPageWrapper } from "@/components/ui/page-transition";
import InfoPage from "./pages/Info";
import { RequireRole } from "@/components/auth/RequireRole";

// Lazy load pages with wrapper for blur transition
const Index = lazy(() => import("./pages/Index").then(module => ({ 
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
const PaymentHistory = lazy(() => import("./pages/PaymentHistory").then(module => ({ 
  default: () => <LazyPageWrapper><module.default /></LazyPageWrapper> 
})));
const UserProfile = lazy(() => import("./pages/UserProfile").then(module => ({ 
  default: () => <LazyPageWrapper><module.default /></LazyPageWrapper> 
})));
const Notifications = lazy(() => import("./pages/Notifications").then(module => ({ 
  default: () => <LazyPageWrapper><module.default /></LazyPageWrapper> 
})));
const BookingsHistory = lazy(() => import("./pages/BookingsHistory").then(module => ({ 
  default: () => <LazyPageWrapper><module.default /></LazyPageWrapper> 
})));
const BookingDetail = lazy(() => import("./pages/BookingDetail").then(module => ({ 
  default: () => <LazyPageWrapper><module.default /></LazyPageWrapper> 
})));
const ChooseRole = lazy(() => import("./pages/ChooseRole").then(module => ({
  default: () => <LazyPageWrapper><module.default /></LazyPageWrapper>
})));
const Dashboard = lazy(() => import("./pages/Dashboard").then(module => ({
  default: () => <LazyPageWrapper><module.default /></LazyPageWrapper>
})));
const DashboardRenter = lazy(() => import("./pages/DashboardRenter").then(module => ({
  default: () => <LazyPageWrapper><module.default /></LazyPageWrapper>
})));
const DashboardCompanion = lazy(() => import("./pages/DashboardCompanion").then(module => ({
  default: () => <LazyPageWrapper><module.default /></LazyPageWrapper>
})));
const CompanionBookings = lazy(() => import("./pages/CompanionBookings").then(module => ({
  default: () => <LazyPageWrapper><module.default /></LazyPageWrapper>
})));
const IncomingBookings = lazy(() => import("./pages/IncomingBookings").then(module => ({
  default: () => <LazyPageWrapper><module.default /></LazyPageWrapper>
})));
const CompanionMyBookings = lazy(() => import("./pages/CompanionMyBookings").then(module => ({
  default: () => <LazyPageWrapper><module.default /></LazyPageWrapper>
})));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard").then(module => ({
  default: () => <LazyPageWrapper><module.default /></LazyPageWrapper>
})));
const AdminUsers = lazy(() => import("./pages/admin/Users").then(module => ({
  default: () => <LazyPageWrapper><module.default /></LazyPageWrapper>
})));
const AdminBookings = lazy(() => import("./pages/admin/Bookings").then(module => ({
  default: () => <LazyPageWrapper><module.default /></LazyPageWrapper>
})));
const AdminBookingDetail = lazy(() => import("./pages/admin/BookingDetail").then(module => ({
  default: () => <LazyPageWrapper><module.default /></LazyPageWrapper>
})));
const AdminPayments = lazy(() => import("./pages/admin/Payments").then(module => ({
  default: () => <LazyPageWrapper><module.default /></LazyPageWrapper>
})));
// Use static import for Info to avoid dev dynamic import fetch issues

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
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <Suspense fallback={<LazyFallback />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/info" element={<LazyPageWrapper><InfoPage /></LazyPageWrapper>} />
                <Route 
                  path="/companion/:id" 
                  element={
                    <RequireRole>
                      <CompanionProfile />
                    </RequireRole>
                  } 
                />
                <Route
                  path="/companion-chat/:companionId"
                  element={
                    <RequireRole allowedRoles={["renter"]}>
                      <CompanionChat />
                    </RequireRole>
                  }
                />
                <Route path="/rules" element={<Rules />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/auth" element={<Auth />} />
                <Route
                  path="/choose-role"
                  element={
                    <RequireRole requireRoleSelected={false}>
                      <ChooseRole />
                    </RequireRole>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <RequireRole>
                      <Dashboard />
                    </RequireRole>
                  }
                />
                <Route
                  path="/dashboard/renter"
                  element={
                    <RequireRole allowedRoles={["renter"]}>
                      <DashboardRenter />
                    </RequireRole>
                  }
                />
                <Route
                  path="/dashboard/companion"
                  element={
                    <RequireRole allowedRoles={["companion"]}>
                      <DashboardCompanion />
                    </RequireRole>
                  }
                />
                <Route
                  path="/companion/bookings"
                  element={
                    <RequireRole allowedRoles={["companion"]}>
                      <CompanionBookings />
                    </RequireRole>
                  }
                />
                <Route
                  path="/companion/booking"
                  element={
                    <RequireRole allowedRoles={["companion"]}>
                      <CompanionMyBookings />
                    </RequireRole>
                  }
                />
                <Route
                  path="/incoming-bookings"
                  element={
                    <RequireRole allowedRoles={["companion"]}>
                      <IncomingBookings />
                    </RequireRole>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <RequireRole>
                      <Profile />
                    </RequireRole>
                  }
                />
                <Route
                  path="/find-friends"
                  element={
                    <RequireRole allowedRoles={["renter", "companion"]}>
                      <FindFriends />
                    </RequireRole>
                  }
                />
                <Route
                  path="/friends"
                  element={
                    <RequireRole>
                      <Friends />
                    </RequireRole>
                  }
                />
                <Route
                  path="/messages"
                  element={
                    <RequireRole>
                      <Messages />
                    </RequireRole>
                  }
                />
                <Route
                  path="/chat/:partnerId"
                  element={
                    <RequireRole>
                      <Chat />
                    </RequireRole>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <RequireRole>
                      <Settings />
                    </RequireRole>
                  }
                />
                <Route
                  path="/payment-history"
                  element={
                    <RequireRole allowedRoles={["renter"]}>
                      <PaymentHistory />
                    </RequireRole>
                  }
                />
                <Route
                  path="/bookings"
                  element={
                    <RequireRole allowedRoles={["renter"]}>
                      <BookingsHistory />
                    </RequireRole>
                  }
                />
                <Route
                  path="/bookings/:id"
                  element={
                    <RequireRole allowedRoles={["renter"]}>
                      <BookingDetail />
                    </RequireRole>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <RequireRole>
                      <Notifications />
                    </RequireRole>
                  }
                />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/bookings" element={<AdminBookings />} />
                <Route path="/admin/bookings/:id" element={<AdminBookingDetail />} />
                <Route path="/admin/payments" element={<AdminPayments />} />
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/user/:userId" element={<UserProfile />} />
                <Route
                  path="/companions"
                  element={
                    <RequireRole allowedRoles={["renter", "companion"]}>
                      <FindFriends />
                    </RequireRole>
                  }
                />
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
